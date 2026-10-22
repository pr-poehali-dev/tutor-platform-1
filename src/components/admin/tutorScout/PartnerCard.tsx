import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { call, Partner, SOURCE_LABEL, STATUSES, Status } from "./api";

interface Props {
  partner: Partner | null;
  onClose: () => void;
  onChanged: (p: Partner) => void;
}

interface Ev {
  kind: string;
  text: string | null;
  at: string;
}

const EV_LABEL: Record<string, string> = {
  found: "Найден",
  contacted: "Написали",
  replied: "Ответил",
  talks: "Переговоры",
  partner: "Стал партнёром",
  declined: "Отказ",
  note: "Заметка",
};

export default function PartnerCard({ partner, onClose, onChanged }: Props) {
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [events, setEvents] = useState<Ev[]>([]);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!partner) return;
    setDraft(partner.draft || "");
    setNotes(partner.notes || "");
    setSubject(partner.subject || "");
    setNextStep(partner.next_step_at || "");
    setMsg("");
    call<{ events: Ev[] }>("events", undefined, `&id=${partner.id}`).then((r) => setEvents(r.ok ? r.events : []));
  }, [partner]);

  if (!partner) return null;
  const p = partner;
  const fromBot = !!p.max_user_id;

  const refreshEvents = () =>
    call<{ events: Ev[] }>("events", undefined, `&id=${p.id}`).then((r) => setEvents(r.ok ? r.events : []));

  const update = async (fields: Record<string, unknown>, okText = "Сохранено") => {
    setBusy("save");
    const r = await call<{ item: Partner }>("update", { id: p.id, ...fields });
    setBusy("");
    setMsg(r.ok ? okText : r.error || "Ошибка");
    if (r.ok) {
      onChanged(r.item);
      refreshEvents();
    }
  };

  const makeDraft = async () => {
    setBusy("draft");
    const r = await call<{ draft: string }>("draft", { id: p.id });
    setBusy("");
    if (r.ok) {
      setDraft(r.draft);
      onChanged({ ...p, draft: r.draft });
    } else setMsg(r.error || "Не получилось");
  };

  const copyAndOpen = async () => {
    try {
      await navigator.clipboard.writeText(draft);
    } catch {
      /* буфер обмена недоступен — текст можно скопировать вручную */
    }
    window.open(p.write_url || p.url, "_blank", "noopener");
    const r = await call<{ item: Partner }>("sent", { id: p.id, channel: SOURCE_LABEL[p.source] || p.source, text: draft });
    if (r.ok) {
      onChanged(r.item);
      refreshEvents();
      setMsg("Текст скопирован — вставьте его в открывшийся чат. Этап: «Написали», напоминание через 3 дня.");
    }
  };

  const sendMax = async () => {
    setBusy("max");
    const r = await call("send_max", { id: p.id, text: draft });
    setBusy("");
    setMsg(r.ok ? "Отправлено в MAX" : r.error || "Не отправилось");
    if (r.ok) refreshEvents();
  };

  return (
    <Sheet open={!!partner} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-white/10 bg-[#0b0f1a] text-white sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-left text-white">{p.name || "Без имени"}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5 text-sm">
          <div className="space-y-1 text-white/70">
            <p>
              {SOURCE_LABEL[p.source] || p.source}
              {p.city ? ` · ${p.city}` : ""}
              {!fromBot && (
                <>
                  {" · "}
                  <a href={p.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    открыть страницу
                  </a>
                </>
              )}
            </p>
            {p.snippet && <p className="whitespace-pre-line text-white/55">{p.snippet}</p>}
            <div className="flex flex-wrap gap-3 pt-1">
              {p.phone && <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>📞 {p.phone}</a>}
              {p.email && <a href={`mailto:${p.email}`}>✉️ {p.email}</a>}
              {p.messenger && (
                <a href={p.messenger.startsWith("http") ? p.messenger : `https://${p.messenger}`} target="_blank" rel="noreferrer">
                  💬 {p.messenger}
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 font-semibold">Этап</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => update({ status: s.id as Status }, `Этап: ${s.label}`)}
                  className={`rounded-full px-3 py-1 text-xs ${p.status === s.id ? s.color + " ring-1 ring-white/40" : "bg-white/5 text-white/50"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Личное предложение</p>
              <Button size="sm" variant="outline" onClick={makeDraft} disabled={!!busy} className="border-white/20 bg-transparent text-white">
                <Icon name={busy === "draft" ? "Loader2" : "Sparkles"} size={14} className={`mr-1 ${busy === "draft" ? "animate-spin" : ""}`} />
                {draft ? "Переписать ИИ" : "Написать с ИИ"}
              </Button>
            </div>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={9}
              placeholder="Нажмите «Написать с ИИ» — получите текст под этого репетитора. Его можно поправить."
              className="bg-white/5 text-white"
            />
            <div className="flex flex-wrap gap-2">
              {fromBot ? (
                <Button onClick={sendMax} disabled={!draft || !!busy} className="bg-primary text-primary-foreground">
                  <Icon name="Send" size={14} className="mr-1" />
                  Отправить в MAX
                </Button>
              ) : (
                <Button onClick={copyAndOpen} disabled={!draft} className="bg-primary text-primary-foreground">
                  <Icon name="Copy" size={14} className="mr-1" />
                  Скопировать и открыть чат
                </Button>
              )}
              {draft !== (p.draft || "") && (
                <Button variant="ghost" onClick={() => update({ draft }, "Текст сохранён")} className="text-white/70">
                  Сохранить текст
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-white/60">Предмет</span>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} onBlur={() => subject !== (p.subject || "") && update({ subject })} className="bg-white/5" />
            </label>
            <label className="space-y-1">
              <span className="text-white/60">Следующий шаг</span>
              <Input type="date" value={nextStep} onChange={(e) => setNextStep(e.target.value)} onBlur={() => nextStep !== (p.next_step_at || "") && update({ next_step_at: nextStep }, "Дата сохранена")} className="bg-white/5" />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-white/60">Заметки (о чём договорились, что важно человеку)</span>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="bg-white/5 text-white" />
            {notes !== (p.notes || "") && (
              <Button size="sm" onClick={() => update({ notes }, "Заметка сохранена")} className="mt-1 bg-white/10 text-white hover:bg-white/20">
                Сохранить заметку
              </Button>
            )}
          </label>

          {msg && <p className="rounded-lg bg-white/5 p-2 text-white/80">{msg}</p>}

          <div>
            <p className="mb-2 font-semibold">История</p>
            <div className="space-y-2">
              {events.map((e, i) => (
                <div key={i} className="border-l-2 border-white/10 pl-3">
                  <p className="text-xs text-white/45">
                    {new Date(e.at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })} · {EV_LABEL[e.kind] || e.kind}
                  </p>
                  {e.text && <p className="line-clamp-4 whitespace-pre-line text-white/70">{e.text}</p>}
                </div>
              ))}
              {!events.length && <p className="text-white/40">Пока пусто</p>}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
