import { SubjectCode } from "@/components/graduate/graduateData";

export type ChecklistCategory = "docs" | "subject" | "vuz" | "psych" | "logistics";

export interface ChecklistTask {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  /** Если задача привязана к предмету — указывается. */
  subject?: SubjectCode;
  /** Дедлайн в формате YYYY-MM-DD или offset (D-30 = за 30 дней до ЕГЭ). */
  deadline?: string;
  /** Часов на выполнение (для планирования). */
  estimatedHours?: number;
  /** Ссылка для перехода к выполнению. */
  link?: string;
  /** Важность: critical / high / normal. */
  importance?: "critical" | "high" | "normal";
}

export const CATEGORY_LABELS: Record<ChecklistCategory, { label: string; emoji: string; color: string }> = {
  docs:      { label: "Документы",          emoji: "📄", color: "from-amber-500/20 to-orange-500/15 border-amber-500/35 text-amber-200" },
  subject:   { label: "Подготовка к ЕГЭ",   emoji: "📚", color: "from-purple-500/20 to-pink-500/15 border-purple-500/35 text-purple-200" },
  vuz:       { label: "Поступление в вуз",  emoji: "🎓", color: "from-cyan-500/20 to-blue-500/15 border-cyan-500/35 text-cyan-200" },
  psych:     { label: "Психологическая подготовка", emoji: "🧘", color: "from-emerald-500/20 to-teal-500/15 border-emerald-500/35 text-emerald-200" },
  logistics: { label: "Логистика в день ЕГЭ", emoji: "🎒", color: "from-rose-500/20 to-pink-500/15 border-rose-500/35 text-rose-200" },
};

// ─── ОБЩИЕ ЗАДАЧИ (всем выпускникам) ──────────────────────────────────
export const COMMON_TASKS: ChecklistTask[] = [
  // ДОКУМЕНТЫ
  { id: "doc-passport",  category: "docs", title: "Получить/проверить паспорт РФ", description: "Без паспорта на ЕГЭ не пустят. Проверь срок действия и сохранность.", deadline: "2026-01-15", importance: "critical" },
  { id: "doc-snils",     category: "docs", title: "СНИЛС и СНИЛС-карта",          description: "Нужен для подачи заявления и регистрации в вузах.", deadline: "2026-01-15", importance: "high" },
  { id: "doc-att",       category: "docs", title: "Аттестат об основном общем образовании", description: "Будет выдан после 11 класса — следи, чтобы в школе данные были корректны.", importance: "high" },
  { id: "doc-medspravka", category: "docs", title: "Медсправка 086/у (для вузов)", description: "Обязательна для зачисления в большинстве вузов. Оформляется заранее — 1–2 недели.", deadline: "2026-06-25", importance: "high" },
  { id: "doc-photo",     category: "docs", title: "Фото 3×4 (минимум 6 штук)",      description: "Для заявлений в вузы. Лучше сразу заказать 10 штук в цифровом виде.", deadline: "2026-06-15", importance: "normal" },

  // ИТОГОВОЕ СОЧИНЕНИЕ
  { id: "essay-write",   category: "subject", title: "Написать итоговое сочинение (декабрь)", description: "Допуск к ЕГЭ. Без зачёта по сочинению на ЕГЭ не пустят.", deadline: "2025-12-03", importance: "critical", link: "/writing-craft" },

  // ЗАЯВЛЕНИЯ
  { id: "ege-apply",     category: "docs", title: "Подать заявление на ЕГЭ", description: "Срок — до 1 февраля. Выбираешь предметы, после этой даты добавить нельзя.", deadline: "2026-02-01", importance: "critical" },
  { id: "ege-confirm",   category: "docs", title: "Подтвердить выбор предметов", description: "После 1 февраля можно только убрать — не добавить. Проверь дважды!", deadline: "2026-02-01", importance: "critical" },

  // ПОСТУПЛЕНИЕ В ВУЗ
  { id: "vuz-choose",    category: "vuz", title: "Выбрать 5 вузов и факультетов", description: "В 2026 году можно подавать в 5 вузов по 5 направлений в каждом. Подбери реальные варианты.", deadline: "2026-06-01", importance: "high", link: "/graduate" },
  { id: "vuz-orientation", category: "vuz", title: "Пройти профориентационный тест", description: "Точно узнай, какие профессии и вузы тебе подходят по способностям.", importance: "high", link: "/know-yourself" },
  { id: "vuz-portfolio", category: "vuz", title: "Собрать индивидуальные достижения", description: "Олимпиады, ГТО, волонтёрство, медаль — до 10 баллов дополнительно при поступлении.", deadline: "2026-06-15", importance: "high" },
  { id: "vuz-dvi",       category: "vuz", title: "Уточнить ДВИ в выбранных вузах", description: "МГУ, СПбГУ, МГИМО, творческие — требуют дополнительных вступительных испытаний.", deadline: "2026-04-01", importance: "high" },
  { id: "vuz-apply-docs", category: "vuz", title: "Подать документы в вузы", description: "Срок — до 25 июля (или раньше при ДВИ). Через Госуслуги это занимает 30 минут.", deadline: "2026-07-25", importance: "critical" },
  { id: "vuz-priority",  category: "vuz", title: "Подать приоритет согласия на зачисление", description: "До 4 августа выбираешь один вуз/направление, куда хочешь больше всего.", deadline: "2026-08-04", importance: "critical" },

  // ПСИХОЛОГИЯ
  { id: "psy-sleep",     category: "psych", title: "Наладить режим сна (минимум за 2 недели до ЕГЭ)", description: "8 часов сна = +10 баллов к ЕГЭ. Это не метафора, а нейробиология.", deadline: "2026-05-08", importance: "high" },
  { id: "psy-mock",      category: "psych", title: "Прорешать 3+ пробных ЕГЭ в режиме экзамена", description: "С таймером, бланками, без перерывов. Это тренировка психики, не знаний.", importance: "high", link: "/exam-bank" },
  { id: "psy-stress",    category: "psych", title: "Освоить технику успокоения за 30 секунд", description: "Дыхание 4–7–8: вдох 4 сек, задержка 7 сек, выдох 8 сек. Сбивает панику моментально.", importance: "normal" },

  // ЛОГИСТИКА В ДЕНЬ ЭКЗАМЕНА
  { id: "log-route",     category: "logistics", title: "Проверить адрес ППЭ и маршрут заранее", description: "За неделю съезди в пункт сдачи. Реально посмотри, где вход, сколько ехать, есть ли пробки.", importance: "high" },
  { id: "log-bag",       category: "logistics", title: "Собрать сумку накануне ЕГЭ", description: "Паспорт, чёрная гелевая ручка (2 шт), вода без этикетки, лекарства (если нужны). Никаких телефонов!", importance: "critical" },
  { id: "log-food",      category: "logistics", title: "Завтрак в день ЕГЭ — белок + сложные углеводы", description: "Овсянка с яйцом или творог с фруктами. Никакого кофе и сладкого — резкий скачок и упадок.", importance: "normal" },
  { id: "log-arrive",    category: "logistics", title: "Прийти в ППЭ за 30 минут до начала", description: "Очередь на проход через рамку, регистрация — занимает 20–30 минут.", importance: "critical" },
];

