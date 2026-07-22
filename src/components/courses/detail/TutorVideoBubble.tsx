import { useState } from "react";
import { tutorFor } from "./tutorMedia";

/**
 * Компактный видео-кружок ведущего для карточек каталога.
 * Тихое зацикленное видео, постер-фото как фолбэк. Лёгкий, без лишних эффектов.
 */
interface Props {
  seed: number;
  size?: number;
  className?: string;
}

export default function TutorVideoBubble({ seed, size = 36, className = "" }: Props) {
  const tutor = tutorFor(seed);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-slate-800 ${className}`}
      style={{ width: size, height: size }}
    >
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
          src={tutor.video}
          poster={tutor.photo}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 18%" }}
        />
      )}
    </div>
  );
}
