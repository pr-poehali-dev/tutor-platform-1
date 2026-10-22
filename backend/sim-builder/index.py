"""
Конструктор 3D/VR-тренажёров: ИИ-генерация сценария, сохранение, прохождения и аналитика.

POST ?action=generate {prompt, audience}        -> ИИ собирает тренажёр из библиотеки объектов
POST ?action=save     {trainer, slug?, edit_key?} -> сохранить (новый или правка по ключу)
GET  ?action=get      &slug=                    -> тренажёр для прохождения
POST ?action=run      {slug, student_name, group_code, score, passed, duration_sec, mistakes, hints, step_times}
GET  ?action=stats    &slug=&key=               -> аналитика для автора (по ключу правки)
"""
import json
import os
import re
import secrets
import urllib.request

import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'openai/gpt-4o-mini'

CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}

# Должно совпадать с библиотекой на сайте (src/components/simulators/library.tsx)
KINDS = {
    'battery': 'батарейка', 'switch': 'ключ/выключатель (состояние on)', 'bulb': 'лампочка (on — горит)',
    'resistor': 'резистор', 'ammeter': 'амперметр (on)', 'wire': 'провод (color)', 'breadboard': 'монтажная панель',
    'extinguisher': 'огнетушитель (pinned — чека снята)', 'fire': 'очаг огня (out — потушен)',
    'alarm': 'пожарный извещатель (on)', 'door': 'дверь/выход (open)', 'phone': 'телефон (on — звонок)',
    'victim': 'пострадавший лежит (bandaged)', 'firstaid': 'аптечка', 'gloves': 'перчатки (worn — надеты; color)',
    'welder': 'сварочный аппарат (on)', 'mask': 'сварочная маска (worn)', 'metal': 'металлические пластины (welded)',
    'panel': 'электрощит (off — отключён)', 'tester': 'указатель напряжения (on)', 'lock': 'замок и плакат (placed)',
    'console': 'пульт оператора (on)', 'machine': 'станок (on/stopped)', 'helmet': 'каска (worn)',
    'microscope': 'микроскоп (on)', 'slide': 'предметное стекло (placed)', 'knob': 'винт фокусировки (turned)',
    'cell': 'клетка крупно (visible — появляется)', 'heart': 'модель сердца', 'lungs': 'модель лёгких',
    'brain': 'модель мозга', 'table': 'стол (высота столешницы 0.78)', 'sign': 'табличка (color)',
}
LOCATIONS = {'lab', 'classroom', 'workshop', 'office', 'outdoor'}
CATEGORIES = {'physics', 'safety', 'profession', 'biology', 'chemistry', 'other'}

GEN_SYSTEM = """Ты методист и разработчик учебных тренажёров. По описанию учителя или инструктора собери
практический 3D-тренажёр: ученик выполняет действия по шагам, нажимая на объекты сцены.

Используй ТОЛЬКО эти типы объектов (kind): {kinds}
Локации (location): lab, classroom, workshop, office, outdoor.
Категории (category): physics, safety, profession, biology, chemistry, other.

Правила сцены: координаты pos [x, y, z] в метрах; x от -1.8 до 1.8, z от -1.6 до 1.4; y=0 — пол.
Если предмет лежит на столе (kind table в pos [0,0,0]), ставь y=0.78 и x в пределах -1.0..1.0, z -0.5..0.5.
Объекты не должны стоять в одной точке — минимум 0.35 м между ними. 4–9 объектов, id латиницей.
Добавь 1–2 лишних объекта-отвлекателя, которые используются как ловушки.

Правила сценария: 4–7 шагов в правильной профессиональной/учебной последовательности.
У шага: id (s1, s2…), title (2–4 слова), instruction (что сделать, 1–2 предложения),
target (id объекта), hint (как найти объект), explain (почему так, 1 предложение, факт из методики),
traps (0–2: object — id неверного объекта, feedback — объяснение типичной ошибки, critical: true только если это опасно для жизни),
effect (необязательно: {{object, state}} — как изменится объект, состояния указаны в скобках у kind).
Не выдумывай нормативы, которых не знаешь. Пиши по-русски.

Ответ — ТОЛЬКО JSON без пояснений:
{{"title","description","category","audience":["school"|"college"|"company"],"grade","location","passScore":70,
"objects":[{{"id","kind","label","pos":[x,y,z],"rot":0,"color":null}}],"steps":[...]}}"""


def resp(data, code=200):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def t(n):
    return f'{SCHEMA}.{n}'


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def clamp(v, lo, hi):
    try:
        return max(lo, min(hi, float(v)))
    except (TypeError, ValueError):
        return 0.0


