/**
 * Направления сайта — разделение по тому, КТО учится.
 *
 * Каждая страница относится ровно к одному направлению. Адреса страниц
 * не меняются (на них уже есть позиции в поиске) — направление задаётся
 * здесь, в одном месте, и по нему сайт сам подставляет меню, подвал,
 * переключатель и метку в Метрике.
 *
 *  kids     — Малыш, 1–6 лет, сайт для родителя
 *  school   — Школа, 1–11 класс, ученик и родитель
 *  adult    — Взрослые, от 18 лет
 *  business — Партнёрам и бизнесу (не направление обучения, а блок)
 *  common   — Общие страницы: кабинет, оплата, помощь, документы
 */
export type Direction = "kids" | "school" | "adult" | "business" | "common";
export type LearnerDirection = "kids" | "school" | "adult";

export interface DirectionMeta {
  id: LearnerDirection;
  label: string;
  short: string;
  age: string;
  emoji: string;
  icon: string;
  home: string;
  price: string;
  tagline: string;
  /** Градиент активной кнопки / акцентов */
  gradient: string;
  /** Цвет текста на тёмном фоне */
  text: string;
  ring: string;
}

export const DIRECTIONS: Record<LearnerDirection, DirectionMeta> = {
  kids: {
    id: "kids",
    label: "Малыш",
    short: "Малыш",
    age: "1–6 лет",
    emoji: "🧸",
    icon: "Baby",
    home: "/kids",
    price: "3 месяца бесплатно, далее 399 ₽/мес",
    tagline: "Развивающие занятия, песни, сказки и подготовка к школе",
    gradient: "from-amber-400 to-pink-400",
    text: "text-amber-200",
    ring: "ring-amber-300/50",
  },
  school: {
    id: "school",
    label: "Школа",
    short: "Школа",
    age: "1–11 класс",
    emoji: "🎒",
    icon: "Backpack",
    home: "/shkola",
    price: "1 490 ₽/мес за все предметы",
    tagline: "ИИ-репетитор 24/7, домашка по фото, ОГЭ и ЕГЭ, поступление",
    gradient: "from-purple-500 to-cyan-500",
    text: "text-cyan-200",
    ring: "ring-cyan-300/50",
  },
  adult: {
    id: "adult",
    label: "Взрослые",
    short: "Взрослым",
    age: "от 18 лет",
    emoji: "💼",
    icon: "Briefcase",
    home: "/vzroslym",
    price: "40+ программ, мини-курсы бесплатно",
    tagline: "Нейросети, удалённые профессии, своё дело и управление",
    gradient: "from-emerald-500 to-sky-500",
    text: "text-emerald-200",
    ring: "ring-emerald-300/50",
  },
};

export const LEARNER_ORDER: LearnerDirection[] = ["kids", "school", "adult"];

/* ───────────── Таблица «страница → направление» ─────────────
 * Порядок важен: побеждает первое совпадение. Точные адреса
 * задаются строкой, разделы — префиксом с «/» на конце или RegExp. */
type Rule = [string | RegExp, Direction];

/** Предметы /courses/:subject, которые относятся ко взрослым. */
export const ADULT_SUBJECTS = new Set([
  "datascience", "product", "avangard", "roomscan", "marketing", "prompteng",
  "neuroincome", "business", "sales", "python", "analyst", "accounting",
  "cybersec", "devops", "tenders", "ved", "autocad", "trading", "career",
  "aiagents", "marketplaces", "vibecoding",
]);

