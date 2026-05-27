import Icon from "@/components/ui/icon";
import { REGIONS, UNIVERSITIES } from "./graduateData";

interface Props {
  onSelect: (regionId: string) => void;
}

export default function StepRegion({ onSelect }: Props) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 mb-3">
          <Icon name="MapPin" size={12} className="text-purple-300" />
          <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Шаг 1 из 4</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-2">Выбери регион</h2>
        <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
          В каком городе или регионе ты хочешь учиться? Это поможет нам подобрать вузы поблизости.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {REGIONS.map((r) => {
          const count = UNIVERSITIES.filter((u) => u.regionId === r.id).length;
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="group bg-card border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 text-left hover:translate-y-[-2px] transition-all"
            >
              <div className="text-3xl mb-2">{r.emoji}</div>
              <p className="font-montserrat font-black text-white text-sm md:text-base leading-tight mb-1">{r.name}</p>
              <p className="text-white/45 text-xs">
                {count} {count === 1 ? "вуз" : count < 5 ? "вуза" : "вузов"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
