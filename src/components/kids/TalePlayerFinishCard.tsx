import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { LibraryItem } from "@/components/kids/libraryData";
import { AUTOPLAY_COUNTDOWN_SEC } from "@/components/kids/talePlayerUtils";

interface Props {
  finished: boolean;
  nextItem?: LibraryItem | null;
  countdown: number | null;
  onGoNextNow: () => void;
  onCancelAutoplay: () => void;
  onReset: () => void;
}

/** Плашки завершения произведения: с автопереходом или без следующего. */
export default function TalePlayerFinishCard({
  finished,
  nextItem,
  countdown,
  onGoNextNow,
  onCancelAutoplay,
  onReset,
}: Props) {
  if (!finished) return null;

  // ─── Плашка завершения и автоперехода ───
  if (nextItem) {
    return (
      <div className="mx-5 mt-4 rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 p-4 animate-fadeIn">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white flex-shrink-0">
            <Icon name="CheckCircle2" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-montserrat font-black text-white text-sm leading-tight mb-0.5">Произведение закончилось 👏</p>
            <p className="text-white/70 text-xs">
              Дальше:{" "}
              <span className="text-emerald-200 font-semibold">{nextItem.title}</span>
              <span className="text-white/45"> · {nextItem.author}</span>
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${nextItem.color} flex items-center justify-center text-2xl flex-shrink-0`}>
            {nextItem.emoji}
          </div>
        </div>

        {countdown !== null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Включаю через <span className="font-bold text-white tabular-nums">{countdown}</span> с</span>
              <span className="text-white/45">авто-переход</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-1000"
                style={{ width: `${((AUTOPLAY_COUNTDOWN_SEC - countdown) / AUTOPLAY_COUNTDOWN_SEC) * 100}%` }}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onGoNextNow}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-[1.01] text-white text-xs font-bold px-3 py-2 rounded-xl transition-transform"
              >
                <Icon name="Play" size={12} />
                Включить сейчас
              </button>
              <button
                onClick={onCancelAutoplay}
                className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 border border-white/15 text-white/85 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              >
                <Icon name="X" size={12} />
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onGoNextNow}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-[1.01] text-white text-xs font-bold px-3 py-2 rounded-xl transition-transform"
            >
              <Icon name="SkipForward" size={12} />
              Следующее произведение
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 border border-white/15 text-white/85 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Icon name="RotateCcw" size={12} />
              Заново
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Плашка финиша когда нет следующего ───
  return (
    <div className="mx-5 mt-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/12 to-pink-500/12 p-4 flex items-center gap-3 animate-fadeIn">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
        <Icon name="Sparkles" size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-montserrat font-black text-white text-sm">Это было последнее произведение в подборке!</p>
        <Link to="/kids/library" className="text-purple-200 hover:text-white text-xs underline underline-offset-2">
          Вернуться в библиотеку
        </Link>
      </div>
    </div>
  );
}
