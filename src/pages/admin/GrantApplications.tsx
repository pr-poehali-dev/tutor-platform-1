import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import func2url from "../../../backend/func2url.json";
import { PIN_KEY } from "./sales/types";

const GRANT_URL = (func2url as Record<string, string>)["grant-assistant"];

interface GrantApp {
  id: number;
  grant_name: string;
  organization: string | null;
  project_title: string | null;
  contact_email: string | null;
  is_paid: boolean;
  price_kopecks: number;
  status: string;
  created_at: string | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function rub(kop: number): string {
  return (kop / 100).toLocaleString("ru-RU");
}

export default function GrantApplications() {
  const pin = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";

  const [items, setItems] = useState<GrantApp[]>([]);
  const [total, setTotal] = useState(0);
  const [paid, setPaid] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyPaid, setOnlyPaid] = useState(false);

  const load = useCallback(async () => {
    if (!pin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GRANT_URL}?action=admin_list`, { headers: { "X-Admin-Pin": pin } });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || `Ошибка ${res.status}`);
      }
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPaid(data.paid || 0);
      setRevenue(data.revenue_kopecks || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = onlyPaid ? items.filter((i) => i.is_paid) : items;

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
        <title>Заявки на гранты · Админ · УЧИСЬПРО</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <Link to="/admin" className="text-white/40 text-xs hover:text-white/70 inline-flex items-center gap-1 mb-1">
              <Icon name="ChevronLeft" size={12} /> Админ-хаб
            </Link>
            <h1 className="font-montserrat text-2xl md:text-3xl font-black">Заявки на гранты</h1>
            <p className="text-white/50 text-sm mt-1">ИИ-помощник по грантам: все подготовленные заявки и выручка.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-white/60 hover:text-white">
            <Icon name={loading ? "Loader2" : "RefreshCw"} size={15} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Метрики */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border border-white/10 bg-white/[0.03] p-4">
            <div className="text-white/45 text-xs mb-1">Всего заявок</div>
            <div className="font-montserrat font-black text-2xl">{total}</div>
          </Card>
          <Card className="border border-white/10 bg-white/[0.03] p-4">
            <div className="text-white/45 text-xs mb-1">Оплачено</div>
            <div className="font-montserrat font-black text-2xl text-emerald-300">{paid}</div>
          </Card>
          <Card className="border border-white/10 bg-white/[0.03] p-4">
            <div className="text-white/45 text-xs mb-1">Выручка</div>
            <div className="font-montserrat font-black text-2xl text-emerald-300">{rub(revenue)} ₽</div>
          </Card>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setOnlyPaid(false)}
            className={`rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all ${!onlyPaid ? "border-purple-400/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25"}`}
          >
            Все
          </button>
          <button
            onClick={() => setOnlyPaid(true)}
            className={`rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all ${onlyPaid ? "border-emerald-400/50 bg-emerald-500/15 text-white" : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25"}`}
          >
            Только оплаченные
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">{error}</div>
        )}

        {loading && items.length === 0 ? (
          <div className="text-white/50 text-sm py-10 text-center">Загружаем заявки…</div>
        ) : filtered.length === 0 ? (
          <Card className="border border-white/10 bg-white/[0.03] p-10 text-center">
            <Icon name="Inbox" size={30} className="text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">Заявок пока нет.</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((a) => (
              <Card key={a.id} className="border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-montserrat font-bold text-sm text-white">
                        {a.project_title || "Проект без названия"}
                      </span>
                      {a.is_paid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-md px-2 py-0.5">
                          <Icon name="Check" size={10} /> Оплачено · {rub(a.price_kopecks)} ₽
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/50 bg-white/8 border border-white/15 rounded-md px-2 py-0.5">
                          Черновик
                        </span>
                      )}
                    </div>
                    <div className="text-white/55 text-xs mt-1">
                      {a.grant_name}
                      {a.organization ? ` · ${a.organization}` : ""}
                    </div>
                    <div className="text-white/35 text-xs mt-0.5">
                      #{a.id} · {fmtDate(a.created_at)}
                      {a.contact_email ? ` · ${a.contact_email}` : ""}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
