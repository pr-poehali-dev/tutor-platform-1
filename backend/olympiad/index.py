"""
Business: Мини-олимпиада УЧИСЬПРО — задачи по всему школьному курсу, начисление ЗНАЕК на сервере,
главный приз 5000 ЗНАЕК за идеальное прохождение, рейтинг (лидерборд) и ИИ-тренер по имени.
Безопасность: правильные ответы и начисление ЗНАЕК хранятся/считаются ТОЛЬКО на сервере (анти-накрутка).
Args: event (httpMethod, headers с X-Auth-Token, queryStringParameters.action, body); context (request_id)
Returns: HTTP JSON ответ
"""
import json
import os
import re
import uuid
import random
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Optional
import psycopg2

SCHEMA = 't_p78828167_tutor_platform_1'

# ── Экономика олимпиады ──
ZNAIKI_PER_CORRECT = 50        # за каждый верный ответ
GRAND_PRIZE = 5000             # главный приз за идеальное прохождение
QUESTIONS_PER_OLYMPIAD = 7     # количество задач (уровней)

SUBJECT_NAMES = {
    'math': 'Математика', 'physics': 'Физика', 'chemistry': 'Химия',
    'biology': 'Биология', 'russian': 'Русский язык', 'history': 'История',
    'geography': 'География', 'english': 'Английский язык', 'cs': 'Информатика',
    'literature': 'Литература', 'society': 'Обществознание', 'mixed': 'Школьный курс (разные предметы)',
}


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def resp(d: dict, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(), 'body': json.dumps(d, ensure_ascii=False, default=str)}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resolve_user(cur, token: str) -> Optional[int]:
    if not token:
        return None
    cur.execute("SELECT user_id, expires_at, revoked_at FROM auth_sessions WHERE token=%s LIMIT 1", (token,))
    r = cur.fetchone()
    if not r:
        return None
    uid, exp, rev = r
    if rev is not None:
        return None
    if exp and exp < datetime.now(timezone.utc):
        return None
    return uid


def user_name(cur, user_id: int) -> str:
    try:
        cur.execute("SELECT name FROM auth_users WHERE id=%s LIMIT 1", (user_id,))
        r = cur.fetchone()
        if r and r[0]:
            return str(r[0]).split()[0]
    except Exception:
        pass
    return 'друг'


# ── Начисление ЗНАЕК (как в znaika: те же таблицы) ──
LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7500, 15000, 30000, 60000, 100000]


def calc_level(total_earned: int) -> int:
    lvl = 1
    for i, t in enumerate(LEVEL_THRESHOLDS, start=1):
        if total_earned >= t:
            lvl = i
    return lvl


def credit(cur, user_id: int, amount: int, reason: str, description: str = '') -> int:
    if amount <= 0 or not user_id:
        return 0
    cur.execute("INSERT INTO znaika_balances (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING", (user_id,))
    cur.execute(
        "UPDATE znaika_balances SET balance=balance+%s, total_earned=total_earned+%s, updated_at=now() "
        "WHERE user_id=%s RETURNING balance, total_earned",
        (amount, amount, user_id)
    )
    new_balance, total_earned = cur.fetchone()
    cur.execute("UPDATE znaika_balances SET level=%s WHERE user_id=%s", (calc_level(total_earned), user_id))
    cur.execute(
        "INSERT INTO znaika_transactions (user_id, amount, kind, reason, description, meta) "
        "VALUES (%s, %s, 'earn', %s, %s, %s)",
        (user_id, amount, reason, description, json.dumps({}))
    )
    return new_balance


# ── Генерация задач олимпиады через polza.ai ──
def call_polza(messages, max_tokens=2600, temperature=0.6, timeout=40):
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        raise Exception('POLZA_API_KEY не настроен')
    payload = json.dumps({
        'model': 'openai/gpt-4o',
        'messages': messages,
        'temperature': temperature,
        'max_tokens': max_tokens,
        'response_format': {'type': 'json_object'},
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://api.polza.ai/api/v1/chat/completions', data=payload,
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}, method='POST',
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        result = json.loads(r.read().decode('utf-8'))
    return json.loads(result['choices'][0]['message']['content'].strip())


def generate_questions(subject: str, grade: str, n: int) -> list:
    subject_name = SUBJECT_NAMES.get(subject, SUBJECT_NAMES['mixed'])
    seed = random.randint(1000, 9999)
    mixed_hint = ''
    if subject == 'mixed':
        mixed_hint = ('Задачи из РАЗНЫХ школьных предметов (математика, физика, русский язык, биология, '
                      'история, география, химия) — по одной из разных областей, общий кругозор школьника. ')
    prompt = f"""Ты — методист школьных олимпиад. Составь {n} олимпиадных задач для школьника (класс {grade}) по теме "{subject_name}".
{mixed_hint}Сложность нарастает от простой (1) к самой сложной (последняя) — настоящая олимпиада.
Сид разнообразия: {seed}.

⚠️ КАЖДАЯ ЗАДАЧА:
- РЕШИ её сам и доведи ответ до конца. Среди вариантов ОБЯЗАТЕЛЬНО есть точный правильный ответ.
- Все варианты вычислены до числа/значения, не сырые выражения. Единицы измерения корректные.
- В условии достаточно данных для однозначного решения. Не выдумывай факты.
- correct_answer — это ИНДЕКС (0..3) правильного варианта в options.
- correct_answer_text == options[correct_answer].
- Понятная школьнику формулировка, на "ты", без LaTeX.

Верни строго JSON:
{{"questions":[
  {{"subject":"{subject_name}","question":"условие","options":["A","B","C","D"],"correct_answer":0,"correct_answer_text":"A","explanation":"краткое решение с ответом","points":10}}
]}}
Поле points: от 10 (первая) до {10*n} — растёт с уровнем. Ровно {n} задач."""
    data = call_polza([{'role': 'user', 'content': prompt}])
    raw = data.get('questions', []) if isinstance(data, dict) else []
    out = []
    for i, q in enumerate(raw):
        if not isinstance(q, dict):
            continue
        opts = q.get('options', [])
        if not isinstance(opts, list) or len(opts) < 2:
            continue
        try:
            ci = int(q.get('correct_answer'))
        except (TypeError, ValueError):
            continue
        if ci < 0 or ci >= len(opts):
            continue
        out.append({
            'subject': str(q.get('subject', subject_name)),
            'question': str(q.get('question', '')).strip(),
            'options': [str(o) for o in opts],
            'correct_answer': ci,
            'explanation': str(q.get('explanation', '')),
            'points': int(q.get('points', (i + 1) * 10)) if str(q.get('points', '')).strip() else (i + 1) * 10,
        })
    return out


def public_question(q: dict, idx: int, total: int) -> dict:
    """Версия задачи БЕЗ правильного ответа — для клиента."""
    return {
        'index': idx,
        'total': total,
        'subject': q['subject'],
        'question': q['question'],
        'options': q['options'],
        'points': q['points'],
    }


# ── Реплики тренера ──
def coach_line(name: str, kind: str, ctx: dict) -> str:
    streak = ctx.get('streak', 0)
    idx = ctx.get('index', 0)
    total = ctx.get('total', QUESTIONS_PER_OLYMPIAD)
    left = total - idx
    if kind == 'start':
        return f"Привет, {name}! Я твой тренер. Впереди {total} задач по нарастающей. Решишь все без ошибок — заберёшь главный приз 5000 ЗНАЕК! Поехали 🚀"
    if kind == 'correct':
        if streak >= 3:
            return random.choice([
                f"Огонь, {name}! Серия из {streak} подряд — ты в ударе! 🔥",
                f"{name}, ты неудержим! {streak} верных подряд.",
                f"Чисто решено! Осталось всего {left} — держи темп, {name}!",
            ])
        return random.choice([
            f"Верно, {name}! Двигаемся дальше 💪",
            f"Отличный ответ! Ещё {left} задач до финала.",
            f"Так держать, {name}!",
        ])
    if kind == 'wrong':
        return random.choice([
            f"Не страшно, {name} — даже чемпионы ошибаются. Разбери решение и идём дальше.",
            f"Бывает! Главное — понять, как решалось. Ты справишься, {name}.",
            f"{name}, ошибка — это шаг к знанию. Посмотри разбор и вперёд!",
        ])
    if kind == 'finish_perfect':
        return f"НЕВЕРОЯТНО, {name}! Идеальное прохождение — все задачи верно! Ты заслужил главный приз 5000 ЗНАЕК 🏆"
    if kind == 'finish':
        c = ctx.get('correct', 0)
        return f"Молодец, {name}! Ты решил {c} из {total}. Это хороший результат — приходи ещё, и главный приз будет твоим!"
    return ''


# ── Действия ──
def act_start(cur, user_id, body):
    subject = str(body.get('subject', 'mixed'))
    grade = str(body.get('grade', '5-9'))
    name = user_name(cur, user_id) if user_id else 'друг'
    questions = generate_questions(subject, grade, QUESTIONS_PER_OLYMPIAD)
    if len(questions) < 3:
        return resp({'error': 'Не удалось подготовить задачи. Попробуй ещё раз.'}, 503)
    total = len(questions)
    token = 'olymp_' + uuid.uuid4().hex
    cur.execute(
        f"INSERT INTO {SCHEMA}.olympiad_sessions "
        f"(session_token, user_id, subject, grade, questions, total_questions) "
        f"VALUES (%s, %s, %s, %s, %s, %s)",
        (token, user_id, subject, grade, json.dumps(questions, ensure_ascii=False), total)
    )
    return resp({
        'session_token': token,
        'name': name,
        'subject': SUBJECT_NAMES.get(subject, subject),
        'total': total,
        'znaiki_per_correct': ZNAIKI_PER_CORRECT,
        'grand_prize': GRAND_PRIZE,
        'coach': coach_line(name, 'start', {'total': total}),
        'question': public_question(questions[0], 0, total),
    })


def act_answer(cur, user_id, body):
    token = str(body.get('session_token', ''))
    try:
        answer_idx = int(body.get('answer'))
    except (TypeError, ValueError):
        return resp({'error': 'answer обязателен'}, 400)
    cur.execute(
        f"SELECT id, user_id, questions, total_questions, current_index, correct_count, mistakes, "
        f"znaiki_earned, perfect, status FROM {SCHEMA}.olympiad_sessions WHERE session_token=%s",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return resp({'error': 'Сессия не найдена'}, 404)
    sid, sess_uid, questions, total, cur_idx, correct_count, mistakes, znaiki_earned, perfect, status = row
    if status != 'active':
        return resp({'error': 'Олимпиада уже завершена'}, 400)
    if isinstance(questions, str):
        questions = json.loads(questions)
    q = questions[cur_idx]
    name = user_name(cur, user_id) if user_id else 'друг'
    is_correct = (answer_idx == q['correct_answer'])

    gained = 0
    if is_correct:
        correct_count += 1
        gained = ZNAIKI_PER_CORRECT
        znaiki_earned += gained
        if user_id:
            try:
                credit(cur, user_id, gained, 'olympiad_correct', f'Олимпиада: верный ответ #{cur_idx + 1}')
            except Exception:
                pass
    else:
        mistakes += 1
        perfect = False

    next_idx = cur_idx + 1
    finished = next_idx >= total

    cur.execute(
        f"UPDATE {SCHEMA}.olympiad_sessions SET current_index=%s, correct_count=%s, mistakes=%s, "
        f"znaiki_earned=%s, perfect=%s WHERE id=%s",
        (next_idx, correct_count, mistakes, znaiki_earned, perfect, sid)
    )

    result = {
        'correct': is_correct,
        'correct_answer': q['correct_answer'],
        'explanation': q.get('explanation', ''),
        'znaiki_gained': gained,
        'znaiki_total': znaiki_earned,
        'correct_count': correct_count,
        'finished': finished,
        'coach': coach_line(name, 'correct' if is_correct else 'wrong',
                            {'streak': correct_count, 'index': next_idx, 'total': total}),
    }
    if not finished:
        result['question'] = public_question(questions[next_idx], next_idx, total)
    return resp(result)


def act_finish(cur, user_id, body):
    token = str(body.get('session_token', ''))
    display_name = str(body.get('display_name', '')).strip()[:40]
    cur.execute(
        f"SELECT id, user_id, subject, grade, questions, total_questions, correct_count, mistakes, "
        f"znaiki_earned, perfect, status, grand_prize_awarded FROM {SCHEMA}.olympiad_sessions "
        f"WHERE session_token=%s",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return resp({'error': 'Сессия не найдена'}, 404)
    (sid, sess_uid, subject, grade, questions, total, correct_count, mistakes,
     znaiki_earned, perfect, status, prize_awarded) = row
    name = user_name(cur, user_id) if user_id else 'друг'

    grand_prize = 0
    if perfect and correct_count >= total and not prize_awarded:
        grand_prize = GRAND_PRIZE
        if user_id:
            try:
                credit(cur, user_id, GRAND_PRIZE, 'olympiad_grand_prize', 'Главный приз олимпиады — идеальное прохождение')
            except Exception:
                grand_prize = 0
        if grand_prize:
            znaiki_earned += grand_prize

    # Очки рейтинга: 100 за каждый верный ответ + бонус 500 за идеальное прохождение
    score = correct_count * 100 + (500 if perfect else 0)

    if status == 'active':
        cur.execute(
            f"UPDATE {SCHEMA}.olympiad_sessions SET status='finished', finished_at=now(), "
            f"grand_prize_awarded=%s, znaiki_earned=%s WHERE id=%s",
            (bool(grand_prize) or prize_awarded, znaiki_earned, sid)
        )
        lname = display_name or name
        cur.execute(
            f"INSERT INTO {SCHEMA}.olympiad_results "
            f"(user_id, display_name, subject, grade, score, correct_count, total_questions, znaiki_earned, perfect) "
            f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (user_id, lname, subject, grade, score, correct_count, total, znaiki_earned, perfect)
        )

    return resp({
        'correct_count': correct_count,
        'total': total,
        'perfect': perfect,
        'znaiki_earned': znaiki_earned,
        'grand_prize': grand_prize,
        'score': score,
        'coach': coach_line(name, 'finish_perfect' if (perfect and correct_count >= total) else 'finish',
                            {'correct': correct_count, 'total': total}),
    })


def act_leaderboard(cur, user_id, body):
    cur.execute(
        f"SELECT display_name, subject, grade, score, correct_count, total_questions, perfect, created_at "
        f"FROM {SCHEMA}.olympiad_results ORDER BY score DESC, created_at ASC LIMIT 20"
    )
    top = []
    for i, r in enumerate(cur.fetchall(), start=1):
        top.append({
            'rank': i, 'name': r[0], 'subject': SUBJECT_NAMES.get(r[1], r[1]), 'grade': r[2],
            'score': r[3], 'correct': r[4], 'total': r[5], 'perfect': r[6],
            'date': r[7].isoformat() if r[7] else None,
        })
    return resp({'leaderboard': top})


def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    conn = get_db()
    try:
        conn.autocommit = False
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)

            if action == 'leaderboard':
                out = act_leaderboard(cur, user_id, body)
            elif action == 'start':
                out = act_start(cur, user_id, body)
            elif action == 'answer':
                out = act_answer(cur, user_id, body)
            elif action == 'finish':
                out = act_finish(cur, user_id, body)
            else:
                conn.rollback()
                return resp({'error': 'Неизвестное действие'}, 400)

        conn.commit()
        return out
    except Exception as e:
        conn.rollback()
        return resp({'error': f'Ошибка сервера: {str(e)}'}, 500)
    finally:
        conn.close()