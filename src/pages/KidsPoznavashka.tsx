import { useState } from "react";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import KidsTopBar from "@/components/kids/landing/KidsTopBar";
import ParentGate from "@/components/kids/ParentGate";
import ParentSettingsModal from "@/components/kids/ParentSettingsModal";
import ScreenTimeBlocker from "@/components/kids/ScreenTimeBlocker";
import { useScreenTime } from "@/components/kids/useScreenTime";
import { SITE_URL } from "@/components/kids/landing/kidsLandingData";
import PoznavashkaGame from "@/components/kids/poznavashka/PoznavashkaGame";
import { OKSANOCHKA_AVATAR } from "@/components/kids/poznavashka/poznavashkaData";

export default function KidsPoznavashka() {
  const { state: screenTime } = useScreenTime(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overrideUntil, setOverrideUntil] = useState<number>(0);

  const overrideActive = Date.now() < overrideUntil;
  const showBlocker = screenTime.blocked && !overrideActive;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Познавашка с Оксаночкой — игра про окружающий мир для малышей | УЧИСЬПРО Малыш"
        description="Весёлая обучающая игра для детей до 12 лет. Персонаж Оксаночка в сказочной стране рассказывает, как устроен окружающий мир. За правильные ответы дети получают ЗНАЙКИ — внутреннюю валюту платформы."
        canonical={`${SITE_URL}/kids/poznavashka`}
        keywords="познавательная игра для детей, окружающий мир для малышей, обучающая игра дошкольникам, викторина для детей, развивающая игра онлайн"
      />

      <KidsTopBar screenTime={screenTime} onOpenSettings={() => setGateOpen(true)} />

      {/* Герой раздела */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-8 pb-2 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/25 rounded-full px-3 py-1 mb-4">
          <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Новый раздел</span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-3">
          <img
            src={OKSANOCHKA_AVATAR}
            alt="Оксаночка"
            className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-amber-300/60 shadow-xl shadow-amber-500/20 object-cover"
          />
          <h1 className="font-montserrat font-black text-4xl md:text-5xl text-white">
            Познавашка
          </h1>
        </div>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto">
          Оксаночка приглашает в путешествие по сказочной стране! Узнавай, как устроен мир,
          отвечай на вопросы и собирай <span className="text-amber-300 font-bold">ЗНАЙКИ</span> за каждый верный ответ.
        </p>
      </section>

      <PoznavashkaGame />

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
