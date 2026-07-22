import { useEffect, useRef, useState } from "react";
import { tutorFor, TUTORS } from "./tutorMedia";

/**
 * «Говорящий» видео-аватар ведущего, синхронный с озвучкой урока.
 * Когда speaking=true — видео проигрывается (ведущий «говорит»),
 * иначе замирает на текущем кадре. Это не липсинк по словам, но создаёт
 * ощущение, что ведущий ведёт урок: двигается ровно во время речи.
 */
interface Props {
  /** Идёт ли сейчас озвучка (status === "playing"). */
  speaking: boolean;
  /** Число для выбора ведущего (напр. id курса). */
  seed?: number;
  photoIndex?: number;
  size?: number;
  className?: string;
  /** Круглая форма вместо скруглённого квадрата. */
  round?: boolean;
}

export default function SpeakingTutorAvatar({
  speaking,
  seed = 0,
  photoIndex,
  size = 52,
  className = "",
  round = false,
}: Props) {
  const tutor = photoIndex != null ? TUTORS[photoIndex % TUTORS.length] : tutorFor(seed);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const outer = round ? "rounded-full" : "rounded-2xl";
  const inner = round ? "rounded-full" : "rounded-[14px]";

  // Управляем воспроизведением по признаку речи.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || failed) return;
    if (speaking) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [speaking, failed]);

  return (
    <div
      className={`relative flex-shrink-0 ${outer} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Свечение активно только во время речи */}
      <div
        className={`absolute -inset-1 ${outer} bg-gradient-to-br from-purple-500/50 to-cyan-500/50 blur-md transition-opacity duration-300 ${
          speaking ? "opacity-100 animate-tutor-glow" : "opacity-0"
        }`}
      />
      <div className={`relative w-full h-full ${outer} p-[2px] bg-gradient-to-br from-purple-500 to-cyan-500`}>
        <div className={`relative w-full h-full ${inner} overflow-hidden bg-slate-800`}>
          {failed ? (
            <img
              src={tutor.photo}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
          ) : (
            <video
              ref={videoRef}
              src={tutor.video}
              poster={tutor.photo}
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setFailed(true)}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 18%" }}
            />
          )}
        </div>
      </div>
      {/* Индикатор речи */}
      {speaking && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-slate-900">
          <span className="flex items-end gap-[1.5px] h-2.5">
            <span className="w-0.5 bg-white rounded-full animate-sound-bar" style={{ height: "40%", animationDelay: "0ms" }} />
            <span className="w-0.5 bg-white rounded-full animate-sound-bar" style={{ height: "90%", animationDelay: "150ms" }} />
            <span className="w-0.5 bg-white rounded-full animate-sound-bar" style={{ height: "60%", animationDelay: "300ms" }} />
          </span>
        </span>
      )}
    </div>
  );
}