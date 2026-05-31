import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import KidsTopBar from "@/components/kids/landing/KidsTopBar";
import ParentGate from "@/components/kids/ParentGate";
import ParentSettingsModal from "@/components/kids/ParentSettingsModal";
import ScreenTimeBlocker from "@/components/kids/ScreenTimeBlocker";
import { useScreenTime } from "@/components/kids/useScreenTime";
import { SITE_URL } from "@/components/kids/landing/kidsLandingData";
import KsushaAvatar from "@/components/kids/games/KsushaAvatar";
import { KIDS_GAMES } from "@/components/kids/games/gamesData";

const CANONICAL = `${SITE_URL}/kids/games`;

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Игротека с Ксюшей",
    description:
      "Бесплатные онлайн-игры для детей: крестики-нолики, пятнашки, шашки, шахматы, морской бой, пять в ряд, реверси и другие. Ксюша объясняет правила голосом и играет вместе с ребёнком.",
    url: CANONICAL,
    inLanguage: "ru",
    hasPart: KIDS_GAMES.map((g) => ({
      "@type": "Game",
      name: g.title,
      description: g.short,
      url: `${SITE_URL}/kids/games/${g.slug}`,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Малыш", item: `${SITE_URL}/kids` },
      { "@type": "ListItem", position: 3, name: "Игротека", item: CANONICAL },
    ],
  },
];

const BREADCRUMBS = [
  { label: "Главная", href: "/" },
  { label: "Малыш", href: "/kids" },
  { label: "Игротека" },
];

export default function KidsGames() {
  const { state: screenTime } = useScreenTime(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overrideUntil, setOverrideUntil] = useState<number>(0);

  const overrideActive = Date.now() < overrideUntil;
  const showBlocker = screenTime.blocked && !overrideActive;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Игротека с Ксюшей — бесплатные онлайн-игры для детей | УЧИСЬПРО Малыш"
        description="Бесплатные развивающие игры для детей: крестики-нолики, шашки, шахматы, пятнашки, морской бой, пять в ряд, реверси, найди пару и другие. Ксюша объясняет правила голосом и играет вместе с ребёнком. За победу — ЗНАЙКИ."
        canonical={CANONICAL}
        keywords="игры для детей онлайн, бесплатные детские игры, крестики нолики, пятнашки, шашки для детей, шахматы для детей, морской бой, логические игры малышам"
        jsonLd={JSON_LD}
      />

      <KidsTopBar
        screenTime={screenTime}
        onOpenSettings={() => setGateOpen(true)}
        breadcrumbs={BREADCRUMBS}
      />

      {/* Герой */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-8 pb-2 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/25 rounded-full px-3 py-1 mb-4">
          <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Новый раздел</span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="scale-110 md:scale-125">
            <KsushaAvatar emotion="idle" size="lg" />
          </div>
          <h1 className="font-montserrat font-black text-4xl md:text-5xl text-white">
            Игротека с Ксюшей
          </h1>
        </div>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto">
          Ксюша научит играть в любимые игры и сыграет вместе с тобой! За каждую победу —
          <span className="text-amber-300 font-bold"> ЗНАЙКИ</span>.
        </p>
      </section>

      {/* ВЫБОР ИГРЫ */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {KIDS_GAMES.map((g) => (
            <Link
              key={g.slug}
              to={`/kids/games/${g.slug}`}
              className="group relative text-left bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 hover:translate-y-[-4px] transition-all"
            >
              {g.isNew && (
                <span className="absolute top-3 right-3 z-10 text-[10px] font-black uppercase tracking-wide bg-emerald-400/90 text-emerald-950 rounded-full px-2 py-0.5">
                  Новинка
                </span>
              )}
              <div className={`h-2 bg-gradient-to-r ${g.color}`} />
              <div className="p-6 flex items-center gap-5">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${g.color} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {g.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-montserrat font-black text-white text-xl mb-1">{g.title}</h3>
                  <p className="text-white/60 text-sm mb-2">{g.short}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-full px-2.5 py-1 font-bold">
                    <Icon name="Sparkles" size={11} />
                    +{g.reward} ЗНАЕК за победу
                  </span>
                </div>
                <Icon name="ChevronRight" size={24} className="text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />

      {showBlocker && (
        <ScreenTimeBlocker
          state={screenTime}
          onOverride={() => setOverrideUntil(Date.now() + 10 * 60 * 1000)}
        />
      )}

      {gateOpen && (
        <ParentGate
          title="Настройки родителя"
          description="Чтобы открыть настройки, подтверди что ты — взрослый. Это защита по 436-ФЗ."
          onPass={() => { setGateOpen(false); setSettingsOpen(true); }}
          onCancel={() => setGateOpen(false)}
        />
      )}

      {settingsOpen && <ParentSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
