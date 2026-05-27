import Icon from "@/components/ui/icon";
import { Plan, SUBJECT_LABELS } from "./mguTrackTypes";

interface Props {
  plan: Plan;
}

export default function MGUTrackPlan({ plan }: Props) {
  return (
    <div className="space-y-6 mb-8">
      {/* Главное послание */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/25 rounded-3xl p-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="font-montserrat font-black text-2xl text-white">Твой план поступления</h2>
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
            <Icon name="Target" size={14} className={plan.confidence_score >= 70 ? "text-emerald-300" : plan.confidence_score >= 50 ? "text-amber-300" : "text-rose-300"} />
            <span className="text-white/80 text-xs">Уверенность плана:</span>
            <span className={`font-black text-lg ${plan.confidence_score >= 70 ? "text-emerald-300" : plan.confidence_score >= 50 ? "text-amber-300" : "text-rose-300"}`}>{plan.confidence_score}%</span>
          </div>
        </div>
        <p className="text-white/85 text-sm whitespace-pre-line">{plan.plan_summary}</p>
      </div>

      {/* Целевые баллы */}
      {plan.target_scores && Object.keys(plan.target_scores).length > 0 && (
        <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
          <h3 className="font-montserrat font-black text-lg mb-3">🎯 Целевые баллы ЕГЭ</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(plan.target_scores).map(([subj, score]) => (
              <div key={subj} className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 text-center">
                <p className="text-3xl font-montserrat font-black text-white">{score}</p>
                <p className="text-blue-200/65 text-xs uppercase tracking-wider font-bold">{SUBJECT_LABELS[subj] || subj}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Олимпиады */}
      {plan.olympiads_to_write && plan.olympiads_to_write.length > 0 && (
        <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
          <h3 className="font-montserrat font-black text-lg mb-3">🏆 Олимпиады для БВИ</h3>
          <div className="space-y-2">
            {plan.olympiads_to_write.map((o, i) => (
              <div key={i} className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/25 flex items-center justify-center text-amber-200 font-black flex-shrink-0">
                    {o.level}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{o.name} · {o.subject}</p>
                    <p className="text-white/65 text-xs mb-1">Дедлайн: {o.deadline}</p>
                    <p className="text-amber-200/85 text-xs">→ {o.what_gives}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Недельный план */}
      {plan.weekly_plan && plan.weekly_plan.length > 0 && (
        <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
          <h3 className="font-montserrat font-black text-lg mb-3">📅 Недельная дорожная карта</h3>
          <div className="space-y-2">
            {plan.weekly_plan.map((w, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                <p className="text-cyan-300 text-[10px] uppercase tracking-wider font-bold mb-1">Недели {w.week_range}</p>
                <p className="text-white text-sm font-bold mb-1">{w.focus}</p>
                {w.deliverables && w.deliverables.length > 0 && (
                  <ul className="text-white/65 text-xs space-y-0.5 list-disc list-inside">
                    {w.deliverables.map((d, j) => <li key={j}>{d}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ДВИ + Риски + Запасные вузы */}
      <div className="grid md:grid-cols-2 gap-3">
        {plan.dvi_strategy && (
          <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
            <h3 className="font-montserrat font-black text-sm mb-2 flex items-center gap-2">
              <Icon name="ScrollText" size={14} className="text-violet-300" />
              Подготовка к ДВИ
            </h3>
            <p className="text-white/75 text-xs">{plan.dvi_strategy}</p>
          </div>
        )}
        {plan.risks && plan.risks.length > 0 && (
          <div className="bg-rose-500/8 border border-rose-500/25 rounded-3xl p-5">
            <h3 className="font-montserrat font-black text-sm mb-2 flex items-center gap-2">
              <Icon name="AlertTriangle" size={14} className="text-rose-300" />
              Риски
            </h3>
            <ul className="text-white/75 text-xs space-y-1 list-disc list-inside">
              {plan.risks.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>

      {plan.fallback_universities && plan.fallback_universities.length > 0 && (
        <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
          <h3 className="font-montserrat font-black text-sm mb-3 flex items-center gap-2">
            <Icon name="GitBranch" size={14} className="text-cyan-300" />
            Запасные варианты вузов
          </h3>
          <div className="grid md:grid-cols-3 gap-2">
            {plan.fallback_universities.map((f, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                <p className="text-white font-bold text-sm">{f.name}</p>
                <p className="text-cyan-300 text-xs mb-1">{f.faculty}</p>
                <p className="text-white/55 text-xs">{f.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
