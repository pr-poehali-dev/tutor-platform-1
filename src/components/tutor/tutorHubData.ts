// Данные флагманского раздела «Репетитор» (/tutor).
// Единая точка входа во все обучающие возможности УЧИСЬПРО для ученика и родителя.

export interface TutorFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string; // lucide icon name
  emoji: string;
  href: string;
  accent: string; // hex для свечения/акцента
  badge?: string; // подпись-плашка (напр. «Бесплатно», «Хит»)
  cta: string;
}

export interface TutorSubject {
  id: string;
  name: string;
  emoji: string;
  href: string;
  accent: string;
}

export interface TutorStep {
  n: number;
  title: string;
  text: string;
  icon: string;
}

// Главная функция раздела — ИИ-наставник с голосом.
export const HERO_FEATURE: TutorFeature = {
  id: "ai-teacher",
  title: "ИИ-наставник с голосом",
  subtitle: "Личный репетитор 24/7",
  description:
    "Живой голосовой учитель ведёт урок, объясняет тему своими словами, отвечает на вопросы и хвалит за успехи. Как настоящий репетитор — только всегда рядом и без записи.",
  icon: "GraduationCap",
  emoji: "🎓",
  href: "/super-courses",
  accent: "#a855f7",
  badge: "Первый урок бесплатно",
  cta: "Начать урок",
};

// Ключевые инструменты репетитора — то, что раньше было раскидано по сайту.
export const TUTOR_FEATURES: TutorFeature[] = [
  {
    id: "super-courses",
    title: "Супер-курсы",
    subtitle: "Физика · Математика · Информатика",
    description:
      "Полная школьная программа плюс профильный ЕГЭ, ДВИ и олимпиады. Каждый урок наставник ведёт голосом от простого к сложному.",
    icon: "Atom",
    emoji: "⚡",
    href: "/super-courses",
    accent: "#00d4ff",
    badge: "Уровень репетитора",
    cta: "Смотреть курсы",
  },
  {
    id: "homework",
    title: "Проверка домашки",
    subtitle: "По фото за минуту",
    description:
      "Сфотографируй задачу или своё решение в тетради — ИИ распознает почерк и формулы, решит и подробно объяснит каждый шаг.",
    icon: "Camera",
    emoji: "📸",
    href: "/homework",
    accent: "#22c55e",
    badge: "Хит",
    cta: "Проверить задачу",
  },
  {
    id: "problems",
    title: "Задачники по предметам",
    subtitle: "Разбор с объяснением",
    description:
      "Тренажёры по математике, биологии и химии: реши задачу и сразу получи разбор от наставника, а не просто ответ.",
    icon: "ListChecks",
    emoji: "🧮",
    href: "/math-problems",
    accent: "#f59e0b",
    cta: "К задачам",
  },
  {
    id: "exams",
    title: "Подготовка к экзаменам",
    subtitle: "ЕГЭ · ОГЭ · поступление",
    description:
      "Банк заданий, калькулятор баллов и трек поступления в вуз мечты. Готовься системно и понимай, где ты сейчас.",
    icon: "Target",
    emoji: "🎯",
    href: "/exam-bank",
    accent: "#ef4444",
    cta: "Готовиться к ЕГЭ",
  },
];

// Быстрый выбор предмета — прямой заход в нужную тему.
export const TUTOR_SUBJECTS: TutorSubject[] = [
  { id: "physics", name: "Физика", emoji: "⚡", href: "/super-courses", accent: "#00d4ff" },
  { id: "math", name: "Математика", emoji: "🧮", href: "/super-courses", accent: "#a855f7" },
  { id: "cs", name: "Информатика", emoji: "💻", href: "/super-courses", accent: "#22d3ee" },
  { id: "biology", name: "Биология", emoji: "🧬", href: "/biology-problems", accent: "#22c55e" },
  { id: "chemistry", name: "Химия", emoji: "🧪", href: "/chemistry-problems", accent: "#f97316" },
  { id: "literature", name: "Литература", emoji: "📚", href: "/feed", accent: "#f43f5e" },
];

// Как это работает — 3 шага.
export const TUTOR_STEPS: TutorStep[] = [
  {
    n: 1,
    title: "Выбери предмет или задачу",
    text: "Начни урок с наставником, открой задачник или сфотографируй домашку — всё в одном месте.",
    icon: "MousePointerClick",
  },
  {
    n: 2,
    title: "Занимайся с наставником",
    text: "ИИ-репетитор объясняет голосом, отвечает на вопросы и подстраивается под твой темп.",
    icon: "MessagesSquare",
  },
  {
    n: 3,
    title: "Виден результат",
    text: "Копишь XP, закрываешь темы и видишь прогресс — как в игре, только по-настоящему учишься.",
    icon: "TrendingUp",
  },
];

// Аргументы «почему мы» — доверие.
export const TUTOR_PERKS: { icon: string; title: string; text: string }[] = [
  { icon: "Clock", title: "Всегда доступен", text: "Урок в любое время дня и ночи, без записи и ожидания" },
  { icon: "Wallet", title: "Дешевле репетитора", text: "Один предмет — 1990 ₽ навсегда вместо тысяч за занятие" },
  { icon: "Mic", title: "Живой голос", text: "Наставник говорит, а не пишет — учиться легко и не скучно" },
  { icon: "ShieldCheck", title: "По программе РФ", text: "Школьная программа 7–11 класс плюс профильный ЕГЭ и ДВИ" },
];
