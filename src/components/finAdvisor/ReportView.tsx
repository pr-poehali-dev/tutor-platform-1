import Icon from "@/components/ui/icon";
import { FinReport } from "./api";
import CoachJournal from "./CoachJournal";

interface Props {
  report: FinReport;
  price: number;
  onApply: () => void;
  onRestart: () => void;
}

// Цвет шкалы устойчивости по score.
function scoreColor(score: number): { ring: string; text: string; bar: string } {
  if (score >= 75) return { ring: "border-emerald-400/50", text: "text-emerald-300", bar: "from-emerald-500 to-teal-400" };
  if (score >= 55) return { ring: "border-cyan-400/50", text: "text-cyan-300", bar: "from-cyan-500 to-blue-400" };
  if (score >= 40) return { ring: "border-amber-400/50", text: "text-amber-300", bar: "from-amber-500 to-orange-400" };
  return { ring: "border-rose-400/50", text: "text-rose-300", bar: "from-rose-500 to-red-500" };
}

const metricStatus: Record<string, { icon: string; color: string }> = {
  good: { icon: "TrendingUp", color: "text-emerald-400" },
  warning: { icon: "TriangleAlert", color: "text-amber-400" },
  bad: { icon: "TrendingDown", color: "text-rose-400" },
};

const severityStyle: Record<string, { label: string; cls: string }> = {
  high: { label: "Высокий", cls: "text-rose-200 bg-rose-500/15 border-rose-400/30" },
  medium: { label: "Средний", cls: "text-amber-200 bg-amber-500/15 border-amber-400/30" },
  low: { label: "Низкий", cls: "text-white/60 bg-white/[0.05] border-white/15" },
};

const fitStyle: Record<string, { label: string; cls: string }> = {
  high: { label: "Хорошо подходит", cls: "text-emerald-200 bg-emerald-500/15 border-emerald-400/30" },
  medium: { label: "С оговорками", cls: "text-cyan-200 bg-cyan-500/15 border-cyan-400/30" },
  low: { label: "Не рекомендуется", cls: "text-rose-200 bg-rose-500/15 border-rose-400/30" },
};

