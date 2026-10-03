import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import DirectionSwitch from "@/components/nav/DirectionSwitch";
import { DIRECTIONS, LearnerDirection } from "@/lib/directions";
import { trackGoal } from "@/components/analytics/YandexMetrika";

export interface LandingCard {
  to: string;
  icon: string;
  title: string;
  text: string;
  badge?: string;
}

export interface LandingGroup {
  title: string;
  cards: LandingCard[];
}

export interface LandingFaq {
  q: string;
  a: string;
}

interface Props {
  direction: LearnerDirection;
  seo: { title: string; description: string; keywords: string };
  hero: {
    eyebrow: string;
    title: React.ReactNode;
    text: string;
    image: string;
    imageAlt: string;
    primary: { to: string; label: string; icon: string };
    secondary: { to: string; label: string };
  };
  facts: { value: string; label: string }[];
  groups: LandingGroup[];
  price: { title: string; text: string; points: string[]; cta: { to: string; label: string } };
  faq: LandingFaq[];
}

/**
 * Первая страница направления. Одна структура для «Школы» и «Взрослых»:
 * обещание → факты → разделы направления → цена → вопросы.
 * Только ссылки своего направления — чужих разделов здесь нет.
 */
export default function DirectionLanding({ direction, seo, hero, facts, groups, price, faq }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const d = DIRECTIONS[direction];
  const url = `https://учисьпро.рф${d.home}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: seo.title,
      description: seo.description,
      url,
      isPartOf: { "@type": "WebSite", "@id": "https://учисьпро.рф/#website" },
      hasPart: groups.flatMap((g) =>
        g.cards.map((c) => ({ "@type": "WebPage", name: c.title, url: `https://учисьпро.рф${c.to}` })),
      ),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title={seo.title} description={seo.description} keywords={seo.keywords} canonical={url} jsonLd={jsonLd} />
      <Navbar mobileMenuOpen={mobileOpen} onToggleMobile={() => setMobileOpen((v) => !v)} />

      <main className="pt-24 md:pt-28">
        {/* На телефоне переключатель направлений живёт в меню — дублируем его
            здесь, чтобы было видно, где вы и куда можно перейти. */}
        <div className="md:hidden px-4 mb-4">
          <DirectionSwitch active={direction} variant="wide" />
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: `${d.label} · ${d.age}` }]} />
        </div>

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-4 pt-6 pb-12 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className={`inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-bold ${d.text}`}>
              <span aria-hidden="true">{d.emoji}</span>
              {hero.eyebrow}
            </span>
            <h1 className="font-montserrat font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.08] mt-4 mb-4">{hero.title}</h1>
            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-6 max-w-xl">{hero.text}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={hero.primary.to}
                onClick={() => trackGoal("direction_primary_cta", { direction })}
                className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r ${d.gradient} text-white font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg`}
              >
                <Icon name={hero.primary.icon} size={18} />
                {hero.primary.label}
              </Link>
              <Link
                to={hero.secondary.to}
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
              >
                {hero.secondary.label}
                <Icon name="ArrowRight" size={16} />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img
              src={hero.image}
              alt={hero.imageAlt}
              loading="eager"
              className="w-full aspect-square object-cover rounded-3xl border border-white/10 shadow-2xl"
            />
          </div>
        </section>

        {/* Факты */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <div className={`font-montserrat font-black text-2xl md:text-3xl ${d.text}`}>{f.value}</div>
                <div className="text-white/60 text-xs md:text-sm mt-1">{f.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Разделы направления */}
        {groups.map((g) => (
          <section key={g.title} className="max-w-6xl mx-auto px-4 pb-10">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5">{g.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.cards.map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 p-5 transition-all"
                >
                  {c.badge && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5">
                      {c.badge}
                    </span>
                  )}
                  <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${d.gradient} flex items-center justify-center mb-3`}>
                    <Icon name={c.icon} size={20} className="text-white" />
                  </span>
                  <h3 className="font-montserrat font-bold text-lg text-white mb-1 pr-16">{c.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{c.text}</p>
                  <span className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${d.text}`}>
                    Открыть
                    <Icon name="ArrowRight" size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Цена */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:p-10">
            <div className={`absolute -top-24 -right-16 w-72 h-72 rounded-full bg-gradient-to-br ${d.gradient} opacity-20 blur-3xl`} aria-hidden="true" />
            <div className="relative grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">{price.title}</h2>
                <p className="text-white/70 mb-5">{price.text}</p>
                <Link
                  to={price.cta.to}
                  onClick={() => trackGoal("direction_price_cta", { direction })}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${d.gradient} text-white font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition-transform`}
                >
                  {price.cta.label}
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </div>
              <ul className="space-y-2.5">
                {price.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-white/85">
                    <Icon name="Check" size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Семейный тариф — единственное общее предложение для всех направлений */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <FamilyOffer />
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 pb-6">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Частые вопросы</h2>
          <div className="space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-semibold text-white">
                  {f.q}
                  <Icon name="ChevronDown" size={18} className="text-white/50 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-white/70 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Семейное предложение: одна ссылка на все направления. */
export function FamilyOffer() {
  return (
    <div className="rounded-3xl border border-amber-300/25 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-violet-500/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
      <div className="text-4xl" aria-hidden="true">👨‍👩‍👧‍👦</div>
      <div className="flex-1">
        <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1">Учитесь всей семьёй</h3>
        <p className="text-white/70 text-sm md:text-base">
          Один аккаунт на семью: малыш, школьник и вы. Расскажем, как оформить доступ для всех сразу и сэкономить.
        </p>
      </div>
      <Link
        to="/contacts?topic=family"
        onClick={() => trackGoal("family_offer_click")}
        className="inline-flex items-center justify-center gap-2 bg-white text-[#1a1530] font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
      >
        Узнать о семейном доступе
      </Link>
    </div>
  );
}