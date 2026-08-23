import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { SIGN_CATEGORIES, searchSigns, DictSign } from "@/components/silent/signLibrary";

const CANONICAL = "https://xn--h1agdcde2c.xn--p1ai/dictionary";

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Словарь русского жестового языка (РЖЯ) — УЧИСЬПРО",
    description:
      "Онлайн-словарь жестов русского жестового языка: поиск по слову, темы, показ жеста и описание артикуляции. Бесплатно.",
    url: CANONICAL,
    inLanguage: "ru",
  },
];

function SignCard({ sign }: { sign: DictSign }) {
  return (
    <Link
      to={`/dictionary/${encodeURIComponent(sign.key)}`}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] hover:border-cyan-400/40 hover:bg-cyan-500/[0.05] transition-colors overflow-hidden flex flex-col"
    >
      <div className="aspect-square bg-white/5 overflow-hidden flex items-center justify-center">
        {sign.videoUrl ? (
          <video src={sign.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
        ) : (
          <img
            src={sign.image}
            alt={`Жест «${sign.word}» на РЖЯ`}
            className={`w-full h-full object-cover sign-motion-${sign.motion} group-hover:scale-105 transition-transform`}
            loading="lazy"
          />
        )}
      </div>
      <div className="p-3">
        <div className="font-bold text-white text-[15px] leading-tight flex items-center gap-1.5">
          <Icon name="Hand" size={13} className="text-cyan-300 flex-shrink-0" />
          {sign.word}
        </div>
        <p className="text-white/45 text-xs mt-1 line-clamp-2">{sign.description}</p>
      </div>
    </Link>
  );
}

export default function SignDictionary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const results = useMemo(() => searchSigns(query, category), [query, category]);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Словарь жестов РЖЯ — русский жестовый язык"
        description="Онлайн-словарь русского жестового языка: найдите нужное слово и посмотрите, как показывается жест. Темы, поиск, описание артикуляции. Бесплатно."
        canonical={CANONICAL}
        keywords="словарь жестов, жестовый язык, РЖЯ, язык жестов, жесты для глухих, как показать жест, русский жестовый язык словарь"
        jsonLd={JSON_LD}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🤟</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/silent"
            className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg hover:border-cyan-400/40 transition-colors"
          >
            <Icon name="GraduationCap" size={14} /> Уроки для детей
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs className="mb-6" items={[{ label: "Главная", href: "/" }, { label: "Словарь жестов" }]} />
        {/* Hero */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200 bg-cyan-500/15 border border-cyan-400/25 rounded-lg px-3 py-1 mb-4">
            <Icon name="BookA" size={13} /> Словарь РЖЯ
          </span>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3">
            Словарь <span className="gradient-text-purple">жестового языка</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
            Найдите слово — и посмотрите, как показывается жест на русском жестовом языке.
            С описанием и возможностью проверить у носителя. Бесплатно.
          </p>
        </div>

        {/* Поиск */}
        <div className="relative max-w-xl mx-auto mb-5">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите слово, например «спасибо»…"
            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Темы */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setCategory("all")}
            className={`text-sm font-semibold rounded-xl px-3.5 py-2 border transition-colors ${
              category === "all"
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-transparent"
                : "bg-white/[0.04] text-white/70 border-white/10 hover:border-cyan-400/40"
            }`}
          >
            Все жесты
          </button>
          {SIGN_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`text-sm font-semibold rounded-xl px-3.5 py-2 border transition-colors ${
                category === c.id
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-transparent"
                  : "bg-white/[0.04] text-white/70 border-white/10 hover:border-cyan-400/40"
              }`}
            >
              <span className="mr-1">{c.emoji}</span>
              {c.title}
            </button>
          ))}
        </div>

        {/* Результаты */}
        {results.length === 0 ? (
          <div className="text-center py-16 text-white/50">
            <div className="text-4xl mb-3">🤷</div>
            <p className="mb-1 font-bold text-white/70">Ничего не нашлось</p>
            <p className="text-sm">
              Такого жеста пока нет в словаре. Мы пополняем его вместе с носителями РЖЯ —{" "}
              <Link to="/silent" className="text-cyan-300 hover:text-cyan-200 underline">помогите проекту</Link>.
            </p>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-sm text-center mb-4">Найдено жестов: {results.length}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {results.map((s) => (
                <SignCard key={s.key} sign={s} />
              ))}
            </div>
          </>
        )}

        {/* Призыв к уроку */}
        <div className="mt-12 rounded-3xl border border-purple-400/25 bg-gradient-to-br from-purple-600/12 to-cyan-500/8 p-6 md:p-8 text-center">
          <div className="text-3xl mb-2">🤟</div>
          <h2 className="font-montserrat font-black text-xl md:text-2xl mb-2">Хотите учить жесты по шагам?</h2>
          <p className="text-white/60 text-sm md:text-base mb-5 max-w-xl mx-auto">
            У нас есть бесплатный курс для глухих и слабослышащих детей: субтитры, визуальная подача и добрый аватар-помощник.
          </p>
          <Link
            to="/silent"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="GraduationCap" size={18} /> Открыть курс для детей
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
