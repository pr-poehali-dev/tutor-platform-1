import { useCallback, useRef, useState } from "react";
import { Persona } from "./personaTypes";
import useAudioLevel from "./useAudioLevel";

const AI_CHAT_URL = "https://functions.poehali.dev/d2f39a05-0f9a-44a1-a65e-cace2e81c84b";
const TTS_URL = "https://functions.poehali.dev/fa3b03da-815c-4f28-baf2-1a88e36fca8d";

export interface PersonaMessage {
  id: number;
  from: "user" | "bot";
  text: string;
}

export type PersonaPhase = "idle" | "thinking" | "speaking";

/**
 * Диалог с ИИ-персоной: вопрос → ответ модели → озвучка → движение губ.
 *
 * Ответ и озвучка идут одним потоком, поэтому текст появляется на экране
 * одновременно с началом речи — пауза не ощущается.
 */
export default function usePersonaChat(persona: Persona) {
  const [messages, setMessages] = useState<PersonaMessage[]>([]);
  const [phase, setPhase] = useState<PersonaPhase>("idle");
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const historyRef = useRef<PersonaMessage[]>([]);
  const personaRef = useRef(persona);
  personaRef.current = persona;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const { level, attach, detach } = useAudioLevel();

  const stopSpeaking = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    detach();
    setPhase("idle");
  }, [detach]);

  /** Озвучить текст и подключить анализатор — губы задвигаются сами. */
  const speak = useCallback(
    async (text: string) => {
      if (mutedRef.current) {
        setPhase("idle");
        return;
      }
      try {
        const res = await fetch(TTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.slice(0, 4000),
            teacher_id: personaRef.current.voice,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.audio_base64) {
          setPhase("idle");
          return;
        }

        // Один и тот же элемент переиспользуем: анализатор можно подключить
        // к элементу лишь однажды, иначе браузер бросит ошибку.
        let audio = audioRef.current;
        if (!audio) {
          audio = new Audio();
          audio.crossOrigin = "anonymous";
          audioRef.current = audio;
        }
        audio.pause();
        audio.src = `data:${data.mime || "audio/mpeg"};base64,${data.audio_base64}`;

        setPhase("speaking");
        attach(audio);

        audio.onended = () => {
          detach();
          setPhase("idle");
        };
        audio.onerror = () => {
          detach();
          setPhase("idle");
        };
        await audio.play().catch(() => {
          detach();
          setPhase("idle");
        });
      } catch {
        setPhase("idle");
      }
    },
    [attach, detach],
  );

  /** Задать вопрос персоне. */
  const ask = useCallback(
    async (userText: string) => {
      const text = userText.trim();
      if (!text) return;

      const p = personaRef.current;
      const userMsg: PersonaMessage = { id: Date.now(), from: "user", text };
      historyRef.current = [...historyRef.current, userMsg];
      setMessages([...historyRef.current]);
      setPhase("thinking");

      try {
        const res = await fetch(AI_CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacher_id: p.voice,
            message: text,
            // Характер персоны передаём как контекст — модель отвечает в роли
            lesson_notes: p.persona,
            voice_mode: true,
            history: historyRef.current.slice(-8).map((m) => ({
              role: m.from === "user" ? "user" : "assistant",
              content: m.text,
            })),
          }),
        });
        const data = await res.json().catch(() => ({}));
        const reply =
          (data.reply || "").trim() ||
          "Извините, не удалось получить ответ. Попробуйте переспросить.";

        const botMsg: PersonaMessage = { id: Date.now() + 1, from: "bot", text: reply };
        historyRef.current = [...historyRef.current, botMsg];
        setMessages([...historyRef.current]);
        await speak(reply);
      } catch {
        const botMsg: PersonaMessage = {
          id: Date.now() + 1,
          from: "bot",
          text: "Связь прервалась. Проверьте интернет и попробуйте ещё раз.",
        };
        historyRef.current = [...historyRef.current, botMsg];
        setMessages([...historyRef.current]);
        setPhase("idle");
      }
    },
    [speak],
  );

  /** Поздороваться — первая фраза голосом. */
  const greet = useCallback(async () => {
    const p = personaRef.current;
    const msg: PersonaMessage = { id: Date.now(), from: "bot", text: p.greeting };
    historyRef.current = [msg];
    setMessages([msg]);
    await speak(p.greeting);
  }, [speak]);

  const reset = useCallback(() => {
    stopSpeaking();
    historyRef.current = [];
    setMessages([]);
  }, [stopSpeaking]);

  return {
    messages,
    phase,
    level,
    muted,
    setMuted,
    ask,
    greet,
    reset,
    stopSpeaking,
    speak,
  };
}
