"""
Business: Создаёт видео-урок для модуля программы — раскадровка + рендеринг.
Action: create — сгенерировать сценарий через ИИ и сохранить в БД, статус pending.
Action: status — получить статус видео по module_id + topic.
Action: list_user_videos — список всех видео пользователя.
Args: event с action в query + body {subject, topic, grade, module_id, duration_sec}
Returns: JSON с storyboard и video_id для дальнейшего рендеринга через video-render
"""
import json
import os
import re
import urllib.request
import urllib.error
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Access-Control-Max-Age': '86400',
}


def ok(payload, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(payload, ensure_ascii=False, default=str),
    }


def err(msg, status=400):
    return ok({'error': msg}, status)


def db_conn():
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        return None
    try:
        return psycopg2.connect(dsn)
    except Exception:
        return None


def get_agent_prompt(conn, agent_key, fallback):
    """Достаёт актуальный промпт агента из БД (с учётом эволюции)."""
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT system_prompt, temperature, model FROM ai_agents WHERE agent_key = %s AND is_active = TRUE",
                (agent_key,),
            )
            row = cur.fetchone()
            if row:
                return row[0], float(row[1] or 0.7), row[2] or 'openai/gpt-4o-mini'
    except Exception:
        pass
    return fallback, 0.7, 'openai/gpt-4o-mini'


def log_interaction(conn, agent_key, success=True):
    """Считает + и - для агента."""
    try:
        with conn.cursor() as cur:
            field = 'success_count' if success else 'failure_count'
            cur.execute(
                f"UPDATE ai_agents SET total_interactions = total_interactions + 1, {field} = {field} + 1, updated_at = NOW() WHERE agent_key = %s",
                (agent_key,),
            )
        conn.commit()
    except Exception:
        pass


def call_polza(messages, temperature=0.8, max_tokens=3000, model='openai/gpt-4o-mini'):
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'
    try:
        payload = json.dumps({
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
            'response_format': {'type': 'json_object'},
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/chat/completions',
            data=payload,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read().decode('utf-8'))
            raw = data['choices'][0]['message']['content'].strip()
            raw = re.sub(r'^```json\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            return json.loads(raw), None
    except urllib.error.HTTPError as e:
        return None, f'polza HTTP {e.code}'
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:100]}'


VIDEO_DIRECTOR_FALLBACK = (
    "Ты — режиссёр коротких образовательных видео для школьников. "
    "Делишь тему на 6-10 сцен по 8-12 секунд каждая. "
    "Каждая сцена: текст диктора (русский, живой) + image_prompt (английский для FLUX). "
    "Структура: интро → ключевые идеи → пример из жизни → вывод."
)


def action_create(conn, body, user_id):
    subject = (body.get('subject') or '').strip()
    topic = (body.get('topic') or '').strip()
    grade = (body.get('grade') or '').strip()
    module_id = (body.get('module_id') or '').strip()
    lesson_id = (body.get('lesson_id') or '').strip()
    duration = int(body.get('duration_sec') or 60)
    voice = (body.get('voice_id') or 'nika')[:40]
    style = (body.get('style') or 'realistic')[:40]

    if not topic:
        return err('topic обязателен')

    # Проверка кэша: видео по теме уже есть?
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, storyboard, status, scenes_rendered, total_scenes, duration_sec, title
            FROM lesson_videos
            WHERE subject = %s AND topic = %s AND grade = %s AND status IN ('ready', 'pending')
            ORDER BY scenes_rendered DESC, created_at DESC LIMIT 1
        """, (subject, topic, grade))
        cached = cur.fetchone()
        if cached and cached.get('storyboard'):
            return ok({
                'video_id': cached['id'],
                'cached': True,
                'storyboard': cached['storyboard'],
                'status': cached['status'],
                'scenes_rendered': cached['scenes_rendered'],
                'total_scenes': cached['total_scenes'],
                'title': cached.get('title'),
            })

    # Получаем актуальный промпт режиссёра (может быть улучшен через эволюцию)
    director_prompt, director_temp, director_model = get_agent_prompt(conn, 'video_director', VIDEO_DIRECTOR_FALLBACK)

    target_scenes = max(5, min(10, duration // 10))
    user_msg = (
        f"ТЕМА УРОКА: {topic}\n"
        f"ПРЕДМЕТ: {subject}\n"
        f"КЛАСС: {grade}\n"
        f"ДЛИТЕЛЬНОСТЬ: {duration} секунд ({target_scenes} сцен)\n"
        f"СТИЛЬ КАРТИНОК: {style}\n\n"
        "Создай раскадровку. Каждая сцена должна РЕАЛЬНО учить — никакой воды. "
        "Image prompts на английском, начинай с описания стиля. "
        "Верни строго JSON:\n"
        "{\n"
        '  "title": "Название урока на русском",\n'
        '  "scenes": [{"narration": "русский текст", "image_prompt": "english prompt", "duration_sec": 10, "transition": "fade"}]\n'
        "}"
    )

    data, gen_err = call_polza(
        [
            {'role': 'system', 'content': director_prompt},
            {'role': 'user', 'content': user_msg},
        ],
        temperature=director_temp,
        model=director_model,
        max_tokens=3500,
    )

    if not data:
        log_interaction(conn, 'video_director', success=False)
        return err(f'Режиссёр не ответил: {gen_err}', 502)

    scenes = data.get('scenes') or []
    if not scenes:
        log_interaction(conn, 'video_director', success=False)
        return err('Режиссёр вернул пустой сценарий', 502)

    normalized = []
    for i, s in enumerate(scenes[:12]):
        normalized.append({
            'id': f'scene_{i+1}',
            'narration': (s.get('narration') or '').strip()[:400],
            'image_prompt': (s.get('image_prompt') or '').strip()[:600],
            'duration_sec': max(5, min(20, int(s.get('duration_sec') or 10))),
            'transition': s.get('transition') or 'fade',
        })

    title = (data.get('title') or topic)[:300]
    storyboard = {
        'title': title,
        'topic': topic,
        'subject': subject,
        'grade': grade,
        'style': style,
        'duration_sec': duration,
        'scenes': normalized,
        'total_scenes': len(normalized),
    }

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO lesson_videos
                (user_id, subject, topic, grade, module_id, lesson_id, title,
                 storyboard, scenes_rendered, total_scenes, status, voice_id, style, duration_sec)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0, %s, 'storyboard_ready', %s, %s, %s)
            RETURNING id
        """, (
            user_id, subject[:60], topic[:200], grade[:20],
            module_id[:60], lesson_id[:60], title,
            json.dumps(storyboard, ensure_ascii=False),
            len(normalized), voice, style, duration,
        ))
        video_id = cur.fetchone()[0]
    conn.commit()

    log_interaction(conn, 'video_director', success=True)

    return ok({
        'video_id': video_id,
        'cached': False,
        'storyboard': storyboard,
        'status': 'storyboard_ready',
        'scenes_rendered': 0,
        'total_scenes': len(normalized),
        'title': title,
    })


