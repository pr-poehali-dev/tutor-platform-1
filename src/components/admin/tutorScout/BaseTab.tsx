import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { call, Partner, SOURCE_LABEL, STATUSES } from "./api";
import PartnerCard from "./PartnerCard";

interface Props {
  reloadKey: number;
}

export default function BaseTab({ reloadKey }: Props) {
  const [items, setItems] = useState<Partner[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Partner | null>(null);
  const [addUrl, setAddUrl] = useState("");
  const [addName, setAddName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await call<{ items: Partner[]; counts: Record<string, number> }>(
      "list",
      undefined,
      `&status=${status}&q=${encodeURIComponent(q)}`,
    );
    setLoading(false);
    if (r.ok) {
      setItems(r.items);
      setCounts(r.counts);
    } else setMsg(r.error || "Не загрузилось");
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const add = async () => {
    const r = await call<{ added: number }>("add", { url: addUrl.trim(), name: addName.trim() });
    setMsg(r.ok ? (r.added ? "Добавлено" : "Такая ссылка уже есть в базе") : r.error || "Ошибка");
    if (r.ok) {
      setAddUrl("");
      setAddName("");
      load();
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStatus(status === s.id ? "" : s.id)}
            className={`rounded-xl p-3 text-left transition ${status === s.id ? "ring-2 ring-primary" : ""} ${s.color}`}
          >
            <p className="text-2xl font-bold">{counts[s.id] || 0}</p>
            <p className="text-xs opacity-80">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по имени, предмету, городу" className="md:flex-1" />
        <Button variant="outline" onClick={load} className="border-white/20 bg-transparent text-white">
          <Icon name={loading ? "Loader2" : "RefreshCw"} size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <Card className="flex flex-col gap-2 border-white/10 bg-white/[0.03] p-3 md:flex-row">
        <Input value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="Ссылка на репетитора (Профи, Авито, сайт, канал)" className="md:flex-1" />
        <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Имя" className="md:w-48" />
        <Button onClick={add} disabled={!addUrl.trim()} className="bg-white/10 text-white hover:bg-white/20">
          <Icon name="Plus" size={16} className="mr-1" />
          Добавить вручную
        </Button>
      </Card>
      {msg && <p className="text-sm text-white/70">{msg}</p>}

      <p className="text-sm text-white/50">
        {status ? `Показано: ${items.length}` : `Всего в базе: ${total}`}
      </p>

      <div className="space-y-2">
        {items.map((p) => {
          const st = STATUSES.find((s) => s.id === p.status)!;
          const overdue = p.next_step_at && p.next_step_at <= today && !["partner", "declined"].includes(p.status);
          return (
            <Card
              key={p.id}
              onClick={() => setOpen(p)}
              className="cursor-pointer border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${st.color}`}>{st.label}</span>
                <span className="font-semibold text-white">{p.name || p.url}</span>
                {p.subject && <span className="text-sm text-white/60">· {p.subject}</span>}
                {p.city && <span className="text-xs text-white/40">{p.city}</span>}
                <span className="ml-auto text-xs text-white/40">{SOURCE_LABEL[p.source] || p.source}</span>
              </div>
              {p.snippet && <p className="mt-1 line-clamp-2 text-sm text-white/50">{p.snippet}</p>}
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                {p.draft && <span className="text-emerald-300">✓ есть текст</span>}
                {p.next_step_at && (
                  <span className={overdue ? "text-amber-300" : "text-white/40"}>
                    {overdue ? "⏰ пора: " : "след. шаг: "}
                    {new Date(p.next_step_at).toLocaleDateString("ru-RU")}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
        {!items.length && !loading && (
          <p className="py-8 text-center text-white/40">Пусто. Найдите репетиторов во вкладке «Поиск» или добавьте вручную.</p>
        )}
      </div>

      <PartnerCard
        partner={open}
        onClose={() => setOpen(null)}
        onChanged={(np) => {
          setOpen(np);
          setItems((prev) => prev.map((x) => (x.id === np.id ? np : x)));
        }}
      />
    </div>
  );
}
