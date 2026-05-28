import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import func2url from "../../../backend/func2url.json";

const MKT_URL = (func2url as Record<string, string>)["marketing-strategy"];
const PIN_KEY = "uchispro_admin_pin_v1";

const PERIODS = [
  { id: 7, label: "7 дней" },
  { id: 30, label: "30 дней" },
  { id: 90, label: "90 дней" },
];

interface Metrics {
  period_days: number;
  revenue: number;
  prev_revenue: number;
  revenue_growth_pct: number | null;
  paid_orders: number;
  unique_buyers: number;
  new_users: number;
  all_users: number;
  leads: number;
  started_checkout: number;
  aov: number;
  conv_reg_to_buy: number;
  conv_start_to_paid: number;
  repeat_buyers: number;
  arpu: number;
}

interface Swot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface FunnelStage { key: string; label: string; count: number }
interface FunnelData { stages: FunnelStage[]; bottleneck: { from: string; to: string; drop_pct: number; lost: number } | null }

interface Cohort {
  week_start: string;
  size: number;
  returned: number;
  retention_pct: number;
  bought: number;
  conv_pct: number;
}

interface RfmItem { label: string; count: number; color: string; hint: string }

interface Idea {
  title: string;
  description: string;
  effort: "low" | "medium" | "high";
  impact: string;
  priority: number;
}

interface Plan {
  week1: string[]; week2: string[]; week3: string[]; week4: string[];
}

interface Analysis {
  metrics: Metrics;
  swot: Swot;
  funnel: FunnelData;
  cohorts: { cohorts: Cohort[]; avg_retention_pct: number };
  rfm: Record<string, RfmItem>;
  ideas: Idea[];
  plan: Plan;
}

interface MktTask {
  id: number;
  title: string;
  description: string | null;
  assigned_to: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done" | "cancelled";
  created_at: string;
  due_date: string | null;
}

interface AiResult {
  strategy_id?: number;
  ai?: {
    summary: string;
    top_priority: string;
    recommendations: { title: string; action: string; impact_rub: number; deadline_days: number }[];
    tasks_for_sales: { title: string; description: string; priority: string }[];
  };
  parsed?: boolean;
  raw_text?: string;
}

function rub(n: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
}
function num(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n);
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
  cancelled: "border-white/10 text-white/40 bg-white/3",
};
const STATUS_LABEL: Record<string, string> = {
  todo: "К работе", in_progress: "В работе", done: "Готово", cancelled: "Отменена",
};
const EFFORT_LABEL: Record<string, string> = {
  low: "Лёгкая", medium: "Средняя", high: "Сложная",
};

