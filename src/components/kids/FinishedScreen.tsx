import Icon from "@/components/ui/icon";
import { Activity } from "@/components/kids/kidsData";

interface Props {
  activity: Activity;
  sessionStars: number;
  onClose: () => void;
}

/** Финальный экран занятия: фейерверк, награды, кнопка возврата. */
export default function FinishedScreen({ activity, sessionStars, onClose }: Props) {
  return (
    <div className="p-8 text-center bg-gradient-to-br from-emerald-500/15 to-teal-500/15">
      <div className="text-7xl mb-3 animate-bounce">🎉</div>
      <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-2">Занятие пройдено!</h2>
      <p className="text-white/75 text-sm mb-5">Ты заработал звёзды:</p>
      <div className="flex items-center justify-center gap-2 mb-6">
        {[...Array(Math.min(sessionStars, 5))].map((_, i) => (
          <span key={i} className="text-4xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>⭐</span>
        ))}
        <span className="ml-2 font-montserrat font-black text-white text-3xl">+{sessionStars}</span>
      </div>
      {activity.benefits.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-left">
          <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-2">Что развили</p>
          <div className="flex flex-wrap gap-1.5">
            {activity.benefits.map((b) => (
              <span key={b} className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs font-medium px-2.5 py-1 rounded-full">
                <Icon name="Check" size={11} />
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={onClose}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.01] transition-transform"
      >
        <Icon name="Home" size={16} />
        Вернуться к занятиям
      </button>
    </div>
  );
}
