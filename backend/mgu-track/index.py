"""
Business: МГУ-трек — индивидуальная стратегия поступления в МГУ.
Действия:
- faculties: список всех факультетов с проходными баллами
- build: создать персональный план поступления (ЕГЭ + олимпиады + ДВИ + дополнительные достижения)
- ask: задать вопрос стратегу МГУ
- track: получить/обновить трек ученика
- compatibility: проверить совместимость текущих баллов ученика с факультетом

Args: event с action в query/body
Returns: JSON с планом или ответом стратега
"""
import json
import os
import re
import urllib.request
import urllib.error
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Access-Control-Max-Age': '86400',
}


def ok(payload, status=200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(payload, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return ok({'error': msg}, status)


def db_conn():
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        return None
    try:
        return psycopg2.connect(dsn)
    except Exception:
        return None


def get_agent_prompt(conn, agent_key, fallback):
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT system_prompt, temperature, model FROM ai_agents WHERE agent_key = %s AND is_active = TRUE",
                (agent_key,))
            row = cur.fetchone()
            if row:
                return row[0], float(row[1] or 0.4), row[2] or 'openai/gpt-4o-mini'
    except Exception:
        pass
    return fallback, 0.4, 'openai/gpt-4o-mini'


def call_polza(messages, model='openai/gpt-4o-mini', temperature=0.4, max_tokens=4000, json_mode=True):
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'
    try:
        body = {
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
        }
        if json_mode:
            body['response_format'] = {'type': 'json_object'}
        payload = json.dumps(body).encode('utf-8')
        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/chat/completions',
            data=payload,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read().decode('utf-8'))
            raw = data['choices'][0]['message']['content'].strip()
            if json_mode:
                raw = re.sub(r'^```json\s*', '', raw)
                raw = re.sub(r'\s*```$', '', raw)
                return json.loads(raw), None
            return raw, None
    except urllib.error.HTTPError as e:
        return None, f'polza HTTP {e.code}'
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:100]}'


def action_faculties(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT faculty_code, faculty_name, short_name, speciality,
                   ege_required, dvi_subject, last_year_min_score,
                   budget_seats, competition_per_seat, olympiad_level, description
            FROM mgu_faculties
            WHERE is_active = TRUE
            ORDER BY sort_order, faculty_code
        """)
        rows = cur.fetchall()
    return ok({'faculties': rows, 'total': len(rows)})


def action_compatibility(conn, body):
    """Быстрая проверка: проходит ли ученик на факультет по текущим баллам."""
    faculty_code = body.get('faculty_code')
    current_scores = body.get('current_scores') or {}  # {"math": 80, "russian": 75, ...}
    if not faculty_code:
        return err('faculty_code required')

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT * FROM mgu_faculties WHERE faculty_code = %s
        """, (faculty_code,))
        fac = cur.fetchone()
    if not fac:
        return err('Факультет не найден', 404)

    ege_required = fac['ege_required'] or []
    min_score = int(fac['last_year_min_score'] or 0)

    current_total = 0
    missing = []
    by_subject = {}
    for subj in ege_required:
        score = int(current_scores.get(subj, 0) or 0)
        current_total += score
        by_subject[subj] = score
        if score == 0:
            missing.append(subj)

    gap = max(0, min_score - current_total)
    is_safe = gap == 0 and not missing
    needs_olympiad = gap > 30

    return ok({
        'faculty': {
            'code': fac['faculty_code'],
            'name': fac['faculty_name'],
            'short_name': fac['short_name'],
        },
        'required_subjects': ege_required,
        'dvi': fac['dvi_subject'],
        'min_score_last_year': min_score,
        'budget_seats': fac['budget_seats'],
        'competition': float(fac['competition_per_seat'] or 0),
        'current_total': current_total,
        'by_subject': by_subject,
        'gap_points': gap,
        'missing_exams': missing,
        'is_safe': is_safe,
        'needs_olympiad': needs_olympiad,
        'recommendation': (
            f'Уверенный проход на {fac["short_name"]}' if is_safe else
            f'Не хватает {gap} баллов. Рекомендуем перечневую олимпиаду I-II уровня' if needs_olympiad else
            f'Не хватает {gap} баллов. Можно подтянуть за 4-6 месяцев интенсивной подготовки'
        ),
    })


