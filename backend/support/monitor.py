"""Мониторинг сайта: главная страница + все функции. Запускается с сайта при посещениях
не чаще раза в 5 минут. О сбое (3 проверки подряд) и восстановлении сообщает в MAX и на почту."""
import time
import urllib.error
import urllib.request

import os
import re

import notify
from monitor_targets import SITE_URL, TARGETS

S = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1') + '.'
INTERVAL_MIN = 5
FAIL_THRESHOLD = 3
TIMEOUT_SEC = 1.5
BUDGET_SEC = 3.2
ROTATE_BATCH = 12
CRITICAL = ['auth', 'yookassa-yookassa', 'yookassa-yookassa-webhook', 'ai-chat', 'support', 'feed',
            'access', 'user-data', 'homework', 'kids', 'school-cabinet', 'ai-helper']
SLOW_MS = 2500


def _ping(name: str, url: str, method: str = 'OPTIONS') -> dict:
    start = time.time()
    code, error = None, None
    try:
        req = urllib.request.Request(url, method=method, headers={'User-Agent': 'UCHISPRO-Monitor/2.0'})
        with urllib.request.urlopen(req, timeout=TIMEOUT_SEC) as r:
            code = r.getcode()
            body = r.read(20000) if name == 'site' else b''
            if name == 'site' and b'id="root"' not in body:
                error = 'главная страница отдаётся без приложения'
    except urllib.error.HTTPError as e:
        code = e.code
        if e.code >= 500:
            error = f'ошибка сервера {e.code}'
    except Exception as e:
        error = 'не отвечает дольше 1,5 секунды' if 'timed out' in str(e).lower() else f'нет ответа: {type(e).__name__}'
    ms = int((time.time() - start) * 1000)
    return {'name': name, 'ok': error is None, 'code': code, 'ms': ms, 'error': error}


def _lit(v) -> str:
    if v is None:
        return 'NULL'
    return "'" + str(v).replace("\x00", "").replace("'", "''")[:300] + "'"


def _in(names) -> str:
    """Список имён для IN (...): только буквы, цифры и дефис — экранирование не требуется."""
    safe = [n for n in names if re.fullmatch(r'[a-z0-9-]+', n)]
    return ', '.join(f"'{n}'" for n in safe) or "''"


def _try_lock(cur, conn) -> bool:
    cur.execute(f"UPDATE {S}monitor_state SET locked_until = now() + interval '1 minute', last_run_at = now() "
                "WHERE id=1 AND (locked_until IS NULL OR locked_until < now()) "
                f"AND (last_run_at IS NULL OR last_run_at < now() - interval '{INTERVAL_MIN} minutes') RETURNING id")
    got = cur.fetchone() is not None
    conn.commit()
    return got