const RULES: Rule[] = [
  // ── Общее ──
  ["/", "common"],
  ["/courses", "common"],
  [/^\/(cabinet|checkout|course-checkout|search|help|contacts|reviews|referral|znaika|app|order|status|legal|auth|forgot-password|reset-password|promo|graduates|admin)(\/|$)/, "common"],

  // ── Малыш ──
  [/^\/kids(\/|$)/, "kids"],
  [/^\/draw(\/|$)/, "kids"],

  // ── Партнёрам и бизнесу ──
  [/^\/(for-business|corporate|for-schools|partners|partner|school-builder|repetitoram|grants|school|course|edtech-jobs)(\/|$)/, "business"],

  // ── Школа ──
  ["/shkola", "school"],
  [/^\/(tutor|repetitor|repetitor-online|pricing|homework|exam-bank|score-calculator|exam-checklist|math-problems|biology-problems|chemistry-problems|graduate|mgu-track|know-yourself|writing-craft|olympiad|super-courses|silent|dictionary|ai-persona|free-courses)(\/|$)/, "school"],
  [/^\/feed\/razbor-/, "school"],

  // ── Взрослые ──
  ["/vzroslym", "adult"],
  [/^\/(kursy-dlya-vzroslyh|kurs|remote-professions|nlp-master|klinicheskiy-psiholog|psychology|personal-brand|expert-content|tech-trends|intensive|ai-assistant|career-pro|business-coach|fin-advisor|bizlab|biz-report|business-2026|for-managers|instrumenty-rukovoditelya|orchestrator|zarabotok-na-neirosetyah|internet-marketing-s-nulya|kadrovye-dokumenty-proverka)(\/|$)/, "adult"],
];

/** Рекламные лендинги /ads/:slug — по своей аудитории. */
const AD_DIRECTION: Record<string, LearnerDirection> = {
  "ege-math": "school",
  oge: "school",
  kids: "kids",
  courses: "school",
  tutors: "school",
  "neuro-income": "adult",
  marketing: "adult",
  orchestrator: "adult",
};

/** Направление конкретной страницы. Для общих страниц — null-подобное «common». */
export function directionForPath(pathname: string): Direction {
  const path = pathname.replace(/\/+$/, "") || "/";

  const subject = path.match(/^\/courses\/([^/]+)/);
  if (subject) return ADULT_SUBJECTS.has(subject[1]) ? "adult" : "school";

  const ad = path.match(/^\/ads\/([^/]+)/);
  if (ad) return AD_DIRECTION[ad[1]] || "common";

  const mini = path.match(/^\/mini-course(?:\/([^/]+))?/);
  if (mini) return miniCourseDirection(mini[1]);

  if (/^\/feed(\/|$)/.test(path)) return "common";

  for (const [pattern, dir] of RULES) {
    if (typeof pattern === "string" ? pattern === path : pattern.test(path)) return dir;
  }
  return "common";
}

/** Мини-курсы: направление совпадает с полем track самого курса.
 *  Реестр тяжёлый (тексты всех уроков), поэтому школьные слаги держим здесь.
 *  Всё, что не в этом списке, — взрослые курсы. */
export const SCHOOL_MINI = new Set([
  "space-basics", "english-speak", "exam-calm", "history-logic", "literature-read",
  "math-without-fear", "money-teen", "physics-around", "digital-safety",
  "school-speak", "how-to-study", "time-teen",
]);

function miniCourseDirection(slug?: string): Direction {
  if (!slug) return "common";
  return SCHOOL_MINI.has(slug) ? "school" : "adult";
}

export function isLearner(d: Direction): d is LearnerDirection {
  return d === "kids" || d === "school" || d === "adult";
}

/* ───────────── Запоминание выбора ───────────── */
const STORAGE_KEY = "uchispro_direction_v1";

export function getSavedDirection(): LearnerDirection | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "kids" || v === "school" || v === "adult" ? v : null;
  } catch {
    return null;
  }
}

export function saveDirection(d: LearnerDirection) {
  try {
    localStorage.setItem(STORAGE_KEY, d);
  } catch {
    /* noop */
  }
}

/** Активное направление: страница своего направления или последний выбор. */
export function activeDirection(pathname: string): LearnerDirection | null {
  const d = directionForPath(pathname);
  if (isLearner(d)) return d;
  return getSavedDirection();
}