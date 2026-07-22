import Icon from "@/components/ui/icon";
import { EdTechSchool, HIRING_LABELS } from "./edtechSchoolsData";

interface Props {
  school: EdTechSchool;
}

export default function EdTechSchoolCard({ school }: Props) {
  const hiring = HIRING_LABELS[school.hiring];
  return (
    <div className="group relative flex flex-col bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/25 hover:-translate-y-0.5 transition-all">
      <div className={`h-1.5 bg-gradient-to-r ${school.color}`} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${school.color} flex items-center justify-center text-3xl flex-shrink-0`}
            aria-hidden="true"
          >
            {school.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-montserrat font-black text-white text-lg leading-snug">
              {school.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${hiring.tone}`}
              >
                <Icon name="BriefcaseBusiness" size={10} />
                {hiring.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                <Icon name={school.remote ? "Wifi" : "MapPin"} size={10} />
                {school.remote ? "Удалёнка" : "Офлайн / гибрид"}
              </span>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-xs leading-relaxed mb-3">{school.note}</p>

        <div className="mb-3">
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            Кого ищут
          </p>
          <div className="flex flex-wrap gap-1.5">
            {school.roles.map((r) => (
              <span
                key={r}
                className="text-[11px] text-cyan-200 bg-cyan-500/10 border border-cyan-500/25 rounded-lg px-2 py-1"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4 flex-1">
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            Направления
          </p>
          <div className="flex flex-wrap gap-1.5">
            {school.subjects.slice(0, 5).map((s) => (
              <span
                key={s}
                className="text-[11px] text-purple-200 bg-purple-500/10 border border-purple-500/25 rounded-lg px-2 py-1"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <a
            href={school.careersUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-3 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Смотреть вакансии
            <Icon name="ArrowUpRight" size={14} />
          </a>
          <a
            href={school.site}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Сайт ${school.name}`}
            title={`Сайт ${school.name}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Icon name="Globe" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
