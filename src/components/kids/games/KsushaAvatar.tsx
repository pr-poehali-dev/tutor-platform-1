import { KSUSHA_AVATAR } from "@/components/kids/poznavashka/poznavashkaData";
import KsushaFace from "./KsushaFace";

export type KsushaEmotion = "idle" | "thinking" | "happy" | "idea" | "sad" | "speaking";

// Движение всего тела/головы — поверх живой мимики лица
const ANIM: Record<KsushaEmotion, string> = {
  idle: "animate-ksusha-idle",
  thinking: "animate-ksusha-think",
  happy: "animate-ksusha-happy",
  idea: "animate-ksusha-idea",
  sad: "animate-ksusha-sad",
  speaking: "animate-ksusha-talk",
};

// Пузырёк-эмодзи над головой для наглядной эмоции
const BADGE: Partial<Record<KsushaEmotion, string>> = {
  thinking: "🤔",
  idea: "💡",
  happy: "🎉",
  sad: "😔",
};

const RING: Record<KsushaEmotion, string> = {
  idle: "border-amber-300/60",
  speaking: "border-amber-300 ring-4 ring-amber-300/40",
  thinking: "border-sky-300 ring-4 ring-sky-300/40",
  idea: "border-yellow-300 ring-4 ring-yellow-300/50",
  happy: "border-emerald-300 ring-4 ring-emerald-300/40",
  sad: "border-slate-300/60",
};

export default function KsushaAvatar({
  emotion = "idle",
  size = "md",
  mouthLevelRef,
  live = true,
}: {
  emotion?: KsushaEmotion;
  size?: "sm" | "md" | "lg";
  // Живой уровень речи 0..1 для синхронизации рта (из useKsushaVoice)
  mouthLevelRef?: React.MutableRefObject<number>;
  // Можно отключить живую мимику (например, для совсем мелких иконок)
  live?: boolean;
}) {
  const dim =
    size === "lg" ? "w-24 h-24" : size === "sm" ? "w-12 h-12" : "w-16 h-16";
  const badge = BADGE[emotion];
  // На крошечном размере мимика не видна — экономим кадры
  const showFace = live && size !== "sm";

  return (
    <div className={`relative flex-shrink-0 ${dim}`}>
      <div
        className={`relative w-full h-full rounded-full border-4 overflow-hidden shadow-lg shadow-amber-500/20 transition-all ${RING[emotion]} ${ANIM[emotion]}`}
      >
        <img src={KSUSHA_AVATAR} alt="Ксюша" className="w-full h-full object-cover" />
        {showFace && (
          <KsushaFace
            emotion={emotion}
            mouthLevelRef={mouthLevelRef}
            speaking={emotion === "speaking"}
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