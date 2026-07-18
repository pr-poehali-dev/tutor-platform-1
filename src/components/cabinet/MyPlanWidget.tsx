import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useUserProgress, SavedJourney } from "@/components/journey/useUserProgress";
import { SUBJECTS } from "@/components/journey/journeyData";

function subjectMeta(id: string) {
  const s = SUBJECTS.find((x) => x.id === id);
  return { name: s?.name ?? id, emoji: s?.emoji ?? "📚", accent: s?.accent ?? "#a855f7" };
}

/** Виджет «Мой план обучения» для личного кабинета. */
export default function MyPlanWidget() {
  const { user, savedJourneys, loadJourneys } = useUserProgress();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadJourneys(user.id).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, loadJourneys]);

  // Нет сохранённого ученика прогресса или планов ещё нет — зовём пройти тест.
  if (!loading && (!user || savedJourneys.length === 0)) {
    return (
      <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/12 to-cyan-500/8 p-5 md:p-6 mb-6">
        <div className="flex items-start gap-4 mb-4 flex-wrap">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
            🗺️
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-montserrat font-black text-white text-lg md:text-xl mb-1">Мой план обучения</h3>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed">
              Пройди тест у наставника — он найдёт пробелы и составит персональный план обучения именно под тебя.
            </p>
          </div>
        </div>
        <Link
          to="/tutor#journey"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/25"
        >
          <Icon name="ClipboardCheck" size={14} />
          Пройти тест и получить план
          <Icon name="ArrowRight" size={14} />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/8 to-cyan-500/5 p-5 mb-6 flex items-center gap-3">
        <Icon name="Loader2" size={20} className="animate-spin text-purple-300" />
        <p className="text-white/55 text-sm">Загружаю твой план обучения…</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="Route" size={16} className="text-purple-300" />
          <span className="text-purple-300 text-[10px] uppercase tracking-wider font-bold">Мой план обучения</span>
        </div>
        <Link to="/tutor#journey" className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 text-xs font-bold">
          Новый план
          <Icon name="Plus" size={12} />
        </Link>
      </div>

      <div className="space-y-3">
        {savedJourneys.map((j: SavedJourney) => {
          const meta = subjectMeta(j.subject);
          const total = j.program_data?.total_modules || j.program_data?.modules?.length || 0;
          const done = (j.completed_module_ids || []).length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          return (
            <Link
              key={j.id}
              to="/tutor#journey"
              className="group block rounded-3xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 p-5 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border shrink-0"
                  style={{ background: `${meta.accent}18`, borderColor: `${meta.accent}38` }}
                >
                  {meta.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold text-base leading-snug">
                    {j.program_data?.program_title || `${meta.name}: персональный план`}
                  </h3>
                  <p className="text-white/50 text-xs mt-0.5">
                    {meta.name} · уровень: {j.level_assessment}
                  </p>
                </div>
                {j.is_complete && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 shrink-0">
                    Пройден
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between gap-2 mb-2 flex-wrap">
                <p className="text-white/70 text-sm font-semibold">
                  {done} из {total} модулей
                </p>
                <p className="font-montserrat font-black text-purple-300 text-xl tabular-nums leading-none">{pct}%</p>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 text-cyan-300 text-sm font-bold group-hover:gap-2.5 transition-all">
                <Icon name="Play" size={14} />
                {j.is_complete ? "Повторить темы" : "Продолжить обучение"}
                <Icon name="ArrowRight" size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
