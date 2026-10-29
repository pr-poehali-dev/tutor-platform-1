"""ИИ-методист, который постоянно улучшает уроки платформы.

Каждый вызов tick() делает ОДИН шаг (укладывается в таймаут функции):
  1) review   — критик проверяет урок: факты, полнота, актуальность, понятность (0–100);
  2) improve  — методист переписывает урок с учётом замечаний критика и жалоб учеников;
  3) verdict  — критик вслепую оценивает новую версию; она заменяет старую,
                только если оценка выросла. Старая версия уходит в архив.
Из каждого разбора методист выводит общее правило — правила подмешиваются
в генерацию новых уроков, поэтому уровень растёт и у ещё не созданных уроков.
"""
import json

STEP_INTERVAL_SEC = 240
REVIEW_EVERY_DAYS = 21
GOOD_ENOUGH = 90
MIN_GAIN = 3

CRITIC_PROMPT = """Ты — строгий редактор образовательного контента и эксперт по предмету «{subject}».
Проверь урок «{title}» (уровень: {grade}). Оценивай жёстко:
- фактическая верность (ошибка в факте, формуле, законе, дате — сразу не выше 60);
- актуальность на {year} год (законы, ставки, требования ЕГЭ/ОГЭ, инструменты);
- глубина: объясняет «почему», а не только «как»; нет воды и общих фраз;
- примеры с понятными шагами; типичные ошибки названы конкретно;
- понятность для ученика этого уровня.
{complaints}
УРОК (JSON):
{lesson}

Верни строго JSON:
{{"score": 0-100,
  "problems": ["конкретная проблема 1 — где и что не так", "..."],
  "fixes": ["что именно исправить или добавить", "..."],
  "rule": "одно КОНКРЕТНОЕ проверяемое правило для авторов уроков по этому предмету, выведенное из найденной проблемы (например: «в задачах на ROI всегда показывай формулу и единицы измерения»). Общие слова вроде «давай глубокий анализ» запрещены — тогда верни пустую строку"}}"""

IMPROVE_PROMPT = """Ты — ведущий методист платформы. Улучши урок «{title}» по предмету «{subject}» (уровень: {grade}).
Замечания редактора:
{problems}
Что исправить:
{fixes}
{complaints}
Правила:
- исправь каждую ошибку и закрой каждый пробел; ничего хорошего не теряй;
- сохрани структуру JSON и все поля: title, subtitle, duration_minutes, objectives, theory_blocks
  (heading, content, key_points), examples (problem, solution_steps, answer, note), common_mistakes,
  summary, expert_tips{timeline};
- 3 раздела теории по 5–7 предложений, 3 примера с шагами; без LaTeX; обращение на «ты»;
- не выдумывай факты, цифры и даты; если не уверен — не пиши.

ТЕКУЩИЙ УРОК (JSON):
{lesson}

Верни строго JSON нового урока целиком."""


def _lesson_for_prompt(data):
    return json.dumps({k: v for k, v in data.items() if not k.startswith('_') and k != 'tasks'},
                      ensure_ascii=False)[:9000]


