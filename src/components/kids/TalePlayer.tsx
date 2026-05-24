import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import { LibraryItem } from "@/components/kids/libraryData";

const TTS_URL = (func2url as Record<string, string>)["tts"];

interface Props {
  item: LibraryItem;
}

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

export default function TalePlayer({ item }: Props) {
  const [chunks] = useState<string[]>(() => splitToChunks(item.text));
  const [currentChunk, setCurrentChunk] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 внутри текущего фрагмента
  const [speed, setSpeed] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const cancelledRef = useRef(false);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stopAudio();
    };
  }, []);

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

  const playChunk = async (idx: number) => {
    if (idx >= chunks.length) {
      setPlaying(false);
      setCurrentChunk(0);
      setProgress(0);
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
    setCurrentChunk(0);
    setProgress(0);
    setPlaying(false);
  };

  const skipPrev = () => {
    const target = Math.max(0, currentChunk - 1);
    if (playing) playChunk(target);
    else { setCurrentChunk(target); setProgress(0); }
  };

  const skipNext = () => {
    const target = Math.min(chunks.length - 1, currentChunk + 1);
    if (playing) playChunk(target);
    else { setCurrentChunk(target); setProgress(0); }
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

          {error && (
            <p className="mt-3 text-rose-300 text-xs flex items-center gap-1.5">
              <Icon name="AlertCircle" size={12} />
              {error}
            </p>
          )}
        </div>
      </div>

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
