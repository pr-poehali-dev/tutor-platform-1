import KsushaCharacter from "./KsushaCharacter";

export type KsushaEmotion = "idle" | "thinking" | "happy" | "idea" | "sad" | "speaking";

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
}: {
  emotion?: KsushaEmotion;
  size?: "sm" | "md" | "lg";
  // Живой уровень речи 0..1 для синхронизации рта (из useKsushaVoice)
  mouthLevelRef?: React.MutableRefObject<number>;
}) {
  const dim =
    size === "lg" ? "w-24 h-24" : size === "sm" ? "w-12 h-12" : "w-16 h-16";
  const badge = BADGE[emotion];

  return (
    <div className={`relative flex-shrink-0 ${dim}`}>
      <div
        className={`relative w-full h-full rounded-full border-4 overflow-hidden bg-amber-50 shadow-lg shadow-amber-500/20 transition-all ${RING[emotion]}`}
      >
        <KsushaCharacter
          emotion={emotion}
          mouthLevelRef={mouthLevelRef}
          speaking={emotion === "speaking"}
        />
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