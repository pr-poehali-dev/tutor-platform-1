"""
Ежедневный бэкап критичных таблиц в S3.

Запускается раз в сутки cron'ом.
- Дампит таблицы в JSONL (одна строка = одна запись)
- Сжимает gzip
- Загружает в S3 по пути backups/YYYY-MM-DD/{table}.jsonl.gz
- Записывает метаданные в daily_backups
- Удаляет бэкапы старше 30 дней (retention)
- При ошибке создаёт алерт в system_alerts

GET /?action=run         — запустить полный бэкап (для cron)
GET /?action=list        — последние 30 бэкапов
"""
import gzip
import io
import json
import os
from datetime import datetime, date, timezone, timedelta
import boto3
import psycopg2

# Критичные таблицы: их потеря = катастрофа
CRITICAL_TABLES = [
    'auth_users',
    'auth_sessions',
    'user_my_courses',
    'user_stats',
    'user_badges',
    'orders',
    'order_items',
    'course_purchases',
    'subscriptions',
    'feed_articles',
    'feed_demo_pool',
    'reviews',
    'feedback_requests',
    'referral_codes',
    'referral_invites',
    'know_yourself_results',
    'exam_checklist_progress',
    'exam_profile',
    'kids_progress',
    'kids_parent_controls',
    'parent_child_links',
    'mgu_consultations',
    'course_lesson_progress',
    'completed_tasks',
    'user_course_history',
]

RETENTION_DAYS = 30
BUCKET = 'files'


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


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def json_default(o):
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    if isinstance(o, (bytes, bytearray)):
        return o.decode('utf-8', errors='replace')
    return str(o)


def backup_table(cur, s3, table: str, today_str: str) -> dict:
    """Дампит таблицу в S3. Возвращает метрики."""
    # Достаём колонки и строки
    cur.execute(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name = %s ORDER BY ordinal_position",
        (table,)
    )
    cols = [r[0] for r in cur.fetchall()]
    if not cols:
        return {'table': table, 'status': 'error', 'error': 'table not found',
                'row_count': 0, 'bytes_size': 0}

    # Безопасно: имена колонок берём только из information_schema (это identifiers)
    col_list = ', '.join(f'"{c}"' for c in cols)
    cur.execute(f'SELECT {col_list} FROM "{table}"')  # noqa: S608

    buf = io.BytesIO()
    with gzip.GzipFile(fileobj=buf, mode='wb', compresslevel=6) as gz:
        row_count = 0
        for row in cur:
            row_dict = dict(zip(cols, row))
            line = json.dumps(row_dict, ensure_ascii=False, default=json_default) + '\n'
            gz.write(line.encode('utf-8'))
            row_count += 1

    data = buf.getvalue()
    key = f'backups/{today_str}/{table}.jsonl.gz'
    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=data,
        ContentType='application/gzip',
    )
    cdn_url = (f"https://cdn.poehali.dev/projects/"
               f"{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}")

    return {'table': table, 'status': 'ok', 'row_count': row_count,
            'bytes_size': len(data), 's3_url': cdn_url, 's3_key': key}


def delete_old_backups(cur, s3) -> int:
    """Удаляет бэкапы старше RETENTION_DAYS."""
    cutoff = (datetime.now(timezone.utc).date() -
              timedelta(days=RETENTION_DAYS))
    cur.execute(
        "SELECT id, s3_url FROM daily_backups WHERE backup_date < %s",
        (cutoff,)
    )
    old = cur.fetchall()
    deleted = 0
    for bid, url in old:
        # Достаём S3 key из CDN URL
        try:
            key = url.split('/bucket/', 1)[1] if '/bucket/' in url else None
            if key:
                s3.delete_object(Bucket=BUCKET, Key=key)
        except (KeyError, ValueError):
            pass
        cur.execute("DELETE FROM daily_backups WHERE id = %s", (bid,))
        deleted += 1
    return deleted


