/** Шаблоны обучающих роликов — быстрый старт для студии. */
export interface LessonTemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Заготовка темы — {тема} пользователь заменит на своё. */
  topicHint: string;
  duration: number;
  style: string;
  voice: string;
  ageGroup: string;
}

export const LESSON_TEMPLATES: LessonTemplate[] = [
  {
    id: "explain",
    label: "Объяснение темы",
    emoji: "📚",
    description: "Понятный разбор новой темы с примерами из жизни",
    topicHint: "Объяснение темы: ",
    duration: 90,
    style: "flat",
    voice: "nika",
    ageGroup: "школьник 10-15 лет",
  },
  {
    id: "task",
    label: "Разбор задачи",
    emoji: "🧮",
    description: "Пошаговое решение типовой задачи ОГЭ/ЕГЭ",
    topicHint: "Разбор задачи: ",
    duration: 60,
    style: "flat",
    voice: "alex",
    ageGroup: "старшеклассник 15-18 лет",
  },
  {
    id: "history",
    label: "Исторический экскурс",
    emoji: "🏛️",
    description: "Яркий рассказ о событии или эпохе",
    topicHint: "Исторический экскурс: ",
    duration: 120,
    style: "realistic",
    voice: "dmitry",
    ageGroup: "школьник 12-16 лет",
  },
  {
    id: "experiment",
    label: "Научный опыт",
    emoji: "🔬",
    description: "Демонстрация явления простыми словами",
    topicHint: "Научный опыт: ",
    duration: 90,
    style: "realistic",
    voice: "sofia",
    ageGroup: "школьник 10-14 лет",
  },
  {
    id: "kids",
    label: "Для малышей",
    emoji: "🧸",
    description: "Добрый познавательный ролик для дошкольников",
    topicHint: "Познавательный ролик для малышей: ",
    duration: 60,
    style: "cartoon",
    voice: "fox",
    ageGroup: "дошкольник 4-7 лет",
  },
  {
    id: "cosmos",
    label: "Космос и природа",
    emoji: "🌌",
    description: "Захватывающее путешествие по Вселенной или природе",
    topicHint: "Путешествие: ",
    duration: 120,
    style: "cosmic",
    voice: "nika",
    ageGroup: "школьник 10-16 лет",
  },
];
