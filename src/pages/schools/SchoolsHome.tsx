import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { Input } from "@/components/ui/input";
import DirLayout from "@/components/schools/DirLayout";
import SchoolRow from "@/components/schools/SchoolRow";
import { dirApi, DirCity, SchoolCard, SITE_URL } from "@/components/schools/api";

export default function SchoolsHome() {
  const [cities, setCities] = useState<DirCity[]>([]);
  const [total, setTotal] = useState(0);
  const [top, setTop] = useState<SchoolCard[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dirApi.cities().then((r) => {
      if (r.ok) {
        setCities(r.data.cities.filter((c) => c.slug));
        setTotal(r.data.total);
      } else setError(r.error);
    });
    dirApi.top(10).then((r) => r.ok && setTop(r.data.items));
  }, []);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? cities.filter((c) => c.city.toLowerCase().includes(s)) : cities;
  }, [cities, q]);
  const towns = shown.filter((c) => !c.region);
  const regions = shown.filter((c) => c.region);

  return (
    <DirLayout crumbs={[{ label: "Главная", href: "/" }, { label: "Справочник школ" }]}>
      <Seo
        title="Справочник школ России 2026: адреса, сайты и рейтинги"
        description="Открытый справочник общеобразовательных школ, лицеев и гимназий 32 городов и 11 регионов России: адреса, телефоны, сайты, места в рейтингах RAEX 2026 и достижения школ."
        canonical={`${SITE_URL}/shkoly`}
        keywords="справочник школ, школы города, список школ, лицеи и гимназии, рейтинг школ 2026, лучшие школы города"
      />

      <section className="mb-8 mt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Icon name="School" size={13} />
          {total ? `${total.toLocaleString("ru-RU")} школ` : "Справочник школ"}
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
          Справочник <span className="gradient-text-purple">школ России</span>
        </h1>
        <p className="mt-4 max-w-3xl text-base text-white/70 sm:text-lg">
          Школы, лицеи и гимназии по данным официального реестра Рособрнадзора: адреса, телефоны и сайты. Места в открытых рейтингах RAEX 2026
          и достижения, о которых рассказали сами школы.
        </p>
      </section>

      <section className="mb-10 grid gap-3 sm:grid-cols-3">
        <Link to="/shkoly/reyting" className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 transition hover:bg-amber-400/15">
          <Icon name="Trophy" size={20} className="text-amber-300" />
          <p className="mt-2 font-semibold">Рейтинг школ 2026</p>
          <p className="mt-1 text-sm text-white/60">Лучшие школы по открытым рейтингам RAEX</p>
        </Link>
        <a href="#cities" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
          <Icon name="MapPin" size={20} className="text-primary" />
          <p className="mt-2 font-semibold">Школы вашего города</p>
          <p className="mt-1 text-sm text-white/60">Поиск по названию и адресу</p>
        </a>
        <Link to="/shkoly/dlya-shkol" className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 transition hover:bg-emerald-400/15">
          <Icon name="BadgeCheck" size={20} className="text-emerald-300" />
          <p className="mt-2 font-semibold">Вы представляете школу?</p>
          <p className="mt-1 text-sm text-white/60">Расскажите о достижениях — бесплатно</p>
        </Link>
      </section>

      {top.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-2xl font-bold">Топ-10 школ справочника</h2>
            <Link to="/shkoly/reyting" className="text-sm text-primary hover:underline">Весь рейтинг →</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {top.map((s, i) => (
              <SchoolRow key={s.id} school={s} place={i + 1} showCity />
            ))}
          </div>
        </section>
      )}

      <section id="cities" className="scroll-mt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">Города и регионы</h2>
          <div className="relative w-full sm:w-72">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти город" className="pl-9" />
          </div>
        </div>
        {error && <p className="text-rose-300">{error}</p>}
        {!cities.length && !error && <p className="text-white/50">Загружаем…</p>}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {towns.map((c) => (
            <CityLink key={c.city} c={c} />
          ))}
        </div>
        {regions.length > 0 && (
          <>
            <h3 className="mb-3 mt-8 text-lg font-semibold text-white/80">Школы регионов</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {regions.map((c) => (
                <CityLink key={c.city} c={c} />
              ))}
            </div>
          </>
        )}
      </section>
    </DirLayout>
  );
}

function CityLink({ c }: { c: DirCity }) {
  return (
    <Link
      to={`/shkoly/gorod/${c.slug}`}
      className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-primary/40 hover:bg-white/[0.07]"
    >
      <span className="font-medium">{c.city}</span>
      <span className="shrink-0 text-xs text-white/50">
        {c.schools}
        {c.rated > 0 && <span className="ml-1.5 text-amber-200">★ {c.rated}</span>}
      </span>
    </Link>
  );
}
