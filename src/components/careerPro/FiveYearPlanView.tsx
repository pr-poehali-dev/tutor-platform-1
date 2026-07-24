import { useState } from "react";
import Icon from "@/components/ui/icon";
import { FiveYearPlan, Progress, toggleCheckpoint } from "./api";
import { useAuth } from "@/context/AuthContext";

interface Props {
  fiveYear: FiveYearPlan;
  initialProgress?: Progress;
  canSaveProgress?: boolean; // true, если план уже сохранён у пользователя
}

// Стабильный ключ контрольной точки (год + индекс).
const cpKey = (year: number, idx: number) => `y${year}_m${idx}`;

export default function FiveYearPlanView({ fiveYear, initialProgress, canSaveProgress }: Props) {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<Progress>(initialProgress || {});

  const allCheckpoints = fiveYear.years.flatMap((y) =>
    (y.milestones || []).map((_, i) => cpKey(y.year, i)),
  );
  const doneCount = allCheckpoints.filter((k) => progress[k]?.done).length;
  const total = allCheckpoints.length || 1;
  const pct = Math.round((doneCount / total) * 100);

  const toggle = async (key: string) => {
    const next = !progress[key]?.done;
    setProgress((p) => {
      const copy = { ...p };
      if (next) copy[key] = { done: true };
      else delete copy[key];
      return copy;
    });
    // Сохраняем на сервере только если план принадлежит вошедшему пользователю.
    if (isAuthenticated && canSaveProgress) {
      await toggleCheckpoint(key, next);
    }
  };

  return (
    <div className="rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-600/12 via-purple-600/8 to-cyan-500/10 p-6 md:p-8">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-200 bg-indigo-500/20 border border-indigo-400/30 rounded-lg px-3 py-1 mb-4">
        <Icon name="Milestone" size={13} /> Личный план успеха · 5 лет
      </div>

      {fiveYear.vision && (
        <div className="mb-5">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Icon name="Telescope" size={14} className="text-cyan-300" /> Ваш образ через 5 лет
          </div>
          <p className="text-white text-[15px] md:text-base leading-snug">{fiveYear.vision}</p>
        </div>
      )}

      {/* Прогресс-бар по контрольным точкам */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-white/55 mb-1.5">
          <span>Пройдено контрольных точек</span>
          <span className="text-white font-semibold">{doneCount} из {total}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Годы */}
      <div className="relative pl-7">
        <span className="absolute left-[10px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/60 via-purple-500/40 to-cyan-500/40" aria-hidden="true" />
        <div className="space-y-5">
          {fiveYear.years.map((y) => (
            <div key={y.year} className="relative">
              <span className="absolute -left-7 top-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 border-2 border-[#140f28] flex items-center justify-center text-[10px] font-black text-white">
                {y.year}
              </span>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                    Год {y.year}
                  </span>
                  <h4 className="font-bold text-white text-[15px]">{y.title}</h4>
                </div>
                {y.focus && <p className="text-white/55 text-xs mb-3">{y.focus}</p>}

                <div className="space-y-1.5 mb-3">
                  {(y.milestones || []).map((m, i) => {
                    const key = cpKey(y.year, i);
                    const done = !!progress[key]?.done;
                    return (
                      <button
                        key={i}
                        onClick={() => toggle(key)}
                        className="flex items-start gap-2.5 text-left w-full group"
                      >
                        <span
                          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            done ? "bg-emerald-500 border-emerald-500" : "border-white/25 group-hover:border-white/50"
                          }`}
                        >
                          {done && <Icon name="Check" size={13} className="text-white" />}
                        </span>
                        <span className={`text-sm ${done ? "text-white/45 line-through" : "text-white/80"}`}>
                          {m}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {y.metric && (
                  <div className="inline-flex items-center gap-1.5 text-xs bg-indigo-500/15 border border-indigo-400/25 rounded-lg px-2.5 py-1 text-indigo-100">
                    <Icon name="Target" size={13} className="text-cyan-300" />
                    <span className="text-white/50">Метрика:</span> {y.metric}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Система оценки прогресса */}
      {fiveYear.review_system?.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 font-bold text-white mb-2.5">
            <Icon name="ClipboardCheck" size={16} className="text-indigo-300" /> Как проверять прогресс
          </div>
          <ul className="space-y-1.5">
            {fiveYear.review_system.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                <Icon name="CircleDot" size={14} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-white/40 text-xs mt-4 flex items-center gap-1.5">
          <Icon name="Info" size={13} /> Войдите, чтобы сохранить план и отмечать прогресс в личном кабинете.
        </p>
      )}
    </div>
  );
}
