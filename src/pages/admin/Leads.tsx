import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import func2url from "../../../backend/func2url.json";
import { PIN_KEY } from "./sales/types";

const CONTACT_URL = (func2url as Record<string, string>)["contact"];

type LeadStatus = "new" | "in_progress" | "won" | "lost";

interface Lead {
  id: number;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  company: string | null;
  audience_type: string | null;
  topic: string | null;
  students_est: string | null;
  plan_interest: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const STATUS_META: Record<LeadStatus, { label: string; color: string; dot: string }> = {
  new: { label: "Новая", color: "text-sky-300 bg-sky-500/15 border-sky-500/30", dot: "bg-sky-400" },
  in_progress: { label: "В работе", color: "text-amber-300 bg-amber-500/15 border-amber-500/30", dot: "bg-amber-400" },
  won: { label: "Успех", color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30", dot: "bg-emerald-400" },
  lost: { label: "Отказ", color: "text-rose-300 bg-rose-500/15 border-rose-500/30", dot: "bg-rose-400" },
};

const AUDIENCE_LABELS: Record<string, string> = {
  author: "Автор / эксперт",
  school: "Онлайн-школа",
  business: "Компания",
  edu: "Учебное заведение",
};

const PLAN_LABELS: Record<string, string> = {
  start: "Старт",
  pro: "Про",
  scale: "Масштаб",
};

const FILTERS: { id: "all" | LeadStatus; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "new", label: "Новые" },
  { id: "in_progress", label: "В работе" },
  { id: "won", label: "Успех" },
  { id: "lost", label: "Отказ" },
];

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Leads() {
  const pin = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";

  const [items, setItems] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [grantId, setGrantId] = useState<number | null>(null);
  const [grantLinks, setGrantLinks] = useState<Record<number, string>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!pin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${CONTACT_URL}?action=leads_list`, {
        headers: { "X-Admin-Pin": pin },
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || `Ошибка ${res.status}`);
      }
      const data = await res.json();
      setItems(data.items || []);
      setCounts(data.counts || {});
      const drafts: Record<number, string> = {};
      (data.items || []).forEach((l: Lead) => { drafts[l.id] = l.note || ""; });
      setNoteDrafts(drafts);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => { load(); }, [load]);

  const update = async (id: number, patch: { status?: LeadStatus; note?: string }) => {
    setSavingId(id);
    try {
      const res = await fetch(`${CONTACT_URL}?action=lead_update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pin },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || `Ошибка ${res.status}`);
      }
      setItems((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...patch, updated_at: new Date().toISOString() } : l))
      );
      if (patch.status) {
        setCounts((prev) => {
          const next = { ...prev };
          const old = items.find((l) => l.id === id)?.status;
          if (old) next[old] = Math.max(0, (next[old] || 0) - 1);
          next[patch.status!] = (next[patch.status!] || 0) + 1;
          return next;
        });
        load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingId(null);
    }
  };

  const grantAccess = async (lead: Lead) => {
    if (grantId) return;
    if (!lead.contact_email) {
      setError(`У заявки #${lead.id} нет email — доступ выдаётся под email.`);
      return;
    }
    setGrantId(lead.id);
    setError(null);
    try {
      const res = await fetch(`${CONTACT_URL}?action=invite_grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pin },
        body: JSON.stringify({ lead_id: lead.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Ошибка ${res.status}`);
      setGrantLinks((p) => ({ ...p, [lead.id]: data.link }));
      setItems((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: "won" } : l)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGrantId(null);
    }
  };

  const copyLink = (id: number, link: string) => {
    navigator.clipboard?.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((l) => l.status === filter)),
    [items, filter]
  );

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
        <title>Заявки · Админ · УЧИСЬПРО</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <Link to="/admin" className="text-white/40 text-xs hover:text-white/70 inline-flex items-center gap-1 mb-1">
              <Icon name="ChevronLeft" size={12} /> Админ-хаб
            </Link>
            <h1 className="font-montserrat text-2xl md:text-3xl font-black">Заявки на конструктор школ</h1>
            <p className="text-white/50 text-sm mt-1">Заявки со страницы «Для бизнеса». Веди статусы и заметки по каждой.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-white/60 hover:text-white">
            <Icon name={loading ? "Loader2" : "RefreshCw"} size={15} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => {
            const cnt = f.id === "all" ? items.length : counts[f.id] || 0;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                  active
                    ? "border-purple-400/50 bg-purple-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25"
                }`}
              >
                {f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${active ? "bg-white/15" : "bg-white/8 text-white/50"}`}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="text-white/50 text-sm py-10 text-center">Загружаем заявки…</div>
        ) : filtered.length === 0 ? (
          <Card className="border border-white/10 bg-white/[0.03] p-10 text-center">
            <Icon name="Inbox" size={30} className="text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">Заявок в этом разделе пока нет.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => {
              const meta = STATUS_META[l.status];
              return (
                <Card key={l.id} className="border border-white/10 bg-white/[0.03] p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-montserrat font-bold text-base text-white">{l.contact_name}</span>
                        {l.company && <span className="text-white/50 text-sm">· {l.company}</span>}
                        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-medium ${meta.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                        </span>
                      </div>
                      <div className="text-white/40 text-xs mt-1">#{l.id} · {fmtDate(l.created_at)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-3">
                    {l.contact_phone && (
                      <a href={`tel:${l.contact_phone}`} className="inline-flex items-center gap-2 text-white/75 hover:text-white">
                        <Icon name="Phone" size={14} className="text-white/40" /> {l.contact_phone}
                      </a>
                    )}
                    {l.contact_email && (
                      <a href={`mailto:${l.contact_email}`} className="inline-flex items-center gap-2 text-white/75 hover:text-white truncate">
                        <Icon name="Mail" size={14} className="text-white/40" /> {l.contact_email}
                      </a>
                    )}
                    {l.audience_type && (
                      <span className="inline-flex items-center gap-2 text-white/70">
                        <Icon name="Users" size={14} className="text-white/40" /> {AUDIENCE_LABELS[l.audience_type] || l.audience_type}
                      </span>
                    )}
                    {l.students_est && (
                      <span className="inline-flex items-center gap-2 text-white/70">
                        <Icon name="UserCheck" size={14} className="text-white/40" /> Учеников: {l.students_est}
                      </span>
                    )}
                    {l.plan_interest && (
                      <span className="inline-flex items-center gap-2 text-white/70">
                        <Icon name="CreditCard" size={14} className="text-white/40" /> Тариф: {PLAN_LABELS[l.plan_interest] || l.plan_interest}
                      </span>
                    )}
                    {l.topic && (
                      <span className="inline-flex items-center gap-2 text-white/70">
                        <Icon name="BookOpen" size={14} className="text-white/40" /> {l.topic}
                      </span>
                    )}
                  </div>

                  {l.message && (
                    <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-white/70 text-sm mb-3">
                      {l.message}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => l.status !== s && update(l.id, { status: s })}
                        disabled={savingId === l.id}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-50 ${
                          l.status === s
                            ? STATUS_META[s].color
                            : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25"
                        }`}
                      >
                        {STATUS_META[s].label}
                      </button>
                    ))}
                  </div>

                  {/* Выдача доступа в конструктор */}
                  <div className="mb-3">
                    {grantLinks[l.id] ? (
                      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
                        <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-2">
                          <Icon name="CircleCheck" size={15} /> Персональная ссылка для {l.contact_email}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs text-white/80 bg-black/20 rounded px-2 py-1.5 truncate">{grantLinks[l.id]}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyLink(l.id, grantLinks[l.id])}
                            className="text-white/70 hover:text-white border border-white/10 flex-shrink-0"
                          >
                            <Icon name={copiedId === l.id ? "Check" : "Copy"} size={14} />
                          </Button>
                        </div>
                        <p className="text-white/45 text-[11px] mt-1.5">Отправьте ссылку автору. Доступ активируется, когда он войдёт под этим email.</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => grantAccess(l)}
                        disabled={grantId === l.id || !l.contact_email}
                        className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 text-sm font-medium px-3 py-1.5 transition-colors disabled:opacity-50"
                      >
                        <Icon name={grantId === l.id ? "Loader2" : "KeyRound"} size={15} className={grantId === l.id ? "animate-spin" : ""} />
                        Выдать доступ в конструктор
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <textarea
                      value={noteDrafts[l.id] ?? ""}
                      onChange={(e) => setNoteDrafts((p) => ({ ...p, [l.id]: e.target.value }))}
                      placeholder="Заметка менеджера: договорённости, следующий шаг…"
                      rows={2}
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/40 resize-y"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={savingId === l.id || (noteDrafts[l.id] ?? "") === (l.note || "")}
                      onClick={() => update(l.id, { note: noteDrafts[l.id] ?? "" })}
                      className="text-white/70 hover:text-white border border-white/10 mt-0.5"
                    >
                      <Icon name={savingId === l.id ? "Loader2" : "Save"} size={14} className={savingId === l.id ? "animate-spin" : ""} />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}