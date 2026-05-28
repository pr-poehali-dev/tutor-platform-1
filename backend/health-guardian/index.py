"""
Health-Guardian: автономный мониторинг всех бэкенд-функций проекта.

Раз в 5 минут (по cron) пингует все функции через лёгкие read-only вызовы.
- Считает latency + http-код + ошибки
- Подсчитывает consecutive_failures
- При >= 3 ошибок подряд — создаёт алерт в system_alerts
- При восстановлении (был fail → стал ok) — закрывает алерт + создаёт notification «recovered»
- Возвращает агрегированный health-статус для UI

GET /?action=ping_all       — запустить полный обход (для cron, без auth)
GET /?action=status         — последний снимок здоровья (для UI)
GET /?action=alerts         — нерешённые алерты системы
"""
import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
import psycopg2

# Лёгкие GET-эндпоинты, которые НЕ требуют auth и НЕ дороги в выполнении.
# Если функция не имеет такого — пингуем CORS preflight (OPTIONS) на /.
HEALTH_CHECKS = [
    {'name': 'search',         'path': '?action=suggest&q=test'},
    {'name': 'feed',           'path': '?action=list&limit=1'},
    {'name': 'feed-curator',   'path': '?action=health'},
    {'name': 'notifications',  'path': '?action=unread_count'},
    {'name': 'contact',        'path': '?action=reviews_list'},
    {'name': 'kids',           'path': ''},
    {'name': 'know-yourself',  'path': ''},
    {'name': 'mgu-track',      'path': ''},
    {'name': 'exam-checklist', 'path': ''},
    {'name': 'course-builder', 'path': ''},
    {'name': 'auth',           'path': ''},
    {'name': 'user-data',      'path': ''},
    {'name': 'progress',       'path': ''},
    {'name': 'learning-path',  'path': ''},
    {'name': 'ai-chat',        'path': ''},
    {'name': 'tts',            'path': ''},
    {'name': 'stt',            'path': ''},
    {'name': 'module-video',   'path': ''},
    {'name': 'access',         'path': ''},
    {'name': 'referrals',      'path': ''},
]

FAIL_THRESHOLD = 3            # после 3 ошибок подряд — алерт
TIMEOUT_SEC = 8
# Локальный реестр URL'ов — обычно подгружается из func2url.json при деплое,
# но в облаке func2url.json не доступен. Поэтому передаём через переменные окружения
# или используем хардкод — здесь хардкод, обновляется вручную раз в месяц.
URL_REGISTRY: dict = {
    'search':         'https://functions.poehali.dev/a5071bb6-69dc-4d3a-88bc-c9aa9b35fa0c',
    'feed':           'https://functions.poehali.dev/b9f58dbe-702c-46d3-a9b1-02d5076735ef',
    'feed-curator':   'https://functions.poehali.dev/b4aed0e9-e169-4add-b041-36eaab3d44a5',
    'notifications':  'https://functions.poehali.dev/7d5c45d4-dbd2-44ae-b907-4bda81b1a574',
    'contact':        'https://functions.poehali.dev/93207a45-d0b6-4f3b-a734-43503bdc3943',
    'kids':           'https://functions.poehali.dev/ea709a00-437f-4596-a5ed-4c35ca44439a',
    'know-yourself':  'https://functions.poehali.dev/ac2b2b3b-0ead-46e0-8d94-d7ecf3b04778',
    'mgu-track':      'https://functions.poehali.dev/2eb97876-36a6-4a91-a5fe-e23d9a6141c1',
    'exam-checklist': 'https://functions.poehali.dev/3a4ceabb-0b21-40d0-a437-c7b4d6043cfa',
    'course-builder': 'https://functions.poehali.dev/7f9f5403-f2b5-4888-95b2-31e965fb84c7',
    'auth':           'https://functions.poehali.dev/3ba73d75-0fd1-4499-b6c5-f538c5b42a06',
    'user-data':      'https://functions.poehali.dev/fdcd883a-900e-4cff-b647-569675544e74',
    'progress':       'https://functions.poehali.dev/4e7b32c4-e089-43b4-8fb5-6cf240f7915e',
    'learning-path':  'https://functions.poehali.dev/86110786-84ba-446a-acd9-eddaa31821b2',
    'ai-chat':        'https://functions.poehali.dev/d2f39a05-0f9a-44a1-a65e-cace2e81c84b',
    'tts':            'https://functions.poehali.dev/fa3b03da-815c-4f28-baf2-1a88e36fca8d',
    'stt':            'https://functions.poehali.dev/7dea9f0a-6f61-4a4b-a1f8-1b462199f8c2',
    'module-video':   'https://functions.poehali.dev/4b28b260-164b-4d91-8931-f67671840d5f',
    'access':         'https://functions.poehali.dev/213e0c5d-5d5b-4b9e-83df-83a12e533e2a',
    'referrals':      'https://functions.poehali.dev/6e1d5e8e-673c-4e52-836d-c24126a54a62',
}


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(d: dict, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(),
            'body': json.dumps(d, ensure_ascii=False, default=str)}


def err(m: str, s: int = 400) -> dict:
    return ok({'error': m}, s)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ping_function(name: str, path: str) -> dict:
    """Пингует функцию через GET или OPTIONS preflight."""
    base_url = URL_REGISTRY.get(name)
    if not base_url:
        return {'name': name, 'status': 'unknown', 'http_code': None,
                'latency_ms': None, 'error': 'no URL in registry'}

    full_url = base_url + (path or '')
    method = 'GET' if path else 'OPTIONS'
    start = time.time()
    try:
        req = urllib.request.Request(full_url, method=method)
        req.add_header('User-Agent', 'UCHISPRO-HealthGuardian/1.0')
        with urllib.request.urlopen(req, timeout=TIMEOUT_SEC) as resp:
            http_code = resp.getcode()
            # Читаем максимум 4 КБ — чтобы не качать тяжёлые ответы
            resp.read(4096)
    except urllib.error.HTTPError as e:
        # HTTP-код != 2xx, но соединение прошло — это всё равно «alive»
        latency = int((time.time() - start) * 1000)
        # 4xx/5xx считаем degraded, но не fail (некоторые методы требуют auth)
        if e.code in (401, 403, 404):
            return {'name': name, 'status': 'ok', 'http_code': e.code,
                    'latency_ms': latency, 'error': None}
        return {'name': name, 'status': 'degraded', 'http_code': e.code,
                'latency_ms': latency, 'error': f'HTTP {e.code}'}
    except (urllib.error.URLError, OSError, TimeoutError) as e:
        latency = int((time.time() - start) * 1000)
        return {'name': name, 'status': 'fail', 'http_code': None,
                'latency_ms': latency, 'error': str(e)[:300]}
    except Exception as e:  # pylint: disable=broad-except
        latency = int((time.time() - start) * 1000)
        return {'name': name, 'status': 'fail', 'http_code': None,
                'latency_ms': latency, 'error': f'unexpected: {e}'[:300]}

    latency = int((time.time() - start) * 1000)
    return {'name': name, 'status': 'ok', 'http_code': http_code,
            'latency_ms': latency, 'error': None}


def upsert_status(cur, ping: dict) -> dict:
    """Обновляет статус функции; возвращает diff (recovered / now_failing)."""
    name = ping['name']
    new_status = ping['status']
    latency = ping['latency_ms']
    error = ping['error']

    cur.execute(
        "SELECT status, consecutive_failures FROM backend_health_status "
        "WHERE function_name=%s LIMIT 1",
        (name,)
    )
    row = cur.fetchone()
    prev_status = row[0] if row else None
    prev_fails = row[1] if row else 0

    if new_status == 'ok':
        new_fails = 0
    else:
        new_fails = prev_fails + 1

    if row:
        cur.execute(
            "UPDATE backend_health_status SET status=%s, consecutive_failures=%s, "
            "last_ok_at = CASE WHEN %s = 'ok' THEN NOW() ELSE last_ok_at END, "
            "last_fail_at = CASE WHEN %s <> 'ok' THEN NOW() ELSE last_fail_at END, "
            "last_error = %s, last_latency_ms = %s, updated_at = NOW() "
            "WHERE function_name = %s",
            (new_status, new_fails, new_status, new_status,
             error, latency, name)
        )
    else:
        cur.execute(
            "INSERT INTO backend_health_status "
            "(function_name, status, consecutive_failures, last_ok_at, "
            "last_fail_at, last_error, last_latency_ms) "
            "VALUES (%s, %s, %s, "
            "CASE WHEN %s='ok' THEN NOW() ELSE NULL END, "
            "CASE WHEN %s<>'ok' THEN NOW() ELSE NULL END, %s, %s)",
            (name, new_status, new_fails, new_status, new_status, error, latency)
        )

    # Логируем
    cur.execute(
        "INSERT INTO backend_health_log "
        "(function_name, status, http_code, latency_ms, error_message) "
        "VALUES (%s, %s, %s, %s, %s)",
        (name, new_status, ping['http_code'], latency, error)
    )

    # Алерт при достижении порога
    transition = None
    if new_fails == FAIL_THRESHOLD and prev_status != 'fail':
        cur.execute(
            "INSERT INTO system_alerts "
            "(source, severity, event_type, title, body, metadata) "
            "VALUES ('health-guardian', 'critical', 'backend_down', %s, %s, %s)",
            (f'Функция {name} не отвечает',
             f'{FAIL_THRESHOLD} проверок подряд завершились ошибкой. '
             f'Последняя: {error or "timeout"}.',
             json.dumps({'function': name, 'consecutive_failures': new_fails,
                         'last_error': error}, ensure_ascii=False))
        )
        transition = 'now_failing'

    # Восстановление: было fail → стало ok → закрываем алерт
    if prev_status == 'fail' and new_status == 'ok':
        cur.execute(
            "UPDATE system_alerts SET resolved_at = NOW() "
            "WHERE source='health-guardian' AND event_type='backend_down' "
            "AND resolved_at IS NULL "
            "AND metadata->>'function' = %s",
            (name,)
        )
        cur.execute(
            "INSERT INTO system_alerts "
            "(source, severity, event_type, title, body, metadata, resolved_at) "
            "VALUES ('health-guardian', 'info', 'backend_recovered', %s, %s, %s, NOW())",
            (f'Функция {name} восстановлена',
             f'Latency {latency} мс. Всё работает.',
             json.dumps({'function': name}, ensure_ascii=False))
        )
        transition = 'recovered'

    return {'name': name, 'transition': transition, 'consecutive_failures': new_fails}


def handle_ping_all() -> dict:
    """Запускает обход всех функций (для cron). Защита от спама: не чаще раза в 2 минуты."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Rate-limit
            cur.execute(
                "SELECT MAX(checked_at) FROM backend_health_log "
                "WHERE checked_at > NOW() - INTERVAL '2 minutes'"
            )
            recent = cur.fetchone()[0]
            if recent:
                return ok({'ok': True, 'skipped': True, 'reason': 'rate-limited',
                           'last_check_at': recent.isoformat()})

            results = []
            transitions = []
            for hc in HEALTH_CHECKS:
                ping = ping_function(hc['name'], hc['path'])
                diff = upsert_status(cur, ping)
                if diff.get('transition'):
                    transitions.append(diff)
                results.append({**ping, **diff})
                conn.commit()

            ok_count = sum(1 for r in results if r['status'] == 'ok')
            fail_count = sum(1 for r in results if r['status'] == 'fail')

            return ok({
                'ok': True,
                'checked': len(results),
                'ok_count': ok_count,
                'fail_count': fail_count,
                'transitions': transitions,
                'results': results,
            })
    finally:
        conn.close()


def handle_status() -> dict:
    """Последний снимок здоровья — для UI."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT function_name, status, consecutive_failures, "
                "last_ok_at, last_fail_at, last_error, last_latency_ms, updated_at "
                "FROM backend_health_status ORDER BY function_name"
            )
            items = [
                {
                    'name': r[0], 'status': r[1], 'consecutive_failures': r[2],
                    'last_ok_at': r[3].isoformat() if r[3] else None,
                    'last_fail_at': r[4].isoformat() if r[4] else None,
                    'last_error': r[5], 'last_latency_ms': r[6],
                    'updated_at': r[7].isoformat() if r[7] else None,
                }
                for r in cur.fetchall()
            ]

            ok_c = sum(1 for i in items if i['status'] == 'ok')
            fail_c = sum(1 for i in items if i['status'] == 'fail')
            degraded_c = sum(1 for i in items if i['status'] == 'degraded')

            overall = 'ok'
            if fail_c > 0:
                overall = 'critical' if fail_c >= 3 else 'warning'
            elif degraded_c > 2:
                overall = 'warning'

            return ok({
                'overall_status': overall,
                'total': len(items),
                'ok': ok_c,
                'fail': fail_c,
                'degraded': degraded_c,
                'items': items,
            })
    finally:
        conn.close()


def handle_alerts() -> dict:
    """Все нерешённые алерты системы."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, source, severity, event_type, title, body, "
                "metadata, created_at FROM system_alerts "
                "WHERE resolved_at IS NULL ORDER BY created_at DESC LIMIT 30"
            )
            items = [
                {
                    'id': r[0], 'source': r[1], 'severity': r[2],
                    'event_type': r[3], 'title': r[4], 'body': r[5] or '',
                    'metadata': r[6] or {},
                    'created_at': r[7].isoformat() if r[7] else None,
                }
                for r in cur.fetchall()
            ]
            return ok({'items': items, 'count': len(items)})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Автономный health-monitor проекта."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'status').strip()

    if action == 'ping_all':
        return handle_ping_all()
    if action == 'status':
        return handle_status()
    if action == 'alerts':
        return handle_alerts()
    return err('Неизвестное действие', 404)
