import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const AUTOPILOT_URL = (func2url as Record<string, string>)["ai-autopilot"];

interface RunDetail {
  agent_key: string;
  role_name: string;
  version: number;
  health: number;
  rating: number;
  feedback_7d: number;
  needs_evolution: boolean;
  reason: string;
  evolved?: boolean;
  to_version?: number;
  diff_summary?: string;
}

interface Run {
  id: number;
  run_type: string;
  agents_checked: number;
  agents_evolved: number;
  agents_healthy: number;
  agents_skipped: number;
  duration_ms: number;
  created_at: string;
}

export default function AutopilotPanel() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [running, setRunning] = useState(false);
  const [lastReport, setLastReport] = useState<{ details: RunDetail[]; evolved: number; healthy: number; checked: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = async () => {
    try {
      const res = await fetch(`${AUTOPILOT_URL}?action=runs&limit=10`);
      const data = await res.json();
      if (data.runs) setRuns(data.runs);
    } catch { /* noop */ }
  };

  const runCheck = async () => {
    setRunning(true);
    setError(null);
    setLastReport(null);
    try {
      const res = await fetch(`${AUTOPILOT_URL}?action=check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_type: "manual" }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setLastReport({
          details: data.details || [],
          evolved: data.agents_evolved || 0,
          healthy: data.agents_healthy || 0,
          checked: data.agents_checked || 0,
        });
        fetchRuns();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "network error");
    }
    setRunning(false);
  };

  useEffect(() => { fetchRuns(); }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/25 rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/25 flex items-center justify-center">
              <Icon name="Bot" size={16} className="text-emerald-200" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-base text-white">Автопилот эволюции</h3>
              <p className="text-white/55 text-[11px]">Сам проверяет агентов и эволюционирует просевших</p>
            </div>
          </div>
          <button
            onClick={runCheck}
            disabled={running}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {running ? (
              <>
                <Icon name="Loader2" size={12} className="animate-spin" />
                Сканирую агентов...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={12} />
                Запустить проверку всех
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/35 rounded-xl p-3 text-rose-200 text-xs mb-3">
            {error}
          </div>
        )}

        {lastReport && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-montserrat font-black text-white">{lastReport.checked}</div>
                <div className="text-white/45 text-[10px] uppercase tracking-wider">проверено</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-center">
                <div className="text-2xl font-montserrat font-black text-emerald-300">{lastReport.evolved}</div>
                <div className="text-emerald-200/65 text-[10px] uppercase tracking-wider">эволюций</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/25 rounded-xl p-3 text-center">
                <div className="text-2xl font-montserrat font-black text-cyan-300">{lastReport.healthy}</div>
                <div className="text-cyan-200/65 text-[10px] uppercase tracking-wider">здоровых</div>
              </div>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {lastReport.details.map((d) => (
                <div key={d.agent_key} className={`flex items-center gap-2 text-xs rounded-xl p-2 ${
                  d.evolved ? "bg-emerald-500/10 border border-emerald-500/30" : d.health < 70 ? "bg-amber-500/10 border border-amber-500/25" : "bg-white/[0.03] border border-white/8"
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                    d.health >= 80 ? "bg-emerald-500/25 text-emerald-200" : d.health >= 60 ? "bg-amber-500/25 text-amber-200" : "bg-rose-500/25 text-rose-200"
                  }`}>
                    {Math.round(d.health)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">{d.role_name} v{d.version}</p>
                    <p className="text-white/55 text-[10px]">{d.reason}</p>
                  </div>
                  {d.evolved && (
                    <span className="text-[10px] bg-emerald-500/25 text-emerald-200 font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                      → v{d.to_version}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {runs.length > 0 && (
        <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="History" size={14} className="text-white/55" />
            <h4 className="font-montserrat font-black text-white text-sm">История запусков автопилота</h4>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Icon name={r.run_type === "cron_nightly" ? "Moon" : r.run_type === "auto_feedback_trigger" ? "Zap" : "MousePointer"} size={11} className="text-white/45" />
                  <span className="text-white/55 text-[10px] uppercase tracking-wider font-bold">{r.run_type}</span>
                </div>
                <span className="text-white/70 flex-1">{r.agents_checked} проверено · {r.agents_evolved} эволюций · {r.agents_healthy} ок</span>
                <span className="text-white/40 text-[10px] flex-shrink-0">{new Date(r.created_at).toLocaleString("ru-RU")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
