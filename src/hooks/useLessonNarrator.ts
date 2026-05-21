import { useCallback, useEffect, useRef, useState } from "react";
import { prepareForSpeech } from "@/lib/mathFormat";

const TTS_URL = "https://functions.poehali.dev/fa3b03da-815c-4f28-baf2-1a88e36fca8d";

export interface NarratorVoice {
  id: string;
  name: string;
  description: string;
}

export const NARRATOR_VOICES: NarratorVoice[] = [
  { id: "alex", name: "Алекс", description: "Мужской, бодрый" },
  { id: "sofia", name: "София", description: "Женский, тёплый" },
  { id: "dmitry", name: "Дмитрий", description: "Мужской, спокойный" },
  { id: "nika", name: "Ника", description: "Женский, дружелюбный" },
];

type NarratorStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface UseLessonNarratorResult {
  status: NarratorStatus;
  currentText: string;
  error: string | null;
  voiceId: string;
  setVoiceId: (v: string) => void;
  rate: number;
  setRate: (r: number) => void;
  speak: (text: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const CACHE_LIMIT = 30;

export default function useLessonNarrator(): UseLessonNarratorResult {
  const [status, setStatus] = useState<NarratorStatus>("idle");
  const [currentText, setCurrentText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [voiceId, setVoiceIdState] = useState<string>(() => {
    try {
      return localStorage.getItem("narrator_voice") || "sofia";
    } catch {
      return "sofia";
    }
  });
  const [rate, setRateState] = useState<number>(() => {
    try {
      const v = parseFloat(localStorage.getItem("narrator_rate") || "1");
      return isNaN(v) ? 1 : v;
    } catch {
      return 1;
    }
  });
  const [enabled, setEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem("narrator_enabled") !== "false";
    } catch {
      return true;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const reqIdRef = useRef(0);

  const setVoiceId = useCallback((v: string) => {
    setVoiceIdState(v);
    try { localStorage.setItem("narrator_voice", v); } catch { /* empty */ }
  }, []);

  const setRate = useCallback((r: number) => {
    const clamped = Math.max(0.5, Math.min(2, r));
    setRateState(clamped);
    try { localStorage.setItem("narrator_rate", String(clamped)); } catch { /* empty */ }
    if (audioRef.current) audioRef.current.playbackRate = clamped;
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    try { localStorage.setItem("narrator_enabled", v ? "true" : "false"); } catch { /* empty */ }
    if (!v && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setStatus("idle");
      setCurrentText("");
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setStatus("idle");
    setCurrentText("");
    setError(null);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && status === "playing") {
      audioRef.current.pause();
      setStatus("paused");
    }
  }, [status]);

  const resume = useCallback(() => {
    if (audioRef.current && status === "paused") {
      audioRef.current.play().catch(() => { /* ignore */ });
      setStatus("playing");
    }
  }, [status]);

  const speak = useCallback(async (text: string) => {
    const original = text.trim();
    // Преобразуем формулы (x^2, x^3 и т.п.) в произносимый русский
    const clean = prepareForSpeech(original);
    if (!clean || !enabled) return;

    // stop предыдущее
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const reqId = ++reqIdRef.current;
    // Для отображения оставляем исходный текст (читается визуально лучше)
    setCurrentText(original);
    setError(null);

    const cacheKey = `${voiceId}::${clean}`;
    let audioUrl = cacheRef.current.get(cacheKey);

    if (!audioUrl) {
      setStatus("loading");
      try {
        const res = await fetch(TTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clean.slice(0, 4500), teacher_id: voiceId }),
        });
        const data = await res.json();
        if (reqId !== reqIdRef.current) return;
        if (!res.ok) throw new Error(data?.error || "Ошибка озвучки");
        const audioBase64 = data.audio_base64;
        if (!audioBase64) throw new Error("Пустой ответ TTS");
        audioUrl = `data:${data.mime || "audio/mpeg"};base64,${audioBase64}`;
        cacheRef.current.set(cacheKey, audioUrl);
        if (cacheRef.current.size > CACHE_LIMIT) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) cacheRef.current.delete(firstKey);
        }
      } catch (e) {
        if (reqId !== reqIdRef.current) return;
        const msg = e instanceof Error ? e.message : "Ошибка озвучки";
        setError(msg);
        setStatus("error");
        return;
      }
    }

    if (reqId !== reqIdRef.current || !audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.playbackRate = rate;
    audioRef.current = audio;

    audio.onplay = () => setStatus("playing");
    audio.onpause = () => {
      if (audioRef.current === audio && !audio.ended) setStatus((s) => (s === "loading" ? s : "paused"));
    };
    audio.onended = () => {
      if (audioRef.current === audio) {
        setStatus("idle");
        setCurrentText("");
      }
    };
    audio.onerror = () => {
      if (audioRef.current === audio) {
        setStatus("error");
        setError("Не удалось воспроизвести аудио");
      }
    };

    try {
      await audio.play();
    } catch {
      setStatus("error");
      setError("Браузер заблокировал автозапуск аудио");
    }
  }, [enabled, voiceId, rate]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    status,
    currentText,
    error,
    voiceId,
    setVoiceId,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop,
    enabled,
    setEnabled,
  };
}