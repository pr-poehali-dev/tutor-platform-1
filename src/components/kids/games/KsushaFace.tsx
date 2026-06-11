import { useEffect, useRef } from "react";
import type { KsushaEmotion } from "./KsushaAvatar";

/**
 * Живой движок мимики Ксюши.
 *
 * Рисует анимированный SVG-слой поверх фото-аватара: глаза моргают и
 * двигают зрачками, рот открывается синхронно с речью (липсинк), брови
 * и веки выражают эмоцию. Вся анимация — на одном requestAnimationFrame,
 * без сторонних библиотек, поэтому работает быстро даже на слабых устройствах.
 *
 * Координаты черт лица заданы в процентах от размера аватара и подобраны
 * под текущее фото Ксюши (портрет анфас). Если фото поменяется — правим
 * только константы FEATURES ниже.
 */

// Геометрия черт лица в процентах (0..100) от квадрата аватара.
const FEATURES = {
  eyeY: 43, // вертикаль центра глаз
  eyeDX: 13, // отступ глаза от центра по горизонтали
  eyeRX: 6.6, // полуширина глаза
  eyeRY: 4.6, // полувысота глаза
  pupilR: 3.0, // радиус зрачка
  browY: 33, // вертикаль бровей
  browW: 11, // полуширина брови
  mouthY: 70, // вертикаль рта
  mouthW: 9.5, // полуширина рта
};

type EmotionShape = {
  browAngle: number; // наклон брови, градусы (+ внешний край вниз)
  browLift: number; // подъём брови, % (минус — выше)
  eyeOpen: number; // степень открытости глаз 0..1.2
  mouthCurve: number; // изгиб рта: + улыбка, - грусть
  mouthBaseOpen: number; // базовое открытие рта (когда молчит)
};

const SHAPES: Record<KsushaEmotion, EmotionShape> = {
  idle: { browAngle: 0, browLift: 0, eyeOpen: 1, mouthCurve: 0.5, mouthBaseOpen: 0.06 },
  speaking: { browAngle: -2, browLift: -1, eyeOpen: 1.05, mouthCurve: 0.4, mouthBaseOpen: 0.12 },
  thinking: { browAngle: 6, browLift: -1.5, eyeOpen: 0.85, mouthCurve: -0.1, mouthBaseOpen: 0.04 },
  idea: { browAngle: -4, browLift: -3, eyeOpen: 1.2, mouthCurve: 0.9, mouthBaseOpen: 0.15 },
  happy: { browAngle: -3, browLift: -2, eyeOpen: 0.9, mouthCurve: 1.2, mouthBaseOpen: 0.1 },
  sad: { browAngle: -7, browLift: 1.5, eyeOpen: 0.75, mouthCurve: -1, mouthBaseOpen: 0.03 },
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function KsushaFace({
  emotion,
  mouthLevelRef,
  speaking,
}: {
  emotion: KsushaEmotion;
  // Живой уровень громкости речи 0..1 для липсинка (если есть аналайзер)
  mouthLevelRef?: React.MutableRefObject<number>;
  speaking: boolean;
}) {
  const rootRef = useRef<SVGSVGElement | null>(null);
  const leftEye = useRef<SVGGElement | null>(null);
  const rightEye = useRef<SVGGElement | null>(null);
  const leftPupil = useRef<SVGCircleElement | null>(null);
  const rightPupil = useRef<SVGCircleElement | null>(null);
  const leftBrow = useRef<SVGLineElement | null>(null);
  const rightBrow = useRef<SVGLineElement | null>(null);
  const mouth = useRef<SVGPathElement | null>(null);

  // Текущая и целевая форма (плавно интерполируем между эмоциями)
  const cur = useRef<EmotionShape>({ ...SHAPES.idle });
  const emotionRef = useRef<KsushaEmotion>(emotion);
  const speakingRef = useRef<boolean>(speaking);
  emotionRef.current = emotion;
  speakingRef.current = speaking;

  useEffect(() => {
    let raf = 0;
    // Состояние моргания
    let nextBlink = performance.now() + 1200 + Math.random() * 2500;
    let blinkStart = 0;
    let blinking = false;
    // Состояние взгляда (саккады — резкие переводы взгляда)
    let gazeX = 0;
    let gazeY = 0;
    let gazeTargetX = 0;
    let gazeTargetY = 0;
    let nextGaze = performance.now() + 800 + Math.random() * 1800;
    // Фейковый рот, когда нет аналайзера (псевдо-липсинк по синусам)
    let mouthPhase = 0;
    // Сглаженное открытие рта
    let mouthSmooth = 0;

    const loop = (now: number) => {
      const target = SHAPES[emotionRef.current];
      // Плавно тянем текущую форму к целевой эмоции
      const k = 0.12;
      cur.current.browAngle = lerp(cur.current.browAngle, target.browAngle, k);
      cur.current.browLift = lerp(cur.current.browLift, target.browLift, k);
      cur.current.eyeOpen = lerp(cur.current.eyeOpen, target.eyeOpen, k);
      cur.current.mouthCurve = lerp(cur.current.mouthCurve, target.mouthCurve, k);

      // ── Моргание ─────────────────────────────────────────────
      let blink = 1; // множитель открытости (1 — открыто, 0 — закрыто)
      if (!blinking && now >= nextBlink) {
        blinking = true;
        blinkStart = now;
      }
      if (blinking) {
        const t = (now - blinkStart) / 140; // длительность моргания ~140мс
        if (t >= 1) {
          blinking = false;
          // Иногда двойное моргание
          nextBlink = now + (Math.random() < 0.15 ? 180 : 1600 + Math.random() * 3500);
        } else {
          // 0→1→0: закрылись и открылись
          blink = Math.abs(Math.cos(t * Math.PI));
        }
      }

      // ── Взгляд (саккады) ─────────────────────────────────────
      if (now >= nextGaze) {
        // Думающая Ксюша чаще смотрит вверх-вбок
        const thinking = emotionRef.current === "thinking";
        gazeTargetX = (Math.random() - 0.5) * 2.6;
        gazeTargetY = thinking ? -1.6 - Math.random() * 1.2 : (Math.random() - 0.5) * 1.8;
        nextGaze = now + (thinking ? 1400 : 700) + Math.random() * 1800;
      }
      gazeX = lerp(gazeX, gazeTargetX, 0.18);
      gazeY = lerp(gazeY, gazeTargetY, 0.18);

      // ── Рот / липсинк ────────────────────────────────────────
      let mouthOpen = target.mouthBaseOpen;
      if (speakingRef.current) {
        const live = mouthLevelRef?.current ?? -1;
        if (live >= 0) {
          // Реальный уровень громкости из аналайзера
          mouthOpen = Math.min(1, target.mouthBaseOpen + live * 1.15);
        } else {
          // Псевдо-липсинк: смесь двух синусов даёт «живую» речь
          mouthPhase += 0.45;
          const a = (Math.sin(mouthPhase) + 1) / 2;
          const b = (Math.sin(mouthPhase * 1.7 + 1.3) + 1) / 2;
          mouthOpen = target.mouthBaseOpen + (a * 0.6 + b * 0.4) * 0.6;
        }
      }
      // Сглаживаем, чтобы рот не «дёргался»
      mouthSmooth = lerp(mouthSmooth, mouthOpen, 0.4);

      // ── Применяем к SVG ──────────────────────────────────────
      const eyeOpen = Math.max(0.04, cur.current.eyeOpen * blink);

      if (leftEye.current)
        leftEye.current.setAttribute("transform", `scale(1 ${eyeOpen})`);
      if (rightEye.current)
        rightEye.current.setAttribute("transform", `scale(1 ${eyeOpen})`);

      // Зрачки двигаются по взгляду (и зависят от открытости)
      const px = gazeX;
      const py = gazeY * (eyeOpen > 0.3 ? 1 : 0);
      if (leftPupil.current) {
        leftPupil.current.setAttribute("cx", String(50 - FEATURES.eyeDX + px));
        leftPupil.current.setAttribute("cy", String(FEATURES.eyeY + py));
      }
      if (rightPupil.current) {
        rightPupil.current.setAttribute("cx", String(50 + FEATURES.eyeDX + px));
        rightPupil.current.setAttribute("cy", String(FEATURES.eyeY + py));
      }

      // Брови
      const bl = cur.current.browLift;
      const ba = cur.current.browAngle;
      const by = FEATURES.browY + bl;
      if (leftBrow.current) {
        const x1 = 50 - FEATURES.eyeDX - FEATURES.browW;
        const x2 = 50 - FEATURES.eyeDX + FEATURES.browW;
        leftBrow.current.setAttribute("x1", String(x1));
        leftBrow.current.setAttribute("y1", String(by + ba * 0.35));
        leftBrow.current.setAttribute("x2", String(x2));
        leftBrow.current.setAttribute("y2", String(by - ba * 0.35));
      }
      if (rightBrow.current) {
        const x1 = 50 + FEATURES.eyeDX - FEATURES.browW;
        const x2 = 50 + FEATURES.eyeDX + FEATURES.browW;
        rightBrow.current.setAttribute("x1", String(x1));
        rightBrow.current.setAttribute("y1", String(by - ba * 0.35));
        rightBrow.current.setAttribute("x2", String(x2));
        rightBrow.current.setAttribute("y2", String(by + ba * 0.35));
      }

      // Рот: квадратичная кривая. open — высота раскрытия, curve — улыбка/грусть
      if (mouth.current) {
        const cx = 50;
        const my = FEATURES.mouthY;
        const w = FEATURES.mouthW;
        const open = mouthSmooth * 7; // высота раскрытия в % координат
        const curve = cur.current.mouthCurve * 3.2;
        // Верхняя и нижняя губы как две дуги
        const topCtrlY = my - open * 0.5 - curve;
        const botCtrlY = my + open * 0.7 - curve * 0.2;
        const d =
          `M ${cx - w} ${my} ` +
          `Q ${cx} ${topCtrlY} ${cx + w} ${my} ` +
          `Q ${cx} ${botCtrlY} ${cx - w} ${my} Z`;
        mouth.current.setAttribute("d", d);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mouthLevelRef]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* Брови */}
      <line
        ref={leftBrow}
        stroke="#6b4a2f"
        strokeWidth={1.7}
        strokeLinecap="round"
        opacity={0.55}
      />
      <line
        ref={rightBrow}
        stroke="#6b4a2f"
        strokeWidth={1.7}
        strokeLinecap="round"
        opacity={0.55}
      />

      {/* Левый глаз */}
      <g
        ref={leftEye}
        style={{ transformOrigin: `${50 - FEATURES.eyeDX}% ${FEATURES.eyeY}%` }}
      >
        <ellipse
          cx={50 - FEATURES.eyeDX}
          cy={FEATURES.eyeY}
          rx={FEATURES.eyeRX}
          ry={FEATURES.eyeRY}
          fill="#fdfaf6"
          opacity={0.92}
        />
        <circle
          ref={leftPupil}
          cx={50 - FEATURES.eyeDX}
          cy={FEATURES.eyeY}
          r={FEATURES.pupilR}
          fill="#3a2a1c"
        />
        <circle cx={50 - FEATURES.eyeDX - 1} cy={FEATURES.eyeY - 1} r={0.9} fill="#fff" opacity={0.9} />
      </g>

      {/* Правый глаз */}
      <g
        ref={rightEye}
        style={{ transformOrigin: `${50 + FEATURES.eyeDX}% ${FEATURES.eyeY}%` }}
      >
        <ellipse
          cx={50 + FEATURES.eyeDX}
          cy={FEATURES.eyeY}
          rx={FEATURES.eyeRX}
          ry={FEATURES.eyeRY}
          fill="#fdfaf6"
          opacity={0.92}
        />
        <circle
          ref={rightPupil}
          cx={50 + FEATURES.eyeDX}
          cy={FEATURES.eyeY}
          r={FEATURES.pupilR}
          fill="#3a2a1c"
        />
        <circle cx={50 + FEATURES.eyeDX - 1} cy={FEATURES.eyeY - 1} r={0.9} fill="#fff" opacity={0.9} />
      </g>

      {/* Рот */}
      <path ref={mouth} fill="#a23b46" stroke="#7d2b34" strokeWidth={0.5} opacity={0.88} />
    </svg>
  );
}
