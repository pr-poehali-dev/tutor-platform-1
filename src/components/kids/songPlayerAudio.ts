import { useEffect, useRef, useState } from "react";
import { Song, getTotalSongDuration, getMelodyStyle, getSingSpeed, MELODY_TRACKS } from "./songsData";
import { TTS_URL } from "./talePlayerUtils";

/** Вся аудио-логика плеера песенки — вынесена 1:1 из SongPlayer.
 *  Няня Лиса поёт нараспев под фоновую инструменталку.
 *  - voice-audio: TTS Лисы (Yandex SpeechKit, voice=alena, emotion=good, sing=true)
 *    Каждая строка озвучивается с замедлением и растягиванием гласных → эффект пения
 *  - music-audio: фоновая мелодия из MELODY_TRACKS, играет в цикле на 18-25% громкости,
 *    стиль выбирается по жанру песни (народная гармошка / поп / колыбельная)
 *  - Микширование: оба <audio> играют параллельно, голос поверх музыки */
export function useSongPlayerAudio(song: Song, onFinish?: () => void) {
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

  // Есть ли у песни готовый аудиофайл с живым вокалом
  const hasRealAudio = Boolean(song.audioUrl);
  /** Таймкоды начала каждой строки в готовом треке (для караоке-подсветки).
   *  Берём явные `at`, иначе распределяем равномерно по сумме seconds. */
  const lineStarts = (() => {
    if (!hasRealAudio) return [] as number[];
    const explicit = song.lines.map((l) => l.at);
    if (explicit.every((v) => typeof v === "number")) return explicit as number[];
    let acc = 0;
    return song.lines.map((l) => {
      const start = acc;
      acc += l.seconds || 3;
      return start;
    });
  })();

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

  /** Воспроизведение готового трека с живым вокалом (audioUrl).
   *  Один <audio> на всю песню + караоке-подсветка по таймкодам.
   *  Фоновую мелодию НЕ запускаем — в студийном треке уже есть аккомпанемент. */
  const playRealAudio = (fromStart: boolean) => {
    if (!song.audioUrl) return;
    let audio = audioRef.current;
    if (!audio || fromStart) {
      stopAudio();
      audio = new Audio(song.audioUrl);
      audio.preload = "auto";
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (!audio || cancelledRef.current) return;
        const t = audio.currentTime;
        const dur = audio.duration || total;
        setProgress(Math.min(100, (t / dur) * 100));
        // Караоке: активна последняя строка, чей таймкод уже наступил
        let active = -1;
        for (let i = 0; i < lineStarts.length; i++) {
          if (t + 0.15 >= lineStarts[i]) active = i;
          else break;
        }
        setCurrentLine(active);
      };
      audio.onended = () => {
        if (cancelledRef.current) return;
        setIsPlaying(false);
        setCurrentLine(-1);
        setProgress(100);
        onFinish?.();
      };
      audio.onerror = () => {
        // Если файл не загрузился — откатываемся на голос Лисы
        stopAudio();
        startMusic();
        playLine(0);
      };
    }
    setUsingFallback(false);
    setLoading(true);
    audio.play()
      .then(() => setLoading(false))
      .catch(() => {
        setLoading(false);
        setIsPlaying(false);
      });
    setIsPlaying(true);
  };

  const play = () => {
    // Режим 1: готовый студийный трек с живым вокалом
    if (hasRealAudio) {
      cancelledRef.current = false;
      const resume = audioRef.current && currentLine !== -1 && progress < 100;
      playRealAudio(!resume);
      return;
    }
    // Режим 2: голос Няни Лисы (синтез) + фоновая мелодия
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
    if (hasRealAudio) {
      // Живой трек: ставим на паузу без сброса позиции — можно продолжить
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
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
    if (hasRealAudio) {
      playRealAudio(true);
      return;
    }
    startMusic();
    playLine(0);
  };

  return {
    // state
    isPlaying,
    currentLine,
    progress,
    loading,
    usingFallback,
    musicEnabled,
    setMusicEnabled,
    // derived
    singSpeed,
    melody,
    hasRealAudio,
    // actions
    play,
    pause,
    restart,
  };
}