def action_build(conn, body, user_id):
    """Строит персональный план поступления через ИИ-стратега."""
    faculty_code = body.get('faculty_code')
    grade = body.get('grade') or '11'
    current_scores = body.get('current_scores') or {}
    weeks_until_exam = int(body.get('weeks_until_exam') or 30)
    interests = body.get('interests') or []
    weak_topics = body.get('weak_topics') or []
    strong_topics = body.get('strong_topics') or []

    if not faculty_code:
        return err('faculty_code required')

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM mgu_faculties WHERE faculty_code = %s", (faculty_code,))
        fac = cur.fetchone()
    if not fac:
        return err('Факультет не найден', 404)

    sys_prompt, temp, model = get_agent_prompt(
        conn, 'mgu_strategist',
        'Ты — стратег поступления в МГУ.'
    )

    user_msg = f"""Построй персональный план поступления в МГУ.

ЦЕЛЬ: {fac['faculty_name']} ({fac['short_name']})
Специальность: {fac['speciality']}
ЕГЭ обязательные: {fac['ege_required']}
ДВИ предмет: {fac['dvi_subject']}
Проходной балл прошлого года: {fac['last_year_min_score']}
Бюджетных мест: {fac['budget_seats']}
Конкурс: {fac['competition_per_seat']} чел./место

УЧЕНИК:
- Класс: {grade}
- Недель до ЕГЭ: {weeks_until_exam}
- Текущие баллы по предметам (или 0 если не сдавал): {json.dumps(current_scores, ensure_ascii=False)}
- Интересы: {', '.join(interests) if interests else 'не указаны'}
- Слабые темы: {', '.join(weak_topics) if weak_topics else 'не указаны'}
- Сильные темы: {', '.join(strong_topics) if strong_topics else 'не указаны'}

Верни строго JSON:
{{
  "plan_summary": "2-3 абзаца главного послания: реальные шансы, на что фокус, что точно нужно делать",
  "target_scores": {{
    "math": целевой балл, "physics": ..., и т.д. по обязательным ЕГЭ
  }},
  "confidence_score": число от 0 до 100 (вероятность поступления при честном следовании плану),
  "olympiads_to_write": [
    {{"name": "Ломоносов", "level": 1, "subject": "математика", "deadline": "октябрь", "what_gives": "БВИ или 100 баллов по ЕГЭ"}}
  ],
  "weekly_plan": [
    {{"week_range": "1-4", "focus": "что делаем в эти недели", "subjects_hours": {{"math": 8, "russian": 4}}, "deliverables": ["конкретные результаты"]}}
  ],
  "dvi_strategy": "Как готовиться к ДВИ {fac['dvi_subject']}: что читать, какие задачи решать, где найти прошлые варианты",
  "additional_achievements": ["золотая медаль", "ГТО", "итоговое сочинение на отлично"],
  "risks": ["что может пойти не так и как этого избежать"],
  "fallback_universities": [
    {{"name": "МФТИ", "faculty": "ФУПМ", "why": "альтернатива если не пройдёшь на ВМК"}}
  ],
  "monthly_milestones": [
    {{"month": "Октябрь", "must_do": ["записаться на Ломоносова", "пробник ЕГЭ"]}}
  ]
}}

ВАЖНО: будь честным. Если шансы низкие — так и скажи в plan_summary. Не приукрашивай."""

    plan, gen_err = call_polza(
        [{'role': 'system', 'content': sys_prompt}, {'role': 'user', 'content': user_msg}],
        model=model, temperature=temp, max_tokens=4000,
    )

    if not plan:
        return err(f'ИИ-стратег не построил план: {gen_err}', 502)

    # Сохраняем трек если есть user_id
    track_id = None
    if user_id:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO mgu_tracks
                    (user_id, target_faculty_code, current_grade, target_ege_scores,
                     current_predicted_scores, olympiads_planned, weak_topics, strong_topics,
                     weeks_until_exam, plan_summary, weekly_plan, confidence_score)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_id, faculty_code, grade,
                json.dumps(plan.get('target_scores') or {}, ensure_ascii=False),
                json.dumps(current_scores, ensure_ascii=False),
                json.dumps(plan.get('olympiads_to_write') or [], ensure_ascii=False),
                json.dumps(weak_topics, ensure_ascii=False),
                json.dumps(strong_topics, ensure_ascii=False),
                weeks_until_exam,
                (plan.get('plan_summary') or '')[:3000],
                json.dumps(plan.get('weekly_plan') or [], ensure_ascii=False),
                int(plan.get('confidence_score') or 0),
            ))
            track_id = cur.fetchone()[0]
        conn.commit()

    return ok({
        'track_id': track_id,
        'faculty': dict(fac) if fac else None,
        'plan': plan,
    })


def action_ask(conn, body, user_id):
    """Свободный вопрос стратегу МГУ."""
    question = (body.get('question') or '').strip()
    if not question:
        return err('question required')
    context_track_id = body.get('track_id')

    sys_prompt, temp, model = get_agent_prompt(
        conn, 'mgu_strategist',
        'Ты — стратег поступления в МГУ.'
    )

    context_str = ''
    if context_track_id:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM mgu_tracks WHERE id = %s", (context_track_id,))
            track = cur.fetchone()
            if track:
                context_str = (
                    f'\nКонтекст ученика: цель — {track["target_faculty_code"]}, '
                    f'{track["current_grade"]} класс, '
                    f'до ЕГЭ {track["weeks_until_exam"]} недель, '
                    f'уверенность {track["confidence_score"]}%.'
                )

    answer, gen_err = call_polza(
        [
            {'role': 'system', 'content': sys_prompt + context_str},
            {'role': 'user', 'content': question},
        ],
        model=model, temperature=0.5, max_tokens=1500, json_mode=False,
    )

    if not answer:
        return err(f'Стратег не ответил: {gen_err}', 502)

    # Сохраняем консультацию
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO mgu_consultations (user_id, track_id, question, answer)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (user_id, context_track_id, question[:2000], (answer or '')[:8000]))
        cid = cur.fetchone()[0]
    conn.commit()

    return ok({'consultation_id': cid, 'answer': answer})


def action_my_track(conn, user_id):
    if not user_id:
        return err('user_id required (X-User-Id header)')
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT t.*, f.faculty_name, f.short_name
            FROM mgu_tracks t
            LEFT JOIN mgu_faculties f ON f.faculty_code = t.target_faculty_code
            WHERE t.user_id = %s
            ORDER BY t.last_updated_at DESC LIMIT 5
        """, (user_id,))
        tracks = cur.fetchall()
    return ok({'tracks': tracks})


def handler(event, context):
    """МГУ-трек УЧИСЬПРО — стратегия поступления в МГУ и топ-5."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    user_id_raw = headers.get('X-User-Id') or headers.get('x-user-id')
    try:
        user_id = int(user_id_raw) if user_id_raw else None
    except Exception:
        user_id = None

    body = {}
    if method == 'POST':
        try:
            body = json.loads(event.get('body') or '{}')
        except Exception:
            return err('Некорректный JSON')

    action = qs.get('action') or body.get('action', '')
    conn = db_conn()
    if not conn:
        return err('БД недоступна', 503)

    try:
        if action == 'faculties':
            return action_faculties(conn)
        if action == 'compatibility':
            return action_compatibility(conn, body)
        if action == 'build':
            return action_build(conn, body, user_id)
        if action == 'ask':
            return action_ask(conn, body, user_id)
        if action == 'my_track':
            return action_my_track(conn, user_id)
        return err(f'Неизвестное действие: {action}. Доступно: faculties, compatibility, build, ask, my_track')
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return err(f'{type(e).__name__}: {str(e)[:200]}', 500)
    finally:
        try:
            conn.close()
        except Exception:
            pass
