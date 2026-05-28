import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import func2url from "../../../backend/func2url.json";

const MKT_URL = (func2url as Record<string, string>)["marketing-strategy"];

interface MktTask {
  id: number;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done" | "cancelled";
  created_at: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: "border-rose-400/40 text-rose-200 bg-rose-500/10",
  medium: "border-amber-400/40 text-amber-200 bg-amber-500/10",
  low: "border-white/15 text-white/60 bg-white/5",
};
const STATUS_COLOR: Record<string, string> = {
  todo: "border-white/15 text-white/70 bg-white/5",
  in_progress: "border-cyan-400/40 text-cyan-200 bg-cyan-500/10",
  done: "border-emerald-400/40 text-emerald-200 bg-emerald-500/10",
};
const PRIORITY_LABEL: Record<string, string> = { high: "Срочно", medium: "Обычная", low: "Низкий" };
const STATUS_LABEL: Record<string, string> = { todo: "К работе", in_progress: "В работе", done: "Готово", cancelled: "Отменена" };

/**
 * Виджет на странице "Отдел продаж": показывает входящие задачи от маркетинга.
 * Продажи могут менять статус (в работу / готово).
 */
export default function InboxFromMarketing({ pin }: { pin: string }) {
  const [tasks, setTasks] = useState<MktTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!pin) return;
    fetch(`${MKT_URL}?action=tasks&status=all`, { headers: { "X-Admin-Pin": pin } })
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks || []))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [pin]);

  useEffect(() => { load(); }, [load]);

  const update = async (id: number, status: string) => {
    try {
      await fetch(`${MKT_URL}?action=task_update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pin },
        body: JSON.stringify({ id, status }),
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const active = tasks.filter((t) => t.status === "todo" || t.status === "in_progress");

  return (
    <Card className="border border-purple-400/25 bg-gradient-to-br from-purple-500/[0.05] to-fuchsia-500/[0.02] p-5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-montserrat text-base font-bold text-white flex items-center gap-2">
          <Icon name="Inbox" size={18} className="text-purple-300" />
          Задачи от отдела маркетинга
          {active.length > 0 && (
            <Badge variant="outline" className="border-purple-400/40 text-purple-200 bg-purple-500/10">
              {active.length}
            </Badge>
          )}
        </h3>
        <Link to="/admin/marketing" className="text-purple-200 hover:text-purple-100 text-xs flex items-center gap-1">
          В отдел маркетинга <Icon name="ArrowRight" size={12} />
        </Link>
      </div>

      {error && <div className="text-rose-300 text-xs mb-2">{error}</div>}

      {tasks.length === 0 ? (
        <div className="text-white/40 text-sm text-center py-6">
          Маркетинг пока не передал задач. Подожди — или попроси проанализировать данные.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLOR[t.priority]}`}>
                    {PRIORITY_LABEL[t.priority]}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_COLOR[t.status] || ""}`}>
                    {STATUS_LABEL[t.status]}
                  </Badge>
                </div>
                <div className="font-semibold text-white text-sm">{t.title}</div>
                {t.description && <div className="text-white/55 text-xs mt-0.5 leading-snug">{t.description}</div>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {t.status === "todo" && (
                  <Button size="sm" variant="ghost" onClick={() => update(t.id, "in_progress")} className="text-cyan-300 hover:bg-cyan-500/10 h-8">
                    <Icon name="Play" size={14} />
                  </Button>
                )}
                {t.status !== "done" && (
                  <Button size="sm" variant="ghost" onClick={() => update(t.id, "done")} className="text-emerald-300 hover:bg-emerald-500/10 h-8">
                    <Icon name="CheckCircle" size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {tasks.length > 5 && (
            <Link to="/admin/marketing" className="text-purple-200 text-xs hover:text-purple-100 block text-center pt-1">
              + ещё {tasks.length - 5} задач →
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
