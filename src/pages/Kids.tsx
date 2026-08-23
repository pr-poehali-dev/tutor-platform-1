import { useState } from "react";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import { ACTIVITIES } from "@/components/kids/kidsData";
import { useKidsProgress } from "@/components/kids/useKidsProgress";
import NannyFox from "@/components/kids/NannyFox";
import ParentGate from "@/components/kids/ParentGate";
import ParentSettingsModal from "@/components/kids/ParentSettingsModal";
import ScreenTimeBlocker from "@/components/kids/ScreenTimeBlocker";
import { useScreenTime } from "@/components/kids/useScreenTime";
import KidsTopBar from "@/components/kids/landing/KidsTopBar";
import KidsHero from "@/components/kids/landing/KidsHero";
import KidsSubscription from "@/components/kids/landing/KidsSubscription";
import KidsContent from "@/components/kids/landing/KidsContent";
import KidsTopicsBlock from "@/components/kids/KidsTopicsBlock";
import { KIDS_JSON_LD, SITE_URL } from "@/components/kids/landing/kidsLandingData";

export default function KidsLanding() {
  const totalActivities = ACTIVITIES.length;
  const { progress } = useKidsProgress();
  const { state: screenTime } = useScreenTime(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overrideUntil, setOverrideUntil] = useState<number>(0);

  // Блокировка по экранному времени, кроме случая, когда родитель только что разблокировал (10 мин)
  const overrideActive = Date.now() < overrideUntil;
  const showBlocker = screenTime.blocked && !overrideActive;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="УЧИСЬПРО Малыш — развивающие занятия для детей от 1 года до 6 лет"
        description="Развивающие занятия для детей 1–6 лет: развитие речи, обучение чтению и счёту, логика и моторика, подготовка к школе. Без рекламы, с контролем экранного времени."
        canonical={`${SITE_URL}/kids`}
        keywords="развивающие занятия для детей, развитие ребёнка от 1 года, ребёнок не говорит, как научить ребёнка читать, подготовка к школе, что должен уметь ребёнок к школе, развитие речи ребёнка, развивашки для малышей, монтессори онлайн, занятия с детьми 2 года, 3 года, 4 года, 5 лет"
        jsonLd={KIDS_JSON_LD}
      />

      <KidsTopBar screenTime={screenTime} onOpenSettings={() => setGateOpen(true)} />

      <KidsHero totalActivities={totalActivities} progress={progress} />

      <KidsSubscription />

      <KidsContent />

      <KidsTopicsBlock />

      <SiteFooter />

      <NannyFox />

      {/* Блокировщик экранного времени (СанПиН) */}
      {showBlocker && (
        <ScreenTimeBlocker
          state={screenTime}
          onOverride={() => setOverrideUntil(Date.now() + 10 * 60 * 1000)}
        />
      )}

      {/* PIN-окно перед входом в настройки родителя */}
      {gateOpen && (
        <ParentGate
          title="Настройки родителя"
          description="Чтобы открыть настройки, подтверди что ты — взрослый. Это защита по 436-ФЗ."
          onPass={() => { setGateOpen(false); setSettingsOpen(true); }}
          onCancel={() => setGateOpen(false)}
        />
      )}

      {/* Модалка настроек родителя */}
      {settingsOpen && <ParentSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}