def run(cur, conn, force: bool = False) -> dict:
    """Один обход. Укладывается в ~4,5 с — лимит облачной функции 5 с."""
    if not force and not _try_lock(cur, conn):
        return {'skipped': True}
    t0 = time.time()
    cur.execute(f"SELECT rotate_pos FROM {S}monitor_state WHERE id=1")
    pos = (cur.fetchone() or [0])[0] or 0
    rest = [n for n in TARGETS if n not in CRITICAL]
    batch = [rest[(pos + i) % len(rest)] for i in range(min(ROTATE_BATCH, len(rest)))]
    jobs = [('site', SITE_URL, 'GET')] + [(n, TARGETS[n], 'OPTIONS') for n in CRITICAL + batch if n in TARGETS]
    results = []
    for j in jobs:
        if time.time() - t0 > BUDGET_SEC:
            break
        r = _ping(*j)
        if not r['ok'] and time.time() - t0 < BUDGET_SEC:
            r = _ping(*j)
        results.append(r)
    cur.execute(f"UPDATE {S}monitor_state SET rotate_pos=%s WHERE id=1", ((pos + ROTATE_BATCH) % max(1, len(rest)),))
    print(f"[monitor] checked {len(results)}/{len(jobs)} in {time.time() - t0:.2f}s")
    went_down, recovered = [], []
    if not results:
        cur.execute(f"UPDATE {S}monitor_state SET locked_until=NULL WHERE id=1")
        conn.commit()
        return {'checked': 0, 'ok': 0, 'failed': [], 'slow': [], 'alerts': [], 'recovered': []}
    cur.execute(f"SELECT function_name, status, consecutive_failures FROM {S}backend_health_status "
                f"WHERE function_name IN ({_in(r['name'] for r in results)})")
    prev_all = {n: (st, f) for n, st, f in cur.fetchall()}
    rows = []
    for r in results:
        prev_status, prev_fails = prev_all.get(r['name'], ('ok', 0))
        fails = 0 if r['ok'] else prev_fails + 1
        status = 'ok' if r['ok'] else ('fail' if fails >= FAIL_THRESHOLD else 'degraded')
        rows.append(f"({_lit(r['name'])}, {_lit(status)}, {int(fails)}, "
                    f"{'now()' if r['ok'] else 'NULL::timestamptz'}, {'NULL::timestamptz' if r['ok'] else 'now()'}, "
                    f"{_lit(r['error'])}, {int(r['ms'])}, now())")
        if status == 'fail' and prev_status != 'fail':
            went_down.append(r)
        if r['ok'] and prev_status == 'fail':
            recovered.append(r)
    cur.execute(
        f"INSERT INTO {S}backend_health_status (function_name, status, consecutive_failures, last_ok_at, last_fail_at, "
        f"last_error, last_latency_ms, updated_at) SELECT v.n, v.s, v.f, v.ok, v.fl, v.e, v.ms, v.u "
        f"FROM (VALUES {','.join(rows)}) AS v(n, s, f, ok, fl, e, ms, u) "
        f"ON CONFLICT (function_name) DO UPDATE SET status=EXCLUDED.status, consecutive_failures=EXCLUDED.consecutive_failures, "
        f"last_ok_at=COALESCE(EXCLUDED.last_ok_at, {S}backend_health_status.last_ok_at), "
        f"last_fail_at=COALESCE(EXCLUDED.last_fail_at, {S}backend_health_status.last_fail_at), "
        f"last_error=EXCLUDED.last_error, last_latency_ms=EXCLUDED.last_latency_ms, updated_at=now()")
    conn.commit()

    msgs = []
    if went_down:
        msgs.append(('Сбой на сайте УЧИСЬПРО', 'Не отвечает 3 проверки подряд:\n' +
                     '\n'.join(f"— {_label(r['name'])}: {r['error']}" for r in went_down) +
                     '\n\nПодробности: https://учисьпро.рф/admin/support'))
    if recovered:
        msgs.append(('Сайт УЧИСЬПРО: работа восстановлена',
                     'Снова работают:\n' + '\n'.join(f"— {_label(r['name'])}" for r in recovered)))
    for sub, txt in msgs:
        notify.to_max(f'{sub}\n\n{txt}')
        if time.time() - t0 < 4.0:
            notify.to_email(sub, txt)

    bad = [r for r in results if not r['ok']]
    slow = [r for r in results if r['ok'] and r['ms'] > SLOW_MS]
    summary = f"ok {len(results) - len(bad)}/{len(results)}"
    cur.execute(f"UPDATE {S}monitor_state SET last_summary=%s, locked_until=NULL WHERE id=1", (summary,))
    conn.commit()
    return {'checked': len(results), 'ok': len(results) - len(bad), 'failed': [r['name'] for r in bad],
            'slow': [r['name'] for r in slow], 'alerts': [r['name'] for r in went_down],
            'recovered': [r['name'] for r in recovered]}


LABELS = {
    'site': 'Главная страница сайта', 'auth': 'Вход и регистрация', 'yookassa-yookassa': 'Создание платежей',
    'yookassa-yookassa-webhook': 'Подтверждение оплат', 'ai-chat': 'ИИ-репетитор', 'feed': 'Лента',
    'support': 'Поддержка', 'contact': 'Отзывы и заявки', 'ai-helper': 'Свой ИИ-помощник', 'kids': 'Малыш',
    'school-cabinet': 'Кабинет онлайн-школы', 'edu-institutions': 'Рассылка школам', 'access': 'Доступы и промокоды',
    'homework': 'Проверка домашки', 'search': 'Поиск', 'user-data': 'Данные учеников', 'progress': 'Прогресс учёбы',
    'notifications': 'Уведомления и письма', 'tts': 'Озвучка', 'stt': 'Распознавание речи', 'sitemap': 'Карта сайта',
}


def _label(name: str) -> str:
    return LABELS.get(name, f'Функция {name}')


def status(cur) -> dict:
    cur.execute(f"SELECT last_run_at, last_summary FROM {S}monitor_state WHERE id=1")
    run_at, summary = cur.fetchone() or (None, None)
    names = ['site'] + list(TARGETS)
    cur.execute("SELECT function_name, status, consecutive_failures, last_error, last_latency_ms, updated_at, last_ok_at "
                f"FROM {S}backend_health_status WHERE function_name IN ({_in(names)})")
    rows = {r[0]: r for r in cur.fetchall()}
    items = []
    for n in names:
        r = rows.get(n)
        items.append({'name': n, 'label': _label(n), 'status': r[1] if r else 'unknown', 'fails': r[2] if r else 0,
                      'error': r[3] if r else None, 'ms': r[4] if r else None, 'checked_at': r[5] if r else None,
                      'last_ok_at': r[6] if r else None})
    order = {'fail': 0, 'degraded': 1, 'unknown': 2, 'ok': 3}
    items.sort(key=lambda x: (order.get(x['status'], 2), -(x['ms'] or 0)))
    return {'last_run_at': run_at, 'summary': summary, 'items': items, 'interval_min': INTERVAL_MIN}
