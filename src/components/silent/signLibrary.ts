/**
 * Библиотека жестов русского жестового языка (РЖЯ) для курса.
 *
 * Каждый жест ВСТРОЕН прямо в курс: у слова есть иллюстрация руки (image)
 * и тип движения (motion), который оживляет её CSS-анимацией. Ребёнку не нужно
 * ничего искать — жест показывается автоматически в уроке.
 *
 * Ссылка на официальный видеословарь (dictionaryUrl) остаётся как
 * дополнительная возможность «проверить у носителя языка», но НЕ обязательна.
 * Когда появятся собственные видео с носителем РЖЯ — достаточно проставить
 * поле videoUrl, панель покажет видео вместо иллюстрации.
 */

/** Тип движения руки для оживления иллюстрации. */
export type SignMotion =
  | "wave"        // взмах вбок-вбок (привет, пока)
  | "forward"     // движение вперёд от лица (спасибо, имя)
  | "down"        // движение сверху вниз (красный — по губам)
  | "shake"       // лёгкое встряхивание (зелёный)
  | "sway"        // покачивание (жёлтый, синий)
  | "point";      // указательный жест (как тебя зовут)

export interface SignEntry {
  /** Слово (подпись жеста). */
  word: string;
  /** Как показывается жест — краткая подсказка по артикуляции. */
  description: string;
  /** Встроенная иллюстрация жеста (CDN). */
  image: string;
  /** Тип движения для CSS-анимации. */
  motion: SignMotion;
  /** Ссылка на видеословарь РЖЯ — дополнительная проверка (необязательна). */
  dictionaryUrl: string;
  /** Собственное видео жеста (S3), если записано. Приоритетнее иллюстрации. */
  videoUrl?: string;
}

const STS = "https://www.spreadthesign.com/ru.ru/search/?q=";
const IMG = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files";

