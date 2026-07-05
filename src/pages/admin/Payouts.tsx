import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import func2url from "../../../backend/func2url.json";
import { PIN_KEY } from "./sales/types";

const CONTACT_URL = (func2url as Record<string, string>)["contact"];

interface PayoutRow {
  school_id: number;
  school_name: string;
  fee_percent: number;
  gross_kopecks: number;
  platform_fee_kopecks: number;
  school_share_kopecks: number;
  paid_out_kopecks: number;
  pending_kopecks: number;
  paid_count: number;
  agreement_accepted: boolean;
  agreement_at: string | null;
}

interface Totals {
  gross_kopecks: number;
  platform_fee_kopecks: number;
  school_share_kopecks: number;
  paid_out_kopecks: number;
  pending_kopecks: number;
}

interface HistoryRow {
  id: number;
  school_id: number;
  school_name: string | null;
  amount_kopecks: number;
  method: string | null;
  note: string | null;
  created_at: string | null;
}

interface PayoutRequest {
  id: number;
  school_id: number;
  school_name: string | null;
  amount_kopecks: number;
  requisites: string | null;
  comment: string | null;
  status: string;
  admin_note: string | null;
  created_at: string | null;
}

const REQ_STATUS: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "text-sky-300 bg-sky-500/15 border-sky-500/30" },
  processing: { label: "В обработке", color: "text-amber-300 bg-amber-500/15 border-amber-500/30" },
  done: { label: "Выплачено", color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" },
  rejected: { label: "Отклонена", color: "text-rose-300 bg-rose-500/15 border-rose-500/30" },
};

