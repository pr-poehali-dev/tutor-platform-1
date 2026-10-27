import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DirLayout from "@/components/schools/DirLayout";
import SchoolRow from "@/components/schools/SchoolRow";
import { dirApi, SchoolCard, SITE_URL } from "@/components/schools/api";

const KINDS = [
  { v: "", label: "Все" },
  { v: "rated", label: "В рейтингах" },
  { v: "lyceum", label: "Лицеи" },
  { v: "gymnasium", label: "Гимназии" },
  { v: "private", label: "Частные" },
];

export default function SchoolsCity() {
  const { city: slug = "" } = useParams();
  const [sp, setSp] = useSearchParams();
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const kind = sp.get("kind") || "";
  const q = sp.get("q") || "";
  const [input, setInput] = useState(q);
  const [data, setData] = useState<{ city: string; items: SchoolCard[]; total: number; pages: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dirApi.list({ city_slug: slug, q, kind, page }).then((r) => {
      setLoading(false);
      if (r.ok) {
        setData(r.data);
        setError("");
      } else setError(r.error);
    });
  }, [slug, q, kind, page]);

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!("page" in patch)) next.delete("page");
    setSp(next);
    window.scrollTo({ top: 0 });
  };

  const city = data?.city || "";
  const offset = (page - 1) * 30;

  return (
    <DirLayout crumbs={[{ label: "Главная", href: "/" }, { label: "Справочник школ", href: "/shkoly" }, { label: city || "Город" }]}>
      {city && (
        <Seo
          title={`Школы — ${city}: список, адреса, рейтинг 2026`}
          description={`Все школы, лицеи и гимназии — ${city}: ${data?.total} школ с адресами, телефонами и сайтами. Лучшие школы по рейтингам RAEX 2026.`}
          canonical={`${SITE_URL}/shkoly/gorod/${slug}`}
          keywords={`школы ${city}, лучшие школы ${city}, рейтинг школ ${city} 2026, лицеи ${city}, гимназии ${city}, список школ ${city}`}
        />
      )}

      <section className="mb-6 mt-4">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          Школы{city ? <> — <span className="gradient-text-purple">{city}</span></> : ""}
        </h1>
        {data && (
          <p className="mt-2 text-white/60">
            {data.total} {kind || q ? "найдено" : "школ в справочнике"}. Сначала — отмеченные в открытых рейтингах RAEX 2026 и подтверждённые школами.
          </p>
        )}
      </section>

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: input.trim() });
        }}
      >
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Номер, название или улица" className="pl-9" />
        </div>
        <Button type="submit" className="bg-primary text-primary-foreground">Найти</Button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.v}
            onClick={() => set({ kind: k.v })}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              kind === k.v ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {error && <p className="text-rose-300">{error}</p>}
      {loading && !data && <p className="text-white/50">Загружаем…</p>}
      {data && !data.items.length && <p className="text-white/60">Ничего не нашли. Попробуйте номер школы или улицу.</p>}

      <div className={`grid gap-3 md:grid-cols-2 ${loading ? "opacity-60" : ""}`}>
        {data?.items.map((s, i) => (
          <SchoolRow key={s.id} school={s} place={!q && !kind ? offset + i + 1 : undefined} />
        ))}
      </div>

      {data && data.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => set({ page: String(page - 1) })} className="border-white/15 bg-white/5 text-white">
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <span className="text-sm text-white/60">
            {page} из {data.pages}
          </span>
          <Button variant="outline" disabled={page >= data.pages} onClick={() => set({ page: String(page + 1) })} className="border-white/15 bg-white/5 text-white">
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>
      )}

      <section className="mt-12 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6">
        <h2 className="text-xl font-bold">Вашей школы нет в рейтинге?</h2>
        <p className="mt-2 max-w-2xl text-white/70">
          Расскажите о достижениях и методиках — школы, приславшие сведения, получают отметку «Сведения от школы» и поднимаются выше в справочнике.
        </p>
        <Link to="/shkoly/dlya-shkol" className="mt-4 inline-flex items-center gap-1 font-semibold text-emerald-300 hover:underline">
          Как это работает
          <Icon name="ArrowRight" size={15} />
        </Link>
      </section>
    </DirLayout>
  );
}
