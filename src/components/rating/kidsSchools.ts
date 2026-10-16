import type { RatedSchool } from "./schools";

export type Grade = "1-4" | "5-8" | "9" | "10-11";
export type Goal = "grades" | "exam" | "olymp" | "home" | "english";
export type Format = "personal" | "group" | "self";
export type Budget = "low" | "mid" | "any";

export interface KidsSchool extends RatedSchool {
  grades: Grade[];
  goals: Goal[];
  formats: Format[];
  priceLevel: 1 | 2 | 3;
  payment: string;
  features: {
    allSubjects: boolean;
    exams: boolean;
    liveTeacher: boolean;
    noSchedule: boolean;
    homeSchool: boolean;
    freePart: boolean;
  };
}

export const FEATURE_LABELS: { key: keyof KidsSchool["features"]; label: string; hint: string }[] = [
  { key: "allSubjects", label: "Вся программа", hint: "Все основные предметы школьной программы" },
  { key: "exams", label: "ОГЭ и ЕГЭ", hint: "Отдельная подготовка к экзаменам" },
  { key: "liveTeacher", label: "Живой преподаватель", hint: "Занятия ведёт человек, а не запись или ИИ" },
  { key: "noSchedule", label: "Без расписания", hint: "Можно заниматься в любое время" },
  { key: "homeSchool", label: "Домашняя школа", hint: "Обучение вместо школы с аттестацией" },
  { key: "freePart", label: "Есть бесплатно", hint: "Бесплатные уроки или задания без оплаты" },
];

