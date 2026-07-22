import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { tutorFor } from "./tutorMedia";

/**
 * Блок «Знакомство с ведущим»: полноразмерное говорящее видео ведущего.
 * Автозапуск тихо и зациклено; звук включается по клику (autoplay-политика).
 */

interface Props {
  /** id курса — для выбора ведущего (чередование). */
  seed: number;
  courseTitle?: string;
}

export default function TutorIntroVideo({ seed, courseTitle }: Props) {
  const tutor = tutorFor(seed);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    setMuted(next);
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/25 rounded-2xl p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Clapperboard" size={16} className="text-cyan-300" />
        <h3 className="font-montserrat font-black text-white text-sm md:text-base">
          Знакомство с ведущим
        </h3>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video">
        <video
          ref={videoRef}
          src={tutor.video}
          poster={tutor.photo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`Ведущий курса${courseTitle ? ` «${courseTitle}»` : ""}`}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />

        {/* Кнопка звука */}
        <button
          onClick={toggleSound}
          aria-label={muted ? "Включить звук" : "Выключить звук"}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/15 transition-colors"
        >
          <Icon name={muted ? "VolumeX" : "Volume2"} size={14} />
          {muted ? "Включить звук" : "Звук включён"}
        </button>
      </div>

      <p className="text-white/50 text-xs mt-3">
        Живой ведущий платформы расскажет о курсе. Нажмите «Включить звук», чтобы услышать.
      </p>
    </div>
  );
}
