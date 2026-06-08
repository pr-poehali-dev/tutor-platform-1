"""
Business: Распознавание речи через Yandex SpeechKit — превращает голос ученика в текст.
Args: event с httpMethod, body (audio_base64); context с request_id
Returns: HTTP-ответ {text: str} — распознанный текст вопроса
"""
import json
import os
import base64
import struct
import urllib.request
import urllib.error


def detect_container(data: bytes) -> str:
    """Определяет контейнер аудио по сигнатуре первых байт."""
    if len(data) < 4:
        return 'unknown'
    if data[:4] == b'OggS':
        return 'ogg'
    if data[:4] == b'\x1a\x45\xdf\xa3':  # EBML — WebM/Matroska
        return 'webm'
    if data[4:8] == b'ftyp':
        return 'mp4'
    if data[:3] == b'ID3' or data[:2] in (b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'):
        return 'mp3'
    return 'unknown'


# ─── Переупаковка WebM/Opus → OggOpus (без перекодирования) ───
def _ogg_crc(data: bytes) -> int:
    crc = 0
    for b in data:
        crc ^= b << 24
        for _ in range(8):
            crc = ((crc << 1) ^ 0x04c11db7) & 0xffffffff if crc & 0x80000000 else (crc << 1) & 0xffffffff
    return crc


def _ogg_page(serial: int, seq: int, granule: int, segments: list, header_type: int) -> bytes:
    payload = b''.join(segments)
    seg_table = bytes(len(s) for s in segments)
    header = b'OggS' + bytes([0]) + bytes([header_type])
    header += struct.pack('<q', granule)
    header += struct.pack('<I', serial)
    header += struct.pack('<I', seq)
    header += b'\x00\x00\x00\x00'  # CRC placeholder
    header += bytes([len(segments)]) + seg_table
    page = header + payload
    crc = _ogg_crc(page)
    page = page[:22] + struct.pack('<I', crc) + page[26:]
    return page


def _read_ebml_id(buf, pos):
    first = buf[pos]
    length = 1
    mask = 0x80
    while length <= 4 and not (first & mask):
        mask >>= 1
        length += 1
    return buf[pos:pos + length], pos + length


def _read_ebml_size(buf, pos):
    first = buf[pos]
    length = 1
    mask = 0x80
    while length <= 8 and not (first & mask):
        mask >>= 1
        length += 1
    val = first & (mask - 1)
    for i in range(1, length):
        val = (val << 8) | buf[pos + i]
    return val, pos + length


def webm_opus_to_ogg(data: bytes) -> bytes:
    """Извлекает Opus-пакеты из WebM (SimpleBlock id 0xA3) и собирает OggOpus.
    Возвращает b'' если не удалось."""
    try:
        packets = []
        pos = 0
        n = len(data)
        # Рекурсивный обход EBML: заходим в Segment(0x18538067) и Cluster(0x1F43B675),
        # внутри собираем SimpleBlock (0xA3).
        CONTAINERS = {b'\x18\x53\x80\x67', b'\x1f\x43\xb6\x75', b'\x1a\x45\xdf\xa3',
                      b'\x16\x54\xae\x6b', b'\xae', b'\xa0'}

        def walk(start, end):
            p = start
            while p < end:
                try:
                    eid, p2 = _read_ebml_id(data, p)
                    size, p3 = _read_ebml_size(data, p2)
                except Exception:
                    return
                content_start = p3
                content_end = min(content_start + size, end) if size < (1 << 56) else end
                if eid == b'\xa3':  # SimpleBlock
                    bp = content_start
                    _track, bp = _read_ebml_size(data, bp)  # track number (vint)
                    bp += 2  # timecode (int16)
                    bp += 1  # flags
                    if bp < content_end:
                        packets.append(data[bp:content_end])
                elif eid in CONTAINERS:
                    walk(content_start, content_end)
                p = content_end

        walk(pos, n)
        if not packets:
            return b''

        serial = 0x5354544f
        pages = []
        # OpusHead
        opus_head = b'OpusHead' + bytes([1, 1]) + struct.pack('<H', 0) + \
            struct.pack('<I', 48000) + struct.pack('<h', 0) + bytes([0])
        pages.append(_ogg_page(serial, 0, 0, [opus_head], 0x02))
        # OpusTags
        vendor = b'poehali'
        opus_tags = b'OpusTags' + struct.pack('<I', len(vendor)) + vendor + struct.pack('<I', 0)
        pages.append(_ogg_page(serial, 1, 0, [opus_tags], 0x00))

        seq = 2
        granule = 0
        for pkt in packets:
            granule += 960  # приблизительно (20ms @48k); точность не критична для STT
            # один пакет на страницу (упрощённо), разбивая на сегменты по 255
            segs = []
            rem = pkt
            while len(rem) >= 255:
                segs.append(rem[:255])
                rem = rem[255:]
            segs.append(rem)
            pages.append(_ogg_page(serial, seq, granule, segs, 0x00))
            seq += 1
        return b''.join(pages)
    except Exception:
        return b''


def handler(event, context):
    """Распознаёт речь ученика через Yandex SpeechKit"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    try:
        body_str = event.get('body', '{}')
        body = json.loads(body_str) if isinstance(body_str, str) else body_str

        audio_b64 = body.get('audio_base64', '')
        fmt_raw = (body.get('format') or 'oggopus').strip().lower()

        if not audio_b64:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Аудио не передано'}, ensure_ascii=False),
            }

        api_key = os.environ.get('YANDEX_SPEECHKIT_API_KEY', '')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'YANDEX_SPEECHKIT_API_KEY не настроен'}, ensure_ascii=False),
            }

        try:
            audio_bytes = base64.b64decode(audio_b64)
        except Exception:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Невалидный base64 аудио'}, ensure_ascii=False),
            }

        if len(audio_bytes) > 1024 * 1024:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Файл больше 1 МБ. Запиши короче.'}, ensure_ascii=False),
            }

        folder_id = os.environ.get('YANDEX_FOLDER_ID', '').strip()

        # Определяем реальный контейнер по байтам (не доверяя слепо фронту).
        container = detect_container(audio_bytes)
        print(f"[stt] container={container} fmt_raw={fmt_raw} size={len(audio_bytes)}")

        # Chrome пишет WebM/Opus — Yandex его не принимает.
        # Переупаковываем Opus-пакеты в валидный OggOpus без перекодирования.
        if container == 'webm':
            repacked = webm_opus_to_ogg(audio_bytes)
            if repacked:
                audio_bytes = repacked
                container = 'ogg'
                print(f"[stt] webm→ogg repacked, new size={len(audio_bytes)}")

        # Формируем список форматов-кандидатов в порядке надёжности.
        if container == 'ogg':
            fmt_candidates = ['oggopus']
        elif container == 'mp3':
            fmt_candidates = ['mp3', '']
        elif container in ('mp4',):
            fmt_candidates = ['']  # пусть Yandex определит сам (часто не выйдет)
        elif fmt_raw == 'lpcm':
            fmt_candidates = ['lpcm']
        else:
            fmt_candidates = ['oggopus', '']

        def call_yandex(fmt_value):
            params = ['lang=ru-RU', 'topic=general']
            if fmt_value:
                params.append(f'format={fmt_value}')
            if folder_id:
                params.append(f'folderId={folder_id}')
            url = 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?' + '&'.join(params)
            req = urllib.request.Request(
                url,
                data=audio_bytes,
                headers={'Authorization': f'Api-Key {api_key}'},
                method='POST',
            )
            with urllib.request.urlopen(req, timeout=20) as response:
                return json.loads(response.read().decode('utf-8'))

        last_http_err = None
        result = None
        for fmt_value in fmt_candidates:
            try:
                result = call_yandex(fmt_value)
                break
            except urllib.error.HTTPError as e:
                last_http_err = e
                body_preview = e.read().decode('utf-8', errors='ignore')[:200]
                print(f"[stt] yandex {e.code} for format='{fmt_value}': {body_preview}")
                last_http_err._cached_body = body_preview  # type: ignore[attr-defined]
                continue

        try:
            if result is None and last_http_err is not None:
                raise last_http_err
            text = (result or {}).get('result', '').strip()
        except urllib.error.HTTPError as e:
            err_body = getattr(e, '_cached_body', None) or e.read().decode('utf-8', errors='ignore')
            # Делаем понятное пользователю сообщение
            low = err_body.lower()
            if 'format' in low or 'codec' in low or 'unsupported' in low:
                user_msg = ('Браузер записал звук в формате, который не понимает '
                            'распознавалка. Открой сайт в Chrome или обнови Safari.')
            elif 'too short' in low or 'short' in low:
                user_msg = 'Запись слишком короткая. Зажми кнопку и говори чётче.'
            elif 'quota' in low or 'limit' in low or e.code == 429:
                user_msg = 'Сервис распознавания временно перегружен. Попробуй через минуту.'
            elif e.code in (401, 403):
                user_msg = 'Сбой авторизации сервиса. Мы уже разбираемся.'
            else:
                user_msg = f'Сервис распознавания ответил ошибкой (код {e.code}). Попробуй ещё раз.'
            return {
                'statusCode': 502,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': user_msg,
                    'yandex_code': e.code,
                    'detail': err_body[:300],
                }, ensure_ascii=False),
            }

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({'text': text}, ensure_ascii=False),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }