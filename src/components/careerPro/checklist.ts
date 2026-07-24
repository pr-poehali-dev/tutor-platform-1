import type { Answers } from "./api";

export type { Answers };

export interface ChecklistOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface ChecklistStep {
  key: string;
  question: string;
  hint?: string;
  type: "single" | "multi" | "text";
  options?: ChecklistOption[];
  placeholder?: string;
  optional?: boolean;
  // Шаг показывается, только если ответы удовлетворяют условию.
  // Ключ — поле предыдущего ответа, значение — допустимые варианты.
  showIf?: { key: string; in: string[] };
  maxSelect?: number;
}

// Чек-лист профориентации. Есть две ветки:
// - "decided": человек знает цель → уточняем сферу, уровень, навыки
// - "lost": человек НЕ может определиться → узнаём интересы, сильные стороны,
//   ценности, а ИИ-наставник сам подбирает направление и даёт план действий.
export const CHECKLIST: ChecklistStep[] = [
  {
    key: "clarity",
    question: "Насколько вы определились, чем хотите заниматься?",
    hint: "Отвечайте честно — от этого зависит, как ИИ-наставник построит ваш путь.",
    type: "single",
    options: [
      { value: "decided", label: "Знаю цель — хочу освоить конкретное направление", emoji: "🎯" },
      { value: "doubting", label: "Есть пара идей, но сомневаюсь", emoji: "🤔" },
      { value: "lost", label: "Совсем не могу определиться, чем заниматься", emoji: "🧭" },
    ],
  },

  // ── Возраст и жизненная ситуация — важно для взрослых 30–40+ ──
  {
    key: "age",
    question: "Сколько вам лет?",
    hint: "Это поможет наставнику подобрать реалистичный путь именно для вашего этапа.",
    type: "single",
    options: [
      { value: "under25", label: "До 25 лет", emoji: "🌱" },
      { value: "25-34", label: "25–34 года", emoji: "🚀" },
      { value: "35-44", label: "35–44 года", emoji: "💪" },
      { value: "45plus", label: "45 лет и старше", emoji: "🦉" },
    ],
  },
  {
    key: "situation",
    question: "Что сейчас ближе всего к вашей ситуации?",
    type: "single",
    options: [
      { value: "burnout", label: "Работаю, но выгорел / не моё", emoji: "😮‍💨" },
      { value: "switch", label: "Хочу сменить профессию", emoji: "🔄" },
      { value: "grow", label: "Хочу вырасти в доходе и статусе", emoji: "📈" },
      { value: "restart", label: "Долго не работал(а), хочу вернуться", emoji: "🔋" },
      { value: "business", label: "Хочу своё дело или фриланс", emoji: "🧑‍💻" },
      { value: "firstjob", label: "Ищу первую профессию", emoji: "✨" },
    ],
  },

  // ── Ветка «знаю цель» ──
  {
    key: "goal",
    question: "Кем вы хотите стать или какой результат получить?",
    hint: "Своими словами — чем конкретнее, тем точнее курс.",
    type: "text",
    placeholder: "Например: хочу освоить аналитику данных и перейти в IT",
    showIf: { key: "clarity", in: ["decided", "doubting"] },
  },
  {
    key: "field",
    question: "Какая сфера вам ближе?",
    type: "single",
    showIf: { key: "clarity", in: ["decided", "doubting"] },
    options: [
      { value: "it", label: "IT и технологии", emoji: "💻" },
      { value: "design", label: "Дизайн и креатив", emoji: "🎨" },
      { value: "management", label: "Управление и бизнес", emoji: "📈" },
      { value: "marketing", label: "Маркетинг и продажи", emoji: "🎯" },
      { value: "finance", label: "Финансы и аналитика", emoji: "💰" },
      { value: "helping", label: "Помогающие профессии (HR, коучинг, психология)", emoji: "🤝" },
      { value: "creative", label: "Творчество и медиа", emoji: "🎬" },
      { value: "hands", label: "Ручной труд и мастерство", emoji: "🛠️" },
      { value: "edu", label: "Образование и преподавание", emoji: "📚" },
      { value: "other", label: "Другое / затрудняюсь", emoji: "✨" },
    ],
  },

  // ── Ветка «не могу определиться»: интересы, сильные стороны, ценности ──
  {
    key: "interests",
    question: "Что вам искренне интересно? (выберите до 4)",
    hint: "Не думайте о профессии — просто отметьте, к чему вас тянет.",
    type: "multi",
    maxSelect: 4,
    showIf: { key: "clarity", in: ["doubting", "lost"] },
    options: [
      { value: "tech", label: "Техника, компьютеры, как всё устроено", emoji: "⚙️" },
      { value: "people", label: "Люди: помогать, общаться, вдохновлять", emoji: "💬" },
      { value: "numbers", label: "Цифры, логика, анализ", emoji: "🔢" },
      { value: "art", label: "Красота, дизайн, творчество", emoji: "🎨" },
      { value: "words", label: "Тексты, истории, языки", emoji: "✍️" },
      { value: "nature", label: "Природа, здоровье, тело", emoji: "🌿" },
      { value: "money", label: "Деньги, продажи, предпринимательство", emoji: "💰" },
      { value: "order", label: "Порядок, процессы, организация", emoji: "🗂️" },
      { value: "hands", label: "Делать что-то руками", emoji: "🛠️" },
      { value: "learn", label: "Узнавать новое и учить других", emoji: "📚" },
    ],
  },
  {
    key: "strengths",
    question: "В чём вы сильны? Что у вас получается лучше, чем у других?",
    hint: "Отметьте свои сильные стороны — наставник опрётся на них.",
    type: "multi",
    maxSelect: 4,
    showIf: { key: "clarity", in: ["doubting", "lost"] },
    options: [
      { value: "analytical", label: "Анализировать и раскладывать по полочкам", emoji: "🧠" },
      { value: "communication", label: "Находить общий язык с людьми", emoji: "🗣️" },
      { value: "creative", label: "Придумывать и создавать новое", emoji: "💡" },
      { value: "detail", label: "Внимание к деталям и аккуратность", emoji: "🔍" },
      { value: "leadership", label: "Вести за собой, брать ответственность", emoji: "🚩" },
      { value: "patience", label: "Терпение и доведение до конца", emoji: "🧩" },
      { value: "empathy", label: "Понимать и поддерживать других", emoji: "❤️" },
      { value: "hands", label: "Мастерство рук, техника", emoji: "🔧" },
    ],
  },
  {
    key: "values",
    question: "Что для вас важнее всего в работе?",
    hint: "Выберите главную ценность — путь должен ей соответствовать.",
    type: "single",
    showIf: { key: "clarity", in: ["doubting", "lost"] },
    options: [
      { value: "income", label: "Высокий доход", emoji: "💵" },
      { value: "freedom", label: "Свобода и гибкий график", emoji: "🕊️" },
      { value: "stability", label: "Стабильность и надёжность", emoji: "🛡️" },
      { value: "meaning", label: "Польза людям и смысл", emoji: "🌍" },
      { value: "growth", label: "Рост и развитие", emoji: "📈" },
      { value: "creativity", label: "Творчество и самовыражение", emoji: "🎨" },
    ],
  },

  // ── Общие вопросы для всех ──
  {
    key: "skills",
    question: "Какие навыки хотите прокачать? (можно несколько)",
    hint: "Отметьте всё, что важно — наставник встроит это в план.",
    type: "multi",
    options: [
      { value: "hard", label: "Профессиональные (hard) навыки" },
      { value: "tools", label: "Работа с инструментами и программами" },
      { value: "ai", label: "Нейросети и ИИ в работе" },
      { value: "communication", label: "Коммуникация и переговоры" },
      { value: "management", label: "Управление людьми и проектами" },
      { value: "money", label: "Как зарабатывать на этом" },
      { value: "portfolio", label: "Портфолио и первые заказы" },
      { value: "confidence", label: "Уверенность и самопрезентация" },
      { value: "discipline", label: "Дисциплина и привычка учиться" },
    ],
  },
  {
    key: "time",
    question: "Сколько времени готовы уделять?",
    type: "single",
    options: [
      { value: "2-3", label: "2–3 часа в неделю", emoji: "🐢" },
      { value: "4-6", label: "4–6 часов в неделю", emoji: "🚶" },
      { value: "7-10", label: "7–10 часов в неделю", emoji: "🏃" },
      { value: "10+", label: "Больше 10 часов — хочу быстро", emoji: "⚡" },
    ],
  },
  {
    key: "deadline",
    question: "За какой срок хотите увидеть результат?",
    type: "single",
    options: [
      { value: "1m", label: "За месяц — нужен быстрый старт", emoji: "🔥" },
      { value: "3m", label: "За 2–3 месяца", emoji: "📅" },
      { value: "6m", label: "За полгода — основательно", emoji: "🌳" },
      { value: "flex", label: "Не тороплюсь, важнее качество", emoji: "🧘" },
    ],
  },
  {
    key: "motivation",
    question: "Что мотивирует вас сильнее всего?",
    type: "single",
    options: [
      { value: "career", label: "Новая профессия и доход", emoji: "💼" },
      { value: "growth", label: "Рост на текущей работе", emoji: "📈" },
      { value: "business", label: "Своё дело / фриланс", emoji: "🧑‍💻" },
      { value: "self", label: "Развитие и уверенность в себе", emoji: "🌟" },
      { value: "family", label: "Обеспечить семью и будущее", emoji: "🏡" },
    ],
  },
  {
    key: "obstacles",
    question: "Что мешало раньше? (необязательно)",
    hint: "Наставник учтёт это и даст «волшебный пинок», чтобы вы дошли до конца.",
    type: "text",
    placeholder: "Например: не хватало времени, бросал на середине, страх начать, не верю в себя",
    optional: true,
  },
];

export function labelFor(step: ChecklistStep, value: string): string {
  return step.options?.find((o) => o.value === value)?.label || value;
}

// Шаги, актуальные для текущих ответов (учитывает showIf-условия).
export function visibleSteps(answers: Answers): ChecklistStep[] {
  return CHECKLIST.filter((s) => {
    if (!s.showIf) return true;
    const v = answers[s.showIf.key];
    return typeof v === "string" && s.showIf.in.includes(v);
  });
}