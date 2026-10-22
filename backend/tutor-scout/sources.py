"""Источники поиска репетиторов: ВКонтакте (официальный API), Яндекс Поиск API, каталоги каналов.
Каждый поиск возвращает список карточек одного формата."""
import base64
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

VK_API = 'https://api.vk.com/method/'
VK_V = '5.199'
YA_SEARCH = 'https://searchapi.api.cloud.yandex.net/v2/web/search'

PHONE_RE = re.compile(r'(?:\+7|8)[\s\-\(]*\d{3}[\s\-\)]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}')
EMAIL_RE = re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]{2,}')
TG_RE = re.compile(r'(?:https?://)?t\.me/[A-Za-z0-9_+/]{4,}')
MAX_RE = re.compile(r'(?:https?://)?max\.ru/[A-Za-z0-9_/\-]{4,}')


class SourceError(Exception):
    pass


def contacts_from(text: str) -> dict:
    text = text or ''
    phone = PHONE_RE.search(text)
    email = EMAIL_RE.search(text)
    msgr = TG_RE.search(text) or MAX_RE.search(text)
    return {'phone': phone.group(0).strip() if phone else None,
            'email': email.group(0) if email else None,
            'messenger': msgr.group(0) if msgr else None}


def card(source, kind, name, url, snippet='', subject=None, city=None, write_url=None, extra_text=''):
    c = contacts_from(f'{snippet} {extra_text}')
    return {'source': source, 'kind': kind, 'name': (name or '')[:300], 'url': url[:600],
            'snippet': (snippet or '')[:1200], 'subject': subject, 'city': city,
            'write_url': write_url or url, **c}


# ---------- ВКонтакте ----------

def vk(method: str, params: dict):
    token = os.environ.get('VK_ACCESS_TOKEN', '')
    if not token:
        raise SourceError('Не подключён ключ ВКонтакте (секрет VK_ACCESS_TOKEN)')
    q = urllib.parse.urlencode({**params, 'access_token': token, 'v': VK_V})
    try:
        with urllib.request.urlopen(VK_API + method + '?' + q, timeout=12) as r:
            data = json.loads(r.read().decode('utf-8'))
    except (urllib.error.URLError, TimeoutError) as e:
        raise SourceError(f'ВКонтакте не ответил: {type(e).__name__}')
    if 'error' in data:
        err = data['error']
        code = err.get('error_code')
        hint = {5: 'ключ недействителен или устарел — получите новый',
                15: 'ключу не хватает прав', 27: 'нужен ключ пользователя, а не сообщества',
                28: 'нужен ключ пользователя, а не приложения', 29: 'превышен дневной лимит запросов'}.get(code, '')
        raise SourceError(f"ВКонтакте: {err.get('error_msg', 'ошибка')} {('— ' + hint) if hint else ''}".strip())
    return data.get('response') or {}


def vk_people(query: str, city: str = '', count: int = 50):
    params = {'q': query, 'count': count, 'has_photo': 1,
              'fields': 'domain,city,status,site,activities,occupation,can_write_private_message,contacts'}
    if city:
        params['hometown'] = city
    res = vk('users.search', params)
    out = []
    for u in res.get('items', []):
        name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()
        about = ' · '.join(x for x in [u.get('status'), u.get('activities'),
                                         (u.get('occupation') or {}).get('name'), u.get('site')] if x)
        url = f"https://vk.com/{u.get('domain') or 'id' + str(u['id'])}"
        write = f"https://vk.com/write{u['id']}" if u.get('can_write_private_message') else url
        out.append(card('vk', 'person', name, url, about, city=(u.get('city') or {}).get('title'),
                        write_url=write, extra_text=f"{u.get('mobile_phone', '')}"))
    return out


def vk_groups(query: str, city: str = '', count: int = 50):
    res = vk('groups.search', {'q': f'{query} {city}'.strip(), 'count': count})
    ids = [str(g['id']) for g in res.get('items', [])]
    info = {}
    if ids:
        full = vk('groups.getById', {'group_ids': ','.join(ids), 'fields': 'description,members_count,city,site,contacts'})
        for g in (full.get('groups') if isinstance(full, dict) else full) or []:
            info[g['id']] = g
    out = []
    for g in res.get('items', []):
        gi = info.get(g['id'], g)
        desc = (gi.get('description') or '')[:900]
        members = gi.get('members_count')
        snippet = (f'{members} участников. ' if members else '') + desc
        url = f"https://vk.com/{g.get('screen_name') or 'club' + str(g['id'])}"
        out.append(card('vk', 'group', g.get('name'), url, snippet, city=(gi.get('city') or {}).get('title'),
                        write_url=f"https://vk.com/im?sel=-{g['id']}", extra_text=gi.get('site') or ''))
    return out