export const KIDS_SCHOOLS: KidsSchool[] = [
  {
    slug: "uchi-ru",
    name: "Учи.ру",
    segment: "1–11 класс, интерактивные задания",
    audience: "Школьники",
    revenue: "7,2 млрд ₽",
    growth: "+18%",
    summary:
      "Интерактивная платформа, которой пользуются многие школы России: учителя дают там задания. Задачи в игровой форме, олимпиады и платные занятия с преподавателем.",
    pros: [
      "Игровая подача, которая нравится младшим школьникам",
      "Многие учителя сами дают задания на платформе",
      "Много бесплатных олимпиад",
    ],
    cons: [
      "Бесплатная часть ограничена: полный доступ платный",
      "Для старшеклассников и экзаменов подходит меньше",
      "Игровой формат не заменит объяснения сложной темы",
    ],
    bestFor: "Ученикам начальной и средней школы для ежедневной практики",
    url: "https://uchi.ru",
    grades: ["1-4", "5-8"],
    goals: ["grades", "olymp"],
    formats: ["self", "personal"],
    priceLevel: 2,
    payment: "Подписка на полный доступ, отдельно — занятия с преподавателем",
    features: { allSubjects: true, exams: false, liveTeacher: true, noSchedule: true, homeSchool: false, freePart: true },
  },
  {
    slug: "foxford",
    name: "Фоксфорд",
    segment: "1–11 класс, экзамены, олимпиады",
    audience: "Школьники",
    revenue: "5,8 млрд ₽",
    growth: "+12%",
    summary:
      "Онлайн-школа с курсами преподавателей для 1–11 классов. Курсы по предметам, подготовка к ОГЭ, ЕГЭ и олимпиадам, домашняя школа с аттестацией и индивидуальные репетиторы.",
    pros: [
      "Сильные преподаватели, в том числе из ведущих вузов",
      "Домашняя школа с официальной аттестацией",
      "Одна из лучших программ подготовки к олимпиадам",
    ],
    cons: [
      "Несколько предметов сразу выходят дорого",
      "Вебинары по расписанию — подстраиваться приходится ребёнку",
      "Высокий темп подходит не каждому",
    ],
    bestFor: "Сильным ученикам, олимпиадникам и семьям на домашнем обучении",
    url: "https://foxford.ru",
    grades: ["1-4", "5-8", "9", "10-11"],
    goals: ["exam", "olymp", "home", "grades"],
    formats: ["group", "personal"],
    priceLevel: 3,
    payment: "Курсы, пакеты занятий, подписка на домашнюю школу",
    features: { allSubjects: true, exams: true, liveTeacher: true, noSchedule: false, homeSchool: true, freePart: true },
  },
  {
    slug: "umskul",
    name: "Умскул",
    segment: "ОГЭ и ЕГЭ",
    audience: "9 и 11 класс",
    revenue: "5,3 млрд ₽",
    growth: "+34%",
    summary:
      "Крупнейшая по выручке школа подготовки к экзаменам. Групповые занятия с молодыми преподавателями, домашние задания проверяют наставники.",
    pros: [
      "Подготовка строго под задания экзамена",
      "Наставник проверяет домашки и следит за прогрессом",
      "Понятная подача и общение с ровесниками",
    ],
    cons: [
      "В основном годовая программа, отдельную тему взять сложно",
      "Много занятий по расписанию",
      "Только экзамены, а не вся школьная программа",
    ],
    bestFor: "Девятиклассникам и одиннадцатиклассникам перед экзаменами",
    url: "https://umschool.net",
    grades: ["9", "10-11"],
    goals: ["exam"],
    formats: ["group"],
    priceLevel: 2,
    payment: "Курсы помесячно или за год, по каждому предмету отдельно",
    features: { allSubjects: false, exams: true, liveTeacher: true, noSchedule: false, homeSchool: false, freePart: true },
  },
  {
    slug: "100ballnik",
    name: "100балльный репетитор",
    segment: "ОГЭ и ЕГЭ",
    audience: "9 и 11 класс",
    revenue: "4,4 млрд ₽",
    growth: "+118%",
    summary:
      "Самая быстрорастущая EdTech-компания 2025 года: выручка выросла более чем вдвое. Подготовка к экзаменам на вебинарах с разбором заданий.",
    pros: [
      "Узкий фокус на экзаменах",
      "Много бесплатных разборов и материалов",
      "Активно развивает программы",
    ],
    cons: [
      "Быстрый рост: стабильность качества ещё предстоит проверить",
      "Вебинары по расписанию",
      "Только подготовка к экзаменам",
    ],
    bestFor: "Тем, кто готовится к экзамену и хочет занятий с преподавателем",
    url: "https://100ballnik.com",
    grades: ["9", "10-11"],
    goals: ["exam"],
    formats: ["group"],
    priceLevel: 2,
    payment: "Курсы помесячно, по каждому предмету отдельно",
    features: { allSubjects: false, exams: true, liveTeacher: true, noSchedule: false, homeSchool: false, freePart: true },
  },
  {
    slug: "skysmart",
    name: "Skysmart",
    segment: "Индивидуальные уроки, 1–11 класс",
    audience: "Школьники",
    revenue: null,
    growth: null,
    summary:
      "Детская онлайн-школа группы Skyeng: индивидуальные уроки с преподавателем по английскому, математике и другим предметам, подготовка к ОГЭ и ЕГЭ.",
    pros: [
      "Преподаватель занимается один на один",
      "Сильная программа английского языка",
      "Удобная интерактивная платформа для урока",
    ],
    cons: [
      "Индивидуальный формат дороже группового",
      "Уроки оплачиваются пакетами заранее",
      "Результат сильно зависит от конкретного преподавателя",
    ],
    bestFor: "Тем, кому важно внимание преподавателя и разговорный английский",
    url: "https://skysmart.ru",
    grades: ["1-4", "5-8", "9", "10-11"],
    goals: ["english", "grades", "exam"],
    formats: ["personal"],
    priceLevel: 3,
    payment: "Пакеты индивидуальных уроков",
    features: { allSubjects: false, exams: true, liveTeacher: true, noSchedule: false, homeSchool: false, freePart: true },
  },
  {
    slug: "interneturok",
    name: "ИнтернетУрок",
    segment: "Видеоуроки и домашняя школа",
    audience: "Школьники",
    revenue: null,
    growth: null,
    summary:
      "Одна из старейших российских платформ видеоуроков по школьной программе. Есть домашняя школа: ребёнок учится дома, а аттестацию проходит официально.",
    pros: [
      "Огромная библиотека видеоуроков по всем предметам",
      "Домашняя школа с аттестацией",
      "Можно смотреть уроки в своём темпе",
    ],
    cons: [
      "Видеоуроки без живого общения быстро утомляют",
      "Нужна сильная самодисциплина",
      "Мало индивидуальной обратной связи в базовом формате",
    ],
    bestFor: "Семьям на домашнем обучении и тем, кто учится в своём темпе",
    url: "https://interneturok.ru",
    grades: ["1-4", "5-8", "9", "10-11"],
    goals: ["home", "grades"],
    formats: ["self", "group"],
    priceLevel: 2,
    payment: "Подписка на видеоуроки, отдельно — домашняя школа",
    features: { allSubjects: true, exams: true, liveTeacher: false, noSchedule: true, homeSchool: true, freePart: true },
  },
  {
    slug: "yaklass",
    name: "ЯКласс",
    segment: "Тренажёры по школьной программе",
    audience: "Школьники",
    revenue: null,
    growth: null,
    summary:
      "Онлайн-тренажёр с задачами по школьным предметам и автоматической проверкой. Пользуются многие школы: учителя задают там домашние работы.",
    pros: [
      "Много бесплатных заданий с мгновенной проверкой",
      "Задания совпадают со школьной программой",
      "Учитель видит результаты ученика",
    ],
    cons: [
      "Полные решения и часть функций — по платной подписке",
      "Тренажёр, а не объяснение: тему нужно понимать заранее",
      "Для экзаменов не хватает разборов сложных заданий",
    ],
    bestFor: "Для ежедневной отработки тем, которые проходят в школе",
    url: "https://www.yaklass.ru",
    grades: ["1-4", "5-8", "9", "10-11"],
    goals: ["grades"],
    formats: ["self"],
    priceLevel: 1,
    payment: "Бесплатно с ограничениями, недорогая подписка",
    features: { allSubjects: true, exams: false, liveTeacher: false, noSchedule: true, homeSchool: false, freePart: true },
  },
  {
    slug: "tetrika",
    name: "Тетрика",
    segment: "Онлайн-репетиторы",
    audience: "Школьники",
    revenue: null,
    growth: null,
    summary:
      "Онлайн-школа индивидуальных занятий с репетитором по всем школьным предметам: от подтягивания оценок до подготовки к ОГЭ и ЕГЭ.",
    pros: [
      "Репетитор по любому предмету один на один",
      "Можно подобрать время занятий под ученика",
      "Подготовка к экзаменам и помощь с текущими темами",
    ],
    cons: [
      "Индивидуальные занятия дороже групп и самостоятельных форматов",
      "Нужно заранее покупать пакет уроков",
      "Качество зависит от выбранного репетитора",
    ],
    bestFor: "Тем, кому нужен персональный репетитор по конкретному предмету",
    url: "https://tetrika-school.ru",
    grades: ["1-4", "5-8", "9", "10-11"],
    goals: ["grades", "exam", "english"],
    formats: ["personal"],
    priceLevel: 3,
    payment: "Пакеты индивидуальных занятий",
    features: { allSubjects: true, exams: true, liveTeacher: true, noSchedule: false, homeSchool: false, freePart: true },
  },
  {
    slug: "webium",
    name: "Вебиум",
    segment: "ОГЭ и ЕГЭ",
    audience: "9 и 11 класс",
    revenue: null,
    growth: null,
    summary:
      "Школа подготовки к экзаменам: вебинары с преподавателями, наставники и проверка домашних заданий по критериям экзамена.",
    pros: [
      "Программа построена по заданиям экзамена",
      "Наставник проверяет домашки по критериям",
      "Записи занятий остаются, если пропустил",
    ],
    cons: [
      "Занятия по расписанию",
      "Каждый предмет оплачивается отдельно",
      "Только экзамены, а не вся программа",
    ],
    bestFor: "Выпускникам, которым нужна системная подготовка с наставником",
    url: "https://webium.ru",
    grades: ["9", "10-11"],
    goals: ["exam"],
    formats: ["group"],
    priceLevel: 2,
    payment: "Курсы помесячно, по каждому предмету отдельно",
    features: { allSubjects: false, exams: true, liveTeacher: true, noSchedule: false, homeSchool: false, freePart: true },
  },
  {
    slug: "uchispro",
    name: "УЧИСЬПРО",
    segment: "1–11 класс, ИИ-наставник",
    audience: "Школьники",
    revenue: null,
    growth: null,
    own: true,
    summary:
      "Наша платформа. Молодая и небольшая, поэтому стоит последней. Вместо преподавателя — ИИ-наставник: объясняет темы голосом, проверяет домашку по фото и не даёт готовых ответов, а ведёт к решению.",
    pros: [
      "Все предметы за одну оплату: 1 490 ₽ в месяц или 9 990 ₽ за год",
      "Круглосуточно и без расписания, объясняет тему столько раз, сколько нужно",
      "Бесплатно: первый урок каждого предмета, проверка домашки по фото и 30+ мини-курсов",
    ],
    cons: [
      "Нет живого преподавателя",
      "Молодая платформа с небольшим числом отзывов",
      "Нет домашней школы с аттестацией",
    ],
    bestFor: "Тем, кому нужна ежедневная помощь по всем предметам за небольшие деньги",
    url: "/pricing",
    grades: ["1-4", "5-8", "9", "10-11"],
    goals: ["grades", "exam"],
    formats: ["self"],
    priceLevel: 1,
    payment: "Подписка на все предметы или разовая покупка предмета за 1 990 ₽",
    features: { allSubjects: true, exams: true, liveTeacher: false, noSchedule: true, homeSchool: false, freePart: true },
  },
];

