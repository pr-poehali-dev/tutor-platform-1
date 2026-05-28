import { useState, useRef } from "react";
import { STT_URL } from "./teachersData";

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const start = async () => {
    setVoiceError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceError(
        "Голосовой ввод не поддерживается этим браузером. Открой сайт в Chrome, Safari, Яндекс.Браузере или Edge.",
      );
      return;
    }

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      setVoiceError(
        "Голос работает только по защищённому соединению (https). Открой сайт по адресу https://учисьпро.рф",
      );
      return;
    }

    // КРИТИЧНО: MediaRecorder может вообще отсутствовать (старые WebView,
    // Telegram in-app браузер на iOS, Samsung Internet старых версий)
    if (typeof MediaRecorder === "undefined") {
      setVoiceError(
        "Твой браузер не умеет записывать звук. Открой учисьпро.рф в обычном Safari или Chrome (не во встроенном браузере приложения соцсети).",
      );
      return;
    }

    // Подбираем формат с учётом Safari (он умеет только audio/mp4)
    const mimeCandidates = [
      "audio/ogg;codecs=opus",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
    ];
    const mimeType = mimeCandidates.find((m) =>
      typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(m),
    ) || "";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Создание рекордера может упасть, даже если выше всё прошло
      let recorder: MediaRecorder;
      try {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch (mrErr) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const m = mrErr instanceof Error ? mrErr.message : String(mrErr);
        setVoiceError(
          `Этот браузер не поддерживает запись звука. Открой сайт в Chrome или обнови Safari до последней версии. (${m.slice(0, 80)})`,
        );
        return;
      }

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = (ev) => {
        const err = (ev as unknown as { error?: { name?: string; message?: string } }).error;
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setVoiceError(`Запись прервалась: ${err?.message || err?.name || "неизвестная ошибка"}`);
        setIsRecording(false);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        const realMime = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: realMime });
        if (blob.size < 1000) {
          setVoiceError("Слишком короткая запись");
          return;
        }

        setIsTranscribing(true);
        try {
          const audioB64 = await blobToBase64(blob);
          // Передаём фактический формат — STT должен его уметь распаковать
          const format = realMime.includes("mp4") ? "mp4"
                       : realMime.includes("ogg") ? "oggopus"
                       : "oggopus";
          const res = await fetch(STT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_base64: audioB64, format }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Ошибка распознавания");
          const text = (data.text || "").trim();
          if (text) {
            onTranscript(text);
          } else {
            setVoiceError("Не удалось распознать речь. Говори чётче.");
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Ошибка микрофона";
          setVoiceError(msg);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      const name = err?.name || "";
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (name === "NotAllowedError" || name === "SecurityError" || /denied/i.test(err?.message || "")) {
        const howTo = isIOS
          ? "На iPhone: Настройки → Safari → Микрофон → разрешить для учисьпро.рф. Затем обнови страницу."
          : isAndroid
            ? "На Android: нажми на замочек слева от адреса → Разрешения → Микрофон → Разрешить. Затем обнови страницу."
            : "Нажми на замочек слева от адреса сайта → Разрешения → Микрофон → Разрешить. Затем обнови страницу.";
        setVoiceError(`Доступ к микрофону запрещён. ${howTo}`);
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setVoiceError("Микрофон не найден. Подключи микрофон или гарнитуру и попробуй ещё раз.");
      } else if (name === "NotReadableError" || name === "AbortError") {
        setVoiceError("Микрофон занят другим приложением. Закрой Zoom, Discord, Skype и другие программы со звонками.");
      } else if (name === "TypeError" || /constraints/i.test(err?.message || "")) {
        setVoiceError("Браузер не понял настройки записи. Открой сайт в обычном Safari или Chrome (не из встроенного браузера соцсети).");
      } else {
        const msg = err?.message || "Нет доступа к микрофону";
        setVoiceError(`Не удалось включить микрофон: ${msg}`);
      }
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancel = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];
    setIsRecording(false);
    setIsTranscribing(false);
  };

  return { isRecording, isTranscribing, voiceError, start, stop, cancel, setVoiceError };
}