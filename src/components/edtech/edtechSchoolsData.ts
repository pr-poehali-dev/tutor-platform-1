/**
 * Справочник онлайн-школ России (EdTech-работодателей), которые регулярно
 * нанимают преподавателей, кураторов и методистов.
 *
 * Это ЭТАЛОННАЯ база, собранная вручную по публично известным школам рынка.
 * Ссылки careersUrl ведут на официальные страницы вакансий/«работа у нас».
 * Мы не парсим hh.ru и не выдаём чужие данные за свои — здесь только
 * публичная навигация: куда идти соискателю-преподавателю.
 *
 * hiring — наша экспертная оценка активности найма, а не гарантия открытой
 * вакансии прямо сейчас (рынок меняется). Соискатель проверяет актуальность
 * по careersUrl.
 */

export type HiringStatus = "active" | "regular" | "occasional";
export type SchoolSegment =
  | "school" // школьная программа / ОГЭ-ЕГЭ
  | "it" // программирование, IT
  | "lang" // языки
  | "prof" // профессии / взрослым
  | "kids" // дети, дошкольники
  | "creative"; // дизайн, творчество

export interface EdTechSchool {
  id: number;
  name: string;
  segment: SchoolSegment;
  /** Что преподают — направления, по которым чаще всего ищут педагогов. */
  subjects: string[];
  /** Кого нанимают: роли. */
  roles: string[];
  hiring: HiringStatus;
  /** Формат работы преподавателя. */
  remote: boolean;
  /** Официальная страница вакансий / «Работа у нас». */
  careersUrl: string;
  site: string;
  emoji: string;
  color: string; // tailwind gradient
  /** Короткое честное описание школы как работодателя. */
  note: string;
}

export const SEGMENTS: { id: SchoolSegment | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "Все направления", emoji: "🎯" },
  { id: "school", label: "Школьная программа, ОГЭ/ЕГЭ", emoji: "📚" },
  { id: "it", label: "IT и программирование", emoji: "💻" },
  { id: "lang", label: "Иностранные языки", emoji: "🌍" },
  { id: "prof", label: "Профессии и взрослым", emoji: "💼" },
  { id: "kids", label: "Дети и дошкольники", emoji: "🧸" },
  { id: "creative", label: "Дизайн и творчество", emoji: "🎨" },
];

