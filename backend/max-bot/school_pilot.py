"""Приветствие директора школы в MAX: пилотный проект УЧИСЬПРО.

Директор открывает https://max.ru/<бот>?start=pilot_<источник>[_<город>] или пишет /pilot —
бот отвечает приветствием с кнопками «Подключить школу» и «Презентация для директора».
Ссылку публикуем в письмах, на сайте и отправляем директорам лично.
"""
import re

from daily import send

SITE = 'https://xn--h1amcedk2a6b.xn--p1ai'

WELCOME = (
    "Здравствуйте{name}! Это УЧИСЬПРО — образовательная платформа с ИИ-наставником для школьников.\n\n"
    "В 2026/27 учебном году мы проводим пилотный проект для школ: все ученики вашей школы получают "
    "бесплатный доступ до 31 мая 2027 года.\n\n"
    "Что получают ученики:\n"
    "• ИИ-наставник по школьным предметам 24/7 — объясняет тему и подводит к ответу наводящими вопросами, "
    "а не выдаёт готовое решение;\n"
    "• разбор домашнего задания по фото — по шагам;\n"
    "• курсы 1–11 класса и подготовка к ОГЭ и ЕГЭ.\n\n"
    "Для школы — бесплатно: без договоров, закупок и нагрузки на учителей.\n\n"
    "Подключение — 1 минута. Сразу после него вы получите:\n"
    "• ссылку и QR-код для учеников вашей школы;\n"
    "• готовые тексты для чатов учеников и родителей, памятку для печати;\n"
    "• страницу, где видно, сколько учеников подключилось — по классам.\n\n"
    "Нажмите «Подключить школу» ниже. Есть вопросы — напишите их сюда, ответим в рабочее время."
)


def _slug(source: str) -> tuple:
    """pilot_letter_kazan → ('letter', 'kazan'); pilot → ('max', '')."""
    parts = [p for p in re.sub(r'[^a-z0-9_\-]', '', source.lower()).split('_') if p][1:]
    src = parts[0] if parts else 'direct'
    city = '-'.join(parts[1:]) if len(parts) > 1 else ''
    return src[:30], city[:60]


def join_url(source: str) -> str:
    src, city = _slug(source)
    q = f"?src=max_{src}" + (f"&city={city}" if city else '')
    return f'{SITE}/podklyuchit-shkolu{q}'


def is_pilot(text_or_payload: str) -> bool:
    low = (text_or_payload or '').lower().strip()
    return low.startswith('pilot') or low.startswith('/start pilot') or low in ('/pilot', 'пилот', '/school', 'школа')


def start(conn, user: dict, source: str):
    uid = int(user.get('user_id') or 0)
    if not uid:
        return
    name = (user.get('first_name') or user.get('name') or '').split()
    hello = WELCOME.format(name=f', {name[0]}' if name else '')
    src, city = _slug(source)
    deck = f'{SITE}/for-schools/presentation' + (f'/{city}' if city else '')
    send(uid, hello, [
        [{'type': 'link', 'text': 'Подключить школу — 1 минута', 'url': join_url(source)}],
        [{'type': 'link', 'text': 'Презентация для директора', 'url': deck}],
    ])
    print(f'[pilot] welcome uid={uid} src={src} city={city}')
