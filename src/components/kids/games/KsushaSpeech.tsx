import Icon from "@/components/ui/icon";
import KsushaAvatar, { KsushaEmotion } from "./KsushaAvatar";

export default function KsushaSpeech({
  text,
  size = "md",
  speaking = false,
  emotion,
  onReplay,
  mouthLevelRef,
}: {
  text: string;
  size?: "sm" | "md" | "lg";
  speaking?: boolean;
  emotion?: KsushaEmotion;
  onReplay?: () => void;
  // Живой уровень речи 0..1 для синхронизации губ (из useKsushaVoice)
  mouthLevelRef?: React.MutableRefObject<number>;
}) {
  // Если эмоция не задана явно — показываем «говорит» во время озвучки, иначе спокойствие
  const emo: KsushaEmotion = emotion ?? (speaking ? "speaking" : "idle");
  return (
    <div className="flex items-end gap-3">
      <KsushaAvatar emotion={emo} size={size} mouthLevelRef={mouthLevelRef} />
      <div className="relative bg-white text-slate-800 rounded-3xl rounded-bl-md px-5 py-3 pr-12 shadow-xl font-bold text-base md:text-lg leading-snug">
        {text}
        {onReplay && (
          <button
            onClick={onReplay}
            aria-label="Повторить голосом"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 flex items-center justify-center transition-colors"
          >
            <Icon name={speaking ? "Volume2" : "RotateCcw"} size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function SoundToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition-colors ${
        enabled
          ? "bg-amber-400/15 border-amber-400/40 text-amber-200 hover:bg-amber-400/25"
          : "bg-white/5 border-white/15 text-white/50 hover:bg-white/10"
      }`}
    >
      <Icon name={enabled ? "Volume2" : "VolumeX"} size={16} />
      {enabled ? "Голос включён" : "Голос выключен"}
    </button>
  );
}