"""
Business: Модуль «Малыш» — синхронизация прогресса ребёнка между устройствами,
родительский контроль (PIN, согласие 436-ФЗ), лимит экранного времени по СанПиН 2.4.3648-20.
Args: event с httpMethod, queryStringParameters (action), body (JSON), header X-User-Uid; context
Returns: HTTP-ответ с JSON
"""
import json
import os
import hashlib
from datetime import datetime, date, timedelta
import psycopg2


SCHEMA = 't_p78828167_tutor_platform_1'


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Uid, X-Parent-Pin',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data, status=200):
    return {'statusCode': status, 'headers': cors_headers(),
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return ok({'error': msg}, status)


def get_conn():
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        raise Exception('DATABASE_URL не настроен')
    return psycopg2.connect(dsn)


def esc(s):
    return str(s).replace("'", "''")


def hash_pin(pin: str) -> str:
    """Хеш PIN-кода + соль = SHA256."""
    salt = 'uchispro_kids_v1'
    return hashlib.sha256((salt + pin).encode('utf-8')).hexdigest()


# Лимиты экранного времени по СанПиН 2.4.3648-20 (минут в день)
SANPIN_LIMITS = {
    '1-2': 0,    # до 2 лет — экран не рекомендуется
    '2-3': 5,
    '3-4': 10,
    '4-5': 15,
    '5-6': 20,
    '6-7': 25,
}


# ─────────────── ПРОГРЕСС РЕБЁНКА ───────────────

def get_progress(uid: str) -> dict:
    """Загрузить прогресс."""
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT stars, completed_activities, streak_days, last_activity_date, "
                f"total_answers, correct_answers FROM {SCHEMA}.kids_progress "
                f"WHERE user_uid = '{esc(uid)}'"
            )
            row = cur.fetchone()
            if not row:
                return {
                    'stars': 0,
                    'completedActivities': [],
                    'streakDays': 0,
                    'lastActivityDate': None,
                    'totalAnswers': 0,
                    'correctAnswers': 0,
                }
            return {
                'stars': row[0],
                'completedActivities': row[1] or [],
                'streakDays': row[2],
                'lastActivityDate': row[3].isoformat() if row[3] else None,
                'totalAnswers': row[4],
                'correctAnswers': row[5],
            }
    finally:
        conn.close()


def save_progress(uid: str, data: dict) -> dict:
    """Сохранить прогресс (upsert)."""
    stars = int(data.get('stars') or 0)
    completed = data.get('completedActivities') or []
    streak = int(data.get('streakDays') or 0)
    last_date = data.get('lastActivityDate')
    total = int(data.get('totalAnswers') or 0)
    correct = int(data.get('correctAnswers') or 0)
    completed_json = json.dumps(completed)
    last_date_sql = "NULL" if not last_date else "'" + esc(last_date) + "'"

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            sql = (
                "INSERT INTO " + SCHEMA + ".kids_progress "
                "(user_uid, stars, completed_activities, streak_days, last_activity_date, "
                "total_answers, correct_answers, updated_at) VALUES ("
                "'" + esc(uid) + "', " + str(stars) + ", '" + esc(completed_json) + "'::jsonb, "
                + str(streak) + ", " + last_date_sql + ", " + str(total) + ", " + str(correct) + ", NOW()) "
                "ON CONFLICT (user_uid) DO UPDATE SET "
                "stars = EXCLUDED.stars, completed_activities = EXCLUDED.completed_activities, "
                "streak_days = EXCLUDED.streak_days, last_activity_date = EXCLUDED.last_activity_date, "
                "total_answers = EXCLUDED.total_answers, correct_answers = EXCLUDED.correct_answers, "
                "updated_at = NOW()"
            )
            cur.execute(sql)
            conn.commit()
        return {'saved': True}
    finally:
        conn.close()


# ─────────────── РОДИТЕЛЬСКИЙ КОНТРОЛЬ ───────────────