export default function ReportView({ report, price, onApply, onRestart }: Props) {
  const v = report.verdict || { score: 50, level: "", summary: "" };
  const sc = scoreColor(v.score);
  const priceFmt = price.toLocaleString("ru-RU");

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-500/15 border border-emerald-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="FileCheck2" size={13} /> Финансовое заключение
        </span>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight">
          {report.report_title}
        </h2>
      </div>

      {/* Вердикт устойчивости */}
      <div className={`rounded-3xl border ${sc.ring} bg-white/[0.03] p-6 md:p-8`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className={`relative w-28 h-28 rounded-full border-4 ${sc.ring} flex flex-col items-center justify-center flex-shrink-0`}>
            <span className={`font-montserrat font-black text-4xl ${sc.text}`}>{v.score}</span>
            <span className="text-white/40 text-[10px]">из 100</span>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-white/45 text-xs uppercase tracking-wider mb-1">Устойчивость бизнеса</div>
            <div className={`font-montserrat font-black text-xl md:text-2xl mb-2 ${sc.text}`}>{v.level}</div>
            <p className="text-white/75 text-sm md:text-[15px] leading-snug">{v.summary}</p>
          </div>
        </div>
      </div>

      {/* Метрики */}
      {report.metrics_read?.length > 0 && (
        <Section icon="Calculator" title="Ключевые показатели">
          <div className="grid sm:grid-cols-2 gap-3">
            {report.metrics_read.map((m, i) => {
              const st = metricStatus[m.status] || metricStatus.warning;
              return (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60 text-xs">{m.name}</span>
                    <Icon name={st.icon} size={16} className={st.color} />
                  </div>
                  <div className="font-montserrat font-black text-white text-lg mb-1">{m.value}</div>
                  <p className="text-white/55 text-xs leading-snug">{m.comment}</p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Сильные стороны */}
      {report.strengths?.length > 0 && (
        <Section icon="ShieldCheck" title="Что работает в вашу пользу">
          <ul className="space-y-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
                <Icon name="Check" size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Риски */}
      {report.risks?.length > 0 && (
        <Section icon="TriangleAlert" title="Риски, о которых честно предупреждаем">
          <div className="space-y-3">
            {report.risks.map((r, i) => {
              const sev = severityStyle[r.severity] || severityStyle.medium;
              return (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="font-bold text-white text-[15px]">{r.title}</h4>
                    <span className={`flex-shrink-0 text-[11px] font-bold rounded-lg border px-2 py-0.5 ${sev.cls}`}>
                      {sev.label}
                    </span>
                  </div>
                  {r.why && <p className="text-white/60 text-sm mb-2">{r.why}</p>}
                  {r.fix && (
                    <div className="flex items-start gap-2 text-sm text-emerald-200/90 bg-emerald-500/[0.06] border border-emerald-400/15 rounded-lg px-3 py-2">
                      <Icon name="Wrench" size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{r.fix}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Скрытые возможности */}
      {report.hidden_opportunities?.length > 0 && (
        <Section icon="Gem" title="Скрытые возможности">
          <div className="grid sm:grid-cols-2 gap-3">
            {report.hidden_opportunities.map((o, i) => (
              <div key={i} className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/8 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon name="Sparkles" size={16} className="text-cyan-300" />
                  <h4 className="font-bold text-white text-[15px]">{o.title}</h4>
                </div>
                {o.impact && (
                  <span className="inline-block text-[11px] font-bold text-emerald-200 bg-emerald-500/15 rounded-lg px-2 py-0.5 mb-2">
                    {o.impact}
                  </span>
                )}
                {o.how && <p className="text-white/65 text-sm leading-snug">{o.how}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Варианты финансирования */}
      {report.financing_options?.length > 0 && (
        <Section icon="Landmark" title="Как привлечь деньги — и когда этого делать НЕ стоит">
          <div className="space-y-3">
            {report.financing_options.map((f, i) => {
              const fit = fitStyle[f.fit] || fitStyle.medium;
              return (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="font-bold text-white text-[15px]">{f.type}</h4>
                    <span className={`flex-shrink-0 text-[11px] font-bold rounded-lg border px-2 py-0.5 ${fit.cls}`}>
                      {fit.label}
                    </span>
                  </div>
                  {f.detail && <p className="text-white/70 text-sm mb-2">{f.detail}</p>}
                  {f.caution && (
                    <div className="flex items-start gap-2 text-sm text-amber-100/80 bg-amber-500/[0.06] border border-amber-400/15 rounded-lg px-3 py-2">
                      <Icon name="ShieldAlert" size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{f.caution}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* План действий */}
      {report.action_plan?.length > 0 && (
        <Section icon="ListChecks" title="Что делать в первую очередь">
          <div className="space-y-2.5">
            {report.action_plan.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-black flex items-center justify-center text-sm">
                  {s.priority}
                </span>
                <div className="min-w-0">
                  <div className="text-white font-semibold text-sm">{s.action}</div>
                  {s.result && (
                    <div className="text-white/50 text-xs mt-0.5 flex items-start gap-1.5">
                      <Icon name="ArrowRight" size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      {s.result}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Честный вывод */}
      {report.honest_take && (
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 md:p-7">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-xl">
              🎯
            </div>
            <div>
              <div className="font-montserrat font-black text-white text-lg mb-1.5">
                Честный вывод финдиректора
              </div>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">{report.honest_take}</p>
            </div>
          </div>
        </div>
      )}

      {/* Живой финансист */}
      <div>
        <h3 className="flex items-center gap-2 font-montserrat font-black text-lg text-white mb-3">
          <Icon name="MessagesSquare" size={18} className="text-emerald-300" /> Личный финансовый консультант
        </h3>
        <CoachJournal />
      </div>

      {/* Заявка на сопровождение */}
      <div className="rounded-3xl border border-emerald-500/30 bg-white/[0.03] p-6 md:p-8 text-center">
        <p className="text-white/60 text-sm mb-1">Персональное финансовое сопровождение</p>
        <div className="font-montserrat font-black text-4xl text-white mb-1">{priceFmt} ₽</div>
        <p className="text-white/45 text-xs mb-5">
          Живой разбор, план оздоровления и помощь с привлечением денег. Оплата после согласования.
        </p>
        <button
          onClick={onApply}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="Send" size={18} /> Оставить заявку на сопровождение
        </button>
        <button
          onClick={onRestart}
          className="mt-3 block mx-auto text-white/50 hover:text-white text-sm transition-colors"
        >
          <Icon name="RotateCcw" size={14} className="inline mr-1" /> Ввести другие показатели
        </button>
      </div>

      <p className="text-white/30 text-[11px] text-center">
        Анализ носит рекомендательный характер и не заменяет аудитора, налогового консультанта и юриста.
      </p>
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-montserrat font-black text-lg text-white mb-3">
        <Icon name={icon} size={18} className="text-emerald-300" /> {title}
      </h3>
      {children}
    </div>
  );
}
