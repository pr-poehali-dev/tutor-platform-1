import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { OverviewData, FunnelStage, rub, num } from "./types";

interface Props {
  overview: OverviewData | null;
  funnel: FunnelStage[] | null;
}

export default function KpiOverview({ overview, funnel }: Props) {
  const maxFunnel = useMemo(() => Math.max(1, ...(funnel?.map((s) => s.count) ?? [1])), [funnel]);
  const maxDayRev = useMemo(() => Math.max(1, ...(overview?.by_day.map((d) => d.revenue) ?? [1])), [overview]);

  return (
    <>
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KpiCard
          icon="TrendingUp"
          label="Выручка"
          value={overview ? rub(overview.kpi.revenue) : "—"}
          delta={overview?.delta.revenue_pct}
          accent="text-emerald-300"
          sub={overview ? `Курсы ${rub(overview.kpi.course_revenue)} + Подписки ${rub(overview.kpi.sub_revenue)}` : ""}
        />
        <KpiCard
          icon="ShoppingCart"
          label="Продаж"
          value={overview ? num(overview.kpi.orders) : "—"}
          delta={overview?.delta.orders_pct}
          accent="text-purple-300"
          sub={overview ? `Уникальных покупателей: ${overview.kpi.unique_buyers}` : ""}
        />
        <KpiCard
          icon="UserPlus"
          label="Новых клиентов"
          value={overview ? num(overview.kpi.new_users) : "—"}
          delta={overview?.delta.new_users_pct}
          accent="text-cyan-300"
          sub={overview ? `Конверсия в покупку: ${overview.kpi.conversion}%` : ""}
        />
        <KpiCard
          icon="Receipt"
          label="Средний чек"
          value={overview ? rub(overview.kpi.aov) : "—"}
          accent="text-amber-300"
          sub="по оплаченным заказам"
        />
      </div>
    </>
  );
}

export function ChartsAndFunnel({ overview, funnel }: Props) {
  const maxFunnel = useMemo(() => Math.max(1, ...(funnel?.map((s) => s.count) ?? [1])), [funnel]);
  const maxDayRev = useMemo(() => Math.max(1, ...(overview?.by_day.map((d) => d.revenue) ?? [1])), [overview]);

  return (
    <>
      {/* Динамика и воронка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card className="border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
          <h3 className="font-montserrat text-sm font-bold text-white/85 mb-4 flex items-center gap-2">
            <Icon name="LineChart" size={16} className="text-emerald-300" />
            Выручка по дням
          </h3>
          {!overview || overview.by_day.length === 0 ? (
            <div className="text-white/40 text-sm text-center py-10">Нет оплаченных заказов за период</div>
          ) : (
            <div className="flex items-end gap-1 h-44">
              {overview.by_day.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500/70 to-emerald-400/40 hover:from-emerald-400 hover:to-cyan-400 transition-all"
                    style={{ height: `${(d.revenue / maxDayRev) * 100}%`, minHeight: "2px" }}
                  />
                  <div className="absolute -top-12 hidden group-hover:flex flex-col items-center pointer-events-none">
                    <div className="bg-black/90 border border-white/15 px-2 py-1 rounded text-xs whitespace-nowrap">
                      <div className="text-white/60">{d.date.slice(5)}</div>
                      <div className="text-emerald-300 font-bold">{rub(d.revenue)}</div>
                      <div className="text-white/50">{d.orders} заказ.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-montserrat text-sm font-bold text-white/85 mb-4 flex items-center gap-2">
            <Icon name="Filter" size={16} className="text-purple-300" />
            Воронка продаж
          </h3>
          <div className="space-y-2">
            {funnel?.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/65">{s.label}</span>
                  <span className="text-white/85 font-semibold">{num(s.count)}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    style={{ width: `${(s.count / maxFunnel) * 100}%` }}
                  />
                </div>
                <div className="text-white/35 text-[10px] mt-0.5">
                  {s.conv_step}% от пред. этапа · {s.conv_from_top}% от вершины
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Топ курсов */}
      {overview && overview.top_courses.length > 0 && (
        <Card className="border border-white/10 bg-white/[0.03] p-5 mb-8">
          <h3 className="font-montserrat text-sm font-bold text-white/85 mb-4 flex items-center gap-2">
            <Icon name="Trophy" size={16} className="text-amber-300" />
            Топ курсов по выручке
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {overview.top_courses.map((c, i) => (
              <div key={c.course_id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/[0.025] border border-white/8">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-white/40 text-xs w-5">#{i + 1}</span>
                  <span className="text-white text-sm font-medium truncate">Курс #{c.course_id}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-emerald-300 font-bold text-sm">{rub(c.revenue)}</div>
                  <div className="text-white/40 text-xs">{c.orders} продаж</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function KpiCard({ icon, label, value, delta, accent, sub }: { icon: string; label: string; value: string; delta?: number | null; accent: string; sub?: string }) {
  return (
    <Card className="border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-white/55 text-xs font-medium">
          <Icon name={icon} size={14} className={accent} />
          {label}
        </div>
        {delta !== null && delta !== undefined && (
          <span className={`text-xs font-bold ${delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div className={`font-montserrat font-black text-2xl ${accent}`}>{value}</div>
      {sub && <div className="text-white/40 text-xs mt-1">{sub}</div>}
    </Card>
  );
}
