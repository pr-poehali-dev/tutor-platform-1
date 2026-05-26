import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import AutopilotPanel from "@/components/admin/AutopilotPanel";
import AgentGraph from "@/components/admin/AgentGraph";
import func2url from "../../../backend/func2url.json";

const EVOLVE_URL = (func2url as Record<string, string>)["ai-evolve"];

interface Agent {
  id: number;
  agent_key: string;
  role_name: string;
  description: string;
  version: number;
  model: string;
  temperature: number | string;
  total_interactions: number;
  success_count: number;
  failure_count: number;
  avg_rating: number | string;
  last_evolved_at?: string;
  is_active: boolean;
  prompt_length?: number;
}

interface EvolutionEntry {
  id: number;
  from_version: number;
  to_version: number;
  change_type: string;
  reason: string;
  diff_summary: string;
  triggered_by: string;
  created_at: string;
}

interface KnowledgeItem {
  id: number;
  topic: string;
  subject: string;
  pattern_type: string;
  content: string;
  success_score: number | string;
  use_count: number;
}

interface AgentDetails {
  agent: Agent & { system_prompt: string };
  history: EvolutionEntry[];
  knowledge: KnowledgeItem[];
  recent_stats?: { total: number; avg_rating: number; helpful_count: number; unhelpful_count: number };
}

interface PlatformStats {
  agents: number;
  total_interactions: number;
  total_success: number;
  avg_rating: number;
  max_version: number;
  evolutions_30d: number;
  feedbacks_30d: number;
  knowledge_items: number;
}

