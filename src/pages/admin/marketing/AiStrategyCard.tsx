import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiResult, rub } from "./types";

interface Props {
  ai: AiResult;
  onClose: () => void;
  onSendTask: (title: string, description: string, priority: string) => void;
}

export default function AiStrategyCard({ ai, onClose, onSendTask }: Props) {
  if (!ai || !ai.ai) return null;
  return (
    <Card className="border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 p-6 mb-8">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
          <Icon name="Brain" size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">ИИ-стратег УЧИСЬПРО</div>
          <p className="text-white text-base leading-relaxed">{ai.ai.summary}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white/40">
          <Icon name="X" size={14} />
        </Button>
      </div>

      <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3 mb-4 flex items-start gap-2">
        <Icon name="Flame" size={16} className="text-amber-300 flex-shrink-0 mt-0.5" />
        <div className="text-amber-100 text-sm">
          <span className="font-bold">Топ-приоритет:</span> {ai.ai.top_priority}
        </div>
      </div>

      <h4 className="text-white/85 font-bold text-sm mb-2">Рекомендации</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        {ai.ai.recommendations.map((r, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="font-semibold text-white text-sm mb-1">{r.title}</div>
            <div className="text-white/65 text-xs mb-2">{r.action}</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold">+{rub(r.impact_rub)}</span>
              <span className="text-white/45">через {r.deadline_days} дн.</span>
            </div>
          </div>
        ))}
      </div>

      {ai.ai.tasks_for_sales?.length > 0 && (
        <>
          <h4 className="text-white/85 font-bold text-sm mb-2 flex items-center gap-2">
            <Icon name="ArrowRight" size={14} className="text-cyan-300" />
            Задачи отделу продаж
          </h4>
          <div className="space-y-2">
            {ai.ai.tasks_for_sales.map((t, i) => (
              <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{t.title}</div>
                  <div className="text-white/55 text-xs mt-0.5">{t.description}</div>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0 border-purple-400/30 text-purple-200" onClick={() => onSendTask(t.title, t.description, t.priority)}>
                  <Icon name="Send" size={12} className="mr-1" /> Передать
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
