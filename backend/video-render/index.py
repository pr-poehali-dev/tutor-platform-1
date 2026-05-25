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


def generate_flux_image(prompt: str, api_key: str) -> bytes | None:
    """Генерирует картинку через polza.ai (FLUX), возвращает байты PNG."""
    try:
        payload = json.dumps({
            'model': 'black-forest-labs/flux-schnell',
            'prompt': prompt[:600],
            'n': 1,
            'size': '1024x576',
            'response_format': 'b64_json',
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/images/generations',
            data=payload,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=90) as response:
            result = json.loads(response.read().decode('utf-8'))
            b64 = result['data'][0].get('b64_json')
            if b64:
                import base64
                return base64.b64decode(b64)
            # Fallback на URL
            url = result['data'][0].get('url')
            if url:
                with urllib.request.urlopen(url, timeout=30) as r2:
                    return r2.read()
        return None
    except Exception:
        return None


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

        api_key = os.environ.get('POLZA_API_KEY', '')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'POLZA_API_KEY не настроен'}, ensure_ascii=False),
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

            prompt = scene.get('image_prompt') or ''
            if not prompt:
                rendered.append({**scene, 'image_url': None, 'error': 'no prompt'})
                continue

            img_bytes = generate_flux_image(prompt, api_key)
            if not img_bytes:
                errors.append(f'{sid}: ошибка генерации FLUX')
                rendered.append({**scene, 'image_url': None, 'error': 'flux failed'})
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