def sanitize(tr: dict) -> dict:
    """Приводит тренажёр к безопасному виду: только известные объекты, корректные ссылки шагов."""
    objs, ids = [], set()
    for o in (tr.get('objects') or [])[:20]:
        kind = str(o.get('kind') or '')
        oid = re.sub(r'[^a-zA-Z0-9_]', '', str(o.get('id') or ''))[:30]
        if kind not in KINDS or not oid or oid in ids:
            continue
        pos = (o.get('pos') or [0, 0, 0]) + [0, 0, 0]
        ids.add(oid)
        objs.append({'id': oid, 'kind': kind, 'label': str(o.get('label') or KINDS[kind])[:60],
                     'pos': [clamp(pos[0], -3, 3), clamp(pos[1], 0, 2.5), clamp(pos[2], -3, 3)],
                     'rot': clamp(o.get('rot') or 0, -6.3, 6.3), 'scale': clamp(o.get('scale') or 1, 0.3, 2) or 1,
                     **({'color': str(o['color'])[:20]} if o.get('color') else {})})
    steps = []
    for i, s in enumerate((tr.get('steps') or [])[:15]):
        if s.get('target') not in ids:
            continue
        traps = [{'object': x['object'], 'feedback': str(x.get('feedback') or '')[:300], 'critical': bool(x.get('critical'))}
                 for x in (s.get('traps') or [])[:3] if isinstance(x, dict) and x.get('object') in ids and x['object'] != s['target']]
        eff = s.get('effect') if isinstance(s.get('effect'), dict) and s['effect'].get('object') in ids else None
        steps.append({'id': f's{i + 1}', 'title': str(s.get('title') or f'Шаг {i + 1}')[:80],
                      'instruction': str(s.get('instruction') or '')[:400], 'target': s['target'],
                      'hint': str(s.get('hint') or '')[:200], 'explain': str(s.get('explain') or '')[:400],
                      'traps': traps, **({'effect': {'object': eff['object'], 'state': str(eff.get('state') or '')[:20]}} if eff else {}),
                      **({'timeLimit': int(clamp(s['timeLimit'], 5, 600))} if s.get('timeLimit') else {})})
    aud = [a for a in (tr.get('audience') or []) if a in ('school', 'college', 'company')] or ['school']
    return {'title': str(tr.get('title') or 'Новый тренажёр')[:200], 'description': str(tr.get('description') or '')[:600],
            'category': tr.get('category') if tr.get('category') in CATEGORIES else 'other',
            'audience': aud, 'grade': str(tr.get('grade') or '')[:100],
            'location': tr.get('location') if tr.get('location') in LOCATIONS else 'lab',
            'passScore': int(clamp(tr.get('passScore') or 70, 30, 100)), 'objects': objs, 'steps': steps}


def ai_generate(prompt: str, audience: str) -> dict:
    key = os.environ.get('POLZA_API_KEY', '')
    if not key:
        raise ValueError('ИИ не подключён')
    kinds = '; '.join(f'{k} — {v}' for k, v in KINDS.items())
    user = f'Аудитория: {audience or "школа"}.\nЗадача тренажёра: {prompt}'
    payload = json.dumps({'model': POLZA_MODEL, 'temperature': 0.4, 'max_tokens': 2600,
                          'response_format': {'type': 'json_object'},
                          'messages': [{'role': 'system', 'content': GEN_SYSTEM.format(kinds=kinds)},
                                       {'role': 'user', 'content': user}]}).encode()
    req = urllib.request.Request(POLZA_URL, data=payload, method='POST',
                                 headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=55) as r:
        data = json.loads(r.read().decode('utf-8'))
    text = ((data.get('choices') or [{}])[0].get('message') or {}).get('content', '')
    m = re.search(r'\{.*\}', text, re.S)
    if not m:
        raise ValueError('ИИ вернул пустой ответ')
    return sanitize(json.loads(m.group(0)))


