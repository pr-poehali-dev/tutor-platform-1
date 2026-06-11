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
  const chirpRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  // Токен последнего запроса речи — защищает от гонки, когда несколько
  // реплик приходят подряд, пока грузится аудио предыдущей.
  const speakIdRef = useRef(0);
  const [enabled, setEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  // ── Липсинк: живой уровень громкости речи 0..1 для движка мимики ──
  // Аватар Ксюши читает mouthLevelRef каждый кадр и открывает рот ровно
  // настолько, насколько громкий звук сейчас звучит.
  const mouthLevelRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mouthRafRef = useRef(0);
  // Кэш источников: один MediaElementAudioSource на каждый <audio>,
  // иначе браузер кидает ошибку при повторном подключении.
  const sourceMapRef = useRef<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>(
    new WeakMap()
  );

  const stopMouthLoop = useCallback(() => {
    if (mouthRafRef.current) {
      cancelAnimationFrame(mouthRafRef.current);
      mouthRafRef.current = 0;
    }
    mouthLevelRef.current = 0;
  }, []);

  // Подключаем <audio> к анализатору и каждый кадр считаем амплитуду речи
  const startMouthLoop = useCallback(
    (audio: HTMLAudioElement) => {
      try {
        const AC: typeof AudioContext =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AC) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AC();
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;

        let source = sourceMapRef.current.get(audio);
        if (!source) {
          source = ctx.createMediaElementSource(audio);
          sourceMapRef.current.set(audio, source);
        }
        source.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          const a = analyserRef.current;
          if (!a) return;
          a.getByteFrequencyData(data);
          // Средне-низкие частоты (голос), нормализуем в 0..1
          let sum = 0;
          const n = Math.min(48, data.length);
          for (let i = 2; i < n; i++) sum += data[i];
          const avg = sum / (n - 2) / 255;
          // Нелинейно — речь выразительнее
          mouthLevelRef.current = Math.min(1, Math.pow(avg * 1.7, 0.85));
          mouthRafRef.current = requestAnimationFrame(tick);
        };
        stopMouthLoop();
        mouthRafRef.current = requestAnimationFrame(tick);
      } catch {
        // Если Web Audio недоступен — движок мимики включит псевдо-липсинк
        mouthLevelRef.current = 0;
      }
    },
    [stopMouthLoop]
  );

  const stop = useCallback(() => {
    // Любая текущая загрузка речи становится неактуальной
    speakIdRef.current++;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (chirpRef.current) {
      chirpRef.current.pause();
      chirpRef.current = null;
    }
    stopMouthLoop();
    setSpeaking(false);
  }, [stopMouthLoop]);

  const speak = useCallback(
    async (rawText: string) => {
      if (!enabled) return;
      const text = stripEmoji(rawText);
      if (!text) return;

      stop();
      // Фиксируем свой идентификатор после stop() (он увеличил счётчик)
      const myId = speakIdRef.current;
      try {
        let audioSrc = cacheRef.current.get(text);
        if (!audioSrc) {
          const res = await fetch(TTS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, teacher_id: "ksusha" }),
          });
          // Пока грузилось — пришла новая реплика или нажали стоп
          if (myId !== speakIdRef.current) return;
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.audio_base64) return;
          audioSrc = `data:${data.mime || "audio/mpeg"};base64,${data.audio_base64}`;
          cacheRef.current.set(text, audioSrc);
        }

        // Финальная проверка перед воспроизведением
        if (myId !== speakIdRef.current) return;

        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        setSpeaking(true);
        // Запускаем реальный липсинк по громкости речи
        startMouthLoop(audio);
        audio.onended = () => {
          stopMouthLoop();
          if (myId === speakIdRef.current) setSpeaking(false);
        };
        audio.onerror = () => {
          stopMouthLoop();
          if (myId === speakIdRef.current) setSpeaking(false);
        };
        await audio.play().catch(() => {
          stopMouthLoop();
          if (myId === speakIdRef.current) setSpeaking(false);
        });
      } catch {
        stopMouthLoop();
        if (myId === speakIdRef.current) setSpeaking(false);
      }
    },
    [enabled, stop, startMouthLoop, stopMouthLoop]
  );

  // Короткий звук-эмоция («оп!», «хм-м») — играет негромко и не прерывает
  // длинные реплики так заметно. Не меняет состояние speaking.
  const chirp = useCallback(
    async (rawText: string, volume = 0.7) => {
      if (!enabled) return;
      const text = stripEmoji(rawText);
      if (!text) return;
      try {
        let audioSrc = cacheRef.current.get("chirp:" + text);
        if (!audioSrc) {
          const res = await fetch(TTS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, teacher_id: "ksusha" }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.audio_base64) return;
          audioSrc = `data:${data.mime || "audio/mpeg"};base64,${data.audio_base64}`;
          cacheRef.current.set("chirp:" + text, audioSrc);
        }
        if (chirpRef.current) chirpRef.current.pause();
        const audio = new Audio(audioSrc);
        audio.volume = volume;
        chirpRef.current = audio;
        await audio.play().catch(() => {});
      } catch {
        // тихо игнорируем — звук необязательный
      }
    },
    [enabled]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      if (prev) stop();
      return !prev;
    });
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { speak, chirp, stop, toggle, enabled, speaking, mouthLevelRef };
}