import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Хук генерации фоновой амбиентной музыки для аудиосказок.
 * Создаёт мягкую колыбельную мелодию прямо в браузере через Web Audio API.
 * Никаких внешних аудиофайлов — всегда работает, легально.
 *
 * Принцип:
 *  - пентатоника до-мажор (никогда не фальшивит);
 *  - синусоидальные ноты с долгим затуханием (мягкие, без атаки);
 *  - случайные интервалы между нотами 2-4 секунды;
 *  - бас-нота каждые 8 секунд как «дыхание» мелодии;
 *  - общая громкость низкая (~15%), чтобы не перекрывать голос.
 */

// Пентатоника до-мажор (C, D, E, G, A) в 3-х октавах
const NOTE_FREQUENCIES = [
  // Низкая октава (бас)
  130.81, 146.83, 164.81, 196.00, 220.00,
  // Средняя
  261.63, 293.66, 329.63, 392.00, 440.00,
  // Высокая (мелодия)
  523.25, 587.33, 659.25, 783.99, 880.00,
  // Очень высокая (звон)
  1046.50, 1174.66, 1318.51,
];

const MELODY_NOTES = NOTE_FREQUENCIES.slice(5, 15); // средняя + высокая
const BASS_NOTES = NOTE_FREQUENCIES.slice(0, 5); // басы

export function useAmbientMusic() {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(0.15); // 0..1
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const bassTimerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (bassTimerRef.current !== null) {
      window.clearTimeout(bassTimerRef.current);
      bassTimerRef.current = null;
    }
    if (masterGainRef.current && audioCtxRef.current) {
      // Плавное затухание перед остановкой
      const now = audioCtxRef.current.currentTime;
      try {
        masterGainRef.current.gain.cancelScheduledValues(now);
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.5);
      } catch { /* noop */ }
    }
    // Закрываем контекст через 600мс — чтобы успело затухнуть
    const ctx = audioCtxRef.current;
    audioCtxRef.current = null;
    masterGainRef.current = null;
    if (ctx) {
      window.setTimeout(() => {
        try { ctx.close(); } catch { /* noop */ }
      }, 600);
    }
  }, []);

  /** Сыграть одну ноту с мягкой огибающей */
  const playNote = useCallback((freq: number, duration: number, peakGain: number) => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    try {
      const now = ctx.currentTime;
      // Основной тон
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      // Лёгкая «расстройка» через второй осциллятор — для тёплого звука
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq * 2; // октава вверх — обертон
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.value = 0.15; // обертон тише основной

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(peakGain, now + 0.4); // мягкая атака
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(noteGain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(noteGain);
      noteGain.connect(master);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
    } catch { /* noop */ }
  }, []);

  /** Запланировать следующую ноту мелодии */
  const scheduleMelody = useCallback(() => {
    if (!audioCtxRef.current) return;
    const freq = MELODY_NOTES[Math.floor(Math.random() * MELODY_NOTES.length)];
    const duration = 2.5 + Math.random() * 2; // 2.5-4.5 сек звучит нота
    playNote(freq, duration, 0.18);
    // Следующая нота через 2-4 секунды
    const nextDelay = 2000 + Math.random() * 2000;
    timerRef.current = window.setTimeout(scheduleMelody, nextDelay);
  }, [playNote]);

  /** Запланировать басовую ноту */
  const scheduleBass = useCallback(() => {
    if (!audioCtxRef.current) return;
    const freq = BASS_NOTES[Math.floor(Math.random() * BASS_NOTES.length)];
    playNote(freq, 6, 0.12); // долгое звучание баса
    bassTimerRef.current = window.setTimeout(scheduleBass, 8000);
  }, [playNote]);

  const start = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      const ctx = new AudioCtor();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // Плавное нарастание
      const now = ctx.currentTime;
      master.gain.linearRampToValueAtTime(volume, now + 1.5);

      // Запускаем мелодию через 400мс и бас сразу
      timerRef.current = window.setTimeout(scheduleMelody, 400);
      bassTimerRef.current = window.setTimeout(scheduleBass, 100);
    } catch {
      audioCtxRef.current = null;
      masterGainRef.current = null;
    }
  }, [volume, scheduleMelody, scheduleBass]);

  /** Включить / выключить */
  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) start();
      else stop();
      return next;
    });
  }, [start, stop]);

  /** Изменить громкость в реальном времени */
  const setVolumeSafe = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolume(clamped);
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (ctx && master) {
      const now = ctx.currentTime;
      try {
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(clamped, now + 0.3);
      } catch { /* noop */ }
    }
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { enabled, volume, toggle, setVolume: setVolumeSafe };
}
