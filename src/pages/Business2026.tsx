import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import CityCard from "@/components/business2026/CityCard";
import {
  ALL_TAGS,
  CITIES,
  SUMMARY,
  Trend,
  TREND_LABEL,
} from "@/components/business2026/cities";

const SITE_URL = "https://учисьпро.рф";

const TREND_FILTERS: { value: Trend | "all"; label: string }[] = [
  { value: "all", label: "Все города" },
  { value: "growth", label: TREND_LABEL.growth },
  { value: "stable", label: TREND_LABEL.stable },
  { value: "decline", label: TREND_LABEL.decline },
];

export default function Business2026() {
  const [query, setQuery] = useState("");
  const [trend, setTrend] = useState<Trend | "all">("all");
  const [tag, setTag] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CITIES.filter((c) => {
      if (trend !== "all" && c.trend !== trend) return false;
      if (tag && !c.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        c.city.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.essence.toLowerCase().includes(q) ||
        c.niches.some((n) => n.toLowerCase().includes(q))
      );
    });
  }, [query, trend, tag]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Бизнес 2026: где открываться в городах-миллионниках России",
      description:
        "Аналитические записки по 16 городам-миллионникам России: экономика, приоритетные ниши для малого бизнеса и чего избегать.",
      url: `${SITE_URL}/business-2026`,
      hasPart: CITIES.map((c) => ({
        "@type": "Article",
        headline: `Бизнес 2026: ${c.city}. Куда идут деньги и где открываться`,
        url: `${SITE_URL}/feed/${c.slug}`,
        about: c.city,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "В каком городе-миллионнике выгоднее открыть бизнес в 2026 году?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Универсального ответа нет: в Краснодаре рынок растёт за счёт переезда людей, в Челябинске и Омске сжимается, а в Екатеринбурге простые ниши уже заняты. Выбирать нужно по тому, кто ваш плательщик — население или предприятия.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько городов-миллионников в России?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Шестнадцать: Москва, Санкт-Петербург, Новосибирск, Екатеринбург, Казань, Нижний Новгород, Челябинск, Красноярск, Самара, Уфа, Ростов-на-Дону, Краснодар, Омск, Воронеж, Пермь и Волгоград.",
          },
        },
        {
          "@type": "Question",
          name: "Как проверить бизнес-идею перед запуском?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Позвоните десяти реальным потенциальным клиентам и спросите, есть ли у них эта проблема и сколько они на неё тратят сейчас. Посчитайте стоимость привлечения одного клиента. Найдите тех, кто уже работает в нише: полное отсутствие конкурентов обычно означает отсутствие денег.",
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Бизнес 2026: где открываться в 16 городах России"
        description="Аналитические записки по городам-миллионникам России: что с экономикой, какие ниши приоритетны в 2026 году и чего избегать. Цифры и выводы."
        canonical={`${SITE_URL}/business-2026`}
        keywords="какой бизнес открыть 2026, бизнес идеи по городам, города миллионники россии бизнес, куда вложить деньги 2026, ниши для малого бизнеса, бизнес в регионах"
        jsonLd={jsonLd}
      />

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-bold">
              У
            </span>
            <span className="text-lg font-bold tracking-tight">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
          >
            <Icon name="ArrowLeft" size={15} />
            В ленту
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Бизнес 2026" },
          ]}
        />

        <section className="mb-10 mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Icon name="ChartNoAxesCombined" size={13} />
            Исследование УЧИСЬПРО
          </span>

          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
            Бизнес 2026: где открываться
            <br className="hidden sm:block" /> в городах-миллионниках
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
            Мы разобрали экономику всех 16 городов-миллионников России. Где
            рынок растёт, где сжимается, какие ниши свободны и чего избегать —
            по каждому городу отдельно.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: SUMMARY.total, l: "городов разобрано", i: "MapPin" },
              { v: `${SUMMARY.people} млн`, l: "жителей охвачено", i: "Users" },
              { v: SUMMARY.growth, l: "рынка растут", i: "TrendingUp" },
              { v: SUMMARY.decline, l: "рынка сжимаются", i: "TrendingDown" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <Icon
                  name={s.i}
                  size={18}
                  className="mb-2 text-primary"
                />
                <div className="text-2xl font-bold">{s.v}</div>
                <div className="text-xs text-white/50">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 space-y-4">
          <div className="relative">
            <Icon
              name="Search"
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти город или нишу — например «Пермь» или «логистика»"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4
                         text-sm text-white outline-none placeholder:text-white/35 focus:border-primary/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {TREND_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTrend(f.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  trend === f.value
                    ? "border-primary bg-primary text-white"
                    : "border-white/15 text-white/65 hover:border-white/30 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? null : t)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  tag === t
                    ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                    : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <p className="mb-4 text-sm text-white/45">
          {visible.length === CITIES.length
            ? `Все ${CITIES.length} городов`
            : `Найдено городов: ${visible.length}`}
        </p>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <Icon
              name="SearchX"
              size={32}
              className="mx-auto mb-3 text-white/30"
            />
            <p className="text-white/60">
              Ничего не нашлось. Попробуйте другой запрос или сбросьте фильтры.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setTrend("all");
                setTag(null);
              }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Сбросить всё
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <CityCard key={c.slug} city={c} />
            ))}
          </div>
        )}

        <section className="mt-14 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Как читать эти записки
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              {
                i: "Wallet",
                t: "Сначала поймите, кто платит",
                d: "Если ваш плательщик — население, а город теряет людей, рынок будет сжиматься. Если предприятия — вы устойчивее к спаду.",
              },
              {
                i: "Map",
                t: "Считайте агломерацию, а не город",
                d: "В Самаре рынок вдвое больше за счёт Тольятти. В Волгограде наоборот — считать нужно район, клиент не поедет через полгорода.",
              },
              {
                i: "Phone",
                t: "Проверьте идею за неделю",
                d: "Позвоните десяти реальным клиентам до вложений. Спросите, есть ли проблема и сколько они на неё тратят сейчас.",
              },
            ].map((b) => (
              <div key={b.t}>
                <Icon name={b.i} size={22} className="mb-3 text-primary" />
                <h3 className="mb-2 font-semibold">{b.t}</h3>
                <p className="text-sm leading-relaxed text-white/65">{b.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-primary/25 bg-primary/10 p-6 text-center sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Есть идея для своего города?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Посчитаем экономику именно вашей идеи: окупаемость, точку
            безубыточности и что будет, если продажи упадут вдвое.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/bizlab"
              className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Разобрать свою идею
            </Link>
            <Link
              to="/feed"
              className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white/85 transition hover:border-white/40"
            >
              Читать другие материалы
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}