export const PRICE_LABEL: Record<1 | 2 | 3, string> = { 1: "₽", 2: "₽₽", 3: "₽₽₽" };

export const PICKER = {
  grade: [
    { v: "1-4", label: "1–4 класс" },
    { v: "5-8", label: "5–8 класс" },
    { v: "9", label: "9 класс" },
    { v: "10-11", label: "10–11 класс" },
  ] as { v: Grade; label: string }[],
  goal: [
    { v: "grades", label: "Подтянуть оценки", icon: "TrendingUp" },
    { v: "exam", label: "ОГЭ или ЕГЭ", icon: "FileCheck" },
    { v: "olymp", label: "Олимпиады", icon: "Trophy" },
    { v: "home", label: "Домашнее обучение", icon: "House" },
    { v: "english", label: "Английский", icon: "Languages" },
  ] as { v: Goal; label: string; icon: string }[],
  format: [
    { v: "personal", label: "Преподаватель один на один", icon: "User" },
    { v: "group", label: "Группа и вебинары", icon: "Users" },
    { v: "self", label: "Сам, в своём темпе", icon: "Clock" },
  ] as { v: Format; label: string; icon: string }[],
  budget: [
    { v: "low", label: "Как можно дешевле" },
    { v: "mid", label: "Средний" },
    { v: "any", label: "Не главное" },
  ] as { v: Budget; label: string }[],
};

