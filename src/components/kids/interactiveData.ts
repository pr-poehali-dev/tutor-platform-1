/**
 * Интерактивный движок занятий модуля «Малыш».
 * Каждое занятие — последовательность сцен.
 * Сцены поддерживают разные типы интерактива:
 *  - flashcard: показ карточки с озвучкой
 *  - choose: «покажи / выбери картинку»
 *  - sort: сортировка предметов по корзинам
 *  - letter: знакомство с буквой
 *  - counting: счёт предметов
 *  - emotion: распознавание эмоции
 *  - song: пальчиковая игра/песенка с шагами
 *  - listen: «послушай и повтори» (звукоподражание)
 */

export type SceneKind =
  | "flashcard"
  | "choose"
  | "sort"
  | "letter"
  | "counting"
  | "emotion"
  | "song"
  | "listen"
  | "intro"
  | "finish";

export interface SceneOption {
  emoji: string;
  label: string;
  correct?: boolean;
  /** Для sort: к какой корзине относится */
  bucketId?: string;
}

export interface SortBucket {
  id: string;
  label: string;
  emoji: string;
}

export interface Scene {
  kind: SceneKind;
  /** Что Лиса говорит вслух в этой сцене */
  voice: string;
  /** Главное изображение/эмодзи сцены */
  emoji?: string;
  /** Заголовок над сценой */
  title?: string;
  /** Описание для родителя (мелкий текст) */
  hintForParent?: string;
  /** Варианты ответа (для choose, sort, emotion) */
  options?: SceneOption[];
  /** Корзины для сортировки */
  buckets?: SortBucket[];
  /** Текст для отображения крупно (буква, слог, цифра) */
  bigText?: string;
  /** Сколько XP-звёзд даёт сцена при успехе */
  reward?: number;
  /** Шаги/строки песенки */
  songSteps?: string[];
}