export default function MarketingDashboard() {
  const pin = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";

  const [period, setPeriod] = useState(30);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tasks, setTasks] = useState<MktTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [ai, setAi] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Форма создания задачи
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("medium");

  const fetchJson = useCallback(async (action: string, opts: { params?: Record<string, string | number>; method?: string; body?: object } = {}) => {
    const usp = new URLSearchParams({ action, ...Object.fromEntries(Object.entries(opts.params || {}).map(([k, v]) => [k, String(v)])) });
    const res = await fetch(`${MKT_URL}?${usp.toString()}`, {
      method: opts.method || "GET",
      headers: { "X-Admin-Pin": pin, "Content-Type": "application/json" },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e?.error || `Ошибка ${res.status}`);
    }
    return res.json();
  }, [pin]);

  // Загрузка анализа
  useEffect(() => {
    if (!pin) return;
    setLoading(true);
    setError(null);
    fetchJson("analyze", { params: { days: period } })
      .then((d) => setAnalysis(d))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [period, pin, fetchJson]);

  // Загрузка задач
  const loadTasks = useCallback(() => {
    if (!pin) return;
    fetchJson("tasks")
      .then((d) => setTasks(d.tasks || []))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [pin, fetchJson]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const runAiStrategy = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const result = await fetchJson("ai_strategy", { params: { days: period }, method: "POST", body: {} });
      setAi(result);
      // Если ИИ предложил задачи продажам — показываем их через секцию
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAiLoading(false);
    }
  };

  const createTask = async () => {
    if (!taskTitle.trim()) return;
    try {
      await fetchJson("task_create", {
        method: "POST",
        body: {
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          priority: taskPriority,
          assigned_to: "sales",
        },
      });
      setTaskTitle(""); setTaskDescription(""); setTaskPriority("medium");
      setShowTaskForm(false);
      loadTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const updateTaskStatus = async (id: number, status: string) => {
    try {
      await fetchJson("task_update", { method: "POST", body: { id, status } });
      loadTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const createTaskFromAi = async (title: string, description: string, priority: string) => {
    try {
      await fetchJson("task_create", {
        method: "POST",
        body: { title, description, priority, assigned_to: "sales" },
      });
      loadTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!pin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="border border-white/10 bg-white/[0.03] p-7 text-center max-w-sm">
          <Icon name="Lock" size={28} className="text-white/60 mx-auto mb-3" />
          <h1 className="font-montserrat text-lg font-bold mb-2">Нужен вход в админ-хаб</h1>
          <Link to="/admin">
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 w-full mt-2">Перейти</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Отдел маркетинга · УЧИСЬПРО</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Шапка */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/admin" className="text-white/45 text-xs hover:text-white flex items-center gap-1 mb-1">
              <Icon name="ChevronLeft" size={12} /> Админ-хаб
            </Link>
            <h1 className="font-montserrat text-3xl md:text-4xl font-black flex items-center gap-3">
              <Icon name="Target" size={28} className="text-purple-300" />
              Отдел маркетинга
            </h1>
            <p className="text-white/55 text-sm mt-1">Стратегия, аналитика, задачи отделу продаж</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    period === p.id
                      ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/20 text-white border border-white/15"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button
              onClick={runAiStrategy}
              disabled={aiLoading}
              className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400"
            >
              <Icon name={aiLoading ? "Loader2" : "Sparkles"} size={14} className={`mr-1.5 ${aiLoading ? "animate-spin" : ""}`} />
              {aiLoading ? "ИИ думает..." : "Стратегия от ИИ"}
            </Button>
            <Link to="/admin/sales">
              <Button variant="outline" size="sm" className="border-white/15">
                <Icon name="BarChart3" size={14} className="mr-1" /> Продажи
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-200 text-sm flex items-start gap-2">
            <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* ИИ-стратегия */}
        {ai && ai.ai && (
          <Card className="border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Brain" size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">ИИ-стратег УЧИСЬПРО</div>
                <p className="text-white text-base leading-relaxed">{ai.ai.summary}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAi(null)} className="text-white/40">
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
                      <Button size="sm" variant="outline" className="flex-shrink-0 border-purple-400/30 text-purple-200" onClick={() => createTaskFromAi(t.title, t.description, t.priority)}>
                        <Icon name="Send" size={12} className="mr-1" /> Передать
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        )}

        {!analysis && loading && (
          <div className="text-center py-20 text-white/55">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3 text-purple-300" />
            Анализирую...
          </div>
        )}

        {analysis && (
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
                        onClick={() => createTaskFromAi(idea.title, idea.description, idea.priority === 1 ? "high" : "medium")}
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
        )}

        {/* Задачи отделу продаж */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="font-montserrat text-lg font-bold text-white/85 flex items-center gap-2">
              <Icon name="ClipboardList" size={18} className="text-cyan-300" />
              Задачи отделу продаж
              <span className="text-white/40 text-sm font-normal ml-2">{tasks.length}</span>
            </h2>
            <Button onClick={() => setShowTaskForm(!showTaskForm)} className="bg-gradient-to-r from-purple-500 to-cyan-500">
              <Icon name="Plus" size={14} className="mr-1.5" />
              Новая задача
            </Button>
          </div>

          {showTaskForm && (
            <Card className="border border-purple-400/30 bg-purple-500/[0.04] p-4 mb-4">
              <div className="space-y-3">
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Заголовок задачи (например, «Прозвонить 30 горячих лидов»)"
                  className="bg-white/[0.04] border-white/12"
                />
                <Textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Описание: что сделать, какой сегмент, какой скрипт..."
                  className="bg-white/[0.04] border-white/12 min-h-[80px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {(["high", "medium", "low"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setTaskPriority(p)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          taskPriority === p ? PRIORITY_COLOR[p] : "border-white/10 text-white/45"
                        }`}
                      >
                        {p === "high" ? "Срочно" : p === "medium" ? "Обычная" : "Низкий"}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowTaskForm(false)}>Отмена</Button>
                    <Button size="sm" onClick={createTask} disabled={!taskTitle.trim()} className="bg-gradient-to-r from-purple-500 to-cyan-500">
                      <Icon name="Send" size={12} className="mr-1" /> Отправить продажам
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {tasks.length === 0 ? (
            <Card className="border border-white/10 bg-white/[0.02] p-10 text-center text-white/40">
              Задач пока нет. Создай первую или передай идею из «Идей роста».
            </Card>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <Card key={t.id} className="border border-white/10 bg-white/[0.03] p-3.5 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLOR[t.priority]}`}>
                          {t.priority === "high" ? "Срочно" : t.priority === "medium" ? "Обычная" : "Низкий"}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_COLOR[t.status]}`}>
                          {STATUS_LABEL[t.status]}
                        </Badge>
                        <span className="text-white/40 text-xs">→ {t.assigned_to === "sales" ? "Продажам" : t.assigned_to}</span>
                      </div>
                      <div className="font-semibold text-white text-sm">{t.title}</div>
                      {t.description && <div className="text-white/55 text-xs mt-1 leading-snug">{t.description}</div>}
                      <div className="text-white/35 text-xs mt-1">{new Date(t.created_at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {t.status !== "done" && (
                        <Button size="sm" variant="ghost" onClick={() => updateTaskStatus(t.id, "done")} className="text-emerald-300 hover:bg-emerald-500/10 h-8">
                          <Icon name="CheckCircle" size={14} />
                        </Button>
                      )}
                      {t.status === "todo" && (
                        <Button size="sm" variant="ghost" onClick={() => updateTaskStatus(t.id, "in_progress")} className="text-cyan-300 hover:bg-cyan-500/10 h-8">
                          <Icon name="Play" size={14} />
                        </Button>
                      )}
                      {t.status !== "cancelled" && t.status !== "done" && (
                        <Button size="sm" variant="ghost" onClick={() => updateTaskStatus(t.id, "cancelled")} className="text-white/40 hover:bg-white/5 h-8">
                          <Icon name="X" size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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
