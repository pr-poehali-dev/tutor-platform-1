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
    image: `${IMG}/2f973e05-e0b4-47cf-890d-a169a6f1e98b.jpg`,
    motion: "wave",
    dictionaryUrl: `${STS}привет`,
  },
  меня_зовут: {
    word: "меня зовут",
    description: "Указать на себя, затем «имя»: два пальца (У-образно) касаются лба и уводятся вперёд.",
    image: `${IMG}/86c47c04-afe0-4daf-b213-0e3986a5de24.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}имя`,
  },
  спасибо: {
    word: "спасибо",
    description: "Пальцы у губ, ладонь плавно опускается вперёд-вниз — благодарность.",
    image: `${IMG}/903f799d-42c0-4875-8c0a-1d5f2a3db995.jpg`,
    motion: "forward",
    dictionaryUrl: `${STS}спасибо`,
  },
  как_тебя_зовут: {
    word: "как тебя зовут?",
    description: "Указать на собеседника, показать «имя» (два пальца от лба вперёд), лицо — вопросительное.",
    image: `${IMG}/86c47c04-afe0-4daf-b213-0e3986a5de24.jpg`,
    motion: "point",
    dictionaryUrl: `${STS}имя`,
  },
  до_свидания: {
    word: "до свидания",
    description: "Раскрытая ладонь машет из стороны в сторону — прощание.",
    image: `${IMG}/729e3b7c-4e06-4547-9519-b64646f7872a.jpg`,
    motion: "wave",
    dictionaryUrl: `${STS}пока`,
  },
  красный: {
    word: "красный",
    description: "Кончик указательного пальца проводит по губам сверху вниз — цвет губ.",
    image: `${IMG}/9a62e67e-263d-422d-8eb8-54089f03f598.jpg`,
    motion: "down",
    dictionaryUrl: `${STS}красный`,
  },
  жёлтый: {
    word: "жёлтый",
    description: "Кисть с растопыренными пальцами покачивается у щеки — «солнечный» жёлтый.",
    image: `${IMG}/034c977c-c6ce-4f9b-9f33-caddd8742851.jpg`,
    motion: "sway",
    dictionaryUrl: `${STS}жёлтый`,
  },
  зелёный: {
    word: "зелёный",
    description: "Кисть слегка встряхивается перед собой — ассоциация с листвой.",
    image: `${IMG}/091cace3-4e4e-4019-ad96-3d7c55b78ffc.jpg`,
    motion: "shake",
    dictionaryUrl: `${STS}зелёный`,
  },
  синий: {
    word: "синий",
    description: "Раскрытая ладонь покачивается перед собой — «цвет воды и неба».",
    image: `${IMG}/6ce1b39d-5657-49fd-a899-83a58b8dcaad.jpg`,
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
