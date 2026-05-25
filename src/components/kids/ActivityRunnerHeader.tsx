import Icon from "@/components/ui/icon";
import { Activity, ActivityArea } from "@/components/kids/kidsData";

interface Props {
  activity: Activity;
  area?: ActivityArea;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onClose: () => void;
  sceneIdx: number;
  totalScenes: number;
  sessionStars: number;
}

/** Шапка ActivityRunner: цветной заголовок + прогресс-бар + звёзды сессии. */
export default function ActivityRunnerHeader({
  activity,
  area,
  voiceEnabled,
  onToggleVoice,
  onClose,
  sceneIdx,
  totalScenes,
  sessionStars,
}: Props) {
  return (
    <>
      {/* Шапка */}
      <div className={`bg-gradient-to-br ${area?.color ?? "from-purple-500 to-pink-500"} p-4 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl">
          🦊
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold">{activity.typeLabel}</p>
          <p className="font-montserrat font-black text-white text-sm leading-tight truncate">{activity.title}</p>
        </div>
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? "Отключить голос" : "Включить голос"}
          className={`p-2 rounded-xl transition-colors ${voiceEnabled ? "text-white bg-white/15" : "text-white/55 hover:bg-white/10"}`}
        >
          <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={16} />
        </button>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="p-2 rounded-xl text-white/75 hover:text-white hover:bg-white/15 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      {/* Прогресс */}
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-3">
        <p className="text-white/55 text-xs tabular-nums">Шаг {sceneIdx + 1} / {totalScenes}</p>
        <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500"
            style={{ width: `${((sceneIdx + 1) / totalScenes) * 100}%` }}
          />
        </div>
        <p className="text-amber-300 text-xs font-bold inline-flex items-center gap-1">
          <span>⭐</span>
          {sessionStars}
        </p>
      </div>
    </>
  );
}
