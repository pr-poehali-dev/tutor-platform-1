import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import TutorTopBar from "@/components/tutor/TutorTopBar";
import TutorHero from "@/components/tutor/TutorHero";
import TutorMentorIntro from "@/components/tutor/TutorMentorIntro";
import TutorFeatures from "@/components/tutor/TutorFeatures";
import TutorSubjects from "@/components/tutor/TutorSubjects";
import TutorGrades from "@/components/tutor/TutorGrades";
import TutorHowItWorks from "@/components/tutor/TutorHowItWorks";
import StudentResults from "@/components/home/StudentResults";
import TutorPricing from "@/components/tutor/TutorPricing";
import TutorFAQ from "@/components/tutor/TutorFAQ";
import TutorCTA from "@/components/tutor/TutorCTA";
import { useTutorAccess } from "@/components/tutor/useTutorAccess";

const LearningJourney = lazy(() => import("@/components/LearningJourney"));
const TutorWorkspace = lazy(() => import("@/components/tutor/TutorWorkspace"));

const SITE_URL = "https://учисьпро.рф";
const CANONICAL = `${SITE_URL}/tutor`;

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Репетитор УЧИСЬПРО — личный ИИ-наставник по всем предметам",
    serviceType: "Онлайн-репетитор с ИИ",
    description:
      "Личный репетитор с ИИ: голосовые уроки по физике, математике и информатике, проверка домашнего задания по фото, задачники и подготовка к ЕГЭ. Первый урок бесплатно.",
    url: CANONICAL,
    provider: { "@type": "Organization", name: "УЧИСЬПРО" },
    areaServed: "RU",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Репетитор", item: CANONICAL },
    ],
  },
];

export default function TutorHub() {
  const { hasAccess, loading, tutorTrial, hasSubscription } = useTutorAccess();
  const trialDaysLeft = tutorTrial.until
    ? Math.max(0, Math.ceil((new Date(tutorTrial.until).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Репетитор с ИИ — личный наставник по всем предметам | УЧИСЬПРО"
        description="Личный репетитор с ИИ: голосовые уроки, проверка домашки по фото и подготовка к ЕГЭ по физике, математике, информатике и химии. Первый урок бесплатно."
        canonical={CANONICAL}
        keywords="репетитор онлайн, ии репетитор, репетитор по физике, репетитор по математике, проверка домашнего задания, подготовка к егэ, наставник с голосом, онлайн занятия для школьников"
        jsonLd={JSON_LD}
      />

      <TutorTopBar />

      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Icon name="Loader2" size={32} className="animate-spin text-purple-400" />
        </div>
      ) : hasAccess ? (
        // ── Доступ оплачен: рабочее пространство модуля ──
        <>
          {tutorTrial.active && !hasSubscription && (
            <div className="max-w-6xl mx-auto px-4 pt-4">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <Icon name="Gift" size={20} className="text-emerald-300 flex-shrink-0" />
                <p className="text-sm text-white/85 flex-1">
                  <b className="text-white">Пробная неделя:</b> осталось {trialDaysLeft} {trialDaysLeft === 1 ? "день" : trialDaysLeft < 5 ? "дня" : "дней"} — все предметы без ограничений.
                  Карта не привязана, списаний не будет.
                </p>
                <Link to="/pricing" className="text-sm font-bold text-emerald-200 hover:text-white whitespace-nowrap">
                  Оформить подписку →
                </Link>
              </div>
            </div>
          )}
          <Suspense fallback={<div className="py-24 text-center text-white/40 text-sm">Открываю модуль…</div>}>
            <TutorWorkspace />
          </Suspense>
        </>
      ) : (
        // ── Лендинг модуля: промо, бесплатный тест-крючок и цены ──
        <>
          <TutorHero />
          <TutorMentorIntro />
          <Suspense fallback={<div className="py-16 text-center text-white/40 text-sm">Готовлю наставника…</div>}>
            <LearningJourney />
          </Suspense>
          <TutorFeatures />
          <TutorSubjects />
          <TutorGrades />
          <TutorHowItWorks />
          <StudentResults />
          <TutorPricing />
          <TutorFAQ />
          <TutorCTA />
        </>
      )}

      <SiteFooter />
    </div>
  );
}