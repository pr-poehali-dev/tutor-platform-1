import Icon from "@/components/ui/icon";
import { MathText } from "@/lib/mathFormat";
import { ExpertTip } from "@/components/journey/journeyData";

const KIND: Record<ExpertTip["kind"], { label: string; icon: string; tone: string }> = {
  lifehack: { label: "Приём эксперта", icon: "Zap", tone: "border-cyan-400/25 bg-cyan-500/[0.07] text-cyan-200" },
  trap: { label: "Ловушка на экзамене", icon: "TriangleAlert", tone: "border-amber-400/25 bg-amber-500/[0.07] text-amber-200" },
  beyond: { label: "За пределами школы", icon: "Rocket", tone: "border-violet-400/25 bg-violet-500/[0.07] text-violet-200" },
};

/** «Фишки» эксперта: то, чего нет в школьном учебнике. */
export default function ExpertTips({ tips }: { tips?: ExpertTip[] }) {
  if (!tips?.length) return null;
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Фишки эксперта — этого нет в учебнике</p>
      <div className="grid gap-2.5">
        {tips.map((t, i) => {
          const k = KIND[t.kind];
          return (
            <div key={i} className={`rounded-2xl border p-4 text-left ${k.tone}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon name={k.icon} size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{k.label}</span>
                {t.title && <span className="text-white font-bold text-sm">· <MathText>{t.title}</MathText></span>}
              </div>
              <p className="text-white/80 text-sm leading-relaxed"><MathText>{t.text}</MathText></p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
