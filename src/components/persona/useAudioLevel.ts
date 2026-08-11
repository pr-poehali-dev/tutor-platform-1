import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Замер громкости речи в реальном времени — основа липсинка.
 *
 * Пока персонаж говорит, мы 60 раз в секунду измеряем громкость звука и
 * отдаём число 0..1. Компонент лица использует его как степень открытия рта:
 * тишина — рот закрыт, громкий слог — рот открыт. Именно совпадение движения
 * губ со звуком создаёт ощущение живого человека.
 *
 * Работает через Web Audio API, без внешних сервисов и без задержки.
 */

/** Аудио-контекст один на страницу: браузер ограничивает их количество. */
let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  return sharedCtx;
}

/**
 * Элемент можно подключить к анализатору только один раз за всю его жизнь —
 * повторный createMediaElementSource бросает ошибку. Поэтому держим карту.
 */
const sourceMap = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();

export interface AudioLevelApi {
  /** Текущая громкость 0..1 (0 — тишина, 1 — громкий слог). */
  level: number;
  /** Подключить <audio> к анализатору и начать замер. */
  attach: (audio: HTMLAudioElement) => void;
  /** Остановить замер и плавно закрыть рот. */
  detach: () => void;
}

export default function useAudioLevel(): AudioLevelApi {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const smoothRef = useRef(0);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const detach = useCallback(() => {
    stopLoop();
    analyserRef.current = null;
    smoothRef.current = 0;
    setLevel(0);
  }, [stopLoop]);

  const attach = useCallback((audio: HTMLAudioElement) => {
    const ctx = getCtx();
    if (!ctx) return;

    // Браузер блокирует звук до действия пользователя — контекст «будим».
    if (ctx.state === "suspended") ctx.resume().catch(() => undefined);

    let source = sourceMap.get(audio);
    if (!source) {
      try {
        source = ctx.createMediaElementSource(audio);
        sourceMap.set(audio, source);
      } catch {
        return; // элемент уже занят другим контекстом — липсинк просто не включится
      }
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.55;

    try {
      source.connect(analyser);
      analyser.connect(ctx.destination); // звук должен продолжать играть
    } catch {
      return;
    }

    analyserRef.current = analyser;
    dataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));

    stopLoop();
    const tick = () => {
      const a = analyserRef.current;
      const buf = dataRef.current;
      if (!a || !buf) return;

      a.getByteFrequencyData(buf);

      // Берём диапазон человеческого голоса (примерно 100–3500 Гц) —
      // так рот реагирует на речь, а не на фоновый шум и музыку.
      const from = 2;
      const to = Math.min(buf.length, 64);
      let sum = 0;
      for (let i = from; i < to; i++) sum += buf[i];
      const avg = sum / (to - from) / 255; // 0..1

      // Растягиваем тихую речь: сырое среднее редко превышает 0.35.
      const boosted = Math.min(1, Math.max(0, (avg - 0.02) * 2.6));

      // Сглаживание: рот открывается быстро, закрывается плавно —
      // без этого губы дёргаются и выглядят механически.
      const prev = smoothRef.current;
      const next = boosted > prev ? prev + (boosted - prev) * 0.55 : prev + (boosted - prev) * 0.22;
      smoothRef.current = next;

      setLevel(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopLoop]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  return { level, attach, detach };
}