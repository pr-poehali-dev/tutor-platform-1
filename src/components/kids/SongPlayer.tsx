import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { Song, getTotalSongDuration, getMelodyStyle, getSingSpeed, MELODY_TRACKS } from "./songsData";
import { TTS_URL } from "./talePlayerUtils";

interface Props {
  song: Song;
  onClose: () => void;
  onFinish?: () => void;
}

/** Плеер песенки — Няня Лиса поёт нараспев под фоновую инструменталку.
 *  Архитектура:
 *  - voice-audio: TTS Лисы (Yandex SpeechKit, voice=alena, emotion=good, sing=true)
 *    Каждая строка озвучивается с замедлением и растягиванием гласных → эффект пения
 *  - music-audio: фоновая мелодия из MELODY_TRACKS, играет в цикле на 18-25% громкости,
 *    стиль выбирается по жанру песни (народная гармошка / поп / колыбельная)
 *  - Микширование: оба <audio> играют параллельно, голос поверх музыки */
export default function SongPlayer({ song, onClose, onFinish }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const cancelledRef = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedRef = useRef<number>(0);

  const total = getTotalSongDuration(song);
  const melodyStyle = getMelodyStyle(song);
  const singSpeed = getSingSpeed(song);
  const melody = MELODY_TRACKS[melodyStyle];

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  };

  /** Запустить фоновую мелодию в цикле на нужной громкости. */
  const startMusic = () => {
    if (!musicEnabled) return;
    if (!musicRef.current) {
      const m = new Audio(melody.url);
      m.loop = true;
      m.volume = melody.volume;
      m.preload = "auto";
      musicRef.current = m;
    }
    musicRef.current.volume = melody.volume;
    musicRef.current.play().catch(() => { /* музыка не критична */ });
  };

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stopAudio();
      stopMusic();
      if (musicRef.current) {
        musicRef.current.src = "";
        musicRef.current = null;
      }
    };
     
  }, []);

  // При смене песни — полный сброс, в т.ч. музыка с новой мелодией
  useEffect(() => {
    cancelledRef.current = false;
    audioCacheRef.current.clear();
    accumulatedRef.current = 0;
    setCurrentLine(-1);
    setProgress(0);
    setIsPlaying(false);
    setLoading(false);
    stopAudio();
    stopMusic();
    // пересоздаём музыку — у разных песен разные стили
    if (musicRef.current) {
      musicRef.current.src = "";
      musicRef.current = null;
    }
     
  }, [song.id]);

  // Громкость музыки можно менять на лету
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicEnabled ? melody.volume : 0;
    }
    if (!musicEnabled) stopMusic();
    else if (isPlaying) startMusic();
     
  }, [musicEnabled]);

  /** Запросить TTS для одной строки. Кеширует результат.
   *  Колыбельные → fox_lullaby (очень медленно), остальное → fox_song (распевно). */
  const fetchLineAudio = async (idx: number): Promise<string | null> => {
    if (audioCacheRef.current.has(idx)) return audioCacheRef.current.get(idx)!;
    const line = song.lines[idx];
    if (!line) return null;
    try {
      const teacherId = song.category === "lullaby" ? "fox_lullaby" : "fox_song";
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: line.text, teacher_id: teacherId, sing: true }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const audioData = data.audio || data.audio_base64;
      if (!audioData) return null;
      const mime = data.mime || "audio/mpeg";
      const dataUrl = `data:${mime};base64,${audioData}`;
      audioCacheRef.current.set(idx, dataUrl);
      return dataUrl;
    } catch {
      return null;
    }
  };

  /** Прелоад следующей строки в фоне, чтобы между строками не было пауз. */
  const preloadNext = (idx: number) => {
    if (idx + 1 < song.lines.length && !audioCacheRef.current.has(idx + 1)) {
      fetchLineAudio(idx + 1);
    }
  };

  /** Браузерный fallback — используется только если ИИ-TTS недоступен. */
  const speakWithBrowser = (idx: number) => {
    const line = song.lines[idx];
    if (!line) return;
    setUsingFallback(true);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(line.text);
      utter.lang = "ru-RU";
      utter.rate = 0.92;
      utter.pitch = 1.15;
      window.speechSynthesis.speak(utter);
    }
    const duration = (line.seconds || 3) * 1000;
    fallbackTimerRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      accumulatedRef.current += line.seconds || 3;
      setProgress(Math.min(100, (accumulatedRef.current / total) * 100));
      playLine(idx + 1);
    }, duration);
  };

  /** Запустить воспроизведение строки idx. */
  const playLine = async (idx: number) => {
    if (cancelledRef.current) return;
    if (idx >= song.lines.length) {
      setIsPlaying(false);
      setCurrentLine(-1);
      setProgress(100);
      onFinish?.();
      return;
    }

    setCurrentLine(idx);
    setLoading(!audioCacheRef.current.has(idx));

    const dataUrl = await fetchLineAudio(idx);
    if (cancelledRef.current) return;
    setLoading(false);

    // Если ИИ-TTS не сработал — fallback на браузер
    if (!dataUrl) {
      speakWithBrowser(idx);
      return;
    }

    setUsingFallback(false);

    // Прелоадим следующую строку в фоне
    preloadNext(idx);

    // Создаём audio-элемент
    const audio = new Audio(dataUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      // На всякий случай — синхронизируем прогресс с реальной длительностью
    };

    audio.ontimeupdate = () => {
      if (!audio.duration || cancelledRef.current) return;
      // Прогресс в рамках строки + накопленный
      const lineSecondsActual = audio.duration;
      const inLine = Math.min(audio.currentTime, lineSecondsActual);
      const overall = (accumulatedRef.current + inLine) / total;
      setProgress(Math.min(100, overall * 100));
    };

    audio.onended = () => {
      if (cancelledRef.current) return;
      accumulatedRef.current += audio.duration || (song.lines[idx].seconds || 3);
      setProgress(Math.min(100, (accumulatedRef.current / total) * 100));
      playLine(idx + 1);
    };

    audio.onerror = () => {
      if (cancelledRef.current) return;
      // Если воспроизведение упало — используем браузерный fallback
      speakWithBrowser(idx);
    };

    try {
      await audio.play();
    } catch {
      // Автоплей может быть заблокирован — fallback
      speakWithBrowser(idx);
    }
  };

  const play = () => {
    startMusic();
    if (currentLine >= song.lines.length - 1 || currentLine === -1) {
      // Старт с начала
      cancelledRef.current = false;
      accumulatedRef.current = 0;
      setProgress(0);
      setIsPlaying(true);
      playLine(0);
    } else {
      // Продолжение
      cancelledRef.current = false;
      setIsPlaying(true);
      playLine(currentLine + 1);
    }
  };

  const pause = () => {
    cancelledRef.current = true;
    stopAudio();
    stopMusic();
    setIsPlaying(false);
  };

  const restart = () => {
    cancelledRef.current = true;
    stopAudio();
    stopMusic();
    cancelledRef.current = false;
    accumulatedRef.current = 0;
    setProgress(0);
    setCurrentLine(-1);
    setIsPlaying(true);
    startMusic();
    playLine(0);
  };

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
            {/* Бейджи: голос Лисы + музыкальное сопровождение */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="text-[10px]">🦊</span>
                <span className="text-white text-[10px] font-bold">
                  {usingFallback ? "Голос браузера" : "Лиса поёт"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="text-[10px]">🎵</span>
                <span className="text-white text-[10px] font-bold">{melody.label}</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="text-white text-[10px] font-bold">×{singSpeed}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setMusicEnabled((v) => !v)}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
              title={musicEnabled ? "Выключить музыку" : "Включить музыку"}
            >
              <Icon name={musicEnabled ? "Music" : "VolumeX"} size={16} />
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center">
              <Icon name="X" size={18} />
            </button>
          </div>
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
                      {isActive && loading && (
                        <Icon name="Loader2" size={12} className="inline ml-2 animate-spin text-amber-300" />
                      )}
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
            disabled={loading && !isPlaying}
            className={`w-16 h-16 rounded-full bg-gradient-to-r ${song.color} text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform disabled:opacity-60`}
          >
            {loading && !isPlaying ? (
              <Icon name="Loader2" size={26} className="animate-spin" />
            ) : (
              <Icon name={isPlaying ? "Pause" : "Play"} size={26} />
            )}
          </button>
          <div className="w-11 h-11" /> {/* spacer */}
        </div>
      </div>
    </div>
  );
}