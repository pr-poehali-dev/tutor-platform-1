"""
Business: Самоэволюционирующий движок ИИ-агентов УЧИСЬПРО.
Действия:
- list_agents: вернуть всех агентов с метриками
- get_agent: вернуть одного агента + историю эволюции + ТОП knowledge_base
- log_interaction: записать факт взаимодействия (success/failure, rating)
- feedback: сохранить рейтинг/коммент ученика
- save_pattern: сохранить удачное объяснение в knowledge base
- evolve: запустить эволюцию агента — ИИ-аналитик переписывает его промпт на основе фидбэка
- stats: глобальная статистика по платформе
Args: event с action в query или body
Returns: JSON с данными агентов/результатами
"""
import json
import os
import urllib.request
import urllib.error
import psycopg2
from psycopg2.extras import RealDictCursor
import re


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


def err(message, status=400):
    return ok({'error': message}, status)


def db_conn():
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        return None
    try:
        return psycopg2.connect(dsn)
    except Exception:
        return None


def call_polza(messages, model='openai/gpt-4o-mini', temperature=0.5, max_tokens=2000):
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
        return None, f'{type(e).__name__}: {str(e)[:120]}'


def action_list_agents(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, agent_key, role_name, description, version, model, temperature,
                   total_interactions, success_count, failure_count, avg_rating,
                   last_evolved_at, is_active, created_at, updated_at,
                   LENGTH(system_prompt) AS prompt_length
            FROM ai_agents
            WHERE is_active = TRUE
            ORDER BY total_interactions DESC, version DESC
        """)
        agents = cur.fetchall()
    return ok({'agents': agents, 'total': len(agents)})


def action_get_agent(conn, agent_key):
    if not agent_key:
        return err('agent_key required')
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM ai_agents WHERE agent_key = %s", (agent_key,))
        agent = cur.fetchone()
        if not agent:
            return err('Агент не найден', 404)

        cur.execute("""
            SELECT id, from_version, to_version, change_type, reason, diff_summary,
                   triggered_by, created_at
            FROM ai_evolution_log
            WHERE agent_key = %s
            ORDER BY created_at DESC LIMIT 20
        """, (agent_key,))
        history = cur.fetchall()

        cur.execute("""
            SELECT id, subject, topic, grade, pattern_type, content, success_score, use_count, created_at
            FROM ai_knowledge_base
            WHERE agent_key = %s
            ORDER BY success_score DESC, use_count DESC LIMIT 10
        """, (agent_key,))
        knowledge = cur.fetchall()

        cur.execute("""
            SELECT COUNT(*) AS total,
                   AVG(rating)::numeric(4,2) AS avg_rating,
                   SUM(CASE WHEN is_helpful THEN 1 ELSE 0 END) AS helpful_count,
                   SUM(CASE WHEN NOT is_helpful THEN 1 ELSE 0 END) AS unhelpful_count
            FROM content_feedback
            WHERE agent_key = %s AND created_at > NOW() - INTERVAL '30 days'
        """, (agent_key,))
        recent = cur.fetchone()

    return ok({'agent': agent, 'history': history, 'knowledge': knowledge, 'recent_stats': recent})


def action_log_interaction(conn, body):
    agent_key = body.get('agent_key')
    success = bool(body.get('success', True))
    if not agent_key:
        return err('agent_key required')
    with conn.cursor() as cur:
        if success:
            cur.execute("""
                UPDATE ai_agents
                SET total_interactions = total_interactions + 1,
                    success_count = success_count + 1,
                    updated_at = NOW()
                WHERE agent_key = %s
            """, (agent_key,))
        else:
            cur.execute("""
                UPDATE ai_agents
                SET total_interactions = total_interactions + 1,
                    failure_count = failure_count + 1,
                    updated_at = NOW()
                WHERE agent_key = %s
            """, (agent_key,))
    conn.commit()
    return ok({'logged': True, 'agent_key': agent_key})


def action_feedback(conn, body):
    agent_key = body.get('agent_key')
    if not agent_key:
        return err('agent_key required')
    rating = body.get('rating')
    if rating is not None:
        try:
            rating = int(rating)
            rating = max(1, min(5, rating))
        except Exception:
            rating = None
    is_helpful = body.get('is_helpful')

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO content_feedback
                (user_id, agent_key, content_type, content_id, rating, is_helpful,
                 user_comment, context_subject, context_grade, context_topic, raw_content)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            body.get('user_id'),
            agent_key,
            (body.get('content_type') or 'lesson')[:40],
            (body.get('content_id') or '')[:120],
            rating,
            is_helpful,
            (body.get('comment') or '')[:1000],
            (body.get('subject') or '')[:60],
            (body.get('grade') or '')[:20],
            (body.get('topic') or '')[:200],
            (body.get('raw_content') or '')[:5000],
        ))
        fid = cur.fetchone()[0]

        if rating is not None:
            cur.execute("""
                UPDATE ai_agents
                SET avg_rating = (
                    SELECT AVG(rating)::numeric(4,2)
                    FROM content_feedback
                    WHERE agent_key = %s AND rating IS NOT NULL
                )
                WHERE agent_key = %s
            """, (agent_key, agent_key))
    conn.commit()
    return ok({'feedback_id': fid, 'saved': True})


def action_save_pattern(conn, body):
    agent_key = body.get('agent_key')
    content = body.get('content')
    if not agent_key or not content:
        return err('agent_key and content required')
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO ai_knowledge_base
                (agent_key, subject, topic, grade, pattern_type, content, success_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            agent_key,
            (body.get('subject') or '')[:60],
            (body.get('topic') or '')[:200],
            (body.get('grade') or '')[:20],
            (body.get('pattern_type') or 'explanation')[:40],
            content[:6000],
            float(body.get('score', 5.0)),
        ))
        kid = cur.fetchone()[0]
    conn.commit()
    return ok({'pattern_id': kid, 'saved': True})


def action_evolve(conn, body):
    """Запускает эволюцию агента: ИИ-аналитик переписывает промпт на основе фидбэка."""
    agent_key = body.get('agent_key')
    if not agent_key:
        return err('agent_key required')

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM ai_agents WHERE agent_key = %s", (agent_key,))
        agent = cur.fetchone()
        if not agent:
            return err('Агент не найден', 404)

        cur.execute("""
            SELECT rating, is_helpful, user_comment, context_subject, context_topic
            FROM content_feedback
            WHERE agent_key = %s
              AND (user_comment IS NOT NULL OR rating IS NOT NULL)
            ORDER BY created_at DESC LIMIT 40
        """, (agent_key,))
        feedback = cur.fetchall()

        cur.execute("""
            SELECT content, success_score, topic
            FROM ai_knowledge_base
            WHERE agent_key = %s
            ORDER BY success_score DESC LIMIT 8
        """, (agent_key,))
        best_patterns = cur.fetchall()

    if len(feedback) < 3 and body.get('force') != True:
        return ok({
            'evolved': False,
            'reason': f'Слишком мало обратной связи ({len(feedback)} записей). Минимум 3 для эволюции.',
            'feedback_count': len(feedback),
        })

    avg_rating = float(agent['avg_rating'] or 0)
    total = int(agent['total_interactions'] or 0)
    success = int(agent['success_count'] or 0)
    success_rate = (success / total * 100) if total > 0 else 0

    feedback_text = '\n'.join([
        f"- rating={fb.get('rating')}, helpful={fb.get('is_helpful')}, тема={fb.get('context_topic')}: {fb.get('user_comment') or '(без комментария)'}"
        for fb in feedback[:20]
    ])

    best_text = '\n'.join([
        f"- (score {p['success_score']}) [{p['topic']}]: {p['content'][:300]}..."
        for p in best_patterns
    ]) or '(пока пусто)'

    analyst_prompt = f"""Ты — старший инженер по промптам. Анализируешь работу ИИ-агента «{agent['role_name']}» и улучшаешь его системный промпт.

ТЕКУЩИЕ МЕТРИКИ АГЕНТА:
- версия: v{agent['version']}
- взаимодействий: {total}
- успехов: {success} ({success_rate:.0f}%)
- средний рейтинг: {avg_rating}/5
- модель: {agent['model']}

ТЕКУЩИЙ ПРОМПТ:
\"\"\"
{agent['system_prompt']}
\"\"\"

ОБРАТНАЯ СВЯЗЬ ОТ УЧЕНИКОВ (последние 20):
{feedback_text}

ЛУЧШИЕ ПАТТЕРНЫ (что уже работает):
{best_text}

ЗАДАЧА: Перепиши системный промпт так, чтобы:
1) Сохранить всё лучшее, что работает
2) Устранить проблемы из жалоб
3) Учесть новые тренды образования (адаптивность, активное обучение, метакогниция)
4) Промпт должен быть точным, конкретным, без воды (макс 800 слов)
5) Включить инструкции по тому, как обращаться к ученику и какие ловушки избегать

