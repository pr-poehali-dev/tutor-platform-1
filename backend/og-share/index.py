"""
OG-превью для соцсетей (VK, Telegram, WhatsApp и т.д.).
Боты соцсетей не исполняют JavaScript и не видят мета-теги SPA.
Эта функция отдаёт ботам готовый HTML с Open Graph тегами,
а живых пользователей перенаправляет на нужную страницу сайта.

GET /?page=dobro  — превью акции ДОБРО
"""
import json

SITE = 'https://xn--h1agdcde2c.xn--p1ai'

# Карточки превью для каждой промо-страницы
PAGES = {
    'dobro': {
        'url': f'{SITE}/promo/dobro',
        'title': 'Акция ДОБРО — учись бесплатно до 15 июня 2026 · УЧИСЬПРО',
        'description': 'С 28 мая по 15 июня 2026 платежи на паузе. Полный доступ ко всем курсам, ИИ-репетитору и подготовке к ЕГЭ — бесплатно для каждого школьника.',
        'image': 'https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/46b6c1c6-3ba8-49a9-a61c-ecadaca3d8a1.jpg',
    },
}

DEFAULT = {
    'url': SITE,
    'title': 'УЧИСЬПРО — ИИ-репетитор для школьников 24/7',
    'description': 'Персональный ИИ-репетитор: голосовые уроки, подготовка к ЕГЭ и ОГЭ. Первый урок бесплатно.',
    'image': 'https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg',
}

# Юзер-агенты ботов соцсетей, которым нужно отдать HTML с мета-тегами
BOT_MARKERS = (
    'vkshare', 'vkbot', 'vk.com', 'mail.ru', 'telegrambot', 'telegram',
    'whatsapp', 'viber', 'facebookexternalhit', 'facebot', 'twitterbot',
    'discordbot', 'skypeuripreview', 'slackbot', 'linkedinbot', 'pinterest',
    'googlebot', 'yandex', 'bingbot', 'developers.google.com',
)


def esc(s: str) -> str:
    return (s.replace('&', '&amp;').replace('<', '&lt;')
             .replace('>', '&gt;').replace('"', '&quot;'))


def render_html(p: dict) -> str:
    t, d, img, url = esc(p['title']), esc(p['description']), esc(p['image']), esc(p['url'])
    return (
        '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/>'
        '<meta name="viewport" content="width=device-width, initial-scale=1"/>'
        f'<title>{t}</title>'
        f'<meta name="description" content="{d}"/>'
        '<meta property="og:type" content="website"/>'
        '<meta property="og:site_name" content="УЧИСЬПРО"/>'
        '<meta property="og:locale" content="ru_RU"/>'
        f'<meta property="og:title" content="{t}"/>'
        f'<meta property="og:description" content="{d}"/>'
        f'<meta property="og:url" content="{url}"/>'
        f'<meta property="og:image" content="{img}"/>'
        f'<meta property="og:image:secure_url" content="{img}"/>'
        '<meta property="og:image:type" content="image/jpeg"/>'
        '<meta property="og:image:width" content="1024"/>'
        '<meta property="og:image:height" content="1024"/>'
        f'<meta property="og:image:alt" content="{t}"/>'
        f'<meta property="vk:image" content="{img}"/>'
        '<meta name="twitter:card" content="summary_large_image"/>'
        f'<meta name="twitter:title" content="{t}"/>'
        f'<meta name="twitter:description" content="{d}"/>'
        f'<meta name="twitter:image" content="{img}"/>'
        f'<link rel="canonical" href="{url}"/>'
        f'<meta http-equiv="refresh" content="0; url={url}"/>'
        f'</head><body><a href="{url}">{t}</a>'
        f'<script>location.replace("{url}");</script>'
        '</body></html>'
    )


def handler(event: dict, context) -> dict:
    """Отдаёт ботам соцсетей HTML с OG-тегами, людей редиректит на страницу."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    qs = event.get('queryStringParameters') or {}
    page_key = (qs.get('page') or 'dobro').strip().lower()
    page = PAGES.get(page_key, DEFAULT)

    headers = event.get('headers') or {}
    ua = ''
    for k, v in headers.items():
        if k.lower() == 'user-agent':
            ua = (v or '').lower()
            break

    is_bot = any(marker in ua for marker in BOT_MARKERS)

    # Живых пользователей — сразу редиректим на саму страницу сайта (там работает SPA)
    if not is_bot:
        return {
            'statusCode': 302,
            'headers': {
                'Location': page['url'],
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
            },
            'body': '',
        }

    # Ботам соцсетей — HTML с правильными OG-тегами
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
        },
        'body': render_html(page),
        'isBase64Encoded': False,
    }
