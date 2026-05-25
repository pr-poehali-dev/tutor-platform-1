import func2url from "../../../backend/func2url.json";

export const TTS_URL = (func2url as Record<string, string>)["tts"];

export const AUTOPLAY_KEY = "uchispro_kids_autoplay_v1";
export const AUTOPLAY_COUNTDOWN_SEC = 6;

/** Разбивает текст на короткие фрагменты для последовательного озвучивания. */
export function splitToChunks(text: string, maxLen = 600): string[] {
  // По абзацам — каждый абзац отдельный фрагмент
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  for (const p of paragraphs) {
    if (p.length <= maxLen) {
      chunks.push(p);
    } else {
      // Длинные абзацы режем по точкам
      const sentences = p.match(/[^.!?]+[.!?]+\s*/g) || [p];
      let buf = "";
      for (const s of sentences) {
        if ((buf + s).length > maxLen) {
          if (buf) chunks.push(buf.trim());
          buf = s;
        } else {
          buf += s;
        }
      }
      if (buf.trim()) chunks.push(buf.trim());
    }
  }
  return chunks;
}
