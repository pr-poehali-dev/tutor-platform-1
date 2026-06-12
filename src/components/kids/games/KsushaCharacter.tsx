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
    // активный жест (объект, чтобы поля можно было менять в loop)
    const g: { type: KsushaGesture | null; start: number } = { type: null, start: 0 };
    const G_DUR: Record<KsushaGesture, number> = { wink: 380, nod: 650 };

    const EYE_DX = 30;   // отступ глаза от центра
    const EYE_Y = 94;    // вертикаль глаз
    const MOUTH_Y = 134; // вертикаль рта

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
        g.type = req.type;
        g.start = now;
      }
      // Прогресс жеста 0..1 (или -1, если жеста нет)
      let gP = -1;
      if (g.type) {
        gP = (now - g.start) / G_DUR[g.type];
        if (gP >= 1) { g.type = null; gP = -1; }
      }

      // ── Голова: дыхание + покачивание + наклон эмоции + кивок ──
      const breathe = Math.sin(t * 1.6) * 1.6;
      const sway = Math.sin(t * 0.9) * 1.4;
      // подпрыгивание для happy/idea
      const wantBob = emoRef.current === "happy" || emoRef.current === "idea";
      bob = lerp(bob, wantBob ? 1 : 0, 0.12);
      const jump = wantBob ? Math.abs(Math.sin(t * 6)) * 5 * bob : 0;
      // кивок: голова опускается и возвращается (полтора качка)
      const nod = g.type === "nod" ? Math.sin(gP * Math.PI * 1.5) * 9 : 0;
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
      const winkClose = g.type === "wink" ? Math.sin(gP * Math.PI) : 0;
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
        const gestureSmile = winkClose * 4 + (g.type === "nod" ? Math.sin(gP * Math.PI) * 3 : 0);
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
          <stop offset="100%" stopColor="#ffcdac" />
        </radialGradient>
        <linearGradient id="ks-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d68f3e" />
          <stop offset="55%" stopColor="#b9762a" />
          <stop offset="100%" stopColor="#9a5e1d" />
        </linearGradient>
        {/* Платок — красный с тёплым оттенком */}
        <linearGradient id="ks-scarf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8463f" />
          <stop offset="100%" stopColor="#c9302b" />
        </linearGradient>
        {/* Сарафан — фирменный сине-голубой */}
        <linearGradient id="ks-dress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f6fb5" />
          <stop offset="100%" stopColor="#2f5896" />
        </linearGradient>
        <radialGradient id="ks-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#eaf7ec" />
          <stop offset="60%" stopColor="#cdeccf" />
          <stop offset="100%" stopColor="#a9dcae" />
        </radialGradient>
      </defs>

      {/* фон-кружок: солнечная лесная полянка */}
      <circle cx="100" cy="100" r="100" fill="url(#ks-bg)" />
      {/* стволы берёзок намёком */}
      <g opacity="0.35">
        <rect x="22" y="40" width="9" height="120" rx="4" fill="#fdfdfd" />
        <rect x="168" y="46" width="9" height="120" rx="4" fill="#fdfdfd" />
        <rect x="24" y="62" width="5" height="3" rx="1" fill="#7a7a7a" />
        <rect x="170" y="80" width="5" height="3" rx="1" fill="#7a7a7a" />
      </g>
      {/* цветочки на полянке */}
      <g opacity="0.85">
        <circle cx="40" cy="172" r="3" fill="#ffd24d" />
        <circle cx="160" cy="176" r="3" fill="#ff7aa8" />
        <circle cx="150" cy="160" r="2.5" fill="#fff" stroke="#ffd24d" strokeWidth="1" />
      </g>

      {/* Сарафан/плечи в народном стиле — не качается с головой */}
      <g>
        <path d="M44 200 C44 166 70 152 100 152 C130 152 156 166 156 200 Z" fill="url(#ks-dress)" />
        {/* белая рубаха-вышиванка под сарафаном */}
        <path d="M70 200 C70 168 130 168 130 200 Z" fill="#fbf6ec" />
        {/* красная узорная кайма по подолу */}
        <path d="M48 196 L152 196 L150 200 L50 200 Z" fill="#cf3a33" />
        <g fill="#ffd24d">
          <circle cx="64" cy="198" r="1.4" /><circle cx="80" cy="198" r="1.4" />
          <circle cx="100" cy="198" r="1.4" /><circle cx="120" cy="198" r="1.4" />
          <circle cx="136" cy="198" r="1.4" />
        </g>
        {/* бретели сарафана */}
        <path d="M82 156 L86 178" stroke="#2f5896" strokeWidth="7" strokeLinecap="round" />
        <path d="M118 156 L114 178" stroke="#2f5896" strokeWidth="7" strokeLinecap="round" />
      </g>

      <g ref={headRef}>
        {/* косичка слева с бантиком */}
        <g>
          <path d="M58 116 C44 130 42 150 50 168" stroke="url(#ks-hair)" strokeWidth="13" strokeLinecap="round" fill="none" />
          <path d="M50 168 l-6 8 12 0 z" fill="#e8463f" />
          <path d="M50 168 l-8 4 4 10 z" fill="#e8463f" />
          <circle cx="50" cy="169" r="3" fill="#ff7a73" />
        </g>
        {/* косичка справа с бантиком */}
        <g>
          <path d="M142 116 C156 130 158 150 150 168" stroke="url(#ks-hair)" strokeWidth="13" strokeLinecap="round" fill="none" />
          <path d="M150 168 l6 8 -12 0 z" fill="#e8463f" />
          <path d="M150 168 l8 4 -4 10 z" fill="#e8463f" />
          <circle cx="150" cy="169" r="3" fill="#ff7a73" />
        </g>

        {/* шея */}
        <rect x="90" y="150" width="20" height="20" rx="9" fill="url(#ks-skin)" />

        {/* лицо */}
        <ellipse cx="100" cy="106" rx="50" ry="53" fill="url(#ks-skin)" />

        {/* ушки */}
        <circle cx="51" cy="110" r="8" fill="url(#ks-skin)" />
        <circle cx="149" cy="110" r="8" fill="url(#ks-skin)" />

        {/* чёлка-волосы, выглядывающая из-под платка */}
        <path d="M54 92 C58 74 80 66 100 66 C120 66 142 74 146 92 C140 80 120 76 100 76 C80 76 60 80 54 92 Z" fill="url(#ks-hair)" />
        <path d="M56 96 C58 84 70 80 80 82 C72 88 66 94 64 102 C60 102 57 100 56 96 Z" fill="url(#ks-hair)" opacity="0.95" />
        <path d="M144 96 C142 84 130 80 120 82 C128 88 134 94 136 102 C140 102 143 100 144 96 Z" fill="url(#ks-hair)" opacity="0.95" />

        {/* ПЛАТОК на голове */}
        <g>
          {/* основная часть платка */}
          <path d="M42 96 C42 48 158 48 158 96 C158 74 140 58 100 58 C60 58 42 74 42 96 Z" fill="url(#ks-scarf)" />
          {/* боковые края платка, обрамляющие лицо */}
          <path d="M42 94 C40 112 44 130 52 142 C50 120 48 104 52 92 Z" fill="url(#ks-scarf)" />
          <path d="M158 94 C160 112 156 130 148 142 C150 120 152 104 148 92 Z" fill="url(#ks-scarf)" />
          {/* узелок под подбородком */}
          <path d="M88 150 C92 160 108 160 112 150 C108 156 92 156 88 150 Z" fill="url(#ks-scarf)" />
          <path d="M90 152 l-8 10 10 -2 z" fill="#d4352e" />
          <path d="M110 152 l8 10 -10 -2 z" fill="#d4352e" />
          {/* белый горошек и цветочки на платке */}
          <g fill="#ffffff" opacity="0.92">
            <circle cx="70" cy="80" r="2" /><circle cx="100" cy="72" r="2" />
            <circle cx="130" cy="80" r="2" /><circle cx="56" cy="100" r="1.8" />
            <circle cx="144" cy="100" r="1.8" />
          </g>
          {/* цветочный узор */}
          <g>
            <circle cx="84" cy="76" r="3.4" fill="#ffd24d" />
            <circle cx="116" cy="76" r="3.4" fill="#ffd24d" />
            <circle cx="100" cy="64" r="3" fill="#fff" stroke="#ffd24d" strokeWidth="1" />
            <circle cx="84" cy="76" r="1.2" fill="#e8463f" />
            <circle cx="116" cy="76" r="1.2" fill="#e8463f" />
          </g>
        </g>

        {/* щёки */}
        <ellipse ref={lCheek} cx="70" cy="120" rx="10" ry="7" fill="#ff9b9b" opacity="0.5" />
        <ellipse ref={rCheek} cx="130" cy="120" rx="10" ry="7" fill="#ff9b9b" opacity="0.5" />
        {/* веснушки */}
        <g fill="#e0916a" opacity="0.5">
          <circle cx="66" cy="116" r="1" /><circle cx="72" cy="119" r="1" /><circle cx="63" cy="120" r="0.9" />
          <circle cx="134" cy="116" r="1" /><circle cx="128" cy="119" r="1" /><circle cx="137" cy="120" r="0.9" />
        </g>

        {/* брови */}
        <path ref={lBrow} stroke="#9a5e1d" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path ref={rBrow} stroke="#9a5e1d" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* глаза — большие, тёплые карие */}
        <g ref={lEye}>
          <ellipse cx={70} cy={94} rx="13.5" ry="16" fill="#fff" />
          <g ref={lPupil}>
            <circle cx={70} cy={94} r="9.5" fill="#7a4a1e" />
            <circle cx={70} cy={94} r="5" fill="#3a230f" />
            <circle cx={73} cy={90} r="3" fill="#fff" />
            <circle cx={67} cy={97} r="1.4" fill="#fff" opacity="0.7" />
          </g>
          <path ref={lLid} fill="url(#ks-skin)" />
        </g>
        <g ref={rEye}>
          <ellipse cx={130} cy={94} rx="13.5" ry="16" fill="#fff" />
          <g ref={rPupil}>
            <circle cx={130} cy={94} r="9.5" fill="#7a4a1e" />
            <circle cx={130} cy={94} r="5" fill="#3a230f" />
            <circle cx={133} cy={90} r="3" fill="#fff" />
            <circle cx={127} cy={97} r="1.4" fill="#fff" opacity="0.7" />
          </g>
          <path ref={rLid} fill="url(#ks-skin)" />
        </g>

        {/* носик-пуговка */}
        <path d="M96 114 Q100 119 104 114" stroke="#e0916a" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* рот + язык */}
        <path ref={tongue} fill="#ff7a8a" opacity="0" />
        <path ref={mouth} fill="#c14552" stroke="#9a3340" strokeWidth="1.5" />
      </g>
    </svg>
  );
}