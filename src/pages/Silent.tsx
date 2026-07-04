import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import AvatarHelper from "@/components/silent/AvatarHelper";
import HelpProject from "@/components/silent/HelpProject";
import {
  SILENT_COVER,
  COURSE_FEATURES,
  COURSE_FAQ,
  LESSONS,
} from "@/components/silent/silentCourseData";

const CANONICAL = "https://xn--h1agdcde2c.xn--p1ai/silent";

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Курс для глухих и слабослышащих детей — УЧИСЬПРО",
    description:
      "Бесплатный пилотный курс для глухих детей: полные субтитры, визуальная подача, аватар-помощник. РЖЯ-видео с носителем языка — на ключевых уроках.",
    provider: { "@type": "Organization", name: "УЧИСЬПРО" },
    url: CANONICAL,
    isAccessibleForFree: true,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: COURSE_FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function Silent() {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Курс для глухих детей — бесплатно, с субтитрами и жестовым языком | УЧИСЬПРО"
        description="Инклюзивный пилотный курс для глухих и слабослышащих детей: полные субтитры, визуальная подача, добрый аватар-помощник. Бесплатно. РЖЯ-видео с носителем языка на ключевых уроках."
        canonical={CANONICAL}
        keywords="курс для глухих детей, обучение глухих, слабослышащие дети, русский жестовый язык, РЖЯ, инклюзивное образование, субтитры, доступное обучение"
        jsonLd={JSON_LD}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🤟</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/silent/lesson"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:scale-105 transition-transform"
          >
            Открыть урок
            <Icon name="ArrowRight" size={12} />
          </Link>
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {/* HERO */}
        <div className="grid lg:grid-cols-2 gap-8 items-center mb-14">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3.5 py-1 mb-4">
              <Icon name="Heart" size={13} className="text-emerald-300" />
              <span className="text-[11px] text-emerald-200 font-bold uppercase tracking-wider">
                Бесплатно · социальный проект
              </span>
            </div>
            <h1 className="font-montserrat font-black text-4xl md:text-5xl leading-[1.08] mb-5">
              Учиться могут <span className="gradient-text-purple">все</span> —
              <br />
              курс для <span className="gradient-text-pink">глухих детей</span>
            </h1>
            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-6">
              Обучение без звука: всё показано крупными субтитрами и картинками.
              Добрый аватар-помощник ведёт ребёнка по уроку и подбадривает. К ключевым
              урокам добавляем видео на русском жестовом языке.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/silent/lesson"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-7 py-4 rounded-2xl hover:scale-[1.02] transition-transform glow-purple"
              >
                <Icon name="Play" size={18} />
                Пройти демо-урок бесплатно
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-semibold px-6 py-4 rounded-2xl transition-colors"
              >
                Как это устроено
              </a>
              <a
                href="#help"
                className="inline-flex items-center gap-2 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-100 font-semibold px-6 py-4 rounded-2xl transition-colors"
              >
                <Icon name="HeartHandshake" size={18} />
                Стать частью проекта
              </a>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden border border-white/12 shadow-2xl shadow-purple-500/20">
            <img src={SILENT_COVER} alt="Дети учатся с субтитрами и жестовым языком" className="w-full aspect-square object-cover" />
          </div>
        </div>

        {/* Аватар знакомится */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 mb-14">
          <AvatarHelper
            line={{
              text: "Привет! Я — помощник в этом курсе. Я не тороплю и всегда рядом. Давай пройдём первый урок вместе — нажми «Пройти демо-урок».",
              emoji: "🤟",
              mood: "hello",
            }}
          />
        </div>

        {/* Особенности */}
        <section id="how" className="mb-14">
          <h2 className="font-montserrat font-black text-3xl md:text-4xl text-center mb-3">
            Как устроен курс
          </h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-8">
            Всё сделано так, чтобы ребёнок понимал материал глазами — без опоры на слух.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {COURSE_FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/25 to-cyan-500/25 flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">{f.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Уроки курса */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-3xl md:text-4xl text-center mb-3">
            Уроки курса
          </h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-8">
            Проходи по порядку, в своём темпе. Каждый урок — короткий и понятный.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {LESSONS.map((lesson, i) => (
              <div
                key={lesson.slug}
                className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/[0.08] to-cyan-500/[0.06] p-6 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-white text-sm">
                    {i + 1}
                  </span>
                  <span className="text-[11px] text-purple-200 font-bold uppercase tracking-wider">
                    {lesson.steps.length} слов
                  </span>
                </div>
                <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
                  {lesson.title}
                </h3>
                <p className="text-white/65 text-sm mb-4">{lesson.subtitle}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {lesson.steps.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 bg-white/8 border border-white/12 rounded-full px-3 py-1.5 text-sm text-white/80">
                      <span aria-hidden="true">{s.visual}</span>
                      {s.caption}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/silent/lesson/${lesson.slug}`}
                  className="mt-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform"
                >
                  <Icon name="Play" size={18} />
                  Начать урок
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Помочь проекту */}
        <HelpProject />

        {/* FAQ */}
        <section className="mb-6">
          <h2 className="font-montserrat font-black text-3xl text-center mb-8">Частые вопросы</h2>
          <div className="flex flex-col gap-3 max-w-3xl mx-auto">
            {COURSE_FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-bold text-white mb-1.5">{f.q}</p>
                <p className="text-white/65 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}