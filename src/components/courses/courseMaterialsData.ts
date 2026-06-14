// Вспомогательные материалы курса: рабочие тетради, чек-листы, шпаргалки,
// схемы, тренажёры. Помогают ученику закрепить знания после уроков.
//
// Материалы НЕ являются файлами для скачивания — это встроенные в платформу
// интерактивные и справочные материалы (чтобы не нарушать авторские права и
// не плодить «мёртвые» PDF-ссылки). Каждый материал имеет тип, который
// определяет иконку и подачу.

export type MaterialKind =
  | "workbook" // рабочая тетрадь / практикум
  | "cheatsheet" // шпаргалка / памятка
  | "checklist" // чек-лист
  | "scheme" // схема / инфографика
  | "trainer" // тренажёр
  | "template" // шаблон / заготовка
  | "glossary"; // словарь терминов

export interface CourseMaterial {
  kind: MaterialKind;
  title: string;
  description: string;
}

export interface MaterialKindMeta {
  label: string;
  icon: string;
  color: string; // tailwind «text-…» акцент
  bg: string; // tailwind «bg-…/border-…» фон карточки иконки
}

export const MATERIAL_KIND_META: Record<MaterialKind, MaterialKindMeta> = {
  workbook: { label: "Рабочая тетрадь", icon: "NotebookPen", color: "text-purple-300", bg: "bg-purple-500/15 border-purple-500/25" },
  cheatsheet: { label: "Шпаргалка", icon: "ScrollText", color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/25" },
  checklist: { label: "Чек-лист", icon: "ListChecks", color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/25" },
  scheme: { label: "Схема", icon: "Network", color: "text-cyan-300", bg: "bg-cyan-500/15 border-cyan-500/25" },
  trainer: { label: "Тренажёр", icon: "Dumbbell", color: "text-rose-300", bg: "bg-rose-500/15 border-rose-500/25" },
  template: { label: "Шаблон", icon: "LayoutTemplate", color: "text-sky-300", bg: "bg-sky-500/15 border-sky-500/25" },
  glossary: { label: "Словарь", icon: "BookA", color: "text-lime-300", bg: "bg-lime-500/15 border-lime-500/25" },
};

interface CourseLike {
  id: number;
  subject: string;
  title: string;
  grade: string;
  tags: string[];
}

// ── Кастомные наборы материалов для ключевых курсов (по id) ────────────────
const CUSTOM_MATERIALS: Record<number, CourseMaterial[]> = {
  // id 63 — Промпт-инженер
  63: [
    { kind: "workbook", title: "Рабочая тетрадь промптера", description: "60 практических заданий: переписать слабый промпт в сильный, собрать промпт по формуле RTCF, протестировать few-shot." },
    { kind: "cheatsheet", title: "Шпаргалка по фреймворкам промптинга", description: "Формула роль-задача-контекст-формат, приёмы chain-of-thought и few-shot на одной странице — держи под рукой во время работы." },
    { kind: "template", title: "20 готовых промпт-шаблонов", description: "Шаблоны под частые задачи: статья, резюме, анализ данных, чат-бот, перевод. Подставляй переменные — получай результат." },
    { kind: "checklist", title: "Чек-лист качества ответа ИИ", description: "Как за 1 минуту проверить ответ нейросети на галлюцинации, полноту и соответствие задаче." },
    { kind: "template", title: "Шаблон портфолио и резюме", description: "Готовая структура портфолио из 8 кейсов и резюме специалиста по ИИ — заполни и отправляй заказчику." },
    { kind: "glossary", title: "Словарь терминов ИИ", description: "LLM, токен, контекст, RAG, температура, галлюцинация — простыми словами, чтобы говорить с заказчиком на одном языке." },
  ],
  // id 64 — Заработок на нейросетях
  64: [
    { kind: "workbook", title: "Практикум «Услуга за вечер»", description: "Пошаговые задания: сделай логотип, смонтируй Reels, напиши контент-план. К концу каждого — готовая работа в портфолио." },
    { kind: "cheatsheet", title: "Шпаргалка по нейросетям для контента", description: "Какая нейросеть для чего: картинки, видео, тексты, озвучка. Доступ из России и бесплатные тарифы." },
    { kind: "template", title: "Шаблоны прайса и услуг", description: "Готовые пакеты услуг с ценами и описанием — адаптируй под себя и публикуй на бирже." },
    { kind: "checklist", title: "Чек-лист выхода на первый заказ", description: "Что сделать по шагам: портфолио, профиль на Авито/Кворк, первый отклик, безопасная сделка." },
    { kind: "scheme", title: "Карта заработка на ИИ", description: "Наглядная схема: какие услуги нужны бизнесу, сколько стоят и с чего начать новичку." },
  ],
  // id 17 — Английский 5–9
  17: [
    { kind: "workbook", title: "Рабочая тетрадь по грамматике", description: "Времена, артикли, предлоги — упражнения с самопроверкой по каждой теме." },
    { kind: "cheatsheet", title: "Шпаргалка неправильных глаголов", description: "Топ-100 неправильных глаголов с тремя формами и переводом — учим по частям." },
    { kind: "glossary", title: "Словарь 500 базовых слов", description: "Самые частотные английские слова по темам: семья, школа, еда, путешествия." },
    { kind: "trainer", title: "Тренажёр разговорных фраз", description: "Готовые фразы для диалогов: как познакомиться, спросить дорогу, заказать еду." },
  ],
};

// ── Наборы материалов по предметам (фоллбэк для всех курсов) ────────────────
function bySubject(subject: string): CourseMaterial[] {
  const map: Record<string, CourseMaterial[]> = {
    math: [
      { kind: "workbook", title: "Рабочая тетрадь с задачами", description: "Задачи по каждой теме с нарастающей сложностью и ответами для самопроверки." },
      { kind: "cheatsheet", title: "Шпаргалка с формулами", description: "Все ключевые формулы курса на одной странице — повторяй перед контрольной." },
      { kind: "trainer", title: "Тренажёр устного счёта", description: "Быстрые примеры на время, чтобы довести вычисления до автоматизма." },
      { kind: "scheme", title: "Схемы решения типовых задач", description: "Пошаговые алгоритмы: как подойти к задаче на движение, проценты, уравнения." },
    ],
    physics: [
      { kind: "cheatsheet", title: "Справочник формул", description: "Формулы по механике, электричеству и оптике с обозначениями величин." },
      { kind: "workbook", title: "Тетрадь с задачами и разборами", description: "Задачи с полным решением — учимся оформлять по критериям." },
      { kind: "scheme", title: "Схемы физических процессов", description: "Наглядные иллюстрации: силы, поля, цепи, лучи — чтобы понять, а не зубрить." },
    ],
    chemistry: [
      { kind: "cheatsheet", title: "Шпаргалка по реакциям", description: "Типы реакций, валентности и правила составления уравнений." },
      { kind: "scheme", title: "Таблица растворимости и схемы", description: "Удобные таблицы и схемы превращений веществ под рукой." },
      { kind: "workbook", title: "Практикум по уравниванию", description: "Задания на расстановку коэффициентов с ответами." },
    ],
    russian: [
      { kind: "cheatsheet", title: "Шпаргалка по орфографии", description: "Главные правила и исключения, которые чаще всего встречаются в диктантах." },
      { kind: "checklist", title: "Чек-лист проверки сочинения", description: "Что проверить перед сдачей: структура, аргументы, грамотность, объём." },
      { kind: "workbook", title: "Тетрадь упражнений", description: "Тренировочные задания по пунктуации и орфографии с самопроверкой." },
    ],
    literature: [
      { kind: "cheatsheet", title: "Карточки произведений", description: "Кратко: автор, герои, темы и проблемы каждого произведения программы." },
      { kind: "scheme", title: "Схемы литературных приёмов", description: "Метафора, антитеза, композиция — с примерами из классики." },
      { kind: "template", title: "Шаблон сочинения", description: "Готовая структура: тезис, аргументы, вывод — подставляй свои мысли." },
    ],
    english: [
      { kind: "glossary", title: "Тематический словарь", description: "Базовая лексика по темам с транскрипцией и переводом." },
      { kind: "cheatsheet", title: "Шпаргалка по временам", description: "Все времена в наглядной таблице с примерами употребления." },
      { kind: "trainer", title: "Тренажёр фраз", description: "Разговорные фразы для типичных ситуаций." },
    ],
    biology: [
      { kind: "scheme", title: "Схемы и иллюстрации", description: "Строение клетки, систем органов, пищевые цепи — наглядно." },
      { kind: "cheatsheet", title: "Шпаргалка с терминами", description: "Ключевые понятия курса с короткими определениями." },
      { kind: "workbook", title: "Рабочая тетрадь", description: "Задания на повторение каждой темы с ответами." },
    ],
    history: [
      { kind: "scheme", title: "Лента времени и схемы", description: "Хронология событий и причинно-следственные связи на одной схеме." },
      { kind: "cheatsheet", title: "Шпаргалка дат и личностей", description: "Главные даты, события и исторические деятели курса." },
      { kind: "glossary", title: "Словарь терминов", description: "Исторические понятия простыми словами." },
    ],
    cs: [
      { kind: "cheatsheet", title: "Шпаргалка по синтаксису", description: "Основные конструкции языка на одной странице." },
      { kind: "workbook", title: "Практикум с задачами", description: "Задания на программирование с разбором решений." },
      { kind: "scheme", title: "Схемы алгоритмов", description: "Блок-схемы типовых алгоритмов: сортировка, поиск, циклы." },
    ],
    ai: [
      { kind: "cheatsheet", title: "Шпаргалка по нейросетям", description: "Какая нейросеть для какой задачи и как с ней работать." },
      { kind: "template", title: "Готовые промпты", description: "Набор промптов под частые задачи — копируй и применяй." },
      { kind: "glossary", title: "Словарь терминов ИИ", description: "Базовые понятия искусственного интеллекта простыми словами." },
    ],
    marketing: [
      { kind: "template", title: "Шаблоны рекламных кампаний", description: "Готовые структуры объявлений, посадочных страниц и рассылок." },
      { kind: "checklist", title: "Чек-лист запуска рекламы", description: "Что проверить перед запуском кампании, чтобы не слить бюджет." },
      { kind: "scheme", title: "Схема воронки продаж", description: "Путь клиента от первого касания до покупки — наглядно." },
    ],
    robotics: [
      { kind: "scheme", title: "Схемы подключения", description: "Готовые схемы сборки датчиков, моторов и плат — собирай без ошибок." },
      { kind: "cheatsheet", title: "Шпаргалка по командам", description: "Основные команды Arduino и Python для робототехники." },
      { kind: "workbook", title: "Практикум по сборке", description: "Пошаговые мини-проекты с проверкой результата." },
    ],
  };
  return map[subject] || [];
}

/** Возвращает вспомогательные материалы курса. Есть у каждого курса. */
export function getCourseMaterials(course: CourseLike): CourseMaterial[] {
  const custom = CUSTOM_MATERIALS[course.id];
  if (custom && custom.length) return custom;

  const subjectSet = bySubject(course.subject);
  if (subjectSet.length) return subjectSet;

  // Универсальный набор — если для предмета нет своего
  return [
    { kind: "workbook", title: "Рабочая тетрадь курса", description: "Практические задания по каждой теме с ответами для самопроверки." },
    { kind: "cheatsheet", title: "Шпаргалка с главным", description: "Самое важное из курса на одной странице — повторяй перед проверкой знаний." },
    { kind: "checklist", title: "Чек-лист освоения тем", description: "Отмечай пройденное и сразу видь, что стоит повторить." },
    { kind: "glossary", title: "Словарь терминов", description: "Ключевые понятия курса с короткими понятными определениями." },
  ];
}
