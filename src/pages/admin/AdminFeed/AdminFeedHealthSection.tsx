import Icon from "@/components/ui/icon";
import { FeedHealth } from "@/components/feed/api";

interface AdminFeedHealthSectionProps {
  health: FeedHealth;
}

export default function AdminFeedHealthSection({ health }: AdminFeedHealthSectionProps) {
  return (
    <section className={`border rounded-3xl p-4 md:p-5 ${
      health.status === "critical" ? "bg-rose-500/10 border-rose-500/40" :
      health.status === "warning"  ? "bg-amber-500/10 border-amber-500/40" :
                                      "bg-emerald-500/[0.07] border-emerald-500/30"
    }`}>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon
            name={health.status === "ok" ? "ShieldCheck" : health.status === "warning" ? "AlertTriangle" : "AlertCircle"}
            size={18}
            className={
              health.status === "ok" ? "text-emerald-300" :
              health.status === "warning" ? "text-amber-300" : "text-rose-300"
            }
          />
          <div>
            <p className="font-montserrat font-black text-white text-sm md:text-base">
              {health.status === "ok" ? "Лента работает автономно" :
               health.status === "warning" ? "Внимание: требует наблюдения" :
               "Критическая ситуация"}
            </p>
            <p className="text-white/55 text-[11px]">
              Самовосстановление активно · 3 уровня защиты (RSS → demo-пул → алерт)
            </p>
          </div>
        </div>
        {health.last_run && health.last_run.at && (
          <span className="text-white/45 text-[11px]">
            Последний прогон: {new Date(health.last_run.at).toLocaleString("ru-RU")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-black/25 rounded-xl p-2.5">
          <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider">Опубликовано</p>
          <p className="text-white font-montserrat font-black text-xl tabular-nums">{health.metrics.total_published}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${health.metrics.fresh_24h === 0 ? "bg-rose-500/15" : "bg-black/25"}`}>
          <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider">Свежих за 24ч</p>
          <p className="text-white font-montserrat font-black text-xl tabular-nums">{health.metrics.fresh_24h}</p>
        </div>
        <div className="bg-black/25 rounded-xl p-2.5">
          <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider">Источников активно</p>
          <p className="text-emerald-300 font-montserrat font-black text-xl tabular-nums">{health.metrics.sources_active}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${health.metrics.sources_disabled > 3 ? "bg-amber-500/15" : "bg-black/25"}`}>
          <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider">Автоотключено</p>
          <p className={`font-montserrat font-black text-xl tabular-nums ${
            health.metrics.sources_disabled > 3 ? "text-amber-300" : "text-white/55"
          }`}>{health.metrics.sources_disabled}</p>
        </div>
      </div>

      {health.alerts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider">
            Активные алерты ({health.alerts_count})
          </p>
          {health.alerts.slice(0, 5).map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2 rounded-lg ${
                a.severity === "critical" ? "bg-rose-500/15 border border-rose-500/30" :
                a.severity === "warning" ? "bg-amber-500/15 border border-amber-500/30" :
                "bg-white/[0.04] border border-white/10"
              }`}
            >
              <Icon
                name={a.severity === "critical" ? "AlertCircle" : "AlertTriangle"}
                size={14}
                className={a.severity === "critical" ? "text-rose-300 flex-shrink-0 mt-0.5" : "text-amber-300 flex-shrink-0 mt-0.5"}
              />
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-bold leading-tight">{a.title}</p>
                {a.body && <p className="text-white/65 text-[11px] leading-snug mt-0.5">{a.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
