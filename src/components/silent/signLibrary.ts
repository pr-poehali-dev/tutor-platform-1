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