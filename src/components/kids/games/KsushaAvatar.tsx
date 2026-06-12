import { useEffect, useRef } from "react";
import { KSUSHA_AVATAR } from "@/components/kids/poznavashka/poznavashkaData";

export type KsushaEmotion = "idle" | "thinking" | "happy" | "idea" | "sad" | "speaking";
// Одноразовые жесты — короткое тёплое движение картинки (кивок/«подмиг»-кивок)
export type KsushaGesture = "wink" | "nod";

// Пузырёк-эмодзи над головой для наглядной эмоции
const BADGE: Partial<Record<KsushaEmotion, string>> = {
  thinking: "🤔",
  idea: "💡",
  happy: "🎉",
  sad: "😔",
};

// Кольцо-свечение под эмоцию
const RING: Record<KsushaEmotion, string> = {
  idle: "border-amber-300/70 shadow-amber-500/20",
  speaking: "border-amber-300 ring-4 ring-amber-300/40 shadow-amber-400/40",
  thinking: "border-sky-300 ring-4 ring-sky-300/40 shadow-sky-400/30",
  idea: "border-yellow-300 ring-4 ring-yellow-300/50 shadow-yellow-400/40",
  happy: "border-emerald-300 ring-4 ring-emerald-300/40 shadow-emerald-400/40",
  sad: "border-slate-300/60 shadow-slate-500/20",
};

export default function KsushaAvatar({
  emotion = "idle",
  size = "md",
  mouthLevelRef,
  gesture,
  videoUrl,
}: {
  emotion?: KsushaEmotion;
  size?: "sm" | "md" | "lg";
  // Живой уровень речи 0..1 — даёт мягкую пульсацию при разговоре
  mouthLevelRef?: React.MutableRefObject<number>;
  // Одноразовый жест: короткий тёплый кивок картинки
  gesture?: { type: KsushaGesture; id: number };
  // Готовый «говорящий» ролик Ксюши (lip-sync). Если задан — играем видео
  videoUrl?: string;
}) {
  const dim =
    size === "lg" ? "w-24 h-24" : size === "sm" ? "w-12 h-12" : "w-16 h-16";
  const badge = BADGE[emotion];

  // ── Мягкая «живость» картинки на requestAnimationFrame ──
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const emoRef = useRef<KsushaEmotion>(emotion);
  emoRef.current = emotion;

  // Управление воспроизведением ролика: говорит — играем, молчит — на первом кадре
  const speaking = emotion === "speaking";
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    if (speaking) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [speaking, videoUrl]);

  // Очередь жеста (короткий кивок при смене id)
  const gReq = useRef<number>(0);
  const lastG = useRef<number>(-1);
  if (gesture && gesture.id !== lastG.current) {
    lastG.current = gesture.id;
    gReq.current = performance.now();
  }

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    let nodStart = 0;

    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const emo = emoRef.current;

      // дыхание + лёгкое покачивание (всегда)
      const breatheY = Math.sin(t * 1.7) * 1.2;
      const sway = Math.sin(t * 0.9) * 1.3;
      let scale = 1 + Math.sin(t * 1.7) * 0.012;
      let rot = sway * 0.4;
      let dy = breatheY;

      // эмоции
      if (emo === "thinking") {
        rot += -5;                       // задумчивый наклон
      } else if (emo === "sad") {
        rot += 4;
        dy += 2.5;                        // чуть «поникла»
      } else if (emo === "happy" || emo === "idea") {
        // радостное подпрыгивание
        dy -= Math.abs(Math.sin(t * 6)) * 5;
        scale += 0.03;
      } else if (emo === "speaking") {
        // мягкая пульсация в такт речи
        const lvl = mouthLevelRef?.current ?? 0;
        scale += lvl * 0.05;
        rot += Math.sin(t * 8) * 0.6;
      }

      // одноразовый кивок (жест)
      if (gReq.current) { nodStart = gReq.current; gReq.current = 0; }
      if (nodStart) {
        const p = (now - nodStart) / 600;
        if (p >= 1) nodStart = 0;
        else dy += Math.sin(p * Math.PI * 1.5) * 6;
      }

      if (imgRef.current) {
        imgRef.current.style.transform =
          `translateY(${dy}px) rotate(${rot}deg) scale(${scale})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mouthLevelRef]);

  return (
    <div className={`relative flex-shrink-0 ${dim}`}>
      <div
        className={`relative w-full h-full rounded-full border-4 overflow-hidden bg-amber-50 shadow-lg transition-all duration-300 ${RING[emotion]}`}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={KSUSHA_AVATAR}
            muted
            playsInline
            loop
            preload="auto"
            className="w-full h-full object-cover scale-[1.06] select-none"
          />
        ) : (
          <img
            ref={imgRef}
            src={KSUSHA_AVATAR}
            alt="Ксюша"
            draggable={false}
            className="w-full h-full object-cover scale-[1.06] will-change-transform select-none"
            style={{ transformOrigin: "center 60%" }}
          />
        )}
      </div>
      {badge && (
        <span
          key={emotion}
          className="absolute -top-2 -right-2 text-xl sm:text-2xl drop-shadow-md animate-scale-in select-none"
        >
          {badge}
        </span>
      )}
    </div>
  );
}