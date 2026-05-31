import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import KidsTopBar from "@/components/kids/landing/KidsTopBar";
import ParentGate from "@/components/kids/ParentGate";
import ParentSettingsModal from "@/components/kids/ParentSettingsModal";
import ScreenTimeBlocker from "@/components/kids/ScreenTimeBlocker";
import { useScreenTime } from "@/components/kids/useScreenTime";
import { SITE_URL } from "@/components/kids/landing/kidsLandingData";
import { useKsushaVoice } from "@/components/kids/poznavashka/useKsushaVoice";
import { getGameBySlug, KIDS_GAMES } from "@/components/kids/games/gamesData";
import GamePlay from "@/components/kids/games/GamePlay";
import { useZnaika } from "@/context/ZnaikaContext";
import { useAuth } from "@/context/AuthContext";

export default function KidsGamePlay() {
  const { slug = "" } = useParams();
  const game = getGameBySlug(slug);

  const { state: screenTime } = useScreenTime(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overrideUntil, setOverrideUntil] = useState<number>(0);

  const { speak, chirp, stop, toggle, enabled, speaking } = useKsushaVoice();
  const { earn } = useZnaika();
  const { isAuthenticated, openLogin } = useAuth();

  const [bubble, setBubble] = useState<string>("");
  const [rewarded, setRewarded] = useState(false);

  // Озвучить правила при входе в игру
  useEffect(() => {
    if (game) {
      setBubble(game.rules);
      setRewarded(false);
      speak(game.rules);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!game) return <Navigate to="/kids/games" replace />;

  const overrideActive = Date.now() < overrideUntil;
  const showBlocker = screenTime.blocked && !overrideActive;

  const canonical = `${SITE_URL}/kids/games/${game.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Game",
      name: game.title,
      description: game.seoDescription,
      url: canonical,
      inLanguage: "ru",
      genre: "детская развивающая игра",
      audience: { "@type": "PeopleAudience", suggestedMinAge: 3 },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Малыш", item: `${SITE_URL}/kids` },
        { "@type": "ListItem", position: 3, name: "Игротека", item: `${SITE_URL}/kids/games` },
        { "@type": "ListItem", position: 4, name: game.title, item: canonical },
      ],
    },
  ];

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Малыш", href: "/kids" },
    { label: "Игротека", href: "/kids/games" },
    { label: game.title },
  ];

  const say = (text: string) => {
    setBubble(text);
    speak(text);
  };

  const showText = (text: string) => setBubble(text);

  const handleWin = () => {
    if (rewarded) return;
    setRewarded(true);
    if (isAuthenticated) {
      earn("kids_game", game.reward, `Игротека: ${game.title}`);
    }
  };

  // Другие игры для перелинковки (хорошо для SEO)
  const others = KIDS_GAMES.filter((g) => g.slug !== game.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={game.seoTitle}
        description={game.seoDescription}
        canonical={canonical}
        keywords={game.keywords}
        jsonLd={jsonLd}
      />

      <KidsTopBar
        screenTime={screenTime}
        onOpenSettings={() => setGateOpen(true)}
        breadcrumbs={breadcrumbs}
      />

      <h1 className="sr-only">{game.title} — играть онлайн для детей бесплатно</h1>

      <GamePlay
        game={game}
        bubble={bubble}
        speaking={speaking}
        voiceEnabled={enabled}
        onToggleVoice={toggle}
        onSpeak={speak}
        onSay={say}
        onShowText={showText}
        onChirp={chirp}
        onBack={() => stop()}
        onReward={handleWin}
        isAuthenticated={isAuthenticated}
        onLogin={openLogin}
      />

      {/* Перелинковка на другие игры */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pb-10">
        <h2 className="font-montserrat font-black text-white text-lg mb-4">Другие игры с Ксюшей</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {others.map((g) => (
            <Link
              key={g.slug}
              to={`/kids/games/${g.slug}`}
              className="group flex items-center gap-3 bg-card border border-white/10 rounded-2xl p-3 hover:border-white/30 transition-all"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-xl flex-shrink-0`}>
                {g.emoji}
              </div>
              <span className="text-white/80 text-sm font-bold leading-tight group-hover:text-white">
                {g.title}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link
            to="/kids/games"
            className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 text-sm font-bold"
          >
            <Icon name="LayoutGrid" size={15} />
            Все игры Игротеки
          </Link>
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
