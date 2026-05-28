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
  { id: "samara", name: "Самарская область", emoji: "🚀" },
  { id: "perm", name: "Пермский край", emoji: "🌳" },
  { id: "chelyabinsk", name: "Челябинская область", emoji: "🏔️" },
  { id: "krasnoyarsk", name: "Красноярский край", emoji: "🌌" },
  { id: "irkutsk", name: "Иркутская область", emoji: "🏞️" },
  { id: "primorsky", name: "Приморский край", emoji: "🌅" },
  { id: "khabarovsk", name: "Хабаровский край", emoji: "🐯" },
  { id: "bashkortostan", name: "Республика Башкортостан", emoji: "🍯" },
  { id: "saratov", name: "Саратовская область", emoji: "🌽" },
  { id: "volgograd", name: "Волгоградская область", emoji: "🗿" },
  { id: "tula", name: "Тульская область", emoji: "🫖" },
  { id: "ryazan", name: "Рязанская область", emoji: "🪵" },
  { id: "kaliningrad", name: "Калининградская область", emoji: "🏛" },
  { id: "tyumen", name: "Тюменская область", emoji: "🛢️" },
  { id: "omsk", name: "Омская область", emoji: "🌾" },
  { id: "yaroslavl", name: "Ярославская область", emoji: "⛪" },
  { id: "kemerovo", name: "Кемеровская область", emoji: "⛏️" },
  { id: "ulyanovsk", name: "Ульяновская область", emoji: "✈️" },
  { id: "kursk", name: "Курская область", emoji: "🌻" },
  { id: "stavropol", name: "Ставропольский край", emoji: "🏞" },
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

  // ─── МОСКВА (продолжение) ──────────────────────────────────────────
  {
    id: "rudn",
    shortName: "РУДН",
    fullName: "Российский университет дружбы народов им. Патриса Лумумбы",
    city: "Москва",
    regionId: "moscow",
    emoji: "🌍",
    color: "from-blue-600 to-cyan-500",
    website: "https://www.rudn.ru",
    faculties: [
      {
        id: "rudn-medical",
        name: "Медицинский институт",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 255,
        budgetSeats: 200,
      },
      {
        id: "rudn-economics",
        name: "Экономический факультет",
        specialty: "Мировая экономика",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "social", minScore: 55 },
          { subject: "russian", minScore: 50 },
          { subject: "foreign", minScore: 55 },
        ],
        passingScore: 265,
        budgetSeats: 110,
      },
    ],
  },
  {
    id: "mgsu",
    shortName: "МГСУ",
    fullName: "Национальный исследовательский Московский государственный строительный университет",
    city: "Москва",
    regionId: "moscow",
    emoji: "🏗",
    color: "from-stone-500 to-zinc-600",
    website: "https://mgsu.ru",
    faculties: [
      {
        id: "mgsu-construction",
        name: "Институт строительства и архитектуры",
        specialty: "Промышленное и гражданское строительство",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 210,
        budgetSeats: 320,
      },
    ],
  },
  {
    id: "mpgu",
    shortName: "МПГУ",
    fullName: "Московский педагогический государственный университет",
    city: "Москва",
    regionId: "moscow",
    emoji: "📚",
    color: "from-emerald-500 to-green-600",
    website: "https://mpgu.su",
    faculties: [
      {
        id: "mpgu-russian",
        name: "Институт филологии",
        specialty: "Педагогическое образование (русский язык)",
        exams: [
          { subject: "russian", minScore: 60 },
          { subject: "literature", minScore: 55 },
          { subject: "social", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 140,
      },
    ],
  },
  {
    id: "fa-gov",
    shortName: "Финансовый университет",
    fullName: "Финансовый университет при Правительстве РФ",
    city: "Москва",
    regionId: "moscow",
    emoji: "💰",
    color: "from-amber-500 to-yellow-600",
    website: "https://www.fa.ru",
    faculties: [
      {
        id: "fa-finance",
        name: "Финансовый факультет",
        specialty: "Финансы и кредит",
        exams: [
          { subject: "math_prof", minScore: 65 },
          { subject: "social", minScore: 60 },
          { subject: "russian", minScore: 55 },
          { subject: "foreign", minScore: 55 },
        ],
        passingScore: 285,
        budgetSeats: 145,
      },
    ],
  },
  {
    id: "ranepa",
    shortName: "РАНХиГС",
    fullName: "Российская академия народного хозяйства и государственной службы",
    city: "Москва",
    regionId: "moscow",
    emoji: "🏢",
    color: "from-blue-700 to-indigo-700",
    website: "https://www.ranepa.ru",
    faculties: [
      {
        id: "ranepa-public",
        name: "Институт государственной службы",
        specialty: "Государственное и муниципальное управление",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "social", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 120,
      },
    ],
  },
  {
    id: "miet",
    shortName: "МИЭТ",
    fullName: "Национальный исследовательский университет «МИЭТ»",
    city: "Зеленоград",
    regionId: "moscow",
    emoji: "🔌",
    color: "from-cyan-600 to-blue-600",
    website: "https://miet.ru",
    faculties: [
      {
        id: "miet-electronics",
        name: "Институт электроники и микроэлектроники",
        specialty: "Электроника и наноэлектроника",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 240,
        budgetSeats: 220,
      },
    ],
  },
  {
    id: "rgsu",
    shortName: "РГСУ",
    fullName: "Российский государственный социальный университет",
    city: "Москва",
    regionId: "moscow",
    emoji: "🤝",
    color: "from-rose-500 to-pink-500",
    faculties: [
      {
        id: "rgsu-psychology",
        name: "Факультет психологии",
        specialty: "Психология",
        exams: [
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
          { subject: "math_base", minScore: 40 },
        ],
        passingScore: 220,
        budgetSeats: 90,
      },
    ],
  },
  {
    id: "rggu",
    shortName: "РГГУ",
    fullName: "Российский государственный гуманитарный университет",
    city: "Москва",
    regionId: "moscow",
    emoji: "📜",
    color: "from-purple-600 to-indigo-600",
    website: "https://www.rsuh.ru",
    faculties: [
      {
        id: "rggu-history",
        name: "Историко-архивный институт",
        specialty: "История",
        exams: [
          { subject: "history", minScore: 60 },
          { subject: "russian", minScore: 55 },
          { subject: "social", minScore: 55 },
        ],
        passingScore: 250,
        budgetSeats: 75,
      },
    ],
  },
  {
    id: "mgavm",
    shortName: "МВА им. Скрябина",
    fullName: "Московская государственная академия ветеринарной медицины и биотехнологии",
    city: "Москва",
    regionId: "moscow",
    emoji: "🐾",
    color: "from-green-600 to-lime-600",
    faculties: [
      {
        id: "mgavm-vet",
        name: "Факультет ветеринарной медицины",
        specialty: "Ветеринария",
        exams: [
          { subject: "biology", minScore: 50 },
          { subject: "chemistry", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 130,
      },
    ],
  },
  {
    id: "muct",
    shortName: "РХТУ им. Менделеева",
    fullName: "Российский химико-технологический университет им. Д. И. Менделеева",
    city: "Москва",
    regionId: "moscow",
    emoji: "🧪",
    color: "from-emerald-600 to-teal-700",
    website: "https://www.muctr.ru",
    faculties: [
      {
        id: "muct-chemistry",
        name: "Факультет нефтегазохимии и полимерных материалов",
        specialty: "Химическая технология",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "chemistry", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 240,
      },
    ],
  },
  {
    id: "mgupp",
    shortName: "МГУПП",
    fullName: "Московский государственный университет пищевых производств",
    city: "Москва",
    regionId: "moscow",
    emoji: "🍞",
    color: "from-orange-500 to-amber-500",
    faculties: [
      {
        id: "mgupp-tech",
        name: "Технологический факультет",
        specialty: "Технология продуктов питания",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "chemistry", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 195,
        budgetSeats: 180,
      },
    ],
  },
  {
    id: "vavt",
    shortName: "ВАВТ",
    fullName: "Всероссийская академия внешней торговли",
    city: "Москва",
    regionId: "moscow",
    emoji: "🌐",
    color: "from-sky-600 to-blue-700",
    faculties: [
      {
        id: "vavt-trade",
        name: "Факультет внешнеторгового менеджмента",
        specialty: "Менеджмент",
        exams: [
          { subject: "math_prof", minScore: 60 },
          { subject: "foreign", minScore: 70 },
          { subject: "russian", minScore: 55 },
          { subject: "social", minScore: 55 },
        ],
        passingScore: 285,
        budgetSeats: 65,
      },
    ],
  },
  {
    id: "vu-mo",
    shortName: "Военный университет МО",
    fullName: "Военный университет Министерства обороны РФ",
    city: "Москва",
    regionId: "moscow",
    isMilitary: true,
    emoji: "🎖",
    color: "from-emerald-700 to-green-800",
    faculties: [
      {
        id: "vu-mo-translator",
        name: "Факультет иностранных языков",
        specialty: "Перевод и переводоведение",
        exams: [
          { subject: "foreign", minScore: 70 },
          { subject: "russian", minScore: 55 },
          { subject: "history", minScore: 55 },
        ],
        passingScore: 250,
        budgetSeats: 120,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, профотбор, контракт с МО РФ",
      },
      {
        id: "vu-mo-law",
        name: "Прокурорско-следственный факультет",
        specialty: "Правовое обеспечение национальной безопасности",
        exams: [
          { subject: "russian", minScore: 55 },
          { subject: "social", minScore: 60 },
          { subject: "history", minScore: 55 },
        ],
        passingScore: 245,
        budgetSeats: 85,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, контракт с МО РФ",
      },
    ],
  },
  {
    id: "msmu-evdokimov",
    shortName: "МГМСУ им. Евдокимова",
    fullName: "Московский государственный медико-стоматологический университет им. А. И. Евдокимова",
    city: "Москва",
    regionId: "moscow",
    emoji: "🦷",
    color: "from-rose-600 to-red-600",
    faculties: [
      {
        id: "msmu-dentistry",
        name: "Стоматологический факультет",
        specialty: "Стоматология",
        exams: [
          { subject: "chemistry", minScore: 55 },
          { subject: "biology", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 260,
        budgetSeats: 175,
      },
    ],
  },
  {
    id: "rgau-msha",
    shortName: "РГАУ-МСХА",
    fullName: "Российский государственный аграрный университет — МСХА им. К. А. Тимирязева",
    city: "Москва",
    regionId: "moscow",
    emoji: "🌾",
    color: "from-lime-600 to-green-700",
    faculties: [
      {
        id: "rgau-agro",
        name: "Агрономический факультет",
        specialty: "Агрономия",
        exams: [
          { subject: "biology", minScore: 45 },
          { subject: "math_prof", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 195,
        budgetSeats: 210,
      },
    ],
  },
  {
    id: "vstu-msu-design",
    shortName: "МГХПА им. Строганова",
    fullName: "Московская государственная художественно-промышленная академия им. С. Г. Строганова",
    city: "Москва",
    regionId: "moscow",
    emoji: "🎨",
    color: "from-pink-500 to-rose-500",
    faculties: [
      {
        id: "stroganov-design",
        name: "Факультет дизайна",
        specialty: "Дизайн",
        exams: [
          { subject: "literature", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 70,
        hasAdditional: true,
        additionalNote: "Творческое испытание (рисунок, композиция)",
      },
    ],
  },

  // ─── САНКТ-ПЕТЕРБУРГ (продолжение) ─────────────────────────────────
  {
    id: "etu-leti",
    shortName: "СПбГЭТУ «ЛЭТИ»",
    fullName: "Санкт-Петербургский государственный электротехнический университет «ЛЭТИ»",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "⚡",
    color: "from-yellow-500 to-orange-500",
    website: "https://etu.ru",
    faculties: [
      {
        id: "leti-radio",
        name: "Факультет радиотехники и телекоммуникаций",
        specialty: "Радиотехника",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 230,
        budgetSeats: 230,
      },
    ],
  },
  {
    id: "ranepa-spb",
    shortName: "СЗИУ РАНХиГС",
    fullName: "Северо-Западный институт управления РАНХиГС",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "🏛",
    color: "from-blue-700 to-indigo-700",
    faculties: [
      {
        id: "ranepa-spb-mgmt",
        name: "Факультет государственного управления",
        specialty: "Государственное и муниципальное управление",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "social", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 235,
        budgetSeats: 85,
      },
    ],
  },
  {
    id: "spbgasu",
    shortName: "СПбГАСУ",
    fullName: "Санкт-Петербургский государственный архитектурно-строительный университет",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "🏛",
    color: "from-stone-600 to-amber-700",
    faculties: [
      {
        id: "spbgasu-arch",
        name: "Архитектурный факультет",
        specialty: "Архитектура",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 100,
        hasAdditional: true,
        additionalNote: "Творческое испытание (рисунок, композиция)",
      },
    ],
  },
  {
    id: "spbguki",
    shortName: "СПбГИКиТ",
    fullName: "Санкт-Петербургский государственный институт кино и телевидения",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "🎬",
    color: "from-purple-600 to-pink-600",
    faculties: [
      {
        id: "spbguki-cinema",
        name: "Факультет экранных искусств",
        specialty: "Режиссура кино и телевидения",
        exams: [
          { subject: "literature", minScore: 55 },
          { subject: "russian", minScore: 55 },
        ],
        passingScore: 235,
        budgetSeats: 45,
        hasAdditional: true,
        additionalNote: "Творческое испытание (этюды, собеседование)",
      },
    ],
  },
  {
    id: "gornyy",
    shortName: "СПбГИ",
    fullName: "Санкт-Петербургский горный университет императрицы Екатерины II",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "⛏",
    color: "from-stone-700 to-zinc-800",
    faculties: [
      {
        id: "gornyy-geo",
        name: "Геологоразведочный факультет",
        specialty: "Прикладная геология",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 195,
      },
    ],
  },
  {
    id: "vmedu",
    shortName: "ВКА связи им. Будённого",
    fullName: "Военная академия связи им. Маршала Советского Союза С. М. Будённого",
    city: "Санкт-Петербург",
    regionId: "spb",
    isMilitary: true,
    emoji: "📡",
    color: "from-emerald-700 to-teal-800",
    faculties: [
      {
        id: "vmedu-comm",
        name: "Факультет военных систем связи",
        specialty: "Инфокоммуникационные технологии",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 200,
        budgetSeats: 180,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, контракт с МО РФ",
      },
    ],
  },

  // ─── НОВОСИБИРСК (продолжение) ─────────────────────────────────────
  {
    id: "siu-ranepa",
    shortName: "СИУ РАНХиГС",
    fullName: "Сибирский институт управления РАНХиГС",
    city: "Новосибирск",
    regionId: "novosibirsk",
    emoji: "🏛",
    color: "from-blue-600 to-indigo-700",
    faculties: [
      {
        id: "siu-public",
        name: "Факультет государственного управления",
        specialty: "Государственное и муниципальное управление",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "social", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 70,
      },
    ],
  },
  {
    id: "ngmu",
    shortName: "НГМУ",
    fullName: "Новосибирский государственный медицинский университет",
    city: "Новосибирск",
    regionId: "novosibirsk",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "ngmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 270,
      },
    ],
  },
  {
    id: "nsuada",
    shortName: "НГУАДИ",
    fullName: "Новосибирский государственный университет архитектуры, дизайна и искусств",
    city: "Новосибирск",
    regionId: "novosibirsk",
    emoji: "🎨",
    color: "from-pink-500 to-rose-500",
    faculties: [
      {
        id: "nsuada-design",
        name: "Факультет дизайна",
        specialty: "Дизайн",
        exams: [
          { subject: "literature", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 60,
        hasAdditional: true,
        additionalNote: "Творческое испытание (рисунок, композиция)",
      },
    ],
  },

  // ─── ТОМСК (продолжение) ───────────────────────────────────────────
  {
    id: "tusur",
    shortName: "ТУСУР",
    fullName: "Томский государственный университет систем управления и радиоэлектроники",
    city: "Томск",
    regionId: "tomsk",
    emoji: "📡",
    color: "from-cyan-600 to-blue-600",
    faculties: [
      {
        id: "tusur-it",
        name: "Факультет вычислительных систем",
        specialty: "Программная инженерия",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 230,
        budgetSeats: 195,
      },
    ],
  },

  // ─── КАЗАНЬ (продолжение) ──────────────────────────────────────────
  {
    id: "kazgmu",
    shortName: "КазГМУ",
    fullName: "Казанский государственный медицинский университет",
    city: "Казань",
    regionId: "tatarstan",
    emoji: "⚕",
    color: "from-green-600 to-emerald-700",
    faculties: [
      {
        id: "kazgmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 55 },
          { subject: "biology", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 260,
        budgetSeats: 320,
      },
    ],
  },
  {
    id: "kazvvku",
    shortName: "КВТКУ",
    fullName: "Казанское высшее танковое командное училище",
    city: "Казань",
    regionId: "tatarstan",
    isMilitary: true,
    emoji: "🛡",
    color: "from-emerald-800 to-green-900",
    faculties: [
      {
        id: "kazvvku-tanks",
        name: "Танковые войска",
        specialty: "Управление подразделениями",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 190,
        budgetSeats: 200,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, контракт с МО РФ",
      },
    ],
  },

  // ─── ЕКАТЕРИНБУРГ (продолжение) ────────────────────────────────────
  {
    id: "usmu",
    shortName: "УГМУ",
    fullName: "Уральский государственный медицинский университет",
    city: "Екатеринбург",
    regionId: "sverdlovsk",
    emoji: "⚕",
    color: "from-red-500 to-rose-600",
    faculties: [
      {
        id: "usmu-medical",
        name: "Лечебно-профилактический факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 250,
        budgetSeats: 235,
      },
    ],
  },
  // ─── РОСТОВ-НА-ДОНУ (продолжение) ──────────────────────────────────
  {
    id: "rsmu-rostov",
    shortName: "РостГМУ",
    fullName: "Ростовский государственный медицинский университет",
    city: "Ростов-на-Дону",
    regionId: "rostov",
    emoji: "⚕",
    color: "from-rose-500 to-pink-500",
    faculties: [
      {
        id: "rsmu-medical",
        name: "Лечебно-профилактический факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 220,
      },
    ],
  },
  {
    id: "donstu",
    shortName: "ДГТУ",
    fullName: "Донской государственный технический университет",
    city: "Ростов-на-Дону",
    regionId: "rostov",
    emoji: "⚙",
    color: "from-slate-500 to-zinc-600",
    faculties: [
      {
        id: "donstu-it",
        name: "Факультет «Информатика и вычислительная техника»",
        specialty: "Информатика и вычислительная техника",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 180,
      },
    ],
  },
  {
    id: "rau",
    shortName: "РВВКУ",
    fullName: "Рязанское высшее воздушно-десантное командное училище им. В. Ф. Маргелова",
    city: "Рязань",
    regionId: "ryazan",
    isMilitary: true,
    emoji: "🪂",
    color: "from-blue-800 to-indigo-900",
    faculties: [
      {
        id: "rvvku-airborne",
        name: "Воздушно-десантные войска",
        specialty: "Управление подразделениями",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 195,
        budgetSeats: 280,
        hasAdditional: true,
        additionalNote: "ВВК (повышенные требования), физподготовка, парашютная подготовка",
      },
    ],
  },

  // ─── НИЖНИЙ НОВГОРОД (продолжение) ─────────────────────────────────
  {
    id: "nntu-alekseev",
    shortName: "НГТУ им. Алексеева",
    fullName: "Нижегородский государственный технический университет им. Р. Е. Алексеева",
    city: "Нижний Новгород",
    regionId: "nizhny",
    emoji: "⚓",
    color: "from-blue-600 to-cyan-700",
    faculties: [
      {
        id: "nntu-shipbuilding",
        name: "Институт транспортных систем",
        specialty: "Кораблестроение",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 165,
      },
    ],
  },
  {
    id: "pimu",
    shortName: "ПИМУ",
    fullName: "Приволжский исследовательский медицинский университет",
    city: "Нижний Новгород",
    regionId: "nizhny",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "pimu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 250,
        budgetSeats: 210,
      },
    ],
  },

  // ─── ВОРОНЕЖ (продолжение) ─────────────────────────────────────────
  {
    id: "vgtu",
    shortName: "ВГТУ",
    fullName: "Воронежский государственный технический университет",
    city: "Воронеж",
    regionId: "voronezh",
    emoji: "⚙",
    color: "from-zinc-600 to-gray-700",
    faculties: [
      {
        id: "vgtu-it",
        name: "Факультет информационных технологий и компьютерной безопасности",
        specialty: "Информационная безопасность",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 140,
      },
    ],
  },

  // ─── САМАРА ────────────────────────────────────────────────────────
  {
    id: "ssau",
    shortName: "Самарский университет",
    fullName: "Самарский национальный исследовательский университет им. С. П. Королёва",
    city: "Самара",
    regionId: "samara",
    emoji: "🚀",
    color: "from-blue-600 to-indigo-700",
    website: "https://ssau.ru",
    faculties: [
      {
        id: "ssau-aero",
        name: "Институт авиационной и ракетно-космической техники",
        specialty: "Двигатели летательных аппаратов",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 225,
        budgetSeats: 270,
      },
    ],
  },
  {
    id: "ssmu",
    shortName: "СамГМУ",
    fullName: "Самарский государственный медицинский университет",
    city: "Самара",
    regionId: "samara",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "ssmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 230,
      },
    ],
  },

  // ─── ПЕРМЬ ─────────────────────────────────────────────────────────
  {
    id: "psu",
    shortName: "ПГНИУ",
    fullName: "Пермский государственный национальный исследовательский университет",
    city: "Пермь",
    regionId: "perm",
    emoji: "🌳",
    color: "from-green-600 to-emerald-700",
    website: "https://www.psu.ru",
    faculties: [
      {
        id: "psu-math",
        name: "Механико-математический факультет",
        specialty: "Математика и компьютерные науки",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 130,
      },
    ],
  },
  {
    id: "pstu",
    shortName: "ПНИПУ",
    fullName: "Пермский национальный исследовательский политехнический университет",
    city: "Пермь",
    regionId: "perm",
    emoji: "⚙",
    color: "from-slate-600 to-zinc-700",
    faculties: [
      {
        id: "pstu-mech",
        name: "Аэрокосмический факультет",
        specialty: "Авиационные двигатели",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 200,
      },
    ],
  },
  // ─── ЧЕЛЯБИНСК ─────────────────────────────────────────────────────
  {
    id: "susu",
    shortName: "ЮУрГУ",
    fullName: "Южно-Уральский государственный университет (НИУ)",
    city: "Челябинск",
    regionId: "chelyabinsk",
    emoji: "🏔",
    color: "from-blue-600 to-cyan-700",
    website: "https://www.susu.ru",
    faculties: [
      {
        id: "susu-it",
        name: "Высшая школа электроники и компьютерных наук",
        specialty: "Программная инженерия",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 230,
        budgetSeats: 240,
      },
    ],
  },
  {
    id: "csu",
    shortName: "ЧелГУ",
    fullName: "Челябинский государственный университет",
    city: "Челябинск",
    regionId: "chelyabinsk",
    emoji: "📚",
    color: "from-purple-600 to-indigo-600",
    faculties: [
      {
        id: "csu-philology",
        name: "Историко-филологический факультет",
        specialty: "Филология",
        exams: [
          { subject: "literature", minScore: 50 },
          { subject: "russian", minScore: 55 },
          { subject: "history", minScore: 50 },
        ],
        passingScore: 220,
        budgetSeats: 85,
      },
    ],
  },

  // ─── КРАСНОЯРСК ────────────────────────────────────────────────────
  {
    id: "sfu",
    shortName: "СФУ",
    fullName: "Сибирский федеральный университет",
    city: "Красноярск",
    regionId: "krasnoyarsk",
    emoji: "🌌",
    color: "from-indigo-600 to-purple-700",
    website: "https://www.sfu-kras.ru",
    faculties: [
      {
        id: "sfu-it",
        name: "Институт космических и информационных технологий",
        specialty: "Прикладная информатика",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 230,
        budgetSeats: 220,
      },
      {
        id: "sfu-mining",
        name: "Институт горного дела, геологии и геотехнологий",
        specialty: "Горное дело",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 200,
        budgetSeats: 270,
      },
    ],
  },

  // ─── ИРКУТСК ───────────────────────────────────────────────────────
  {
    id: "isu",
    shortName: "ИГУ",
    fullName: "Иркутский государственный университет",
    city: "Иркутск",
    regionId: "irkutsk",
    emoji: "🏞",
    color: "from-blue-500 to-teal-600",
    faculties: [
      {
        id: "isu-bio",
        name: "Биолого-почвенный факультет",
        specialty: "Биология",
        exams: [
          { subject: "biology", minScore: 50 },
          { subject: "chemistry", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 95,
      },
    ],
  },
  {
    id: "irnitu",
    shortName: "ИрНИТУ",
    fullName: "Иркутский национальный исследовательский технический университет",
    city: "Иркутск",
    regionId: "irkutsk",
    emoji: "⚙",
    color: "from-slate-600 to-zinc-700",
    faculties: [
      {
        id: "irnitu-it",
        name: "Институт информационных технологий и анализа данных",
        specialty: "Прикладная информатика",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 210,
        budgetSeats: 180,
      },
    ],
  },

  // ─── ВЛАДИВОСТОК ───────────────────────────────────────────────────
  {
    id: "fefu",
    shortName: "ДВФУ",
    fullName: "Дальневосточный федеральный университет",
    city: "Владивосток",
    regionId: "primorsky",
    emoji: "🌅",
    color: "from-cyan-500 to-blue-600",
    website: "https://www.dvfu.ru",
    faculties: [
      {
        id: "fefu-it",
        name: "Институт математики и компьютерных технологий",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 230,
        budgetSeats: 175,
      },
      {
        id: "fefu-orient",
        name: "Восточный институт",
        specialty: "Востоковедение и африканистика",
        exams: [
          { subject: "foreign", minScore: 55 },
          { subject: "history", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 70,
      },
    ],
  },
  {
    id: "pgma-tof",
    shortName: "ТОВВМУ",
    fullName: "Тихоокеанское высшее военно-морское училище им. С. О. Макарова",
    city: "Владивосток",
    regionId: "primorsky",
    isMilitary: true,
    emoji: "⚓",
    color: "from-blue-800 to-indigo-900",
    faculties: [
      {
        id: "tovvmu-navy",
        name: "Штурманский факультет",
        specialty: "Применение и эксплуатация надводных кораблей",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 200,
        budgetSeats: 180,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, плавание, контракт с МО РФ",
      },
    ],
  },

  // ─── ХАБАРОВСК ─────────────────────────────────────────────────────
  {
    id: "pnu",
    shortName: "ТОГУ",
    fullName: "Тихоокеанский государственный университет",
    city: "Хабаровск",
    regionId: "khabarovsk",
    emoji: "🐯",
    color: "from-amber-600 to-orange-700",
    faculties: [
      {
        id: "pnu-build",
        name: "Факультет архитектуры и дизайна",
        specialty: "Строительство",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 210,
        budgetSeats: 165,
      },
    ],
  },

  // ─── УФА ───────────────────────────────────────────────────────────
  {
    id: "bashgu",
    shortName: "УУНиТ",
    fullName: "Уфимский университет науки и технологий",
    city: "Уфа",
    regionId: "bashkortostan",
    emoji: "🍯",
    color: "from-amber-500 to-yellow-600",
    faculties: [
      {
        id: "bashgu-it",
        name: "Институт информатики, математики и робототехники",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 195,
      },
    ],
  },
  {
    id: "bgmu",
    shortName: "БГМУ",
    fullName: "Башкирский государственный медицинский университет",
    city: "Уфа",
    regionId: "bashkortostan",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "bgmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 250,
      },
    ],
  },

  // ─── САРАТОВ ───────────────────────────────────────────────────────
  {
    id: "sgu",
    shortName: "СГУ им. Чернышевского",
    fullName: "Саратовский национальный исследовательский государственный университет",
    city: "Саратов",
    regionId: "saratov",
    emoji: "🌽",
    color: "from-yellow-500 to-amber-600",
    faculties: [
      {
        id: "sgu-cs",
        name: "Факультет компьютерных наук и информационных технологий",
        specialty: "Информатика и вычислительная техника",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 150,
      },
    ],
  },
  // ─── КАЛИНИНГРАД ───────────────────────────────────────────────────
  {
    id: "kantiana",
    shortName: "БФУ им. Канта",
    fullName: "Балтийский федеральный университет им. Иммануила Канта",
    city: "Калининград",
    regionId: "kaliningrad",
    emoji: "🏛",
    color: "from-blue-600 to-indigo-700",
    website: "https://kantiana.ru",
    faculties: [
      {
        id: "bfu-medical",
        name: "Медицинский институт",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 160,
      },
      {
        id: "bfu-it",
        name: "Институт высоких технологий",
        specialty: "Программная инженерия",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 230,
        budgetSeats: 120,
      },
    ],
  },

  // ─── ТЮМЕНЬ ────────────────────────────────────────────────────────
  {
    id: "tyumgu",
    shortName: "ТюмГУ",
    fullName: "Тюменский государственный университет",
    city: "Тюмень",
    regionId: "tyumen",
    emoji: "🛢",
    color: "from-amber-600 to-orange-700",
    website: "https://www.utmn.ru",
    faculties: [
      {
        id: "tyumgu-it",
        name: "Институт математики и компьютерных наук",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 145,
      },
    ],
  },
  {
    id: "tindustrial",
    shortName: "ТИУ",
    fullName: "Тюменский индустриальный университет",
    city: "Тюмень",
    regionId: "tyumen",
    emoji: "⛽",
    color: "from-zinc-600 to-stone-700",
    faculties: [
      {
        id: "tiu-oil",
        name: "Институт геологии и нефтегазодобычи",
        specialty: "Нефтегазовое дело",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 290,
      },
    ],
  },

  // ─── ОМСК ──────────────────────────────────────────────────────────
  {
    id: "omsk-tank",
    shortName: "ОАБИИ",
    fullName: "Омский автобронетанковый инженерный институт",
    city: "Омск",
    regionId: "omsk",
    isMilitary: true,
    emoji: "🛡",
    color: "from-emerald-800 to-green-900",
    faculties: [
      {
        id: "omsk-armor",
        name: "Эксплуатация бронетанковой техники",
        specialty: "Военно-инженерная подготовка",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 190,
        budgetSeats: 220,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, контракт с МО РФ",
      },
    ],
  },

  // ─── УЛЬЯНОВСК ─────────────────────────────────────────────────────
  {
    id: "ulsu",
    shortName: "УлГУ",
    fullName: "Ульяновский государственный университет",
    city: "Ульяновск",
    regionId: "ulyanovsk",
    emoji: "✈",
    color: "from-blue-500 to-sky-600",
    faculties: [
      {
        id: "ulsu-medical",
        name: "Институт медицины, экологии и физкультуры",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 175,
      },
    ],
  },
  {
    id: "uvaul",
    shortName: "УВАУ ГА",
    fullName: "Ульяновский институт гражданской авиации им. Б. П. Бугаева",
    city: "Ульяновск",
    regionId: "ulyanovsk",
    emoji: "🛫",
    color: "from-sky-600 to-blue-700",
    faculties: [
      {
        id: "uvaul-pilot",
        name: "Лётный факультет",
        specialty: "Эксплуатация воздушных судов",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 180,
        hasAdditional: true,
        additionalNote: "ВЛЭК (медкомиссия), профотбор пилота",
      },
    ],
  },

  // ─── СТАВРОПОЛЬ ────────────────────────────────────────────────────
  {
    id: "ncfu",
    shortName: "СКФУ",
    fullName: "Северо-Кавказский федеральный университет",
    city: "Ставрополь",
    regionId: "stavropol",
    emoji: "🏞",
    color: "from-emerald-600 to-teal-700",
    website: "https://www.ncfu.ru",
    faculties: [
      {
        id: "ncfu-it",
        name: "Институт цифрового развития",
        specialty: "Прикладная информатика",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 170,
      },
    ],
  },
  // ─── КРАСНОДАР (продолжение) ───────────────────────────────────────
  {
    id: "kubgmu",
    shortName: "КубГМУ",
    fullName: "Кубанский государственный медицинский университет",
    city: "Краснодар",
    regionId: "krasnodar",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "kubgmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 250,
        budgetSeats: 280,
      },
    ],
  },
  {
    id: "kubgau",
    shortName: "КубГАУ им. Трубилина",
    fullName: "Кубанский государственный аграрный университет им. И. Т. Трубилина",
    city: "Краснодар",
    regionId: "krasnodar",
    emoji: "🌾",
    color: "from-lime-600 to-green-700",
    faculties: [
      {
        id: "kubgau-agro",
        name: "Агрономический факультет",
        specialty: "Агрономия",
        exams: [
          { subject: "biology", minScore: 45 },
          { subject: "math_prof", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 200,
        budgetSeats: 230,
      },
    ],
  },

  // ─── ДОПОЛНИТЕЛЬНЫЕ МОСКВА (для добивания до 100) ──────────────────
  {
    id: "msulit",
    shortName: "Литературный институт",
    fullName: "Литературный институт им. А. М. Горького",
    city: "Москва",
    regionId: "moscow",
    emoji: "✒️",
    color: "from-amber-600 to-orange-700",
    faculties: [
      {
        id: "lit-prose",
        name: "Очное отделение",
        specialty: "Литературное творчество",
        exams: [
          { subject: "literature", minScore: 60 },
          { subject: "russian", minScore: 55 },
          { subject: "history", minScore: 45 },
        ],
        passingScore: 260,
        budgetSeats: 65,
        hasAdditional: true,
        additionalNote: "Творческий конкурс (приём рукописей + собеседование)",
      },
    ],
  },
  {
    id: "gitis",
    shortName: "ГИТИС",
    fullName: "Российский институт театрального искусства — ГИТИС",
    city: "Москва",
    regionId: "moscow",
    emoji: "🎭",
    color: "from-rose-600 to-red-700",
    faculties: [
      {
        id: "gitis-actor",
        name: "Актёрский факультет",
        specialty: "Актёрское искусство",
        exams: [
          { subject: "literature", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 230,
        budgetSeats: 60,
        hasAdditional: true,
        additionalNote: "Творческое испытание (3 тура: чтение, этюды, собеседование)",
      },
    ],
  },
  {
    id: "msu-conservatory",
    shortName: "Московская консерватория",
    fullName: "Московская государственная консерватория им. П. И. Чайковского",
    city: "Москва",
    regionId: "moscow",
    emoji: "🎼",
    color: "from-indigo-700 to-purple-800",
    faculties: [
      {
        id: "conservatory-piano",
        name: "Фортепианный факультет",
        specialty: "Музыкально-инструментальное искусство",
        exams: [
          { subject: "literature", minScore: 45 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 220,
        budgetSeats: 50,
        hasAdditional: true,
        additionalNote: "Творческое испытание (исполнение программы, сольфеджио, гармония)",
      },
    ],
  },
  {
    id: "mgaip-surikov",
    shortName: "МГАХИ им. Сурикова",
    fullName: "Московский государственный академический художественный институт им. В. И. Сурикова",
    city: "Москва",
    regionId: "moscow",
    emoji: "🖼",
    color: "from-orange-600 to-red-700",
    faculties: [
      {
        id: "surikov-painting",
        name: "Факультет живописи",
        specialty: "Живопись",
        exams: [
          { subject: "literature", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 220,
        budgetSeats: 40,
        hasAdditional: true,
        additionalNote: "Творческое испытание (рисунок, живопись, композиция)",
      },
    ],
  },
  {
    id: "rea-kosygin",
    shortName: "РГУ им. Косыгина",
    fullName: "Российский государственный университет им. А. Н. Косыгина",
    city: "Москва",
    regionId: "moscow",
    emoji: "🧵",
    color: "from-pink-500 to-purple-600",
    faculties: [
      {
        id: "kosygin-design",
        name: "Институт искусств",
        specialty: "Дизайн костюма",
        exams: [
          { subject: "literature", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 200,
        budgetSeats: 80,
        hasAdditional: true,
        additionalNote: "Творческое испытание (рисунок, композиция)",
      },
    ],
  },
  // ─── ФИНАЛЬНАЯ ПОРЦИЯ ДО 100 ───────────────────────────────────────
  {
    id: "miit",
    shortName: "РУТ (МИИТ)",
    fullName: "Российский университет транспорта (МИИТ)",
    city: "Москва",
    regionId: "moscow",
    emoji: "🚆",
    color: "from-blue-700 to-cyan-700",
    website: "https://www.miit.ru",
    faculties: [
      {
        id: "miit-transport",
        name: "Институт пути, строительства и сооружений",
        specialty: "Строительство железных дорог",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 240,
      },
    ],
  },
  {
    id: "rgups",
    shortName: "РГУПС",
    fullName: "Ростовский государственный университет путей сообщения",
    city: "Ростов-на-Дону",
    regionId: "rostov",
    emoji: "🚆",
    color: "from-zinc-600 to-blue-700",
    faculties: [
      {
        id: "rgups-railway",
        name: "Электромеханический факультет",
        specialty: "Подвижной состав железных дорог",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 200,
        budgetSeats: 180,
      },
    ],
  },
  {
    id: "spbgu-civil-aviation",
    shortName: "СПбГУ ГА",
    fullName: "Санкт-Петербургский государственный университет гражданской авиации",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "🛫",
    color: "from-sky-600 to-blue-700",
    faculties: [
      {
        id: "spbgu-ga-pilot",
        name: "Лётная эксплуатация воздушных судов",
        specialty: "Эксплуатация воздушных судов",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 225,
        budgetSeats: 160,
        hasAdditional: true,
        additionalNote: "ВЛЭК (медкомиссия), профотбор",
      },
    ],
  },
  {
    id: "spbgut",
    shortName: "СПбГУТ им. Бонч-Бруевича",
    fullName: "Санкт-Петербургский государственный университет телекоммуникаций им. М. А. Бонч-Бруевича",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "📡",
    color: "from-cyan-600 to-blue-700",
    faculties: [
      {
        id: "spbgut-it",
        name: "Факультет инфокоммуникационных сетей и систем",
        specialty: "Инфокоммуникационные технологии",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 230,
        budgetSeats: 200,
      },
    ],
  },
  {
    id: "rshu",
    shortName: "РГГМУ",
    fullName: "Российский государственный гидрометеорологический университет",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "🌧",
    color: "from-cyan-500 to-blue-500",
    faculties: [
      {
        id: "rshu-meteo",
        name: "Метеорологический факультет",
        specialty: "Гидрометеорология",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 200,
        budgetSeats: 95,
      },
    ],
  },
  {
    id: "spbguef",
    shortName: "СПбГЭУ",
    fullName: "Санкт-Петербургский государственный экономический университет",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "💼",
    color: "from-emerald-600 to-teal-700",
    faculties: [
      {
        id: "spbguef-econ",
        name: "Факультет экономики и финансов",
        specialty: "Экономика",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "social", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 250,
        budgetSeats: 180,
      },
    ],
  },
  {
    id: "rea-yelets",
    shortName: "ВУНЦ СВ «ОВА ВС РФ»",
    fullName: "Общевойсковая академия Вооружённых Сил РФ",
    city: "Москва",
    regionId: "moscow",
    isMilitary: true,
    emoji: "🎖",
    color: "from-emerald-800 to-green-900",
    faculties: [
      {
        id: "ova-ground",
        name: "Командный факультет",
        specialty: "Управление подразделениями",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 190,
        budgetSeats: 220,
        hasAdditional: true,
        additionalNote: "ВВК, физподготовка, контракт с МО РФ",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // РАСШИРЕНИЕ: +25 ВУЗов по городам-миллионникам (приоритет — миллионники)
  // ═══════════════════════════════════════════════════════════════════════

  // ─── ВОЛГОГРАД (миллионник, не был представлен) ────────────────────
  {
    id: "volsu",
    shortName: "ВолГУ",
    fullName: "Волгоградский государственный университет",
    city: "Волгоград",
    regionId: "volgograd",
    emoji: "🗿",
    color: "from-amber-600 to-orange-700",
    website: "https://volsu.ru",
    faculties: [
      {
        id: "volsu-it",
        name: "Институт математики и информационных технологий",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 145,
      },
    ],
  },
  {
    id: "vstu",
    shortName: "ВолгГТУ",
    fullName: "Волгоградский государственный технический университет",
    city: "Волгоград",
    regionId: "volgograd",
    emoji: "⚙",
    color: "from-zinc-600 to-stone-700",
    faculties: [
      {
        id: "vstu-auto",
        name: "Автомобильный факультет",
        specialty: "Эксплуатация транспортно-технологических машин",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 205,
        budgetSeats: 220,
      },
    ],
  },
  {
    id: "volggmu",
    shortName: "ВолгГМУ",
    fullName: "Волгоградский государственный медицинский университет",
    city: "Волгоград",
    regionId: "volgograd",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    website: "https://www.volgmed.ru",
    faculties: [
      {
        id: "volggmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 240,
      },
    ],
  },

  // ─── ОМСК (миллионник, был только военный) ─────────────────────────
  {
    id: "omsu",
    shortName: "ОмГУ им. Достоевского",
    fullName: "Омский государственный университет им. Ф. М. Достоевского",
    city: "Омск",
    regionId: "omsk",
    emoji: "📚",
    color: "from-purple-600 to-indigo-700",
    website: "https://www.omsu.ru",
    faculties: [
      {
        id: "omsu-it",
        name: "Факультет компьютерных наук",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "informatics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 130,
      },
    ],
  },
  {
    id: "omgtu",
    shortName: "ОмГТУ",
    fullName: "Омский государственный технический университет",
    city: "Омск",
    regionId: "omsk",
    emoji: "⚙",
    color: "from-slate-600 to-zinc-700",
    faculties: [
      {
        id: "omgtu-aero",
        name: "Факультет транспорта, нефти и газа",
        specialty: "Авиационная и ракетно-космическая техника",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 210,
        budgetSeats: 195,
      },
    ],
  },
  {
    id: "omgmu",
    shortName: "ОмГМУ",
    fullName: "Омский государственный медицинский университет",
    city: "Омск",
    regionId: "omsk",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "omgmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 210,
      },
    ],
  },

  // ─── ЕКАТЕРИНБУРГ (миллионник, расширение) ─────────────────────────
  {
    id: "urgups",
    shortName: "УрГУПС",
    fullName: "Уральский государственный университет путей сообщения",
    city: "Екатеринбург",
    regionId: "sverdlovsk",
    emoji: "🚆",
    color: "from-blue-700 to-cyan-700",
    faculties: [
      {
        id: "urgups-railway",
        name: "Механический факультет",
        specialty: "Подвижной состав железных дорог",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 210,
        budgetSeats: 200,
      },
    ],
  },
  {
    id: "usue",
    shortName: "УрГЭУ-СИНХ",
    fullName: "Уральский государственный экономический университет",
    city: "Екатеринбург",
    regionId: "sverdlovsk",
    emoji: "💼",
    color: "from-emerald-600 to-teal-700",
    faculties: [
      {
        id: "usue-finance",
        name: "Институт финансов и права",
        specialty: "Финансы и кредит",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "social", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 230,
        budgetSeats: 150,
      },
    ],
  },

  // ─── КАЗАНЬ (миллионник, расширение) ───────────────────────────────
  {
    id: "kazan-aviation",
    shortName: "КНИТУ-КАИ",
    fullName: "Казанский национальный исследовательский технический университет им. А. Н. Туполева — КАИ",
    city: "Казань",
    regionId: "tatarstan",
    emoji: "✈",
    color: "from-sky-600 to-blue-700",
    website: "https://kai.ru",
    faculties: [
      {
        id: "kai-aero",
        name: "Институт авиации, наземного транспорта и энергетики",
        specialty: "Проектирование авиационных и ракетных двигателей",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 260,
      },
    ],
  },
  {
    id: "kazan-energy",
    shortName: "КГЭУ",
    fullName: "Казанский государственный энергетический университет",
    city: "Казань",
    regionId: "tatarstan",
    emoji: "⚡",
    color: "from-yellow-500 to-amber-600",
    faculties: [
      {
        id: "kgeu-energy",
        name: "Институт электроэнергетики и электроники",
        specialty: "Электроэнергетика и электротехника",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 210,
        budgetSeats: 240,
      },
    ],
  },

  // ─── НИЖНИЙ НОВГОРОД (миллионник, расширение) ──────────────────────
  {
    id: "nnsu-economy",
    shortName: "НИУ ВШЭ — Нижний",
    fullName: "Национальный исследовательский университет «Высшая школа экономики» — Нижний Новгород",
    city: "Нижний Новгород",
    regionId: "nizhny",
    emoji: "💼",
    color: "from-blue-700 to-indigo-800",
    website: "https://nnov.hse.ru",
    faculties: [
      {
        id: "hse-nn-it",
        name: "Факультет информатики, математики и компьютерных наук",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 60 },
          { subject: "informatics", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 260,
        budgetSeats: 130,
      },
    ],
  },

  // ─── ЧЕЛЯБИНСК (миллионник, расширение) ────────────────────────────
  {
    id: "chgma",
    shortName: "ЮУГМУ",
    fullName: "Южно-Уральский государственный медицинский университет",
    city: "Челябинск",
    regionId: "chelyabinsk",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "yugmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 230,
      },
    ],
  },
  {
    id: "magtu",
    shortName: "МГТУ им. Носова",
    fullName: "Магнитогорский государственный технический университет им. Г. И. Носова",
    city: "Магнитогорск",
    regionId: "chelyabinsk",
    emoji: "⚙",
    color: "from-zinc-600 to-stone-700",
    faculties: [
      {
        id: "magtu-metal",
        name: "Институт металлургии, машиностроения и материалообработки",
        specialty: "Металлургия",
        exams: [
          { subject: "math_prof", minScore: 40 },
          { subject: "physics", minScore: 40 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 195,
        budgetSeats: 220,
      },
    ],
  },

  // ─── САМАРА (миллионник, расширение) ───────────────────────────────
  {
    id: "samara-pol",
    shortName: "СамГТУ",
    fullName: "Самарский государственный технический университет",
    city: "Самара",
    regionId: "samara",
    emoji: "⚙",
    color: "from-slate-600 to-zinc-700",
    website: "https://samgtu.ru",
    faculties: [
      {
        id: "samgtu-oil",
        name: "Нефтетехнологический факультет",
        specialty: "Нефтегазовое дело",
        exams: [
          { subject: "math_prof", minScore: 45 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 215,
        budgetSeats: 250,
      },
    ],
  },

  // ─── УФА (миллионник, расширение) ──────────────────────────────────
  {
    id: "ugatu",
    shortName: "УГАТУ",
    fullName: "Уфимский государственный авиационный технический университет",
    city: "Уфа",
    regionId: "bashkortostan",
    emoji: "✈",
    color: "from-sky-600 to-blue-700",
    faculties: [
      {
        id: "ugatu-aero",
        name: "Факультет авиационных двигателей",
        specialty: "Двигатели летательных аппаратов",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 225,
        budgetSeats: 235,
      },
    ],
  },
  {
    id: "ugntu",
    shortName: "УГНТУ",
    fullName: "Уфимский государственный нефтяной технический университет",
    city: "Уфа",
    regionId: "bashkortostan",
    emoji: "🛢",
    color: "from-amber-600 to-orange-700",
    website: "https://www.rusoil.net",
    faculties: [
      {
        id: "ugntu-oil",
        name: "Факультет трубопроводного транспорта",
        specialty: "Нефтегазовое дело",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "physics", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 225,
        budgetSeats: 280,
      },
    ],
  },

  // ─── РОСТОВ-НА-ДОНУ (миллионник, расширение) ───────────────────────
  {
    id: "rsue-rinh",
    shortName: "РГЭУ (РИНХ)",
    fullName: "Ростовский государственный экономический университет",
    city: "Ростов-на-Дону",
    regionId: "rostov",
    emoji: "💼",
    color: "from-emerald-600 to-teal-700",
    faculties: [
      {
        id: "rinh-finance",
        name: "Финансовый факультет",
        specialty: "Финансы и кредит",
        exams: [
          { subject: "math_prof", minScore: 50 },
          { subject: "social", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 230,
        budgetSeats: 165,
      },
    ],
  },

  // ─── КРАСНОЯРСК (миллионник, расширение) ───────────────────────────
  {
    id: "krasgmu",
    shortName: "КрасГМУ",
    fullName: "Красноярский государственный медицинский университет им. В. Ф. Войно-Ясенецкого",
    city: "Красноярск",
    regionId: "krasnoyarsk",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "krasgmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 245,
        budgetSeats: 235,
      },
    ],
  },

  // ─── НОВОСИБИРСК (миллионник, расширение) ──────────────────────────
  {
    id: "nstu",
    shortName: "НГТУ",
    fullName: "Новосибирский государственный технический университет",
    city: "Новосибирск",
    regionId: "novosibirsk",
    emoji: "⚙",
    color: "from-slate-600 to-zinc-700",
    website: "https://www.nstu.ru",
    faculties: [
      {
        id: "nstu-it",
        name: "Факультет прикладной математики и информатики",
        specialty: "Прикладная математика и информатика",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "informatics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 240,
        budgetSeats: 260,
      },
    ],
  },
  {
    id: "ngpu",
    shortName: "НГПУ",
    fullName: "Новосибирский государственный педагогический университет",
    city: "Новосибирск",
    regionId: "novosibirsk",
    emoji: "📚",
    color: "from-emerald-500 to-green-600",
    faculties: [
      {
        id: "ngpu-edu",
        name: "Институт филологии, массовой информации и психологии",
        specialty: "Педагогическое образование (русский язык и литература)",
        exams: [
          { subject: "russian", minScore: 55 },
          { subject: "literature", minScore: 50 },
          { subject: "social", minScore: 45 },
        ],
        passingScore: 220,
        budgetSeats: 180,
      },
    ],
  },

  // ─── ПЕРМЬ (миллионник, расширение) ────────────────────────────────
  {
    id: "psma",
    shortName: "ПГМУ им. Вагнера",
    fullName: "Пермский государственный медицинский университет им. Е. А. Вагнера",
    city: "Пермь",
    regionId: "perm",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    faculties: [
      {
        id: "psma-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 50 },
          { subject: "biology", minScore: 50 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 240,
        budgetSeats: 215,
      },
    ],
  },

  // ─── ВОРОНЕЖ (миллионник, расширение) ──────────────────────────────
  {
    id: "vgma",
    shortName: "ВГМУ им. Бурденко",
    fullName: "Воронежский государственный медицинский университет им. Н. Н. Бурденко",
    city: "Воронеж",
    regionId: "voronezh",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    website: "https://vrngmu.ru",
    faculties: [
      {
        id: "vgma-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 55 },
          { subject: "biology", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 255,
        budgetSeats: 270,
      },
    ],
  },

  // ─── КРАСНОДАР (миллионник, расширение) ────────────────────────────
  {
    id: "kgufkst",
    shortName: "КГУФКСТ",
    fullName: "Кубанский государственный университет физической культуры, спорта и туризма",
    city: "Краснодар",
    regionId: "krasnodar",
    emoji: "🏅",
    color: "from-amber-500 to-orange-600",
    faculties: [
      {
        id: "kgufkst-sport",
        name: "Факультет адаптивной и оздоровительной физической культуры",
        specialty: "Физическая культура",
        exams: [
          { subject: "biology", minScore: 45 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 195,
        budgetSeats: 165,
        hasAdditional: true,
        additionalNote: "Профильный экзамен (физподготовка, нормативы)",
      },
    ],
  },

  // ─── САНКТ-ПЕТЕРБУРГ (расширение) ──────────────────────────────────
  {
    id: "spbmu-mechnikov",
    shortName: "СЗГМУ им. Мечникова",
    fullName: "Северо-Западный государственный медицинский университет им. И. И. Мечникова",
    city: "Санкт-Петербург",
    regionId: "spb",
    emoji: "⚕",
    color: "from-rose-500 to-red-500",
    website: "https://szgmu.ru",
    faculties: [
      {
        id: "szgmu-medical",
        name: "Лечебный факультет",
        specialty: "Лечебное дело",
        exams: [
          { subject: "chemistry", minScore: 55 },
          { subject: "biology", minScore: 55 },
          { subject: "russian", minScore: 50 },
        ],
        passingScore: 255,
        budgetSeats: 290,
      },
    ],
  },

  // ─── МОСКВА (расширение — ИТ и инженерия) ──────────────────────────
  {
    id: "mai",
    shortName: "МАИ",
    fullName: "Московский авиационный институт (НИУ)",
    city: "Москва",
    regionId: "moscow",
    emoji: "✈",
    color: "from-sky-600 to-blue-700",
    website: "https://mai.ru",
    faculties: [
      {
        id: "mai-aero",
        name: "Институт № 1 «Авиационная техника»",
        specialty: "Самолёто- и вертолётостроение",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "physics", minScore: 50 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 245,
        budgetSeats: 310,
      },
    ],
  },
  {
    id: "mirea",
    shortName: "РТУ МИРЭА",
    fullName: "Российский технологический университет МИРЭА",
    city: "Москва",
    regionId: "moscow",
    emoji: "💻",
    color: "from-cyan-600 to-blue-700",
    website: "https://www.mirea.ru",
    faculties: [
      {
        id: "mirea-it",
        name: "Институт информационных технологий",
        specialty: "Программная инженерия",
        exams: [
          { subject: "math_prof", minScore: 55 },
          { subject: "informatics", minScore: 55 },
          { subject: "russian", minScore: 45 },
        ],
        passingScore: 250,
        budgetSeats: 340,
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