export interface PickAnswers {
  grade: Grade;
  goal: Goal;
  format: Format;
  budget: Budget;
}

export interface PickResult {
  school: KidsSchool;
  score: number;
  reasons: string[];
}

export function pickSchools(a: PickAnswers): PickResult[] {
  const goalLabel = PICKER.goal.find((g) => g.v === a.goal)!.label.toLowerCase();
  const formatLabel = PICKER.format.find((f) => f.v === a.format)!.label.toLowerCase();
  return KIDS_SCHOOLS.map((s) => {
    let score = 0;
    const reasons: string[] = [];
    if (s.goals.includes(a.goal)) {
      score += 4;
      reasons.push(`Подходит для цели «${goalLabel}»`);
    }
    if (s.grades.includes(a.grade)) score += 2;
    else score -= 5;
    if (s.formats.includes(a.format)) {
      score += 3;
      reasons.push(`Формат: ${formatLabel}`);
    }
    const maxPrice = a.budget === "low" ? 1 : a.budget === "mid" ? 2 : 3;
    if (s.priceLevel <= maxPrice) {
      score += 2;
      if (a.budget !== "any") reasons.push("Укладывается в бюджет");
    } else score -= 2 * (s.priceLevel - maxPrice);
    if (a.goal === "home" && s.features.homeSchool) score += 2;
    if (s.features.freePart) reasons.push("Можно попробовать бесплатно");
    return { school: s, score, reasons: reasons.slice(0, 3) };
  })
    .filter((r) => r.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 3);
}

export const KIDS_FAQ = [
  {
    q: "Какая онлайн-школа лучше для подготовки к ЕГЭ?",
    a: "Для системной подготовки в группе с наставником — Умскул, 100балльный репетитор или Вебиум. Если нужен преподаватель один на один — Тетрика или Skysmart. Для сильных учеников, которые целятся в 90+ и олимпиады, — Фоксфорд. Если важны цена и занятия в любое время — УЧИСЬПРО.",
  },
  {
    q: "Какую онлайн-школу выбрать для младшего школьника?",
    a: "В 1–4 классе лучше всего работают короткие ежедневные занятия в игровой форме — например, Учи.ру или ЯКласс. Если ребёнку нужен взрослый рядом, подойдут индивидуальные уроки в Skysmart или Тетрике.",
  },
  {
    q: "Где учиться на домашнем обучении с аттестацией?",
    a: "Домашние школы с официальной аттестацией есть у Фоксфорда и ИнтернетУрока. УЧИСЬПРО домашнюю школу не предлагает — это помощь в учёбе, а не замена школы.",
  },
  {
    q: "Можно ли заниматься бесплатно?",
    a: "Бесплатная часть есть почти у всех школ из рейтинга: пробные уроки, задания или разборы. Больше всего бесплатных заданий у ЯКласса и Учи.ру. В УЧИСЬПРО бесплатны первый урок каждого предмета, проверка домашки по фото и больше 30 мини-курсов.",
  },
  {
    q: "Чем ИИ-наставник отличается от живого репетитора?",
    a: "ИИ-наставник доступен в любое время, объясняет одну тему сколько угодно раз и стоит в разы дешевле. Живой преподаватель сильнее в мотивации и лучше чувствует ребёнка. Многие семьи совмещают: ИИ — для ежедневной практики, репетитор — для сложных тем.",
  },
  {
    q: "Как устроен рейтинг?",
    a: "Сначала идут школы, которые вошли в топ-10 EdTech-компаний России по выручке за 2025 год по данным Smart Ranking, — от самой крупной. Затем известные школы без публичных данных о выручке. УЧИСЬПРО — последней как самая молодая. Подбор школы на странице не зависит от места в рейтинге.",
  },
];
