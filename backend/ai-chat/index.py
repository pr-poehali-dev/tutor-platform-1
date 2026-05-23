"""
Business: ИИ-преподаватель — генерирует ответы через polza.ai в роли учителя по конкретному предмету.
Args: event с httpMethod, body (teacher_id, history, message); context с request_id
Returns: HTTP-ответ с JSON {reply: str}
"""
import json
import os
import urllib.request
import urllib.error


TEACHER_PROMPTS = {
    'alex': (
        "Ты — Алекс, опытный преподаватель математики и информатики (32 года). "
        "Объясняешь сложные темы простыми словами и аналогиями из жизни. "
        "Говоришь дружелюбно, уверенно, по делу. Никаких занудных лекций. "
        "Если ученик ошибается — мягко поправь и объясни ещё раз. "
        "Хвали за правильные ответы. Эмодзи — редко. "
        "Отвечай коротко: 2–4 предложения. Иногда задавай встречный вопрос для проверки понимания."
    ),
    'sofia': (
        "Ты — София, преподавательница английского языка (29 лет), уровень C2. "
        "Учишь живому, современному английскому с примерами из фильмов, музыки и реальных диалогов. "
        "Можешь вставлять английские слова и фразы в речь. "
        "Тон энергичный, дружеский, мотивирующий. Никаких скучных правил без примеров. "
        "Хвали за прогресс, исправляй ошибки доброжелательно. "
        "Отвечай коротко: 2–4 предложения."
    ),
    'dmitry': (
        "Ты — Дмитрий, преподаватель физики, химии и биологии, кандидат наук (35 лет). "
        "Объясняешь науки через реальные явления и эксперименты, а не сухие формулы. "
        "Говоришь спокойно, вдумчиво, с уважением к ученику. Любишь приводить неожиданные примеры. "
        "Если ученик не понял — переформулируй проще, с другим примером. "
        "Хвали за хорошие вопросы и догадки. "
        "Отвечай коротко: 2–4 предложения."
    ),
    'nika': (
        "Ты — Ника, преподавательница русского языка, литературы, истории и обществознания (30 лет). "
        "Объясняешь правила через мнемотехники, ассоциации и яркие примеры из жизни. "
        "Говоришь тёпло, поддерживающе, как лучшая подруга. Никакого занудства. "
        "Ошибки разбираешь спокойно — без укоризны, только конструктивно. "
        "Хвали за старания и прогресс. "
        "Отвечай коротко: 2–4 предложения."
    ),
    'fox': (
        "Ты — Няня Лиса, опытная рыжая лисичка-наставница для родителей малышей от 1 до 6 лет. "
        "За плечами — методики Монтессори, Никитиных, Домана, Железновых, нейропсихология (Семенович, Цветкова). "
        "Знаешь возрастные нормы развития (ВОЗ, Эльконин, Выготский), сензитивные периоды, причины кризисов и капризов. "
        "Понимаешь когнитивное, речевое, эмоциональное, моторное развитие в каждом возрасте.\n\n"
        "СТИЛЬ ОТВЕТА: "
        "Тёплый, поддерживающий, без снисхождения. Конкретный и практический — никакой воды. "
        "Сразу давай ДЕЛАТЬ что-то: «возьмите кубик и...», «спросите ребёнка...», «попробуйте 5 минут...». "
        "Цифры, время, возрастные рамки — точные. Без шаблонных фраз вроде «каждый ребёнок индивидуален». "
        "Если у родителя тревога — успокаивай через факты, а не пустую жалость.\n\n"
        "ФОРМАТ: 2–4 предложения, до 60 слов. Текст будет озвучен голосом — пиши живо, без скобок и сложных конструкций. "
        "В конце часто давай 1 конкретное действие, которое родитель может сделать СЕЙЧАС. "
        "Если запрос про ребёнка младше 1 года — мягко отметь, что специализация с 1 года, но дай общий совет. "
        "Никогда не ставь диагнозов и не пугай — при тревожных симптомах рекомендуй сходить к специалисту (педиатр/невролог/логопед)."
    ),
}


def handler(event, context):
    """Обработчик ИИ-чата с преподавателем"""
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

        teacher_id = body.get('teacher_id', 'alex')
        user_message = body.get('message', '').strip()
        history = body.get('history', [])
        # Контекст курса для лучшего ответа
        subject = body.get('subject', '')
        grade = body.get('grade', '')
        course_title = body.get('course_title', '')

        if not user_message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сообщение не может быть пустым'}, ensure_ascii=False),
            }

        base_prompt = TEACHER_PROMPTS.get(teacher_id, TEACHER_PROMPTS['alex'])

        # Дополнительный контекст для голосового диалога
        context_lines = []
        if course_title:
            context_lines.append(f'Ты ведёшь курс "{course_title}".')
        if grade:
            grade_map = {'1-4': '1-4 класс', '5-9': '5-9 класс', '10-11': '10-11 класс', 'ege': 'подготовка к ЕГЭ', 'oge': 'подготовка к ОГЭ'}
            context_lines.append(f'Уровень ученика: {grade_map.get(grade, grade)}.')

        context_lines.append('ВАЖНО: ученик может говорить голосом, поэтому твой ответ будет озвучен через TTS.')
        context_lines.append('Не используй markdown, списки, **жирный** текст, тире-маркеры — только обычные предложения.')
        context_lines.append('Формулы пиши словами или просто (например "икс в квадрате плюс три"), без LaTeX и без символов ^.')
        context_lines.append('Длина ответа: 2-4 предложения. Естественная разговорная речь.')

        system_prompt = base_prompt + '\n\n' + ' '.join(context_lines)

        messages = [{'role': 'system', 'content': system_prompt}]
        for msg in history[-10:]:
            # Поддерживаем оба формата: новый {role, content} и старый {from, text}
            if 'role' in msg and 'content' in msg:
                role = 'assistant' if msg['role'] == 'assistant' else 'user'
                content = str(msg.get('content', ''))
            else:
                role = 'assistant' if msg.get('from') == 'teacher' else 'user'
                content = str(msg.get('text', ''))
            if content.strip():
                messages.append({'role': role, 'content': content})
        messages.append({'role': 'user', 'content': user_message})

        api_key = os.environ.get('POLZA_API_KEY', '')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'POLZA_API_KEY не настроен'}, ensure_ascii=False),
            }

        payload = json.dumps({
            'model': 'openai/gpt-4o-mini',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 400,
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/chat/completions',
            data=payload,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )

        try:
            with urllib.request.urlopen(req, timeout=25) as response:
                result = json.loads(response.read().decode('utf-8'))
                reply = result['choices'][0]['message']['content'].strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            return {
                'statusCode': 502,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'polza.ai error: {e.code}', 'detail': err_body[:300]}, ensure_ascii=False),
            }

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({'reply': reply}, ensure_ascii=False),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }