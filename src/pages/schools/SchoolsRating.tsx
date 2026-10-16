import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import DirLayout from "@/components/schools/DirLayout";
import SchoolRow from "@/components/schools/SchoolRow";
import { dirApi, SchoolCard, SITE_URL, TopResponse } from "@/components/schools/api";

const FAQ = [
  {
    q: "Как часто обновляется рейтинг?",
    a: "Каждый месяц. 1-го числа мы фиксируем места всех школ и сравниваем с прошлым месяцем: стрелка показывает, на сколько мест школа поднялась или опустилась. Школы поднимаются за счёт подтверждённых достижений, а когда выходят новые открытые рейтинги — места пересчитываются. Рейтинги прошлых месяцев остаются в архиве.",
  },
  {
    q: "Как составлен рейтинг?",
    a: "Мы взяли открытые рейтинги RAEX 2026: «Топ-300 школ России по конкурентоспособности выпускников», рейтинг частных школ и региональные рейтинги по 29 регионам — и сопоставили их со школами справочника. Федеральный список весит больше регионального, верх списка — больше низа. Школа, подтвердившая сведения о себе, получает небольшой бонус.",
  },
  {
    q: "Почему моей школы нет в рейтинге?",
    a: "В рейтинги RAEX попадает несколько сотен школ на всю страну, поэтому большинство хороших школ туда не входят. Школа может рассказать о своих достижениях и методиках — после проверки они появятся на её странице, а школа поднимется в справочнике своего города.",
  },
  {
    q: "Можно ли попасть в рейтинг за деньги?",
    a: "Нет. Места определяются только открытыми рейтингами и подтверждёнными сведениями школы. Участие в справочнике бесплатное.",
  },
  {
    q: "Откуда адреса и телефоны школ?",
    a: "Из открытого реестра аккредитации Рособрнадзора. Если данные устарели, школа может сообщить нам — исправим.",
  },
];

