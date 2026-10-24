"""ИИ-научрук для студентов: тема, план курсовой, проверка черновика, оформление по ГОСТу,
подготовка к защите и сессии. Помогает студенту сделать работу самому — готовые тексты не пишет."""
import json
import os
import urllib.request

import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
MODEL = 'openai/gpt-4o-mini'
IP_PER_HOUR = 20
MAX_INPUT = 12000

BASE_RULES = (
    "Ты — ИИ-научный руководитель УЧИСЬПРО для студентов колледжей и вузов России. "
    "Ты опытный преподаватель вуза: требовательный, но доброжелательный. "
    "Главное правило: ты помогаешь студенту сделать работу САМОМУ. Ты НЕ пишешь за него главы, введение, "
    "заключение, рефераты и готовые тексты для сдачи. Если просят «напиши за меня» — вежливо откажи одной фразой "
    "и предложи, чем помочь: план, тезисы, вопросы, разбор черновика. "
    "Не выдумывай источники, авторов, ГОСТы, статистику и цифры. Если ссылаешься на литературу — давай только "
    "направления поиска (eLibrary, КиберЛенинка, Google Академия, учебники по дисциплине) и ключевые слова, "
    "а не вымышленные названия. Нормативные документы называй только если уверен, что они существуют. "
    "Пиши по-русски, обращайся на «вы», структурно: короткие заголовки, нумерованные пункты. "
    "Без воды и общих слов — конкретно по теме студента. Разметка: **жирный** для заголовков, списки через «- » и «1. ». "
    "В конце — один короткий блок «Что сделать дальше» из 2–3 шагов."
)

MODES = {
    'topic': {
        'label': 'Выбор темы',
        'max_tokens': 1100,
        'task': (
            "Студент выбирает тему курсовой или дипломной. Предложи 5 тем: от более простой к более сильной. "
            "Для каждой: формулировка темы; почему она актуальна сейчас (1 предложение); объект и предмет исследования; "
            "где взять данные (открытые статистические источники, практика организации, опрос); "
            "риск темы (например, мало данных или слишком широко). В конце посоветуй, какую выбрать и почему, "
            "и покажи, как сузить слишком широкую тему на одном примере."
        ),
    },
    'plan': {
        'label': 'План работы',
        'max_tokens': 1400,
        'task': (
            "Составь план курсовой (или ВКР, если так сказано). Дай: актуальность (2–3 тезиса, не текст); "
            "цель; 3–5 задач, каждая соответствует параграфу; объект и предмет; методы исследования; "
            "содержание: введение, 2–3 главы с параграфами (теоретическая, аналитическая, проектная или практическая), "
            "заключение, список литературы, приложения. Для каждого параграфа — 1–2 предложения, что в нём должно быть, "
            "и примерный объём в страницах. Добавь график работы по неделям до срока сдачи, если срок указан."
        ),
    },
    'review': {
        'label': 'Проверка черновика',
        'max_tokens': 1500,
        'task': (
            "Проверь черновик студента как строгий научный руководитель. Не переписывай его текст целиком. Дай: "
            "**Общая оценка** — 2–3 предложения и оценка по шкале «нужно переделать / нужна доработка / почти готово». "
            "**Сильные стороны** — 2–3 пункта. "
            "**Что исправить** — 5–8 конкретных замечаний с цитатой фрагмента (до 15 слов) и объяснением, как исправить: "
            "логика и связность, соответствие цели и задачам, доказательность (утверждения без источников и цифр), "
            "научный стиль (разговорные обороты, «я», оценочные слова), повторы и вода, ошибки в терминах. "
            "**Вопросы, которые задаст преподаватель** — 3 вопроса по этому тексту. "
            "Можно показать, как улучшить ОДНО предложение, — для примера, не больше."
        ),
    },
    'gost': {
        'label': 'Оформление по ГОСТу',
        'max_tokens': 1300,
        'task': (
            "Помоги с оформлением по ГОСТу. Если студент прислал список литературы или ссылки — переоформи каждую запись "
            "по ГОСТ Р 7.0.100-2018 (библиографическая запись) и объясни, что исправлено; если данных не хватает "
            "(год, издательство, число страниц, дата обращения) — отметь [нужно уточнить], не выдумывай. "
            "Если вопрос про оформление текста — дай чек-лист по ГОСТ 7.32-2017 и типичным требованиям вузов: "
            "поля, шрифт и интервал, абзацный отступ, нумерация страниц, заголовки, рисунки и таблицы, формулы, "
            "сноски и ссылки на источники, приложения. Обязательно напомни: методичка кафедры важнее ГОСТа — если "
            "требования расходятся, действуют требования вуза."
        ),
    },
    'defense': {
        'label': 'Защита и сессия',
        'max_tokens': 1500,
        'task': (
            "Подготовь студента к защите работы или к экзамену. "
            "Если это защита: структура выступления на 5–7 минут по таймингу (что говорить в каждой части, тезисами, "
            "а не готовой речью); план слайдов презентации (8–12 слайдов, что на каждом); 10 вероятных вопросов комиссии "
            "с подсказкой, как строить ответ; 3 приёма, если не знаете ответа. "
            "Если это экзамен или зачёт: разбей материал на блоки, составь план повторения по дням до даты экзамена, "
            "дай 10 контрольных вопросов для самопроверки от простых к сложным и 3 ловушки, на которых обычно теряют баллы. "
            "Определи по запросу, что нужно — защита или экзамен."
        ),
    },
}

