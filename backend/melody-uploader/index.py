"""
Business: Одноразовый загрузчик фоновых CC0-инструменталок для песенок Няни Лисы.
По запросу скачивает один свободный трек по id (folk/pop/lullaby/ethno/march) и
складывает в S3, чтобы его можно было микшировать с TTS-голосом в SongPlayer.
Args: event с httpMethod=POST и queryStringParameters.id (один из ключей MELODIES)
Returns: HTTP-ответ с результатом заливки одного трека и его CDN-URL
"""
import json
import os
import urllib.request

import boto3


MELODIES = {
    'folk': {
        'key': 'songs/melody-folk.mp3',
        'label': 'Народная гармошка',
        'source': 'https://cdn.pixabay.com/audio/2022/10/14/audio_3dc1ae9001.mp3',
    },
    'pop': {
        'key': 'songs/melody-pop.mp3',
        'label': 'Детский поп',
        'source': 'https://cdn.pixabay.com/audio/2023/01/09/audio_e4f0e3b9b1.mp3',
    },
    'lullaby': {
        'key': 'songs/melody-lullaby.mp3',
        'label': 'Колыбельное пианино',
        'source': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    },
    'ethno': {
        'key': 'songs/melody-ethno.mp3',
        'label': 'Гусли и свирель',
        'source': 'https://cdn.pixabay.com/audio/2022/03/15/audio_8b22a76d65.mp3',
    },
    'march': {
        'key': 'songs/melody-march.mp3',
        'label': 'Игрушечный марш',
        'source': 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3',
    },
}


def handler(event, context):
    """Заливает один CC0-трек в S3 по id из ?id=folk|pop|lullaby|ethno|march."""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
        }

    if method not in ('GET', 'POST'):
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    qs = event.get('queryStringParameters') or {}
    melody_id = (qs.get('id') or '').strip()

    if not melody_id or melody_id not in MELODIES:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Передай ?id=<melody_id>',
                'available': list(MELODIES.keys()),
            }, ensure_ascii=False),
        }

    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    if not access_key or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'S3 credentials missing'}),
        }

    m = MELODIES[melody_id]

    try:
        req = urllib.request.Request(
            m['source'],
            headers={'User-Agent': 'Mozilla/5.0 (UCHISPRO melody-uploader)'},
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
    except Exception as e:
        return {
            'statusCode': 502,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Download failed: {e}'}, ensure_ascii=False),
        }

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )

    try:
        s3.put_object(
            Bucket='files',
            Key=m['key'],
            Body=data,
            ContentType='audio/mpeg',
            CacheControl='public, max-age=31536000',
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'S3 upload failed: {e}'}, ensure_ascii=False),
        }

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{m['key']}"

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
        'body': json.dumps({
            'ok': True,
            'id': melody_id,
            'key': m['key'],
            'label': m['label'],
            'size': len(data),
            'cdn_url': cdn_url,
        }, ensure_ascii=False),
    }