def get_parent_controls(uid: str) -> dict:
    """Получить настройки родительского контроля (без PIN, только has_pin)."""
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT pin_hash, consent_436fz, consent_date, child_age_band, "
                f"daily_limit_minutes, bedtime_lock_enabled, bedtime_from, bedtime_to, "
                f"block_purchases FROM {SCHEMA}.kids_parent_controls "
                f"WHERE user_uid = '{esc(uid)}'"
            )
            row = cur.fetchone()
            if not row:
                # дефолтные значения для нового родителя
                return {
                    'hasPin': False,
                    'consent436fz': False,
                    'consentDate': None,
                    'childAgeBand': '4-5',
                    'dailyLimitMinutes': 15,
                    'sanpinLimit': 15,
                    'bedtimeLockEnabled': False,
                    'bedtimeFrom': '21:00',
                    'bedtimeTo': '07:00',
                    'blockPurchases': True,
                }
            age_band = row[3] or '4-5'
            return {
                'hasPin': bool(row[0]),
                'consent436fz': bool(row[1]),
                'consentDate': row[2].isoformat() if row[2] else None,
                'childAgeBand': age_band,
                'dailyLimitMinutes': row[4],
                'sanpinLimit': SANPIN_LIMITS.get(age_band, 15),
                'bedtimeLockEnabled': bool(row[5]),
                'bedtimeFrom': str(row[6])[:5] if row[6] else '21:00',
                'bedtimeTo': str(row[7])[:5] if row[7] else '07:00',
                'blockPurchases': bool(row[8]),
            }
    finally:
        conn.close()


def set_parent_controls(uid: str, data: dict, pin: str = None) -> dict:
    """Обновить настройки. PIN передаётся отдельно (если меняется)."""
    age_band = data.get('childAgeBand') or '4-5'
    if age_band not in SANPIN_LIMITS:
        age_band = '4-5'
    # лимит не больше СанПиН — родитель не может превысить норматив
    sanpin_limit = SANPIN_LIMITS[age_band]
    daily_limit = min(int(data.get('dailyLimitMinutes') or sanpin_limit), sanpin_limit)
    consent = bool(data.get('consent436fz'))
    bedtime_lock = bool(data.get('bedtimeLockEnabled'))
    bedtime_from = (data.get('bedtimeFrom') or '21:00')[:5]
    bedtime_to = (data.get('bedtimeTo') or '07:00')[:5]
    block_purchases = bool(data.get('blockPurchases', True))

    set_pin_sql = ''
    if pin:
        if not (pin.isdigit() and 4 <= len(pin) <= 6):
            return {'error': 'PIN должен быть 4-6 цифр'}
        set_pin_sql = f", pin_hash = '{hash_pin(pin)}'"

    consent_date_sql = 'NOW()' if consent else 'NULL'

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # Проверяем существование
            cur.execute(f"SELECT 1 FROM {SCHEMA}.kids_parent_controls WHERE user_uid = '{esc(uid)}'")
            exists = cur.fetchone()
            if exists:
                cur.execute(
                    f"UPDATE {SCHEMA}.kids_parent_controls SET "
                    f"consent_436fz = {consent}, consent_date = {consent_date_sql}, "
                    f"child_age_band = '{esc(age_band)}', daily_limit_minutes = {daily_limit}, "
                    f"bedtime_lock_enabled = {bedtime_lock}, "
                    f"bedtime_from = '{esc(bedtime_from)}', bedtime_to = '{esc(bedtime_to)}', "
                    f"block_purchases = {block_purchases}, updated_at = NOW() "
                    f"{set_pin_sql} "
                    f"WHERE user_uid = '{esc(uid)}'"
                )
            else:
                # Для нового родителя PIN не обязателен, но если передан — сохраняем
                pin_col = 'pin_hash, ' if pin else ''
                pin_val = f"'{hash_pin(pin)}', " if pin else ''
                cur.execute(
                    f"INSERT INTO {SCHEMA}.kids_parent_controls "
                    f"(user_uid, {pin_col}consent_436fz, consent_date, child_age_band, "
                    f"daily_limit_minutes, bedtime_lock_enabled, bedtime_from, bedtime_to, "
                    f"block_purchases) VALUES ("
                    f"'{esc(uid)}', {pin_val}{consent}, {consent_date_sql}, '{esc(age_band)}', "
                    f"{daily_limit}, {bedtime_lock}, '{esc(bedtime_from)}', '{esc(bedtime_to)}', "
                    f"{block_purchases})"
                )
            conn.commit()
        return {'saved': True}
    finally:
        conn.close()


