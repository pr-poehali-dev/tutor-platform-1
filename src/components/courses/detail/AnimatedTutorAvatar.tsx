import { useEffect, useRef, useState } from "react";

/**
 * Живой аватар ведущего курса: фото с лёгкой «дыхательной» анимацией,
 * периодическим морганием (наложение-веко) и мягким свечением.
 * Без внешних библиотек — только CSS/Tailwind, работает быстро и надёжно.
 * Никакого лип-синка/дипфейков: это фото + деликатное оживление интерфейса.
 */

// Фотографии живых ведущих платформы.
const TUTOR_PHOTOS = [
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/a45182ec-b299-4806-b29c-8d76fcc32ccf.jpg", // Ведущая
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/8988d4b1-fa4c-45ca-a117-b7e4cd502e23.jpg", // Ведущий
];

interface Props {
  /** Число для стабильного выбора фото (например, id курса). */
  seed?: number;
  /** Явный индекс фото (0 — ведущая, 1 — ведущий). Приоритетнее seed. */
  photoIndex?: number;
  size?: number;
  alt?: string;
  className?: string;
}

export default function AnimatedTutorAvatar({
  seed = 0,
  photoIndex,
  size = 56,
  alt = "Ведущий курса",
  className = "",
}: Props) {
  const idx = photoIndex != null ? photoIndex % TUTOR_PHOTOS.length : seed % TUTOR_PHOTOS.length;
  const src = TUTOR_PHOTOS[idx];
  const [blink, setBlink] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Периодическое естественное моргание со случайной паузой.
  useEffect(() => {
    let cancelled = false;
    const loop = () => {
      const next = 2600 + Math.random() * 3200;
      timer.current = setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        setTimeout(() => !cancelled && setBlink(false), 150);
        loop();
      }, next);
    };
    loop();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      className={`relative flex-shrink-0 rounded-2xl ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Мягкое свечение под аватаром */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-purple-500/40 to-cyan-500/40 blur-md animate-tutor-glow" />
      {/* Кольцо-рамка */}
      <div className="relative w-full h-full rounded-2xl p-[2px] bg-gradient-to-br from-purple-500 to-cyan-500">
        <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-slate-800 animate-tutor-breathe">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 22%" }}
          />
          {/* Веко для моргания */}
          <div
            className="absolute inset-0 bg-black/85 origin-top transition-transform duration-150 ease-out"
            style={{ transform: blink ? "scaleY(1)" : "scaleY(0)" }}
          />
        </div>
      </div>
      {/* Индикатор «онлайн» */}
      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-tutor-pulse" />
    </div>
  );
}
