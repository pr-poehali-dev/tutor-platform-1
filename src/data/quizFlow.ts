export interface QuizOption {
  id: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface QuizStep {
  id: string;
  question: string;
  hint?: string;
  options: QuizOption[];
  multi?: boolean;
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "grade",
    question: "В каком ты классе?",
    hint: "Подберём программу под твой уровень",
    options: [
      { id: "5-8", label: "5–8 класс", emoji: "🌱", description: "Базовая школа" },
      { id: "9", label: "9 класс", emoji: "🎯", description: "Готовлюсь к ОГЭ" },
      { id: "10", label: "10 класс", emoji: "📈", description: "До ЕГЭ ещё год" },
      { id: "11", label: "11 класс", emoji: "🔥", description: "Сдаю ЕГЭ скоро" },
    ],
  },
  {
    id: "goal",
    question: "Какая цель?",
    hint: "Можно выбрать несколько",
    multi: true,
    options: [
      { id: "exam", label: "Сдать экзамен на высокий балл", emoji: "🎓" },
      { id: "gaps", label: "Закрыть пробелы по школе", emoji: "🧩" },
      { id: "olymp", label: "Готовиться к олимпиадам", emoji: "🏆" },
      { id: "ahead", label: "Учиться с опережением", emoji: "🚀" },
    ],
  },
  {
    id: "subjects",
    question: "Какие предметы важны?",
    hint: "Выбери до 3 предметов",
    multi: true,
    options: [
      { id: "math", label: "Математика", emoji: "📐" },
      { id: "russian", label: "Русский язык", emoji: "📚" },
      { id: "physics", label: "Физика", emoji: "⚛️" },
      { id: "informatics", label: "Информатика", emoji: "💻" },
      { id: "social", label: "Обществознание", emoji: "🏛️" },
      { id: "english", label: "Английский", emoji: "🌍" },
      { id: "chemistry", label: "Химия", emoji: "🧪" },
      { id: "biology", label: "Биология", emoji: "🧬" },
    ],
  },
  {
    id: "pace",
    question: "Сколько готов заниматься?",
    hint: "Честный ответ — лучший план",
    options: [
      { id: "light", label: "20–30 минут в день", emoji: "☕", description: "Лайтовый темп" },
      { id: "normal", label: "1 час в день", emoji: "⏰", description: "Оптимально" },
      { id: "hard", label: "2+ часа в день", emoji: "💪", description: "Максимум за короткий срок" },
    ],
  },
];

export interface QuizResult {
  title: string;
  emoji: string;
  description: string;
  primarySubjects: string[];
  recommendedTrack: string;
  estimateMonths: number;
  ctaLabel: string;
  ctaPath: string;
  secondaryCtaLabel: string;
  secondaryCtaPath: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  math: "Математика",
  russian: "Русский язык",
  physics: "Физика",
  informatics: "Информатика",
  social: "Обществознание",
  english: "Английский",
  chemistry: "Химия",
  biology: "Биология",
};

export function buildResult(answers: Record<string, string[]>): QuizResult {
  const grade = answers.grade?.[0] ?? "11";
  const goals = answers.goal ?? ["exam"];
  const subjects = answers.subjects ?? ["math"];
  const pace = answers.pace?.[0] ?? "normal";

  const subjectNames = subjects.slice(0, 3).map((s) => SUBJECT_LABELS[s] ?? s);

  let title = "Твой персональный план готов";
  let emoji = "🎓";
  let description = "";
  let recommendedTrack = "";
  let estimateMonths = 4;

  const isExam = goals.includes("exam");

  if (grade === "11" && isExam) {
    title = "Интенсив ЕГЭ для 11 класса";
    emoji = "🔥";
    recommendedTrack = "Подготовка к ЕГЭ + сборник заданий с разбором";
    estimateMonths = pace === "hard" ? 3 : pace === "normal" ? 5 : 7;
    description = `За ${estimateMonths} месяца поднимем баллы по предметам: ${subjectNames.join(", ")}. ИИ-репетитор найдёт пробелы и составит маршрут до 90+ баллов.`;
  } else if (grade === "9" && isExam) {
    title = "Подготовка к ОГЭ для 9 класса";
    emoji = "🎯";
    recommendedTrack = "Курсы ОГЭ + банк типовых заданий";
    estimateMonths = pace === "hard" ? 4 : 6;
    description = `Доведём до уверенной «5» по предметам: ${subjectNames.join(", ")}. Тренировка на реальных заданиях ФИПИ.`;
  } else if (grade === "10") {
    title = "Стартуем подготовку к ЕГЭ заранее";
    emoji = "📈";
    recommendedTrack = "Базовый курс + диагностика пробелов";
    estimateMonths = 9;
    description = `За год до экзамена соберём прочную базу по предметам: ${subjectNames.join(", ")}. Без спешки и стресса.`;
  } else if (goals.includes("olymp")) {
    title = "Олимпиадный трек";
    emoji = "🏆";
    recommendedTrack = "Углублённые курсы + разбор сложных задач";
    estimateMonths = 6;
    description = `Прокачаем мышление для олимпиад по предметам: ${subjectNames.join(", ")}.`;
  } else if (goals.includes("ahead")) {
    title = "Программа с опережением";
    emoji = "🚀";
    recommendedTrack = "Курсы старших классов + дополнительные темы";
    estimateMonths = 6;
    description = `Идём на класс вперёд по предметам: ${subjectNames.join(", ")}.`;
  } else {
    title = "Закрываем пробелы";
    emoji = "🧩";
    recommendedTrack = "Адаптивная программа от диагностики";
    estimateMonths = 4;
    description = `ИИ-репетитор найдёт слабые места по предметам ${subjectNames.join(", ")} и подтянет их до уверенного уровня.`;
  }

  return {
    title,
    emoji,
    description,
    primarySubjects: subjectNames,
    recommendedTrack,
    estimateMonths,
    ctaLabel: "Подобрать курс",
    ctaPath: "/courses",
    secondaryCtaLabel: "Посмотреть задания экзамена",
    secondaryCtaPath: "/exam-bank",
  };
}