def _log(cur, step, key, title, result, before=None, after=None, note=''):
    cur.execute(
        "INSERT INTO methodist_runs (step, cache_key, lesson_title, result, score_before, score_after, note) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (step, key, (title or '')[:500], result, before, after, (note or '')[:2000]))


def _complaints(cur, subject, title):
    cur.execute(
        "SELECT question, user_reason, user_comment FROM task_reports "
        "WHERE subject = %s AND lesson_title = %s AND status = 'new' ORDER BY id DESC LIMIT 5",
        (subject, title or ''))
    tasks = cur.fetchall()
    cur.execute(
        "SELECT rating, user_comment FROM content_feedback "
        "WHERE content_type = 'lesson' AND content_id = %s AND rating <= 3 ORDER BY id DESC LIMIT 5",
        ((title or '')[:120],))
    rates = cur.fetchall()
    lines = [f"- жалоба на задачу «{(q or '')[:160]}»: {r} {c or ''}" for q, r, c in tasks]
    lines += [f"- оценка урока {r}/5: {c or 'без комментария'}" for r, c in rates]
    return ("ЖАЛОБЫ УЧЕНИКОВ (учти обязательно):\n" + '\n'.join(lines)) if lines else '', bool(tasks)


def _subject_name(subject, names):
    return names.get(subject, {}).get('name', subject or 'Курс')


def _critic(call_polza, data, subject, grade, title, complaints, year):
    prompt = CRITIC_PROMPT.format(subject=subject, title=title, grade=grade, year=year,
                                  complaints=complaints, lesson=_lesson_for_prompt(data))
    res = call_polza([{'role': 'user', 'content': prompt}], max_tokens=900, temperature=0.2,
                     timeout=22, retries=0)
    if not isinstance(res, dict):
        return None
    try:
        score = max(0, min(100, int(res.get('score'))))
    except (TypeError, ValueError):
        return None
    return {
        'score': score,
        'problems': [str(x)[:300] for x in (res.get('problems') or [])][:8],
        'fixes': [str(x)[:300] for x in (res.get('fixes') or [])][:8],
        'rule': str(res.get('rule') or '')[:300],
    }


def _save_rule(cur, subject, rule):
    rule = (rule or '').strip()
    vague = ('глубок', 'актуальн', 'качествен', 'понятн', 'интересн')
    if len(rule) < 20 or (len(rule) < 140 and sum(w in rule.lower() for w in vague) >= 2):
        return
    cur.execute(
        "SELECT 1 FROM ai_knowledge_base WHERE agent_key='lesson_teacher' AND pattern_type='rule' "
        "AND subject = %s AND content = %s LIMIT 1", (subject, rule))
    if cur.fetchone():
        return
    cur.execute(
        "INSERT INTO ai_knowledge_base (agent_key, subject, pattern_type, content, success_score) "
        "VALUES ('lesson_teacher', %s, 'rule', %s, 5.0)", (subject, rule))


def rules_for(conn, subject, limit=6):
    """Свежие правила методиста по предмету — подмешиваются в генерацию новых уроков."""
    if conn is None:
        return []
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT content FROM ai_knowledge_base WHERE agent_key='lesson_teacher' "
                "AND pattern_type='rule' AND subject = %s ORDER BY success_score DESC, id DESC LIMIT %s",
                (subject, limit))
            return [r[0] for r in cur.fetchall()]
    except Exception:
        return []


def _pick_lesson(cur):
    """Сначала уроки с жалобами и низкими оценками, затем популярные давно не проверенные."""
    cur.execute(
        f"""SELECT lc.cache_key, lc.subject, lc.grade, lc.lesson_title, lc.topic, lc.lesson_data,
                   lc.critic_score, lc.version
            FROM lesson_cache lc
            WHERE lc.subject <> 'x_retired'
              AND (lc.reviewed_at IS NULL OR lc.reviewed_at < NOW() - INTERVAL '{REVIEW_EVERY_DAYS} days'
                   OR EXISTS (SELECT 1 FROM task_reports tr WHERE tr.subject = lc.subject
                              AND tr.lesson_title = lc.lesson_title AND tr.status = 'new'
                              AND tr.created_at > COALESCE(lc.reviewed_at, '2000-01-01')))
            ORDER BY
              (EXISTS (SELECT 1 FROM task_reports tr WHERE tr.subject = lc.subject
                       AND tr.lesson_title = lc.lesson_title AND tr.status = 'new')) DESC,
              (EXISTS (SELECT 1 FROM content_feedback cf WHERE cf.content_type = 'lesson'
                       AND cf.content_id = LEFT(lc.lesson_title, 120) AND cf.rating <= 3)) DESC,
              lc.reviewed_at NULLS FIRST,
              lc.hit_count DESC
            LIMIT 1""")
    return cur.fetchone()


def tick(conn, call_polza, lesson_quality, subject_topics, year, force=False):
    """Один шаг эволюции. Возвращает словарь с итогом шага."""
    with conn.cursor() as cur:
        if not force:
            cur.execute(
                f"SELECT 1 FROM methodist_runs WHERE created_at > NOW() - INTERVAL '{STEP_INTERVAL_SEC} seconds' LIMIT 1")
            if cur.fetchone():
                return {'step': 'wait'}

        # Шаг 3: есть непроверенная новая версия — выносим вердикт.
        cur.execute(
            "SELECT v.id, v.cache_key, v.lesson_data, lc.lesson_data, lc.subject, lc.grade, lc.lesson_title, "
            "lc.critic_score, lc.version FROM lesson_versions v JOIN lesson_cache lc ON lc.cache_key = v.cache_key "
            "WHERE v.status = 'candidate' ORDER BY v.id LIMIT 1")
        cand = cur.fetchone()
        if cand:
            vid, key, new_data, old_data, subject, grade, title, old_score, ver = cand
            complaints, _ = _complaints(cur, subject, title)
            verdict = _critic(call_polza, new_data, _subject_name(subject, subject_topics), grade, title, complaints, year)
            if not verdict:
                _log(cur, 'verdict', key, title, 'ai_error')
                conn.commit()
                return {'step': 'verdict', 'result': 'ai_error'}
            gain_ok = verdict['score'] >= (old_score or 0) + MIN_GAIN
            quality_ok = lesson_quality(new_data) >= lesson_quality(old_data) - 5
            if gain_ok and quality_ok:
                cur.execute(
                    "INSERT INTO lesson_versions (cache_key, version, status, lesson_data, critic_score, reason) "
                    "VALUES (%s,%s,'archived',%s,%s,'заменён улучшенной версией')",
                    (key, ver, json.dumps(old_data, ensure_ascii=False), old_score))
                cur.execute(
                    "UPDATE lesson_cache SET lesson_data = %s, version = version + 1, critic_score = %s, "
                    "critic_notes = %s, quality_score = %s, is_locked = TRUE, reviewed_at = NOW() WHERE cache_key = %s",
                    (json.dumps(new_data, ensure_ascii=False), verdict['score'],
                     '\n'.join(verdict['problems']), lesson_quality(new_data), key))
                cur.execute("UPDATE lesson_versions SET status='accepted', critic_score=%s WHERE id=%s",
                            (verdict['score'], vid))
                cur.execute("UPDATE task_reports SET status='fixed' WHERE subject=%s AND lesson_title=%s AND status='new'",
                            (subject, title or ''))
                _log(cur, 'verdict', key, title, 'accepted', old_score, verdict['score'])
                result = 'accepted'
            else:
                cur.execute("UPDATE lesson_versions SET status='rejected', critic_score=%s, critic_notes=%s WHERE id=%s",
                            (verdict['score'], '\n'.join(verdict['problems']), vid))
                cur.execute("UPDATE lesson_cache SET reviewed_at = NOW() WHERE cache_key = %s", (key,))
                _log(cur, 'verdict', key, title, 'rejected', old_score, verdict['score'])
                result = 'rejected'
            _save_rule(cur, subject, verdict['rule'])
            conn.commit()
            return {'step': 'verdict', 'result': result, 'before': old_score, 'after': verdict['score'], 'lesson': title}

        # Шаг 2: урок проверен, но слаб — переписываем.
        cur.execute(
            "SELECT cache_key, subject, grade, lesson_title, lesson_data, critic_score, critic_notes "
            "FROM lesson_cache WHERE critic_score IS NOT NULL AND critic_score < %s "
            "AND reviewed_at > NOW() - INTERVAL '1 day' "
            "AND NOT EXISTS (SELECT 1 FROM lesson_versions v WHERE v.cache_key = lesson_cache.cache_key "
            "                AND v.created_at > lesson_cache.reviewed_at) "
            "AND (SELECT count(*) FROM lesson_versions v WHERE v.cache_key = lesson_cache.cache_key "
            "     AND v.created_at > NOW() - INTERVAL '7 days') < 3 "
            "ORDER BY critic_score ASC LIMIT 1", (GOOD_ENOUGH,))
        weak = cur.fetchone()
        if weak:
            key, subject, grade, title, data, score, notes = weak
            complaints, had_task_reports = _complaints(cur, subject, title)
            notes_data = json.loads(notes) if notes and notes.startswith('{') else {'problems': [notes or ''], 'fixes': []}
            prompt = IMPROVE_PROMPT.format(
                title=title, subject=_subject_name(subject, subject_topics), grade=grade,
                problems='\n'.join(f'- {p}' for p in notes_data.get('problems') or []) or '-',
                fixes='\n'.join(f'- {f}' for f in notes_data.get('fixes') or []) or '-',
                complaints=complaints,
                timeline=', timeline' if data.get('timeline') else '',
                lesson=_lesson_for_prompt(data))
            new = call_polza([{'role': 'user', 'content': prompt}], max_tokens=2600, temperature=0.4,
                             timeout=22, retries=0)
            if not isinstance(new, dict) or not new.get('theory_blocks'):
                cur.execute("INSERT INTO lesson_versions (cache_key, version, status, lesson_data, reason) "
                            "VALUES (%s, 0, 'failed', '{}'::jsonb, 'методист не ответил')", (key,))
                _log(cur, 'improve', key, title, 'ai_error', score)
                conn.commit()
                return {'step': 'improve', 'result': 'ai_error'}
            for k in ('_level', 'expert_tips', 'timeline'):
                if k in data and k not in new:
                    new[k] = data[k]
            new['_level'] = 'expert'
            # Были жалобы на задачи — задачи пересоберутся заново при следующем открытии.
            new['tasks'] = [] if had_task_reports else (data.get('tasks') or [])
            cur.execute(
                "INSERT INTO lesson_versions (cache_key, version, status, lesson_data, reason) "
                "VALUES (%s, (SELECT version + 1 FROM lesson_cache WHERE cache_key = %s), 'candidate', %s, %s)",
                (key, key, json.dumps(new, ensure_ascii=False), 'улучшение по замечаниям критика'))
            _log(cur, 'improve', key, title, 'candidate', score)
            conn.commit()
            return {'step': 'improve', 'result': 'candidate', 'lesson': title}

        # Шаг 1: берём следующий урок на проверку.
        row = _pick_lesson(cur)
        if not row:
            _log(cur, 'review', None, None, 'nothing')
            conn.commit()
            return {'step': 'review', 'result': 'nothing'}
        key, subject, grade, title, topic, data, _, _ = row
        if isinstance(data, str):
            data = json.loads(data)
        complaints, _ = _complaints(cur, subject, title or topic)
        review = _critic(call_polza, data, _subject_name(subject, subject_topics), grade, title or topic, complaints, year)
        if not review:
            cur.execute("UPDATE lesson_cache SET reviewed_at = NOW() - INTERVAL '%s days' WHERE cache_key = %s",
                        (REVIEW_EVERY_DAYS - 1, key))
            _log(cur, 'review', key, title, 'ai_error')
            conn.commit()
            return {'step': 'review', 'result': 'ai_error'}
        # Есть жалобы — урок переписываем даже при высокой оценке.
        score = review['score'] if not complaints else min(review['score'], GOOD_ENOUGH - 1)
        cur.execute(
            "UPDATE lesson_cache SET critic_score = %s, critic_notes = %s, reviewed_at = NOW() WHERE cache_key = %s",
            (score, json.dumps({'problems': review['problems'], 'fixes': review['fixes']}, ensure_ascii=False), key))
        _save_rule(cur, subject, review['rule'])
        _log(cur, 'review', key, title, 'needs_work' if score < GOOD_ENOUGH else 'good', score)
        conn.commit()
        return {'step': 'review', 'result': 'needs_work' if score < GOOD_ENOUGH else 'good', 'score': score, 'lesson': title}


