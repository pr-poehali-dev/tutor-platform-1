/**
 * Данные модуля «Выпускник»: топ-30 вузов России + военные.
 * Все данные — публичные (официальные сайты вузов, открытые приёмные кампании).
 * Проходные баллы — ориентир за прошлый год; могут меняться.
 */

export type SubjectCode =
  | "russian"
  | "math_prof"
  | "math_base"
  | "physics"
  | "chemistry"
  | "biology"
  | "informatics"
  | "history"
  | "social"
  | "literature"
  | "geography"
  | "english"
  | "foreign";

export interface SubjectInfo {
  code: SubjectCode;
  label: string;
  emoji: string;
  /** Slug курса в каталоге УЧИСЬПРО (для ссылки «начать готовиться»). */
  courseSlug?: string;
}

export const SUBJECTS: Record<SubjectCode, SubjectInfo> = {
  russian: { code: "russian", label: "Русский язык", emoji: "📚", courseSlug: "russian" },
  math_prof: { code: "math_prof", label: "Математика (профиль)", emoji: "📐", courseSlug: "math" },
  math_base: { code: "math_base", label: "Математика (база)", emoji: "➗", courseSlug: "math" },
  physics: { code: "physics", label: "Физика", emoji: "⚛️", courseSlug: "physics" },
  chemistry: { code: "chemistry", label: "Химия", emoji: "🧪", courseSlug: "chemistry" },
  biology: { code: "biology", label: "Биология", emoji: "🧬", courseSlug: "biology" },
  informatics: { code: "informatics", label: "Информатика", emoji: "💻", courseSlug: "informatics" },
  history: { code: "history", label: "История", emoji: "🏛️", courseSlug: "history" },
  social: { code: "social", label: "Обществознание", emoji: "⚖️", courseSlug: "social" },
  literature: { code: "literature", label: "Литература", emoji: "📖", courseSlug: "literature" },
  geography: { code: "geography", label: "География", emoji: "🌍", courseSlug: "geography" },
  english: { code: "english", label: "Английский язык", emoji: "🇬🇧", courseSlug: "english" },
  foreign: { code: "foreign", label: "Иностранный язык", emoji: "🌐", courseSlug: "english" },
};

export interface Faculty {
  id: string;
  name: string;
  /** Короткий заголовок специальности. */
  specialty: string;
  /** Список предметов ЕГЭ для поступления. */
  exams: { subject: SubjectCode; minScore: number }[];
  /** Проходной балл прошлого года (сумма за все ЕГЭ, бюджет). */
  passingScore: number;
  /** Контрольные цифры приёма (бюджетные места). */
  budgetSeats?: number;
  /** Есть ли ДВИ / творческое испытание / физподготовка. */
  hasAdditional?: boolean;
  additionalNote?: string;
}

export interface University {
  id: string;
  shortName: string;
  fullName: string;
  city: string;
  regionId: string;
  /** true — военный вуз (нужна медкомиссия, ВВК, физподготовка). */
  isMilitary?: boolean;
  emoji: string;
  color: string; // tailwind gradient
  website?: string;
  faculties: Faculty[];
}

export interface Region {
  id: string;
  name: string;
  emoji: string;
}

// ─── Регионы ──────────────────────────────────────────────────────────────
export const REGIONS: Region[] = [
  { id: "moscow", name: "Москва", emoji: "🏛️" },
  { id: "spb", name: "Санкт-Петербург", emoji: "🌉" },
  { id: "novosibirsk", name: "Новосибирская область", emoji: "❄️" },
  { id: "tomsk", name: "Томская область", emoji: "🌲" },
  { id: "tatarstan", name: "Республика Татарстан", emoji: "🕌" },
  { id: "sverdlovsk", name: "Свердловская область", emoji: "⛰️" },
  { id: "rostov", name: "Ростовская область", emoji: "🌻" },
  { id: "nizhny", name: "Нижегородская область", emoji: "🏰" },
  { id: "voronezh", name: "Воронежская область", emoji: "🌾" },
  { id: "krasnodar", name: "Краснодарский край", emoji: "🌊" },
];

