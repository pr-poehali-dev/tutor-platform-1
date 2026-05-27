import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { Song, getTotalSongDuration } from "./songsData";

interface Props {
  song: Song;
  onClose: () => void;
  onFinish?: () => void;
}

/** Плеер песенки: подсвечивает текущую строку и показывает действие к ней.
 *  Озвучку делает встроенный SpeechSynthesis API браузера (offline, бесплатно). */
export default function SongPlayer({ song, onClose, onFinish }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const total = getTotalSongDuration(song);

  const stopAll = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const speakLine = (idx: number) => {
    if (idx >= song.lines.length) {
      setIsPlaying(false);
      setCurrentLine(-1);
      setProgress(100);
      onFinish?.();
      return;
    }
    const line = song.lines[idx];
    setCurrentLine(idx);

    // Озвучка через браузер
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(line.text);
      utter.lang = "ru-RU";
      utter.rate = 0.92;
      utter.pitch = 1.15;
      window.speechSynthesis.speak(utter);
    }

    const duration = (line.seconds || 3) * 1000;
    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      accumulatedRef.current += line.seconds || 3;
      setProgress(Math.min(100, (accumulatedRef.current / total) * 100));
      speakLine(idx + 1);
    }, duration);
  };

  const play = () => {
    if (currentLine >= song.lines.length - 1 || currentLine === -1) {
      // Старт с начала
      accumulatedRef.current = 0;
      setProgress(0);
      setIsPlaying(true);
      speakLine(0);
    } else {
      // Продолжение
      setIsPlaying(true);
      speakLine(currentLine + 1);
    }
  };

  const pause = () => {
    stopAll();
    setIsPlaying(false);
  };

  const restart = () => {
    stopAll();
    accumulatedRef.current = 0;
    setProgress(0);
    setCurrentLine(-1);
    setIsPlaying(true);
    speakLine(0);
  };

  useEffect(() => {
    return () => { stopAll(); };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-white/15 rounded-3xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${song.color} p-5 flex items-center gap-4 relative`}>
          <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-4xl">
            {song.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-montserrat font-black text-white text-xl truncate">{song.title}</h2>
            <p className="text-white/85 text-xs">{song.author}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Прогресс */}
        <div className="px-5 pt-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${song.color} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Текст с подсветкой */}
        <div className="p-5 md:p-6 max-h-[50vh] overflow-y-auto">
          <div className="space-y-1.5">
            {song.lines.map((line, idx) => {
              const isActive = idx === currentLine;
              const isPast = idx < currentLine;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-white/15 border border-white/25 scale-[1.02]"
                      : isPast
                      ? "opacity-40"
                      : "opacity-70"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-base md:text-lg leading-relaxed font-medium ${isActive ? "text-white" : "text-white/80"}`}>
                      {line.text}
                    </p>
                    {line.action && (
                      <p className={`text-[11px] mt-0.5 ${isActive ? "text-amber-300" : "text-white/40"}`}>
                        <Icon name="Hand" size={10} className="inline mr-1" />
                        {line.action}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Чему учит */}
          {song.teaches?.length > 0 && (
            <div className="mt-5 p-3 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1.5">Чему учит</p>
              <div className="flex flex-wrap gap-1.5">
                {song.teaches.map((t) => (
                  <span key={t} className="text-[11px] text-white/75 bg-white/5 px-2 py-0.5 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Совет родителю */}
          {song.parentTip && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-400/25 rounded-xl">
              <p className="text-amber-300 text-[11px] font-bold mb-1">💡 Совет родителю</p>
              <p className="text-white/75 text-xs leading-relaxed">{song.parentTip}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-white/10 px-5 py-4 flex items-center justify-center gap-3">
          <button
            onClick={restart}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 text-white/75 flex items-center justify-center"
            title="Сначала"
          >
            <Icon name="RotateCcw" size={18} />
          </button>
          <button
            onClick={isPlaying ? pause : play}
            className={`w-16 h-16 rounded-full bg-gradient-to-r ${song.color} text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform`}
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={26} />
          </button>
          <div className="w-11 h-11" /> {/* spacer */}
        </div>
      </div>
    </div>
  );
}
