import { KSUSHA_AVATAR } from "@/components/kids/poznavashka/poznavashkaData";

export type KsushaEmotion = "idle" | "thinking" | "happy" | "idea" | "sad" | "speaking";

const ANIM: Record<KsushaEmotion, string> = {
  idle: "animate-ksusha-idle",
  thinking: "animate-ksusha-think",
  happy: "animate-ksusha-happy",
  idea: "animate-ksusha-idea",
  sad: "animate-ksusha-sad",
  speaking: "animate-pulse",
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
}: {
  emotion?: KsushaEmotion;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "w-24 h-24" : size === "sm" ? "w-12 h-12" : "w-16 h-16";
  const badge = BADGE[emotion];

  return (
    <div className={`relative flex-shrink-0 ${dim}`}>
      <img
        src={KSUSHA_AVATAR}
        alt="Ксюша"
        className={`w-full h-full rounded-full border-4 object-cover shadow-lg shadow-amber-500/20 transition-all ${RING[emotion]} ${ANIM[emotion]}`}
      />
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