def status(conn):
    """Сводка для админки: как растёт уровень уроков."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT count(*), count(critic_score), round(avg(critic_score)), "
            "count(*) FILTER (WHERE critic_score >= %s), count(*) FILTER (WHERE version > 1) "
            "FROM lesson_cache WHERE subject <> 'x_retired'", (GOOD_ENOUGH,))
        total, reviewed, avg_score, good, improved = cur.fetchone()
        cur.execute(
            "SELECT round(avg(score_after - score_before)) FROM methodist_runs "
            "WHERE step='verdict' AND result='accepted'")
        avg_gain = cur.fetchone()[0]
        cur.execute(
            "SELECT count(*) FILTER (WHERE result='accepted'), count(*) FILTER (WHERE result='rejected'), "
            "count(*) FILTER (WHERE step='review') FROM methodist_runs WHERE created_at > NOW() - INTERVAL '7 days'")
        acc7, rej7, rev7 = cur.fetchone()
        cur.execute(
            "SELECT step, lesson_title, result, score_before, score_after, created_at FROM methodist_runs "
            "WHERE result NOT IN ('nothing') ORDER BY id DESC LIMIT 15")
        recent = [
            {'step': r[0], 'lesson': r[1], 'result': r[2], 'before': r[3], 'after': r[4], 'at': r[5].isoformat()}
            for r in cur.fetchall()
        ]
        cur.execute(
            "SELECT count(*) FROM ai_knowledge_base WHERE agent_key='lesson_teacher' AND pattern_type='rule'")
        rules = cur.fetchone()[0]
    return {
        'lessons_total': total, 'lessons_reviewed': reviewed, 'avg_score': int(avg_score or 0),
        'lessons_good': good, 'lessons_improved': improved, 'avg_gain': int(avg_gain or 0),
        'week': {'accepted': acc7, 'rejected': rej7, 'reviewed': rev7},
        'rules': rules, 'recent': recent,
    }
