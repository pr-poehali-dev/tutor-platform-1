import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import {
  LIBRARY,
  LIB_CATEGORIES,
  LIB_AGES,
  LibCategory,
  AgeRange,
  filterLibrary,
} from "@/components/kids/libraryData";
import NannyFox from "@/components/kids/NannyFox";

const SITE_URL = "https://учисьпро.рф";

export default function KidsLibrary() {
  const [category, setCategory] = useState<LibCategory | "all">("all");
  const [age, setAge] = useState<AgeRange | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const base = filterLibrary(category, age);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((it) =>
      it.title.toLowerCase().includes(q) ||
      it.author.toLowerCase().includes(q) ||
      it.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [category, age, query]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Библиотека сказок, стихов и рассказов для детей",
      description:
        "Бесплатная библиотека произведений из общественного достояния для детей 1–7 лет. С озвучкой голосом ИИ. Русские народные сказки, Пушкин, Толстой, Крылов, Ушинский.",
      url: `${SITE_URL}/kids/library`,
      inLanguage: "ru",
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Библиотека сказок и стихов для детей — слушать онлайн, УЧИСЬПРО Малыш"
        description="Сказки, стихи и рассказы для детей 1–7 лет. Народные сказки, Пушкин, Толстой, Крылов, Ушинский. Озвучка голосом ИИ — для совместного чтения с малышом. Бесплатно."
        canonical={`${SITE_URL}/kids/library`}
        keywords="сказки для детей слушать, стихи Пушкина для детей, аудиосказки бесплатно, народные сказки, рассказы Толстого детям, библиотека для малышей, басни Крылова, читает голос"
        jsonLd={jsonLd}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: (i % 3) + 1 + "px",
                 height: (i % 3) + 1 + "px",
                 left: ((i * 137.5) % 100) + "%",
                 top: ((i * 97.3) % 100) + "%",
                 opacity: 0.1 + (i % 4) * 0.06,
               }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Малыш", href: "/kids" }, { label: "Библиотека" }]} />
          </div>
          <Link to="/kids" className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Icon name="ArrowLeft" size={14} />
            К Малышу
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
          <Icon name="BookOpen" size={14} className="text-pink-300" />
          <span className="text-sm text-pink-200 font-bold uppercase tracking-wider">Библиотека · {LIBRARY.length} произведений</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Сказки, стихи и рассказы <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">с голосом</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mb-6">
          Для малышей от 2 лет и старше: народные сказки, Пушкин, Толстой, Крылов, Ушинский, Жуковский — классика из общественного достояния. Слушайте вместе: тёплый голос Лисы прочтёт каждый фрагмент.
        </p>

        {/* Поиск */}
        <div className="relative mb-5">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, автору или теме..."
            className="w-full bg-white/5 border border-white/12 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-pink-500/50 focus:bg-white/8 transition-colors"
          />
        </div>

        {/* Фильтры */}
        <div className="space-y-3">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Жанр</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("all")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === "all"
                    ? "bg-pink-500/25 border border-pink-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name="LayoutGrid" size={12} />
                Все
              </button>
              {LIB_CATEGORIES.map((c) => {
                const count = LIBRARY.filter((it) => it.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      category === c.id
                        ? "bg-pink-500/25 border border-pink-500/45 text-white"
                        : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                    <span className="text-white/40 text-[11px]">· {count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Возраст</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAge("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  age === "all"
                    ? "bg-cyan-500/25 border border-cyan-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                Любой
              </button>
              {LIB_AGES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAge(a.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    age === a.id
                      ? "bg-cyan-500/25 border border-cyan-500/45 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Сетка */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-5xl mb-3">📚</div>
            <p className="text-white/65 text-sm mb-4">По этим фильтрам ничего не нашлось. Попробуйте другие.</p>
            <button
              onClick={() => { setCategory("all"); setAge("all"); setQuery(""); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold px-5 py-3 rounded-2xl"
            >
              <Icon name="RefreshCw" size={14} />
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((it) => {
              const catLabel = LIB_CATEGORIES.find((c) => c.id === it.category);
              return (
                <Link
                  key={it.id}
                  to={`/kids/library/${it.id}`}
                  className="group bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/25 hover:translate-y-[-2px] transition-all"
                >
                  <div className={`relative h-32 bg-gradient-to-br ${it.color} flex items-center justify-center overflow-hidden`}>
                    <div className="text-7xl group-hover:scale-110 transition-transform">{it.emoji}</div>
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-black/30 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      <span>{catLabel?.emoji}</span>
                      {catLabel?.label}
                    </div>
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/30 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded-full">
                      <Icon name="Clock" size={9} />
                      {it.durationMin} мин
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-montserrat font-black text-white text-base leading-tight mb-1 line-clamp-2">{it.title}</p>
                    <p className="text-white/55 text-xs mb-3 line-clamp-1">{it.author}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {it.ages.map((a) => (
                          <span key={a} className="text-[10px] bg-white/5 border border-white/10 text-white/65 px-2 py-0.5 rounded-md">
                            {a}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-pink-300 text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                        Слушать
                        <Icon name="Play" size={11} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Юридическая плашка */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pb-12">
        <div className="bg-cyan-500/8 border border-cyan-500/25 rounded-2xl p-4 flex items-start gap-3">
          <Icon name="ShieldCheck" size={18} className="text-cyan-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-cyan-200 text-sm font-semibold mb-1">Всё легально</p>
            <p className="text-white/65 text-xs leading-relaxed">
              В библиотеке только произведения из общественного достояния: народные сказки и тексты авторов, со дня смерти которых прошло более 70 лет (ст. 1281 ГК РФ). Никаких нарушений авторских прав.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
      <NannyFox />
    </div>
  );
}