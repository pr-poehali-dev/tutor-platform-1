"""
Business: Генерирует ОДНУ картинку для сцены через Pollinations.ai и кладёт в S3. v2.
Принимает {prompt, scene_id, title?, seed?} или {scenes: [{...}]} (legacy).
Возвращает {image_url, scene_id} или {error}.
Args: event с body
Returns: HTTP 200 с {image_url}
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
import boto3
from datetime import datetime


def log(msg: str) -> None:
    print(f"[video-render] {msg}", flush=True)
    sys.stdout.flush()


def slugify(text: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', text.lower())
    return s.strip('-')[:50] or 'scene'


def generate_image_pollinations(prompt: str, seed: int = 42) -> tuple[bytes | None, str | None]:
    """Pollinations.ai — бесплатный FLUX по GET URL."""
    try:
        clean_prompt = prompt[:800]
        encoded = urllib.parse.quote(clean_prompt, safe='')
        url = (
            f"https://image.pollinations.ai/prompt/{encoded}"
            f"?width=1024&height=576&seed={seed}&nologo=true&model=flux"
        )
        log(f"GET pollinations url_len={len(url)}")
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 UchispriBot/1.0',
                'Accept': 'image/*',
            },
            method='GET',
        )
        with urllib.request.urlopen(req, timeout=90) as response:
            data = response.read()
            log(f"Pollinations returned {len(data)} bytes, content-type={response.headers.get('Content-Type', '?')}")
            if len(data) < 1500:
                preview = data[:200].decode('utf-8', errors='ignore')
                return None, f'too small: {len(data)}b: {preview[:100]}'
            return data, None
    except urllib.error.HTTPError as e:
        log(f"Pollinations HTTPError: {e.code} {e.reason}")
        return None, f'HTTP {e.code}: {e.reason}'
    except urllib.error.URLError as e:
        log(f"Pollinations URLError: {e}")
        return None, f'network error: {str(e)[:120]}'
    except Exception as e:
        log(f"Pollinations exception: {type(e).__name__}: {e}")
        return None, f'{type(e).__name__}: {str(e)[:120]}'


def upload_to_s3(image_bytes: bytes, key: str) -> tuple[str | None, str | None]:
    """Загружает в S3 — возвращает (cdn_url, error_msg)."""
    try:
        access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
        secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
        if not access_key:
            return None, 'AWS_ACCESS_KEY_ID не настроен'
        if not secret_key:
            return None, 'AWS_SECRET_ACCESS_KEY не настроен'
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
        s3.put_object(
            Bucket='files',
            Key=key,
            Body=image_bytes,
            ContentType='image/png',
        )
        url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"
        log(f"Uploaded to S3: {url}")
        return url, None
    except Exception as e:
        log(f"S3 upload error: {type(e).__name__}: {e}")
        return None, f'S3: {type(e).__name__}: {str(e)[:120]}'


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}


def handler(event, context):
    """Генерирует одну картинку для сцены и кладёт в S3."""
    method = event.get('httpMethod', 'POST')
    log(f"=== method={method}")

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    try:
        body_str = event.get('body') or '{}'
        body = json.loads(body_str) if isinstance(body_str, str) else body_str

        # Поддерживаем 2 формата: одна сцена ИЛИ массив (legacy)
        if 'scenes' in body and isinstance(body.get('scenes'), list):
            scenes = body['scenes']
            if not scenes:
                return {
                    'statusCode': 400,
                    'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Пустой массив сцен'}, ensure_ascii=False),
                }
            scene = scenes[0]
            prompt = scene.get('image_prompt') or ''
            scene_id = scene.get('id') or 'scene_1'
            title = body.get('title') or 'video'
        else:
            prompt = body.get('prompt') or body.get('image_prompt') or ''
            scene_id = body.get('scene_id') or body.get('id') or f'scene_{int(time.time())}'
            title = body.get('title') or body.get('project_slug') or 'video'

        prompt = prompt.strip()
        log(f"scene_id={scene_id}, prompt_len={len(prompt)}, title={title}")

        if not prompt:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Пустой промпт', 'scene_id': scene_id}, ensure_ascii=False),
            }

        seed_raw = body.get('seed')
        if seed_raw is None:
            seed = abs(hash(f'{title}-{scene_id}')) % 1000000
        else:
            seed = int(seed_raw)

        t0 = time.time()
        img_bytes, gen_err = generate_image_pollinations(prompt, seed=seed)
        log(f"Pollinations took {time.time() - t0:.1f}s")

        if not img_bytes:
            return {
                'statusCode': 502,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': f'Pollinations: {gen_err}',
                    'scene_id': scene_id,
                }, ensure_ascii=False),
            }

        project_slug = slugify(title)
        ts = datetime.now().strftime('%Y%m%d-%H%M%S')
        key = f"videos/{project_slug}/{ts}-{scene_id}.png"
        url, upload_err = upload_to_s3(img_bytes, key)

        if not url:
            return {
                'statusCode': 502,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': f'S3: {upload_err}',
                    'scene_id': scene_id,
                }, ensure_ascii=False),
            }

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'image_url': url,
                'scene_id': scene_id,
                'seed': seed,
                'size_bytes': len(img_bytes),
            }, ensure_ascii=False),
        }

    except json.JSONDecodeError as e:
        log(f"JSONDecodeError: {e}")
        return {
            'statusCode': 400,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Некорректный JSON: {e}'}, ensure_ascii=False),
        }
    except Exception as e:
        log(f"FATAL {type(e).__name__}: {e}")
        return {
            'statusCode': 500,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'{type(e).__name__}: {str(e)[:200]}'}, ensure_ascii=False),
        }
