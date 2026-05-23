import { useEffect, useRef, useState } from "react";
import NannyFoxHeader from "@/components/kids/NannyFoxHeader";
import NannyFoxMessages from "@/components/kids/NannyFoxMessages";
import NannyFoxInputBar from "@/components/kids/NannyFoxInputBar";
import {
  AI_CHAT_URL,
  TTS_URL,
  STT_URL,
  SUGGESTED,
  Message,
  RecordingFormat,
  blobToBase64,
  pickMimeType,
} from "@/components/kids/nannyFoxUtils";
import { findReadyAnswer } from "@/components/kids/nannyFoxAnswers";

interface Props {
  ageContext?: string; // "1-2" | "2-3" | ... | undefined
}

export default function NannyFox({ ageContext }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  // Запись с микрофона
  const [recording, setRecording] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [micSeconds, setMicSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const micTimerRef = useRef<number | null>(null);
  const mimeInfoRef = useRef<{ mime: string; format: RecordingFormat }>({ mime: "", format: "oggopus" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // VAD: авто-стоп по тишине
  const vadAudioCtxRef = useRef<AudioContext | null>(null);
  const vadAnalyserRef = useRef<AnalyserNode | null>(null);
  const vadRafRef = useRef<number | null>(null);
  const vadSpokeRef = useRef<boolean>(false); // была ли вообще речь
  const vadLastVoiceRef = useRef<number>(0); // timestamp последнего голоса

  const suggested = SUGGESTED[ageContext ?? "default"] ?? SUGGESTED.default;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    // Приветственное сообщение при первом открытии
    if (open && messages.length === 0) {
      const ageLabel = ageContext ? ` ребёнку ${ageContext} лет` : "";
      setMessages([
        {
          role: "assistant",
          content: `Привет! Я Лиса — помощница для малышей и их родителей. Спросите, как заниматься${ageLabel}, что развивать в этом возрасте, или попросите идею для игры. 🦊`,
        },
      ]);
    }
  }, [open, messages.length, ageContext]);

  const playAudio = async (text: string, idx: number) => {
    // Остановить предыдущий
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    try {
      setPlayingIdx(idx);
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, teacher_id: "fox" }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const data = await res.json();
      const audioData = data.audio || data.audio_base64;
      if (!audioData) throw new Error("Нет аудио в ответе");
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audioRef.current = audio;
      audio.onended = () => setPlayingIdx(null);
      audio.onerror = () => setPlayingIdx(null);
      await audio.play();
    } catch {
      setPlayingIdx(null);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingIdx(null);
  };

  // ── ЗАПИСЬ С МИКРОФОНА ──────────────────────────────────────────────────
  const stopVAD = () => {
    if (vadRafRef.current !== null) {
      cancelAnimationFrame(vadRafRef.current);
      vadRafRef.current = null;
    }
    if (vadAnalyserRef.current) {
      try { vadAnalyserRef.current.disconnect(); } catch { /* noop */ }
      vadAnalyserRef.current = null;
    }
    if (vadAudioCtxRef.current) {
      try { vadAudioCtxRef.current.close(); } catch { /* noop */ }
      vadAudioCtxRef.current = null;
    }
    vadSpokeRef.current = false;
    vadLastVoiceRef.current = 0;
  };

  /** Запускает VAD: следит за громкостью, при 1.5с тишины после речи — авто-стоп. */
  const startVAD = (stream: MediaStream) => {
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return; // не поддерживается — fallback на ручную остановку
    try {
      const ctx = new AudioCtor();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      vadAudioCtxRef.current = ctx;
      vadAnalyserRef.current = analyser;
      vadSpokeRef.current = false;
      vadLastVoiceRef.current = performance.now();

      const buffer = new Uint8Array(analyser.fftSize);
      // Пороги: говорит, если RMS > 0.015 (для нормализованного PCM)
      const VOICE_THRESHOLD = 0.015;
      const SILENCE_MS = 1500; // 1.5 секунды тишины

      const tick = () => {
        const an = vadAnalyserRef.current;
        if (!an) return;
        an.getByteTimeDomainData(buffer);
        // RMS из PCM (диапазон 0..255, центр 128)
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = (buffer[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buffer.length);
        const now = performance.now();
        if (rms > VOICE_THRESHOLD) {
          vadSpokeRef.current = true;
          vadLastVoiceRef.current = now;
        } else if (vadSpokeRef.current && now - vadLastVoiceRef.current > SILENCE_MS) {
          // Тишина после речи — авто-стоп
          stopRecording();
          return;
        }
        vadRafRef.current = requestAnimationFrame(tick);
      };
      vadRafRef.current = requestAnimationFrame(tick);
    } catch {
      stopVAD();
    }
  };

  const stopMicStream = () => {
    stopVAD();
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (micTimerRef.current !== null) {
      window.clearInterval(micTimerRef.current);
      micTimerRef.current = null;
    }
  };

  const recognizeAndSend = async (blob: Blob, format: RecordingFormat) => {
    if (blob.size === 0) {
      setMicError("Ничего не записалось — попробуй ещё раз");
      return;
    }
    setRecognizing(true);
    try {
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch(STT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio_base64: audioBase64, format }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMicError(data.error || "Не получилось распознать речь");
        return;
      }
      const text = (data.text || "").trim();
      if (!text) {
        setMicError("Не услышала. Говорите ближе к микрофону");
        return;
      }
      await send(text);
    } catch {
      setMicError("Нет связи с сервером распознавания");
    } finally {
      setRecognizing(false);
    }
  };

  const startRecording = async () => {
    setMicError(null);
    if (recording || recognizing) return;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicError("Браузер не поддерживает запись с микрофона");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setMicError("Браузер не поддерживает MediaRecorder");
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setMicError("Микрофон работает только на HTTPS — откройте сайт по защищённой ссылке");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      audioStreamRef.current = stream;

      const mimeInfo = pickMimeType();
      mimeInfoRef.current = mimeInfo;
      const recorder = mimeInfo.mime
        ? new MediaRecorder(stream, { mimeType: mimeInfo.mime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const usedMime = mimeInfoRef.current.mime || recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: usedMime });
        stopMicStream();
        await recognizeAndSend(blob, mimeInfoRef.current.format);
      };
      recorder.onerror = () => {
        setMicError("Ошибка записи");
        stopMicStream();
        setRecording(false);
      };

      recorder.start();
      setRecording(true);
      setMicSeconds(0);
      // Запускаем VAD: авто-стоп при 1.5с тишины после речи
      startVAD(stream);
      micTimerRef.current = window.setInterval(() => {
        setMicSeconds((s) => {
          const next = s + 1;
          // Жёсткий авто-стоп через 20 секунд
          if (next >= 20) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (e) {
      const err = e as DOMException;
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicError("Доступ к микрофону запрещён. Разрешите в настройках браузера");
      } else if (err.name === "NotFoundError") {
        setMicError("Микрофон не найден — проверьте подключение");
      } else {
        setMicError("Не удалось включить микрофон");
      }
      stopMicStream();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      try { mediaRecorderRef.current.stop(); } catch { /* noop */ }
      setRecording(false);
    }
    if (micTimerRef.current !== null) {
      window.clearInterval(micTimerRef.current);
      micTimerRef.current = null;
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording) {
      // отключаем обработчик чтобы не отправлять
      mediaRecorderRef.current.onstop = null;
      try { mediaRecorderRef.current.stop(); } catch { /* noop */ }
    }
    stopMicStream();
    setRecording(false);
    audioChunksRef.current = [];
    setMicSeconds(0);
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopMicStream();
      if (mediaRecorderRef.current) {
        try { mediaRecorderRef.current.stop(); } catch { /* noop */ }
      }
    };
  }, []);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const newHistory: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newHistory);
    setInput("");

    // 1) Проверка: если вопрос совпадает с подсказкой — отвечаем мгновенно из базы
    const readyReply = findReadyAnswer(msg);
    if (readyReply) {
      // Лёгкая задержка для естественности (как будто Лиса «думает»)
      setLoading(true);
      await new Promise((r) => setTimeout(r, 300));
      const finalMessages: Message[] = [...newHistory, { role: "assistant", content: readyReply }];
      setMessages(finalMessages);
      setLoading(false);
      if (autoPlay) {
        setTimeout(() => playAudio(readyReply, finalMessages.length - 1), 150);
      }
      return;
    }

    // 2) Иначе — обращаемся к ИИ
    setLoading(true);
    try {
      const ageLine = ageContext ? `Контекст: родитель уточнил возраст ребёнка — ${ageContext} лет. ` : "";
      const res = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: "fox",
          message: ageLine + msg,
          history: newHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Извините, я не смогла придумать ответ. Попробуйте спросить иначе.";
      const finalMessages: Message[] = [...newHistory, { role: "assistant", content: reply }];
      setMessages(finalMessages);

      if (autoPlay) {
        // Озвучить новый ответ
        setTimeout(() => playAudio(reply, finalMessages.length - 1), 200);
      }
    } catch {
      setMessages([
        ...newHistory,
        { role: "assistant", content: "Ой, не получилось связаться с интернетом. Попробуйте через минутку." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Открыть Няню Лису — голосового ИИ-помощника для родителей"
        className={`fixed bottom-5 right-5 z-50 group flex items-center gap-2 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white pl-3 pr-4 py-3 rounded-full shadow-2xl shadow-pink-500/40 hover:scale-105 transition-all ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-2xl">🦊</div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-pink-500 animate-pulse" />
        </div>
        <span className="font-montserrat font-black text-sm hidden sm:block">Спроси Лису</span>
      </button>

      {/* Окно чата */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-end sm:justify-end pointer-events-none">
          {/* Подложка для моб */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:hidden pointer-events-auto"
          />

          <div className="relative w-full sm:w-[420px] sm:m-5 bg-card border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[640px] pointer-events-auto animate-fadeIn">
            <NannyFoxHeader
              autoPlay={autoPlay}
              onToggleAutoPlay={() => setAutoPlay((v) => !v)}
              onClose={() => { stopAudio(); setOpen(false); }}
            />

            <NannyFoxMessages
              scrollRef={scrollRef}
              messages={messages}
              loading={loading}
              playingIdx={playingIdx}
              suggested={suggested}
              onPlay={playAudio}
              onStopAudio={stopAudio}
              onSendSuggestion={send}
            />

            <NannyFoxInputBar
              input={input}
              setInput={setInput}
              loading={loading}
              recording={recording}
              recognizing={recognizing}
              micError={micError}
              micSeconds={micSeconds}
              onClearMicError={() => setMicError(null)}
              onSend={() => send()}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onCancelRecording={cancelRecording}
            />
          </div>
        </div>
      )}
    </>
  );
}