// ─── ЗАДАЧИ, ЗАВЯЗАННЫЕ НА КОНКРЕТНЫЙ ПРЕДМЕТ ────────────────────────
export function getSubjectTasks(subject: SubjectCode): ChecklistTask[] {
  const tasks: ChecklistTask[] = [];
  tasks.push({
    id: `subj-${subject}-codifier`,
    category: "subject",
    subject,
    title: `Изучить кодификатор ФИПИ по предмету`,
    description: "Список всех тем, которые могут быть на ЕГЭ. Распечатай и отмечай выполненное.",
    importance: "high",
  });
  tasks.push({
    id: `subj-${subject}-theory`,
    category: "subject",
    subject,
    title: `Пройти теорию по всем темам`,
    description: "Все темы курса в режиме «прочитал → разобрал пример». Без пропусков.",
    importance: "critical",
    link: "/courses",
    estimatedHours: 60,
  });
  tasks.push({
    id: `subj-${subject}-pract`,
    category: "subject",
    subject,
    title: `Прорешать 500+ задач в банке заданий`,
    description: "Регулярная практика > чтения теории. Каждый день минимум 10 задач.",
    importance: "critical",
    link: "/exam-bank",
    estimatedHours: 80,
  });
  tasks.push({
    id: `subj-${subject}-weak`,
    category: "subject",
    subject,
    title: `Закрыть 3 слабые темы (с ошибками ≥ 30%)`,
    description: "Посмотри в банке заданий, где у тебя самые низкие проценты — и работай только с ними.",
    importance: "high",
  });
  tasks.push({
    id: `subj-${subject}-mock`,
    category: "subject",
    subject,
    title: `Сдать минимум 3 пробных ЕГЭ`,
    description: "В формате реального экзамена: бланки, таймер, без перерывов.",
    importance: "critical",
    estimatedHours: 12,
  });
  return tasks;
}

/** Полный список задач для выпускника с учётом выбранных предметов. */
export function buildAllTasks(subjects: SubjectCode[]): ChecklistTask[] {
  const subjectTasks = subjects.flatMap((s) => getSubjectTasks(s));
  return [...COMMON_TASKS, ...subjectTasks];
}
