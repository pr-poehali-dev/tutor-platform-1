import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import CourseCardCompact from "@/components/courses/CourseCardCompact";
import { COURSES } from "@/components/courses/coursesData";
import { SUBJECTS_SEO, getSubjectSeo } from "@/components/courses/subjectsSeo";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function SubjectLanding() {
  const { subject = "" } = useParams();
  const seo = getSubjectSeo(subject);

  const courses = useMemo(
    () => (seo ? COURSES.filter((c) => c.subject === seo.subjectId) : []),
    [seo],
  );

  if (!seo) return <Navigate to="/courses" replace />;

  const canonical = `${SITE_URL}/courses/${seo.slug}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Каталог курсов", item: `${SITE_URL}/courses` },
        { "@type": "ListItem", position: 3, name: seo.name, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Курсы по ${seo.nameGenitive}`,
      itemListElement: courses.map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: c.title,
        url: `${SITE_URL}/course-checkout/${c.id}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={seo.title}
        description={seo.description}
        canonical={canonical}
        keywords={seo.keywords}
        image={seo.ogImage}
        jsonLd={jsonLd}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 137.5) % 100) + "%",
              top: ((i * 97.3) % 100) + "%",
              opacity: 0.12 + (i % 4) * 0.08,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs
              items={[
                { label: "Главная", href: "/" },
                { label: "Каталог курсов", href: "/courses" },
                { label: seo.name },
              ]}
            />
          </div>
          <Link
            to="/pricing"
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="Sparkles" size={14} />
            Тарифы
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-8">
        <Link to="/courses" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          Все курсы
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${seo.color} rounded-full px-4 py-1.5 mb-5 shadow-lg`}>
              <span className="text-xl">{seo.emoji}</span>
              <span className="text-sm text-white font-bold uppercase tracking-wider">{seo.name}</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-5 leading-[1.05]">
              {seo.h1}
            </h1>
            <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mb-6">{seo.intro}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity glow-purple"
              >
                <Icon name="Rocket" size={14} />
                Начать бесплатно
              </Link>
              <a
                href="#courses-list"
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors"
              >
                <Icon name="Library" size={14} />
                {courses.length} {courses.length === 1 ? "курс" : courses.length >= 2 && courses.length <= 4 ? "курса" : "курсов"}
              </a>
            </div>
          </div>

          {/* Космическая обложка предмета */}
          <div className="relative aspect-square max-w-md mx-auto md:mx-0 md:ml-auto w-full">
            <div className={`absolute -inset-4 bg-gradient-to-br ${seo.color} opacity-30 blur-3xl rounded-full`} />
            <div className="relative rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl group">
              <img
                src={seo.ogImage}
                alt={`${seo.name} — космическая обложка курса УЧИСЬПРО`}
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${seo.color} flex items-center justify-center text-2xl shadow-xl`}>
                  {seo.emoji}
                </div>
                <div className="bg-background/60 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-white/55 font-bold">УЧИСЬПРО</p>
                  <p className="text-sm text-white font-black -mt-0.5">{seo.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-4">
          {seo.highlights.map((h) => (
            <div key={h.title} className="bg-card border border-white/10 rounded-2xl p-5">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${seo.color} flex items-center justify-center mb-3`}>
                <Icon name={h.icon} size={20} className="text-white" />
              </div>
              <h3 className="font-montserrat font-black text-white text-lg mb-1.5">{h.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-3">Что в программе</p>
            <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-5">Темы по {seo.nameGenitive}</h2>
            <ul className="space-y-2.5">
              {seo.topics.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-white/75 text-sm leading-relaxed">
                  <Icon name="Check" size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-3">Кому подойдёт</p>
            <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-5">Для кого этот курс</h2>
            <ul className="space-y-3">
              {seo.forWhom.map((w) => (
                <li key={w} className="flex items-start gap-3 bg-white/[0.03] border border-white/8 rounded-2xl p-3.5">
                  <Icon name="UserCheck" size={18} className="text-purple-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white/75 text-sm leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Courses list */}
      <section id="courses-list" className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2">Каталог</p>
            <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">
              Курсы по <span className="gradient-text-purple">{seo.nameGenitive}</span>
            </h2>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl transition-colors"
          >
            Все предметы
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-5xl mb-3">📚</div>
            <h3 className="font-montserrat font-black text-lg text-white mb-2">Скоро здесь будут курсы</h3>
            <p className="text-white/55 text-sm">Мы готовим программы по {seo.nameGenitive}. Загляни через пару дней или подпишись на тарифы — получишь доступ сразу при запуске.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {courses.map((c) => (
              <CourseCardCompact key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">FAQ</p>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-8">Частые вопросы</h2>
        <div className="space-y-3">
          {seo.faq.map((f, i) => (
            <details key={i} className="group bg-card border border-white/10 rounded-2xl overflow-hidden">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-5 hover:bg-white/[0.03] transition-colors">
                <span className="font-montserrat font-bold text-white text-sm md:text-base">{f.q}</span>
                <Icon name="Plus" size={18} className="text-white/55 flex-shrink-0 group-open:rotate-45 transition-transform" />
              </summary>
              <div className="px-5 pb-5 text-white/65 text-sm leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related subjects */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-10">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2">Другие предметы</p>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-6">Курсы по другим предметам</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SUBJECTS_SEO.filter((s) => s.slug !== seo.slug).map((s) => (
            <Link
              key={s.slug}
              to={`/courses/${s.slug}`}
              className="group relative bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:translate-y-[-2px] transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={s.ogImage}
                  alt={`${s.name} — курсы УЧИСЬПРО`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className={`absolute top-2 right-2 w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg shadow-lg`}>
                  {s.emoji}
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="font-montserrat font-black text-white text-sm leading-tight drop-shadow-lg">{s.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-12">
        <div className={`rounded-3xl bg-gradient-to-br ${seo.color} p-8 md:p-12 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="text-6xl mb-4">{seo.emoji}</div>
            <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3 leading-tight">
              Готов разобраться в {seo.nameGenitive}?
            </h2>
            <p className="text-white/85 text-base md:text-lg mb-6 max-w-xl mx-auto">
              Начни с бесплатной диагностики. За 10 минут поймёшь свой уровень и получишь персональный план обучения.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm md:text-base font-black px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl"
            >
              <Icon name="Rocket" size={16} />
              Начать бесплатно
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}