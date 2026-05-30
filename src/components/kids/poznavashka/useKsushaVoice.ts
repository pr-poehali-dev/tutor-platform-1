import { useCallback, useEffect, useRef, useState } from "react";
import func2url from "../../../../backend/func2url.json";

const TTS_URL = (func2url as Record<string, string>).tts;

// Убираем эмодзи из текста, чтобы синтезатор их не «читал»
function stripEmoji(text: string): string {
  return text
    .replace(
      /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/gu,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function useKsushaVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [enabled, setEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    async (rawText: string) => {
      if (!enabled) return;
      const text = stripEmoji(rawText);
      if (!text) return;

      stop();
      try {
        let audioSrc = cacheRef.current.get(text);
        if (!audioSrc) {
          const res = await fetch(TTS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, teacher_id: "ksusha" }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.audio_base64) return;
          audioSrc = `data:${data.mime || "audio/mpeg"};base64,${data.audio_base64}`;
          cacheRef.current.set(text, audioSrc);
        }

        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        setSpeaking(true);
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        await audio.play().catch(() => setSpeaking(false));
      } catch {
        setSpeaking(false);
      }
    },
    [enabled, stop]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      if (prev) stop();
      return !prev;
    });
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { speak, stop, toggle, enabled, speaking };
}