def handler(event: dict, context) -> dict:
    """Конструктор тренажёров: ИИ собирает сценарий, сохраняет, принимает результаты учеников и считает аналитику."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action') or 'ping'
    try:
        body = json.loads(event.get('body') or '{}')
    except (ValueError, TypeError):
        body = {}

    if action == 'ping':
        return resp({'ok': True, 'service': 'sim-builder'})

    if action == 'generate':
        prompt = str(body.get('prompt') or '').strip()[:1500]
        if len(prompt) < 10:
            return resp({'ok': False, 'error': 'Опишите тренажёр подробнее: что отрабатываем и для кого'}, 400)
        try:
            tr = ai_generate(prompt, str(body.get('audience') or ''))
        except Exception as e:
            print(f'[generate] {type(e).__name__}: {str(e)[:300]}')
            return resp({'ok': False, 'error': 'ИИ не смог собрать тренажёр — попробуйте переформулировать или возьмите шаблон'})
        if len(tr['objects']) < 2 or len(tr['steps']) < 2:
            return resp({'ok': False, 'error': 'Получилось слишком мало шагов — уточните задачу'})
        return resp({'ok': True, 'trainer': tr})

    conn = db()
    try:
        with conn.cursor() as cur:
            if action == 'save':
                tr = sanitize(body.get('trainer') or {})
                if len(tr['steps']) < 1:
                    return resp({'ok': False, 'error': 'Добавьте хотя бы один шаг'}, 400)
                slug, key = body.get('slug'), body.get('edit_key')
                if slug and key:
                    cur.execute(f"UPDATE {t('sim_trainers')} SET title=%s, description=%s, category=%s, audience=%s, grade=%s, "
                                f"data=%s, updated_at=NOW() WHERE slug=%s AND edit_key=%s RETURNING slug",
                                (tr['title'], tr['description'], tr['category'], ','.join(tr['audience']), tr['grade'],
                                 json.dumps(tr, ensure_ascii=False), slug, key))
                    if not cur.fetchone():
                        return resp({'ok': False, 'error': 'Нет прав на изменение этого тренажёра'}, 403)
                else:
                    slug, key = secrets.token_urlsafe(6).replace('-', 'x').replace('_', 'y'), secrets.token_urlsafe(16)
                    cur.execute(f"INSERT INTO {t('sim_trainers')} (slug, edit_key, title, description, category, audience, grade, data, author_name) "
                                f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                                (slug, key, tr['title'], tr['description'], tr['category'], ','.join(tr['audience']), tr['grade'],
                                 json.dumps(tr, ensure_ascii=False), str(body.get('author_name') or '')[:160] or None))
                conn.commit()
                return resp({'ok': True, 'slug': slug, 'edit_key': key})

            if action == 'get':
                cur.execute(f"SELECT data, slug FROM {t('sim_trainers')} WHERE slug=%s", (qs.get('slug') or '',))
                r = cur.fetchone()
                if not r:
                    return resp({'ok': False, 'error': 'Тренажёр не найден'}, 404)
                return resp({'ok': True, 'trainer': {**r[0], 'slug': r[1]}})

            if action == 'run':
                slug = str(body.get('slug') or '')[:40]
                if not slug:
                    return resp({'ok': False, 'error': 'Нет тренажёра'}, 400)
                cur.execute(f"INSERT INTO {t('sim_runs')} (trainer_slug, student_name, group_code, score, passed, duration_sec, mistakes, hints, step_times) "
                            f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                            (slug, str(body.get('student_name') or '')[:120] or None, str(body.get('group_code') or '')[:40] or None,
                             int(clamp(body.get('score'), 0, 100)), bool(body.get('passed')), int(clamp(body.get('duration_sec'), 0, 86400)),
                             json.dumps((body.get('mistakes') or [])[:50], ensure_ascii=False), int(clamp(body.get('hints'), 0, 999)),
                             json.dumps(body.get('step_times') or {}, ensure_ascii=False)))
                conn.commit()
                return resp({'ok': True})

            if action == 'stats':
                slug = qs.get('slug') or ''
                cur.execute(f"SELECT data FROM {t('sim_trainers')} WHERE slug=%s AND edit_key=%s", (slug, qs.get('key') or ''))
                r = cur.fetchone()
                if not r:
                    return resp({'ok': False, 'error': 'Нет доступа'}, 403)
                cur.execute(f"SELECT student_name, group_code, score, passed, duration_sec, mistakes, hints, step_times, created_at "
                            f"FROM {t('sim_runs')} WHERE trainer_slug=%s ORDER BY created_at DESC LIMIT 500", (slug,))
                runs = [{'student': a, 'group': b, 'score': c, 'passed': d, 'duration': e, 'mistakes': f or [], 'hints': g,
                         'step_times': h or {}, 'at': i.isoformat()} for a, b, c, d, e, f, g, h, i in cur.fetchall()]
                steps = r[0].get('steps') or []
                heat = []
                for s in steps:
                    errs = sum(1 for x in runs for m in x['mistakes'] if m.get('step') == s['id'])
                    times = [x['step_times'].get(s['id']) for x in runs if x['step_times'].get(s['id']) is not None]
                    heat.append({'step': s['id'], 'title': s['title'], 'errors': errs,
                                 'avg_time': round(sum(times) / len(times), 1) if times else None})
                n = len(runs)
                summary = {'runs': n, 'passed': sum(1 for x in runs if x['passed']),
                           'avg_score': round(sum(x['score'] for x in runs) / n) if n else 0,
                           'avg_duration': round(sum(x['duration'] for x in runs) / n) if n else 0}
                return resp({'ok': True, 'summary': summary, 'heat': heat, 'runs': runs[:200]})

            return resp({'error': 'Неизвестное действие'}, 404)
    finally:
        conn.close()
