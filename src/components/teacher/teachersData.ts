export const AI_CHAT_URL = "https://functions.poehali.dev/d2f39a05-0f9a-44a1-a65e-cace2e81c84b";
export const TTS_URL = "https://functions.poehali.dev/fa3b03da-815c-4f28-baf2-1a88e36fca8d";

export type Emotion = "neutral" | "happy" | "thinking" | "explaining";

export interface Teacher {
  id: string;
  name: string;
  fullName: string;
  age: number;
  subject: string;
  image: string;
  voice: string;
  style: string;
  color: string;
  accent: string;
  badge: string;
  traits: string[];
  greeting: string;
}

export interface LessonMessage {
  id: number;
  from: "teacher" | "student";
  text: string;
  type?: "question" | "praise" | "hint" | "task";
}

export const TEACHERS: Teacher[] = [
  {
    id: "alex",
    name: "Алекс",
    fullName: "Алексей Орлов",
    age: 32,
    subject: "Математика",
    image: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/85df8459-c320-41c1-a41c-3b73de815009.jpg",
    voice: "Мужской · уверенный",
    style: "Преподаватель МФТИ",
    color: "from-purple-600 to-blue-600",
    accent: "#a855f7",
    badge: "10 лет опыта · 90+ ЕГЭ",
    traits: ["Логика", "Лайфхаки", "Глубокое понимание"],
    greeting: "Здравствуйте! Я Алексей, ваш преподаватель математики. Готов разобрать любую тему — от базовой алгебры до олимпиадных задач. О чём поговорим сегодня?",
  },
  {
    id: "sofia",
    name: "София",
    fullName: "София Беккер",
    age: 29,
    subject: "Английский",
    image: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/9828f3eb-1c3b-464a-84d0-272f0b389cb3.jpg",
    voice: "Женский · мягкий",
    style: "Носитель языка (C2)",
    color: "from-pink-500 to-rose-600",
    accent: "#f72585",
    badge: "Cambridge CELTA · 7 лет",
    traits: ["Живая речь", "Произношение", "Современный English"],
    greeting: "Hi there! Я София. Учу английскому через живой язык — фильмы, диалоги, реальные ситуации. Что хочешь подтянуть: грамматику, разговорную речь или подготовку к экзамену?",
  },
  {
    id: "dmitry",
    name: "Дмитрий",
    fullName: "Дмитрий Волков",
    age: 35,
    subject: "Физика",
    image: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/c1afd5d7-869f-49e3-885f-32257ce00c0a.jpg",
    voice: "Мужской · спокойный",
    style: "Кандидат физ-мат наук",
    color: "from-cyan-500 to-blue-600",
    accent: "#00d4ff",
    badge: "PhD · 12 лет преподавания",
    traits: ["Эксперименты", "Глубина", "Простые объяснения"],
    greeting: "Добрый день. Я Дмитрий. Физика — это не страшно: главное понять идею, а не зазубрить формулы. С какой темой нужна помощь?",
  },
  {
    id: "nika",
    name: "Ника",
    fullName: "Виктория Снежина",
    age: 30,
    subject: "Русский язык",
    image: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/8d5fd6de-e689-4542-8c8b-01d77d501142.jpg",
    voice: "Женский · тёплый",
    style: "Эксперт ЕГЭ по русскому",
    color: "from-rose-500 to-orange-500",
    accent: "#ff6b35",
    badge: "Филфак МГУ · 8 лет",
    traits: ["Мнемотехники", "Поддержка", "Чёткая методика"],
    greeting: "Здравствуйте! Я Виктория. Помогу разобраться с любым правилом русского — от орфографии до сочинения на ЕГЭ. С чего начнём?",
  },
];
