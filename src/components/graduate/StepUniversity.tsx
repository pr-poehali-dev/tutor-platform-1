import Icon from "@/components/ui/icon";
import { getRegion, getUniversitiesByRegion } from "./graduateData";

interface Props {
  regionId: string;
  onSelect: (universityId: string) => void;
  onBack: () => void;
}

export default function StepUniversity({ regionId, onSelect, onBack }: Props) {
  const region = getRegion(regionId);
  const universities = getUniversitiesByRegion(regionId);

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-white/55 hover:text-white text-sm mb-5 transition-colors"
      >
        <Icon name="ArrowLeft" size={14} />
        Изменить регион
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 mb-3">
          <Icon name="GraduationCap" size={12} className="text-purple-300" />
          <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Шаг 2 из 4</span>
        </div>
        <h1 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-2">
          Вузы региона «{region?.name}»
        </h1>
        <p className="text-white/60 text-sm md:text-base">
          {region?.emoji} {universities.length} учебных заведений · проходные баллы и бюджетные места
        </p>
      </div>

      {universities.length === 0 ? (
        <div className="bg-card border border-white/10 rounded-3xl p-8 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-white/70 text-sm">В этом регионе пока нет вузов в нашей базе. Попробуй другой регион.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {universities.map((u) => (
            <button
              key={u.id}
              onClick={() => onSelect(u.id)}
              className="group bg-card border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 text-left hover:translate-y-[-2px] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${u.color} flex items-center justify-center text-3xl flex-shrink-0`}>
                  {u.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-montserrat font-black text-white text-base leading-tight">{u.shortName}</p>
                    {u.isMilitary && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/35 text-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        <Icon name="Shield" size={9} />
                        Военный
                      </span>
                    )}
                  </div>
                  <p className="text-white/55 text-xs leading-snug mb-2 line-clamp-2">{u.fullName}</p>
                  <p className="text-white/40 text-[11px] flex items-center gap-1">
                    <Icon name="MapPin" size={10} />
                    {u.city} · {u.faculties.length} направлений
                  </p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-white/35 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}