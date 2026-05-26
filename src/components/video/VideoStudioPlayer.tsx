import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const TTS_URL = (func2url as Record<string, string>)["tts"];

export interface VideoScene {
  id: string;
  narration: string;
  image_prompt: string;
  image_url?: string | null;
  duration_sec: number;
  transition?: "fade" | "slide" | "zoom" | "none";
  /** Текст ошибки если не удалось сгенерировать картинку. */
  error?: string;
}

interface Props {
  scenes: VideoScene[];
  title?: string;
  /** Голос диктора: alex, sofia, dmitry, nika, fox */
  voiceId?: string;
  autoPlay?: boolean;
}

/** Плеер видеоролика из раскадровки: картинки + Ken Burns + TTS-озвучка + переходы. */
export default function VideoStudioPlayer({ scenes, title, voiceId = "nika", autoPlay = false }: Props) {
  const [playing, setPlaying] = useState(autoPlay);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 в рамках текущей сцены
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sceneTimerRef = useRef<number | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  const current = scenes[currentIdx];
  const total = scenes.length;

  // Подсчёт общей длительности и прогресса
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration_sec, 0);
  const passedDuration =
    scenes.slice(0, currentIdx).reduce((s, x) => s + x.duration_sec, 0) +
    (current?.duration_sec ?? 0) * progress;
  const overallProgress = totalDuration > 0 ? passedDuration / totalDuration : 0;

  const stopAll = () => {
    if (sceneTimerRef.current !== null) {
      window.clearInterval(sceneTimerRef.current);
      sceneTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  useEffect(() => () => stopAll(), []);

  const fetchTts = async (text: string): Promise<string | null> => {
    if (audioCacheRef.current.has(text)) return audioCacheRef.current.get(text)!;
    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, teacher_id: voiceId }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const audioData = data.audio || data.audio_base64;
      if (!audioData) return null;
      const dataUrl = `data:audio/mp3;base64,${audioData}`;
      audioCacheRef.current.set(text, dataUrl);
      return dataUrl;
    } catch {
      return null;
    }
  };

  const playScene = async (idx: number) => {
    stopAll();
    if (idx >= scenes.length) {
      setPlaying(false);
      setProgress(0);
      return;
    }
    setCurrentIdx(idx);
    setProgress(0);
    const scene = scenes[idx];

    // Запускаем TTS
    if (scene.narration) {
      const audioUrl = await fetchTts(scene.narration);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play().catch(() => { /* блок автоплея */ });
        // Параллельно предзагружаем следующую сцену
        if (idx + 1 < scenes.length) fetchTts(scenes[idx + 1].narration);
      }
    }

    // Таймер прогресса сцены
    const start = performance.now();
    const durMs = scene.duration_sec * 1000;
    sceneTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / durMs);
      setProgress(p);
      if (p >= 1) {
        if (sceneTimerRef.current !== null) {
          window.clearInterval(sceneTimerRef.current);
          sceneTimerRef.current = null;
        }
        playScene(idx + 1);
      }
    }, 50);
  };

  const togglePlay = () => {
    if (playing) {
      stopAll();
      setPlaying(false);
    } else {
      setPlaying(true);
      playScene(currentIdx);
    }
  };

  const restart = () => {
    stopAll();
    setCurrentIdx(0);
    setProgress(0);
    setPlaying(true);
    playScene(0);
  };

  const skipToScene = (idx: number) => {
    stopAll();
    setCurrentIdx(idx);
    setProgress(0);
    if (playing) playScene(idx);
  };

  if (!current) {
    return (
      <div className="aspect-video bg-card border border-white/10 rounded-3xl flex items-center justify-center text-white/55 text-sm">
        Нет сцен для воспроизведения
      </div>
    );
  }

  // Ken Burns: чередуем зум-ин / зум-аут / пан в зависимости от индекса
  const kenBurns = ["zoom-in", "zoom-out", "pan-left", "pan-right"][currentIdx % 4];

  return (
    <div className="bg-black border border-white/10 rounded-3xl overflow-hidden">
      {/* Видео-область */}
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {current.image_url ? (
          <img
            key={current.id + "-" + currentIdx}
            src={current.image_url}
            alt={current.narration}
            className={`w-full h-full object-cover ${playing ? `kenburns-${kenBurns}` : ""}`}
            style={{
              animationDuration: `${current.duration_sec}s`,
              animationFillMode: "both",
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/45 gap-2">
            <Icon name="ImageOff" size={32} />
            <p className="text-sm">Картинка не сгенерирована</p>
            <p className="text-xs text-white/35 max-w-md text-center px-4">{current.image_prompt}</p>
          </div>
        )}

        {/* Затемнение снизу + субтитры */}
        {playing && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 md:p-8 pt-16">
            <p className="text-white text-base md:text-xl font-medium text-center max-w-3xl mx-auto leading-snug drop-shadow-lg">
              {current.narration}
            </p>
          </div>
        )}

        {/* Бейдж title */}
        {title && currentIdx === 0 && progress < 0.3 && (
          <div className="absolute top-5 left-5 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
            🎬 {title}
          </div>
        )}

        {/* Индикатор сцены */}
        <div className="absolute top-5 right-5 bg-black/60 backdrop-blur text-white/85 text-xs font-bold px-3 py-1.5 rounded-full tabular-nums">
          {currentIdx + 1} / {total}
        </div>

        {/* Большая кнопка Play поверх (когда на паузе) */}
        {!playing && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group"
          >
            <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Icon name="Play" size={36} className="text-black ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Прогресс по всему ролику */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all"
          style={{ width: `${overallProgress * 100}%` }}
        />
      </div>

      {/* Управление */}
      <div className="p-3 bg-slate-950/80 flex items-center gap-2">
        <button
          onClick={restart}
          title="Сначала"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10 transition-colors"
        >
          <Icon name="RotateCcw" size={14} />
        </button>
        <button
          onClick={togglePlay}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:scale-105 transition-transform shadow-lg"
        >
          <Icon name={playing ? "Pause" : "Play"} size={18} className={playing ? "" : "ml-0.5"} />
        </button>

        {/* Хронометраж сцен — ленточка */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => skipToScene(i)}
              title={`Сцена ${i + 1}: ${s.narration.slice(0, 60)}...`}
              className={`flex-shrink-0 h-7 rounded transition-all ${
                i === currentIdx
                  ? "bg-pink-500 w-12"
                  : i < currentIdx
                  ? "bg-pink-500/30 w-6 hover:w-8"
                  : "bg-white/10 hover:bg-white/20 w-6 hover:w-8"
              }`}
              style={{ minWidth: i === currentIdx ? 48 : 24 }}
            >
              <span className="sr-only">Сцена {i + 1}</span>
            </button>
          ))}
        </div>

        <span className="text-white/55 text-xs tabular-nums flex-shrink-0">
          ~{Math.ceil(totalDuration)}с
        </span>
      </div>
    </div>
  );
}