export default function SchoolsRating() {
  const [items, setItems] = useState<SchoolCard[]>([]);
  const [meta, setMeta] = useState({ rated: 0, verified: 0, lists: 0 });
  const [months, setMonths] = useState<TopResponse["months"]>([]);
  const [month, setMonth] = useState("");
  const [monthLabel, setMonthLabel] = useState("");
  const [hasPrev, setHasPrev] = useState(false);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dirApi.top(300, month || undefined).then((r) => {
      if (r.ok) {
        setItems(r.data.items);
        setMeta({ rated: r.data.rated, verified: r.data.verified, lists: r.data.lists });
        setMonths(r.data.months);
        setMonthLabel(r.data.month_label || "");
        setHasPrev(!!r.data.prev_month);
      } else setError(r.error);
    });
  }, [month]);

  const movers = useMemo(
    () =>
      items
        .filter((i) => i.prev_place && i.place && i.prev_place > i.place)
        .sort((a, b) => b.prev_place! - b.place! - (a.prev_place! - a.place!))
        .slice(0, 3),
    [items],
  );

  const cities = useMemo(() => {
    const c = new Map<string, number>();
    items.forEach((i) => c.set(i.city, (c.get(i.city) || 0) + 1));
    return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [items]);
  const shown = city ? items.filter((i) => i.city === city) : items;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Рейтинг школ — ${monthLabel || "2026"}`,
      numberOfItems: Math.min(items.length, 100),
      itemListElement: items.slice(0, 100).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `${SITE_URL}/shkoly/${s.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <DirLayout crumbs={[{ label: "Главная", href: "/" }, { label: "Справочник школ", href: "/shkoly" }, { label: "Рейтинг месяца" }]}>
      <Seo
        title={`Рейтинг школ — ${monthLabel || "2026"}: лучшие школы и лицеи России`}
        description="Ежемесячный рейтинг лучших школ 32 городов и 11 регионов России по открытым рейтингам RAEX 2026 и подтверждённым достижениям школ. Движение мест за месяц, адреса и сайты."
        canonical={`${SITE_URL}/shkoly/reyting`}
        keywords="рейтинг школ 2026, лучшие школы россии, лучшие лицеи, лучшие гимназии, рейтинг школ raex, топ школ города"
        jsonLd={jsonLd}
      />

      <section className="mb-8 mt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
          <Icon name="CalendarDays" size={13} />
          Обновляется каждый месяц
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
          Рейтинг школ <span className="gradient-text-purple">{monthLabel ? `— ${monthLabel}` : "месяца"}</span>
        </h1>
        <p className="mt-4 max-w-3xl text-base text-white/70 sm:text-lg">
          Ежемесячный сводный рейтинг по открытым источникам: федеральные и региональные рейтинги RAEX 2026 плюс достижения, которые подтвердили
          сами школы. Стрелки показывают движение за месяц.
        </p>
        {months.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {months.map((m, i) => (
              <Chip key={m.v} on={(month || months[0].v) === m.v} onClick={() => setMonth(i === 0 ? "" : m.v)}>
                {m.label}
              </Chip>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 grid grid-cols-3 gap-3">
        <Stat value={meta.rated} label="школ в рейтингах" />
        <Stat value={meta.lists} label="открытых рейтингов" />
        <Stat value={meta.verified} label="подтвердили сведения" />
      </section>

      {movers.length > 0 && (
        <section className="mb-8 rounded-3xl border border-emerald-400/30 bg-emerald-400/[0.07] p-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold">
            <Icon name="TrendingUp" size={18} className="text-emerald-300" />
            Рост месяца
          </h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {movers.map((s) => (
              <Link key={s.id} to={`/shkoly/${s.slug}`} className="rounded-xl bg-white/[0.05] p-3 text-sm hover:bg-white/10">
                <p className="font-semibold">{s.name}</p>
                <p className="text-white/55">
                  {s.city} · <span className="text-emerald-300">+{s.prev_place! - s.place!} мест</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
      {!hasPrev && items.length > 0 && (
        <p className="mb-6 rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-white/65">
          Это первый выпуск ежемесячного рейтинга. С 1 ноября здесь появятся движение мест и «Рост месяца».
        </p>
      )}

      {cities.length > 1 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <Chip on={!city} onClick={() => setCity("")}>Все города</Chip>
          {cities.map((c) => (
            <Chip key={c} on={city === c} onClick={() => setCity(c)}>{c}</Chip>
          ))}
        </div>
      )}

      {error && <p className="text-rose-300">{error}</p>}
      {!items.length && !error && <p className="text-white/50">Загружаем…</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {shown.map((s, i) => (
          <SchoolRow key={s.id} school={s} place={city ? i + 1 : (s.place ?? i + 1)} showCity={!city} />
        ))}
      </div>

      <section className="mt-10 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6">
        <h2 className="text-xl font-bold">Ваша школа достойна места в рейтинге?</h2>
        <p className="mt-2 max-w-2xl text-white/70">Расскажите о достижениях и методиках. После проверки сведения появятся на странице школы, а школа поднимется в справочнике.</p>
        <Link to="/shkoly/dlya-shkol" className="mt-4 inline-flex items-center gap-1 font-semibold text-emerald-300 hover:underline">
          Как попасть в справочник
          <Icon name="ArrowRight" size={15} />
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Как устроен рейтинг</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                {f.q}
                <Icon name="ChevronDown" size={18} className="shrink-0 text-white/50 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-white/70">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/40">
          Источник рейтингов:{" "}
          <a href="https://raex-rr.com/education/best_schools/top-100_russian_schools/2026/" target="_blank" rel="noopener noreferrer nofollow" className="underline">
            RAEX, рейтинги школ 2026
          </a>
          . Сопоставление школ выполнено автоматически по названию и городу — если нашли ошибку, напишите нам.
        </p>
      </section>
    </DirLayout>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
      <p className="text-2xl font-bold sm:text-3xl">{value || "—"}</p>
      <p className="text-xs text-white/55 sm:text-sm">{label}</p>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
        on ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}