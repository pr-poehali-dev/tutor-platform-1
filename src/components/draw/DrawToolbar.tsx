import Icon from "@/components/ui/icon";

interface Props {
  color: string;
  size: number;
  tool: "pencil" | "brush" | "marker" | "eraser";
  onColor: (c: string) => void;
  onSize: (s: number) => void;
  onTool: (t: "pencil" | "brush" | "marker" | "eraser") => void;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
}

const PALETTE = [
  "#1a1a1a", "#ef4444", "#f97316", "#facc15", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#92400e", "#fb923c", "#ffffff",
];

const SIZES = [2, 4, 8, 14, 22];

const TOOLS: { id: "pencil" | "brush" | "marker" | "eraser"; label: string; icon: string }[] = [
  { id: "pencil", label: "Карандаш", icon: "Pencil" },
  { id: "brush", label: "Кисть", icon: "Brush" },
  { id: "marker", label: "Маркер", icon: "Highlighter" },
  { id: "eraser", label: "Ластик", icon: "Eraser" },
];

export default function DrawToolbar({ color, size, tool, onColor, onSize, onTool, onUndo, onClear, onSave }: Props) {
  return (
    <div className="bg-card border border-white/10 rounded-3xl p-4 space-y-4">
      {/* Инструменты */}
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Инструмент</p>
        <div className="grid grid-cols-4 gap-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTool(t.id)}
              title={t.label}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all ${
                tool === t.id
                  ? "bg-gradient-to-br from-purple-500 to-cyan-500 border-white/30 text-white shadow-lg"
                  : "bg-white/5 border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={t.icon} size={18} />
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Цвета */}
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Цвет</p>
        <div className="grid grid-cols-6 gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => onColor(c)}
              title={c}
              className={`aspect-square rounded-xl border-2 transition-all hover:scale-110 ${
                color === c ? "border-white scale-110 shadow-lg" : "border-white/15"
              }`}
              style={{ background: c }}
            />
          ))}
          <label className="aspect-square rounded-xl border-2 border-white/15 hover:border-white cursor-pointer flex items-center justify-center bg-gradient-to-br from-rose-500 via-yellow-500 to-cyan-500 hover:scale-110 transition-all">
            <input
              type="color"
              value={color}
              onChange={(e) => onColor(e.target.value)}
              className="opacity-0 absolute w-1 h-1"
            />
            <Icon name="Pipette" size={14} className="text-white drop-shadow" />
          </label>
        </div>
      </div>

      {/* Толщина */}
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Толщина</p>
        <div className="flex items-center gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onSize(s)}
              title={`${s}px`}
              className={`flex-1 aspect-square rounded-xl border flex items-center justify-center transition-all ${
                size === s
                  ? "bg-white/15 border-white/35 scale-105"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <span className="rounded-full" style={{ width: s + 2, height: s + 2, background: color === "#ffffff" ? "#94a3b8" : color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Действия */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/8">
        <button
          onClick={onUndo}
          title="Отменить"
          className="inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/85 text-xs font-semibold py-2 rounded-xl transition-colors"
        >
          <Icon name="Undo2" size={13} />
          Отмена
        </button>
        <button
          onClick={onClear}
          title="Очистить холст"
          className="inline-flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 text-rose-200 text-xs font-semibold py-2 rounded-xl transition-colors"
        >
          <Icon name="Trash2" size={13} />
          Очистить
        </button>
        <button
          onClick={onSave}
          title="Сохранить рисунок"
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold py-2 rounded-xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="Save" size={13} />
          Сохранить
        </button>
      </div>
    </div>
  );
}
