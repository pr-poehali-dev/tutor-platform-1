import func2url from "../../../backend/func2url.json";

const INTENSIVE_URL = (func2url as Record<string, string>).intensive;

export interface Word {
  ru: string;
  w: string;
  tr: string;
  ex: string;
  exr: string;
}

export interface CardState {
  box: number;
  due: number;
}

export interface LangProgress {
  passed: number[];
  cards: Record<string, CardState>;
}

/** Интервалы повторения по «коробкам», в днях. */
const INTERVALS = [0, 1, 3, 7, 16, 35];
const DAY_MS = 86_400_000;

const progressKey = (lang: string) => `spy_lang_progress_${lang}`;
const wordsKey = (lang: string, day: number) => `spy_lang_words_${lang}_${day}`;

export function loadProgress(lang: string): LangProgress {
  try {
    const raw = localStorage.getItem(progressKey(lang));
    if (raw) return JSON.parse(raw);
  } catch {
    /* пустой прогресс */
  }
  return { passed: [], cards: {} };
}

export function saveProgress(lang: string, p: LangProgress): void {
  try {
    localStorage.setItem(progressKey(lang), JSON.stringify(p));
  } catch {
    /* хранилище недоступно */
  }
}

export function cachedDayWords(lang: string, day: number): Word[] | null {
  try {
    const raw = localStorage.getItem(wordsKey(lang, day));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function fetchChunk(lang: string, day: number, chunk: number, token?: string): Promise<Word[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(`${INTENSIVE_URL}?action=lang_words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, day, chunk, token }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.words)) return data.words;
    if (res.status === 403) throw new Error(data.error || "День откроется после оплаты");
  }
  throw new Error("Не удалось загрузить слова. Проверьте интернет и попробуйте ещё раз.");
}

/** Слова дня: сначала из памяти устройства, иначе с сервера (3 порции по 12). */
export async function getDayWords(lang: string, day: number, chunks: number, token?: string): Promise<Word[]> {
  const cached = cachedDayWords(lang, day);
  if (cached && cached.length) return cached;
  const parts: Word[] = [];
  for (let c = 0; c < chunks; c++) parts.push(...(await fetchChunk(lang, day, c, token)));
  try {
    localStorage.setItem(wordsKey(lang, day), JSON.stringify(parts));
  } catch {
    /* хранилище недоступно */
  }
  return parts;
}

export const cardId = (day: number, idx: number) => `${day}:${idx}`;

/** Ответ на карточку: верно — в следующую коробку, ошибка — в начало. */
export function review(p: LangProgress, id: string, correct: boolean, now: number): LangProgress {
  const cur = p.cards[id] ?? { box: 0, due: now };
  const box = correct ? Math.min(cur.box + 1, INTERVALS.length - 1) : 1;
  return { ...p, cards: { ...p.cards, [id]: { box, due: now + INTERVALS[box] * DAY_MS } } };
}

export function dueIds(p: LangProgress, now: number): string[] {
  return Object.entries(p.cards)
    .filter(([, c]) => c.due <= now)
    .map(([id]) => id);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function speak(text: string, lang: string): void {
  try {
    const voices: Record<string, string> = {
      en: "en-GB", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT", zh: "zh-CN", tr: "tr-TR", ar: "ar-SA",
    };
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voices[lang] || "en-GB";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* озвучка недоступна */
  }
}