// ─── Топ-30 вузов ─────────────────────────────────────────────────────────
export const UNIVERSITIES: University[] = [
  // ─── МОСКВА ──────────────────────────────────────────────────────────
  {
    id: "msu",
    shortName: "МГУ",
    fullName: "Московский государственный университет им. М. В. Ломоносова",
    city: "Москва",
    regionId: "moscow",
    emoji: "🏛️",
    color: "from-rose-500 to-amber-500",
    website: "https://www.msu.ru",
    faculties: [
      {
        id: "msu-mech-math",
        name: "Механико-математический",
        specialty: "Математика и компьютерные науки",
        exams: [
          { subject: "math_prof", minScore: 70 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 290,
        budgetSeats: 360,
        hasAdditional: true,
        additionalNote: "ДВИ по математике",
      },
      {
        id: "msu-physics",
        name: "Физический факультет",
        specialty: "Физика",
        exams: [
          { subject: "math_prof", minScore: 65 },
          { subject: "physics", minScore: 70 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 285,
        budgetSeats: 380,
        hasAdditional: true,
        additionalNote: "ДВИ по физике",
      },
      {
        id: "msu-journalism",
        name: "Факультет журналистики",
        specialty: "Журналистика",
        exams: [
          { subject: "russian", minScore: 65 },
          { subject: "literature", minScore: 65 },
          { subject: "foreign", minScore: 60 },
        ],
        passingScore: 365,
        budgetSeats: 210,
        hasAdditional: true,
        additionalNote: "Творческое испытание (сочинение + собеседование)",
      },
      {
        id: "msu-law",
        name: "Юридический факультет",
        specialty: "Юриспруденция",
        exams: [
          { subject: "russian", minScore: 60 },
          { subject: "social", minScore: 70 },
          { subject: "history", minScore: 65 },
        ],
        passingScore: 375,
        budgetSeats: 245,
        hasAdditional: true,
        additionalNote: "ДВИ по обществознанию",
      },
    ],
  },
  {
    id: "mipt",
    shortName: "МФТИ",
    fullName: "Московский физико-технический институт",
    city: "Долгопрудный",
    regionId: "moscow",
    emoji: "🧪",
    color: "from-blue-500 to-cyan-500",
    website: "https://mipt.ru",
    faculties: [
      {
        id: "mipt-fpmi",
        name: "ФПМИ",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 80 },
          { subject: "physics", minScore: 70 },
          { subject: "informatics", minScore: 70 },
          { subject: "russian", minScore: 60 },
        ],
        passingScore: 305,
        budgetSeats: 285,
      },
      {
        id: "mipt-fpfe",
        name: "ФПФЭ",
        specialty: "Физика и квантовые технологии",
        exams: [
          { subject: "math_prof", minScore: 75 },
          { subject: "physics", minScore: 75 },
          { subject: "russian", minScore: 60 },
        ],
        passingScore: 300,
        budgetSeats: 200,
      },
    ],
  },
  {
    id: "bauman",
    shortName: "МГТУ им. Баумана",
    fullName: "Московский государственный технический университет им. Н. Э. Баумана",
    city: "Москва",
    regionId: "moscow",
    emoji: "⚙️",
    color: "from-slate-500 to-zinc-600",
    website: "https://bmstu.ru",
    faculties: [
      {
        id: "bauman-iu",
        name: "ИУ — информатика и системы управления",
        specialty: "Программная инженерия",
        exams: [
          { subject: "math_prof", minScore: 65 },
          { subject: "informatics", minScore: 65 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 270,
        budgetSeats: 320,
      },
      {
        id: "bauman-sm",
        name: "СМ — специальное машиностроение",
        specialty: "Ракетные комплексы и космонавтика",
        exams: [
          { subject: "math_prof", minScore: 60 },
          { subject: "physics", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 250,
        budgetSeats: 410,
      },
    ],
  },
  {
    id: "hse",
    shortName: "ВШЭ",
    fullName: "Национальный исследовательский университет «Высшая школа экономики»",
    city: "Москва",
    regionId: "moscow",
    emoji: "📊",
    color: "from-indigo-500 to-purple-500",
    website: "https://www.hse.ru",
    faculties: [
      {
        id: "hse-econ",
        name: "Экономика",
        specialty: "Экономика",
        exams: [
          { subject: "math_prof", minScore: 70 },
          { subject: "russian", minScore: 60 },
          { subject: "foreign", minScore: 60 },
          { subject: "social", minScore: 60 },
        ],
        passingScore: 305,
        budgetSeats: 280,
      },
      {
        id: "hse-cs",
        name: "Факультет компьютерных наук",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 75 },
          { subject: "informatics", minScore: 70 },
          { subject: "russian", minScore: 60 },
        ],
        passingScore: 295,
        budgetSeats: 320,
      },
      {
        id: "hse-mediacom",
        name: "Медиакоммуникации",
        specialty: "Медиакоммуникации",
        exams: [
          { subject: "russian", minScore: 65 },
          { subject: "literature", minScore: 60 },
          { subject: "foreign", minScore: 60 },
        ],
        passingScore: 290,
        budgetSeats: 70,
        hasAdditional: true,
        additionalNote: "Творческий экзамен",
      },
    ],
  },
  {
    id: "mephi",
    shortName: "НИЯУ МИФИ",
    fullName: "Национальный исследовательский ядерный университет МИФИ",
    city: "Москва",
    regionId: "moscow",
    emoji: "☢️",
    color: "from-amber-500 to-yellow-500",
    website: "https://mephi.ru",
    faculties: [
      {
        id: "mephi-nuclear",
        name: "ИЯФиТ — ядерная физика и технологии",
        specialty: "Ядерные физика и технологии",
        exams: [
          { subject: "math_prof", minScore: 60 },
          { subject: "physics", minScore: 60 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 265,
        budgetSeats: 215,
      },
      {
        id: "mephi-cyber",
        name: "ИИКС — кибербезопасность",
        specialty: "Информационная безопасность",
        exams: [
          { subject: "math_prof", minScore: 65 },
          { subject: "informatics", minScore: 65 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 275,
        budgetSeats: 155,
      },
    ],
  },
  {
    id: "mgimo",
    shortName: "МГИМО",
    fullName: "Московский государственный институт международных отношений МИД РФ",
    city: "Москва",
    regionId: "moscow",
    emoji: "🌐",
    color: "from-blue-700 to-indigo-700",
    website: "https://mgimo.ru",
    faculties: [
      {
        id: "mgimo-int-rel",
        name: "Факультет международных отношений",
        specialty: "Международные отношения",
        exams: [
          { subject: "russian", minScore: 70 },
          { subject: "history", minScore: 70 },
          { subject: "foreign", minScore: 80 },
        ],
        passingScore: 320,
        budgetSeats: 80,
        hasAdditional: true,
        additionalNote: "ДВИ по иностранному языку",
      },
    ],
  },
  {
    id: "mgmu-sechenov",
    shortName: "Сеченовский",
    fullName: "Первый МГМУ им. И. М. Сеченова",
    city: "Москва",
    regionId: "moscow",
    emoji: "⚕️",
    color: "from-rose-500 to-red-500",
    website: "https://www.sechenov.ru",
    faculties: [
      {
        id: "sechenov-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 60 },
          { subject: "biology", minScore: 60 },
          { subject: "russian", minScore: 55 },
        ],
        passingScore: 275,
        budgetSeats: 480,
      },
      {
        id: "sechenov-pediatry",
        name: "Педиатрический факультет",
        specialty: "Педиатрия",
        exams: [
          { subject: "chemistry", minScore: 55 },
          { subject: "biology", minScore: 55 },
          { subject: "russian", minScore: 55 },
        ],
        passingScore: 265,
        budgetSeats: 220,
      },
    ],
  },
  {
    id: "mai",
    shortName: "МАИ",
    fullName: "Московский авиационный институт",
    city: "Москва",
    regionId: "moscow",
    emoji: "✈️",
    color: "from-sky-500 to-blue-500",
    website: "https://mai.ru",
    faculties: [
      {
        id: "mai-aero",
        name: "Аэрокосмический",
        specialty: "Проектирование авиационной техники",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 230,
        budgetSeats: 360,
      },
    ],
  },
  {
    id: "rea-plekhanov",
    shortName: "РЭУ им. Плеханова",
    fullName: "Российский экономический университет им. Г. В. Плеханова",
    city: "Москва",
    regionId: "moscow",
    emoji: "💼",
    color: "from-emerald-500 to-teal-500",
    website: "https://www.rea.ru",
    faculties: [
      {
        id: "rea-econ",
        name: "Финансовый факультет",
        specialty: "Финансы и кредит",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "social", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 260,
        budgetSeats: 180,
      },
    ],
  },
  // ─── ВОЕННЫЕ ВУЗЫ МОСКВЫ ────────────────────────────────────────────
  {
    id: "vunc-vvs",
    shortName: "ВУНЦ ВВС «ВВА»",
    fullName: "Военный учебно-научный центр Военно-воздушных сил «ВВА им. Жуковского и Гагарина»",
    city: "Москва",
    regionId: "moscow",
    isMilitary: true,
    emoji: "🛩️",
    color: "from-sky-700 to-blue-800",
    website: "https://академия-ввс.рф",
    faculties: [
      {
        id: "vunc-vvs-pilot",
        name: "Лётный состав",
        specialty: "Эксплуатация воздушных судов",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 200,
        budgetSeats: 200,
        hasAdditional: true,
        additionalNote: "ВВК (медкомиссия), физподготовка, профотбор",
      },
    ],
  },
  {
    id: "vka-mozhaisky",
    shortName: "ВКА им. Можайского",
    fullName: "Военно-космическая академия им. А. Ф. Можайского (филиал)",
    city: "Москва",
    regionId: "moscow",
    isMilitary: true,
    emoji: "🚀",
    color: "from-indigo-700 to-purple-800",
    faculties: [
      {
        id: "vka-space",
        name: "Космические аппараты",
        specialty: "Применение средств ракетно-космической обороны",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 150,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, проверка по линии ФСБ",
      },
    ],
  },

  // ─── САНКТ-ПЕТЕРБУРГ ────────────────────────────────────────────────
  {
    id: "spbu",
    shortName: "СПбГУ",
    fullName: "Санкт-Петербургский государственный университет",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "🌉",
    color: "from-cyan-500 to-blue-500",
    website: "https://spbu.ru",
    faculties: [
      {
        id: "spbu-math",
        name: "Математико-механический",
        specialty: "Математика",
        exams: [
          { subject: "math_prof", minScore: 70 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 290,
        budgetSeats: 215,
      },
      {
        id: "spbu-journalism",
        name: "Высшая школа журналистики",
        specialty: "Журналистика",
        exams: [
          { subject: "russian", minScore: 65 },
          { subject: "literature", minScore: 60 },
          { subject: "foreign", minScore: 60 },
        ],
        passingScore: 360,
        budgetSeats: 60,
        hasAdditional: true,
        additionalNote: "Творческий конкурс",
      },
      {
        id: "spbu-law",
        name: "Юридический факультет",
        specialty: "Юриспруденция",
        exams: [
          { subject: "russian", minScore: 60 },
          { subject: "social", minScore: 65 },
          { subject: "history", minScore: 65 },
        ],
        passingScore: 365,
        budgetSeats: 175,
      },
    ],
  },
  {
    id: "itmo",
    shortName: "Университет ИТМО",
    fullName: "Санкт-Петербургский национальный исследовательский университет ИТМО",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "💡",
    color: "from-yellow-400 to-orange-500",
    website: "https://itmo.ru",
    faculties: [
      {
        id: "itmo-cs",
        name: "Факультет программной инженерии и компьютерной техники",
        specialty: "Программная инженерия",
        exams: [
          { subject: "math_prof", minScore: 70 },
          { subject: "informatics", minScore: 65 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 295,
        budgetSeats: 280,
      },
    ],
  },
  {
    id: "spbpu",
    shortName: "СПбПУ Петра Великого",
    fullName: "Санкт-Петербургский политехнический университет Петра Великого",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "🏗️",
    color: "from-zinc-600 to-slate-700",
    website: "https://spbstu.ru",
    faculties: [
      {
        id: "spbpu-mech",
        name: "Институт машиностроения, материалов и транспорта",
        specialty: "Машиностроение",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 225,
        budgetSeats: 340,
      },
    ],
  },
  {
    id: "spbgmu-pavlov",
    shortName: "ПСПбГМУ им. Павлова",
    fullName: "Первый Санкт-Петербургский государственный медицинский университет им. И. П. Павлова",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "⚕️",
    color: "from-rose-500 to-pink-500",
    website: "https://www.1spbgmu.ru",
    faculties: [
      {
        id: "spbgmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 60 },
          { subject: "biology", minScore: 60 },
          { subject: "russian", minScore: 55 },
        ],
        passingScore: 270,
        budgetSeats: 290,
      },
    ],
  },
  // ─── ВОЕННЫЕ СПБ ────────────────────────────────────────────────────
  {
    id: "vma-kirov",
    shortName: "ВМА им. Кирова",
    fullName: "Военно-медицинская академия им. С. М. Кирова",
    city: "Санкт-Петербург",
    regionId: "spb",
    isMilitary: true,
    emoji: "🎖️",
    color: "from-emerald-700 to-green-800",
    website: "https://vmeda.org",
    faculties: [
      {
        id: "vma-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело (военный врач)",
        exams: [
          { subject: "chemistry", minScore: 55 },
          { subject: "biology", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 165,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, контракт с МО РФ",
      },
    ],
  },
  {
    id: "mvaa",
    shortName: "МВАА",
    fullName: "Михайловская военная артиллерийская академия",
    city: "Санкт-Петербург",
    regionId: "spb",
    isMilitary: true,
    emoji: "💥",
    color: "from-red-700 to-orange-800",
    faculties: [
      {
        id: "mvaa-artillery",
        name: "Артиллерийское вооружение",
        specialty: "Применение подразделений артиллерии",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 195,
        budgetSeats: 200,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка (бег, подтягивания)",
      },
    ],
  },

  // ─── НОВОСИБИРСК ────────────────────────────────────────────────────
  {
    id: "nsu",
    shortName: "НГУ",
    fullName: "Новосибирский государственный университет",
    city: "Новосибирск",
    regionId: "novosibirsk",
    emoji: "❄️",
    color: "from-cyan-600 to-blue-600",
    website: "https://www.nsu.ru",
    faculties: [
      {
        id: "nsu-math",
        name: "Механико-математический",
        specialty: "Математика",
        exams: [
          { subject: "math_prof", minScore: 65 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 270,
        budgetSeats: 170,
      },
      {
        id: "nsu-physics",
        name: "Физический факультет",
        specialty: "Физика",
        exams: [
          { subject: "math_prof", minScore: 60 },
          { subject: "physics", minScore: 65 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 265,
        budgetSeats: 145,
      },
    ],
  },
  {
    id: "nstu",
    shortName: "НГТУ",
    fullName: "Новосибирский государственный технический университет",
    city: "Новосибирск",
    regionId: "novosibirsk",
    emoji: "⚙️",
    color: "from-slate-500 to-gray-600",
    website: "https://www.nstu.ru",
    faculties: [
      {
        id: "nstu-it",
        name: "Факультет прикладной математики и информатики",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "informatics", minScore: 55 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 235,
        budgetSeats: 215,
      },
    ],
  },

  // ─── ТОМСК ──────────────────────────────────────────────────────────
  {
    id: "tsu",
    shortName: "ТГУ",
    fullName: "Национальный исследовательский Томский государственный университет",
    city: "Томск",
    regionId: "tomsk",
    emoji: "🌲",
    color: "from-emerald-600 to-green-700",
    website: "https://www.tsu.ru",
    faculties: [
      {
        id: "tsu-physics",
        name: "Физический факультет",
        specialty: "Физика",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 230,
        budgetSeats: 150,
      },
      {
        id: "tsu-history",
        name: "Исторический факультет",
        specialty: "История",
        exams: [
          { subject: "history", minScore: 55 },
          { subject: "russian", minScore: 55 },
          { subject: "social", minScore: 50 },
        ],
        passingScore: 235,
        budgetSeats: 95,
      },
    ],
  },
  {
    id: "tpu",
    shortName: "ТПУ",
    fullName: "Национальный исследовательский Томский политехнический университет",
    city: "Томск",
    regionId: "tomsk",
    emoji: "⚛️",
    color: "from-amber-600 to-orange-600",
    website: "https://tpu.ru",
    faculties: [
      {
        id: "tpu-nuclear",
        name: "Инженерная школа ядерных технологий",
        specialty: "Ядерные физика и технологии",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "physics", minScore: 55 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 235,
        budgetSeats: 130,
      },
    ],
  },

  // ─── КАЗАНЬ ─────────────────────────────────────────────────────────
  {
    id: "kfu",
    shortName: "КФУ",
    fullName: "Казанский (Приволжский) федеральный университет",
    city: "Казань",
    regionId: "tatarstan",
    emoji: "🕌",
    color: "from-green-600 to-emerald-700",
    website: "https://kpfu.ru",
    faculties: [
      {
        id: "kfu-it",
        name: "Институт вычислительной математики и информационных технологий",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 240,
        budgetSeats: 230,
      },
      {
        id: "kfu-medical",
        name: "Институт фундаментальной медицины и биологии",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 150,
      },
    ],
  },
  {
    id: "knrtu",
    shortName: "КНИТУ-КАИ",
    fullName: "Казанский национальный исследовательский технический университет им. А. Н. Туполева",
    city: "Казань",
    regionId: "tatarstan",
    emoji: "✈️",
    color: "from-blue-600 to-sky-600",
    faculties: [
      {
        id: "knrtu-aero",
        name: "Институт авиации, наземного транспорта и энергетики",
        specialty: "Авиастроение",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 270,
      },
    ],
  },

  // ─── ЕКАТЕРИНБУРГ ───────────────────────────────────────────────────
  {
    id: "urfu",
    shortName: "УрФУ",
    fullName: "Уральский федеральный университет им. Б. Н. Ельцина",
    city: "Екатеринбург",
    regionId: "sverdlovsk",
    emoji: "⛰️",
    color: "from-orange-500 to-red-500",
    website: "https://urfu.ru",
    faculties: [
      {
        id: "urfu-it",
        name: "ИРИТ-РТФ — радиотехника и информатика",
        specialty: "Программная инженерия",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "informatics", minScore: 55 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 245,
        budgetSeats: 250,
      },
      {
        id: "urfu-econ",
        name: "Институт экономики и управления",
        specialty: "Экономика",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "social", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 165,
      },
    ],
  },

  // ─── РОСТОВ-НА-ДОНУ ─────────────────────────────────────────────────
  {
    id: "sfedu",
    shortName: "ЮФУ",
    fullName: "Южный федеральный университет",
    city: "Ростов-на-Дону",
    regionId: "rostov",
    emoji: "🌻",
    color: "from-yellow-500 to-amber-500",
    website: "https://sfedu.ru",
    faculties: [
      {
        id: "sfedu-it",
        name: "Институт компьютерных технологий и информационной безопасности",
        specialty: "Информационная безопасность",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 225,
        budgetSeats: 165,
      },
    ],
  },

  // ─── НИЖНИЙ НОВГОРОД ────────────────────────────────────────────────
  {
    id: "unn",
    shortName: "ННГУ им. Лобачевского",
    fullName: "Национальный исследовательский Нижегородский государственный университет",
    city: "Нижний Новгород",
    regionId: "nizhny",
    emoji: "🏰",
    color: "from-purple-600 to-pink-600",
    website: "https://www.unn.ru",
    faculties: [
      {
        id: "unn-radio",
        name: "Радиофизический факультет",
        specialty: "Радиофизика",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 110,
      },
    ],
  },

  // ─── ВОРОНЕЖ ────────────────────────────────────────────────────────
  {
    id: "vsu",
    shortName: "ВГУ",
    fullName: "Воронежский государственный университет",
    city: "Воронеж",
    regionId: "voronezh",
    emoji: "🌾",
    color: "from-amber-500 to-yellow-600",
    website: "https://www.vsu.ru",
    faculties: [
      {
        id: "vsu-pmf",
        name: "Факультет прикладной математики, информатики и механики",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 175,
      },
    ],
  },
  {
    id: "vva-zhukovsky",
    shortName: "ВУНЦ ВВС (Воронеж)",
    fullName: "Военный учебно-научный центр ВВС «Военно-воздушная академия» им. Н. Е. Жуковского и Ю. А. Гагарина",
    city: "Воронеж",
    regionId: "voronezh",
    isMilitary: true,
    emoji: "🛩️",
    color: "from-sky-700 to-indigo-800",
    faculties: [
      {
        id: "vva-engineering",
        name: "Инженерно-авиационный",
        specialty: "Эксплуатация авиационных комплексов",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 195,
        budgetSeats: 320,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, контракт с МО РФ",
      },
    ],
  },

  // ─── КРАСНОДАР ──────────────────────────────────────────────────────
  {
    id: "kubsu",
    shortName: "КубГУ",
    fullName: "Кубанский государственный университет",
    city: "Краснодар",
    regionId: "krasnodar",
    emoji: "🌊",
    color: "from-cyan-500 to-teal-500",
    website: "https://www.kubsu.ru",
    faculties: [
      {
        id: "kubsu-it",
        name: "Факультет компьютерных технологий и прикладной математики",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 140,
      },
    ],
  },
  {
    id: "kvvaul",
    shortName: "КВВАУЛ",
    fullName: "Краснодарское высшее военное авиационное училище лётчиков им. А. К. Серова",
    city: "Краснодар",
    regionId: "krasnodar",
    isMilitary: true,
    emoji: "🛩️",
    color: "from-blue-700 to-sky-800",
    faculties: [
      {
        id: "kvvaul-pilot",
        name: "Лётный состав",
        specialty: "Лётная эксплуатация и применение",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 195,
        budgetSeats: 350,
        hasAdditional: true,
        additionalNote: "ВВК, профотбор лётчика, физподготовка",
      },
    ],
  },
];

export function getUniversitiesByRegion(regionId: string): University[] {
  return UNIVERSITIES.filter((u) => u.regionId === regionId);
}

export function getUniversity(id: string): University | undefined {
  return UNIVERSITIES.find((u) => u.id === id);
}

export function getFaculty(universityId: string, facultyId: string): Faculty | undefined {
  const u = getUniversity(universityId);
  return u?.faculties.find((f) => f.id === facultyId);
}

export function getRegion(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}