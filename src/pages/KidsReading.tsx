import { useState } from "react";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import KidsTopBar from "@/components/kids/landing/KidsTopBar";
import ParentGate from "@/components/kids/ParentGate";
import ParentSettingsModal from "@/components/kids/ParentSettingsModal";
import ScreenTimeBlocker from "@/components/kids/ScreenTimeBlocker";
import { useScreenTime } from "@/components/kids/useScreenTime";
import { SITE_URL } from "@/components/kids/landing/kidsLandingData";
import PoznavashkaGame from "@/components/kids/poznavashka/PoznavashkaGame";
import KsushaAvatar from "@/components/kids/games/KsushaAvatar";
import { READING_WORLDS, PARENT_READING_TIPS } from "@/components/kids/reading/readingData";

const CANONICAL = `${SITE_URL}/kids/reading`;

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Учусь читать с Ксюшей — бесплатный курс чтения для дошкольников",
    description:
      "Бесплатный пошаговый курс обучения чтению для детей 4–7 лет. Ксюша учит звукам, слогам и чтению слов в игре. За правильные ответы дети получают ЗНАЙКИ.",
    url: CANONICAL,
    inLanguage: "ru",
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "УЧИСЬПРО" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Малыш", item: `${SITE_URL}/kids` },
      { "@type": "ListItem", position: 3, name: "Учусь читать", item: CANONICAL },
    ],
  },
];

const BREADCRUMBS = [
  { label: "Главная", href: "/" },
  { label: "Малыш", href: "/kids" },
  { label: "Учусь читать" },
];

const READING_FAQ = [
  {
    q: "С какого возраста учить ребёнка читать?",
    a: "Оптимально с 4,5–5 лет, когда ребёнок хорошо говорит и различает звуки на слух. Но всё индивидуально: если малышу интересны буквы раньше — начинайте, главное без давления.",
  },
  {
    q: "Курс правда бесплатный?",
    a: "Да, курс «Учусь читать» открыт полностью бесплатно — без оплаты, подписки и рекламы.",
  },
  {
    q: "Почему вы учите звукам, а не названиям букв?",
    a: "Так советуют логопеды. Если говорить «м», а не «эм», ребёнку гораздо легче слить буквы в слог (М+А=МА). Это ускоряет обучение и убирает типичные ошибки чтения.",
  },
  {
    q: "Сколько заниматься в день?",
    a: "Дошкольнику достаточно 5–10 минут в день. Короткие частые занятия эффективнее долгих и редких — ребёнок не устаёт и сохраняет интерес.",
  },
];

export default function KidsReading() {
  const { state: screenTime } = useScreenTime(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overrideUntil, setOverrideUntil] = useState<number>(0);

  const overrideActive = Date.now() < overrideUntil;
  const showBlocker = screenTime.blocked && !overrideActive;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Учусь читать с Ксюшей — бесплатный курс чтения для дошкольников | УЧИСЬПРО Малыш"
        description="Лучший бесплатный курс обучения чтению для детей 4–7 лет. Ксюша учит звукам, слогам и чтению слов в весёлой игре. 6 ступенек от букв до первых фраз, озвучка и ЗНАЙКИ за ответы. Памятка для родителей внутри."
        canonical={CANONICAL}
        keywords="учим ребёнка читать, обучение чтению дошкольников, как научить читать по слогам, чтение для детей бесплатно, букварь онлайн, слоги для детей, читаем по слогам, подготовка к школе чтение"
        jsonLd={JSON_LD}
      />

      <KidsTopBar
        screenTime={screenTime}
        onOpenSettings={() => setGateOpen(true)}
        breadcrumbs={BREADCRUMBS}
      />

      {/* Герой раздела */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-8 pb-2 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/25 rounded-full px-3 py-1 mb-4">
          <Icon name="Gift" size={14} className="text-emerald-300" />
          <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Бесплатно навсегда
          </span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="scale-110 md:scale-125">
            <KsushaAvatar emotion="happy" size="lg" />
          </div>
          <h1 className="font-montserrat font-black text-4xl md:text-5xl text-white">
            Учусь читать
          </h1>
        </div>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto">
          Ксюша научит твоего малыша читать — шаг за шагом, от поющих букв до первых слов.
          Весело, по слогам и с озвучкой. За каждый верный ответ —{" "}
          <span className="text-amber-300 font-bold">ЗНАЙКИ</span>.
        </p>
      </section>

      {/* Игра-курс: переиспользуем движок Познавашки с данными чтения */}
      <PoznavashkaGame
        worlds={READING_WORLDS}
        earnSource="reading"
        earnLabel="Учусь читать"
        mapGreeting="Привет! Я Ксюша. Сегодня я научу тебя читать. Мы пойдём по ступенькам: сначала буквы, потом слоги, а потом ты прочитаешь свои первые слова! Выбирай ступеньку."
        mapGreetingRich="Привет! Я Ксюша 🌸 Сегодня я научу тебя читать! Пойдём по ступенькам: буквы → слоги → слова. Выбирай, с чего начнём!"
      />

      {/* Раздел для родителей */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-12">
        <div className="rounded-3xl border border-white/10 bg-card overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent p-6 md:p-8 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                👨‍👩‍👧
              </div>
              <div>
                <span className="inline-block text-indigo-200 text-[11px] font-bold uppercase tracking-wider">
                  Для родителей
                </span>
                <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl">
                  Как научить ребёнка читать
                </h2>
              </div>
            </div>
            <p className="text-white/65 text-sm md:text-base max-w-2xl">
              Шесть простых правил от методистов и логопедов. Следуйте им — и чтение станет
              для малыша лёгким и любимым делом, а не источником слёз.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
            {PARENT_READING_TIPS.map((tip, i) => (
              <div key={i} className="bg-card p-6 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={tip.icon} fallback="Sparkles" size={20} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1.5">
                    {i + 1}. {tip.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-6 text-center">
            Частые вопросы
          </h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {READING_FAQ.map((item, i) => (
              <details
                key={i}
                className="group bg-card border border-white/10 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 cursor-pointer p-5 list-none">
                  <span className="font-bold text-white text-base">{item.q}</span>
                  <Icon
                    name="ChevronDown"
                    size={20}
                    className="text-white/40 group-open:rotate-180 transition-transform flex-shrink-0"
                  />
                </summary>
                <p className="px-5 pb-5 text-white/65 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
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
          onPass={() => {
            setGateOpen(false);
            setSettingsOpen(true);
          }}
          onCancel={() => setGateOpen(false)}
        />
      )}

      {settingsOpen && <ParentSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