REFUSE_MARKERS = ('напиши за меня', 'напиши курсовую', 'напиши диплом', 'напиши мне курсовую', 'напиши введение',
                  'напиши главу', 'напиши реферат', 'сделай за меня', 'напиши заключение', 'напиши всю работу')


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors(), 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def t(name: str) -> str:
    return f'{SCHEMA}.{name}'


def client_ip(event: dict) -> str:
    headers = event.get('headers') or {}
    fwd = (headers.get('X-Forwarded-For') or headers.get('x-forwarded-for') or '').split(',')[0].strip()
    ip = fwd or ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp') or 'unknown'
    return str(ip)[:64]


def clean(v, n: int) -> str:
    return str(v or '').replace('\x00', '').strip()[:n]


def build_user_prompt(body: dict, mode: str) -> str:
    fields = [
        ('Тип работы', clean(body.get('work_type'), 60)),
        ('Направление / специальность', clean(body.get('field'), 200)),
        ('Дисциплина', clean(body.get('subject'), 200)),
        ('Тема', clean(body.get('topic'), 400)),
        ('Срок', clean(body.get('deadline'), 80)),
    ]
    head = '\n'.join(f'{k}: {v}' for k, v in fields if v)
    text = clean(body.get('text'), MAX_INPUT)
    label = {'review': 'Черновик', 'gost': 'Список литературы или вопрос по оформлению'}.get(mode, 'Запрос студента')
    return f"{head}\n\n{label}:\n{text}".strip()


def ask_ai(mode: str, prompt: str):
    key = os.environ.get('POLZA_API_KEY', '')
    if not key:
        return None
    cfg = MODES[mode]
    msgs = [
        {'role': 'system', 'content': BASE_RULES + '\n\nЗадача: ' + cfg['task']},
        {'role': 'user', 'content': prompt},
    ]
    payload = json.dumps({'model': MODEL, 'messages': msgs, 'temperature': 0.4,
                          'max_tokens': cfg['max_tokens']}).encode('utf-8')
    req = urllib.request.Request(POLZA_URL, data=payload, method='POST',
                                 headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=28) as r:
        data = json.loads(r.read().decode('utf-8'))
    return (data.get('choices') or [{}])[0].get('message', {}).get('content', '').strip() or None


def handler(event: dict, context) -> dict:
    """ИИ-научрук для студентов: выбор темы, план, проверка черновика, ГОСТ, защита и сессия."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or '').strip()

    if action == 'modes' or (event.get('httpMethod') == 'GET' and not action):
        return ok({'modes': [{'id': k, 'label': v['label']} for k, v in MODES.items()], 'per_hour': IP_PER_HOUR})

    if action != 'ask' or event.get('httpMethod') != 'POST':
        return err('Неизвестное действие', 404)

    try:
        body = json.loads(event.get('body') or '{}')
    except Exception:
        return err('Некорректные данные запроса')
    if not isinstance(body, dict):
        return err('Некорректные данные запроса')

    mode = clean(body.get('mode'), 20)
    if mode not in MODES:
        return err('Выберите, с чем помочь')
    prompt = build_user_prompt(body, mode)
    text = clean(body.get('text'), MAX_INPUT)
    if len(text) < 10 and len(clean(body.get('topic'), 400)) < 5:
        return err('Опишите задачу подробнее: тему, дисциплину или вставьте текст')
    if mode == 'review' and len(text) < 300:
        return err('Для проверки вставьте фрагмент черновика — хотя бы абзац-другой (от 300 символов)')

    low = text.lower()
    if any(m in low for m in REFUSE_MARKERS) and mode in ('topic', 'plan', 'defense'):
        prompt += "\n\n(Студент просит написать работу за него — напомни правило одной фразой и помоги в рамках режима.)"

    ip = client_ip(event)
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT count(*) FROM {t('student_mentor_requests')} "
                        f"WHERE ip=%s AND created_at > NOW() - interval '1 hour'", (ip,))
            if cur.fetchone()[0] >= IP_PER_HOUR:
                return err('Вы задали много вопросов подряд. Сделайте перерыв — научрук снова будет на связи через час.', 429)

            answer = None
            try:
                answer = ask_ai(mode, prompt)
            except Exception as e:
                print(f'[student-mentor] ai error: {str(e)[:200]}')

            cur.execute(f"INSERT INTO {t('student_mentor_requests')} (mode, ip, input_len, ok) VALUES (%s,%s,%s,%s)",
                        (mode, ip, len(text), bool(answer)))
            conn.commit()
    finally:
        conn.close()

    if not answer:
        return err('Научрук сейчас перегружен. Попробуйте ещё раз через минуту.', 503)
    return ok({'answer': answer, 'mode': mode})