export interface InteractiveLesson {
  /** ID должен совпадать с Activity.id */
  activityId: number;
  scenes: Scene[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ИНТЕРАКТИВНЫЕ ЗАНЯТИЯ
// ─────────────────────────────────────────────────────────────────────────────
export const INTERACTIVE_LESSONS: InteractiveLesson[] = [
  // ─── 1001: Где у мишки носик? (1-2, речь) ───────────────────────────
  {
    activityId: 1001,
    scenes: [
      {
        kind: "intro",
        voice: "Привет, малыш! Я Лиса. Сегодня мы поиграем с мишкой и найдём, где у него носик, глазки и лапки. Готов? Тогда начинаем!",
        emoji: "🦊",
        title: "Привет!",
      },
      {
        kind: "choose",
        voice: "Смотри на мишку. Где у мишки носик? Покажи пальчиком и нажми!",
        emoji: "🧸",
        title: "Где носик у мишки?",
        options: [
          { emoji: "👃", label: "Носик", correct: true },
          { emoji: "👀", label: "Глазки" },
          { emoji: "🦶", label: "Лапки" },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "Молодец! А где у мишки глазки? Глазками мишка смотрит на тебя!",
        emoji: "🧸",
        title: "Где глазки?",
        options: [
          { emoji: "👃", label: "Носик" },
          { emoji: "👀", label: "Глазки", correct: true },
          { emoji: "👂", label: "Ушки" },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "Здорово! Последний вопрос. Где у мишки лапки? Лапками мишка топ-топ!",
        emoji: "🧸",
        title: "А где лапки?",
        options: [
          { emoji: "👂", label: "Ушки" },
          { emoji: "🦶", label: "Лапки", correct: true },
          { emoji: "👃", label: "Носик" },
        ],
        reward: 1,
      },
      {
        kind: "finish",
        voice: "Ты молодец! Знаешь, где у мишки носик, глазки и лапки. А теперь покажи родителю те же части тела на себе!",
        emoji: "🎉",
        title: "Получилось!",
        hintForParent: "Покажите ребёнку нос, глаза и руки на себе — закрепите связь.",
      },
    ],
  },

  // ─── 1002: Сортер — круг и квадрат (1-2, моторика) ──────────────────
  {
    activityId: 1002,
    scenes: [
      {
        kind: "intro",
        voice: "Сегодня мы будем сортировать фигурки! Круг и квадрат. Найдём для каждой свой домик.",
        emoji: "🔵",
        title: "Сортер",
      },
      {
        kind: "choose",
        voice: "Посмотри. Где КРУГ? Круг — это как солнышко или мячик. Нажми на круг!",
        title: "Найди круг",
        options: [
          { emoji: "🟦", label: "Квадрат" },
          { emoji: "🔵", label: "Круг", correct: true },
          { emoji: "🔺", label: "Треугольник" },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "А где КВАДРАТ? У квадрата четыре уголочка — раз, два, три, четыре!",
        title: "Найди квадрат",
        options: [
          { emoji: "🔴", label: "Круг" },
          { emoji: "🟩", label: "Квадрат", correct: true },
          { emoji: "⭐", label: "Звезда" },
        ],
        reward: 1,
      },
      {
        kind: "sort",
        voice: "Теперь сложи фигурки по корзинкам. Кружочки — в круглую корзинку, квадратики — в квадратную!",
        title: "Разложи по корзинкам",
        buckets: [
          { id: "circles", label: "Круглые", emoji: "⭕" },
          { id: "squares", label: "Квадратные", emoji: "⬜" },
        ],
        options: [
          { emoji: "🔴", label: "красный круг", bucketId: "circles" },
          { emoji: "🟦", label: "синий квадрат", bucketId: "squares" },
          { emoji: "🟢", label: "зелёный круг", bucketId: "circles" },
          { emoji: "🟧", label: "оранжевый квадрат", bucketId: "squares" },
        ],
        reward: 2,
      },
      {
        kind: "finish",
        voice: "Ура! Ты разобрался с формами. Круг и квадрат — твои друзья!",
        emoji: "🏆",
        title: "Отлично!",
      },
    ],
  },

  // ─── 1003: Пальчиковая песенка (1-2, творчество) ────────────────────
  {
    activityId: 1003,
    scenes: [
      {
        kind: "intro",
        voice: "А давай поиграем с пальчиками! Это очень весёлая игра. Слушай и повторяй за мной!",
        emoji: "✋",
        title: "Пальчиковая игра",
      },
      {
        kind: "song",
        voice: "Сорока-белобока кашку варила, деток кормила! Давай вместе!",
        title: "Сорока-белобока",
        emoji: "🥣",
        songSteps: [
          "Сорока-белобока",
          "кашку варила, деток кормила:",
          "Этому дала, этому дала,",
          "этому дала, этому дала,",
          "а этому — не дала!",
        ],
        reward: 2,
      },
      {
        kind: "song",
        voice: "А теперь Ладушки! Ладушки-ладушки, где были — у бабушки!",
        title: "Ладушки-ладушки",
        emoji: "👏",
        songSteps: [
          "Ладушки-ладушки,",
          "где были? — У бабушки!",
          "Что ели? — Кашку!",
          "Что пили? — Бражку!",
          "Шу — полетели, на головку сели!",
        ],
        reward: 2,
      },
      {
        kind: "finish",
        voice: "Ты замечательно играл! Эти песенки можно петь хоть каждый день — пальчики становятся ловкими, а память крепкой.",
        emoji: "🌟",
        title: "Здорово!",
      },
    ],
  },

  // ─── 1004: Карточки животных (1-2, мир) ─────────────────────────────
  {
    activityId: 1004,
    scenes: [
      {
        kind: "intro",
        voice: "Сегодня мы познакомимся с животными и узнаем, как они говорят!",
        emoji: "🐾",
        title: "Кто как говорит?",
      },
      {
        kind: "flashcard",
        voice: "Это собачка. Собачка говорит: гав-гав! Повтори: гав-гав!",
        title: "Собачка",
        emoji: "🐶",
        bigText: "Гав-гав!",
        reward: 1,
      },
      {
        kind: "flashcard",
        voice: "Это кошечка. Кошечка говорит: мяу-мяу! Покажи, как кошечка мяукает!",
        title: "Кошечка",
        emoji: "🐱",
        bigText: "Мяу-мяу!",
        reward: 1,
      },
      {
        kind: "flashcard",
        voice: "Это коровка. Коровка большая и говорит: му-у-у! Громко-громко!",
        title: "Коровка",
        emoji: "🐄",
        bigText: "Му-у-у!",
        reward: 1,
      },
      {
        kind: "choose",
        voice: "Послушай: гав-гав! Кто так говорит?",
        title: "Кто говорит гав-гав?",
        options: [
          { emoji: "🐱", label: "Кошка" },
          { emoji: "🐶", label: "Собака", correct: true },
          { emoji: "🐄", label: "Корова" },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "А теперь: му-у-у! Кто так говорит большим голосом?",
        title: "Кто говорит му-у-у?",
        options: [
          { emoji: "🐶", label: "Собака" },
          { emoji: "🐄", label: "Корова", correct: true },
          { emoji: "🐱", label: "Кошка" },
        ],
        reward: 1,
      },
      {
        kind: "finish",
        voice: "Какой ты молодец! Узнаёшь собачку, кошечку и коровку. Теперь покажи родителю — кто как говорит!",
        emoji: "🎊",
        title: "Победа!",
      },
    ],
  },

  // ─── 1101: Большой–маленький (2-3, логика) ──────────────────────────
  {
    activityId: 1101,
    scenes: [
      {
        kind: "intro",
        voice: "Поиграем в большое и маленькое! Будем сравнивать предметы.",
        emoji: "📏",
        title: "Большой и маленький",
      },
      {
        kind: "choose",
        voice: "Покажи большое яблоко! Большое — это вот такое, во-о-от!",
        title: "Где большое яблоко?",
        options: [
          { emoji: "🍎", label: "Маленькое" },
          { emoji: "🍎", label: "Большое", correct: true },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "А теперь покажи маленькую машинку!",
        title: "Где маленькая машинка?",
        options: [
          { emoji: "🚗", label: "Большая" },
          { emoji: "🚗", label: "Маленькая", correct: true },
        ],
        reward: 1,
      },
      {
        kind: "sort",
        voice: "Разложи игрушки по корзинкам: большие — в большую, маленькие — в маленькую!",
        title: "Сортируй по размеру",
        buckets: [
          { id: "big", label: "Большие", emoji: "🟫" },
          { id: "small", label: "Маленькие", emoji: "🟧" },
        ],
        options: [
          { emoji: "🐘", label: "Слон", bucketId: "big" },
          { emoji: "🐭", label: "Мышка", bucketId: "small" },
          { emoji: "🚂", label: "Поезд", bucketId: "big" },
          { emoji: "🐞", label: "Жучок", bucketId: "small" },
        ],
        reward: 2,
      },
      {
        kind: "finish",
        voice: "Молодчина! Теперь дома сравнивай: большая чашка папы и маленькая твоя!",
        emoji: "👏",
        title: "Здорово!",
      },
    ],
  },

  // ─── 1102: Дикие и домашние (2-3, речь) ─────────────────────────────
  {
    activityId: 1102,
    scenes: [
      {
        kind: "intro",
        voice: "Сегодня узнаем, какие животные живут в доме, а какие — в лесу.",
        emoji: "🏠",
        title: "Дикие и домашние",
      },
      {
        kind: "flashcard",
        voice: "Это корова. Она живёт в доме у человека, даёт молоко. Это домашнее животное.",
        title: "Корова — домашняя",
        emoji: "🐄",
        bigText: "Дом",
      },
      {
        kind: "flashcard",
        voice: "Это волк. Волк живёт в лесу, он дикий. С людьми не дружит.",
        title: "Волк — дикий",
        emoji: "🐺",
        bigText: "Лес",
      },
      {
        kind: "sort",
        voice: "Разложи зверушек: домашних — в дом, диких — в лес!",
        title: "Кто где живёт?",
        buckets: [
          { id: "home", label: "Дом 🏠", emoji: "🏠" },
          { id: "forest", label: "Лес 🌲", emoji: "🌲" },
        ],
        options: [
          { emoji: "🐄", label: "Корова", bucketId: "home" },
          { emoji: "🐺", label: "Волк", bucketId: "forest" },
          { emoji: "🐱", label: "Кошка", bucketId: "home" },
          { emoji: "🦊", label: "Лиса", bucketId: "forest" },
          { emoji: "🐕", label: "Собака", bucketId: "home" },
          { emoji: "🐻", label: "Медведь", bucketId: "forest" },
        ],
        reward: 3,
      },
      {
        kind: "finish",
        voice: "Превосходно! Ты знаешь, кто живёт в доме, а кто в лесу.",
        emoji: "🌟",
        title: "Молодец!",
      },
    ],
  },

  // ─── 1105: Эмоции на картинках (2-3, эмоции) ────────────────────────
  {
    activityId: 1105,
    scenes: [
      {
        kind: "intro",
        voice: "Сегодня поговорим о чувствах. Радость, грусть, злость, удивление — у всех бывают разные настроения.",
        emoji: "❤️",
        title: "Эмоции",
      },
      {
        kind: "emotion",
        voice: "Это радость. Когда мы радуемся, мы улыбаемся! Покажи, как ты радуешься!",
        title: "Радость",
        emoji: "😀",
        bigText: "Я радуюсь!",
      },
      {
        kind: "emotion",
        voice: "А это грусть. Когда грустно — хочется обняться с мамой. Покажи грустное лицо.",
        title: "Грусть",
        emoji: "😢",
        bigText: "Мне грустно",
      },
      {
        kind: "emotion",
        voice: "Это удивление! Глазки большие, ротик открыт — ох!",
        title: "Удивление",
        emoji: "😮",
        bigText: "Ох!",
      },
      {
        kind: "choose",
        voice: "Зайчику подарили мячик. Какая у него эмоция?",
        title: "Зайчик получил подарок!",
        options: [
          { emoji: "😀", label: "Радость", correct: true },
          { emoji: "😢", label: "Грусть" },
          { emoji: "😡", label: "Злость" },
        ],
        reward: 2,
      },
      {
        kind: "choose",
        voice: "А у мишки сломалась любимая игрушка. Какая у него эмоция?",
        title: "У мишки сломалась игрушка",
        options: [
          { emoji: "😀", label: "Радость" },
          { emoji: "😢", label: "Грусть", correct: true },
          { emoji: "😮", label: "Удивление" },
        ],
        reward: 2,
      },
      {
        kind: "finish",
        voice: "Чувства — это важно. Всегда можно сказать: «Мне грустно» или «Я радуюсь». Так нас лучше понимают.",
        emoji: "💖",
        title: "Браво!",
        hintForParent: "Называйте эмоции ребёнка в течение дня — это основа эмоционального интеллекта.",
      },
    ],
  },

  // ─── 1201: Найди лишнее (3-4, логика) ───────────────────────────────
  {
    activityId: 1201,
    scenes: [
      {
        kind: "intro",
        voice: "Сегодня будем искать лишний предмет. Подумай и выбери тот, который не похож на остальные.",
        emoji: "🔍",
        title: "Найди лишнее",
      },
      {
        kind: "choose",
        voice: "Что лишнее? Три фрукта и машинка. Машинку нельзя съесть!",
        title: "Что не фрукт?",
        options: [
          { emoji: "🍎", label: "Яблоко" },
          { emoji: "🍌", label: "Банан" },
          { emoji: "🚗", label: "Машина", correct: true },
          { emoji: "🍐", label: "Груша" },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "Что лишнее? Все круглые, кроме одного.",
        title: "Какая фигура другая?",
        options: [
          { emoji: "⚽", label: "Мяч" },
          { emoji: "🍊", label: "Апельсин" },
          { emoji: "📦", label: "Коробка", correct: true },
          { emoji: "🔵", label: "Круг" },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "Что лишнее? Три животных и одно растение.",
        title: "Кто не животное?",
        options: [
          { emoji: "🐶", label: "Собака" },
          { emoji: "🐱", label: "Кошка" },
          { emoji: "🌳", label: "Дерево", correct: true },
          { emoji: "🐰", label: "Заяц" },
        ],
        reward: 1,
      },
      {
        kind: "finish",
        voice: "Отличная работа! Ты умеешь сравнивать и находить разницу. Это очень важный навык!",
        emoji: "🏆",
        title: "Превосходно!",
      },
    ],
  },

  // ─── 1203: Считаем до 10 (3-4, логика) ──────────────────────────────
  {
    activityId: 1203,
    scenes: [
      {
        kind: "intro",
        voice: "Будем считать! От одного до десяти. Готов?",
        emoji: "🔢",
        title: "Счёт до 10",
      },
      {
        kind: "counting",
        voice: "Один. Одно яблоко. Покажи пальчиком — один!",
        title: "Один",
        emoji: "🍎",
        bigText: "1",
      },
      {
        kind: "counting",
        voice: "Два. Две груши. Раз и два!",
        title: "Два",
        emoji: "🍐🍐",
        bigText: "2",
      },
      {
        kind: "counting",
        voice: "Три. Три бабочки! Раз, два, три!",
        title: "Три",
        emoji: "🦋🦋🦋",
        bigText: "3",
      },
      {
        kind: "choose",
        voice: "Сколько здесь шариков? Посчитай!",
        title: "Сколько шариков?",
        emoji: "🎈🎈🎈🎈🎈",
        options: [
          { emoji: "3️⃣", label: "Три" },
          { emoji: "4️⃣", label: "Четыре" },
          { emoji: "5️⃣", label: "Пять", correct: true },
        ],
        reward: 2,
      },
      {
        kind: "choose",
        voice: "А сколько уточек?",
        title: "Посчитай уточек",
        emoji: "🦆🦆🦆",
        options: [
          { emoji: "2️⃣", label: "Две" },
          { emoji: "3️⃣", label: "Три", correct: true },
          { emoji: "4️⃣", label: "Четыре" },
        ],
        reward: 2,
      },
      {
        kind: "finish",
        voice: "Молодец! Считаем дальше каждый день — ступеньки, машинки, ложки. Скоро дойдём до десяти!",
        emoji: "⭐",
        title: "Здорово!",
      },
    ],
  },

  // ─── 1301: Знакомство с буквой А (4-5, речь) ────────────────────────
  {
    activityId: 1301,
    scenes: [
      {
        kind: "intro",
        voice: "Сегодня знакомимся с буквой А. Это первая буква алфавита! Скажи: А!",
        emoji: "🔤",
        title: "Буква А",
      },
      {
        kind: "letter",
        voice: "Вот она — буква А. Большая и красивая. Звучит: А-а-а! Как будто врач смотрит горло.",
        title: "Буква А",
        emoji: "🔤",
        bigText: "А",
      },
      {
        kind: "choose",
        voice: "Какое слово начинается с буквы А? Арбуз!",
        title: "На какую букву арбуз?",
        options: [
          { emoji: "🍉", label: "Арбуз", correct: true },
          { emoji: "🍌", label: "Банан" },
          { emoji: "🥒", label: "Огурец" },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "А ещё на А — Аист! Большая красивая птица.",
        title: "Найди аиста",
        options: [
          { emoji: "🦉", label: "Сова" },
          { emoji: "🦢", label: "Лебедь" },
          { emoji: "🦩", label: "Аист", correct: true },
        ],
        reward: 1,
      },
      {
        kind: "choose",
        voice: "А ещё на А — апельсин! Сочный и оранжевый.",
        title: "А-а-апельсин",
        options: [
          { emoji: "🍎", label: "Яблоко" },
          { emoji: "🍊", label: "Апельсин", correct: true },
          { emoji: "🍐", label: "Груша" },
        ],
        reward: 1,
      },
      {
        kind: "finish",
        voice: "Замечательно! Ты выучил букву А. Дома поищи букву А в книгах, на вывесках, на упаковках!",
        emoji: "🅰️",
        title: "Ура, буква А!",
        hintForParent: "Сделайте «охоту на букву А» — ищите её везде: вывески, упаковки, книги.",
      },
    ],
  },

  // ─── 1401: Читаем слоги (5-6, речь) ─────────────────────────────────
  {
    activityId: 1401,
    scenes: [
      {
        kind: "intro",
        voice: "Сегодня учимся складывать слоги. Это первый шаг к чтению! Будет интересно.",
        emoji: "📖",
        title: "Первые слоги",
      },
      {
        kind: "letter",
        voice: "Слог МА. Скажи вместе со мной: М-А — МА!",
        title: "Слог МА",
        emoji: "🔤",
        bigText: "МА",
      },
      {
        kind: "letter",
        voice: "Слог ПА. Скажи: П-А — ПА!",
        title: "Слог ПА",
        emoji: "🔤",
        bigText: "ПА",
      },
      {
        kind: "letter",
        voice: "А теперь сложим два слога: МА и МА получится МАМА!",
        title: "МА + МА",
        emoji: "👩",
        bigText: "МАМА",
      },
      {
        kind: "choose",
        voice: "А ПА и ПА — что получится?",
        title: "ПА + ПА = ?",
        options: [
          { emoji: "👨", label: "ПАПА", correct: true },
          { emoji: "👵", label: "БАБА" },
          { emoji: "👶", label: "ЛЯЛЯ" },
        ],
        reward: 2,
      },
      {
        kind: "choose",
        voice: "А Б и А — БА. Два слога БА — что получится?",
        title: "БА + БА = ?",
        options: [
          { emoji: "👨", label: "ПАПА" },
          { emoji: "👵", label: "БАБА", correct: true },
          { emoji: "👩", label: "МАМА" },
        ],
        reward: 2,
      },
      {
        kind: "finish",
        voice: "Поздравляю! Ты прочитал свои первые слова. Главное — не спеши, каждый день по 10 минут. Скоро будешь читать сказки сам!",
        emoji: "🎓",
        title: "Читаешь!",
        hintForParent: "Хвалите за прочитанное даже одно слово. Читайте по 10-15 минут, не больше.",
      },
    ],
  },

  // ─── 1402: Сложение в пределах 10 (5-6, логика) ─────────────────────
  {
    activityId: 1402,
    scenes: [
      {
        kind: "intro",
        voice: "Сегодня учимся складывать числа! Это легко и весело.",
        emoji: "➕",
        title: "Сложение до 10",
      },
      {
        kind: "counting",
        voice: "У тебя одно яблоко. Я даю ещё одно. Сколько стало? Два!",
        title: "1 + 1 = ?",
        emoji: "🍎 + 🍎",
        bigText: "1 + 1 = 2",
      },
      {
        kind: "choose",
        voice: "Реши: 2 + 1. Сколько получится?",
        title: "2 + 1 = ?",
        options: [
          { emoji: "2️⃣", label: "Два" },
          { emoji: "3️⃣", label: "Три", correct: true },
          { emoji: "4️⃣", label: "Четыре" },
        ],
        reward: 2,
      },
      {
        kind: "choose",
        voice: "А теперь сложнее: 3 + 2!",
        title: "3 + 2 = ?",
        options: [
          { emoji: "4️⃣", label: "Четыре" },
          { emoji: "5️⃣", label: "Пять", correct: true },
          { emoji: "6️⃣", label: "Шесть" },
        ],
        reward: 2,
      },
      {
        kind: "choose",
        voice: "Молодец! Ещё одно: 4 + 4 — сколько будет?",
        title: "4 + 4 = ?",
        options: [
          { emoji: "6️⃣", label: "Шесть" },
          { emoji: "7️⃣", label: "Семь" },
          { emoji: "8️⃣", label: "Восемь", correct: true },
        ],
        reward: 3,
      },
      {
        kind: "finish",
        voice: "Ты настоящий математик! Складывать — это как собирать игрушки в кучу: их становится больше.",
        emoji: "🧮",
        title: "Математик!",
      },
    ],
  },
];

export function getInteractive(activityId: number): InteractiveLesson | undefined {
  return INTERACTIVE_LESSONS.find((l) => l.activityId === activityId);
}

export function hasInteractive(activityId: number): boolean {
  return INTERACTIVE_LESSONS.some((l) => l.activityId === activityId);
}
