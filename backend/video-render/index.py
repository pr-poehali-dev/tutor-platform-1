"""
Business: Генерирует картинки FLUX для каждой сцены раскадровки. v1.
Принимает массив сцен, для каждой генерирует картинку через polza.ai (FLUX),
сохраняет в S3 и возвращает обновлённый сценарий с image_url.
Args: event с body {scenes: [{id, image_prompt}]}
Returns: HTTP 200 с {scenes: [{id, image_url, image_prompt}]}
"""
import json
import os
import re
import urllib.request
import urllib.error
import boto3
from datetime import datetime


def slugify(text: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', text.lower())
    return s.strip('-')[:50] or 'scene'


def generate_flux_image(prompt: str, seed: int = 42) -> tuple[bytes | None, str | None]:
    """Генерирует картинку через Pollinations.ai (бесплатный FLUX).
    Возвращает (bytes_or_none, error_message_or_none).
    """
    try:
        # Pollinations: бесплатный публичный FLUX. Кириллицу принимает.
        # Делаем уникальный seed чтобы каждая сцена была отдельной картинкой.
        encoded = urllib.parse.quote(prompt[:1500])
        url = (
            f"https://image.pollinations.ai/prompt/{encoded}"
            f"?width=1024&height=576&seed={seed}&nologo=true&enhance=true&model=flux"
        )
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'UchispriBot/1.0 (+https://учисьпро.рф)'},
            method='GET',
        )
        with urllib.request.urlopen(req, timeout=120) as response:
            data = response.read()
            if len(data) < 2000:
                return None, f'pollinations returned too small response: {len(data)} bytes'
            return data, None
    except urllib.error.HTTPError as e:
        return None, f'pollinations HTTP {e.code}: {e.reason}'
    except urllib.error.URLError as e:
        return None, f'pollinations network error: {str(e)[:120]}'
    except Exception as e:
        return None, f'pollinations exception: {str(e)[:120]}'


def upload_to_s3(image_bytes: bytes, key: str) -> str | None:
    """Загружает картинку в S3 и возвращает CDN-URL."""
    try:
        access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
        secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
        if not access_key or not secret_key:
            return None
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
        return f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"
    except Exception:
        return None


def handler(event, context):
    """Генерирует картинки для всех сцен раскадровки."""
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

        scenes = body.get('scenes') or []
        title = body.get('title') or 'video'
        scene_ids = body.get('scene_ids')  # опционально: рендерим только указанные

        if not scenes:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не указаны сцены (scenes)'}, ensure_ascii=False),
            }

        project_slug = slugify(title)
        ts = datetime.now().strftime('%Y%m%d-%H%M%S')

        rendered = []
        errors = []
        for i, scene in enumerate(scenes):
            sid = scene.get('id') or f'scene_{i+1}'
            # Если указан список — рендерим только их
            if scene_ids and sid not in scene_ids:
                rendered.append(scene)  # оставляем как есть
                continue

            prompt = (scene.get('image_prompt') or '').strip()
            if not prompt:
                errors.append(f'{sid}: пустой промпт')
                rendered.append({**scene, 'image_url': None, 'error': 'no prompt'})
                continue

            # Уникальный seed для каждой сцены — иначе все картинки одинаковые
            seed = abs(hash(f'{project_slug}-{sid}-{ts}')) % 1000000
            img_bytes, gen_err = generate_flux_image(prompt, seed=seed)
            if not img_bytes:
                err_msg = f'{sid}: {gen_err or "генерация не удалась"}'
                errors.append(err_msg)
                rendered.append({**scene, 'image_url': None, 'error': gen_err or 'flux failed'})
                continue

            key = f"videos/{project_slug}/{ts}/{sid}.png"
            url = upload_to_s3(img_bytes, key)
            if not url:
                errors.append(f'{sid}: ошибка загрузки в S3')
                rendered.append({**scene, 'image_url': None, 'error': 's3 failed'})
                continue

            rendered.append({**scene, 'image_url': url})

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({
                'scenes': rendered,
                'errors': errors,
                'project_slug': project_slug,
                'total_rendered': sum(1 for s in rendered if s.get('image_url')),
            }, ensure_ascii=False),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }