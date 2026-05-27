import Icon from "@/components/ui/icon";
import { getUniversity, SUBJECTS } from "./graduateData";

interface Props {
  universityId: string;
  onSelect: (facultyId: string) => void;
  onBack: () => void;
}

export default function StepFaculty({ universityId, onSelect, onBack }: Props) {
  const university = getUniversity(universityId);

  if (!university) {
    return (
      <div className="bg-card border border-white/10 rounded-3xl p-8 text-center">
        <div className="text-5xl mb-3">🔍</div>
        <p className="text-white/70 text-sm mb-4">Вуз не найден.</p>
        <button onClick={onBack} className="text-purple-300 hover:text-white text-sm underline">Вернуться назад</button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-white/55 hover:text-white text-sm mb-5 transition-colors"
      >
        <Icon name="ArrowLeft" size={14} />
        Изменить вуз
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 mb-3">
          <Icon name="BookOpen" size={12} className="text-purple-300" />
          <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Шаг 3 из 4</span>
        </div>
        <h1 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-2">
          Факультеты и направления — {university.shortName}
        </h1>
        <p className="text-white/55 text-xs md:text-sm mb-3 max-w-xl mx-auto">
          {university.fullName}, {university.city}
        </p>
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
          <span className="text-2xl">{university.emoji}</span>
          <span className="font-montserrat font-bold text-white text-sm">{university.shortName}</span>
          {university.isMilitary && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/35 text-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Icon name="Shield" size={9} />
              Военный
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {university.faculties.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className="w-full group bg-card border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 md:p-5 text-left hover:translate-y-[-1px] transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Icon name="BookOpen" size={18} className="text-purple-200" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-montserrat font-black text-white text-base md:text-lg leading-tight mb-1">{f.name}</p>
                <p className="text-white/60 text-xs md:text-sm">{f.specialty}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/35 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {f.exams.map((e) => {
                const s = SUBJECTS[e.subject];
                return (
                  <span key={e.subject} className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[11px] text-white/75">
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </span>
                );
              })}
            </div>

            <div className="flex items-center gap-4 text-[11px] text-white/45 flex-wrap">
              <span className="flex items-center gap-1">
                <Icon name="Target" size={11} className="text-amber-300" />
                Проходной {f.passingScore} б.
              </span>
              {f.budgetSeats !== undefined && (
                <span className="flex items-center gap-1">
                  <Icon name="Users" size={11} className="text-emerald-300" />
                  {f.budgetSeats} бюджет. мест
                </span>
              )}
              {f.hasAdditional && (
                <span className="flex items-center gap-1 text-rose-200">
                  <Icon name="AlertCircle" size={11} />
                  ДВИ / доп. испытание
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}