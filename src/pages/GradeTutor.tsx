import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import CourseCardCompact from "@/components/courses/CourseCardCompact";
import { COURSES } from "@/components/courses/coursesData";
import useReadyCourses from "@/hooks/useReadyCourses";
import { GRADE_LANDINGS, getGradeLanding } from "@/components/tutor/gradeLandingData";

const SITE_URL = "https://учисьпро.рф";

/**
 * Посадочная страница «ИИ-репетитор для N класса».
 *
 * Отвечает на конкретный поисковый запрос («ии репетитор 8 класс»),
 * по которому сайт уже показывался, но не имел отдельной страницы.
 */
export default function GradeTutor() {
  const { grade = "" } = useParams();
  const data = getGradeLanding(grade.replace(/\D/g, ""));
  const { readyIds } = useReadyCourses();

  const courses = useMemo(
    () =>
      data
        ? COURSES.filter((c) => c.grade === data.courseGrade && readyIds.has(c.id)).slice(0, 6)
        : [],
    [data, readyIds],
  );

  if (!data) return <Navigate to="/tutor" replace />;

  const canonical = `${SITE_URL}/repetitor/${data.grade}-klass`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: data.h1,
      description: data.description,
      url: canonical,
      areaServed: "RU",
      serviceType: "Онлайн-репетиторство с искусственным интеллектом",
      provider: {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: "УЧИСЬПРО",
        url: SITE_URL,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "RUB",
        description: "Первое занятие бесплатно, без привязки карты",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={data.title}
        description={data.description}
        canonical={canonical}
        keywords={data.keywords}
        jsonLd={jsonLd}
      />

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Репетитор", href: "/tutor" },
            { label: `${data.grade} класс` },
          ]}
        />
      </div>

      <section className="max-w-5xl mx-auto px-4 pt-6 pb-12">
        <span className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-400/30 rounded-full px-4 py-1.5 text-purple-200 text-xs font-bold uppercase tracking-wider">
          <Icon name="GraduationCap" size={14} />
          {data.grade} класс
        </span>

        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.08] mt-5">
          {data.h1}
        </h1>

        <p className="text-white/70 text-lg leading-relaxed mt-5 max-w-3xl">{data.intro}</p>

        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            to="/tutor"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 transition-opacity rounded-2xl px-6 py-3.5 font-bold text-white"
          >
            <Icon name="Play" size={18} />
            Первый урок бесплатно
          </Link>
          <Link
            to="/homework"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 transition-colors rounded-2xl px-6 py-3.5 font-bold text-white"
          >
            <Icon name="Camera" size={18} />
            Проверить домашку по фото
          </Link>
        </div>

        <p className="text-white/45 text-sm mt-4">
          Без привязки карты · Работает в браузере · Занятия круглосуточно
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-14">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">
          С чем поможем в {data.grade} классе
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.pains.map((p) => (
            <div key={p.title} className="bg-card border border-white/10 rounded-3xl p-5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center mb-3.5">
                <Icon name={p.icon} size={20} className="text-purple-300" />
              </div>
              <h3 className="font-bold text-white mb-1.5">{p.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-14">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5">
          Предметы {data.grade} класса
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {data.subjects.map((s) => (
            <span
              key={s}
              className="bg-white/8 border border-white/12 rounded-2xl px-4 py-2 text-white/85 text-sm font-semibold"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {courses.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">
            Курсы для {data.grade} класса
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <CourseCardCompact key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-4 pb-14">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Частые вопросы</h2>
        <div className="space-y-3">
          {data.faq.map((f) => (
            <details key={f.q} className="bg-card border border-white/10 rounded-2xl p-5 group">
              <summary className="font-bold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                {f.q}
                <Icon
                  name="ChevronDown"
                  size={18}
                  className="text-white/40 flex-shrink-0 mt-0.5 group-open:rotate-180 transition-transform"
                />
              </summary>
              <p className="text-white/65 text-sm leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="font-montserrat font-black text-xl mb-4">Репетитор по другим классам</h2>
        <div className="flex flex-wrap gap-2.5">
          {GRADE_LANDINGS.filter((g) => g.grade !== data.grade).map((g) => (
            <Link
              key={g.grade}
              to={`/repetitor/${g.grade}-klass`}
              className="bg-white/8 hover:bg-white/12 border border-white/12 transition-colors rounded-2xl px-4 py-2 text-white/85 text-sm font-semibold"
            >
              {g.grade} класс
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
