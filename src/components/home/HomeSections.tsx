import { Suspense } from "react";
import { Link } from "react-router-dom";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
import Icon from "@/components/ui/icon";
import DirectionDoors from "@/components/home/DirectionDoors";
import HeroTryTutor from "@/components/home/HeroTryTutor";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import AiNavigator from "@/components/home/AiNavigator";
import StudentResults from "@/components/home/StudentResults";
import TrustGuarantee from "@/components/home/TrustGuarantee";
import TochkaTrustStrip from "@/components/partners/TochkaTrustStrip";
import { FamilyOffer } from "@/components/direction/DirectionLanding";
import { useAuth } from "@/context/AuthContext";
import { SectionSkeleton } from "./constants";

const MySpaceSection = lazy(() => import("@/components/myspace/MySpaceSection"));

/** Как это работает — одинаково для всех направлений. */
const STEPS = [
  { icon: "MousePointerClick", title: "Выберите, кто учится", text: "Малыш, школьник или вы сами — у каждого свой раздел и свои занятия." },
  { icon: "Bot", title: "Занимайтесь с ИИ", text: "Наставник объясняет простыми словами, проверяет задания и всегда на связи." },
  { icon: "TrendingUp", title: "Видите прогресс", text: "Что пройдено, где пробелы и что делать дальше — в одном кабинете." },
];

/**
 * Главная — это три «двери» и короткий рассказ о платформе.
 * Каталогов и десятков ссылок здесь больше нет: всё содержимое
 * живёт в направлениях. Под дверями — общие для семьи блоки и текст,
 * который нужен поиску.
 */
export default function HomeSections() {
  const { isAuthenticated } = useAuth();

  return (
    <main id="main-content">
      <DirectionDoors />

      {/* Флагман платформы — ИИ-репетитор. Живая проба прямо на главной:
          вопрос → настоящий ответ за пару секунд, без регистрации. */}
      <section id="ai-teacher" className="max-w-6xl mx-auto px-4 pb-6" aria-labelledby="tutor-title">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-purple-200 font-bold uppercase tracking-wider mb-2">
              <Icon name="Sparkles" size={12} /> Флагман · первый урок бесплатно
            </span>
            <h2 id="tutor-title" className="font-montserrat font-black text-2xl md:text-4xl leading-tight mb-3">
              ИИ-репетитор, который доводит <span className="gradient-text-pink">до 90+ баллов</span>
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-5">
              Все предметы 1–11 класса. Находит пробелы за 5 минут, объясняет голосом и ведёт по личному плану — 24/7, без записи.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/tutor"
                onClick={() => trackGoal("home_tutor_open")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform"
              >
                <Icon name="GraduationCap" size={18} /> Открыть репетитора
              </Link>
              <Link to="/pricing" className="inline-flex items-center gap-2 text-white/75 hover:text-white text-sm font-semibold px-2 py-3">
                Подписка 1 490 ₽/мес <Icon name="ArrowRight" size={14} />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <HeroTryTutor />
          </div>
        </div>
      </section>


      {/* Вошедшему — сразу его обучение */}
      {isAuthenticated && (
        <Suspense fallback={<SectionSkeleton />}>
          <MySpaceSection />
        </Suspense>
      )}

      {/* Не знаете, с чего начать — ИИ-навигатор подскажет раздел */}
      <AiNavigator />

      <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="how-title">
        <h2 id="how-title" className="font-montserrat font-black text-3xl md:text-4xl text-center mb-8">
          Как это <span className="gradient-text-purple">работает</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Icon name={s.icon} size={22} className="text-white" />
                </span>
                <span className="font-montserrat font-black text-3xl text-white/10">{i + 1}</span>
              </div>
              <h3 className="font-montserrat font-bold text-lg text-white mb-1.5">{s.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <StudentResults />

      <section className="max-w-6xl mx-auto px-4 py-6">
        <FamilyOffer />
      </section>

      <TrustGuarantee />

      {/* Партнёр проекта — Точка Банк: знак доверия, без рекламы */}
      <TochkaTrustStrip />

      {/* Текст для поиска: главная по-прежнему отвечает на запросы о репетиторе
          и обучении — без него страница из «дверей» потеряла бы позиции. */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-white/65 text-sm leading-relaxed space-y-3">
        <h2 className="font-montserrat font-black text-xl text-white">УЧИСЬПРО — онлайн-обучение с ИИ для всей семьи</h2>
        <p>
          <Link to="/kids" className="text-amber-200 hover:text-white underline-offset-2 hover:underline">Малышам от 1 до 6 лет</Link> —
          развивающие занятия по возрасту, песни, сказки, логопедические упражнения и подготовка к школе.
          Первые три месяца бесплатно, далее 399 ₽ в месяц.
        </p>
        <p>
          <Link to="/shkola" className="text-cyan-200 hover:text-white underline-offset-2 hover:underline">Школьникам 1–11 классов</Link> —
          <Link to="/tutor" className="text-white/85 hover:text-white"> онлайн-репетитор с ИИ</Link> по всем предметам 24/7,
          разбор домашки по фото, банк заданий ОГЭ и ЕГЭ, калькулятор баллов и подбор вуза. Подписка — 1 490 ₽ в месяц.
        </p>
        <p>
          <Link to="/vzroslym" className="text-emerald-200 hover:text-white underline-offset-2 hover:underline">Взрослым</Link> —
          40+ программ: нейросети для работы, удалённые профессии, запуск бизнеса, инструменты руководителя и психология.
          Бесплатные мини-курсы проходятся за один вечер.
        </p>
      </section>
    </main>
  );
}