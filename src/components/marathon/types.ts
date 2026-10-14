export type MarathonTrack = "teacher" | "parent";

/** Интерактивные тренажёры, которые умеет показывать кабинет участника. */
export type ExerciseKind = "schulte" | "reading-test" | "wedge" | "flash-words";

export interface MarathonSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  tip?: string;
}

export interface MarathonExercise {
  kind: ExerciseKind;
  title: string;
  instruction: string;
}

export interface MarathonDay {
  day: number;
  title: string;
  subtitle: string;
  minutes: number;
  goals: string[];
  sections: MarathonSection[];
  exercises: MarathonExercise[];
  homework: { title: string; task: string; placeholder: string };
  /** Подсказки-вопросы для ИИ-наставника */
  mentorPrompts: string[];
}

export interface MarathonOffer {
  courseId: number;
  title: string;
  price: number;
  promoCode: string;
  promoPercent: number;
  bullets: string[];
}

export interface MarathonProgram {
  track: MarathonTrack;
  /** Адрес лендинга без слэша, например "marafon-skorochtenie-pedagogam" */
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  heroLead: string;
  heroImage: string;
  forWhom: { icon: string; title: string; text: string }[];
  results: string[];
  days: MarathonDay[];
  bonus: { title: string; text: string };
  offer: MarathonOffer;
  faq: { q: string; a: string }[];
  seo: { title: string; description: string; keywords: string };
}
