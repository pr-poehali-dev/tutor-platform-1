/**
 * Библиотека жестов русского жестового языка (РЖЯ) для аватара-суфлёра.
 *
 * Источник видео: официальный международный видеословарь Spread the Sign
 * (https://www.spreadthesign.com) — крупнейшая база жестов с видео носителей языка.
 * Мы НЕ копируем чужие видео, а даём прямой переход к странице жеста + краткое
 * текстовое описание артикуляции для визуальной опоры.
 *
 * Когда появятся СОБСТВЕННЫЕ видео (запись с носителем РЖЯ), достаточно проставить
 * поле `videoUrl` — панель автоматически покажет своё видео вместо ссылки.
 */

export type SignStatus = "own_video" | "dictionary" | "recording";

export interface SignEntry {
  /** Слово (ключ поиска, нижний регистр). */
  word: string;
  /** Как показывается жест — краткая подсказка по артикуляции. */
  description: string;
  /** Ссылка на видеословарь РЖЯ (Spread the Sign, русский раздел). */
  dictionaryUrl: string;
  /** Собственное видео жеста (S3), если записано. Приоритетнее словаря. */
  videoUrl?: string;
  /** Статус: своё видео / только словарь / идёт запись. */
  status: SignStatus;
}

const STS = "https://www.spreadthesign.com/ru.ru/search/?q=";

/** Реестр жестов. Пополняется по мере роста курса. */
export const SIGN_LIBRARY: Record<string, SignEntry> = {
  привет: {
    word: "привет",
    description: "Раскрытая ладонь у виска слегка отводится вперёд — как лёгкий взмах-приветствие.",
    dictionaryUrl: `${STS}привет`,
    status: "dictionary",
  },
  меня_зовут: {
    word: "меня зовут",
    description: "Указать на себя, затем «имя»: два пальца (У-образно) касаются лба и уводятся вперёд.",
    dictionaryUrl: `${STS}имя`,
    status: "dictionary",
  },
  спасибо: {
    word: "спасибо",
    description: "Пальцы у губ, ладонь плавно опускается вперёд-вниз — благодарность.",
    dictionaryUrl: `${STS}спасибо`,
    status: "dictionary",
  },
  как_тебя_зовут: {
    word: "как тебя зовут?",
    description: "Указать на собеседника, показать «имя» (два пальца от лба вперёд), лицо — вопросительное.",
    dictionaryUrl: `${STS}имя`,
    status: "dictionary",
  },
  до_свидания: {
    word: "до свидания",
    description: "Раскрытая ладонь машет из стороны в сторону — прощание.",
    dictionaryUrl: `${STS}пока`,
    status: "dictionary",
  },
  красный: {
    word: "красный",
    description: "Кончик указательного пальца проводит по губам сверху вниз — цвет губ.",
    dictionaryUrl: `${STS}красный`,
    status: "dictionary",
  },
  жёлтый: {
    word: "жёлтый",
    description: "Кисть с растопыренными пальцами покачивается у щеки — «солнечный» жёлтый.",
    dictionaryUrl: `${STS}жёлтый`,
    status: "dictionary",
  },
  зелёный: {
    word: "зелёный",
    description: "Кисть слегка встряхивается перед собой — ассоциация с листвой.",
    dictionaryUrl: `${STS}зелёный`,
    status: "dictionary",
  },
  синий: {
    word: "синий",
    description: "Раскрытая ладонь покачивается перед собой — «цвет воды и неба».",
    dictionaryUrl: `${STS}синий`,
    status: "dictionary",
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