def action_status(conn, qs):
    video_id = qs.get('video_id')
    if video_id:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, subject, topic, grade, title, storyboard, status,
                       scenes_rendered, total_scenes, duration_sec, voice_id, style, created_at
                FROM lesson_videos WHERE id = %s
            """, (int(video_id),))
            video = cur.fetchone()
        if not video:
            return err('Видео не найдено', 404)
        return ok({'video': video})
    return err('video_id required')


def action_update_scenes(conn, body):
    """Фронт обновляет storyboard после рендеринга картинок через video-render."""
    video_id = body.get('video_id')
    scenes = body.get('scenes')
    if not video_id or not isinstance(scenes, list):
        return err('video_id и scenes required')

    rendered = sum(1 for s in scenes if s.get('image_url'))
    status = 'ready' if rendered == len(scenes) else 'rendering'

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT storyboard FROM lesson_videos WHERE id = %s", (int(video_id),))
        row = cur.fetchone()
        if not row:
            return err('Видео не найдено', 404)
        sb = row['storyboard'] or {}
        sb['scenes'] = scenes
        cur.execute("""
            UPDATE lesson_videos
            SET storyboard = %s, scenes_rendered = %s, status = %s, updated_at = NOW()
            WHERE id = %s
        """, (json.dumps(sb, ensure_ascii=False), rendered, status, int(video_id)))
    conn.commit()
    return ok({'video_id': video_id, 'scenes_rendered': rendered, 'status': status})


def action_list_user_videos(conn, user_id):
    if not user_id:
        return ok({'videos': []})
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, subject, topic, grade, title, status, scenes_rendered, total_scenes,
                   duration_sec, created_at
            FROM lesson_videos
            WHERE user_id = %s
            ORDER BY created_at DESC LIMIT 50
        """, (user_id,))
        videos = cur.fetchall()
    return ok({'videos': videos})


def handler(event, context):
    """Генерация видео-уроков для модулей программы."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    try:
        user_id = int(user_id) if user_id else None
    except Exception:
        user_id = None

    action = qs.get('action', '')
    body = {}
    if method == 'POST':
        try:
            body = json.loads(event.get('body') or '{}')
        except Exception:
            return err('Некорректный JSON')
        if not action:
            action = body.get('action', '')

    conn = db_conn()
    if not conn:
        return err('БД недоступна', 503)

    try:
        if action == 'create':
            return action_create(conn, body, user_id)
        if action == 'status':
            return action_status(conn, qs)
        if action == 'update_scenes':
            return action_update_scenes(conn, body)
        if action == 'list_user_videos':
            return action_list_user_videos(conn, user_id)
        return err(f'Неизвестное действие: {action}')
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return err(f'{type(e).__name__}: {str(e)[:200]}', 500)
    finally:
        try:
            conn.close()
        except Exception:
            pass
