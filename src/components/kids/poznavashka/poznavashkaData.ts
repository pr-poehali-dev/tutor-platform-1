export interface PoznavashkaOption {
  label: string;
  emoji: string;
  correct: boolean;
}

export interface PoznavashkaQuestion {
  id: string;
  question: string;
  hint: string;
  fact: string;
  options: PoznavashkaOption[];
}

export interface PoznavashkaWorld {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  questions: PoznavashkaQuestion[];
}

export const KSUSHA_AVATAR =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/87a4c173-ed41-4204-8216-2fb7b28f2381.png";

export const ZNAIKI_PER_CORRECT = 5;

export const POZNAVASHKA_WORLDS: PoznavashkaWorld[] = [
  {
    slug: "nature",
    title: "Лесная поляна",
    subtitle: "Растения, деревья и времена года",
    emoji: "🌳",
    color: "from-emerald-400 to-green-600",
    questions: [
      {
        id: "n1",
        question: "Что нужно растению, чтобы расти?",
        hint: "Подумай, что мы наливаем в цветочный горшок и что светит в окно.",
        fact: "Растениям нужны вода, свет и тепло — тогда они растут большими и здоровыми!",
        options: [
          { label: "Вода и солнышко", emoji: "💧", correct: true },
          { label: "Конфеты", emoji: "🍬", correct: false },
          { label: "Темнота", emoji: "🌑", correct: false },
        ],
      },
      {
        id: "n2",
        question: "В какое время года падают жёлтые листья?",
        hint: "Это бывает, когда становится прохладно и идут дожди.",
        fact: "Осенью листья желтеют и опадают — деревья готовятся к зимнему сну.",
        options: [
          { label: "Осень", emoji: "🍂", correct: true },
          { label: "Лето", emoji: "☀️", correct: false },
          { label: "Зима", emoji: "❄️", correct: false },
        ],
      },
      {
        id: "n3",
        question: "Где живут белочки?",
        hint: "Они прыгают высоко-высоко и любят орешки.",
        fact: "Белки живут на деревьях в дуплах и запасают орешки на зиму.",
        options: [
          { label: "На деревьях", emoji: "🐿️", correct: true },
          { label: "Под водой", emoji: "🌊", correct: false },
          { label: "В облаках", emoji: "☁️", correct: false },
        ],
      },
    ],
  },
  {
    slug: "animals",
    title: "Звериный двор",
    subtitle: "Животные и кто что говорит",
    emoji: "🐮",
    color: "from-orange-400 to-amber-600",
    questions: [
      {
        id: "a1",
        question: "Кто даёт нам молоко?",
        hint: "Она большая, говорит «му-у-у» и пасётся на лугу.",
        fact: "Молоко нам даёт корова — из него делают сыр, творог и мороженое!",
        options: [
          { label: "Корова", emoji: "🐮", correct: true },
          { label: "Кошка", emoji: "🐱", correct: false },
          { label: "Рыбка", emoji: "🐟", correct: false },
        ],
      },
      {
        id: "a2",
        question: "Кто умеет летать?",
        hint: "У неё есть крылья и она поёт по утрам.",
        fact: "Птицы умеют летать — у них есть крылья и лёгкие пёрышки.",
        options: [
          { label: "Птичка", emoji: "🐦", correct: true },
          { label: "Слон", emoji: "🐘", correct: false },
          { label: "Черепаха", emoji: "🐢", correct: false },
        ],
      },
      {
        id: "a3",
        question: "Кто живёт в воде?",
        hint: "Она плавает и совсем не умеет ходить.",
        fact: "Рыбки живут в воде и дышат жабрами — на суше им трудно.",
        options: [
          { label: "Рыбка", emoji: "🐟", correct: true },
          { label: "Заяц", emoji: "🐰", correct: false },
          { label: "Петух", emoji: "🐓", correct: false },
        ],
      },
    ],
  },
  {
    slug: "sky",
    title: "Небесное царство",
    subtitle: "Солнце, погода и звёзды",
    emoji: "☀️",
    color: "from-sky-400 to-blue-600",
    questions: [
      {
        id: "s1",
        question: "Что светит днём на небе?",
        hint: "Оно жёлтое, тёплое и от него светло.",
        fact: "Днём на небе светит Солнце — оно греет землю и даёт нам свет.",
        options: [
          { label: "Солнце", emoji: "☀️", correct: true },
          { label: "Луна", emoji: "🌙", correct: false },
          { label: "Лампа", emoji: "💡", correct: false },
        ],
      },
      {
        id: "s2",
        question: "Что падает с неба, когда идёт дождь?",
        hint: "Это капельки воды, и после них бывает радуга.",
        fact: "Дождь — это капельки воды из тучек. После дождя растут лужи и радуга!",
        options: [
          { label: "Капельки воды", emoji: "🌧️", correct: true },
          { label: "Камешки", emoji: "🪨", correct: false },
          { label: "Песок", emoji: "🏖️", correct: false },
        ],
      },
      {
        id: "s3",
        question: "Когда на небе видно звёздочки?",
        hint: "Это бывает, когда темно и пора спать.",
        fact: "Звёзды видно ночью, когда небо тёмное. Днём их прячет яркое солнышко.",
        options: [
          { label: "Ночью", emoji: "🌟", correct: true },
          { label: "Днём", emoji: "🌤️", correct: false },
          { label: "Утром", emoji: "🌅", correct: false },
        ],
      },
    ],
  },
  {
    slug: "body",
    title: "Страна Здоровья",
    subtitle: "Тело, гигиена и полезные привычки",
    emoji: "💪",
    color: "from-pink-400 to-rose-600",
    questions: [
      {
        id: "b1",
        question: "Чем мы видим всё вокруг?",
        hint: "Их два, и мы их закрываем, когда спим.",
        fact: "Мы видим глазами! Их нужно беречь и не тереть грязными ручками.",
        options: [
          { label: "Глазками", emoji: "👀", correct: true },
          { label: "Ушками", emoji: "👂", correct: false },
          { label: "Носиком", emoji: "👃", correct: false },
        ],
      },
      {
        id: "b2",
        question: "Что нужно делать перед едой?",
        hint: "Чтобы микробы не попали в животик.",
        fact: "Перед едой нужно мыть руки с мылом — так микробы не попадут в животик.",
        options: [
          { label: "Помыть руки", emoji: "🧼", correct: true },
          { label: "Попрыгать", emoji: "🤸", correct: false },
          { label: "Поспать", emoji: "😴", correct: false },
        ],
      },
      {
        id: "b3",
        question: "Что полезно кушать, чтобы быть сильным?",
        hint: "Они растут на грядке и на деревьях, бывают красные и зелёные.",
        fact: "Овощи и фрукты дают витамины — от них мы становимся сильными и здоровыми!",
        options: [
          { label: "Фрукты и овощи", emoji: "🍎", correct: true },
          { label: "Только конфеты", emoji: "🍭", correct: false },
          { label: "Газировку", emoji: "🥤", correct: false },
        ],
      },
    ],
  },
];