def handle_run() -> dict:
    """Полный ежедневный бэкап."""
    conn = get_db()
    today = datetime.now(timezone.utc).date()
    today_str = today.isoformat()
    try:
        with conn.cursor() as cur:
            # Защита: если за сегодня уже всё забэкаплено — пропускаем
            cur.execute(
                "SELECT COUNT(*) FROM daily_backups "
                "WHERE backup_date = %s AND status = 'ok'",
                (today,)
            )
            already_done = cur.fetchone()[0]
            if already_done >= len(CRITICAL_TABLES):
                return ok({'ok': True, 'skipped': True,
                           'reason': 'today backups already done',
                           'count': already_done})

            s3 = get_s3()
            results = []
            ok_count = 0
            fail_count = 0
            total_bytes = 0

            for tbl in CRITICAL_TABLES:
                # Если конкретно эта таблица сегодня уже забэкаплена — пропускаем
                cur.execute(
                    "SELECT 1 FROM daily_backups "
                    "WHERE backup_date=%s AND table_name=%s AND status='ok' LIMIT 1",
                    (today, tbl)
                )
                if cur.fetchone():
                    continue

                try:
                    res = backup_table(cur, s3, tbl, today_str)
                    if res['status'] == 'ok':
                        cur.execute(
                            "INSERT INTO daily_backups "
                            "(backup_date, table_name, s3_url, row_count, bytes_size, status) "
                            "VALUES (%s, %s, %s, %s, %s, 'ok') "
                            "ON CONFLICT (backup_date, table_name) DO UPDATE "
                            "SET s3_url=EXCLUDED.s3_url, row_count=EXCLUDED.row_count, "
                            "bytes_size=EXCLUDED.bytes_size, status='ok', error_message=NULL",
                            (today, tbl, res['s3_url'], res['row_count'], res['bytes_size'])
                        )
                        ok_count += 1
                        total_bytes += res['bytes_size']
                    else:
                        cur.execute(
                            "INSERT INTO daily_backups "
                            "(backup_date, table_name, s3_url, row_count, bytes_size, "
                            "status, error_message) VALUES (%s,%s,'',0,0,'error',%s) "
                            "ON CONFLICT (backup_date, table_name) DO UPDATE "
                            "SET status='error', error_message=EXCLUDED.error_message",
                            (today, tbl, res.get('error', 'unknown')[:500])
                        )
                        fail_count += 1
                    conn.commit()
                    results.append(res)
                except (psycopg2.Error, OSError, ValueError) as e:
                    conn.rollback()
                    cur.execute(
                        "INSERT INTO daily_backups "
                        "(backup_date, table_name, s3_url, row_count, bytes_size, "
                        "status, error_message) VALUES (%s,%s,'',0,0,'error',%s) "
                        "ON CONFLICT (backup_date, table_name) DO UPDATE "
                        "SET status='error', error_message=EXCLUDED.error_message",
                        (today, tbl, str(e)[:500])
                    )
                    conn.commit()
                    results.append({'table': tbl, 'status': 'error', 'error': str(e)[:200]})
                    fail_count += 1

            # Retention: удаляем старые бэкапы
            deleted_old = delete_old_backups(cur, s3)
            conn.commit()

            # Алерт если что-то упало
            if fail_count > 0:
                cur.execute(
                    "INSERT INTO system_alerts "
                    "(source, severity, event_type, title, body, metadata) "
                    "VALUES ('db-backup', 'warning', 'backup_partial_failure', %s, %s, %s)",
                    (f'Ежедневный бэкап: {fail_count} ошибок',
                     f'Успешно: {ok_count}, с ошибками: {fail_count}. '
                     f'Подробности в daily_backups.',
                     json.dumps({'date': today_str, 'ok': ok_count,
                                 'fail': fail_count}, ensure_ascii=False))
                )
                conn.commit()

            return ok({
                'ok': True,
                'date': today_str,
                'tables_total': len(CRITICAL_TABLES),
                'success': ok_count,
                'failed': fail_count,
                'total_bytes': total_bytes,
                'deleted_old': deleted_old,
                'results': results,
            })
    finally:
        conn.close()


def handle_list() -> dict:
    """Последние 50 бэкапов по дате."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT backup_date, "
                "COUNT(*) FILTER (WHERE status='ok') AS ok_count, "
                "COUNT(*) FILTER (WHERE status='error') AS fail_count, "
                "SUM(bytes_size) AS total_bytes, "
                "SUM(row_count) AS total_rows, "
                "MAX(created_at) AS done_at "
                "FROM daily_backups "
                "GROUP BY backup_date ORDER BY backup_date DESC LIMIT 30"
            )
            items = [
                {
                    'date': r[0].isoformat() if r[0] else None,
                    'ok_count': r[1], 'fail_count': r[2],
                    'total_bytes': int(r[3] or 0),
                    'total_rows': int(r[4] or 0),
                    'done_at': r[5].isoformat() if r[5] else None,
                }
                for r in cur.fetchall()
            ]
            return ok({'items': items, 'count': len(items)})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Ежедневный автономный бэкап критичных таблиц в S3."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'list').strip()

    if action == 'run':
        return handle_run()
    if action == 'list':
        return handle_list()
    return err('Неизвестное действие', 404)
