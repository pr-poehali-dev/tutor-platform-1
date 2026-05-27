import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { fetchProfile, ExamProfile } from "./api";
import { buildAllTasks } from "./checklistTasks";
import ExamCountdown from "./ExamCountdown";

/** Компактный виджет «До ЕГЭ» для личного кабинета. */
export default function ExamChecklistWidget() {
  const [profile, setProfile] = useState<ExamProfile | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile()
      .then((res) => {
        if (res.profile) setProfile(res.profile);
        setDoneCount(res.tasks.filter((t) => t.done).length);
      })
      .finally(() => setLoading(false));
  }, []);

  const allTasks = useMemo(
    () => buildAllTasks(profile?.subjects || []),
    [profile],
  );

  if (loading) {
    return (
      <div className="rounded-3xl border border-rose-500/25 bg-gradient-to-br from-rose-500/8 to-amber-500/5 p-5 mb-6 flex items-center gap-3">
        <Icon name="Loader2" size={20} className="animate-spin text-rose-300" />
        <p className="text-white/55 text-sm">Загружаю чек-лист «До ЕГЭ»...</p>
      </div>
    );
  }

  // Профиль ещё не создан
  if (!profile || profile.subjects.length === 0) {
    return (
      <div className="rounded-3xl border border-rose-500/25 bg-gradient-to-br from-rose-500/12 to-amber-500/8 p-5 md:p-6 mb-6">
        <div className="flex items-start gap-4 mb-4 flex-wrap">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
            ⏰
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-montserrat font-black text-white text-lg md:text-xl mb-1">Чек-лист «До ЕГЭ»</h3>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed">
              Укажи, какие ЕГЭ ты сдаёшь — и мы соберём персональный план: документы, подготовка, дедлайны и психология.
            </p>
          </div>
        </div>
        <Link
          to="/exam-checklist"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-rose-500/25"
        >
          <Icon name="ListChecks" size={14} />
          Создать чек-лист
          <Icon name="ArrowRight" size={14} />
        </Link>
      </div>
    );
  }

  const total = allTasks.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div className="mb-6 space-y-3">
      <ExamCountdown subjects={profile.subjects} compact />

      <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/8 to-cyan-500/5 p-5">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon name="ListChecks" size={16} className="text-emerald-300" />
            <span className="text-emerald-300 text-[10px] uppercase tracking-wider font-bold">Чек-лист подготовки</span>
          </div>
          <Link
            to="/exam-checklist"
            className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 text-xs font-bold"
          >
            Подробно
            <Icon name="ArrowRight" size={12} />
          </Link>
        </div>
        <div className="flex items-end justify-between gap-2 mb-2 flex-wrap">
          <p className="font-montserrat font-black text-white text-base md:text-lg">
            {doneCount} из {total} задач выполнено
          </p>
          <p className="font-montserrat font-black text-emerald-300 text-2xl tabular-nums leading-none">{pct}%</p>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