ВЕРНИ строго JSON:
{{
  "should_evolve": true|false,
  "reason": "почему обновляем (или почему НЕТ — если всё ок)",
  "diff_summary": "коротко: что именно изменили (3-5 пунктов)",
  "new_system_prompt": "полный новый текст промпта",
  "new_temperature": 0.4-0.9,
  "expected_improvement": "что станет лучше после обновления"
}}"""

    result, gen_err = call_polza(
        [{'role': 'user', 'content': analyst_prompt}],
        model='openai/gpt-4o-mini',
        temperature=0.4,
        max_tokens=3000,
    )

    if not result:
        return err(f'AI-аналитик не ответил: {gen_err}', 502)

    if not result.get('should_evolve'):
        return ok({
            'evolved': False,
            'reason': result.get('reason', 'агент в норме'),
            'analyst_report': result,
        })

    new_prompt = (result.get('new_system_prompt') or '').strip()
    new_temp = float(result.get('new_temperature') or agent['temperature'])
    new_temp = max(0.1, min(1.0, new_temp))

    if len(new_prompt) < 80:
        return err('Новый промпт слишком короткий — отклонено')

    from_v = int(agent['version'] or 1)
    to_v = from_v + 1

    metrics_before = {
        'total': total, 'success': success, 'failure': int(agent['failure_count'] or 0),
        'avg_rating': avg_rating, 'success_rate': round(success_rate, 1),
    }

    with conn.cursor() as cur:
        cur.execute("""
            UPDATE ai_agents
            SET system_prompt = %s,
                version = %s,
                temperature = %s,
                last_evolved_at = NOW(),
                updated_at = NOW()
            WHERE agent_key = %s
        """, (new_prompt, to_v, new_temp, agent_key))

        cur.execute("""
            INSERT INTO ai_evolution_log
                (agent_id, agent_key, from_version, to_version, change_type,
                 reason, diff_summary, prev_prompt, new_prompt, metrics_before, triggered_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            agent['id'], agent_key, from_v, to_v, 'prompt_rewrite',
            result.get('reason', '')[:1000],
            result.get('diff_summary', '')[:2000],
            agent['system_prompt'],
            new_prompt,
            json.dumps(metrics_before),
            body.get('triggered_by') or 'admin',
        ))
    conn.commit()

    return ok({
        'evolved': True,
        'agent_key': agent_key,
        'from_version': from_v,
        'to_version': to_v,
        'diff_summary': result.get('diff_summary'),
        'expected_improvement': result.get('expected_improvement'),
        'new_temperature': new_temp,
    })


