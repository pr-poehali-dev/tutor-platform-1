"""
Реферальная программа.

GET  /?action=my_code             X-Auth-Token   -> {code, invited_count, rewards_earned_days, share_link}
POST /?action=use_code            X-Auth-Token   body: {code} — применить промокод при регистрации
GET  /?action=invited_list        X-Auth-Token   -> [{name, joined_at}]
"""
import json
import os
import re
import secrets
from datetime import datetime, timezone, timedelta
import psycopg2


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT user_id, expires_at, revoked_at FROM auth_sessions WHERE token=%s LIMIT 1",
        (token,)
    )
    r = cur.fetchone()
    if not r:
        return None
    uid, exp, rev = r
    if rev is not None:
        return None
    if exp and exp < datetime.now(timezone.utc):
        return None
    return uid


SITE_BASE = 'https://xn--h1agdcde2c.xn--p1ai'

# ---- Акция «Приведи друга» (знайки) ----
# Действует для приглашений, оформленных с этой даты (МСК).
PROMO_ZNAIKA_START = datetime(2026, 6, 23, 0, 0, 0, tzinfo=timezone(timedelta(hours=3)))
PROMO_INVITE_ZNAIKA = 100    # пригласившему — за каждого приведённого друга
PROMO_PURCHASE_ZNAIKA = 1000  # пригласившему — если друг купил любой курс

LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7500, 15000, 30000, 60000, 100000]


def _calc_level(total_earned: int) -> int:
    lvl = 1
    for i, threshold in enumerate(LEVEL_THRESHOLDS, start=1):
        if total_earned >= threshold:
            lvl = i
    return lvl


def credit_znaika(cur, user_id: int, amount: int, reason: str, description: str = '') -> None:
    """Начисляет ЗНАЙКИ пользователю (та же БД, что и znaika).
    Повторяет логику znaika.credit: баланс + история + уровень."""
    if amount <= 0:
        return
    cur.execute(
        "INSERT INTO znaika_balances (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
        (user_id,)
    )
    cur.execute(
        "UPDATE znaika_balances SET balance = balance + %s, "
        "total_earned = total_earned + %s, updated_at = now() "
        "WHERE user_id = %s RETURNING total_earned",
        (amount, amount, user_id)
    )
    total_earned = cur.fetchone()[0]
    cur.execute("UPDATE znaika_balances SET level=%s WHERE user_id=%s",
                (_calc_level(total_earned), user_id))
    cur.execute(
        "INSERT INTO znaika_transactions (user_id, amount, kind, reason, description, meta) "
        "VALUES (%s, %s, 'earn', %s, %s, '{}'::jsonb)",
        (user_id, amount, reason, description)
    )


def promo_active(now=None) -> bool:
    """Акция начисления знаек активна с PROMO_ZNAIKA_START."""
    now = now or datetime.now(timezone.utc)
    return now >= PROMO_ZNAIKA_START


def generate_code(cur) -> str:
    for _ in range(8):
        candidate = secrets.token_urlsafe(6).upper().replace('_', 'X').replace('-', '0')[:8]
        cur.execute("SELECT 1 FROM referral_codes WHERE code=%s", (candidate,))
        if not cur.fetchone():
            return candidate
    # Крайне маловероятный fallback
    return 'UCH' + str(int(datetime.now(timezone.utc).timestamp()))[-5:]


def get_or_create_code(cur, user_id: int) -> dict:
    cur.execute(
        "SELECT code, invited_count, rewards_earned_days "
        "FROM referral_codes WHERE user_id=%s LIMIT 1",
        (user_id,)
    )
    row = cur.fetchone()
    if row:
        return {'code': row[0], 'invited_count': row[1], 'rewards_earned_days': row[2]}
    new_code = generate_code(cur)
    cur.execute(
        "INSERT INTO referral_codes (user_id, code) VALUES (%s, %s) "
        "RETURNING code, invited_count, rewards_earned_days",
        (user_id, new_code)
    )
    r = cur.fetchone()
    return {'code': r[0], 'invited_count': r[1], 'rewards_earned_days': r[2]}


