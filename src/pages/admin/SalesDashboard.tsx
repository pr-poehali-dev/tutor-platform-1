import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import func2url from "../../../backend/func2url.json";
import InboxFromMarketing from "@/components/admin/InboxFromMarketing";

const SALES_URL = (func2url as Record<string, string>)["sales-dashboard"];
const PIN_KEY = "uchispro_admin_pin_v1";
const PERIODS = [
  { id: 7, label: "7 дней" },
  { id: 30, label: "30 дней" },
  { id: 90, label: "90 дней" },
  { id: 365, label: "Год" },
];

interface Kpi {
  revenue: number;
  orders: number;
  unique_buyers: number;
  new_users: number;
  aov: number;
  conversion: number;
  course_revenue: number;
  sub_revenue: number;
}

interface OverviewData {
  period_days: number;
  kpi: Kpi;
  delta: { revenue_pct: number | null; orders_pct: number | null; new_users_pct: number | null };
  by_day: { date: string; revenue: number; orders: number }[];
  top_courses: { course_id: number; revenue: number; orders: number }[];
}

interface FunnelStage {
  key: string;
  label: string;
  count: number;
  conv_from_top: number;
  conv_step: number;
}

interface Customer {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  last_login_at: string | null;
  orders: number;
  spent: number;
  last_purchase_at: string | null;
  segment: "paying" | "lead" | "cold";
}

interface CustomerDetail {
  user: { id: number; name: string | null; email: string | null; phone: string | null; created_at: string; last_login_at: string | null };
  lifetime_value: number;
  paid_orders: number;
  purchases: { id: number; course_id: number; amount: number; status: string; provider: string | null; purchased_at: string | null; created_at: string }[];
  subscriptions: { plan_id: string; status: string; amount: number; started_at: string | null; expires_at: string | null; created_at: string }[];
  znaika: { balance: number; total_earned: number; total_spent: number; streak: number; level: number } | null;
}

const SEG_COLOR: Record<string, string> = {
  paying: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  lead:   "bg-amber-500/15 text-amber-200 border-amber-400/30",
  cold:   "bg-white/8 text-white/50 border-white/15",
};
const SEG_LABEL: Record<string, string> = {
  paying: "Покупатель",
  lead:   "Лид",
  cold:   "Холодный",
};

