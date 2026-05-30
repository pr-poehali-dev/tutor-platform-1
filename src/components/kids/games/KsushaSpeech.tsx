import Icon from "@/components/ui/icon";
import { KSUSHA_AVATAR } from "@/components/kids/poznavashka/poznavashkaData";

export default function KsushaSpeech({
  text,
  size = "md",
  speaking = false,
  onReplay,
}: {
  text: string;
  size?: "sm" | "md" | "lg";
  speaking?: boolean;
  onReplay?: () => void;
}) {
  const avatarSize =
    size === "lg" ? "w-24 h-24" : size === "sm" ? "w-12 h-12" : "w-16 h-16";
  return (
    <div className="flex items-end gap-3">
      <img
        src={KSUSHA_AVATAR}
        alt="Ксюша"
        className={`flex-shrink-0 rounded-full border-4 object-cover transition-all ${
          speaking
            ? "border-amber-300 ring-4 ring-amber-300/40 animate-pulse scale-105"
            : "border-amber-300/60"
        } shadow-lg shadow-amber-500/20 ${avatarSize}`}
      />
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
