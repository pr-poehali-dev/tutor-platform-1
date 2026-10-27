import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import RegisterForm from "./RegisterForm";
import { MarathonProgram } from "./types";
import { getSavedToken } from "./api";

const SITE = "https://учисьпро.рф";

interface Props {
  program: MarathonProgram;
  other: MarathonProgram;
}

export default function MarathonLanding({ program, other }: Props) {
  const url = `${SITE}/${program.slug}`;
  const savedToken = getSavedToken(program.track);
  const isTeacher = program.track === "teacher";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: `Марафон «${program.title}»`,
      description: program.seo.description,
      provider: { "@type": "Organization", name: "УЧИСЬПРО", sameAs: SITE },
      url,
      isAccessibleForFree: true,
      inLanguage: "ru",
      hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT2H" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: program.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title={program.seo.title} description={program.seo.description} keywords={program.seo.keywords} canonical={url} image={program.heroImage} jsonLd={jsonLd} />

      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">📖</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          {savedToken ? (
            <Link to={`/${program.slug}/kabinet?t=${savedToken}`} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-xl">
              Мои уроки <Icon name="ArrowRight" size={14} />
            </Link>
          ) : (
            <a href="#register" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-xl">
              Участвовать бесплатно
            </a>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Главная", href: "/" },
            { label: "Тест скорости чтения", href: "/test-skorosti-chteniya" },
            { label: program.shortTitle },
          ]}
        />

        {/* Первый экран */}
        <section className="grid lg:grid-cols-[1.15fr_1fr] gap-8 items-start mb-16">
          <div>
            <span className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Icon name="Gift" size={13} /> {program.badge}
            </span>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.1] mb-5">
              {isTeacher ? "Марафон скорочтения: " : "Скорочтение для детей: "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{program.title.toLowerCase()}</span>
            </h1>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">{program.heroLead}</p>
            <div className="flex flex-wrap gap-2 mb-7">
              {["3 урока по 25–40 минут", "Тренажёры прямо в уроке", "ИИ-наставник 24/7", "Чек-лист в подарок"].map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-white/75 text-xs">
                  <Icon name="Check" size={13} className="text-emerald-300" /> {c}
                </span>
              ))}
            </div>
            <img src={program.heroImage} alt={program.title} className="w-full rounded-3xl border border-white/10 aspect-[16/9] object-cover" loading="eager" />
          </div>
          <div className="lg:sticky lg:top-24">
            <RegisterForm program={program} id="register" />
            <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 flex gap-3">
              <Icon name="FileText" size={22} className="text-amber-300 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-bold">{program.bonus.title}</p>
                <p className="text-white/60 text-xs mt-0.5">{program.bonus.text}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Для кого */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Кому подойдёт марафон</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {program.forWhom.map((f) => (
              <div key={f.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center mb-3">
                  <Icon name={f.icon} size={20} className="text-white" fallback="Sparkles" />
                </div>
                <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Программа */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">Программа на 3 дня</h2>
          <p className="text-white/55 text-sm mb-6">Каждый урок открывается через сутки после предыдущего — так знания успевают закрепиться.</p>
          <div className="space-y-4">
            {program.days.map((d) => (
              <div key={d.day} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 grid md:grid-cols-[140px_1fr] gap-4">
                <div>
                  <p className="font-montserrat font-black text-4xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">День {d.day}</p>
                  <p className="text-white/45 text-xs mt-1">≈ {d.minutes} минут</p>
                </div>
                <div>
                  <h3 className="font-montserrat font-black text-white text-lg mb-1">{d.title}</h3>
                  <p className="text-white/55 text-sm mb-3">{d.subtitle}</p>
                  <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {d.sections.map((s) => (
                      <li key={s.title} className="flex gap-2 text-white/75 text-sm">
                        <Icon name="CircleCheck" size={15} className="text-cyan-300 flex-shrink-0 mt-0.5" /> {s.title}
                      </li>
                    ))}
                    {d.exercises.map((e) => (
                      <li key={e.title} className="flex gap-2 text-white/75 text-sm">
                        <Icon name="Gamepad2" size={15} className="text-amber-300 flex-shrink-0 mt-0.5" /> Тренажёр: {e.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Результат */}
        <section className="mb-16 rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-700/20 to-cyan-700/10 p-6 md:p-8">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5">Что вы получите</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {program.results.map((r) => (
              <li key={r} className="flex gap-3 bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-white/85 text-sm">
                <Icon name="Sparkles" size={18} className="text-amber-300 flex-shrink-0" /> {r}
              </li>
            ))}
          </ul>
        </section>

        {/* Тест скорости */}
        <section className="mb-16 grid md:grid-cols-[1fr_auto] gap-5 items-center rounded-3xl border border-cyan-400/25 bg-cyan-500/[0.06] p-6 md:p-8">
          <div>
            <h2 className="font-montserrat font-black text-xl md:text-2xl mb-2">Сначала узнайте скорость чтения</h2>
            <p className="text-white/65 text-sm">Бесплатный тест за 2 минуты: скорость в словах в минуту, понимание текста и сравнение с ориентиром для класса.</p>
          </div>
          <Link to="/test-skorosti-chteniya" className="inline-flex items-center justify-center gap-2 bg-white text-[#1a1033] font-bold px-6 py-3.5 rounded-2xl hover:bg-white/90">
            <Icon name="Timer" size={18} /> Пройти тест
          </Link>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Частые вопросы</h2>
          <div className="space-y-3">
            {program.faq.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-bold text-white">
                  {f.q}
                  <Icon name="ChevronDown" size={18} className="text-white/50 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-white/65 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Финальный призыв */}
        <section className="grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Начните сегодня — первый урок откроется сразу</h2>
            <p className="text-white/60 text-sm mb-5">Марафон бесплатный. Программу составили методисты УЧИСЬПРО, на вопросы круглосуточно отвечает ИИ-наставник.</p>
            <Link to={`/${other.slug}`} className="inline-flex items-center gap-2 text-cyan-300 text-sm font-bold hover:text-cyan-200">
              <Icon name="ArrowRight" size={15} /> {other.track === "parent" ? "Вы родитель? Есть марафон для родителей" : "Вы педагог? Есть марафон для педагогов"}
            </Link>
          </div>
          <RegisterForm program={program} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