/** Реестр жестов. Пополняется по мере роста курса. */
export const SIGN_LIBRARY: Record<string, SignEntry> = {
  привет: {
    word: "привет",
    description: "Раскрытая ладонь у виска слегка отводится вперёд — как лёгкий взмах-приветствие.",
    image: `${IMG}/825f1909-243e-4ad7-bf8a-465b079350a4.jpg`,
    motion: "wave",
    dictionaryUrl: `${STS}привет`,
  },
  меня_зовут: {
    word: "меня зовут",
    description: "Указать на себя, затем «имя»: два пальца (У-образно) касаются лба и уводятся вперёд.",
    image: `${IMG}/eb5869a8-9929-4e07-8cd8-4314f2662b01.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}имя`,
  },
  спасибо: {
    word: "спасибо",
    description: "Пальцы у губ, ладонь плавно опускается вперёд-вниз — благодарность.",
    image: `${IMG}/53ad1adb-8271-40bd-8d66-038adaec96e1.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}спасибо`,
  },
  как_тебя_зовут: {
    word: "как тебя зовут?",
    description: "Указать на собеседника, показать «имя» (два пальца от лба вперёд), лицо — вопросительное.",
    image: `${IMG}/eb5869a8-9929-4e07-8cd8-4314f2662b01.jpg`,
    motion: "point",
    dictionaryUrl: `${STS}имя`,
  },
  до_свидания: {
    word: "до свидания",
    description: "Раскрытая ладонь машет из стороны в сторону — прощание.",
    image: `${IMG}/b20b1c28-4150-425c-84b3-dc016d87e6de.jpg`,
    motion: "wave",
    dictionaryUrl: `${STS}пока`,
  },
  красный: {
    word: "красный",
    description: "Кончик указательного пальца проводит по губам сверху вниз — цвет губ.",
    image: `${IMG}/17d7defd-6ca0-4cdd-ae3d-a8a517bf7772.jpg`,
    motion: "down",
    dictionaryUrl: `${STS}красный`,
  },
  жёлтый: {
    word: "жёлтый",
    description: "Кисть с растопыренными пальцами покачивается у щеки — «солнечный» жёлтый.",
    image: `${IMG}/e8e261e0-0854-4caf-ad68-7e53b859a809.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}жёлтый`,
  },
  зелёный: {
    word: "зелёный",
    description: "Кисть слегка встряхивается перед собой — ассоциация с листвой.",
    image: `${IMG}/addb1406-b290-426f-9aac-49459066287a.jpg`,
    motion: "shake",
    dictionaryUrl: `${STS}зелёный`,
  },
  синий: {
    word: "синий",
    description: "Раскрытая ладонь покачивается перед собой — «цвет воды и неба».",
    image: `${IMG}/025f028b-dd2d-4015-82be-c60f3a531b10.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}синий`,
  },

  // --- Урок: Семья ---
  семья: {
    word: "семья",
    description: "Обе кисти рисуют круг перед собой — «все вместе, семья».",
    image: `${IMG}/d819f990-764a-45f4-a400-71f82c15d2e7.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}семья`,
  },
  мама: {
    word: "мама",
    description: "Раскрытая ладонь дважды касается щеки — «мама».",
    image: `${IMG}/d819f990-764a-45f4-a400-71f82c15d2e7.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}мама`,
  },
  папа: {
    word: "папа",
    description: "Раскрытая ладонь дважды касается лба — «папа».",
    image: `${IMG}/d819f990-764a-45f4-a400-71f82c15d2e7.jpg`,
    motion: "down",
    dictionaryUrl: `${STS}папа`,
  },
  бабушка: {
    word: "бабушка",
    description: "Мягкий жест у щеки с наклоном — «бабушка».",
    image: `${IMG}/d819f990-764a-45f4-a400-71f82c15d2e7.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}бабушка`,
  },
  дедушка: {
    word: "дедушка",
    description: "Жест у подбородка — «дедушка».",
    image: `${IMG}/d819f990-764a-45f4-a400-71f82c15d2e7.jpg`,
    motion: "down",
    dictionaryUrl: `${STS}дедушка`,
  },

  // --- Урок: Цифры 1–5 ---
  один: {
    word: "один",
    description: "Поднят один указательный палец — «1».",
    image: `${IMG}/6bb4035c-db48-4ca4-8833-ad996fa07883.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}один`,
  },
  два: {
    word: "два",
    description: "Подняты два пальца — «2».",
    image: `${IMG}/6bb4035c-db48-4ca4-8833-ad996fa07883.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}два`,
  },
  три: {
    word: "три",
    description: "Подняты три пальца — «3».",
    image: `${IMG}/6bb4035c-db48-4ca4-8833-ad996fa07883.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}три`,
  },
  четыре: {
    word: "четыре",
    description: "Подняты четыре пальца — «4».",
    image: `${IMG}/6bb4035c-db48-4ca4-8833-ad996fa07883.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}четыре`,
  },
  пять: {
    word: "пять",
    description: "Раскрыта вся ладонь, пять пальцев — «5».",
    image: `${IMG}/6bb4035c-db48-4ca4-8833-ad996fa07883.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}пять`,
  },

  // --- Урок: Животные ---
  кошка: {
    word: "кошка",
    description: "Пальцы у щеки будто рисуют усы — «кошка».",
    image: `${IMG}/c34b2d4f-e526-4f85-8281-72d53240f87b.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}кошка`,
  },
  собака: {
    word: "собака",
    description: "Похлопывание по бедру или щелчок — «собака».",
    image: `${IMG}/c34b2d4f-e526-4f85-8281-72d53240f87b.jpg`,
    motion: "shake",
    dictionaryUrl: `${STS}собака`,
  },
  птица: {
    word: "птица",
    description: "Пальцы у губ открываются-закрываются, как клюв — «птица».",
    image: `${IMG}/c34b2d4f-e526-4f85-8281-72d53240f87b.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}птица`,
  },
  рыба: {
    word: "рыба",
    description: "Ладонь плывёт волной вперёд — «рыба».",
    image: `${IMG}/c34b2d4f-e526-4f85-8281-72d53240f87b.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}рыба`,
  },
  медведь: {
    word: "медведь",
    description: "Скрещённые руки «царапают» плечи — «медведь».",
    image: `${IMG}/c34b2d4f-e526-4f85-8281-72d53240f87b.jpg`,
    motion: "shake",
    dictionaryUrl: `${STS}медведь`,
  },

  // --- Урок: Еда и напитки ---
  еда: {
    word: "еда",
    description: "Собранные пальцы подносятся ко рту — «есть, еда».",
    image: `${IMG}/14d132c3-cbe9-4a54-9e9b-37c9ad35563e.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}еда`,
  },
  вода: {
    word: "вода",
    description: "Пальцы у губ, лёгкое движение — «вода, пить».",
    image: `${IMG}/14d132c3-cbe9-4a54-9e9b-37c9ad35563e.jpg`,
    motion: "down",
    dictionaryUrl: `${STS}вода`,
  },
  хлеб: {
    word: "хлеб",
    description: "Рука будто отрезает ломоть — «хлеб».",
    image: `${IMG}/14d132c3-cbe9-4a54-9e9b-37c9ad35563e.jpg`,
    motion: "down",
    dictionaryUrl: `${STS}хлеб`,
  },
  молоко: {
    word: "молоко",
    description: "Кисть сжимается-разжимается — «молоко».",
    image: `${IMG}/14d132c3-cbe9-4a54-9e9b-37c9ad35563e.jpg`,
    motion: "shake",
    dictionaryUrl: `${STS}молоко`,
  },
  яблоко: {
    word: "яблоко",
    description: "Согнутый палец у щеки поворачивается — «яблоко».",
    image: `${IMG}/14d132c3-cbe9-4a54-9e9b-37c9ad35563e.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}яблоко`,
  },

  // --- Урок: Эмоции ---
  радость: {
    word: "радость",
    description: "Раскрытые ладони поднимаются к груди, улыбка — «радость».",
    image: `${IMG}/7cd806c5-18b9-41cd-80d5-a5e26d6adf3b.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}радость`,
  },
  грусть: {
    word: "грусть",
    description: "Ладони опускаются вниз вдоль лица, грустная мимика — «грусть».",
    image: `${IMG}/7cd806c5-18b9-41cd-80d5-a5e26d6adf3b.jpg`,
    motion: "down",
    dictionaryUrl: `${STS}грусть`,
  },
  страх: {
    word: "страх",
    description: "Ладони резко прикрывают грудь, тревожная мимика — «страх».",
    image: `${IMG}/7cd806c5-18b9-41cd-80d5-a5e26d6adf3b.jpg`,
    motion: "shake",
    dictionaryUrl: `${STS}страх`,
  },
  любовь: {
    word: "любовь",
    description: "Скрещённые руки прижимаются к груди — «любовь».",
    image: `${IMG}/7cd806c5-18b9-41cd-80d5-a5e26d6adf3b.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}любовь`,
  },
  злость: {
    word: "злость",
    description: "Напряжённые пальцы у лица, нахмуренная мимика — «злость».",
    image: `${IMG}/7cd806c5-18b9-41cd-80d5-a5e26d6adf3b.jpg`,
    motion: "shake",
    dictionaryUrl: `${STS}злость`,
  },

  // --- Урок: Вежливые слова ---
  пожалуйста: {
    word: "пожалуйста",
    description: "Раскрытая ладонь на груди мягко движется по кругу — «пожалуйста».",
    image: `${IMG}/735b1898-6a8e-47dc-b715-ce5c3db40d53.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}пожалуйста`,
  },
  извини: {
    word: "извини",
    description: "Кулак на груди мягко движется — «извини, прости».",
    image: `${IMG}/735b1898-6a8e-47dc-b715-ce5c3db40d53.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}извини`,
  },
  да: {
    word: "да",
    description: "Кулак кивает вниз, как голова — «да».",
    image: `${IMG}/735b1898-6a8e-47dc-b715-ce5c3db40d53.jpg`,
    motion: "down",
    dictionaryUrl: `${STS}да`,
  },
  нет: {
    word: "нет",
    description: "Два пальца смыкаются с большим — «нет».",
    image: `${IMG}/735b1898-6a8e-47dc-b715-ce5c3db40d53.jpg`,
    motion: "shake",
    dictionaryUrl: `${STS}нет`,
  },
  помоги: {
    word: "помоги",
    description: "Одна ладонь поднимает другую вверх — «помоги, помощь».",
    image: `${IMG}/735b1898-6a8e-47dc-b715-ce5c3db40d53.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}помощь`,
  },

  // --- Урок: Дактиль (азбука руками) ---
  дактиль: {
    word: "дактиль",
    description: "Дактиль — азбука пальцами: каждой букве соответствует своя фигура руки (дактилема).",
    image: `${IMG}/2c4938ea-c17e-485d-85fe-51986069041e.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}алфавит`,
  },
  "буква_а": {
    word: "буква А",
    description: "Рука сжата в кулак, большой палец сбоку — это дактилема буквы «А».",
    image: `${IMG}/4889c07d-fc43-4617-be6a-99ff51d22cc7.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}буква а`,
  },
  "буква_б": {
    word: "буква Б",
    description: "Ладонь раскрыта, пальцы вместе и подняты вверх — дактилема буквы «Б».",
    image: `${IMG}/cd5f6257-fd75-4e09-80e3-6bab49144500.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}буква б`,
  },
  "буква_в": {
    word: "буква В",
    description: "Кисть образует полукруг (форма «В») — дактилема буквы «В».",
    image: `${IMG}/26b34468-51b6-4c5e-928e-c05d028f7d33.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}буква в`,
  },
  моё_имя: {
    word: "моё имя",
    description: "Имя показывают по буквам — дактилем за дактилемой складывают слово целиком.",
    image: `${IMG}/54ee4812-e321-4934-9c4e-658c0b6711ec.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}имя`,
  },
};

/** Нормализует подпись слова в ключ реестра. */
export function signKey(caption: string): string {
  return caption
    .toLowerCase()
    .replace(/[!?.…]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

/** Возвращает запись жеста по подписи слова (или null, если жеста нет). */
export function findSign(caption: string): SignEntry | null {
  return SIGN_LIBRARY[signKey(caption)] || null;
}