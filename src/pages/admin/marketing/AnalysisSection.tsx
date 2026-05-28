import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Analysis, num, EFFORT_LABEL } from "./types";

interface Props {
  analysis: Analysis;
  onSendIdea: (title: string, description: string, priority: string) => void;
}

export default function AnalysisSection({ analysis, onSendIdea }: Props) {
  return (
    <>
      {/* Узкое место воронки */}
      {analysis.funnel.bottleneck && (
        <Card className="border border-rose-400/30 bg-rose-500/[0.06] p-4 mb-6 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center flex-shrink-0">
            <Icon name="AlertTriangle" size={18} className="text-rose-300" />
          </div>
          <div className="flex-1">
            <div className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">Узкое место воронки</div>
            <p className="text-white text-sm">
              На переходе <b>«{analysis.funnel.bottleneck.from}» → «{analysis.funnel.bottleneck.to}»</b> теряется{" "}
              <b className="text-rose-300">{analysis.funnel.bottleneck.drop_pct}%</b> ({analysis.funnel.bottleneck.lost} чел.)
            </p>
          </div>
        </Card>
      )}

      {/* SWOT */}
      <h2 className="font-montserrat text-lg font-bold text-white/85 mb-3 flex items-center gap-2">
        <Icon name="LayoutGrid" size={18} className="text-cyan-300" />
        SWOT-анализ
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <SwotBox title="Сильные стороны" icon="ThumbsUp" color="emerald" items={analysis.swot.strengths} />
        <SwotBox title="Слабые стороны" icon="ThumbsDown" color="rose" items={analysis.swot.weaknesses} />
        <SwotBox title="Возможности" icon="Sparkles" color="cyan" items={analysis.swot.opportunities} />
        <SwotBox title="Угрозы" icon="AlertOctagon" color="amber" items={analysis.swot.threats} />
      </div>

      {/* Сегменты клиентов */}
      <h2 className="font-montserrat text-lg font-bold text-white/85 mb-3 flex items-center gap-2">
        <Icon name="Users" size={18} className="text-purple-300" />
        Сегменты клиентов (RFM)
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {Object.entries(analysis.rfm).map(([code, s]) => (
          <Card key={code} className="border border-white/10 bg-white/[0.03] p-4">
            <div className="text-white/55 text-xs mb-1">{s.label}</div>
            <div className="font-montserrat font-black text-2xl text-white mb-1">{num(s.count)}</div>
            <div className="text-white/45 text-xs leading-snug">{s.hint}</div>
          </Card>
        ))}
      </div>

      {/* Когорты */}
      {analysis.cohorts.cohorts.length > 0 && (
        <>
          <h2 className="font-montserrat text-lg font-bold text-white/85 mb-3 flex items-center gap-2">
            <Icon name="Calendar" size={18} className="text-emerald-300" />
            Когорты по неделям
            <span className="text-white/40 text-sm font-normal ml-2">Средний retention {analysis.cohorts.avg_retention_pct}%</span>
          </h2>
          <Card className="border border-white/10 bg-white/[0.03] p-4 mb-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/45 text-xs uppercase tracking-wider border-b border-white/8">
                  <th className="text-left py-2 font-semibold">Неделя</th>
                  <th className="text-right py-2 font-semibold">Регистраций</th>
                  <th className="text-right py-2 font-semibold">Вернулись</th>
                  <th className="text-right py-2 font-semibold">Retention</th>
                  <th className="text-right py-2 font-semibold">Купили</th>
                  <th className="text-right py-2 font-semibold">Конверсия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analysis.cohorts.cohorts.map((c) => (
                  <tr key={c.week_start}>
                    <td className="py-2 text-white/70">{c.week_start}</td>
                    <td className="py-2 text-right text-white">{c.size}</td>
                    <td className="py-2 text-right text-white/70">{c.returned}</td>
                    <td className="py-2 text-right font-bold text-cyan-300">{c.retention_pct}%</td>
                    <td className="py-2 text-right text-white/70">{c.bought}</td>
                    <td className="py-2 text-right font-bold text-emerald-300">{c.conv_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* Идеи роста */}
      {analysis.ideas.length > 0 && (
        <>
          <h2 className="font-montserrat text-lg font-bold text-white/85 mb-3 flex items-center gap-2">
            <Icon name="Lightbulb" size={18} className="text-amber-300" />
            Идеи роста выручки
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {analysis.ideas.map((idea, i) => (
              <Card key={i} className="border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold text-white text-sm">{idea.title}</div>
                  <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${
                    idea.priority === 1 ? "border-rose-400/30 text-rose-200 bg-rose-500/10" : "border-white/15 text-white/55"
                  }`}>
                    {idea.priority === 1 ? "Топ" : `#${idea.priority}`}
                  </Badge>
                </div>
                <div className="text-white/65 text-xs mb-2 leading-relaxed">{idea.description}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/45">Усилия: {EFFORT_LABEL[idea.effort]}</span>
                  <span className="text-emerald-300 font-bold">{idea.impact}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-purple-400/25 text-purple-200 hover:bg-purple-500/10"
                  onClick={() => onSendIdea(idea.title, idea.description, idea.priority === 1 ? "high" : "medium")}
                >
                  <Icon name="Send" size={12} className="mr-1" /> В задачи продаж
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* План на месяц */}
      <h2 className="font-montserrat text-lg font-bold text-white/85 mb-3 flex items-center gap-2">
        <Icon name="CalendarDays" size={18} className="text-fuchsia-300" />
        План на 4 недели
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        {(["week1", "week2", "week3", "week4"] as const).map((wk, i) => (
          <Card key={wk} className="border border-white/10 bg-white/[0.03] p-4">
            <div className="text-white/45 text-xs uppercase tracking-wider font-bold mb-2">Неделя {i + 1}</div>
            <ul className="space-y-1.5">
              {analysis.plan[wk].map((t, j) => (
                <li key={j} className="text-white/85 text-sm flex items-start gap-1.5">
                  <Icon name="Check" size={12} className="text-emerald-400 mt-1 flex-shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}

function SwotBox({ title, icon, color, items }: { title: string; icon: string; color: string; items: string[] }) {
  const colorMap: Record<string, string> = {
    emerald: "border-emerald-400/25 bg-emerald-500/[0.05] text-emerald-200",
    rose:    "border-rose-400/25 bg-rose-500/[0.05] text-rose-200",
    cyan:    "border-cyan-400/25 bg-cyan-500/[0.05] text-cyan-200",
    amber:   "border-amber-400/25 bg-amber-500/[0.05] text-amber-200",
  };
  return (
    <Card className={`border p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-3 font-bold text-sm">
        <Icon name={icon} size={16} />
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="text-white/85 text-sm flex items-start gap-2 leading-snug">
            <span className="text-white/40 mt-0.5">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
