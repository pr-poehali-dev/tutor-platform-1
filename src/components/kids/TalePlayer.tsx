import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import { LibraryItem } from "@/components/kids/libraryData";
import { useAmbientMusic } from "@/components/kids/useAmbientMusic";

const TTS_URL = (func2url as Record<string, string>)["tts"];

interface Props {
  item: LibraryItem;
  /** Следующее произведение для авто-перехода в конце текущего. */
  nextItem?: LibraryItem | null;
}

const AUTOPLAY_KEY = "uchispro_kids_autoplay_v1";
const AUTOPLAY_COUNTDOWN_SEC = 6;

/** Разбивает текст на короткие фрагменты для последовательного озвучивания. */
function splitToChunks(text: string, maxLen = 600): string[] {
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

export default function TalePlayer({ item, nextItem }: Props) {
  const navigate = useNavigate();
  const [chunks] = useState<string[]>(() => splitToChunks(item.text));
  const [currentChunk, setCurrentChunk] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 внутри текущего фрагмента
  const [speed, setSpeed] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(AUTOPLAY_KEY);
      return v === null ? true : v === "1";
    } catch { return true; }
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const cancelledRef = useRef(false);
  const countdownTimerRef = useRef<number | null>(null);

  // Фоновая амбиентная музыка
  const ambient = useAmbientMusic();

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  };

  const clearCountdown = () => {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stopAudio();
      clearCountdown();
    };
  }, []);

  // При смене произведения — полный сброс состояния плеера
  useEffect(() => {
    cancelledRef.current = false;
    setCurrentChunk(0);
    setProgress(0);
    setPlaying(false);
    setLoading(false);
    setError(null);
    setFinished(false);
    audioCacheRef.current.clear();
    clearCountdown();
    stopAudio();
     
  }, [item.id]);

  // Сохраняем настройку автоплея
  useEffect(() => {
    try {
      localStorage.setItem(AUTOPLAY_KEY, autoplayEnabled ? "1" : "0");
    } catch { /* noop */ }
  }, [autoplayEnabled]);

  const fetchAudio = async (idx: number): Promise<string | null> => {
    if (audioCacheRef.current.has(idx)) return audioCacheRef.current.get(idx)!;
    const text = chunks[idx];
    if (!text) return null;
    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, teacher_id: "fox" }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const audioData = data.audio || data.audio_base64;
      if (!audioData) return null;
      const dataUrl = `data:audio/mp3;base64,${audioData}`;
      audioCacheRef.current.set(idx, dataUrl);
      return dataUrl;
    } catch {
      return null;
    }
  };

  const startCountdownToNext = () => {
    if (!nextItem) return;
    clearCountdown();
    setCountdown(AUTOPLAY_COUNTDOWN_SEC);
    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) {
          clearCountdown();
          // Переходим на следующее произведение
          cancelledRef.current = true;
          stopAudio();
          navigate(`/kids/library/${nextItem.id}`);
          return null;
        }
        return c - 1;
      });
    }, 1000);
  };

  const playChunk = async (idx: number) => {
    if (idx >= chunks.length) {
      setPlaying(false);
      setProgress(0);
      setFinished(true);
      // Запускаем обратный отсчёт, если есть следующее произведение и автоплей включён
      if (autoplayEnabled && nextItem) {
        startCountdownToNext();
      }
      return;
    }
    setError(null);
    setLoading(true);
    setCurrentChunk(idx);
    const url = await fetchAudio(idx);
    if (cancelledRef.current) return;
    setLoading(false);
    if (!url) {
      setError("Не получилось озвучить этот фрагмент. Попробуйте позже.");
      setPlaying(false);
      return;
    }

    stopAudio();
    const audio = new Audio(url);
    audio.playbackRate = speed;
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration > 0) setProgress(audio.currentTime / audio.duration);
    };
    audio.onended = () => {
      setProgress(0);
      // Предзагружаем следующий, пока играет
      if (idx + 1 < chunks.length) {
        fetchAudio(idx + 1);
      }
      playChunk(idx + 1);
    };
    audio.onerror = () => {
      setError("Ошибка воспроизведения. Попробуйте ещё раз.");
      setPlaying(false);
    };
    try {
      await audio.play();
      setPlaying(true);
      // Параллельно подгружаем следующий фрагмент
      if (idx + 1 < chunks.length) fetchAudio(idx + 1);
    } catch {
      setError("Браузер заблокировал автопроигрывание. Нажмите кнопку ещё раз.");
      setPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (playing) {
      if (audioRef.current) audioRef.current.pause();
      setPlaying(false);
      return;
    }
    // Если уже дослушали до конца — перезапускаем с начала
    if (finished) {
      clearCountdown();
      setFinished(false);
      setCurrentChunk(0);
      setProgress(0);
      cancelledRef.current = false;
      playChunk(0);
      return;
    }
    if (audioRef.current && audioRef.current.src) {
      try {
        await audioRef.current.play();
        setPlaying(true);
        return;
      } catch { /* noop */ }
    }
    cancelledRef.current = false;
    playChunk(currentChunk);
  };

  const reset = () => {
    stopAudio();
    clearCountdown();
    setCurrentChunk(0);
    setProgress(0);
    setPlaying(false);
    setFinished(false);
  };

  const skipPrev = () => {
    clearCountdown();
    setFinished(false);
    const target = Math.max(0, currentChunk - 1);
    if (playing) playChunk(target);
    else { setCurrentChunk(target); setProgress(0); }
  };

  const skipNext = () => {
    clearCountdown();
    setFinished(false);
    const target = Math.min(chunks.length - 1, currentChunk + 1);
    if (playing) playChunk(target);
    else { setCurrentChunk(target); setProgress(0); }
  };

  const cancelAutoplay = () => {
    clearCountdown();
  };

  const goNextNow = () => {
    if (!nextItem) return;
    clearCountdown();
    cancelledRef.current = true;
    stopAudio();
    navigate(`/kids/library/${nextItem.id}`);
  };

  const changeSpeed = () => {
    const next = speed === 1.0 ? 0.85 : speed === 0.85 ? 1.15 : 1.0;
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const totalProgress = chunks.length > 0
    ? (currentChunk + progress) / chunks.length
    : 0;

  return (
    <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
      {/* Шапка с аватаром-лисичкой */}
      <div className={`relative bg-gradient-to-br ${item.color} p-5 pb-12`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl ${playing ? "animate-pulse" : ""}`}>
              🦊
            </div>
            {playing && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                <Icon name="Volume2" size={10} className="text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold">Читает Лиса</p>
            <p className="font-montserrat font-black text-white text-base leading-tight">{item.title}</p>
            <p className="text-white/75 text-xs">{item.author}</p>
          </div>
        </div>
      </div>

      {/* Прогресс и плеер */}
      <div className="px-5 -mt-7">
        <div className="bg-background/90 backdrop-blur border border-white/15 rounded-2xl p-4 shadow-xl">
          {/* Прогресс-бар */}
          <div className="mb-3">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full bg-gradient-to-r ${item.color} transition-all duration-300`}
                style={{ width: `${totalProgress * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/55">
              <span>Фрагмент {Math.min(currentChunk + 1, chunks.length)} из {chunks.length}</span>
              <span>~ {item.durationMin} мин</span>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              title="Сначала"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10 transition-colors"
            >
              <Icon name="RotateCcw" size={16} />
            </button>
            <button
              onClick={skipPrev}
              disabled={currentChunk === 0}
              title="Предыдущий фрагмент"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/85 hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <Icon name="SkipBack" size={18} />
            </button>
            <button
              onClick={togglePlay}
              disabled={loading}
              title={playing ? "Пауза" : "Слушать"}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-60`}
            >
              {loading ? (
                <Icon name="Loader2" size={22} className="animate-spin" />
              ) : playing ? (
                <Icon name="Pause" size={22} />
              ) : (
                <Icon name="Play" size={22} className="ml-0.5" />
              )}
            </button>
            <button
              onClick={skipNext}
              disabled={currentChunk >= chunks.length - 1}
              title="Следующий фрагмент"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/85 hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <Icon name="SkipForward" size={18} />
            </button>
            <button
              onClick={changeSpeed}
              title="Скорость"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10 text-xs font-bold tabular-nums transition-colors"
            >
              {speed.toFixed(2)}x
            </button>
          </div>

          {/* Фоновая музыка */}
          <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={ambient.toggle}
              title={ambient.enabled ? "Выключить фоновую музыку" : "Включить мягкую мелодию"}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                ambient.enabled
                  ? "bg-gradient-to-r from-purple-500/25 to-pink-500/25 border border-purple-500/40 text-white"
                  : "bg-white/5 border border-white/10 text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={ambient.enabled ? "Music" : "Music2"} size={12} />
              {ambient.enabled ? "Музыка играет" : "Фоновая музыка"}
              {ambient.enabled && (
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-0.5 h-2.5 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 h-3.5 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </button>
            {ambient.enabled && (
              <div className="flex items-center gap-2 flex-1 min-w-[160px] max-w-[260px]">
                <Icon name="Volume1" size={12} className="text-white/45 flex-shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={0.4}
                  step={0.01}
                  value={ambient.volume}
                  onChange={(e) => ambient.setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 accent-pink-400 cursor-pointer"
                  title="Громкость музыки"
                />
                <Icon name="Volume2" size={12} className="text-white/45 flex-shrink-0" />
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-rose-300 text-xs flex items-center gap-1.5">
              <Icon name="AlertCircle" size={12} />
              {error}
            </p>
          )}

          {/* Переключатель автоплея */}
          {nextItem && (
            <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoplayEnabled}
                  onChange={(e) => setAutoplayEnabled(e.target.checked)}
                  className="w-4 h-4 accent-pink-500 cursor-pointer"
                />
                <span className="text-white/75 text-xs">Автопереход к следующему</span>
              </label>
              <Icon name="ListMusic" size={14} className="text-white/35" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Плашка завершения и автоперехода ─── */}
      {finished && nextItem && (
        <div className="mx-5 mt-4 rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 p-4 animate-fadeIn">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white flex-shrink-0">
              <Icon name="CheckCircle2" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-montserrat font-black text-white text-sm leading-tight mb-0.5">Произведение закончилось 👏</p>
              <p className="text-white/70 text-xs">
                Дальше:{" "}
                <span className="text-emerald-200 font-semibold">{nextItem.title}</span>
                <span className="text-white/45"> · {nextItem.author}</span>
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${nextItem.color} flex items-center justify-center text-2xl flex-shrink-0`}>
              {nextItem.emoji}
            </div>
          </div>

          {countdown !== null ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Включаю через <span className="font-bold text-white tabular-nums">{countdown}</span> с</span>
                <span className="text-white/45">авто-переход</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-1000"
                  style={{ width: `${((AUTOPLAY_COUNTDOWN_SEC - countdown) / AUTOPLAY_COUNTDOWN_SEC) * 100}%` }}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={goNextNow}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-[1.01] text-white text-xs font-bold px-3 py-2 rounded-xl transition-transform"
                >
                  <Icon name="Play" size={12} />
                  Включить сейчас
                </button>
                <button
                  onClick={cancelAutoplay}
                  className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 border border-white/15 text-white/85 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                >
                  <Icon name="X" size={12} />
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={goNextNow}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-[1.01] text-white text-xs font-bold px-3 py-2 rounded-xl transition-transform"
              >
                <Icon name="SkipForward" size={12} />
                Следующее произведение
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 border border-white/15 text-white/85 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              >
                <Icon name="RotateCcw" size={12} />
                Заново
              </button>
            </div>
          )}
        </div>
      )}

      {/* Плашка финиша когда нет следующего */}
      {finished && !nextItem && (
        <div className="mx-5 mt-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/12 to-pink-500/12 p-4 flex items-center gap-3 animate-fadeIn">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
            <Icon name="Sparkles" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-montserrat font-black text-white text-sm">Это было последнее произведение в подборке!</p>
            <Link to="/kids/library" className="text-purple-200 hover:text-white text-xs underline underline-offset-2">
              Вернуться в библиотеку
            </Link>
          </div>
        </div>
      )}

      {/* Сам текст с подсветкой текущего фрагмента */}
      <div className="p-5 pt-6 text-white/85 text-base leading-relaxed space-y-3">
        {chunks.map((c, i) => (
          <p
            key={i}
            onClick={() => {
              if (playing) playChunk(i);
              else { setCurrentChunk(i); setProgress(0); }
            }}
            className={`cursor-pointer rounded-xl px-3 py-2 transition-all whitespace-pre-line ${
              currentChunk === i
                ? "bg-gradient-to-r from-pink-500/15 to-rose-500/15 border border-pink-500/30 text-white"
                : "hover:bg-white/[0.03]"
            }`}
          >
            {c}
          </p>
        ))}
      </div>

      {item.morale && (
        <div className="mx-5 mb-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Icon name="Lightbulb" size={18} className="text-white" />
          </div>
          <div>
            <p className="text-amber-200 text-[10px] uppercase tracking-wider font-bold mb-1">Главная идея</p>
            <p className="text-white/85 text-sm leading-relaxed">{item.morale}</p>
          </div>
        </div>
      )}

      {item.authorNote && (
        <p className="px-5 pb-4 text-white/35 text-[10px] italic">
          {item.authorNote}
        </p>
      )}
    </div>
  );
}