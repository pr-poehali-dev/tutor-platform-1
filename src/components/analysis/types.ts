export interface AnalysisSection {
  id: string;
  label: string;
  icon: string;
}

export interface AnalysisHero {
  name: string;
  role: string;
  trait: string;
  color: string;
}

export interface AnalysisAct {
  act: string;
  title: string;
  text: string;
}

export interface AnalysisQuote {
  text: string;
  who: string;
  note: string;
}

export interface AnalysisTheme {
  title: string;
  text: string;
  icon: string;
}

export interface AnalysisFact {
  k: string;
  v: string;
}

export interface AnalysisDevice {
  t: string;
  d: string;
}

export interface AnalysisQuizItem {
  q: string;
  options: string[];
  correct: number;
}

export interface AnalysisData {
  /** slug страницы, например "razbor-revizor-gogol" */
  slug: string;
  /** Автор, например "Н. В. Гоголь" */
  author: string;
  /** Заголовок-название произведения, например "Ревизор" */
  title: string;
  /** Подзаголовок в hero */
  subtitle: string;
  /** Палитра градиента названия в hero (tailwind), напр. "from-amber-200 via-amber-300 to-rose-300" */
  titleGradient: string;
  /** URL обложки */
  cover: string;
  /** Канонический URL */
  canonical: string;
  /** Дата публикации ISO, напр. "2026-06-21" */
  datePublished: string;
  /** Время чтения, напр. "18 мин чтения" */
  readingTime: string;

  /** SEO */
  seoTitle: string;
  seoDescription: string;
  /** Описание для JSON-LD */
  jsonLdDescription: string;

  facts: AnalysisFact[];
  /** Абзацы блока «О произведении» */
  aboutParagraphs: string[];

  /** Блок «История создания» */
  historyParagraphs: string[];
  historyCallout?: { title: string; text: string };

  /** Сюжет */
  plotIntro: string;
  acts: AnalysisAct[];

  /** Герои */
  heroesIntro: string;
  heroes: AnalysisHero[];

  /** Темы */
  themes: AnalysisTheme[];

  /** Композиция */
  compositionIntro: string;
  devices: AnalysisDevice[];

  /** Цитаты */
  quotes: AnalysisQuote[];

  /** Смысл */
  meaningParagraphs: string[];
  meaningCallout?: { title: string; text: string };

  /** Экзамен */
  examArguments: string[];
  examTopics: string[];

  /** Тест */
  quiz: AnalysisQuizItem[];
}

export const ANALYSIS_SECTIONS: AnalysisSection[] = [
  { id: "about", label: "О произведении", icon: "BookOpen" },
  { id: "history", label: "История создания", icon: "ScrollText" },
  { id: "plot", label: "Сюжет по действиям", icon: "ListOrdered" },
  { id: "heroes", label: "Система образов", icon: "Users" },
  { id: "themes", label: "Темы и проблемы", icon: "Lightbulb" },
  { id: "composition", label: "Композиция и приёмы", icon: "Layers" },
  { id: "quotes", label: "Цитаты с разбором", icon: "Quote" },
  { id: "meaning", label: "Смысл и финал", icon: "Sparkles" },
  { id: "exam", label: "Подготовка к экзамену", icon: "GraduationCap" },
  { id: "test", label: "Проверь себя", icon: "CircleCheck" },
];
