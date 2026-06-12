import { useEffect, useRef } from "react";
import type { KsushaEmotion } from "./KsushaAvatar";

/**
 * Ксюша — векторный маскот, нарисованный целиком кодом (SVG).
 *
 * В отличие от «глаз поверх фото», здесь живёт всё лицо как единое целое:
 * голова дышит и качается, глаза моргают и водят зрачками, рот открывается
 * синхронно с речью (липсинк), брови/веки/щёки и наклон головы выражают
 * эмоцию. Вся анимация — на одном requestAnimationFrame, без библиотек.
 *
 * Координаты в системе 0..200 (см. viewBox). Лицо строится вокруг центра.
 */

type Pose = {
  brow: number; // подъём бровей (минус — выше, плюс — нахмурены)
  browAngle: number; // наклон бровей (град), + внешний край вниз
  eyeOpen: number; // открытость глаз 0..1.25
  smile: number; // изгиб рта: + улыбка, − грусть
  mouthOpen: number; // базовое раскрытие рта в покое
  cheek: number; // румянец/приподнятые щёки 0..1
  headTilt: number; // наклон головы (град)
};

const POSES: Record<KsushaEmotion, Pose> = {
  idle: { brow: 0, browAngle: 0, eyeOpen: 1, smile: 0.55, mouthOpen: 0.05, cheek: 0.35, headTilt: 0 },
  speaking: { brow: -1, browAngle: -2, eyeOpen: 1.05, smile: 0.5, mouthOpen: 0.12, cheek: 0.45, headTilt: 0 },
  thinking: { brow: 2, browAngle: 7, eyeOpen: 0.82, smile: -0.05, mouthOpen: 0.04, cheek: 0.2, headTilt: -7 },
  idea: { brow: -4, browAngle: -5, eyeOpen: 1.25, smile: 0.95, mouthOpen: 0.18, cheek: 0.6, headTilt: 3 },
  happy: { brow: -3, browAngle: -4, eyeOpen: 0.85, smile: 1.2, mouthOpen: 0.12, cheek: 0.95, headTilt: 0 },
  sad: { brow: 1.5, browAngle: -9, eyeOpen: 0.72, smile: -1, mouthOpen: 0.03, cheek: 0.1, headTilt: 6 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Одноразовые жесты — короткие действия поверх эмоции.
export type KsushaGesture = "wink" | "nod";

export default function KsushaCharacter({
  emotion,
  mouthLevelRef,
  speaking,
  gesture,
}: {
  emotion: KsushaEmotion;
  mouthLevelRef?: React.MutableRefObject<number>;
  speaking: boolean;
  // Каждое новое значение (с уникальным id) проигрывает жест один раз
  gesture?: { type: KsushaGesture; id: number };
}) {
  const headRef = useRef<SVGGElement | null>(null);
  const lEye = useRef<SVGGElement | null>(null);
  const rEye = useRef<SVGGElement | null>(null);
  const lLid = useRef<SVGPathElement | null>(null);
  const rLid = useRef<SVGPathElement | null>(null);
  const lPupil = useRef<SVGGElement | null>(null);
  const rPupil = useRef<SVGGElement | null>(null);
  const lBrow = useRef<SVGPathElement | null>(null);
  const rBrow = useRef<SVGPathElement | null>(null);
  const mouth = useRef<SVGPathElement | null>(null);
  const tongue = useRef<SVGPathElement | null>(null);
  const lCheek = useRef<SVGEllipseElement | null>(null);
  const rCheek = useRef<SVGEllipseElement | null>(null);

  const emoRef = useRef<KsushaEmotion>(emotion);
  const spkRef = useRef<boolean>(speaking);
  emoRef.current = emotion;
  spkRef.current = speaking;

  // Очередь жеста: при смене id запускаем анимацию один раз
  const gestureReq = useRef<{ type: KsushaGesture; at: number } | null>(null);
  const lastGestureId = useRef<number>(-1);
  if (gesture && gesture.id !== lastGestureId.current) {
    lastGestureId.current = gesture.id;
    gestureReq.current = { type: gesture.type, at: performance.now() };
  }

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    // плавно интерполируемая поза
    const cur: Pose = { ...POSES.idle };

    // моргание
    let nextBlink = start + 1200 + Math.random() * 2200;
    let blinking = false;
    let blinkStart = 0;
    // взгляд
    let gx = 0, gy = 0, gtx = 0, gty = 0;
    let nextGaze = start + 700 + Math.random() * 1500;
    // рот
    let phase = 0;
    let mouthSmooth = 0;
    // лёгкое подпрыгивание при радости
    let bob = 0;
    // активный жест
    const gType: KsushaGesture | null = null;
    const gStart = 0;
    const G_DUR: Record<KsushaGesture, number> = { wink: 380, nod: 650 };

    const EYE_DX = 30;   // отступ глаза от центра
    const EYE_Y = 92;    // вертикаль глаз
    const MOUTH_Y = 132; // вертикаль рта

    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const P = POSES[emoRef.current];
      const k = 0.14;
      cur.brow = lerp(cur.brow, P.brow, k);
      cur.browAngle = lerp(cur.browAngle, P.browAngle, k);
      cur.eyeOpen = lerp(cur.eyeOpen, P.eyeOpen, k);
      cur.smile = lerp(cur.smile, P.smile, k);
      cur.cheek = lerp(cur.cheek, P.cheek, k);
      cur.headTilt = lerp(cur.headTilt, P.headTilt, k);

      // ── Запуск нового жеста ──
      const req = gestureReq.current;
      if (req) {
        gestureReq.current = null;
        gType = req.type;
        gStart = now;
      }
      // Прогресс жеста 0..1 (или -1, если жеста нет)
      let gP = -1;
      if (gType) {
        gP = (now - gStart) / G_DUR[gType];
        if (gP >= 1) { gType = null; gP = -1; }
      }

      // ── Голова: дыхание + покачивание + наклон эмоции + кивок ──
      const breathe = Math.sin(t * 1.6) * 1.6;
      const sway = Math.sin(t * 0.9) * 1.4;
      // подпрыгивание для happy/idea
      const wantBob = emoRef.current === "happy" || emoRef.current === "idea";
      bob = lerp(bob, wantBob ? 1 : 0, 0.12);
      const jump = wantBob ? Math.abs(Math.sin(t * 6)) * 5 * bob : 0;
      // кивок: голова опускается и возвращается (полтора качка)
      const nod = gType === "nod" ? Math.sin(gP * Math.PI * 1.5) * 9 : 0;
      if (headRef.current) {
        headRef.current.setAttribute(
          "transform",
          `translate(${sway} ${breathe - jump + nod}) rotate(${cur.headTilt} 100 100)`
        );
      }

      // ── Моргание ──
      let blink = 1;
      if (!blinking && now >= nextBlink) { blinking = true; blinkStart = now; }
      if (blinking) {
        const bt = (now - blinkStart) / 130;
        if (bt >= 1) {
          blinking = false;
          nextBlink = now + (Math.random() < 0.14 ? 170 : 1500 + Math.random() * 3200);
        } else {
          blink = Math.abs(Math.cos(bt * Math.PI));
        }
      }
      const open = Math.max(0.04, cur.eyeOpen * blink);

      // ── Подмигивание: закрывается только правый глаз ──
      // 0→1→0 за время жеста, плавно через синус
      const winkClose = gType === "wink" ? Math.sin(gP * Math.PI) : 0;
      const openL = open;
      const openR = Math.max(0.04, open * (1 - winkClose));

      // ── Взгляд ──
      if (now >= nextGaze) {
        const thinking = emoRef.current === "thinking";
        gtx = (Math.random() - 0.5) * 7;
        gty = thinking ? -4 - Math.random() * 3 : (Math.random() - 0.5) * 4;
        nextGaze = now + (thinking ? 1300 : 650) + Math.random() * 1700;
      }
      gx = lerp(gx, gtx, 0.18);
      gy = lerp(gy, gty, 0.18);

      // ── Веки (масштаб глаза по вертикали) ──
      if (lEye.current) lEye.current.setAttribute("transform", `translate(${100 - EYE_DX} ${EYE_Y}) scale(1 ${openL}) translate(${-(100 - EYE_DX)} ${-EYE_Y})`);
      if (rEye.current) rEye.current.setAttribute("transform", `translate(${100 + EYE_DX} ${EYE_Y}) scale(1 ${openR}) translate(${-(100 + EYE_DX)} ${-EYE_Y})`);

      // зрачки следуют за взглядом
      const pyd = gy * (open > 0.3 ? 1 : 0);
      if (lPupil.current) lPupil.current.setAttribute("transform", `translate(${gx} ${pyd})`);
      if (rPupil.current) rPupil.current.setAttribute("transform", `translate(${gx} ${pyd})`);

      // верхнее веко-«заслонка» при прищуре эмоции (sad/happy/thinking)
      const lidDrop = (1 - Math.min(1, cur.eyeOpen)) * 11; // насколько опущено веко
      const lidPath = (cx: number) =>
        `M ${cx - 15} ${EYE_Y - 13} Q ${cx} ${EYE_Y - 16 + lidDrop * 1.4} ${cx + 15} ${EYE_Y - 13} L ${cx + 15} ${EYE_Y - 17} L ${cx - 15} ${EYE_Y - 17} Z`;
      if (lLid.current) lLid.current.setAttribute("d", lidPath(100 - EYE_DX));
      if (rLid.current) rLid.current.setAttribute("d", lidPath(100 + EYE_DX));

      // ── Брови ──
      const by = 66 + cur.brow;
      const ba = cur.browAngle;
      const browPath = (cx: number, mirror: number) => {
        const inner = cx - 16 * mirror;
        const outer = cx + 16 * mirror;
        const yIn = by + ba * 0.5 * mirror * -1;
        const yOut = by + ba * 0.5 * mirror;
        const yMid = Math.min(yIn, yOut) - 4;
        return `M ${inner} ${yIn} Q ${cx} ${yMid} ${outer} ${yOut}`;
      };
      if (lBrow.current) lBrow.current.setAttribute("d", browPath(100 - EYE_DX, 1));
      if (rBrow.current) rBrow.current.setAttribute("d", browPath(100 + EYE_DX, -1));

      // ── Щёки ──
      const cheekOp = 0.25 + cur.cheek * 0.55;
      const cheekR = 9 + cur.cheek * 3;
      if (lCheek.current) { lCheek.current.setAttribute("opacity", String(cheekOp)); lCheek.current.setAttribute("rx", String(cheekR)); }
      if (rCheek.current) { rCheek.current.setAttribute("opacity", String(cheekOp)); rCheek.current.setAttribute("rx", String(cheekR)); }

      // ── Рот / липсинк ──
      let target = P.mouthOpen;
      if (spkRef.current) {
        const live = mouthLevelRef?.current ?? -1;
        if (live >= 0) {
          target = Math.min(1, P.mouthOpen + live * 1.25);
        } else {
          phase += 0.5;
          const a = (Math.sin(phase) + 1) / 2;
          const b = (Math.sin(phase * 1.8 + 1.1) + 1) / 2;
          target = P.mouthOpen + (a * 0.6 + b * 0.4) * 0.65;
        }
      }
      mouthSmooth = lerp(mouthSmooth, target, 0.4);

      if (mouth.current) {
        const cx = 100;
        const my = MOUTH_Y;
        const w = 22;
        const o = mouthSmooth * 20;          // высота раскрытия
        // улыбка/грусть + хитринка при подмигивании + тёплая улыбка при кивке
        const gestureSmile = winkClose * 4 + (gType === "nod" ? Math.sin(gP * Math.PI) * 3 : 0);
        const sm = cur.smile * 9 + gestureSmile;
        // углы рта поднимаются при улыбке
        const lx = cx - w, rx = cx + w;
        const cy = my - sm;
        const topY = cy - o * 0.35;
        const botY = cy + o * 0.85;
        const d =
          `M ${lx} ${my} ` +
          `Q ${cx} ${topY - sm * 0.4} ${rx} ${my} ` +
          `Q ${cx} ${botY} ${lx} ${my} Z`;
        mouth.current.setAttribute("d", d);
      }
      if (tongue.current) {
        const show = mouthSmooth > 0.25 ? Math.min(1, (mouthSmooth - 0.25) * 2) : 0;
        const cx = 100, my = MOUTH_Y + 4;
        const o = mouthSmooth * 20;
        tongue.current.setAttribute("opacity", String(show * 0.9));
        tongue.current.setAttribute(
          "d",
          `M ${cx - 11} ${my} Q ${cx} ${my + o * 0.7} ${cx + 11} ${my} Q ${cx} ${my + o * 0.35} ${cx - 11} ${my} Z`
        );
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mouthLevelRef]);

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id="ks-skin" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#ffe7d2" />
          <stop offset="100%" stopColor="#ffcfae" />
        </radialGradient>
        <linearGradient id="ks-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b5731f" />
          <stop offset="55%" stopColor="#9a5a18" />
          <stop offset="100%" stopColor="#7c4512" />
        </linearGradient>
        <linearGradient id="ks-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff4e0" />
          <stop offset="100%" stopColor="#ffe0c2" />
        </linearGradient>
        {/* Фирменный янтарно-оранжевый — одежда и бант */}
        <linearGradient id="ks-brand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {/* фон-кружок */}
      <circle cx="100" cy="100" r="100" fill="url(#ks-bg)" />

      {/* Одежда/плечи в фирменном цвете — не качается с головой */}
      <g>
        <path d="M48 200 C48 168 70 156 100 156 C130 156 152 168 152 200 Z" fill="url(#ks-brand)" />
        {/* воротник */}
        <path d="M88 158 L100 172 L112 158 L106 154 L100 162 L94 154 Z" fill="#fff" opacity="0.85" />
        {/* пуговка-звёздочка */}
        <circle cx="100" cy="184" r="4" fill="#fff" opacity="0.9" />
      </g>

      <g ref={headRef}>
        {/* задние волосы */}
        <path d="M40 96 C40 44 160 44 160 96 C170 120 168 150 150 168 C150 120 50 120 50 168 C32 150 30 120 40 96 Z" fill="url(#ks-hair)" />

        {/* шея */}
        <rect x="90" y="150" width="20" height="22" rx="9" fill="url(#ks-skin)" />

        {/* лицо */}
        <ellipse cx="100" cy="104" rx="52" ry="56" fill="url(#ks-skin)" />

        {/* ушки */}
        <circle cx="49" cy="108" r="9" fill="url(#ks-skin)" />
        <circle cx="151" cy="108" r="9" fill="url(#ks-skin)" />

        {/* чёлка */}
        <path d="M50 84 C58 50 142 50 150 84 C150 70 138 58 100 58 C62 58 50 70 50 84 Z" fill="url(#ks-hair)" />
        <path d="M52 86 C60 64 84 60 100 62 C90 70 74 74 64 92 C58 92 54 90 52 86 Z" fill="url(#ks-hair)" opacity="0.9" />
        <path d="M148 86 C140 64 116 60 100 62 C110 70 126 74 136 92 C142 92 146 90 148 86 Z" fill="url(#ks-hair)" opacity="0.9" />

        {/* бантик — фирменный янтарно-оранжевый */}
        <g>
          <path d="M138 60 l16 -9 0 18 z" fill="url(#ks-brand)" />
          <path d="M154 60 l16 -9 0 18 z" fill="url(#ks-brand)" />
          <circle cx="154" cy="60" r="5.5" fill="#fcd34d" />
        </g>

        {/* щёки */}
        <ellipse ref={lCheek} cx="70" cy="118" rx="10" ry="7" fill="#ff9b9b" opacity="0.5" />
        <ellipse ref={rCheek} cx="130" cy="118" rx="10" ry="7" fill="#ff9b9b" opacity="0.5" />

        {/* брови */}
        <path ref={lBrow} stroke="#7a4a22" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path ref={rBrow} stroke="#7a4a22" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* глаза */}
        <g ref={lEye}>
          <ellipse cx={70} cy={92} rx="13" ry="15" fill="#fff" />
          <g ref={lPupil}>
            <circle cx={70} cy={92} r="8.5" fill="#5b3a1e" />
            <circle cx={70} cy={92} r="4" fill="#1d1108" />
            <circle cx={73} cy={88} r="2.6" fill="#fff" />
          </g>
          <path ref={lLid} fill="url(#ks-skin)" />
        </g>
        <g ref={rEye}>
          <ellipse cx={130} cy={92} rx="13" ry="15" fill="#fff" />
          <g ref={rPupil}>
            <circle cx={130} cy={92} r="8.5" fill="#5b3a1e" />
            <circle cx={130} cy={92} r="4" fill="#1d1108" />
            <circle cx={133} cy={88} r="2.6" fill="#fff" />
          </g>
          <path ref={rLid} fill="url(#ks-skin)" />
        </g>

        {/* носик */}
        <path d="M97 112 Q100 117 103 112" stroke="#e09a76" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* рот + язык */}
        <path ref={tongue} fill="#ff7a8a" opacity="0" />
        <path ref={mouth} fill="#b23a47" stroke="#8c2c37" strokeWidth="1.5" />
      </g>
    </svg>
  );
}