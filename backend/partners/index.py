"""
Партнёрская программа сетевого типа (3 линии, 20 / 10 / 5 %).

GET  /?action=me                X-Auth-Token -> статус партнёра, баланс, структура
POST /?action=activate          X-Auth-Token -> стать партнёром
POST /?action=save_payout       X-Auth-Token body: {method, details}
POST /?action=request_payout    X-Auth-Token body: {amount_rub}
GET  /?action=commissions       X-Auth-Token -> последние начисления
GET  /?action=structure         X-Auth-Token -> кто в структуре по линиям

Начисление комиссий живёт в backend/access (там, где подтверждаются платежи).
Здесь — только кабинет партнёра и вывод денег.
"""
import json
import os
from datetime import datetime, timezone
import psycopg2

# Ставки по линиям — ДОЛЖНЫ совпадать с PARTNER_LINE_PERCENT в backend/access.
LINE_PERCENT = {1: 20.0, 2: 10.0, 3: 5.0}

# Минимальная сумма вывода — 1000 ₽.
MIN_PAYOUT_KOPECKS = 100000

SITE_BASE = 'https://xn--h1amcedk2a6b.xn--p1ai'


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


def get_partner(cur, user_id: int):
    cur.execute(
        "SELECT id, status, balance_kopecks, total_earned_kopecks, "
        "payout_method, payout_details, activated_at "
        "FROM partners WHERE user_id = %s LIMIT 1",
        (user_id,)
    )
    return cur.fetchone()


def get_ref_code(cur, user_id: int):
    """Партнёрская ссылка строится на том же коде, что и реферальная.

    Отдельный «партнёрский код» заводить не стали: у пользователя уже есть
    код в referral_codes, и раздваивать их — значит ломать уже разосланные
    ссылки и путать самого партнёра.
    """
    cur.execute("SELECT code FROM referral_codes WHERE user_id = %s LIMIT 1", (user_id,))
    row = cur.fetchone()
    return row[0] if row else None


def handle_me(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)

            partner = get_partner(cur, uid)
            code = get_ref_code(cur, uid)

            if not partner:
                return ok({
                    'is_partner': False,
                    'code': code,
                    'share_link': f'{SITE_BASE}/?ref={code}' if code else None,
                    'line_percent': LINE_PERCENT,
                    'min_payout_rub': MIN_PAYOUT_KOPECKS // 100,
                })

            pid, status, balance, total, method, details, activated = partner

            # Размер структуры по линиям.
            cur.execute(
                "SELECT line, COUNT(DISTINCT source_user_id) "
                "FROM partner_commissions WHERE partner_id = %s GROUP BY line",
                (pid,)
            )
            buyers_by_line = {int(r[0]): int(r[1]) for r in cur.fetchall()}

            # Сколько человек лично приглашено (1-я линия структуры).
            cur.execute(
                "SELECT COUNT(*) FROM referral_invites WHERE inviter_user_id = %s",
                (uid,)
            )
            invited_count = int(cur.fetchone()[0])

            cur.execute(
                "SELECT COALESCE(SUM(amount_kopecks), 0) FROM partner_payouts "
                "WHERE partner_id = %s AND status = 'requested'",
                (pid,)
            )
            pending_payout = int(cur.fetchone()[0])

            return ok({
                'is_partner': True,
                'status': status,
                'code': code,
                'share_link': f'{SITE_BASE}/?ref={code}' if code else None,
                'balance_rub': round(balance / 100, 2),
                'total_earned_rub': round(total / 100, 2),
                'pending_payout_rub': round(pending_payout / 100, 2),
                'invited_count': invited_count,
                'buyers_by_line': buyers_by_line,
                'payout_method': method,
                'payout_details': details,
                'activated_at': activated.isoformat() if activated else None,
                'line_percent': LINE_PERCENT,
                'min_payout_rub': MIN_PAYOUT_KOPECKS // 100,
            })
    finally:
        conn.close()


def handle_activate(token: str) -> dict:
    """Активирует статус партнёра.

    Родителя в дереве определяем по referral_invites: если пользователя
    кто-то пригласил и тот человек — партнёр, встаём под него.
    """
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)

            if get_partner(cur, uid):
                return ok({'ok': True, 'already': True})

            parent_partner_id = None
            cur.execute(
                "SELECT inviter_user_id FROM referral_invites WHERE invited_user_id = %s LIMIT 1",
                (uid,)
            )
            row = cur.fetchone()
            if row:
                cur.execute(
                    "SELECT id FROM partners WHERE user_id = %s AND status = 'active' LIMIT 1",
                    (row[0],)
                )
                p = cur.fetchone()
                if p:
                    parent_partner_id = p[0]

            cur.execute(
                "INSERT INTO partners (user_id, parent_partner_id) VALUES (%s, %s) "
                "ON CONFLICT (user_id) DO NOTHING RETURNING id",
                (uid, parent_partner_id)
            )
            created = cur.fetchone()

            # Код для ссылки — тот же, что в реферальной программе.
            if not get_ref_code(cur, uid):
                import secrets
                for _ in range(8):
                    candidate = secrets.token_urlsafe(6).upper().replace('_', 'X').replace('-', '0')[:8]
                    cur.execute("SELECT 1 FROM referral_codes WHERE code=%s", (candidate,))
                    if not cur.fetchone():
                        cur.execute(
                            "INSERT INTO referral_codes (user_id, code) VALUES (%s, %s) "
                            "ON CONFLICT DO NOTHING",
                            (uid, candidate)
                        )
                        break

            cur.execute(
                "INSERT INTO notifications (user_id, kind, title, body, icon, url) "
                "VALUES (%s, 'partner', %s, %s, 'Handshake', '/partner')",
                (uid, 'Вы стали партнёром',
                 'Делитесь своей ссылкой — получайте 20% с личных приглашений '
                 'и 10% / 5% со второй и третьей линии.')
            )
            conn.commit()
            return ok({'ok': True, 'already': not created, 'code': get_ref_code(cur, uid)})
    finally:
        conn.close()


