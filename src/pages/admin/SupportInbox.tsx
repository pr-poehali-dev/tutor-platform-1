import { useCallback, useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { Helmet } from "@/lib/helmet";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { PIN_KEY } from "./sales/types";
import { SupportList, SupportTicket, supportAdmin } from "@/components/support/api";
import MonitorPanel from "@/components/support/MonitorPanel";

const STATUS: Record<SupportTicket["status"], { label: string; cls: string }> = {
  new: { label: "Новое", cls: "bg-amber-400/15 text-amber-200 border-amber-400/30" },
  in_progress: { label: "В работе", cls: "bg-cyan-400/15 text-cyan-200 border-cyan-400/30" },
  done: { label: "Решено", cls: "bg-emerald-400/15 text-emerald-200 border-emerald-400/30" },
  spam: { label: "Спам", cls: "bg-white/10 text-white/50 border-white/15" },
};

export default function SupportInbox() {
  const pin = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";
  const [data, setData] = useState<SupportList | null>(null);
  const [filter, setFilter] = useState("");
  const [showTest, setShowTest] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await supportAdmin.list(filter, showTest);
    if (r.ok && r.data) { setData(r.data); setError(null); } else setError(r.error || "Ошибка");
  }, [filter, showTest]);

  useEffect(() => {
    if (pin) load();
  }, [pin, load]);

  if (!pin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center max-w-sm">
          <Icon name="Lock" size={28} className="text-white/60 mx-auto mb-3" />
          <p className="font-bold mb-3">Сначала войдите в админ-хаб</p>
          <Link to="/admin"><Button className="w-full">Перейти в админ-хаб</Button></Link>
        </div>
      </div>
    );
  }

  const setStatus = async (t: SupportTicket, status: string) => {
    await supportAdmin.update(t.id, { status });
    load();
  };

  const counts = data?.counts || {};
  return (
    <div className="min-h-screen bg-background text-white">
      <Helmet><title>Поддержка · Админ · УЧИСЬПРО</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Link to="/admin" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1"><Icon name="ChevronLeft" size={15} /> Админ-хаб</Link>
            <h1 className="font-montserrat font-black text-2xl">Поддержка и работа сайта</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={async () => {
              const r = await supportAdmin.notifyTest();
              setMsg(r.ok && r.data ? `Проверка отправлена: MAX — ${r.data.max ? "доставлено" : "не доставлено"}, почта (${r.data.email_to || "не задана"}) — ${r.data.email ? "доставлено" : "не доставлено"}` : r.error || "Ошибка");
            }}>
              <Icon name="BellRing" size={15} className="mr-1.5" /> Проверить уведомления
            </Button>
            <Button variant="outline" size="sm" onClick={load}><Icon name="RefreshCw" size={15} /></Button>
          </div>
        </div>
        {msg && <p className="text-sm rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">{msg}</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}

        <MonitorPanel />

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2"><Icon name="Inbox" size={18} /> Обращения</h2>
            <label className="text-xs text-white/55 flex items-center gap-1.5">
              <input type="checkbox" checked={showTest} onChange={(e) => setShowTest(e.target.checked)} /> показать проверочные
            </label>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {[["", "Все"], ["new", "Новые"], ["in_progress", "В работе"], ["done", "Решено"], ["spam", "Спам"]].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${filter === v ? "border-violet-400 bg-violet-500/20" : "border-white/10 text-white/60"}`}>
                {l}{v && counts[v] ? ` · ${counts[v]}` : ""}
              </button>
            ))}
          </div>
          {data && (
            <p className="text-xs text-white/50 mb-3">
              Чат-консультант за 7 дней: {data.chat_7d.questions} вопросов, из них {data.chat_7d.escalated} передано команде.
              Уведомления: MAX — {data.notify.max ? "подключён" : "не настроен"}, почта — {data.notify.email || "не задана"}.
            </p>
          )}
          <div className="space-y-2">
            {data?.items.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.03]">
                <button onClick={() => setOpen(open === t.id ? null : t.id)} className="w-full text-left p-3 flex items-start gap-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${STATUS[t.status]?.cls || STATUS.new.cls}`}>{STATUS[t.status]?.label || t.status}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">№{t.id} · {t.name} · {data.topics[t.subject] || t.subject}</p>
                    <p className="text-sm text-white/60 truncate">{t.message}</p>
                  </div>
                  <span className="text-xs text-white/40 shrink-0">{new Date(t.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </button>
                {open === t.id && (
                  <div className="px-3 pb-3 space-y-3 text-sm">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/70">
                      {t.email && <a href={`mailto:${t.email}?subject=${encodeURIComponent(`Ответ на обращение №${t.id} — УЧИСЬПРО`)}`} className="text-violet-300 hover:underline">{t.email}</a>}
                      {t.phone && <a href={`tel:${t.phone}`} className="text-violet-300 hover:underline">{t.phone}</a>}
                      <span>Откуда: {t.source === "widget" ? "чат на сайте" : "форма «Контакты»"}{t.page ? ` · ${t.page}` : ""}</span>
                      <span>{t.notified ? "Уведомление отправлено" : "Уведомление не доставлено"}</span>
                    </div>
                    <p className="whitespace-pre-wrap rounded-lg bg-white/[0.04] p-3">{t.message}</p>
                    {t.chat && (
                      <details className="rounded-lg bg-white/[0.03] p-3">
                        <summary className="cursor-pointer text-white/60">Переписка с ИИ-консультантом</summary>
                        <p className="whitespace-pre-wrap text-white/70 mt-2 text-xs">{t.chat}</p>
                      </details>
                    )}
                    <textarea
                      className="w-full h-16 rounded-lg bg-white/[0.05] border border-white/10 p-2 text-sm"
                      placeholder="Заметка для себя (что сделано, кто отвечает)"
                      value={notes[t.id] ?? t.note ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [t.id]: e.target.value }))}
                      onBlur={() => notes[t.id] !== undefined && supportAdmin.update(t.id, { note: notes[t.id] })}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {(["in_progress", "done", "spam", "new"] as const).filter((s) => s !== t.status).map((s) => (
                        <Button key={s} size="sm" variant="outline" onClick={() => setStatus(t, s)}>{STATUS[s].label}</Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {data && !data.items.length && <p className="text-sm text-white/50 py-6 text-center">Обращений пока нет.</p>}
          </div>
        </section>

        {data && data.recent_chat.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><Icon name="MessagesSquare" size={18} /> О чём спрашивают в чате</h2>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {data.recent_chat.map((c, i) => (
                <div key={i} className="rounded-lg bg-white/[0.03] border border-white/10 p-3 text-sm">
                  <p className="font-semibold">{c.question}</p>
                  <p className="text-white/60 mt-1">{c.answer}</p>
                  <p className="text-[11px] text-white/35 mt-1">{new Date(c.at).toLocaleString("ru-RU")}{c.page ? ` · ${c.page}` : ""}{c.escalate ? " · предложено обратиться к команде" : ""}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
