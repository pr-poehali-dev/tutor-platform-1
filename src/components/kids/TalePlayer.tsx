import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LibraryItem } from "@/components/kids/libraryData";
import { useAmbientMusic } from "@/components/kids/useAmbientMusic";
import {
  TTS_URL,
  AUTOPLAY_KEY,
  AUTOPLAY_COUNTDOWN_SEC,
  splitToChunks,
} from "@/components/kids/talePlayerUtils";
import TalePlayerControls from "@/components/kids/TalePlayerControls";
import TalePlayerFinishCard from "@/components/kids/TalePlayerFinishCard";
import TalePlayerText from "@/components/kids/TalePlayerText";

interface Props {
  item: LibraryItem;
  /** Следующее произведение для авто-перехода в конце текущего. */
  nextItem?: LibraryItem | null;
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
      try {
        const a = audioRef.current;
        a.onended = null;
        a.ontimeupdate = null;
        a.onerror = null;
        a.pause();
        a.src = "";
      } catch { /* noop */ }
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
    if (cancelledRef.current) return;
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
    if (cancelledRef.current) return;
    let audio: HTMLAudioElement;
    try {
      audio = new Audio(url);
      audio.playbackRate = speed;
    } catch {
      setError("Не удалось создать аудио. Попробуйте ещё раз.");
      setPlaying(false);
      return;
    }
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (cancelledRef.current || audioRef.current !== audio) return;
      if (audio.duration > 0) setProgress(audio.currentTime / audio.duration);
    };
    audio.onended = () => {
      if (cancelledRef.current || audioRef.current !== audio) return;
      setProgress(0);
      // Предзагружаем следующий, пока играет
      if (idx + 1 < chunks.length) {
        fetchAudio(idx + 1);
      }
      playChunk(idx + 1);
    };
    audio.onerror = () => {
      if (cancelledRef.current || audioRef.current !== audio) return;
      setError("Ошибка воспроизведения. Попробуйте ещё раз.");
      setPlaying(false);
    };
    try {
      await audio.play();
      if (cancelledRef.current || audioRef.current !== audio) return;
      setPlaying(true);
      // Параллельно подгружаем следующий фрагмент
      if (idx + 1 < chunks.length) fetchAudio(idx + 1);
    } catch {
      if (cancelledRef.current || audioRef.current !== audio) return;
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

  const handleChunkClick = (i: number) => {
    if (playing) playChunk(i);
    else { setCurrentChunk(i); setProgress(0); }
  };

  const totalProgress = chunks.length > 0
    ? (currentChunk + progress) / chunks.length
    : 0;

  return (
    <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
      <TalePlayerControls
        item={item}
        nextItem={nextItem}
        chunks={chunks}
        currentChunk={currentChunk}
        playing={playing}
        loading={loading}
        speed={speed}
        error={error}
        autoplayEnabled={autoplayEnabled}
        totalProgress={totalProgress}
        ambient={ambient}
        onSetAutoplayEnabled={setAutoplayEnabled}
        onTogglePlay={togglePlay}
        onReset={reset}
        onSkipPrev={skipPrev}
        onSkipNext={skipNext}
        onChangeSpeed={changeSpeed}
      />

      <TalePlayerFinishCard
        finished={finished}
        nextItem={nextItem}
        countdown={countdown}
        onGoNextNow={goNextNow}
        onCancelAutoplay={cancelAutoplay}
        onReset={reset}
      />

      <TalePlayerText
        item={item}
        chunks={chunks}
        currentChunk={currentChunk}
        playing={playing}
        onChunkClick={handleChunkClick}
      />
    </div>
  );
}