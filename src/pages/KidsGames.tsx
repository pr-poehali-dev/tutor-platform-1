import { useState, useEffect } from "react";
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
import { KSUSHA_AVATAR } from "@/components/kids/poznavashka/poznavashkaData";
import { KIDS_GAMES, GameInfo } from "@/components/kids/games/gamesData";
import { useZnaika } from "@/context/ZnaikaContext";
import { useAuth } from "@/context/AuthContext";
import GamePlay from "@/components/kids/games/GamePlay";

export default function KidsGames() {
  const { state: screenTime } = useScreenTime(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overrideUntil, setOverrideUntil] = useState<number>(0);

  const { speak, stop, toggle, enabled, speaking } = useKsushaVoice();
  const { earn } = useZnaika();
  const { isAuthenticated, openLogin } = useAuth();

  const [game, setGame] = useState<GameInfo | null>(null);
  const [bubble, setBubble] = useState<string>("");
  const [rewarded, setRewarded] = useState(false);

  const overrideActive = Date.now() < overrideUntil;
  const showBlocker = screenTime.blocked && !overrideActive;

  const openGame = (g: GameInfo) => {
    setGame(g);
    setRewarded(false);
    setBubble(g.rules);
    speak(g.rules);
  };

  const backToHub = () => {
    stop();
    setGame(null);
    setBubble("");
  };

  // Реплика Ксюши во время игры
  const say = (text: string) => {
    setBubble(text);
    speak(text);
  };

  const handleWin = () => {
    if (!game || rewarded) return;
    setRewarded(true);
    if (isAuthenticated) {
      earn("kids_game", game.reward, `Игротека: ${game.title}`);
    }
  };

  useEffect(() => stop, [stop]);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Игротека с Ксюшей — шашки, шахматы, пятнашки, морской бой для детей | УЧИСЬПРО Малыш"
        description="Ксюша учит малышей играть в настольные и логические игры: крестики-нолики, пятнашки, шашки, шахматы, морской бой. Объясняет правила голосом, играет вместе с ребёнком. За победу — ЗНАЙКИ."
        canonical={`${SITE_URL}/kids/games`}
        keywords="игры для детей онлайн, крестики нолики, пятнашки, шашки для детей, шахматы для детей, морской бой, логические игры малышам"
      />

      <KidsTopBar screenTime={screenTime} onOpenSettings={() => setGateOpen(true)} />

      {/* Герой */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-8 pb-2 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/25 rounded-full px-3 py-1 mb-4">
          <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Новый раздел</span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-3">
          <img
            src={KSUSHA_AVATAR}
            alt="Ксюша"
            className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-amber-300/60 shadow-xl shadow-amber-500/20 object-cover"
          />
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
      {!game && (
        <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {KIDS_GAMES.map((g) => (
              <button
                key={g.slug}
                onClick={() => openGame(g)}
                className="group text-left bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 hover:translate-y-[-4px] transition-all"
              >
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
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ЭКРАН ИГРЫ */}
      {game && (
        <GamePlay
          game={game}
          bubble={bubble}
          speaking={speaking}
          voiceEnabled={enabled}
          onToggleVoice={toggle}
          onSpeak={speak}
          onSay={say}
          onBack={backToHub}
          onReward={handleWin}
          isAuthenticated={isAuthenticated}
          onLogin={openLogin}
        />
      )}

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