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
from datetime import datetime, timezone
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
            # Записываем
            cur.execute(
                "INSERT INTO referral_invites (inviter_user_id, invited_user_id, code_used) "
                "VALUES (%s, %s, %s)",
                (owner_uid, uid, code)
            )
            cur.execute(
                "UPDATE referral_codes SET invited_count = invited_count + 1, "
                "rewards_earned_days = rewards_earned_days + 7 WHERE user_id=%s",
                (owner_uid,)
            )
            # Уведомление обоим
            cur.execute(
                "INSERT INTO notifications (user_id, kind, title, body, icon, url) VALUES "
                "(%s, 'referral', %s, %s, 'Gift', '/referral'), "
                "(%s, 'referral', %s, %s, 'Gift', '/referral')",
                (
                    owner_uid,
                    'Новый друг по твоему промокоду!',
                    'Тебе начислено +7 дней подписки. Продолжай приглашать друзей.',
                    uid,
                    'Промокод применён',
                    'Тебе начислено +7 дней подписки. Приятной учёбы!',
                )
            )
            conn.commit()
            return ok({'ok': True, 'bonus_days': 7})
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

    return err('Неизвестное действие', 404)