export default function AIEvolutionLab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [details, setDetails] = useState<AgentDetails | null>(null);
  const [evolving, setEvolving] = useState(false);
  const [evolveResult, setEvolveResult] = useState<{ ok: boolean; message: string } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([
        fetch(`${EVOLVE_URL}?action=list_agents`).then((r) => r.json()),
        fetch(`${EVOLVE_URL}?action=stats`).then((r) => r.json()),
      ]);
      if (a.agents) setAgents(a.agents);
      if (s.platform) setStats(s.platform);
    } catch { /* noop */ }
    setLoading(false);
  };

  const fetchDetails = async (key: string) => {
    setSelectedKey(key);
    setDetails(null);
    try {
      const res = await fetch(`${EVOLVE_URL}?action=get_agent&agent_key=${key}`);
      const data = await res.json();
      if (data.agent) setDetails(data);
    } catch { /* noop */ }
  };

  const triggerEvolution = async (key: string, force = false) => {
    setEvolving(true);
    setEvolveResult(null);
    try {
      const res = await fetch(`${EVOLVE_URL}?action=evolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_key: key, triggered_by: "admin", force }),
      });
      const data = await res.json();
      if (data.evolved) {
        setEvolveResult({ ok: true, message: `Эволюционировал до v${data.to_version}. ${data.diff_summary || ""}` });
        fetchAll();
        fetchDetails(key);
      } else {
        setEvolveResult({ ok: false, message: data.reason || data.error || "Не получилось" });
      }
    } catch (e) {
      setEvolveResult({ ok: false, message: e instanceof Error ? e.message : "network error" });
    }
    setEvolving(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const successRate = (a: Agent) => {
    const total = Number(a.total_interactions || 0);
    if (!total) return 0;
    return Math.round((Number(a.success_count || 0) / total) * 100);
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Лаборатория эволюции ИИ — УЧИСЬПРО" description="Самоэволюционирующие агенты УЧИСЬПРО." noindex />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">Админ · Лаборатория эволюции</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/35 rounded-full px-4 py-1.5 mb-4">
          <Icon name="FlaskConical" size={14} className="text-purple-300" />
          <span className="text-sm text-purple-200 font-bold uppercase tracking-wider">Лаборатория эволюции</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3">
          ИИ-агенты, которые <span className="gradient-text-purple">учатся сами</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-3xl mb-8">
          Каждый агент УЧИСЬПРО становится умнее с каждым взаимодействием. Собирает обратную связь, анализирует ошибки, переписывает свой системный промпт — мир меняется, агенты эволюционируют вместе с ним.
        </p>

        {/* Платформенная статистика */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { val: stats.agents, label: "активных агентов", icon: "Bot", color: "#8b5cf6" },
              { val: stats.total_interactions || 0, label: "взаимодействий", icon: "Activity", color: "#06d6a0" },
              { val: stats.evolutions_30d || 0, label: "эволюций за 30 дн", icon: "TrendingUp", color: "#ec4899" },
              { val: stats.knowledge_items || 0, label: "паттернов знаний", icon: "Brain", color: "#ffd60a" },
            ].map((m) => (
              <div key={m.label} className="bg-card/60 border border-white/10 rounded-2xl p-4">
                <Icon name={m.icon} size={16} style={{ color: m.color }} className="mb-2" />
                <div className="font-montserrat font-black text-2xl" style={{ color: m.color }}>{String(m.val)}</div>
                <div className="text-white/45 text-[10px] uppercase tracking-wider">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading && <p className="text-white/55 text-sm">Загружаю агентов...</p>}

        {/* Автопилот + Граф связей */}
        <div className="grid lg:grid-cols-2 gap-5 mb-8">
          <AutopilotPanel />
          <AgentGraph />
        </div>

        <div className="grid lg:grid-cols-[1fr_500px] gap-6">
          {/* Список агентов */}
          <div className="space-y-3">
            <h2 className="font-montserrat font-black text-white text-lg mb-2">Агенты УЧИСЬПРО</h2>
            {agents.map((a) => (
              <button
                key={a.agent_key}
                onClick={() => fetchDetails(a.agent_key)}
                className={`w-full text-left bg-card/60 border rounded-3xl p-5 transition-all ${
                  selectedKey === a.agent_key ? "border-purple-500/50 shadow-lg" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-montserrat font-black text-base text-white">{a.role_name}</h3>
                      <span className="text-[10px] bg-purple-500/20 border border-purple-500/40 text-purple-200 font-bold px-1.5 py-0.5 rounded">v{a.version}</span>
                    </div>
                    <p className="text-white/55 text-xs">{a.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/55">
                    <Icon name="Activity" size={11} /> {a.total_interactions || 0} вызовов
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                    <Icon name="CheckCircle2" size={11} /> {successRate(a)}% успех
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                    <Icon name="Star" size={11} /> {Number(a.avg_rating || 0).toFixed(1)}/5
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/45 font-mono">
                    {a.model}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Детали выбранного агента */}
          <div className="space-y-4">
            {!details && (
              <div className="bg-card/60 border border-white/10 rounded-3xl p-8 text-center text-white/45">
                <Icon name="MousePointerClick" size={32} className="mx-auto mb-3" />
                <p className="text-sm">Выбери агента слева, чтобы посмотреть его историю эволюции, базу знаний и запустить улучшение.</p>
              </div>
            )}

            {details && (
              <>
                <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-montserrat font-black text-lg text-white">{details.agent.role_name}</h3>
                      <p className="text-white/55 text-xs">{details.agent.description}</p>
                    </div>
                    <span className="text-xs bg-purple-500/20 border border-purple-500/40 text-purple-200 font-bold px-2 py-1 rounded-lg">v{details.agent.version}</span>
                  </div>

                  <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Текущий системный промпт</div>
                  <div className="bg-background/60 border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto">
                    <pre className="text-white/75 text-[11px] whitespace-pre-wrap font-mono leading-relaxed">{details.agent.system_prompt}</pre>
                  </div>

                  <button
                    onClick={() => triggerEvolution(details.agent.agent_key, true)}
                    disabled={evolving}
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm py-2.5 rounded-2xl hover:scale-[1.01] transition-transform disabled:opacity-50"
                  >
                    {evolving ? (
                      <>
                        <Icon name="Loader2" size={14} className="animate-spin" />
                        ИИ-аналитик переписывает промпт...
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={14} />
                        Запустить эволюцию (force)
                      </>
                    )}
                  </button>

                  {evolveResult && (
                    <div className={`mt-3 text-xs p-2.5 rounded-xl ${evolveResult.ok ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-200" : "bg-rose-500/15 border border-rose-500/35 text-rose-200"}`}>
                      {evolveResult.message}
                    </div>
                  )}
                </div>

                {/* История эволюции */}
                <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="History" size={16} className="text-purple-300" />
                    <h4 className="font-montserrat font-black text-white text-sm">История эволюции</h4>
                  </div>
                  {details.history.length === 0 ? (
                    <p className="text-white/45 text-xs">Пока без эволюций — агент работает на изначальном промпте.</p>
                  ) : (
                    <div className="space-y-2">
                      {details.history.slice(0, 8).map((h) => (
                        <div key={h.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-purple-500/20 text-purple-200 font-bold px-1.5 py-0.5 rounded">v{h.from_version} → v{h.to_version}</span>
                            <span className="text-[10px] text-white/45">{new Date(h.created_at).toLocaleString("ru-RU")}</span>
                          </div>
                          <p className="text-white text-xs font-semibold">{h.diff_summary || h.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* База знаний */}
                {details.knowledge.length > 0 && (
                  <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="Brain" size={16} className="text-cyan-300" />
                      <h4 className="font-montserrat font-black text-white text-sm">База удачных паттернов</h4>
                    </div>
                    <div className="space-y-2">
                      {details.knowledge.slice(0, 5).map((k) => (
                        <div key={k.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] text-cyan-200 font-bold uppercase">{k.pattern_type}</span>
                            <span className="text-[10px] text-white/45">{k.topic}</span>
                            <span className="ml-auto text-[10px] text-amber-300">★ {Number(k.success_score).toFixed(1)}</span>
                          </div>
                          <p className="text-white/75 text-[11px] line-clamp-2">{k.content.slice(0, 200)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}