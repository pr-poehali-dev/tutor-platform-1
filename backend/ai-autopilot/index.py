"""
Business: Автопилот ИИ-эволюции УЧИСЬПРО.
Действия:
- check: проверить всех агентов и эволюционировать тех, что просели
- cron: ночной автоматический запуск (можно дёргать по расписанию)
- runs: история запусков автопилота
- graph: граф зависимостей агентов (для визуализации)
- toggle: включить/выключить автоэволюцию для агента
- log_error: записать ошибку ученика для детектива
- error_patterns: найти системные пробелы через error_detective

Args: event с action в query
Returns: JSON с отчётом по эволюциям
"""
import json
import os
import time
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


def call_polza(messages, model='openai/gpt-4o-mini', temperature=0.4, max_tokens=3000):
    """Вызов polza.ai с JSON-режимом."""
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


def compute_health(agent):
    """Здоровье агента 0-100 на основе метрик."""
    total = int(agent.get('total_interactions') or 0)
    success = int(agent.get('success_count') or 0)
    failure = int(agent.get('failure_count') or 0)
    rating = float(agent.get('avg_rating') or 0)

    if total == 0:
        return 100.0  # новый агент — пока здоров

    success_rate = (success / total) * 100 if total > 0 else 100
    # 60% — успешность, 40% — рейтинг
    rating_part = (rating / 5.0) * 100 if rating > 0 else 70  # без оценок ставим нейтральные 70
    failure_penalty = min(20, (failure / max(total, 1)) * 100)
    score = success_rate * 0.5 + rating_part * 0.4 - failure_penalty * 0.1
    return max(0, min(100, round(score, 2)))


def needs_evolution(agent, feedback_count):
    """Определяет, нужно ли эволюционировать агента."""
    if not agent.get('auto_evolve_enabled'):
        return False, 'auto_evolve выключен'

    rating = float(agent.get('avg_rating') or 0)
    threshold = float(agent.get('min_rating_threshold') or 3.8)
    min_feedback = int(agent.get('min_feedback_for_evolve') or 5)
    cooldown_h = int(agent.get('cooldown_hours') or 6)
    last_evolved = agent.get('last_evolved_at')

    if feedback_count < min_feedback:
        return False, f'мало фидбэка ({feedback_count}/{min_feedback})'

    if last_evolved:
        try:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            last = last_evolved if hasattr(last_evolved, 'year') else datetime.fromisoformat(str(last_evolved))
            hours_passed = (now - last).total_seconds() / 3600
            if hours_passed < cooldown_h:
                return False, f'кулдаун ({hours_passed:.1f}/{cooldown_h}ч)'
        except Exception:
            pass

    if rating > 0 and rating < threshold:
        return True, f'рейтинг {rating} < {threshold}'

    failure = int(agent.get('failure_count') or 0)
    total = int(agent.get('total_interactions') or 0)
    if total >= 10 and (failure / total) > 0.3:
        return True, f'высокий % ошибок ({(failure/total*100):.0f}%)'

    return False, 'агент в норме'


def call_evolve_endpoint(agent_key, triggered_by='autopilot'):
    """Дёргаем функцию ai-evolve чтобы запустить эволюцию агента."""
    evolve_url = os.environ.get('AI_EVOLVE_URL', '')
    if not evolve_url:
        return None, 'AI_EVOLVE_URL не задан'
    try:
        payload = json.dumps({
            'action': 'evolve',
            'agent_key': agent_key,
            'triggered_by': triggered_by,
            'force': True,
        }).encode('utf-8')
        req = urllib.request.Request(
            f'{evolve_url}?action=evolve',
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode('utf-8')), None
    except urllib.error.HTTPError as e:
        return None, f'HTTP {e.code}'
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:100]}'


def action_check(conn, body):
    """Главный пайплайн: проверить агентов и эволюционировать просевших."""
    started = time.time()
    run_type = body.get('run_type', 'manual')

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT * FROM ai_agents
            WHERE is_active = TRUE
            ORDER BY total_interactions DESC
        """)
        agents = cur.fetchall()

    checked = 0
    evolved = 0
    healthy = 0
    skipped = 0
    details = []

    for agent in agents:
        checked += 1
        with conn.cursor() as cur:
            cur.execute("""
                SELECT COUNT(*) FROM content_feedback
                WHERE agent_key = %s
                  AND created_at > NOW() - INTERVAL '7 days'
                  AND (rating IS NOT NULL OR user_comment IS NOT NULL)
            """, (agent['agent_key'],))
            feedback_count = cur.fetchone()[0]

        health = compute_health(agent)
        should, reason = needs_evolution(agent, feedback_count)

        with conn.cursor() as cur:
            cur.execute(
                "UPDATE ai_agents SET health_score = %s, last_check_at = NOW() WHERE agent_key = %s",
                (health, agent['agent_key']),
            )
        conn.commit()

        entry = {
            'agent_key': agent['agent_key'],
            'role_name': agent['role_name'],
            'version': agent['version'],
            'health': health,
            'rating': float(agent['avg_rating'] or 0),
            'feedback_7d': feedback_count,
            'needs_evolution': should,
            'reason': reason,
        }

        if should:
            result, ev_err = call_evolve_endpoint(agent['agent_key'], triggered_by=run_type)
            if result and result.get('evolved'):
                evolved += 1
                entry['evolved'] = True
                entry['to_version'] = result.get('to_version')
                entry['diff_summary'] = result.get('diff_summary')
            else:
                entry['evolved'] = False
                entry['evolve_error'] = ev_err or (result or {}).get('reason')
                skipped += 1
        else:
            if health >= 80:
                healthy += 1
            else:
                skipped += 1

        details.append(entry)

    duration_ms = int((time.time() - started) * 1000)

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO ai_autopilot_runs
                (run_type, agents_checked, agents_evolved, agents_healthy, agents_skipped, duration_ms, details)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (run_type, checked, evolved, healthy, skipped, duration_ms, json.dumps(details, ensure_ascii=False, default=str)))
        run_id = cur.fetchone()[0]
    conn.commit()

    return ok({
        'run_id': run_id,
        'run_type': run_type,
        'duration_ms': duration_ms,
        'agents_checked': checked,
        'agents_evolved': evolved,
        'agents_healthy': healthy,
        'agents_skipped': skipped,
        'details': details,
    })


def action_runs(conn, qs):
    limit = int(qs.get('limit', 20))
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, run_type, agents_checked, agents_evolved, agents_healthy,
                   agents_skipped, duration_ms, created_at
            FROM ai_autopilot_runs
            ORDER BY created_at DESC LIMIT %s
        """, (limit,))
        runs = cur.fetchall()
    return ok({'runs': runs})