export const HIRING_LABELS: Record<HiringStatus, { label: string; tone: string }> = {
  active: {
    label: "Активно нанимает",
    tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  regular: {
    label: "Регулярный набор",
    tone: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  },
  occasional: {
    label: "Точечный набор",
    tone: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
};

export const EDTECH_SCHOOLS: EdTechSchool[] = [
  {
    id: 1,
    name: "Skysmart",
    segment: "school",
    subjects: ["Математика", "Английский", "Русский", "Физика", "Химия", "Подготовка к ЕГЭ/ОГЭ"],
    roles: ["Преподаватель", "Куратор"],
    hiring: "active",
    remote: true,
    careersUrl: "https://skyeng.ru/vacancy/",
    site: "https://skysmart.ru",
    emoji: "🚀",
    color: "from-sky-500 to-blue-600",
    note: "Крупная школа для детей от Skyeng. Постоянно набирает предметников на удалёнку.",
  },
  {
    id: 2,
    name: "Skyeng",
    segment: "lang",
    subjects: ["Английский язык", "Другие иностранные языки"],
    roles: ["Преподаватель английского", "Методист"],
    hiring: "active",
    remote: true,
    careersUrl: "https://skyeng.ru/vacancy/",
    site: "https://skyeng.ru",
    emoji: "🌐",
    color: "from-blue-500 to-indigo-600",
    note: "Один из крупнейших наймов преподавателей английского в онлайне.",
  },
  {
    id: 3,
    name: "Фоксфорд",
    segment: "school",
    subjects: ["Все школьные предметы", "Олимпиадная подготовка", "ЕГЭ", "ОГЭ"],
    roles: ["Преподаватель", "Наставник", "Методист"],
    hiring: "active",
    remote: true,
    careersUrl: "https://foxford.ru/about/vacancies",
    site: "https://foxford.ru",
    emoji: "🦊",
    color: "from-orange-500 to-amber-600",
    note: "Онлайн-школа и репетиторы. Ищет сильных предметников и олимпиадников.",
  },
  {
    id: 4,
    name: "Учи.ру",
    segment: "school",
    subjects: ["Начальная школа", "Математика", "Русский", "Окружающий мир"],
    roles: ["Методист", "Преподаватель", "Автор заданий"],
    hiring: "regular",
    remote: true,
    careersUrl: "https://uchi.ru/company/vacancies",
    site: "https://uchi.ru",
    emoji: "🎓",
    color: "from-violet-500 to-purple-600",
    note: "Образовательная платформа для школ. Набирает методистов и авторов контента.",
  },
  {
    id: 5,
    name: "Синергия (онлайн)",
    segment: "prof",
    subjects: ["Бизнес", "Менеджмент", "Маркетинг", "Госпрограммы", "Высшее образование"],
    roles: ["Преподаватель", "Спикер", "Куратор"],
    hiring: "regular",
    remote: true,
    careersUrl: "https://synergy.ru/o_nas/vacancy",
    site: "https://synergy.ru",
    emoji: "🏛️",
    color: "from-red-500 to-rose-600",
    note: "Университет и онлайн-программы для взрослых. Разные преподавательские роли.",
  },
  {
    id: 6,
    name: "Skillbox",
    segment: "prof",
    subjects: ["Дизайн", "Программирование", "Маркетинг", "Управление", "Игры"],
    roles: ["Преподаватель-практик", "Ревьюер", "Методист"],
    hiring: "active",
    remote: true,
    careersUrl: "https://skillbox.ru/vacancies/",
    site: "https://skillbox.ru",
    emoji: "🟩",
    color: "from-green-500 to-emerald-600",
    note: "Онлайн-университет профессий. Нанимает практикующих экспертов как спикеров.",
  },
  {
    id: 7,
    name: "GeekBrains",
    segment: "it",
    subjects: ["Программирование", "Data Science", "Аналитика", "Дизайн"],
    roles: ["Преподаватель", "Наставник", "Ревьюер кода"],
    hiring: "regular",
    remote: true,
    careersUrl: "https://gb.ru/vacancies",
    site: "https://gb.ru",
    emoji: "🧠",
    color: "from-teal-500 to-cyan-600",
    note: "IT-образование. Ищет наставников и ревьюеров из индустрии.",
  },
  {
    id: 8,
    name: "Нетология",
    segment: "prof",
    subjects: ["Маркетинг", "Программирование", "Аналитика", "Дизайн", "Управление"],
    roles: ["Преподаватель-эксперт", "Куратор", "Методист"],
    hiring: "active",
    remote: true,
    careersUrl: "https://netology.ru/vacancies",
    site: "https://netology.ru",
    emoji: "📈",
    color: "from-fuchsia-500 to-pink-600",
    note: "Онлайн-университет. Постоянно ищет экспертов-практиков в свои программы.",
  },
  {
    id: 9,
    name: "Яндекс Практикум",
    segment: "it",
    subjects: ["Программирование", "Аналитика данных", "Дизайн", "Менеджмент"],
    roles: ["Наставник", "Ревьюер", "Автор курса"],
    hiring: "active",
    remote: true,
    careersUrl: "https://practicum.yandex.ru/profession/",
    site: "https://practicum.yandex.ru",
    emoji: "⚡",
    color: "from-yellow-400 to-amber-500",
    note: "IT-профессии с нуля. Активно нанимает наставников и ревьюеров-практиков.",
  },
  {
    id: 10,
    name: "Тетрика",
    segment: "school",
    subjects: ["Все школьные предметы", "ЕГЭ", "ОГЭ"],
    roles: ["Репетитор", "Преподаватель"],
    hiring: "active",
    remote: true,
    careersUrl: "https://tetrika-school.ru/repetitoram",
    site: "https://tetrika-school.ru",
    emoji: "📐",
    color: "from-indigo-500 to-blue-600",
    note: "Онлайн-репетиторы по школьным предметам. Открытый набор преподавателей.",
  },
  {
    id: 11,
    name: "Умскул (Umschool)",
    segment: "school",
    subjects: ["Подготовка к ЕГЭ", "ОГЭ", "Школьные предметы"],
    roles: ["Преподаватель", "Куратор", "Ментор"],
    hiring: "active",
    remote: true,
    careersUrl: "https://umschool.net/vacancy",
    site: "https://umschool.net",
    emoji: "🎯",
    color: "from-purple-500 to-violet-600",
    note: "Подготовка к ЕГЭ/ОГЭ. Массово набирает преподавателей и кураторов к сезону.",
  },
  {
    id: 12,
    name: "MAXIMUM Education",
    segment: "school",
    subjects: ["ЕГЭ", "ОГЭ", "Профориентация", "Английский"],
    roles: ["Преподаватель", "Куратор", "Наставник"],
    hiring: "regular",
    remote: true,
    careersUrl: "https://maximumtest.ru/vacancy",
    site: "https://maximumtest.ru",
    emoji: "🔺",
    color: "from-rose-500 to-red-600",
    note: "Подготовка к экзаменам и профориентация. Регулярный набор педагогов.",
  },
  {
    id: 13,
    name: "Алгоритмика",
    segment: "kids",
    subjects: ["Программирование для детей", "Математика", "Дизайн"],
    roles: ["Преподаватель", "Наставник"],
    hiring: "active",
    remote: true,
    careersUrl: "https://algoritmika.org/ru/job",
    site: "https://algoritmika.org",
    emoji: "🧩",
    color: "from-cyan-500 to-teal-600",
    note: "Международная школа программирования для детей. Активный набор педагогов.",
  },
  {
    id: 14,
    name: "Кодабра / IT-школы для детей",
    segment: "kids",
    subjects: ["Программирование", "Игры", "Создание сайтов"],
    roles: ["Преподаватель", "Вожатый-наставник"],
    hiring: "regular",
    remote: false,
    careersUrl: "https://kodabra.org",
    site: "https://kodabra.org",
    emoji: "👾",
    color: "from-lime-500 to-green-600",
    note: "Программирование для детей и подростков. Набор преподавателей и наставников.",
  },
  {
    id: 15,
    name: "Puzzle English",
    segment: "lang",
    subjects: ["Английский язык"],
    roles: ["Преподаватель", "Методист", "Автор контента"],
    hiring: "occasional",
    remote: true,
    careersUrl: "https://puzzle-english.com",
    site: "https://puzzle-english.com",
    emoji: "🧩",
    color: "from-blue-400 to-sky-500",
    note: "Платформа для изучения английского. Точечно ищет методистов и авторов.",
  },
  {
    id: 16,
    name: "Lingualeo",
    segment: "lang",
    subjects: ["Английский язык"],
    roles: ["Методист", "Автор курса"],
    hiring: "occasional",
    remote: true,
    careersUrl: "https://lingualeo.com",
    site: "https://lingualeo.com",
    emoji: "🦁",
    color: "from-green-400 to-emerald-500",
    note: "Сервис изучения английского. Периодически набирает методистов.",
  },
  {
    id: 17,
    name: "Contented",
    segment: "creative",
    subjects: ["Графический дизайн", "UX/UI", "Motion", "3D"],
    roles: ["Преподаватель-практик", "Ревьюер", "Куратор"],
    hiring: "regular",
    remote: true,
    careersUrl: "https://contented.ru",
    site: "https://contented.ru",
    emoji: "🎨",
    color: "from-pink-500 to-fuchsia-600",
    note: "Школа дизайна. Ищет практикующих дизайнеров-преподавателей.",
  },
  {
    id: 18,
    name: "XYZ School",
    segment: "creative",
    subjects: ["Геймдизайн", "2D/3D-арт", "Анимация", "Разработка игр"],
    roles: ["Преподаватель", "Ментор"],
    hiring: "regular",
    remote: true,
    careersUrl: "https://www.school-xyz.com",
    site: "https://www.school-xyz.com",
    emoji: "🕹️",
    color: "from-violet-500 to-purple-700",
    note: "Школа для геймдев-индустрии. Набор менторов из игровой разработки.",
  },
  {
    id: 19,
    name: "Хекслет (Hexlet)",
    segment: "it",
    subjects: ["Программирование", "Веб-разработка", "DevOps"],
    roles: ["Наставник", "Ревьюер", "Автор курса"],
    hiring: "regular",
    remote: true,
    careersUrl: "https://ru.hexlet.io/pages/jobs",
    site: "https://ru.hexlet.io",
    emoji: "🐢",
    color: "from-slate-500 to-gray-700",
    note: "Практическое программирование. Ищет наставников-разработчиков.",
  },
  {
    id: 20,
    name: "Эльбрус Буткемп",
    segment: "it",
    subjects: ["Веб-разработка", "Data Science"],
    roles: ["Преподаватель", "Ментор"],
    hiring: "occasional",
    remote: false,
    careersUrl: "https://elbrusboot.camp",
    site: "https://elbrusboot.camp",
    emoji: "⛰️",
    color: "from-emerald-500 to-teal-700",
    note: "Интенсивный буткемп. Точечно набирает преподавателей-практиков.",
  },
  {
    id: 21,
    name: "Учитель.club / профсообщества",
    segment: "school",
    subjects: ["Все школьные предметы", "Повышение квалификации"],
    roles: ["Преподаватель", "Спикер", "Автор материалов"],
    hiring: "occasional",
    remote: true,
    careersUrl: "https://uchitel.club",
    site: "https://uchitel.club",
    emoji: "👩‍🏫",
    color: "from-amber-500 to-orange-600",
    note: "Сообщество и площадка для учителей. Точечно ищет спикеров и авторов.",
  },
  {
    id: 22,
    name: "Инфоурок",
    segment: "school",
    subjects: ["Все школьные предметы", "Курсы для педагогов"],
    roles: ["Преподаватель", "Автор курсов", "Методист"],
    hiring: "regular",
    remote: true,
    careersUrl: "https://infourok.ru",
    site: "https://infourok.ru",
    emoji: "📖",
    color: "from-sky-500 to-indigo-600",
    note: "Крупный образовательный портал. Регулярно набирает авторов и методистов.",
  },
];

/** Сколько школ активно нанимает прямо сейчас (для счётчика в hero). */
export function countActiveHiring(): number {
  return EDTECH_SCHOOLS.filter((s) => s.hiring === "active").length;
}
