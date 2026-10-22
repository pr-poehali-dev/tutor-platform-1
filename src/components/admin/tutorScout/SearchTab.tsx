import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { call, Found } from "./api";

const SOURCES = [
  { id: "vk_people", label: "VK: люди", icon: "User", need: "vk" },
  { id: "vk_groups", label: "VK: сообщества", icon: "Users", need: "vk" },
  { id: "vk_posts", label: "VK: объявления", icon: "Megaphone", need: "vk" },
  { id: "web", label: "Интернет (Яндекс)", icon: "Globe", need: "yandex" },
  { id: "channels", label: "Каналы MAX/Telegram", icon: "Send", need: "yandex" },
] as const;

const PRESETS = [
  "репетитор по математике ОГЭ ЕГЭ",
  "репетитор русский язык",
  "репетитор английского",
  "репетитор физика",
  "репетитор начальных классов",
  "репетиторы чат",
];

interface Props {
  connected: Record<string, boolean>;
  onSaved: () => void;
}

export default function SearchTab({ connected, onSaved }: Props) {
  const [source, setSource] = useState<string>("vk_people");
  const [query, setQuery] = useState(PRESETS[0]);
  const [city, setCity] = useState("");
  const [items, setItems] = useState<Found[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const current = SOURCES.find((s) => s.id === source)!;
  const ready = connected[current.need];

  const search = async () => {
    setBusy(true);
    setMsg("");
    const r = await call<{ items: Found[] }>("search", { source, query, city });
    setBusy(false);
    if (!r.ok) {
      setItems([]);
      setMsg(r.error || "Поиск не удался");
      return;
    }
    setItems(r.items);
    setPicked(new Set(r.items.filter((i) => !i.in_base).map((i) => i.url)));
    setMsg(r.items.length ? "" : "Ничего не нашлось — попробуйте другой запрос или город");
  };

  const save = async () => {
    const chosen = items.filter((i) => picked.has(i.url));
    if (!chosen.length) return;
    const r = await call<{ added: number }>("save", { items: chosen, query: `${query} ${city}`.trim() });
    if (!r.ok) {
      setMsg(r.error || "Не сохранилось");
      return;
    }
    setMsg(`В базу добавлено: ${r.added}. Остальные уже были в базе.`);
    setItems((prev) => prev.map((i) => (picked.has(i.url) ? { ...i, in_base: true } : i)));
    setPicked(new Set());
    onSaved();
  };

  const toggle = (url: string) =>
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(url)) n.delete(url);
      else n.add(url);
      return n;
    });

  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-white/[0.04] p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSource(s.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                source === s.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <Icon name={s.icon} size={14} />
              {s.label}
              {!connected[s.need] && <Icon name="Lock" size={12} className="opacity-60" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Кого ищем" className="md:flex-1" />
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Город (необязательно)" className="md:w-56" />
          <Button onClick={search} disabled={busy || !ready} className="bg-primary text-primary-foreground">
            <Icon name={busy ? "Loader2" : "Search"} size={16} className={busy ? "animate-spin mr-1" : "mr-1"} />
            Найти
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => setQuery(p)} className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/60 hover:text-white">
              {p}
            </button>
          ))}
        </div>

        {!ready && (
          <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">
            Этот источник ещё не подключён — нужен ключ доступа. Инструкция — во вкладке «Подключение».
          </p>
        )}
        {msg && <p className="text-sm text-white/70">{msg}</p>}
      </Card>

      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              Найдено: {items.length} · выбрано: {picked.size}
            </p>
            <Button onClick={save} disabled={!picked.size} className="bg-emerald-500 text-white hover:bg-emerald-600">
              <Icon name="Plus" size={16} className="mr-1" />
              Добавить в базу
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((i) => (
              <Card key={i.url} className="flex gap-3 border-white/10 bg-white/[0.03] p-3">
                <Checkbox
                  checked={picked.has(i.url)}
                  disabled={i.in_base}
                  onCheckedChange={() => toggle(i.url)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={i.url} target="_blank" rel="noreferrer" className="font-semibold text-white hover:underline">
                      {i.name || i.url}
                    </a>
                    {i.city && <span className="text-xs text-white/50">{i.city}</span>}
                    {i.in_base && <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/60">уже в базе</span>}
                  </div>
                  {i.snippet && <p className="mt-1 line-clamp-3 text-sm text-white/60">{i.snippet}</p>}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/50">
                    {i.phone && <span>📞 {i.phone}</span>}
                    {i.email && <span>✉️ {i.email}</span>}
                    {i.messenger && <span>💬 {i.messenger}</span>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