function rub(kopecks: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(kopecks / 100) + " ₽";
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Payouts() {
  const pin = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";

  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [reqBusyId, setReqBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [amountDrafts, setAmountDrafts] = useState<Record<number, string>>({});
  const [methodDrafts, setMethodDrafts] = useState<Record<number, string>>({});
  const [showHistory, setShowHistory] = useState(false);

  const load = useCallback(async () => {
    if (!pin) return;
    setLoading(true);
    setError(null);
    try {
      const [sumRes, histRes, reqRes] = await Promise.all([
        fetch(`${CONTACT_URL}?action=payouts_summary`, { headers: { "X-Admin-Pin": pin } }),
        fetch(`${CONTACT_URL}?action=payouts_history`, { headers: { "X-Admin-Pin": pin } }),
        fetch(`${CONTACT_URL}?action=payout_requests`, { headers: { "X-Admin-Pin": pin } }),
      ]);
      if (!sumRes.ok) {
        const e = await sumRes.json().catch(() => ({}));
        throw new Error(e?.error || `Ошибка ${sumRes.status}`);
      }
      const sum = await sumRes.json();
      setRows(sum.items || []);
      setTotals(sum.totals || null);
      if (histRes.ok) {
        const h = await histRes.json();
        setHistory(h.items || []);
      }
      if (reqRes.ok) {
        const rq = await reqRes.json();
        setRequests(rq.items || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => { load(); }, [load]);

  const pay = async (row: PayoutRow) => {
    const raw = (amountDrafts[row.school_id] ?? "").replace(",", ".").trim();
    const rubles = raw ? parseFloat(raw) : row.pending_kopecks / 100;
    if (!rubles || rubles <= 0 || Number.isNaN(rubles)) {
      setError("Укажите корректную сумму выплаты");
      return;
    }
    setPayingId(row.school_id);
    setError(null);
    try {
      const res = await fetch(`${CONTACT_URL}?action=payout_create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pin },
        body: JSON.stringify({
          school_id: row.school_id,
          amount_kopecks: Math.round(rubles * 100),
          method: methodDrafts[row.school_id] || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Ошибка ${res.status}`);
      setAmountDrafts((p) => ({ ...p, [row.school_id]: "" }));
      setMethodDrafts((p) => ({ ...p, [row.school_id]: "" }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPayingId(null);
    }
  };

  const updateRequest = async (id: number, status: string) => {
    setReqBusyId(id);
    setError(null);
    try {
      const res = await fetch(`${CONTACT_URL}?action=payout_request_update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pin },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Ошибка ${res.status}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setReqBusyId(null);
    }
  };

  const openRequests = useMemo(() => requests.filter((r) => r.status === "new" || r.status === "processing"), [requests]);

  const totalCards = useMemo(() => totals && [
    { label: "Выручка (оплачено)", value: rub(totals.gross_kopecks), color: "text-white" },
    { label: "Комиссия платформы", value: rub(totals.platform_fee_kopecks), color: "text-emerald-300" },
    { label: "Доля школ", value: rub(totals.school_share_kopecks), color: "text-sky-300" },
    { label: "Осталось выплатить", value: rub(totals.pending_kopecks), color: "text-amber-300" },
  ], [totals]);

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
        <title>Выплаты школам · Админ · УЧИСЬПРО</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <Link to="/admin" className="text-white/40 text-xs hover:text-white/70 inline-flex items-center gap-1 mb-1">
              <Icon name="ChevronLeft" size={12} /> Админ-хаб
            </Link>
            <h1 className="font-montserrat text-2xl md:text-3xl font-black">Выплаты школам</h1>
            <p className="text-white/50 text-sm mt-1">Реестр начислений: продажи, комиссия платформы и доля каждой школы к выплате.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-white/60 hover:text-white">
            <Icon name={loading ? "Loader2" : "RefreshCw"} size={15} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {totalCards && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {totalCards.map((c) => (
              <Card key={c.label} className="border border-white/10 bg-white/[0.03] p-4">
                <div className="text-white/50 text-xs mb-1">{c.label}</div>
                <div className={`font-montserrat font-bold text-lg ${c.color}`}>{c.value}</div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {openRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="font-montserrat font-bold text-white mb-3 flex items-center gap-2">
              <Icon name="Send" size={17} className="text-amber-300" />
              Заявки на вывод
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">{openRequests.length}</span>
            </h2>
            <div className="space-y-3">
              {openRequests.map((r) => {
                const meta = REQ_STATUS[r.status] || REQ_STATUS.new;
                return (
                  <Card key={r.id} className="border border-amber-500/25 bg-amber-500/[0.05] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-montserrat font-bold text-white">{r.school_name || `Школа #${r.school_id}`}</span>
                          <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                        </div>
                        <div className="text-white/45 text-xs mt-1">{fmtDate(r.created_at)}</div>
                      </div>
                      <span className="font-montserrat font-black text-lg text-amber-300">{rub(r.amount_kopecks)}</span>
                    </div>

                    <div className="rounded-lg bg-black/20 border border-white/10 px-3 py-2 mb-3 text-sm">
                      <div className="text-white/45 text-xs mb-0.5">Реквизиты для перевода</div>
                      <div className="text-white/90 break-words">{r.requisites || "—"}</div>
                      {r.comment && <div className="text-white/55 text-xs mt-1">Комментарий: {r.comment}</div>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {r.status === "new" && (
                        <Button size="sm" variant="ghost" disabled={reqBusyId === r.id}
                          onClick={() => updateRequest(r.id, "processing")}
                          className="text-amber-200 border border-amber-500/30 hover:bg-amber-500/10">
                          <Icon name="Clock" size={14} className="mr-1" /> В обработку
                        </Button>
                      )}
                      <Button size="sm" disabled={reqBusyId === r.id}
                        onClick={() => updateRequest(r.id, "done")}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        <Icon name={reqBusyId === r.id ? "Loader2" : "Check"} size={14} className={reqBusyId === r.id ? "animate-spin mr-1" : "mr-1"} /> Выплачено
                      </Button>
                      <Button size="sm" variant="ghost" disabled={reqBusyId === r.id}
                        onClick={() => updateRequest(r.id, "rejected")}
                        className="text-rose-300 border border-rose-500/30 hover:bg-rose-500/10">
                        <Icon name="X" size={14} className="mr-1" /> Отклонить
                      </Button>
                    </div>
                    <p className="text-white/35 text-[11px] mt-2">
                      «Выплачено» отметит заявку выполненной. Не забудь также отметить сумму в реестре школы ниже.
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {loading && rows.length === 0 ? (
          <div className="text-white/50 text-sm py-10 text-center">Загружаем реестр…</div>
        ) : rows.length === 0 ? (
          <Card className="border border-white/10 bg-white/[0.03] p-10 text-center">
            <Icon name="Wallet" size={30} className="text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">Школ пока нет.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <Card key={r.school_id} className="border border-white/10 bg-white/[0.03] p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-montserrat font-bold text-base text-white">{r.school_name}</span>
                      {r.agreement_accepted ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 text-[11px] font-medium">
                          <Icon name="ShieldCheck" size={11} /> Договор принят
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/15 text-rose-300 px-1.5 py-0.5 text-[11px] font-medium">
                          <Icon name="ShieldAlert" size={11} /> Договор не принят
                        </span>
                      )}
                    </div>
                    <div className="text-white/45 text-xs mt-0.5">
                      Комиссия платформы {r.fee_percent}% · продаж: {r.paid_count}
                    </div>
                  </div>
                  {r.pending_kopecks > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 text-amber-300 px-2.5 py-1 text-xs font-medium">
                      К выплате {rub(r.pending_kopecks)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 px-2.5 py-1 text-xs font-medium">
                      <Icon name="Check" size={13} /> Выплачено
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                  <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
                    <div className="text-white/45 text-xs">Выручка</div>
                    <div className="text-white font-medium">{rub(r.gross_kopecks)}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
                    <div className="text-white/45 text-xs">Комиссия</div>
                    <div className="text-emerald-300 font-medium">{rub(r.platform_fee_kopecks)}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
                    <div className="text-white/45 text-xs">Доля школы</div>
                    <div className="text-sky-300 font-medium">{rub(r.school_share_kopecks)}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
                    <div className="text-white/45 text-xs">Уже выплачено</div>
                    <div className="text-white/70 font-medium">{rub(r.paid_out_kopecks)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={amountDrafts[r.school_id] ?? ""}
                    onChange={(e) => setAmountDrafts((p) => ({ ...p, [r.school_id]: e.target.value }))}
                    placeholder={r.pending_kopecks > 0 ? `${(r.pending_kopecks / 100).toFixed(2)} ₽` : "Сумма, ₽"}
                    inputMode="decimal"
                    className="w-32 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/40"
                  />
                  <input
                    value={methodDrafts[r.school_id] ?? ""}
                    onChange={(e) => setMethodDrafts((p) => ({ ...p, [r.school_id]: e.target.value }))}
                    placeholder="Способ (перевод, карта…)"
                    className="flex-1 min-w-[140px] bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/40"
                  />
                  <Button
                    size="sm"
                    onClick={() => pay(r)}
                    disabled={payingId === r.school_id || (r.pending_kopecks <= 0 && !(amountDrafts[r.school_id] ?? "").trim())}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white disabled:opacity-50"
                  >
                    <Icon name={payingId === r.school_id ? "Loader2" : "Banknote"} size={15} className={payingId === r.school_id ? "animate-spin mr-1" : "mr-1"} />
                    Отметить выплату
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium mb-3"
            >
              <Icon name={showHistory ? "ChevronDown" : "ChevronRight"} size={15} />
              История выплат ({history.length})
            </button>
            {showHistory && (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm">
                    <div className="text-white/80 font-medium">{h.school_name || `Школа #${h.school_id}`}</div>
                    <div className="flex items-center gap-3 text-white/55">
                      {h.method && <span>{h.method}</span>}
                      <span className="text-emerald-300 font-medium">{rub(h.amount_kopecks)}</span>
                      <span className="text-white/40 text-xs">{fmtDate(h.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}