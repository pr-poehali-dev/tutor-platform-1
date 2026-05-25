import Icon from "@/components/ui/icon";
import { LibraryItem } from "@/components/kids/libraryData";

interface AmbientApi {
  enabled: boolean;
  volume: number;
  toggle: () => void;
  setVolume: (v: number) => void;
}

interface Props {
  item: LibraryItem;
  nextItem?: LibraryItem | null;
  chunks: string[];
  currentChunk: number;
  playing: boolean;
  loading: boolean;
  speed: number;
  error: string | null;
  autoplayEnabled: boolean;
  totalProgress: number;
  ambient: AmbientApi;
  onSetAutoplayEnabled: (v: boolean) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSkipPrev: () => void;
  onSkipNext: () => void;
  onChangeSpeed: () => void;
}

/** Шапка плеера с аватаром-лисичкой + плашка управления с прогрессом, кнопками, музыкой. */
export default function TalePlayerControls({
  item,
  nextItem,
  chunks,
  currentChunk,
  playing,
  loading,
  speed,
  error,
  autoplayEnabled,
  totalProgress,
  ambient,
  onSetAutoplayEnabled,
  onTogglePlay,
  onReset,
  onSkipPrev,
  onSkipNext,
  onChangeSpeed,
}: Props) {
  return (
    <>
      {/* Шапка с аватаром-лисичкой */}
      <div className={`relative bg-gradient-to-br ${item.color} p-5 pb-12`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl ${playing ? "animate-pulse" : ""}`}>
              🦊
            </div>
            {playing && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                <Icon name="Volume2" size={10} className="text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold">Читает Лиса</p>
            <p className="font-montserrat font-black text-white text-base leading-tight">{item.title}</p>
            <p className="text-white/75 text-xs">{item.author}</p>
          </div>
        </div>
      </div>

      {/* Прогресс и плеер */}
      <div className="px-5 -mt-7">
        <div className="bg-background/90 backdrop-blur border border-white/15 rounded-2xl p-4 shadow-xl">
          {/* Прогресс-бар */}
          <div className="mb-3">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full bg-gradient-to-r ${item.color} transition-all duration-300`}
                style={{ width: `${totalProgress * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/55">
              <span>Фрагмент {Math.min(currentChunk + 1, chunks.length)} из {chunks.length}</span>
              <span>~ {item.durationMin} мин</span>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onReset}
              title="Сначала"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10 transition-colors"
            >
              <Icon name="RotateCcw" size={16} />
            </button>
            <button
              onClick={onSkipPrev}
              disabled={currentChunk === 0}
              title="Предыдущий фрагмент"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/85 hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <Icon name="SkipBack" size={18} />
            </button>
            <button
              onClick={onTogglePlay}
              disabled={loading}
              title={playing ? "Пауза" : "Слушать"}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-60`}
            >
              {loading ? (
                <Icon name="Loader2" size={22} className="animate-spin" />
              ) : playing ? (
                <Icon name="Pause" size={22} />
              ) : (
                <Icon name="Play" size={22} className="ml-0.5" />
              )}
            </button>
            <button
              onClick={onSkipNext}
              disabled={currentChunk >= chunks.length - 1}
              title="Следующий фрагмент"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/85 hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <Icon name="SkipForward" size={18} />
            </button>
            <button
              onClick={onChangeSpeed}
              title="Скорость"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10 text-xs font-bold tabular-nums transition-colors"
            >
              {speed.toFixed(2)}x
            </button>
          </div>

          {/* Фоновая музыка */}
          <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={ambient.toggle}
              title={ambient.enabled ? "Выключить фоновую музыку" : "Включить мягкую мелодию"}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                ambient.enabled
                  ? "bg-gradient-to-r from-purple-500/25 to-pink-500/25 border border-purple-500/40 text-white"
                  : "bg-white/5 border border-white/10 text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={ambient.enabled ? "Music" : "Music2"} size={12} />
              {ambient.enabled ? "Музыка играет" : "Фоновая музыка"}
              {ambient.enabled && (
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-0.5 h-2.5 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 h-3.5 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </button>
            {ambient.enabled && (
              <div className="flex items-center gap-2 flex-1 min-w-[160px] max-w-[260px]">
                <Icon name="Volume1" size={12} className="text-white/45 flex-shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={0.4}
                  step={0.01}
                  value={ambient.volume}
                  onChange={(e) => ambient.setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 accent-pink-400 cursor-pointer"
                  title="Громкость музыки"
                />
                <Icon name="Volume2" size={12} className="text-white/45 flex-shrink-0" />
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-rose-300 text-xs flex items-center gap-1.5">
              <Icon name="AlertCircle" size={12} />
              {error}
            </p>
          )}

          {/* Переключатель автоплея */}
          {nextItem && (
            <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoplayEnabled}
                  onChange={(e) => onSetAutoplayEnabled(e.target.checked)}
                  className="w-4 h-4 accent-pink-500 cursor-pointer"
                />
                <span className="text-white/75 text-xs">Автопереход к следующему</span>
              </label>
              <Icon name="ListMusic" size={14} className="text-white/35" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