def handle_save_payout(token: str, body: dict) -> dict:
    method = (body.get('method') or '').strip().lower()
    details = (body.get('details') or '').strip()[:200]
    if method not in ('card', 'sbp'):
        return err('Выберите способ выплаты: карта или СБП', 400)
    if len(details) < 8:
        return err('Укажите номер карты или телефон для СБП', 400)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            cur.execute(
                "UPDATE partners SET payout_method = %s, payout_details = %s, updated_at = NOW() "
                "WHERE user_id = %s RETURNING id",
                (method, details, uid)
            )
            if not cur.fetchone():
                return err('Сначала активируйте статус партнёра', 400)
            conn.commit()
            return ok({'ok': True})
    finally:
        conn.close()


def handle_request_payout(token: str, body: dict) -> dict:
    try:
        amount_rub = float(body.get('amount_rub') or 0)
    except (TypeError, ValueError):
        return err('Некорректная сумма', 400)
    amount_kopecks = int(round(amount_rub * 100))

    if amount_kopecks < MIN_PAYOUT_KOPECKS:
        return err(f'Минимальная сумма вывода — {MIN_PAYOUT_KOPECKS // 100} ₽', 400)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)

            partner = get_partner(cur, uid)
            if not partner:
                return err('Сначала активируйте статус партнёра', 400)
            pid, status, balance, _total, method, details, _act = partner

            if status != 'active':
                return err('Статус партнёра приостановлен', 403)
            if not method or not details:
                return err('Сначала укажите реквизиты для выплаты', 400)
            if amount_kopecks > balance:
                return err('На балансе недостаточно средств', 400)

            # Деньги списываем сразу, чтобы нельзя было заказать вывод дважды.
            cur.execute(
                "UPDATE partners SET balance_kopecks = balance_kopecks - %s, updated_at = NOW() "
                "WHERE id = %s AND balance_kopecks >= %s RETURNING balance_kopecks",
                (amount_kopecks, pid, amount_kopecks)
            )
            if not cur.fetchone():
                return err('На балансе недостаточно средств', 400)

            cur.execute(
                "INSERT INTO partner_payouts (partner_id, amount_kopecks, method, details) "
                "VALUES (%s, %s, %s, %s) RETURNING id",
                (pid, amount_kopecks, method, details)
            )
            payout_id = cur.fetchone()[0]
            conn.commit()
            return ok({'ok': True, 'payout_id': payout_id,
                       'amount_rub': round(amount_kopecks / 100, 2)})
    finally:
        conn.close()


def handle_commissions(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            partner = get_partner(cur, uid)
            if not partner:
                return ok({'items': []})
            pid = partner[0]
            cur.execute(
                "SELECT pc.line, pc.percent, pc.amount_kopecks, pc.source_kind, "
                "pc.created_at, COALESCE(u.name, 'Пользователь') "
                "FROM partner_commissions pc "
                "LEFT JOIN auth_users u ON u.id = pc.source_user_id "
                "WHERE pc.partner_id = %s ORDER BY pc.created_at DESC LIMIT 50",
                (pid,)
            )
            items = [{
                'line': int(r[0]),
                'percent': float(r[1]),
                'amount_rub': round(int(r[2]) / 100, 2),
                'source_kind': r[3],
                'created_at': r[4].isoformat() if r[4] else None,
                'from_name': r[5],
            } for r in cur.fetchall()]
            return ok({'items': items})
    finally:
        conn.close()


def handle_structure(token: str) -> dict:
    """Кто в структуре партнёра по линиям — имена и дата присоединения."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)

            lines = {1: [], 2: [], 3: []}
            current_ids = [uid]
            for line in (1, 2, 3):
                if not current_ids:
                    break
                cur.execute(
                    "SELECT ri.invited_user_id, COALESCE(u.name, 'Пользователь'), ri.created_at "
                    "FROM referral_invites ri "
                    "LEFT JOIN auth_users u ON u.id = ri.invited_user_id "
                    "WHERE ri.inviter_user_id = ANY(%s) "
                    "ORDER BY ri.created_at DESC LIMIT 200",
                    (current_ids,)
                )
                rows = cur.fetchall()
                lines[line] = [{
                    'name': r[1],
                    'joined_at': r[2].isoformat() if r[2] else None,
                } for r in rows]
                current_ids = [r[0] for r in rows]

            return ok({
                'lines': {str(k): v for k, v in lines.items()},
                'counts': {str(k): len(v) for k, v in lines.items()},
            })
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Партнёрская программа: кабинет, структура, начисления и выплаты."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'me').strip()
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}

    try:
        if action == 'me':
            return handle_me(token)
        if action == 'activate' and method == 'POST':
            return handle_activate(token)
        if action == 'save_payout' and method == 'POST':
            return handle_save_payout(token, body)
        if action == 'request_payout' and method == 'POST':
            return handle_request_payout(token, body)
        if action == 'commissions':
            return handle_commissions(token)
        if action == 'structure':
            return handle_structure(token)
        return err('Unknown action', 404)
    except psycopg2.Error as e:
        print(f'[partners] DB error: {str(e)[:500]}')
        return err('Сервис временно недоступен', 500)
