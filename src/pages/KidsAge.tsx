import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import {
  AGES,
  AREAS,
  ACTIVITIES,
  AgeSlug,
  getAge,
  getActivitiesForAge,
} from "@/components/kids/kidsData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function KidsAge() {
  const { age = "" } = useParams();
  const stage = getAge(age as AgeSlug);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [openedActivity, setOpenedActivity] = useState<number | null>(null);

  const activities = useMemo(() => (stage ? getActivitiesForAge(stage.slug) : []), [stage]);
  const filtered = useMemo(
    () => (areaFilter === "all" ? activities : activities.filter((a) => a.areaId === areaFilter)),
    [areaFilter, activities],
  );

  if (!stage) return <Navigate to="/kids" replace />;

  const ageIndex = AGES.findIndex((a) => a.slug === stage.slug);
  const prevAge = ageIndex > 0 ? AGES[ageIndex - 1] : null;
  const nextAge = ageIndex < AGES.length - 1 ? AGES[ageIndex + 1] : null;

  const canonical = `${SITE_URL}/kids/${stage.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Малыш", item: `${SITE_URL}/kids` },
        { "@type": "ListItem", position: 3, name: stage.label, item: canonical },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`Развивающие занятия для детей ${stage.label} — УЧИСЬПРО Малыш`}
        description={`${activities.length} развивающих занятий для возраста ${stage.label}: речь, логика, моторика, окружающий мир, творчество, эмоции. ${stage.description}`}
        canonical={canonical}
        keywords={`развитие ребёнка ${stage.label}, развивающие занятия ${stage.shortLabel}, игры с ребёнком ${stage.label}, что развивает в ${stage.label}, ${stage.motto.toLowerCase()}`}
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
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Малыш", href: "/kids" }, { label: stage.label }]} />
          </div>
          <Link
            to="/pricing"
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="Sparkles" size={14} />
            Тарифы
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-6">
        <Link to="/kids" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          Все возрасты
        </Link>

        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${stage.color} rounded-full px-4 py-1.5 mb-5 shadow-lg`}>
              <span className="text-base">{stage.emoji}</span>
              <span className="text-sm text-white font-bold uppercase tracking-wider">Возраст {stage.label}</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-3 leading-[1.05]">
              «{stage.motto}»
            </h1>
            <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mb-6">{stage.description}</p>

            {/* Цели развития */}
            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <p className="text-white/45 text-[11px] uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                <Icon name="Target" size={11} />
                Что важно развивать в этом возрасте
              </p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {stage.developmentalGoals.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-white/75 text-sm">
                    <Icon name="CheckCircle2" size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Карточка возраста */}
          <div className={`hidden md:flex flex-col items-center bg-gradient-to-br ${stage.color} rounded-3xl p-8 min-w-[200px] shadow-2xl`}>
            <div className="text-8xl mb-3">{stage.emoji}</div>
            <p className="font-montserrat font-black text-white text-3xl mb-1">{stage.shortLabel}</p>
            <p className="text-white/85 text-xs uppercase tracking-wider">{activities.length} занятий</p>
          </div>
        </div>
      </section>

      {/* Подсказки родителю + экранное время */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Lightbulb" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-amber-200 text-[11px] uppercase tracking-wider font-bold mb-1">Совет родителю</p>
              <p className="text-white/80 text-sm leading-relaxed">{stage.parentTip}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-5 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Clock" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-cyan-200 text-[11px] uppercase tracking-wider font-bold mb-1">Экранное время</p>
              <p className="text-white/80 text-sm leading-relaxed">{stage.screenTime}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Фильтр по направлениям */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-4">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-2">Направление</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAreaFilter("all")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              areaFilter === "all"
                ? "bg-pink-500/25 border border-pink-500/45 text-white"
                : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name="LayoutGrid" size={12} />
            Все
          </button>
          {AREAS.map((a) => {
            const count = activities.filter((act) => act.areaId === a.id).length;
            if (count === 0) return null;
            return (
              <button
                key={a.id}
                onClick={() => setAreaFilter(a.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  areaFilter === a.id
                    ? "bg-pink-500/25 border border-pink-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{a.emoji}</span>
                {a.label}
                <span className="text-white/40 text-[11px]">· {count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Карточки занятий */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-12">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-white/65 text-sm mb-4">В этом направлении пока готовим занятия. Загляни позже!</p>
            <button
              onClick={() => setAreaFilter("all")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold px-5 py-3 rounded-2xl"
            >
              Показать все
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((act) => {
              const area = AREAS.find((a) => a.id === act.areaId)!;
              const isOpen = openedActivity === act.id;
              return (
                <div
                  key={act.id}
                  className={`bg-card border rounded-3xl overflow-hidden transition-all ${
                    isOpen ? "border-white/30 lg:col-span-2" : "border-white/10 hover:border-white/20 hover:translate-y-[-2px]"
                  }`}
                >
                  <div className={`h-1 bg-gradient-to-r ${area.color}`} />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${area.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                        {area.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] uppercase tracking-wider text-white/45 font-bold">{area.label}</span>
                          <span className="text-white/25 text-[10px]">·</span>
                          <span className="text-[10px] uppercase tracking-wider text-pink-300 font-bold">{act.typeLabel}</span>
                        </div>
                        <h3 className="font-montserrat font-black text-white text-base leading-tight">{act.title}</h3>
                      </div>
                    </div>

                    <p className="text-white/65 text-sm leading-relaxed mb-3 line-clamp-2">{act.description}</p>

                    <div className="flex items-center gap-3 text-white/55 text-xs mb-3">
                      <span className="flex items-center gap-1"><Icon name="Clock" size={11} /> {act.duration}</span>
                      {act.withParent && (
                        <span className="flex items-center gap-1"><Icon name="Users" size={11} /> С родителем</span>
                      )}
                    </div>

                    {isOpen && (
                      <div className="mt-4 space-y-4 animate-fadeIn">
                        <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                            <Icon name="ListChecks" size={11} /> Как играть
                          </p>
                          <ol className="space-y-1.5">
                            {act.howTo.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-white/75 text-sm">
                                <span className={`flex-shrink-0 w-5 h-5 rounded-md bg-gradient-to-br ${area.color} flex items-center justify-center text-white text-[10px] font-bold mt-0.5`}>
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                            <Icon name="Sparkles" size={11} /> Что развивает
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {act.benefits.map((b) => (
                              <span key={b} className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-[11px] font-medium px-2.5 py-1 rounded-full">
                                <Icon name="Check" size={10} />
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setOpenedActivity(isOpen ? null : act.id)}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      {isOpen ? (
                        <>
                          <Icon name="ChevronUp" size={14} />
                          Свернуть
                        </>
                      ) : (
                        <>
                          <Icon name="ChevronDown" size={14} />
                          Как играть
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Навигация между возрастами */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-12">
        <div className="grid grid-cols-2 gap-3">
          {prevAge ? (
            <Link
              to={`/kids/${prevAge.slug}`}
              className="group bg-card border border-white/10 rounded-2xl p-4 hover:border-white/25 transition-all flex items-center gap-3"
            >
              <Icon name="ArrowLeft" size={18} className="text-white/55 group-hover:text-white group-hover:-translate-x-1 transition-all" />
              <div>
                <p className="text-white/45 text-[10px] uppercase tracking-wider">Младше</p>
                <p className="font-montserrat font-bold text-white text-sm">{prevAge.emoji} {prevAge.label}</p>
              </div>
            </Link>
          ) : <div />}

          {nextAge ? (
            <Link
              to={`/kids/${nextAge.slug}`}
              className="group bg-card border border-white/10 rounded-2xl p-4 hover:border-white/25 transition-all flex items-center gap-3 justify-end text-right"
            >
              <div>
                <p className="text-white/45 text-[10px] uppercase tracking-wider">Старше</p>
                <p className="font-montserrat font-bold text-white text-sm">{nextAge.label} {nextAge.emoji}</p>
              </div>
              <Icon name="ArrowRight" size={18} className="text-white/55 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          ) : <div />}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}