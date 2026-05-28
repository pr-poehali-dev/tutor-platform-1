import Icon from "@/components/ui/icon";
import { CronRun } from "@/components/feed/api";
import { dt } from "./dt";

interface AdminFeedCronHistorySectionProps {
  cronRuns: CronRun[];
}

export default function AdminFeedCronHistorySection({ cronRuns }: AdminFeedCronHistorySectionProps) {
  return (
    <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="History" size={16} className="text-cyan-300" />
          <span className="text-cyan-300 text-[11px] uppercase tracking-wider font-bold">Автозапуски</span>
        </div>
        <span className="text-white/55 text-xs">Раз в 6 часов · последних: <span className="text-white font-bold">{cronRuns.length}</span></span>
      </div>
      <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">История работы ИИ-агента</h2>

      {cronRuns.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-white/55 text-sm mb-1">Cron ещё ни разу не запускался</p>
          <p className="text-white/35 text-xs">
            Первый автозапуск произойдёт в ближайшие 6 часов или нажми «Обход источников» вручную.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {cronRuns.map((r) => {
            const isError = r.status === "error";
            const isRunning = r.status === "running";
            return (
              <div
                key={r.id}
                className={`bg-white/[0.04] border rounded-2xl p-3 ${
                  isError ? "border-rose-500/35" :
                  isRunning ? "border-cyan-500/35 bg-cyan-500/[0.05]" :
                  "border-emerald-500/25"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={isError ? "AlertCircle" : isRunning ? "Loader2" : "CheckCircle2"}
                      size={14}
                      className={`${isError ? "text-rose-300" : isRunning ? "text-cyan-300 animate-spin" : "text-emerald-300"}`}
                    />
                    <span className="text-white font-bold text-sm">#{r.id}</span>
                    <span className="text-white/45 text-[11px]">{dt(r.started_at)}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isError ? "bg-rose-500/20 text-rose-200" :
                    isRunning ? "bg-cyan-500/20 text-cyan-200" :
                    "bg-emerald-500/20 text-emerald-200"
                  }`}>
                    {isError ? "Ошибка" : isRunning ? "Выполняется" : "Готово"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="bg-black/20 rounded-lg px-2 py-1.5">
                    <p className="text-white/45 text-[10px] uppercase font-bold">Спарсено</p>
                    <p className="text-white font-bold tabular-nums">+{r.fetched}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg px-2 py-1.5">
                    <p className="text-white/45 text-[10px] uppercase font-bold">Проверено</p>
                    <p className="text-white font-bold tabular-nums">{r.moderated}</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg px-2 py-1.5">
                    <p className="text-emerald-300/65 text-[10px] uppercase font-bold">Одобрено</p>
                    <p className="text-emerald-200 font-bold tabular-nums">{r.approved}</p>
                  </div>
                  <div className="bg-rose-500/10 rounded-lg px-2 py-1.5">
                    <p className="text-rose-300/65 text-[10px] uppercase font-bold">Отклонено</p>
                    <p className="text-rose-200 font-bold tabular-nums">{r.rejected}</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg px-2 py-1.5">
                    <p className="text-amber-300/65 text-[10px] uppercase font-bold">На флаге</p>
                    <p className="text-amber-200 font-bold tabular-nums">{r.flagged}</p>
                  </div>
                </div>
                {r.error_message && (
                  <p className="text-rose-300 text-[11px] mt-2 truncate" title={r.error_message}>
                    ⚠ {r.error_message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