def action_stats(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT COUNT(*) AS agents,
                   SUM(total_interactions) AS total_interactions,
                   SUM(success_count) AS total_success,
                   AVG(avg_rating)::numeric(4,2) AS avg_rating,
                   MAX(version) AS max_version
            FROM ai_agents WHERE is_active = TRUE
        """)
        agg = cur.fetchone()

        cur.execute("""
            SELECT COUNT(*) AS evolutions_30d
            FROM ai_evolution_log
            WHERE created_at > NOW() - INTERVAL '30 days'
        """)
        evo = cur.fetchone()

        cur.execute("""
            SELECT COUNT(*) AS feedbacks_30d
            FROM content_feedback
            WHERE created_at > NOW() - INTERVAL '30 days'
        """)
        fb = cur.fetchone()

        cur.execute("""
            SELECT COUNT(*) AS knowledge_items
            FROM ai_knowledge_base
        """)
        kb = cur.fetchone()
    return ok({
        'platform': {**(agg or {}), **(evo or {}), **(fb or {}), **(kb or {})},
    })


def handler(event, context):
    """Главный роутер ИИ-эволюции."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    qs = event.get('queryStringParameters') or {}
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
        if action == 'list_agents':
            return action_list_agents(conn)
        if action == 'get_agent':
            return action_get_agent(conn, qs.get('agent_key') or body.get('agent_key'))
        if action == 'log_interaction':
            return action_log_interaction(conn, body)
        if action == 'feedback':
            return action_feedback(conn, body)
        if action == 'save_pattern':
            return action_save_pattern(conn, body)
        if action == 'evolve':
            return action_evolve(conn, body)
        if action == 'stats':
            return action_stats(conn)
        return err(f'Неизвестное действие: {action}. Доступно: list_agents, get_agent, log_interaction, feedback, save_pattern, evolve, stats')
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
