import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import func2url from "../../../../backend/func2url.json";

const PM_URL = (func2url as Record<string, string>)["project-manager"];

interface Metrics {
  revenue: number;
  goal_progress_pct: number;
  revenue_growth_pct: number | null;
  new_users: number;
  unique_buyers: number;
  conv_reg_to_buy: number;
  aov: number;
}

interface OpenTasks {
  todo: number;
  in_progress: number;
  overdue: number;
}

interface LastRun {
  summary: string;
  health_score: number;
  focus: string;
  tasks_created: number;
  created_at: string;
  run_type: string;
}

interface Status {
  metrics: Metrics;
  open_tasks: OpenTasks;
  last_run: LastRun | null;
}

interface Props {
  pin: string;
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(Math.round(n));

export default function ProjectManagerPanel({ pin }: Props) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!PM_URL || !pin) return;
    setLoading(true);
    fetch(`${PM_URL}?action=status`, { headers: { "X-Admin-Pin": pin } })
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setStatus(d); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [pin]);

  useEffect(() => { load(); }, [load]);

  const runAnalyze = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`${PM_URL}?action=analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pin },
        body: "{}",
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || `Ошибка ${res.status}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const m = status?.metrics;
  const last = status?.last_run;
  const tasks = status?.open_tasks;
  const health = last?.health_score ?? 0;
  const healthColor = health >= 70 ? "text-emerald-300" : health >= 40 ? "text-amber-300" : "text-rose-300";
  const progress = m?.goal_progress_pct ?? 0;

  return (
    <Card className="border border-indigo-400/30 bg-gradient-to-br from-indigo-500/[0.08] via-violet-500/[0.05] to-cyan-500/[0.04] p-5 mb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <Icon name="BrainCircuit" size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-montserrat text-base font-bold text-white">Алекс — ИИ-менеджер проекта</h2>
            <p className="text-white/55 text-xs">Анализирует метрики и сам ставит задачи отделам. Цель — 1 000 000 ₽/мес.</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-white/55 hover:text-white">
          <Icon name="RefreshCw" size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Прогресс к цели */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-white/60">Путь к 1 000 000 ₽/мес</span>
          <span className="text-white/80 font-semibold">{fmt(m?.revenue ?? 0)} ₽ · {progress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all"
            style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
          />
        </div>
      </div>

      {/* Карточки */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-white/50 text-[11px] mb-1">Здоровье проекта</div>
          <div className={`font-montserrat font-black text-2xl ${healthColor}`}>{last ? health : "—"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-white/50 text-[11px] mb-1">Задач в работе</div>
          <div className="font-montserrat font-black text-2xl text-white">{tasks ? tasks.todo + tasks.in_progress : "—"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-white/50 text-[11px] mb-1">Просрочено</div>
          <div className={`font-montserrat font-black text-2xl ${tasks && tasks.overdue > 0 ? "text-rose-300" : "text-white/70"}`}>
            {tasks?.overdue ?? "—"}
          </div>
        </div>
      </div>

      {/* Фокус и сводка */}
      {last ? (
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/[0.06] p-4 mb-4">
          {last.focus && (
            <div className="flex items-start gap-2 mb-2">
              <Icon name="Target" size={15} className="text-cyan-300 flex-shrink-0 mt-0.5" />
              <div className="text-white font-semibold text-sm">{last.focus}</div>
            </div>
          )}
          <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{last.summary}</p>
          <div className="text-white/40 text-[11px] mt-2.5">
            Обновлено {new Date(last.created_at).toLocaleString("ru-RU")} ·{" "}
            {last.run_type === "cron" ? "авто" : "вручную"} · поставлено задач: {last.tasks_created}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-white/55 text-sm text-center py-4 rounded-xl border border-white/8 bg-white/[0.02] mb-4">
            Менеджер ещё не запускался. Нажми «Запустить менеджера» — он проанализирует проект и поставит задачи.
          </div>
        )
      )}

      {error && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-2 text-rose-200 text-xs mb-3 flex items-start gap-2">
          <Icon name="AlertCircle" size={14} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <Button
        onClick={runAnalyze}
        disabled={running}
        className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 font-bold"
      >
        {running ? (
          <><Icon name="Loader2" size={16} className="animate-spin mr-2" /> Менеджер анализирует проект...</>
        ) : (
          <><Icon name="Play" size={16} className="mr-2" /> Запустить менеджера</>
        )}
      </Button>
      <p className="text-white/35 text-[10px] mt-1.5 text-center">
        Запускается сам раз в день. Здесь — ручной запуск в любой момент.
      </p>
    </Card>
  );
}
