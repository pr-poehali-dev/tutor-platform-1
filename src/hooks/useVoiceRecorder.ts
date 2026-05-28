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

    // 1) Проверка getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Голосовой ввод не поддерживается этим браузером. Открой сайт в Chrome, Safari, Яндекс.Браузере или Edge.");
      setState("error");
      return;
    }

    // 2) HTTPS обязателен
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      setError("Голос работает только по защищённому соединению (https). Открой сайт по адресу https://учисьпро.рф");
      setState("error");
      return;
    }

    // 3) КРИТИЧНО: проверяем MediaRecorder ДО запроса микрофона.
    //    Некоторые WebView (Telegram in-app, старый Samsung Internet, iOS<14.3)
    //    вообще не имеют MediaRecorder — раньше тут падал ReferenceError.
    if (typeof MediaRecorder === "undefined") {
      setError("Твой браузер не умеет записывать звук. Открой учисьпро.рф в обычном Safari или Chrome (не во встроенном браузере приложения).");
      setState("error");
      return;
    }

    // 4) Подбираем формат с учётом Safari (он умеет только audio/mp4)
    const mimeCandidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    const mime = mimeCandidates.find((m) =>
      typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(m),
    ) || "";  // пустая строка = браузер сам выберет дефолт

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Визуализация уровня звука (не критично, если упадёт — продолжаем)
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AC) {
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
        }
      } catch {
        // Визуализация не получилась — не страшно, продолжаем без неё
      }

      // 5) Создаём MediaRecorder — оборачиваем в try, чтобы при неподдержке
      //    закрыть стрим и показать понятную ошибку.
      let recorder: MediaRecorder;
      try {
        recorder = mime
          ? new MediaRecorder(stream, { mimeType: mime })
          : new MediaRecorder(stream);
      } catch (mrErr) {
        cleanup();
        const m = mrErr instanceof Error ? mrErr.message : String(mrErr);
        setError(`Этот браузер не умеет записывать звук в нужном формате. Попробуй открыть сайт в Chrome или обнови Safari до последней версии. (${m.slice(0, 80)})`);
        setState("error");
        return;
      }

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = (ev) => {
        const err = (ev as unknown as { error?: { name?: string; message?: string } }).error;
        cleanup();
        setError(`Запись прервалась: ${err?.message || err?.name || "неизвестная ошибка"}`);
        setState("error");
      };

      recorder.onstop = async () => {
        const realMime = recorder.mimeType || mime || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: realMime });
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

          // Передаём фактический формат — STT поймёт что распаковывать
          const format = realMime.includes("mp4") ? "mp4"
                       : realMime.includes("ogg") ? "oggopus"
                       : "oggopus";

          const res = await fetch(STT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_base64: b64, format }),
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
      } else if (name === "TypeError" || /constraints/i.test(msg)) {
        setError("Браузер не понял настройки записи. Открой сайт в обычном Safari/Chrome (не из встроенного браузера соцсети).");
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