def verify_pin(uid: str, pin: str) -> dict:
    """Проверить PIN. Возвращает ok=True если совпал."""
    if not pin or not pin.isdigit():
        return {'ok': False, 'reason': 'invalid'}
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT pin_hash FROM {SCHEMA}.kids_parent_controls "
                f"WHERE user_uid = '{esc(uid)}'"
            )
            row = cur.fetchone()
            if not row or not row[0]:
                # PIN ещё не установлен — пускаем без проверки (первый вход)
                return {'ok': True, 'first': True}
            return {'ok': row[0] == hash_pin(pin)}
    finally:
        conn.close()


# ─────────────── ЭКРАННОЕ ВРЕМЯ ───────────────

def get_screen_time(uid: str) -> dict:
    """Сколько минут сегодня потрачено + лимит + остаток + блокировка по bedtime."""
    today = date.today().isoformat()
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT minutes_used FROM {SCHEMA}.kids_screen_time "
                f"WHERE user_uid = '{esc(uid)}' AND day = '{today}'"
            )
            row = cur.fetchone()
            used = row[0] if row else 0

            # Лимит и bedtime из настроек
            cur.execute(
                f"SELECT child_age_band, daily_limit_minutes, bedtime_lock_enabled, "
                f"bedtime_from, bedtime_to FROM {SCHEMA}.kids_parent_controls "
                f"WHERE user_uid = '{esc(uid)}'"
            )
            ctl = cur.fetchone()
            if ctl:
                age_band, daily_limit, bedtime_lock, bt_from, bt_to = ctl
                sanpin = SANPIN_LIMITS.get(age_band or '4-5', 15)
                limit = min(daily_limit or sanpin, sanpin)
            else:
                limit = 15
                bedtime_lock = False
                bt_from = None
                bt_to = None

            # Проверка bedtime: блокируем если сейчас в окне «спать»
            in_bedtime = False
            if bedtime_lock and bt_from and bt_to:
                now_t = datetime.now().time()
                if bt_from <= bt_to:
                    in_bedtime = bt_from <= now_t <= bt_to
                else:
                    # ночное окно через полночь (21:00–07:00)
                    in_bedtime = now_t >= bt_from or now_t <= bt_to

            remaining = max(0, limit - used)
            return {
                'minutesUsed': used,
                'dailyLimit': limit,
                'remaining': remaining,
                'limitReached': used >= limit,
                'bedtimeActive': in_bedtime,
                'blocked': used >= limit or in_bedtime,
                'reason': 'bedtime' if in_bedtime else ('limit' if used >= limit else None),
            }
    finally:
        conn.close()


def add_screen_time(uid: str, minutes: int) -> dict:
    """Прибавить минуты к сегодняшнему времени."""
    minutes = max(0, min(int(minutes or 0), 60))  # за один heartbeat — не более 60 минут
    today = date.today().isoformat()
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.kids_screen_time (user_uid, day, minutes_used, last_session_at) "
                f"VALUES ('{esc(uid)}', '{today}', {minutes}, NOW()) "
                f"ON CONFLICT (user_uid, day) DO UPDATE SET "
                f"minutes_used = {SCHEMA}.kids_screen_time.minutes_used + {minutes}, "
                f"last_session_at = NOW()"
            )
            conn.commit()
        return get_screen_time(uid)
    finally:
        conn.close()


# ─────────────── HANDLER ───────────────

def handler(event: dict, context) -> dict:
    """Главный обработчик kids endpoint."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers = event.get('headers') or {}
    uid = headers.get('X-User-Uid') or headers.get('x-user-uid') or ''
    if not uid:
        return err('X-User-Uid header required', 401)

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action') or ''

    body_str = event.get('body') or '{}'
    try:
        body = json.loads(body_str) if body_str else {}
    except Exception:
        body = {}

    try:
        if action == 'get_progress':
            return ok(get_progress(uid))
        if action == 'save_progress':
            return ok(save_progress(uid, body))
        if action == 'get_controls':
            return ok(get_parent_controls(uid))
        if action == 'set_controls':
            pin = body.get('pin')
            return ok(set_parent_controls(uid, body, pin))
        if action == 'verify_pin':
            return ok(verify_pin(uid, body.get('pin') or ''))
        if action == 'get_screen_time':
            return ok(get_screen_time(uid))
        if action == 'add_screen_time':
            return ok(add_screen_time(uid, body.get('minutes') or 1))
        return err(f'неизвестный action: {action}')
    except Exception as e:
        return err(f'{type(e).__name__}: {str(e)[:200]}', 500)