import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import func2url from "../../../backend/func2url.json";
import InboxFromMarketing from "@/components/admin/InboxFromMarketing";
import { PIN_KEY, OverviewData, FunnelStage, Customer, CustomerDetail } from "./sales/types";
import DashboardHeader from "./sales/DashboardHeader";
import KpiOverview, { ChartsAndFunnel } from "./sales/KpiOverview";
import CustomersTable from "./sales/CustomersTable";
import CustomerDetailModal from "./sales/CustomerDetailModal";

const SALES_URL = (func2url as Record<string, string>)["sales-dashboard"];

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
        <DashboardHeader period={period} setPeriod={setPeriod} />

        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-200 text-sm">
            {error}
          </div>
        )}

        <KpiOverview overview={overview} funnel={funnel} />

        {/* Входящие задачи от отдела маркетинга */}
        <InboxFromMarketing pin={pin} />

        <ChartsAndFunnel overview={overview} funnel={funnel} />

        <CustomersTable
          customers={customers}
          total={total}
          q={q}
          setQ={setQ}
          segment={segment}
          setSegment={setSegment}
          offset={offset}
          setOffset={setOffset}
          limit={limit}
          onOpenCustomer={openCustomer}
        />
      </div>

      {/* Карточка клиента (модалка) */}
      {detail && (
        <CustomerDetailModal detail={detail} onClose={() => setDetail(null)} />
      )}

      {loading && (
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur border border-white/15 rounded-lg px-3 py-2 text-xs text-white/70 flex items-center gap-2">
          <Icon name="Loader2" size={12} className="animate-spin" /> Загружаю...
        </div>
      )}
    </div>
  );
}
