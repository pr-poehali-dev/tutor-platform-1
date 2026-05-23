import func2url from "../../../backend/func2url.json";

export const AI_CHAT_URL = (func2url as Record<string, string>)["ai-chat"];
export const TTS_URL = (func2url as Record<string, string>)["tts"];
export const STT_URL = (func2url as Record<string, string>)["stt"];

export interface MessageSource {
  title: string;
  url: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  audio?: string; // base64 mp3
  sources?: MessageSource[];
  usedSearch?: boolean;
}

export type RecordingFormat = "oggopus" | "lpcm";

/** Кодировать Blob в base64 без префикса data: */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const str = (reader.result as string) ?? "";
      const idx = str.indexOf(",");
      resolve(idx >= 0 ? str.substring(idx + 1) : str);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Подобрать поддерживаемый MIME-тип записи */
export function pickMimeType(): { mime: string; format: RecordingFormat } {
  if (typeof MediaRecorder === "undefined") return { mime: "", format: "oggopus" };
  const candidates: { mime: string; format: RecordingFormat }[] = [
    { mime: "audio/ogg;codecs=opus", format: "oggopus" },
    { mime: "audio/webm;codecs=opus", format: "oggopus" },
    { mime: "audio/webm", format: "oggopus" },
    { mime: "audio/mp4", format: "oggopus" },
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mime)) return c;
  }
  return { mime: "", format: "oggopus" };
}

export const SUGGESTED: Record<string, string[]> = {
  default: [
    "Чем занять ребёнка дома?",
    "Как развивать речь у малыша?",
    "Что делать с истериками?",
  ],
  "1-2": [
    "Какие игры подойдут в 1 год?",
    "Как развивать речь у малыша 1,5 лет?",
    "Что должен уметь ребёнок в 2 года?",
  ],
  "2-3": [
    "Как помочь ребёнку говорить фразами?",
    "Что делать с кризисом 3 лет?",
    "Какие занятия подойдут для 2 лет?",
  ],
  "3-4": [
    "Как отвечать на «почему»?",
    "Игры для развития логики в 3 года?",
    "Как научить ребёнка делиться?",
  ],
  "4-5": [
    "С чего начать обучение буквам?",
    "Как развивать внимание у 4-летки?",
    "Что должен уметь к 5 годам?",
  ],
  "5-6": [
    "Как готовиться к школе без стресса?",
    "Как научить читать по слогам?",
    "Что делать, если не хочет заниматься?",
  ],
};