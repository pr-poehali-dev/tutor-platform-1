import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const AI_CHAT_URL = (func2url as Record<string, string>)["ai-chat"];
const TTS_URL = (func2url as Record<string, string>)["tts"];
const STT_URL = (func2url as Record<string, string>)["stt"];

/** Кодировать Blob в base64 без префикса data: */
function blobToBase64(blob: Blob): Promise<string> {
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
function pickMimeType(): { mime: string; format: "oggopus" | "lpcm" } {
  if (typeof MediaRecorder === "undefined") return { mime: "", format: "oggopus" };
  const candidates: { mime: string; format: "oggopus" | "lpcm" }[] = [
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

interface Message {
  role: "user" | "assistant";
  content: string;
  audio?: string; // base64 mp3
}

const SUGGESTED: Record<string, string[]> = {
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
  const mimeInfoRef = useRef<{ mime: string; format: "oggopus" | "lpcm" }>({ mime: "", format: "oggopus" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  const stopMicStream = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (micTimerRef.current !== null) {
      window.clearInterval(micTimerRef.current);
      micTimerRef.current = null;
    }
  };

  const recognizeAndSend = async (blob: Blob, format: "oggopus" | "lpcm") => {
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
      micTimerRef.current = window.setInterval(() => {
        setMicSeconds((s) => {
          const next = s + 1;
          // авто-стоп через 20 секунд
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
            {/* Шапка */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-pink-500/15 to-rose-500/15 rounded-t-3xl">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
                  🦊
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-card" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-montserrat font-black text-white text-base leading-tight">Няня Лиса</p>
                <p className="text-white/60 text-[11px]">ИИ-помощник для родителей · с озвучкой</p>
              </div>
              <button
                onClick={() => setAutoPlay((v) => !v)}
                title={autoPlay ? "Отключить авто-озвучку" : "Включить авто-озвучку"}
                className={`p-2 rounded-xl transition-colors ${autoPlay ? "text-pink-300 bg-pink-500/15" : "text-white/40 hover:text-white hover:bg-white/8"}`}
              >
                <Icon name={autoPlay ? "Volume2" : "VolumeX"} size={16} />
              </button>
              <button
                onClick={() => { stopAudio(); setOpen(false); }}
                className="p-2 rounded-xl text-white/55 hover:text-white hover:bg-white/8 transition-colors"
                aria-label="Закрыть"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Сообщения */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
            >
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                const isPlaying = playingIdx === i;
                return (
                  <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white"
                          : "bg-white/8 border border-white/10 text-white/90"
                      }`}>
                        {m.content}
                      </div>
                      {!isUser && (
                        <button
                          onClick={() => isPlaying ? stopAudio() : playAudio(m.content, i)}
                          className={`mt-1.5 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors ${
                            isPlaying
                              ? "bg-pink-500/20 text-pink-200"
                              : "text-white/45 hover:text-pink-200 hover:bg-pink-500/10"
                          }`}
                        >
                          <Icon name={isPlaying ? "PauseCircle" : "PlayCircle"} size={12} />
                          {isPlaying ? "Остановить" : "Озвучить"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Подсказки — показываем, пока 1 сообщение (приветствие) */}
              {messages.length === 1 && !loading && (
                <div className="space-y-2 pt-2">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold px-1">Попробуйте спросить:</p>
                  {suggested.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/35 rounded-2xl px-3.5 py-2.5 text-white/85 text-sm transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Поле ввода */}
            {/* Ошибка микрофона */}
            {micError && (
              <div className="mx-3 mb-2 bg-rose-500/12 border border-rose-500/35 rounded-2xl px-3 py-2 flex items-start gap-2 animate-fadeIn">
                <Icon name="MicOff" size={14} className="text-rose-300 flex-shrink-0 mt-0.5" />
                <p className="text-rose-200 text-xs flex-1">{micError}</p>
                <button
                  onClick={() => setMicError(null)}
                  className="text-rose-300/70 hover:text-rose-200"
                  aria-label="Закрыть"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}

            {/* Идёт распознавание */}
            {recognizing && (
              <div className="mx-3 mb-2 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl px-3 py-2 flex items-center gap-2 animate-fadeIn">
                <Icon name="Loader2" size={14} className="text-cyan-300 animate-spin" />
                <p className="text-cyan-200 text-xs">Распознаю речь...</p>
              </div>
            )}

            {/* Поле ввода или состояние записи */}
            <div className="p-3 border-t border-white/10">
              {recording ? (
                <div className="flex items-center gap-2 bg-rose-500/12 border border-rose-500/35 rounded-2xl px-4 py-2.5 animate-fadeIn">
                  <span className="relative flex w-3 h-3 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                  <p className="text-white text-sm font-semibold flex-1">
                    Говорите... <span className="text-white/55 text-xs tabular-nums">{micSeconds}с / 20с</span>
                  </p>
                  <button
                    onClick={cancelRecording}
                    title="Отменить"
                    className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/75 rounded-xl transition-colors"
                  >
                    <Icon name="X" size={14} />
                  </button>
                  <button
                    onClick={stopRecording}
                    title="Готово — отправить"
                    className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl hover:scale-105 transition-transform"
                  >
                    <Icon name="Check" size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                    placeholder="Напишите или нажмите 🎤"
                    disabled={loading || recognizing}
                    className="flex-1 bg-white/5 border border-white/12 rounded-2xl px-4 py-2.5 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-pink-500/45 focus:bg-white/8 transition-colors disabled:opacity-60"
                  />
                  <button
                    onClick={startRecording}
                    disabled={loading || recognizing}
                    title="Сказать голосом"
                    className="w-10 h-10 flex items-center justify-center bg-white/8 hover:bg-pink-500/20 border border-white/15 hover:border-pink-500/45 text-white/85 hover:text-pink-200 rounded-2xl transition-all disabled:opacity-40"
                  >
                    <Icon name="Mic" size={16} />
                  </button>
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading || recognizing}
                    title="Отправить"
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                  >
                    <Icon name="Send" size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}