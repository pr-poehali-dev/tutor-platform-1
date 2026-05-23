import Icon from "@/components/ui/icon";

interface Props {
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  onClose: () => void;
}

export default function NannyFoxHeader({ autoPlay, onToggleAutoPlay, onClose }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-pink-500/15 to-rose-500/15 rounded-t-3xl">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
          🦊
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-card" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-montserrat font-black text-white text-base leading-tight">Няня Лиса</p>
        <p className="text-white/60 text-[11px] flex items-center gap-1">
          ИИ-эксперт · ищет в интернете
          <Icon name="Globe" size={10} className="text-cyan-300" />
        </p>
      </div>
      <button
        onClick={onToggleAutoPlay}
        title={autoPlay ? "Отключить авто-озвучку" : "Включить авто-озвучку"}
        className={`p-2 rounded-xl transition-colors ${autoPlay ? "text-pink-300 bg-pink-500/15" : "text-white/40 hover:text-white hover:bg-white/8"}`}
      >
        <Icon name={autoPlay ? "Volume2" : "VolumeX"} size={16} />
      </button>
      <button
        onClick={onClose}
        className="p-2 rounded-xl text-white/55 hover:text-white hover:bg-white/8 transition-colors"
        aria-label="Закрыть"
      >
        <Icon name="X" size={18} />
      </button>
    </div>
  );
}