'''
Business: генерирует свежий sitemap.xml со всеми опубликованными статьями ленты из БД — чтобы поисковики индексировали новые статьи автоматически.
Args: event с httpMethod; context с request_id.
Returns: XML sitemap (Content-Type application/xml) со списком URL статей.
'''
import os
import json
from datetime import datetime, timezone

import psycopg2

# В sitemap.xml адреса обязаны быть в ASCII (RFC 3986): кириллический домен
# записывается в punycode. Для DNS и поисковиков это тот же самый учисьпро.рф,
# но робот больше не считает файл ошибочным.
SITE = 'https://xn--h1agdcde2c.xn--p1ai'
SCHEMA = 't_p78828167_tutor_platform_1'

# Публичные страницы сайта: (путь, частота обновления, приоритет).
# Личный кабинет, оплата и админка сюда намеренно не попадают.
STATIC_PAGES = [
    ('/', 'daily', '1.0'),
    ('/feed', 'daily', '0.9'),
    ('/courses', 'weekly', '0.9'),
    ('/free-courses', 'weekly', '0.9'),
    ('/order', 'weekly', '0.9'),
    ('/career-pro', 'weekly', '0.8'),
    ('/bizlab', 'weekly', '0.8'),
    ('/grants', 'daily', '0.8'),
    ('/fin-advisor', 'weekly', '0.8'),
    ('/business-coach', 'weekly', '0.8'),
    ('/exam-bank', 'weekly', '0.8'),
    ('/homework', 'weekly', '0.8'),
    ('/school', 'weekly', '0.7'),
    ('/for-schools', 'weekly', '0.7'),
    ('/for-business', 'weekly', '0.7'),
    ('/corporate', 'weekly', '0.7'),
    ('/kids', 'weekly', '0.7'),
    ('/znaika', 'weekly', '0.7'),
    ('/olympiad', 'weekly', '0.7'),
    ('/graduate', 'weekly', '0.7'),
    ('/silent', 'weekly', '0.7'),
    ('/draw', 'weekly', '0.7'),
    ('/intensive', 'weekly', '0.7'),
    ('/mini-course', 'weekly', '0.7'),
    ('/super-courses', 'weekly', '0.7'),
    ('/know-yourself', 'weekly', '0.7'),
    ('/exam-checklist', 'weekly', '0.7'),
    ('/score-calculator', 'weekly', '0.7'),
    ('/math-problems', 'weekly', '0.7'),
    ('/biology-problems', 'weekly', '0.7'),
    ('/chemistry-problems', 'weekly', '0.7'),
    ('/dictionary', 'weekly', '0.6'),
    ('/instrumenty-rukovoditelya', 'weekly', '0.7'),
    ('/for-managers', 'weekly', '0.6'),
    ('/remote-professions', 'weekly', '0.6'),
    ('/edtech-jobs', 'weekly', '0.6'),
    ('/tech-trends', 'weekly', '0.6'),
    ('/psychology', 'weekly', '0.6'),
    ('/klinicheskiy-psiholog', 'weekly', '0.6'),
    ('/nlp-master', 'weekly', '0.6'),
    ('/personal-brand', 'weekly', '0.6'),
    ('/writing-craft', 'weekly', '0.6'),
    ('/expert-content', 'weekly', '0.6'),
    ('/mgu-track', 'weekly', '0.6'),
    ('/tutor', 'weekly', '0.6'),
    ('/school-builder', 'weekly', '0.6'),
    ('/partners', 'monthly', '0.5'),
    ('/referral', 'monthly', '0.5'),
    ('/reviews', 'weekly', '0.6'),
    ('/help', 'monthly', '0.5'),
    ('/contacts', 'monthly', '0.5'),
    ('/app', 'monthly', '0.5'),
]
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

    for path, freq, prio in STATIC_PAGES:
        parts.append('  <url>')
        parts.append(f'    <loc>{SITE}{path}</loc>')
        parts.append(f'    <changefreq>{freq}</changefreq>')
        parts.append(f'    <priority>{prio}</priority>')
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