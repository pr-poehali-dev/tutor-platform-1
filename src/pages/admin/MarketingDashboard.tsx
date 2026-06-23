import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import func2url from "../../../backend/func2url.json";
import { PIN_KEY, Analysis, MktTask, AiResult } from "./marketing/types";
import DashboardHeader from "./marketing/DashboardHeader";
import AiStrategyCard from "./marketing/AiStrategyCard";
import AnalysisSection from "./marketing/AnalysisSection";
import TasksSection from "./marketing/TasksSection";
import ChatPanel from "./marketing/ChatPanel";
import TacticsLibrary from "./marketing/TacticsLibrary";
import PromoStats from "./marketing/PromoStats";
import ReferralPromoStats from "./marketing/ReferralPromoStats";
import ProjectManagerPanel from "./marketing/ProjectManagerPanel";
import BannersGallery from "./marketing/BannersGallery";

const MKT_URL = (func2url as Record<string, string>)["marketing-strategy"];

export default function MarketingDashboard() {
  const pin = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";

  const [period, setPeriod] = useState(30);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tasks, setTasks] = useState<MktTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [ai, setAi] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const createTask = async (title: string, description: string, priority: "high" | "medium" | "low") => {
    if (!title.trim()) return;
    try {
      await fetchJson("task_create", {
        method: "POST",
        body: {
          title: title.trim(),
          description: description.trim(),
          priority,
          assigned_to: "sales",
        },
      });
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
        <DashboardHeader
          period={period}
          setPeriod={setPeriod}
          aiLoading={aiLoading}
          onRunAi={runAiStrategy}
        />

        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-200 text-sm flex items-start gap-2">
            <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <ProjectManagerPanel pin={pin} />

        <BannersGallery />

        <ChatPanel pin={pin} />

        <PromoStats />

        <ReferralPromoStats />

        {ai && ai.ai && (
          <AiStrategyCard
            ai={ai}
            onClose={() => setAi(null)}
            onSendTask={createTaskFromAi}
          />
        )}

        {!analysis && loading && (
          <div className="text-center py-20 text-white/55">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3 text-purple-300" />
            Анализирую...
          </div>
        )}

        {analysis && (
          <AnalysisSection
            analysis={analysis}
            onSendIdea={createTaskFromAi}
          />
        )}

        <TacticsLibrary onSendTask={createTaskFromAi} />

        <TasksSection
          tasks={tasks}
          onCreate={createTask}
          onUpdateStatus={updateTaskStatus}
        />
      </div>
    </div>
  );
}