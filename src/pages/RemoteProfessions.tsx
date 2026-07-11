import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import TochkaBusinessBanner from "@/components/partners/TochkaBusinessBanner";
import { COURSES, getCoursePrice, getCoursePriceLabel } from "@/components/courses/coursesData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

// Подборка: топ востребованных удалённых профессий (HH.ru / SuperJob 2026).
// id курсов из каталога + рыночная справка по доходу.
const PICKS: { id: number; salary: string; demand: string }[] = [
  { id: 78, salary: "2 500–7 000 ₽ за сессию", demand: "Доказательная психотерапия: растущий спрос на психологов" },
  { id: 77, salary: "2 000–6 000 ₽ за сессию", demand: "Помогающая профессия: психолог-коуч, частная практика" },
  { id: 71, salary: "от 60 000 ₽ + %", demand: "Самая массовая удалёнка — ~17% всех вакансий" },
  { id: 69, salary: "40 000–130 000 ₽", demand: "Стабильный спрос на госзакупках" },
  { id: 70, salary: "130 000–208 000 ₽", demand: "Дефицит кадров, высокий доход" },
  { id: 68, salary: "80 000–250 000 ₽", demand: "Растущая профессия в любой отрасли" },
  { id: 67, salary: "от 80 000 ₽", demand: "Вход в IT с готовым портфолио" },
];

const STEPS = [
  { emoji: "🎯", title: "Выбери профессию", desc: "7 направлений с реальным спросом на рынке" },
  { emoji: "📚", title: "Пройди курс", desc: "Полная программа: теория, практика и проект" },
  { emoji: "💼", title: "Собери портфолио", desc: "Финальный проект-кейс и резюме для работодателя" },
  { emoji: "🚀", title: "Выйди на доход", desc: "Удалённая работа или фриланс по новой профессии" },
];

export default function RemoteProfessions() {
  const picks = PICKS
    .map((p) => ({ ...p, course: COURSES.find((c) => c.id === p.id) }))
    .filter((p) => p.course);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Удалённые профессии 2026: топ востребованных курсов · УЧИСЬПРО"
        description="Подборка самых востребованных удалённых профессий по данным HH.ru и SuperJob: тендеры, ВЭД, продажи B2B, аналитик данных, Python-разработчик. Освой с нуля и выйди на доход."
        canonical={`${SITE_URL}/remote-professions`}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">💼</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Удалённые профессии" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-4">
            <Icon name="Briefcase" size={12} className="text-violet-300" />
            <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">Профессии 2026</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            Удалённые профессии,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              которые востребованы
            </span>
          </h1>
          <p className="text-white/70 text-base max-w-2xl mx-auto">
            Мы изучили вакансии на HH.ru и SuperJob и собрали 7 профессий с реальным спросом, которые можно освоить с нуля и работать удалённо. Для каждой — полноценный курс с практикой и проектом для портфолио.
          </p>
        </section>

        {/* Как это работает */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {STEPS.map((s) => (
            <div key={s.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-1">{s.emoji}</div>
              <p className="font-bold text-white text-sm mb-1">{s.title}</p>
              <p className="text-white/55 text-xs leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Рейтинг профессий */}
        <h2 className="font-montserrat font-black text-2xl mb-5 text-center">Топ-5 удалённых профессий</h2>
        <div className="space-y-4 mb-12">
          {picks.map((p, idx) => {
            const c = p.course!;
            const price = getCoursePrice(c);
            return (
              <Link
                key={c.id}
                to={`/course-checkout/${c.id}`}
                className="block rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                  {/* Номер + эмодзи */}
                  <div className="flex sm:flex-col items-center gap-2 sm:w-16 flex-shrink-0">
                    <div className="font-montserrat font-black text-2xl text-white/30">#{idx + 1}</div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl`}>
                      {c.emoji}
                    </div>
                  </div>

                  {/* Текст */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-montserrat font-black text-white text-base leading-snug mb-1">{c.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-xs">
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        <Icon name="Wallet" size={13} /> {p.salary}
                      </span>
                      <span className="text-white/50 flex items-center gap-1">
                        <Icon name="TrendingUp" size={13} /> {p.demand}
                      </span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {c.tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-[11px] text-white/45 bg-white/5 px-2 py-0.5 rounded-lg">{t}</span>
                      ))}
                      <span className="text-[11px] text-white/45 bg-white/5 px-2 py-0.5 rounded-lg">{c.lessons} уроков</span>
                    </div>
                  </div>

                  {/* Цена + CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:w-36 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
                    <div className="text-right">
                      <div className="font-montserrat font-black text-xl text-white">{getCoursePriceLabel(c)}</div>
                      {price > 0 && <div className="text-white/35 text-[11px]">за весь курс</div>}
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-xl">
                      Открыть <Icon name="ChevronRight" size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Хочешь работать на себя — курс по запуску бизнеса */}
        {(() => {
          const biz = COURSES.find((c) => c.id === 75);
          if (!biz) return null;
          return (
            <Link
              to={`/course-checkout/${biz.id}`}
              className="block rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/12 to-fuchsia-500/8 hover:border-violet-400/40 transition-all p-5 sm:p-6 mb-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${biz.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {biz.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-violet-200 font-bold uppercase tracking-wider mb-1">
                    <Icon name="Rocket" size={12} /> Работать на себя
                  </div>
                  <h3 className="font-montserrat font-black text-white text-base leading-snug mb-1">{biz.title}</h3>
                  <p className="text-white/55 text-xs leading-snug">ИП и налоги, расчётный счёт, касса, первые клиенты — пошагово, без бумажной волокиты.</p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between flex-shrink-0">
                  <div className="font-montserrat font-black text-xl text-white">{getCoursePriceLabel(biz)}</div>
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold px-4 py-2 rounded-xl">
                    Открыть <Icon name="ChevronRight" size={14} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })()}

        {/* Партнёр — Точка Банк: для тех, кто хочет работать на себя */}
        <TochkaBusinessBanner
          className="mb-12"
          title="Хочешь работать на себя? Начни с Точкой"
          text="Освоив новую профессию, легко перейти на фриланс или открыть своё дело. Регистрация ИП и расчётный счёт — бесплатно у нашего партнёра, Точка Банк."
        />

        {/* Почему наши курсы */}
        <div className="grid sm:grid-cols-3 gap-3 mb-12">
          {[
            { icon: "BookOpen", title: "Реальные программы", desc: "Каждый курс — полная программа с модулями, уроками и методиками" },
            { icon: "FolderCheck", title: "Проект в портфолио", desc: "В финале — кейс, который можно показать работодателю" },
            { icon: "Bot", title: "ИИ-наставник 24/7", desc: "Объяснит тему и ответит на вопрос в любое время" },
          ].map((f) => (
            <div key={f.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-2">
                <Icon name={f.icon} fallback="Sparkles" size={18} className="text-violet-300" />
              </div>
              <p className="font-bold text-white text-sm mb-1">{f.title}</p>
              <p className="text-white/55 text-xs leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-violet-500/15 to-cyan-500/10 border border-violet-500/25 rounded-3xl p-6 md:p-8">
          <h2 className="font-montserrat font-black text-2xl mb-2">Готов сменить профессию?</h2>
          <p className="text-white/65 text-sm mb-5 max-w-xl mx-auto">
            Выбери направление, начни с бесплатных уроков и собери портфолио для удалённой работы.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Смотреть все курсы <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}