def handle_my_code(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            data = get_or_create_code(cur, uid)
            conn.commit()
            return ok({
                **data,
                'share_link': f"{SITE_BASE}/?ref={data['code']}",
                'share_text': (
                    f"Я учусь на УЧИСЬПРО — образовательной платформе с ИИ-репетитором 24/7. "
                    f"По моему промокоду {data['code']} получишь +7 дней подписки бесплатно!"
                ),
            })
    finally:
        conn.close()


def handle_use_code(token: str, body: dict) -> dict:
    code = (body.get('code') or '').strip().upper()
    if not code or not re.match(r'^[A-Z0-9]{4,12}$', code):
        return err('Некорректный промокод', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            # Промокод владельца
            cur.execute(
                "SELECT user_id FROM referral_codes WHERE code=%s LIMIT 1",
                (code,)
            )
            owner = cur.fetchone()
            if not owner:
                return err('Промокод не найден', 404)
            owner_uid = owner[0]
            if owner_uid == uid:
                return err('Нельзя использовать собственный код', 400)
            # Проверяем что юзер ещё не использовал ничей код
            cur.execute(
                "SELECT 1 FROM referral_invites WHERE invited_user_id=%s LIMIT 1",
                (uid,)
            )
            if cur.fetchone():
                return err('Ты уже использовал промокод раньше', 400)
            # Акция: с 23.06.2026 пригласившему дополнительно +100 ЗНАЕК за друга
            promo_on = promo_active()
            invite_znaika = PROMO_INVITE_ZNAIKA if promo_on else 0
            # Записываем приглашение (с флагом о начислении знаек за приглашение)
            cur.execute(
                "INSERT INTO referral_invites "
                "(inviter_user_id, invited_user_id, code_used, znaika_invite_awarded) "
                "VALUES (%s, %s, %s, %s)",
                (owner_uid, uid, code, promo_on)
            )
            cur.execute(
                "UPDATE referral_codes SET invited_count = invited_count + 1, "
                "rewards_earned_days = rewards_earned_days + 7 WHERE user_id=%s",
                (owner_uid,)
            )
            if invite_znaika:
                credit_znaika(cur, owner_uid, invite_znaika, 'referral',
                              description='Бонус за приглашённого друга')
            # Уведомление обоим
            inviter_body = (
                f'Тебе начислено +7 дней подписки и +{invite_znaika} ЗНАЕК. '
                f'А если друг купит курс — получишь ещё +{PROMO_PURCHASE_ZNAIKA} ЗНАЕК!'
                if invite_znaika else
                'Тебе начислено +7 дней подписки. Продолжай приглашать друзей.'
            )
            cur.execute(
                "INSERT INTO notifications (user_id, kind, title, body, icon, url) VALUES "
                "(%s, 'referral', %s, %s, 'Gift', '/referral'), "
                "(%s, 'referral', %s, %s, 'Gift', '/referral')",
                (
                    owner_uid,
                    'Новый друг по твоему промокоду!',
                    inviter_body,
                    uid,
                    'Промокод применён',
                    'Тебе начислено +7 дней подписки. Приятной учёбы!',
                )
            )
            conn.commit()
            return ok({'ok': True, 'bonus_days': 7, 'inviter_znaika': invite_znaika})
    finally:
        conn.close()


def handle_invited_list(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            cur.execute(
                "SELECT ri.invited_user_id, COALESCE(u.name, 'Друг'), ri.created_at "
                "FROM referral_invites ri "
                "LEFT JOIN auth_users u ON u.id = ri.invited_user_id "
                "WHERE ri.inviter_user_id=%s ORDER BY ri.created_at DESC LIMIT 50",
                (uid,)
            )
            items = [
                {'user_id': r[0], 'name': r[1], 'joined_at': r[2].isoformat() if r[2] else None}
                for r in cur.fetchall()
            ]
            return ok({'items': items, 'total': len(items)})
    finally:
        conn.close()


def handle_promo_track(body: dict) -> dict:
    promo = (body.get('promo') or 'dobro').strip()[:40] or 'dobro'
    event_type = (body.get('event') or '').strip()[:20]
    if event_type not in ('share', 'visit'):
        return err('Неверный тип события', 400)
    channel = (body.get('channel') or '').strip()[:20] or None
    ref_code = (body.get('ref') or '').strip().upper()[:40] or None
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO promo_shares (promo, event, channel, ref_code) "
                "VALUES (%s, %s, %s, %s)",
                (promo, event_type, channel, ref_code)
            )
            conn.commit()
            return ok({'ok': True})
    finally:
        conn.close()


def compute_surge(cur, promo: str) -> dict:
    """Определяет всплеск переходов: визиты за последний час против среднечасового
    за предыдущие 24 часа. Всплеск, если за час >= 5 переходов и >= 3x от среднего."""
    cur.execute(
        "SELECT COUNT(*) FROM promo_shares "
        "WHERE promo=%s AND event='visit' AND created_at >= NOW() - INTERVAL '1 hour'",
        (promo,)
    )
    last_hour = cur.fetchone()[0]
    cur.execute(
        "SELECT COUNT(*) FROM promo_shares "
        "WHERE promo=%s AND event='visit' "
        "AND created_at >= NOW() - INTERVAL '25 hours' "
        "AND created_at < NOW() - INTERVAL '1 hour'",
        (promo,)
    )
    prev_24 = cur.fetchone()[0]
    avg_hour = prev_24 / 24.0 if prev_24 else 0.0
    active = last_hour >= 5 and (avg_hour == 0 or last_hour >= avg_hour * 3)
    return {
        'active': active,
        'last_hour': last_hour,
        'avg_hour': round(avg_hour, 1),
    }


def handle_promo_stats(qs: dict) -> dict:
    promo = (qs.get('promo') or 'dobro').strip()[:40] or 'dobro'
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT event, COALESCE(channel, 'direct'), COUNT(*) "
                "FROM promo_shares WHERE promo=%s GROUP BY event, channel",
                (promo,)
            )
            shares = {}
            visits = {}
            total_shares = 0
            total_visits = 0
            for ev, ch, cnt in cur.fetchall():
                if ev == 'share':
                    shares[ch] = cnt
                    total_shares += cnt
                else:
                    visits[ch] = cnt
                    total_visits += cnt
            surge = compute_surge(cur, promo)
            return ok({
                'promo': promo,
                'total_shares': total_shares,
                'total_visits': total_visits,
                'shares_by_channel': shares,
                'visits_by_channel': visits,
                'surge': surge,
            })
    finally:
        conn.close()


def handle_referral_promo_stats() -> dict:
    """Счётчик акции «Приведи друга»: сколько ЗНАЕК начислено за приглашения
    и за покупки друзей. Для админ-панели «Маркетинг»."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT "
                "COALESCE(SUM(amount) FILTER (WHERE reason='referral' "
                "  AND description='Бонус за приглашённого друга'), 0), "
                "COUNT(*) FILTER (WHERE reason='referral' "
                "  AND description='Бонус за приглашённого друга'), "
                "COALESCE(SUM(amount) FILTER (WHERE reason='referral_purchase'), 0), "
                "COUNT(*) FILTER (WHERE reason='referral_purchase') "
                "FROM znaika_transactions WHERE kind='earn'"
            )
            r = cur.fetchone()
            invite_znaika, invite_count, purchase_znaika, purchase_count = (
                int(r[0]), int(r[1]), int(r[2]), int(r[3]))
            return ok({
                'active': promo_active(),
                'start_date': '2026-06-23',
                'invite_znaika': invite_znaika,
                'invite_count': invite_count,
                'purchase_znaika': purchase_znaika,
                'purchase_count': purchase_count,
                'total_znaika': invite_znaika + purchase_znaika,
                'reward_invite': PROMO_INVITE_ZNAIKA,
                'reward_purchase': PROMO_PURCHASE_ZNAIKA,
            })
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Реферальная программа УЧИСЬПРО."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'my_code').strip()
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}

    if action == 'my_code':
        return handle_my_code(token)
    if action == 'use_code' and method == 'POST':
        return handle_use_code(token, body)
    if action == 'invited_list':
        return handle_invited_list(token)
    if action == 'promo_track' and method == 'POST':
        return handle_promo_track(body)
    if action == 'promo_stats':
        return handle_promo_stats(qs)
    if action == 'referral_promo_stats':
        return handle_referral_promo_stats()

    return err('Неизвестное действие', 404)