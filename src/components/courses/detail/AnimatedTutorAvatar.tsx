import { useRef, useState } from "react";
import { tutorFor, TUTORS } from "./tutorMedia";

/**
 * Живой видео-аватар ведущего курса: короткое говорящее видео проигрывается
 * тихо и зациклено (как живой аватар). Если видео недоступно — показываем
 * фото-постер. Без звука по умолчанию (autoplay-политика браузеров).
 */

interface Props {
  /** Число для стабильного выбора ведущего (например, id курса). */
  seed?: number;
  /** Явный индекс (0 — ведущая, 1 — ведущий). Приоритетнее seed. */
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
  const tutor = photoIndex != null ? TUTORS[photoIndex % TUTORS.length] : tutorFor(seed);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      className={`relative flex-shrink-0 rounded-2xl ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Мягкое свечение под аватаром */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-purple-500/40 to-cyan-500/40 blur-md animate-tutor-glow" />
      {/* Кольцо-рамка */}
      <div className="relative w-full h-full rounded-2xl p-[2px] bg-gradient-to-br from-purple-500 to-cyan-500">
        <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-slate-800">
          {videoFailed ? (
            <img
              src={tutor.photo}
              alt={alt}
              loading="lazy"
              className="w-full h-full object-cover animate-tutor-breathe"
              style={{ objectPosition: "center 22%" }}
            />
          ) : (
            <video
              ref={videoRef}
              src={tutor.video}
              poster={tutor.photo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={alt}
              onError={() => setVideoFailed(true)}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
          )}
        </div>
      </div>
      {/* Индикатор «онлайн» */}
      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-tutor-pulse" />
    </div>
  );
}
