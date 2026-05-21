import { useCallback, useEffect, useRef, useState } from "react";

const STT_URL = "https://functions.poehali.dev/7dea9f0a-6f61-4a4b-a1f8-1b462199f8c2";

type RecState = "idle" | "recording" | "processing" | "error";

export default function useVoiceRecorder(onTranscribed: (text: string) => void) {
  const [state, setState] = useState<RecState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => { /* empty */ });
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setLevel(0);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const start = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Голосовой ввод не поддерживается этим браузером. Открой сайт в Chrome, Safari, Яндекс.Браузере или Edge.");
      setState("error");
      return;
    }

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      setError("Голос работает только по защищённому соединению (https). Открой сайт по адресу https://учисьпро.рф");
      setState("error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Визуализация уровня звука
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AC();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        setLevel(Math.min(1, sum / data.length / 100));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        cleanup();
        if (blob.size < 800) {
          setState("idle");
          return;
        }
        setState("processing");
        try {
          const buf = await blob.arrayBuffer();
          let binary = "";
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          const b64 = btoa(binary);

          const res = await fetch(STT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_base64: b64 }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Ошибка распознавания");
          const text = (data?.text || "").trim();
          if (text) onTranscribed(text);
          setState("idle");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Ошибка распознавания");
          setState("error");
        }
      };

      recorder.start();
      setState("recording");
    } catch (e) {
      cleanup();
      const err = e as { name?: string; message?: string };
      const name = err?.name || "";
      const msg = err?.message || "";
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (name === "NotAllowedError" || name === "SecurityError" || /denied|permission/i.test(msg)) {
        const howTo = isIOS
          ? "На iPhone: Настройки → Safari → Микрофон → разрешить для учисьпро.рф, затем обнови страницу."
          : isAndroid
            ? "На Android: нажми на замочек слева от адреса → Разрешения → Микрофон → Разрешить, затем обнови страницу."
            : "Нажми на замочек слева от адреса сайта → Разрешения → Микрофон → Разрешить, затем обнови страницу.";
        setError(`Доступ к микрофону запрещён. ${howTo}`);
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError("Микрофон не найден. Подключи микрофон или гарнитуру и попробуй ещё раз.");
      } else if (name === "NotReadableError" || name === "AbortError") {
        setError("Микрофон занят другим приложением. Закрой Zoom, Discord, Skype и попробуй снова.");
      } else {
        setError(msg || "Не удалось включить микрофон");
      }
      setState("error");
    }
  }, [onTranscribed, cleanup]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      cleanup();
      setState("idle");
    }
  }, [cleanup]);

  const cancel = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    cleanup();
    setState("idle");
    setError(null);
  }, [cleanup]);

  return { state, error, level, start, stop, cancel };
}