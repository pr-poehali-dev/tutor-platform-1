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
  showIf?: { key: string; in: string[] };
  maxSelect?: number;
}

// Чек-лист бизнес-тренера. Две ветки:
// - "decided": предприниматель знает цель роста → уточняем нишу и точки боли
// - "lost/doubting": не может определиться с направлением роста → узнаём сильные стороны,
//   ценности, и ИИ-тренер сам подбирает направление и стратегию.
export const CHECKLIST: ChecklistStep[] = [
  {
    key: "clarity",
    question: "Насколько вы определились, куда развивать своё дело?",
    hint: "Отвечайте честно — от этого зависит, как ИИ-тренер построит вашу стратегию.",
    type: "single",
    options: [
      { value: "decided", label: "Знаю цель — хочу конкретного роста", emoji: "🎯" },
      { value: "doubting", label: "Есть идеи, но сомневаюсь в направлении", emoji: "🤔" },
      { value: "lost", label: "Застрял — не понимаю, куда двигаться", emoji: "🧭" },
    ],
  },

  {
    key: "stage",
    question: "На какой стадии сейчас ваше дело?",
    type: "single",
    options: [
      { value: "idea", label: "Только идея — хочу запустить", emoji: "💡" },
      { value: "start", label: "Запустил недавно, ищу первых клиентов", emoji: "🌱" },
      { value: "running", label: "Действующий бизнес, но застрял в росте", emoji: "📊" },
      { value: "burnout", label: "Дело есть, но я выгорел / всё на мне", emoji: "😮‍💨" },
      { value: "scaling", label: "Расту и хочу масштабироваться", emoji: "🚀" },
    ],
  },
  {
    key: "role",
    question: "Кто вы в этом деле?",
    type: "single",
    options: [
      { value: "solo", label: "Работаю один / самозанятый", emoji: "🧑‍💻" },
      { value: "owner", label: "Владелец с небольшой командой", emoji: "👔" },
      { value: "expert", label: "Эксперт, продаю свои знания и услуги", emoji: "🎤" },
      { value: "manager", label: "Руководитель / управляю людьми", emoji: "🧭" },
      { value: "future", label: "Пока наёмный, хочу своё дело", emoji: "🔓" },
    ],
  },

  // ── Ветка «знаю цель»: ниша и точки боли ──
  {
    key: "goal",
    question: "Какого результата в бизнесе хотите достичь?",
    hint: "Своими словами — чем конкретнее, тем точнее стратегия.",
    type: "text",
    placeholder: "Например: выйти на 500 тыс/мес и перестать работать по 12 часов",
    showIf: { key: "clarity", in: ["decided", "doubting"] },
  },
  {
    key: "niche",
    question: "В какой сфере вы работаете (или планируете)?",
    type: "single",
    showIf: { key: "clarity", in: ["decided", "doubting"] },
    options: [
      { value: "services", label: "Услуги и сервис", emoji: "🤝" },
      { value: "products", label: "Товары и производство", emoji: "📦" },
      { value: "online", label: "Онлайн: инфобизнес, курсы, контент", emoji: "💻" },
      { value: "it", label: "IT и digital", emoji: "⚙️" },
      { value: "retail", label: "Розница, общепит, офлайн-точки", emoji: "🏬" },
      { value: "consulting", label: "Консалтинг, экспертиза, коучинг", emoji: "🧠" },
      { value: "creative", label: "Творчество, дизайн, медиа", emoji: "🎨" },
      { value: "other", label: "Другое / затрудняюсь", emoji: "✨" },
    ],
  },
  {
    key: "revenue",
    question: "Какой сейчас доход у вашего дела?",
    hint: "Примерно — чтобы тренер подобрал реалистичные цели по цифрам.",
    type: "single",
    showIf: { key: "clarity", in: ["decided", "doubting"] },
    options: [
      { value: "0", label: "Пока нет дохода / только старт", emoji: "🌱" },
      { value: "1-100k", label: "До 100 тыс/мес", emoji: "🚶" },
      { value: "100-300k", label: "100–300 тыс/мес", emoji: "🏃" },
      { value: "300k-1m", label: "300 тыс – 1 млн/мес", emoji: "📈" },
      { value: "1m+", label: "Больше 1 млн/мес", emoji: "🔥" },
    ],
  },

  // ── Ветка «застрял»: сильные стороны и ценности ──
  {
    key: "strengths",
    question: "В чём вы как предприниматель сильны? (выберите до 4)",
    hint: "Отметьте свои сильные стороны — тренер опрётся на них.",
    type: "multi",
    maxSelect: 4,
    showIf: { key: "clarity", in: ["doubting", "lost"] },
    options: [
      { value: "sales", label: "Продавать и договариваться", emoji: "🤝" },
      { value: "product", label: "Делать сильный продукт/услугу", emoji: "🛠️" },
      { value: "people", label: "Вдохновлять и вести людей", emoji: "🚩" },
      { value: "systems", label: "Строить системы и процессы", emoji: "🗂️" },
      { value: "creative", label: "Придумывать новое, креативить", emoji: "💡" },
      { value: "numbers", label: "Считать, анализировать цифры", emoji: "🔢" },
      { value: "marketing", label: "Привлекать внимание, маркетинг", emoji: "📣" },
      { value: "expertise", label: "Глубокая экспертиза в теме", emoji: "🎓" },
    ],
  },
  {
    key: "values",
    question: "Что для вас важнее всего в деле?",
    hint: "Выберите главную ценность — стратегия должна ей соответствовать.",
    type: "single",
    showIf: { key: "clarity", in: ["doubting", "lost"] },
    options: [
      { value: "income", label: "Максимальный доход и прибыль", emoji: "💵" },
      { value: "freedom", label: "Свобода и жизнь без операционки", emoji: "🕊️" },
      { value: "stability", label: "Стабильность и предсказуемость", emoji: "🛡️" },
      { value: "impact", label: "Польза людям и масштаб влияния", emoji: "🌍" },
      { value: "growth", label: "Рост и новые вызовы", emoji: "📈" },
      { value: "legacy", label: "Создать актив и наследие", emoji: "🏛️" },
    ],
  },

  // ── Общие вопросы для всех ──
  {
    key: "painpoints",
    question: "Что сейчас главные узкие места? (можно несколько)",
    hint: "Отметьте всё, что болит — тренер встроит решения в план.",
    type: "multi",
    maxSelect: 4,
    options: [
      { value: "leads", label: "Мало клиентов и заявок" },
      { value: "sales", label: "Плохо продаём / низкая конверсия" },
      { value: "money", label: "Нет ясности в финансах и прибыли" },
      { value: "operations", label: "Тону в операционке и текучке" },
      { value: "delegation", label: "Не умею делегировать / нет команды" },
      { value: "systems", label: "Всё держится на мне, нет системы" },
      { value: "marketing", label: "Не работает маркетинг и продвижение" },
      { value: "focus", label: "Распыляюсь, нет чёткой стратегии" },
      { value: "burnout", label: "Выгорание и усталость" },
    ],
  },
  {
    key: "skills",
    question: "Какие компетенции хотите прокачать? (можно несколько)",
    hint: "Отметьте всё важное — тренер встроит это в программу.",
    type: "multi",
    options: [
      { value: "strategy", label: "Стратегия и постановка целей" },
      { value: "finance", label: "Финансы, учёт, юнит-экономика" },
      { value: "sales", label: "Продажи и переговоры" },
      { value: "marketing", label: "Маркетинг и привлечение клиентов" },
      { value: "team", label: "Найм, команда, делегирование" },
      { value: "processes", label: "Системы и бизнес-процессы" },
      { value: "ai", label: "Нейросети и ИИ в бизнесе" },
      { value: "leadership", label: "Лидерство и управление" },
      { value: "personal", label: "Личная эффективность и энергия" },
    ],
  },
  {
    key: "time",
    question: "Сколько времени готовы уделять развитию?",
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
      { value: "1m", label: "За месяц — нужен быстрый рывок", emoji: "🔥" },
      { value: "3m", label: "За 2–3 месяца", emoji: "📅" },
      { value: "6m", label: "За полгода — основательно", emoji: "🌳" },
      { value: "flex", label: "Не тороплюсь, важнее устойчивость", emoji: "🧘" },
    ],
  },
  {
    key: "motivation",
    question: "Что мотивирует вас сильнее всего?",
    type: "single",
    options: [
      { value: "money", label: "Кратно вырасти в доходе", emoji: "💰" },
      { value: "freedom", label: "Свобода и время на жизнь", emoji: "🕊️" },
      { value: "scale", label: "Масштаб и большие цели", emoji: "🚀" },
      { value: "system", label: "Порядок и система вместо хаоса", emoji: "🗂️" },
      { value: "family", label: "Обеспечить семью и будущее", emoji: "🏡" },
    ],
  },
  {
    key: "obstacles",
    question: "Что мешало расти раньше? (необязательно)",
    hint: "Наставник учтёт это и даст «волшебный пинок», чтобы вы дошли до результата.",
    type: "text",
    placeholder: "Например: не хватало времени, тушил пожары, боялся нанимать, не считал деньги",
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
