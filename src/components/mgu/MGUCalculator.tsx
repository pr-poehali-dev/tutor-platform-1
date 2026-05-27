import Icon from "@/components/ui/icon";
import { Faculty, QuickCompat, SUBJECT_LABELS } from "./types";

interface Props {
  faculties: Faculty[];
  selected: Faculty | null;
  scores: Record<string, number>;
  grade: string;
  weeks: number;
  loading: boolean;
  building: boolean;
  error: string | null;
  quickCompat: QuickCompat | null;
  onSelectFaculty: (f: Faculty) => void;
  onScoresChange: (scores: Record<string, number>) => void;
  onGradeChange: (g: string) => void;
  onWeeksChange: (w: number) => void;
  onCheckCompat: () => void;
  onBuildPlan: () => void;
}

export default function MGUCalculator({
  faculties,
  selected,
  scores,
  grade,
  weeks,
  loading,
  building,
  error,
  quickCompat,
  onSelectFaculty,
  onScoresChange,
  onGradeChange,
  onWeeksChange,
  onCheckCompat,
  onBuildPlan,
}: Props) {
  return (
    <div className="bg-card/70 border border-white/10 rounded-3xl p-6 mb-8">
      <h2 className="font-montserrat font-black text-2xl mb-1">Шаг 1. Выбери факультет МГУ</h2>
      <p className="text-white/55 text-sm mb-5">12 топ-факультетов с проходными баллами 2025 года</p>

      {loading ? (
        <div className="py-8 text-center text-white/45">
          <Icon name="Loader2" size={24} className="animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {faculties.map((f) => (
            <button
              key={f.faculty_code}
              onClick={() => onSelectFaculty(f)}
              className={`text-left p-3 rounded-2xl border transition-all ${
                selected?.faculty_code === f.faculty_code
                  ? "bg-blue-500/20 border-blue-500/50 scale-[1.02]"
                  : "bg-white/[0.03] border-white/8 hover:bg-white/[0.06]"
              }`}
            >
              <p className="text-white text-sm font-bold mb-0.5">{f.short_name}</p>
              <p className="text-white/55 text-[10px] leading-snug">{f.faculty_name.replace("Факультет ", "")}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-amber-300 text-[10px] font-bold">от {f.last_year_min_score} б.</span>
                <span className="text-white/45 text-[10px]">конкурс {f.competition_per_seat}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <div>
              <p className="text-cyan-300 text-[10px] uppercase tracking-wider font-bold mb-1">Выбрано</p>
              <h3 className="font-montserrat font-black text-white text-lg">{selected.faculty_name}</h3>
              <p className="text-white/60 text-sm">{selected.speciality}</p>
            </div>
            <div className="bg-amber-500/15 border border-amber-500/35 rounded-xl px-3 py-2 text-center">
              <p className="text-amber-300 text-2xl font-black">{selected.last_year_min_score}</p>
              <p className="text-amber-200/65 text-[10px] uppercase">мин. балл 2025</p>
            </div>
          </div>
          <p className="text-white/65 text-xs mb-3">{selected.description}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-blue-500/15 text-blue-200 border border-blue-500/30 px-2.5 py-1 rounded-lg">
              Бюджет: {selected.budget_seats} мест
            </span>
            <span className="bg-rose-500/15 text-rose-200 border border-rose-500/30 px-2.5 py-1 rounded-lg">
              Конкурс: {selected.competition_per_seat} чел/место
            </span>
            <span className="bg-violet-500/15 text-violet-200 border border-violet-500/30 px-2.5 py-1 rounded-lg">
              ДВИ: {SUBJECT_LABELS[selected.dvi_subject] || selected.dvi_subject}
            </span>
            <span className="bg-amber-500/15 text-amber-200 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              Олимпиады: до {selected.olympiad_level} уровня для БВИ
            </span>
          </div>
        </div>
      )}

      <h2 className="font-montserrat font-black text-2xl mb-1">Шаг 2. Введи свои текущие баллы</h2>
      <p className="text-white/55 text-sm mb-4">Если ещё не сдавал — оставь 0. Если делал пробник — введи результат.</p>

      {selected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {selected.ege_required.map((subj) => (
            <div key={subj}>
              <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1 block">
                {SUBJECT_LABELS[subj] || subj}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={scores[subj] || ""}
                onChange={(e) => onScoresChange({ ...scores, [subj]: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                placeholder="0-100"
                className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-blue-500/50"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1 block">Класс сейчас</label>
          <select value={grade} onChange={(e) => onGradeChange(e.target.value)} className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50">
            <option value="9" className="bg-background">9 класс</option>
            <option value="10" className="bg-background">10 класс</option>
            <option value="11" className="bg-background">11 класс</option>
          </select>
        </div>
        <div>
          <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1 block">Недель до ЕГЭ</label>
          <input
            type="number"
            value={weeks}
            onChange={(e) => onWeeksChange(Number(e.target.value) || 30)}
            className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onCheckCompat}
          disabled={!selected || building}
          className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-bold text-sm px-4 py-2.5 rounded-xl disabled:opacity-50"
        >
          <Icon name="Calculator" size={14} />
          Быстрая проверка шансов
        </button>
        <button
          onClick={onBuildPlan}
          disabled={!selected || building}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {building ? (
            <>
              <Icon name="Loader2" size={14} className="animate-spin" />
              ИИ-стратег строит план...
            </>
          ) : (
            <>
              <Icon name="Sparkles" size={14} />
              Построить персональный план поступления
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-rose-500/15 border border-rose-500/35 rounded-xl p-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {quickCompat && (
        <div className={`mt-4 rounded-2xl p-4 border ${
          quickCompat.is_safe ? "bg-emerald-500/10 border-emerald-500/30" :
          quickCompat.needs_olympiad ? "bg-amber-500/10 border-amber-500/30" :
          "bg-cyan-500/10 border-cyan-500/30"
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon name={quickCompat.is_safe ? "CheckCircle2" : quickCompat.needs_olympiad ? "Trophy" : "TrendingUp"}
              size={20}
              className={quickCompat.is_safe ? "text-emerald-300" : quickCompat.needs_olympiad ? "text-amber-300" : "text-cyan-300"} />
            <p className="font-montserrat font-black text-white">
              {quickCompat.is_safe ? "Поступаешь!" :
               quickCompat.needs_olympiad ? `Нужна олимпиада · разрыв ${quickCompat.gap_points} баллов` :
               `Можно подтянуть · разрыв ${quickCompat.gap_points} баллов`}
            </p>
          </div>
          <p className="text-white/75 text-sm">{quickCompat.recommendation}</p>
        </div>
      )}
    </div>
  );
}
