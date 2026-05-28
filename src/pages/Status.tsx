import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import {
  fetchSystemHealth, fetchSystemAlerts, fetchBackups,
  SystemHealth, SystemAlert, BackupDay,
} from "@/components/system/api";

const SITE = "https://xn--h1agdcde2c.xn--p1ai";

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  ok:       { label: "Все системы работают штатно",  color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/35", emoji: "🟢" },
  warning:  { label: "Незначительные сбои",          color: "text-amber-300",   bg: "bg-amber-500/15 border-amber-500/35",     emoji: "🟡" },
  critical: { label: "Критические сбои",             color: "text-rose-300",    bg: "bg-rose-500/15 border-rose-500/35",       emoji: "🔴" },
};

const FUNC_STATUS_COLOR: Record<string, string> = {
  ok:       "bg-emerald-400",
  degraded: "bg-amber-400",
  fail:     "bg-rose-500",
};

function bytesToHuman(b: number): string {
  if (b < 1024) return `${b} Б`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} КБ`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} МБ`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} ГБ`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "только что";
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return `${Math.floor(diff / 86400)} дн назад`;
  } catch { return "—"; }
}

export default function Status() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [backups, setBackups] = useState<BackupDay[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [h, a, b] = await Promise.all([fetchSystemHealth(), fetchSystemAlerts(), fetchBackups()]);
    setHealth(h);
    setAlerts(a);
    setBackups(b);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const meta = STATUS_LABEL[health?.overall_status || "ok"] || STATUS_LABEL.ok;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Статус систем · УЧИСЬПРО"
        description="Прозрачный мониторинг работы всех модулей образовательной платформы. Обновляется в реальном времени."
        canonical={`${SITE}/status`}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-lg">📊</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Статус" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <section className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 rounded-full px-4 py-1.5 mb-3">
            <Icon name="Activity" size={12} className="text-emerald-300" />
            <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Статус систем</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-2">
            Открытый <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">мониторинг</span>
          </h1>
          <p className="text-white/65 text-sm">Обновляется автоматически каждую минуту</p>
        </section>

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={24} className="animate-spin mx-auto text-white/45" />
          </div>
        ) : (
          <>
            {/* Главный статус */}
            <section className={`border rounded-3xl p-5 md:p-6 mb-5 ${meta.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{meta.emoji}</span>
                <div>
                  <p className={`font-montserrat font-black text-lg md:text-xl ${meta.color}`}>
                    {meta.label}
                  </p>
                  {health && (
                    <p className="text-white/55 text-xs">
                      Активных функций: {health.ok} из {health.total}
                      {health.fail > 0 && ` · с ошибками: ${health.fail}`}
                      {health.degraded > 0 && ` · замедлены: ${health.degraded}`}
                    </p>
                  )}
                </div>
              </div>

              {health && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/25 rounded-xl p-2.5 text-center">
                    <p className="text-emerald-300 font-montserrat font-black text-2xl tabular-nums">{health.ok}</p>
                    <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider">Работают</p>
                  </div>
                  <div className="bg-black/25 rounded-xl p-2.5 text-center">
                    <p className="text-amber-300 font-montserrat font-black text-2xl tabular-nums">{health.degraded}</p>
                    <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider">Замедлены</p>
                  </div>
                  <div className="bg-black/25 rounded-xl p-2.5 text-center">
                    <p className="text-rose-300 font-montserrat font-black text-2xl tabular-nums">{health.fail}</p>
                    <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider">Не отвечают</p>
                  </div>
                </div>
              )}
            </section>

            {/* Активные алерты */}
            {alerts.length > 0 && (
              <section className="mb-5">
                <h2 className="font-montserrat font-black text-white text-base mb-2 flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} className="text-amber-300" />
                  Активные инциденты ({alerts.length})
                </h2>
                <div className="space-y-2">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className={`border rounded-2xl p-3 ${
                        a.severity === "critical" ? "bg-rose-500/10 border-rose-500/30" :
                        a.severity === "warning" ? "bg-amber-500/10 border-amber-500/30" :
                        "bg-white/[0.04] border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon
                          name={a.severity === "critical" ? "AlertCircle" : "AlertTriangle"}
                          size={14}
                          className={`flex-shrink-0 mt-0.5 ${a.severity === "critical" ? "text-rose-300" : "text-amber-300"}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-bold leading-tight">{a.title}</p>
                          {a.body && <p className="text-white/65 text-xs leading-snug mt-1">{a.body}</p>}
                          <p className="text-white/35 text-[10px] mt-1">
                            {a.source} · {timeAgo(a.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Список функций */}
            {health && health.items.length > 0 && (
              <section className="bg-card/60 border border-white/10 rounded-3xl p-5 mb-5">
                <h2 className="font-montserrat font-black text-white text-base mb-3 flex items-center gap-2">
                  <Icon name="Server" size={16} className="text-cyan-300" />
                  Сервисы ({health.items.length})
                </h2>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {health.items.map((it) => (
                    <div key={it.name} className="flex items-center gap-2.5 p-2 bg-white/[0.03] rounded-lg">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${FUNC_STATUS_COLOR[it.status] || "bg-white/30"}`} />
                      <span className="text-white text-xs font-bold flex-1 truncate">{it.name}</span>
                      {it.last_latency_ms && (
                        <span className="text-white/45 text-[10px] tabular-nums">{it.last_latency_ms} мс</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Бэкапы */}
            <section className="bg-card/60 border border-white/10 rounded-3xl p-5">
              <h2 className="font-montserrat font-black text-white text-base mb-3 flex items-center gap-2">
                <Icon name="Database" size={16} className="text-purple-300" />
                Ежедневные бэкапы
              </h2>
              {backups.length === 0 ? (
                <p className="text-white/55 text-sm">Первый бэкап создаётся ночью в 03:00 UTC.</p>
              ) : (
                <div className="space-y-1.5">
                  {backups.slice(0, 7).map((b) => (
                    <div key={b.date} className="flex items-center gap-2.5 p-2 bg-white/[0.03] rounded-lg flex-wrap">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        b.fail_count === 0 ? "bg-emerald-400" : "bg-amber-400"
                      }`} />
                      <span className="text-white text-xs font-bold tabular-nums">
                        {new Date(b.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                      </span>
                      <span className="text-emerald-300 text-[11px]">
                        {b.ok_count} ✓
                      </span>
                      {b.fail_count > 0 && (
                        <span className="text-amber-300 text-[11px]">{b.fail_count} ✗</span>
                      )}
                      <span className="text-white/55 text-[11px] ml-auto">
                        {b.total_rows.toLocaleString("ru-RU")} строк · {bytesToHuman(b.total_bytes)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-white/45 text-[11px] mt-3">
                Хранение 30 дней · 25 ключевых таблиц · сжатие gzip · загрузка в S3
              </p>
            </section>
          </>
        )}

        <p className="text-center text-white/35 text-xs mt-6">
          Видишь проблему? Напиши в <Link to="/contacts" className="text-cyan-300 hover:text-cyan-200">обратную связь</Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
