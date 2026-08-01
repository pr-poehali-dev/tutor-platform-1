'''
Business: генерирует свежий sitemap.xml со всеми опубликованными статьями ленты из БД — чтобы поисковики индексировали новые статьи автоматически.
Args: event с httpMethod; context с request_id.
Returns: XML sitemap (Content-Type application/xml) со списком URL статей.
'''
import os
import json
from datetime import datetime, timezone

import psycopg2

SITE = 'https://учисьпро.рф'
SCHEMA = 't_p78828167_tutor_platform_1'
# Динамический sitemap статей ленты для поисковиков (обновляется из БД автоматически).


def _xml_escape(s: str) -> str:
    return (
        s.replace('&', '&amp;')
         .replace('<', '&lt;')
         .replace('>', '&gt;')
         .replace('"', '&quot;')
         .replace("'", '&apos;')
    )


def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**cors, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    rows = []
    dsn = os.environ.get('DATABASE_URL')
    if dsn:
        conn = psycopg2.connect(dsn)
        try:
            cur = conn.cursor()
            cur.execute(
                f"SELECT slug, COALESCE(updated_at, published_at, created_at) "
                f"FROM {SCHEMA}.feed_articles "
                f"WHERE status = 'published' AND slug IS NOT NULL AND slug <> '' "
                f"ORDER BY COALESCE(published_at, created_at) DESC NULLS LAST"
            )
            rows = cur.fetchall()
            cur.close()
        finally:
            conn.close()

    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    parts.append('  <url>')
    parts.append(f'    <loc>{SITE}/feed</loc>')
    parts.append('    <changefreq>daily</changefreq>')
    parts.append('    <priority>0.8</priority>')
    parts.append('  </url>')

    for slug, dt in rows:
        if isinstance(dt, datetime):
            lastmod = dt.strftime('%Y-%m-%d')
        else:
            lastmod = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        loc = f'{SITE}/feed/{_xml_escape(str(slug))}'
        parts.append('  <url>')
        parts.append(f'    <loc>{loc}</loc>')
        parts.append(f'    <lastmod>{lastmod}</lastmod>')
        parts.append('    <changefreq>monthly</changefreq>')
        parts.append('    <priority>0.6</priority>')
        parts.append('  </url>')

    parts.append('</urlset>')
    body = '\n'.join(parts)

    return {
        'statusCode': 200,
        'headers': {
            **cors,
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
        'isBase64Encoded': False,
        'body': body,
    }