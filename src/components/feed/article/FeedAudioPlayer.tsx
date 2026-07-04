import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  src: string;
  title?: string;
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Аудио-плеер озвучки статьи: play/pause, перемотка, скорость. */
export default function FeedAudioPlayer({ src, title = "Слушать озвучку" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrent(t);
  };

  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 0.75];
    const next = rates[(rates.indexOf(rate) + 1) % rates.length];
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/[0.1] via-transparent to-cyan-500/[0.08] p-4 md:p-5 mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-3 py-1">
          <Icon name="Headphones" size={13} className="text-purple-300" />
          <span className="text-[11px] text-purple-200 font-bold uppercase tracking-wider">Аудио</span>
        </div>
        <p className="text-white/70 text-sm font-semibold truncate">{title}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? "Пауза" : "Слушать"}
          className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center hover:scale-105 transition-transform glow-purple"
        >
          <Icon name={playing ? "Pause" : "Play"} size={20} className="text-white" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={seek}
              aria-label="Перемотка"
              className="w-full h-1.5 appearance-none rounded-full cursor-pointer bg-white/15 accent-purple-400"
              style={{
                background: `linear-gradient(to right, rgb(168 85 247) ${pct}%, rgba(255,255,255,0.15) ${pct}%)`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-white/50 text-xs tabular-nums">{formatTime(current)}</span>
            <span className="text-white/40 text-xs tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={cycleRate}
          aria-label="Скорость воспроизведения"
          className="flex-shrink-0 bg-white/8 hover:bg-white/15 border border-white/15 text-white/80 text-xs font-bold px-2.5 py-2 rounded-lg transition-colors tabular-nums"
        >
          {rate}×
        </button>
      </div>
    </div>
  );
}