def vk_posts(query: str, city: str = '', count: int = 50):
    res = vk('newsfeed.search', {'q': f'{query} {city}'.strip(), 'count': count, 'extended': 1,
                                 'fields': 'domain,screen_name'})
    names = {}
    for p in res.get('profiles', []):
        names[p['id']] = (f"{p.get('first_name', '')} {p.get('last_name', '')}".strip(), p.get('domain') or f"id{p['id']}")
    for g in res.get('groups', []):
        names[-g['id']] = (g.get('name', ''), g.get('screen_name') or f"club{g['id']}")
    out = []
    for p in res.get('items', []):
        owner = p.get('from_id') or p.get('owner_id')
        name, domain = names.get(owner, ('', ''))
        url = f"https://vk.com/wall{p.get('owner_id')}_{p.get('id')}"
        write = f"https://vk.com/write{owner}" if owner and owner > 0 else f"https://vk.com/{domain}"
        out.append(card('vk', 'post', name or 'Пост ВКонтакте', url, p.get('text', ''), write_url=write))
    return out


# ---------- Яндекс Поиск API ----------

def _xml_text(el) -> str:
    return re.sub(r'\s+', ' ', ''.join(el.itertext())).strip() if el is not None else ''


def yandex_web(query: str, pages: int = 1):
    key = os.environ.get('YANDEX_SEARCH_API_KEY', '')
    folder = os.environ.get('YANDEX_FOLDER_ID', '')
    if not key or not folder:
        raise SourceError('Не подключён поиск Яндекса (секреты YANDEX_SEARCH_API_KEY и YANDEX_FOLDER_ID)')
    out = []
    for page in range(pages):
        body = {'query': {'searchType': 'SEARCH_TYPE_RU', 'queryText': query, 'page': str(page),
                          'familyMode': 'FAMILY_MODE_MODERATE'},
                'folderId': folder, 'responseFormat': 'FORMAT_XML', 'l10n': 'LOCALIZATION_RU',
                'groupSpec': {'groupMode': 'GROUP_MODE_DEEP', 'groupsOnPage': '50', 'docsInGroup': '1'},
                'maxPassages': '3'}
        req = urllib.request.Request(YA_SEARCH, data=json.dumps(body).encode(), method='POST',
                                     headers={'Authorization': f'Api-Key {key}', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            detail = e.read().decode('utf-8', 'ignore')[:200]
            hint = ' — у ключа нет роли search-api.webSearch.user' if e.code in (401, 403) else ''
            raise SourceError(f'Яндекс Поиск: ошибка {e.code}{hint}. {detail}')
        except (urllib.error.URLError, TimeoutError) as e:
            raise SourceError(f'Яндекс Поиск не ответил: {type(e).__name__}')
        raw = base64.b64decode(data.get('rawData') or '').decode('utf-8', 'ignore')
        if not raw:
            break
        root = ET.fromstring(raw)
        err = root.find('.//error')
        if err is not None:
            if not out:
                raise SourceError(f'Яндекс Поиск: {_xml_text(err)}')
            break
        for doc in root.iter('doc'):
            url = _xml_text(doc.find('url'))
            if not url:
                continue
            title = _xml_text(doc.find('title'))
            passages = ' … '.join(_xml_text(p) for p in doc.iter('passage'))
            snippet = passages or _xml_text(doc.find('headline'))
            kind = 'channel' if re.search(r'//(t\.me|max\.ru)/', url) else 'site'
            out.append(card('web', kind, title, url, snippet))
    return out


def channel_catalogs(query: str, city: str = ''):
    """Каналы и чаты репетиторов в Telegram и MAX — через поиск Яндекса по этим сайтам."""
    q = f'{query} {city}'.strip()
    found = []
    for site in ('t.me', 'max.ru'):
        try:
            found += [dict(c, source='channels', kind='channel') for c in yandex_web(f'{q} site:{site}')]
        except SourceError:
            if site == 't.me':
                raise
    return found


def run(source: str, query: str, city: str = ''):
    query = (query or '').strip()[:200]
    if len(query) < 3:
        raise SourceError('Введите запрос, например: «репетитор по математике ЕГЭ»')
    if source == 'vk_people':
        return vk_people(query, city)
    if source == 'vk_groups':
        return vk_groups(query, city)
    if source == 'vk_posts':
        return vk_posts(query, city)
    if source == 'web':
        return yandex_web(f'{query} {city}'.strip())
    if source == 'channels':
        return channel_catalogs(query, city)
    raise SourceError('Неизвестный источник')


def status() -> dict:
    return {'vk': bool(os.environ.get('VK_ACCESS_TOKEN')),
            'yandex': bool(os.environ.get('YANDEX_SEARCH_API_KEY') and os.environ.get('YANDEX_FOLDER_ID')),
            'ai': bool(os.environ.get('POLZA_API_KEY')),
            'max': bool(os.environ.get('MAX_BOT_TOKEN'))}