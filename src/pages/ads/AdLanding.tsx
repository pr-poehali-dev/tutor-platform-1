import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import { getCampaign } from "@/components/ads/adsData";
import { trackAdGoal } from "@/components/ads/useUtmTracking";

const SITE_URL = "https://учисьпро.рф";

export default function AdLanding() {
  const { slug = "" } = useParams();
  const campaign = getCampaign(slug);

  useEffect(() => {
    if (campaign) {
      trackAdGoal(`ad_landing_view_${campaign.slug}`);
    }
  }, [campaign]);

  if (!campaign) return <Navigate to="/" replace />;

  const handleCtaClick = (action: string) => {
    trackAdGoal(`ad_cta_click`, { campaign: campaign.slug, action });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`${campaign.name} — УЧИСЬПРО`}
        description={campaign.offer}
        canonical={`${SITE_URL}/ads/${campaign.slug}`}
        noindex
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

      {/* Шапка лёгкая, без отвлекающих ссылок */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide">УЧИСЬПРО</span>
          </Link>
          <div className="text-xs text-emerald-300 hidden sm:inline-flex items-center gap-1">
            <Icon name="ShieldCheck" size={12} />
            Первый урок бесплатно
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${campaign.color} rounded-full px-4 py-1.5 mb-5 shadow-lg`}>
              <span className="text-base">{campaign.emoji}</span>
              <span className="text-sm text-white font-bold uppercase tracking-wider">{campaign.name}</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-5 leading-[1.05]">
              {campaign.offer.split(". ")[0]}
            </h1>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-7">
              {campaign.offer.split(". ").slice(1).join(". ")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                to="/courses"
                onClick={() => handleCtaClick("courses")}
                className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r ${campaign.color} text-white text-base font-bold px-7 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl`}
              >
                <Icon name="Rocket" size={16} />
                Начать бесплатно
                <Icon name="ArrowRight" size={16} />
              </Link>
              <Link
                to={campaign.quickLinks[0]?.path || "/"}
                onClick={() => handleCtaClick("catalog")}
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-base font-semibold px-6 py-4 rounded-2xl transition-colors"
              >
                <Icon name="BookOpen" size={16} />
                Посмотреть каталог
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-white/55 text-sm">
              {campaign.refinements.slice(0, 4).map((r) => (
                <span key={r} className="inline-flex items-center gap-1.5">
                  <Icon name="CheckCircle2" size={14} className="text-emerald-400" />
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="relative aspect-square max-w-md mx-auto md:ml-auto w-full">
            <div className={`absolute -inset-4 bg-gradient-to-br ${campaign.color} opacity-30 blur-3xl rounded-full`} />
            <div className={`relative bg-gradient-to-br ${campaign.color} rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl p-12 flex items-center justify-center aspect-square`}>
              <div className="text-[180px] md:text-[220px] leading-none drop-shadow-2xl">
                {campaign.emoji}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Боли аудитории */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-10">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Решаем проблему</p>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-8">
          С чем вы пришли
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {campaign.pains.map((pain, i) => (
            <div key={i} className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 mb-3">
                <Icon name="AlertCircle" size={18} />
              </div>
              <p className="text-white/85 text-sm leading-relaxed">{pain}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Быстрые ссылки = «продукт по полкам» */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-10">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Что внутри</p>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-8">
          Всё, что нужно для результата
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {campaign.quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => handleCtaClick(`quicklink_${link.path}`)}
              className={`group bg-card border border-white/10 rounded-2xl p-5 hover:border-white/25 hover:translate-y-[-2px] transition-all`}
            >
              <p className="font-montserrat font-black text-white text-base mb-1">{link.label}</p>
              <p className="text-white/55 text-xs mb-3 leading-relaxed">{link.description}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r ${campaign.color} bg-clip-text text-transparent`}>
                Перейти
                <Icon name="ArrowRight" size={11} className="text-white/55 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Преимущества */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaign.refinements.map((r) => (
            <div key={r} className="bg-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Icon name="CheckCircle2" size={16} className="text-emerald-300" />
              </div>
              <p className="text-white/85 text-sm font-medium">{r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA финал */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 py-12">
        <div className={`rounded-3xl bg-gradient-to-br ${campaign.color} p-8 md:p-12 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="text-6xl mb-4">{campaign.emoji}</div>
            <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3 leading-tight">
              Начни прямо сейчас
            </h2>
            <p className="text-white/85 text-base md:text-lg mb-6 max-w-xl mx-auto">
              Первый урок бесплатно. Без привязки карты. Подписку можно отменить в любой момент.
            </p>
            <Link
              to="/courses"
              onClick={() => handleCtaClick("final_cta")}
              className="inline-flex items-center gap-2 bg-white text-purple-700 text-base font-black px-7 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl"
            >
              <Icon name="Rocket" size={16} />
              Попробовать бесплатно
              <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}