def action_graph(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT agent_key, role_name, version, health_score, total_interactions, avg_rating
            FROM ai_agents WHERE is_active = TRUE
        """)
        nodes = cur.fetchall()

        cur.execute("""
            SELECT parent_agent, child_agent, influence_type, weight
            FROM agent_dependencies
        """)
        edges = cur.fetchall()
    return ok({'nodes': nodes, 'edges': edges})


def action_toggle(conn, body):
    agent_key = body.get('agent_key')
    enabled = body.get('enabled')
    if not agent_key or enabled is None:
        return err('agent_key и enabled required')
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE ai_agents SET auto_evolve_enabled = %s WHERE agent_key = %s",
            (bool(enabled), agent_key),
        )
    conn.commit()
    return ok({'agent_key': agent_key, 'auto_evolve_enabled': bool(enabled)})


def action_log_error(conn, body):
    """Логирует ошибку ученика — потом детектив найдёт паттерны."""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO student_errors
                (user_id, subject, topic, grade, question, correct_answer, student_answer, error_pattern, explanation)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            body.get('user_id'),
            (body.get('subject') or '')[:60],
            (body.get('topic') or '')[:200],
            (body.get('grade') or '')[:20],
            (body.get('question') or '')[:2000],
            (body.get('correct_answer') or '')[:500],
            (body.get('student_answer') or '')[:500],
            (body.get('error_pattern') or 'unknown')[:80],
            (body.get('explanation') or '')[:1000],
        ))
        eid = cur.fetchone()[0]
    conn.commit()
    return ok({'error_id': eid})


def action_error_patterns(conn, qs):
    """Детектив ошибок: ищет системные пробелы за последние 30 дней."""
    subject = qs.get('subject')
    days = int(qs.get('days', 30))

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(f"""
            SELECT subject, topic, grade, error_pattern,
                   COUNT(*) AS error_count,
                   COUNT(DISTINCT user_id) AS affected_users
            FROM student_errors
            WHERE created_at > NOW() - INTERVAL '{days} days'
              {("AND subject = %s" if subject else "")}
            GROUP BY subject, topic, grade, error_pattern
            HAVING COUNT(*) >= 3
            ORDER BY error_count DESC LIMIT 30
        """, (subject,) if subject else ())
        patterns = cur.fetchall()

    if not patterns:
        return ok({'patterns': [], 'recommendations': 'Пока недостаточно данных для анализа.'})

    # Дёргаем error_detective чтобы дать рекомендации
    with conn.cursor() as cur:
        cur.execute(
            "SELECT system_prompt, temperature, model FROM ai_agents WHERE agent_key = 'error_detective'"
        )
        row = cur.fetchone()
        detective_prompt = row[0] if row else 'Ты — детектив ошибок.'
        detective_temp = float(row[1]) if row else 0.4
        detective_model = row[2] if row else 'openai/gpt-4o-mini'

    user_msg = (
        f"Найдены системные пробелы за {days} дней:\n"
        f"{json.dumps(patterns[:20], ensure_ascii=False, default=str)}\n\n"
        "Проанализируй и верни JSON:\n"
        "{\n"
        '  "critical_gaps": [{"topic": "...", "subject": "...", "why_systemic": "...", "fix": "что добавить в программу"}],\n'
        '  "summary": "общая картина в 2-3 предложениях",\n'
        '  "priority_actions": ["конкретное действие 1", "..."]\n'
        "}"
    )
    analysis, gen_err = call_polza(
        [{'role': 'system', 'content': detective_prompt}, {'role': 'user', 'content': user_msg}],
        model=detective_model, temperature=detective_temp, max_tokens=2000,
    )

    return ok({
        'patterns': patterns,
        'analysis': analysis if analysis else {'error': gen_err},
    })


def handler(event, context):
    """Автопилот ИИ-эволюции УЧИСЬПРО."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    body = {}
    if method == 'POST':
        try:
            body = json.loads(event.get('body') or '{}')
        except Exception:
            return err('Некорректный JSON')

    action = qs.get('action') or body.get('action', '')
    conn = db_conn()
    if not conn:
        return err('БД недоступна', 503)

    try:
        if action == 'check':
            return action_check(conn, body)
        if action == 'cron':
            body['run_type'] = 'cron_nightly'
            return action_check(conn, body)
        if action == 'runs':
            return action_runs(conn, qs)
        if action == 'graph':
            return action_graph(conn)
        if action == 'toggle':
            return action_toggle(conn, body)
        if action == 'log_error':
            return action_log_error(conn, body)
        if action == 'error_patterns':
            return action_error_patterns(conn, qs)
        return err(f'Неизвестное действие: {action}. Доступно: check, cron, runs, graph, toggle, log_error, error_patterns')
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