function rub(n: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
}
function num(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export default function SalesDashboard() {
  const pin = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";

  const [period, setPeriod] = useState(30);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[] | null>(null);
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [segment, setSegment] = useState<"all" | "paying" | "lead" | "cold">("all");
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJson = useCallback(async (action: string, params: Record<string, string | number> = {}) => {
    const usp = new URLSearchParams({ action, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
    const res = await fetch(`${SALES_URL}?${usp.toString()}`, {
      headers: { "X-Admin-Pin": pin },
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e?.error || `Ошибка ${res.status}`);
    }
    return res.json();
  }, [pin]);

  // Загрузка обзора + воронки при смене периода
  useEffect(() => {
    if (!pin) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchJson("overview", { days: period }),
      fetchJson("funnel", { days: period }),
    ])
      .then(([o, f]) => {
        setOverview(o);
        setFunnel(f.stages);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period, pin, fetchJson]);

  // Загрузка клиентов
  const loadCustomers = useCallback(() => {
    fetchJson("customers", { q, status: segment, limit, offset })
      .then((d) => {
        setCustomers(d.rows);
        setTotal(d.total);
      })
      .catch((e) => setError(e.message));
  }, [q, segment, offset, fetchJson]);

  useEffect(() => {
    if (pin) loadCustomers();
  }, [loadCustomers, pin]);

  const openCustomer = async (id: number) => {
    try {
      const d = await fetchJson("customer", { id });
      setDetail(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const maxFunnel = useMemo(() => Math.max(1, ...(funnel?.map((s) => s.count) ?? [1])), [funnel]);
  const maxDayRev = useMemo(() => Math.max(1, ...(overview?.by_day.map((d) => d.revenue) ?? [1])), [overview]);

  if (!pin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="border border-white/10 bg-white/[0.03] p-7 text-center max-w-sm">
          <Icon name="Lock" size={28} className="text-white/60 mx-auto mb-3" />
          <h1 className="font-montserrat text-lg font-bold mb-2">Нужен вход в админ-хаб</h1>
          <p className="text-white/55 text-sm mb-4">Сначала введи PIN на странице админ-хаба.</p>
          <Link to="/admin">
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 w-full">Перейти в админ-хаб</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Отдел продаж · УЧИСЬПРО</title>
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
              <Icon name="BarChart3" size={28} className="text-emerald-300" />
              Отдел продаж
            </h1>
            <p className="text-white/55 text-sm mt-1">Метрики, воронка и клиентская база</p>
          </div>
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
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-200 text-sm">
            {error}
          </div>
        )}

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

        {/* Входящие задачи от отдела маркетинга */}
        <InboxFromMarketing pin={pin} />

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

        {/* Клиентская база */}
        <Card className="border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-montserrat text-base font-bold text-white flex items-center gap-2">
              <Icon name="Users" size={18} className="text-cyan-300" />
              База клиентов
              <span className="text-white/40 text-sm font-normal">({num(total)})</span>
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                value={q}
                onChange={(e) => { setOffset(0); setQ(e.target.value); }}
                placeholder="Email, имя или телефон..."
                className="h-9 w-64 bg-white/[0.04] border-white/12"
              />
              <div className="flex bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
                {(["all", "paying", "lead", "cold"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setOffset(0); setSegment(s); }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      segment === s ? "bg-white/10 text-white" : "text-white/55 hover:text-white"
                    }`}
                  >
                    {s === "all" ? "Все" : SEG_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/45 text-xs uppercase tracking-wider border-b border-white/8">
                  <th className="text-left font-semibold px-5 py-2">Клиент</th>
                  <th className="text-left font-semibold py-2">Контакт</th>
                  <th className="text-left font-semibold py-2">Сегмент</th>
                  <th className="text-right font-semibold py-2">Заказов</th>
                  <th className="text-right font-semibold py-2">Потратил</th>
                  <th className="text-left font-semibold py-2">Регистрация</th>
                  <th className="text-right font-semibold px-5 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers?.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-white/40 py-10">Ничего не найдено</td></tr>
                )}
                {customers?.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-2.5">
                      <div className="font-semibold text-white">{c.name || "Без имени"}</div>
                      <div className="text-white/35 text-xs">ID {c.id}</div>
                    </td>
                    <td className="py-2.5">
                      <div className="text-white/80">{c.email || "—"}</div>
                      <div className="text-white/35 text-xs">{c.phone || ""}</div>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className={`text-[10px] ${SEG_COLOR[c.segment]}`}>
                        {SEG_LABEL[c.segment]}
                      </Badge>
                    </td>
                    <td className="text-right py-2.5 font-semibold">{c.orders}</td>
                    <td className="text-right py-2.5 text-emerald-300 font-semibold">{rub(c.spent)}</td>
                    <td className="py-2.5 text-white/55 text-xs">
                      {new Date(c.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="text-right px-5 py-2.5">
                      <Button variant="ghost" size="sm" onClick={() => openCustomer(c.id)} className="h-7 text-xs">
                        Карточка <Icon name="ChevronRight" size={12} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {total > limit && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-white/45">
                {offset + 1}–{Math.min(offset + limit, total)} из {num(total)}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
                  <Icon name="ChevronLeft" size={14} /> Назад
                </Button>
                <Button variant="outline" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>
                  Вперёд <Icon name="ChevronRight" size={14} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Карточка клиента (модалка) */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setDetail(null)}>
          <Card className="border border-white/15 bg-card max-w-2xl w-full my-8 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="text-white/40 text-xs">Клиент #{detail.user.id}</div>
                <h2 className="font-montserrat text-2xl font-bold">{detail.user.name || "Без имени"}</h2>
                <div className="text-white/65 text-sm">{detail.user.email}</div>
                <div className="text-white/45 text-xs">{detail.user.phone || ""}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDetail(null)}>
                <Icon name="X" size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <MiniStat label="LTV" value={rub(detail.lifetime_value)} accent="text-emerald-300" />
              <MiniStat label="Заказов" value={String(detail.paid_orders)} accent="text-purple-300" />
              <MiniStat label="С нами" value={`${Math.floor((Date.now() - new Date(detail.user.created_at).getTime()) / 86400000)} дн.`} accent="text-cyan-300" />
            </div>

            {detail.znaika && (
              <Card className="border border-amber-400/25 bg-amber-500/[0.06] p-3 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-amber-200 font-semibold">
                    <Icon name="Coins" size={14} /> ЗНАЙКИ
                  </div>
                  <div className="text-white">
                    Баланс: <b className="text-amber-200">{num(detail.znaika.balance)}</b> · Уровень {detail.znaika.level} · Стрик {detail.znaika.streak} дн.
                  </div>
                </div>
              </Card>
            )}

            <div className="mb-5">
              <h4 className="text-white/65 text-xs uppercase tracking-wider font-bold mb-2">Покупки курсов</h4>
              {detail.purchases.length === 0 ? (
                <div className="text-white/40 text-sm">Покупок не было</div>
              ) : (
                <div className="space-y-1.5">
                  {detail.purchases.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.025] border border-white/8 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium">Курс #{p.course_id}</div>
                        <div className="text-white/40 text-xs">{new Date(p.created_at).toLocaleString("ru-RU")} · {p.provider || "—"}</div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${
                        p.status === "paid" ? "border-emerald-400/30 text-emerald-200 bg-emerald-500/10" : "border-amber-400/30 text-amber-200 bg-amber-500/10"
                      }`}>{p.status}</Badge>
                      <div className="text-emerald-300 font-bold w-20 text-right">{rub(p.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {detail.subscriptions.length > 0 && (
              <div>
                <h4 className="text-white/65 text-xs uppercase tracking-wider font-bold mb-2">Подписки</h4>
                <div className="space-y-1.5">
                  {detail.subscriptions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.025] border border-white/8 text-sm">
                      <div className="text-white">{s.plan_id}</div>
                      <Badge variant="outline" className="text-[10px] border-white/15 text-white/70">{s.status}</Badge>
                      <div className="text-emerald-300 font-bold w-20 text-right">{rub(s.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {loading && (
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur border border-white/15 rounded-lg px-3 py-2 text-xs text-white/70 flex items-center gap-2">
          <Icon name="Loader2" size={12} className="animate-spin" /> Загружаю...
        </div>
      )}
    </div>
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

function MiniStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
      <div className="text-white/50 text-xs">{label}</div>
      <div className={`font-montserrat font-bold text-lg ${accent}`}>{value}</div>
    </div>
  );
}