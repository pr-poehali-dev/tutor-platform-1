import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import {
  DRAW_LESSONS,
  DRAW_CATEGORIES,
  DRAW_LEVELS,
  DrawCategory,
  DrawLevel,
  filterLessons,
} from "@/components/draw/drawData";
import { useDrawGallery } from "@/components/draw/useDrawGallery";

const SITE_URL = "https://учисьпро.рф";

export default function DrawLanding() {
  const [category, setCategory] = useState<DrawCategory | "all">("all");
  const [level, setLevel] = useState<DrawLevel | "all">("all");
  const { items: gallery } = useDrawGallery();

  const filtered = useMemo(() => filterLessons(category, level), [category, level]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Рисовашка — учимся рисовать как художник",
      description:
        "Пошаговые уроки рисования для детей 3-9 лет. Голосовой ИИ-наставник, реальный холст для рисования, галерея работ.",
      provider: { "@type": "EducationalOrganization", name: "УЧИСЬПРО" },
      inLanguage: "ru",
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Рисовашка — учимся рисовать с ИИ-наставником, УЧИСЬПРО"
        description="Уроки рисования для детей: животные, природа, люди. Реальный холст в браузере, голосовой учитель, галерея работ. От первых линий до драконов."
        canonical={`${SITE_URL}/draw`}
        keywords="научиться рисовать ребёнку, уроки рисования для детей онлайн, рисование с нуля, как нарисовать кота, поэтапное рисование, художественная школа онлайн"
        jsonLd={jsonLd}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: (i % 3) + 1 + "px", height: (i % 3) + 1 + "px",
                 left: ((i * 137.5) % 100) + "%", top: ((i * 97.3) % 100) + "%",
                 opacity: 0.1 + (i % 4) * 0.06,
               }} />
        ))}
      </div>

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Рисовашка" }]} />
          </div>
          <Link to="/pricing" className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            <Icon name="Sparkles" size={14} />
            Тарифы
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-5">
              <Icon name="Palette" size={14} className="text-orange-300" />
              <span className="text-sm text-orange-200 font-bold uppercase tracking-wider">Рисовашка · {DRAW_LESSONS.length} уроков</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-4 leading-[1.05]">
              Рисуем как <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">настоящие художники</span>
            </h1>
            <p className="text-white/65 text-base md:text-lg leading-relaxed mb-6">
              Пошаговые мастер-классы: ИИ-наставник Лиса показывает голосом, что делать на каждом шаге. Холст прямо в браузере — рисуй пальцем, мышкой или стилусом.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <a href="#lessons" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-base font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl shadow-orange-500/30">
                <Icon name="Rocket" size={16} />
                Начать урок
              </a>
              {gallery.length > 0 && (
                <a href="#gallery" className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-base font-semibold px-6 py-3.5 rounded-2xl transition-colors">
                  <Icon name="Image" size={16} />
                  Мои работы ({gallery.length})
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/55 text-sm">
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> Голос учителя</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> Реальный холст</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> Галерея работ</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> От 3 лет</span>
            </div>
          </div>

          <div className="relative aspect-square max-w-md mx-auto md:ml-auto w-full">
            <div className="absolute -inset-4 bg-gradient-to-br from-orange-400/30 via-pink-400/30 to-purple-400/30 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl p-10 grid grid-cols-3 gap-3 items-center justify-items-center aspect-square">
              {DRAW_LESSONS.slice(0, 9).map((l, i) => (
                <Link
                  key={l.id}
                  to={`/draw/${l.id}`}
                  className="text-4xl md:text-5xl hover:scale-110 transition-transform drop-shadow-lg"
                  style={{ animation: `float ${2.5 + i * 0.2}s ease-in-out infinite alternate` }}
                >
                  {l.emoji}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Фильтры */}
      <section id="lessons" className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-6">
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Что рисуем</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setCategory("all")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              category === "all"
                ? "bg-orange-500/25 border border-orange-500/45 text-white"
                : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name="LayoutGrid" size={12} />
            Все
          </button>
          {DRAW_CATEGORIES.map((c) => {
            const count = DRAW_LESSONS.filter((l) => l.category === c.id).length;
            if (count === 0) return null;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === c.id
                    ? "bg-orange-500/25 border border-orange-500/45 text-white"
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

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Сложность:</p>
          <button
            onClick={() => setLevel("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              level === "all"
                ? "bg-cyan-500/25 border border-cyan-500/45 text-white"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            Любая
          </button>
          {DRAW_LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                level === l.id
                  ? "bg-cyan-500/25 border border-cyan-500/45 text-white"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      {/* Сетка уроков */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => {
            const lvl = DRAW_LEVELS.find((x) => x.id === l.level);
            return (
              <Link
                key={l.id}
                to={`/draw/${l.id}`}
                className="group bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/25 hover:translate-y-[-2px] transition-all"
              >
                <div className={`relative h-32 bg-gradient-to-br ${l.color} flex items-center justify-center overflow-hidden`}>
                  <div className="text-7xl group-hover:scale-110 transition-transform">{l.emoji}</div>
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-black/30 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    <Icon name="Clock" size={9} />
                    {l.durationMin} мин
                  </div>
                  {lvl && (
                    <span className={`absolute top-3 right-3 inline-flex items-center border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${lvl.cls}`}>
                      {lvl.label}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-montserrat font-black text-white text-base leading-tight mb-1 line-clamp-2">{l.title}</p>
                  <p className="text-white/55 text-xs mb-3 line-clamp-2">{l.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-white/45">{l.ageRange}</span>
                    <span className="inline-flex items-center gap-1 text-orange-300 text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                      Рисовать
                      <Icon name="Brush" size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Галерея */}
      {gallery.length > 0 && (
        <section id="gallery" className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16">
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2 text-center">Галерея</p>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-2">
            Твои работы
          </h2>
          <p className="text-white/55 text-sm text-center mb-8">{gallery.length} рисунков · сохраняются на этом устройстве</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {gallery.map((g) => (
              <div key={g.id} className="bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-colors">
                <img src={g.dataUrl} alt={g.lessonTitle} className="w-full aspect-square object-cover bg-white" />
                <div className="p-2.5">
                  <p className="text-white text-xs font-bold truncate">{g.emoji} {g.lessonTitle}</p>
                  <p className="text-white/45 text-[10px]">{new Date(g.createdAt).toLocaleDateString("ru-RU")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
