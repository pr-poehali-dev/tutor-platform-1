import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { GRADES, getCoursePrice, getCoursePriceLabel } from "@/components/courses/coursesData";
import { findCourseBySlug, courseUrl } from "@/components/courses/courseSlug";
import { getCourseDetail } from "@/components/courses/courseDetailsData";
import { getCourseFaq, getWhatsIncluded } from "@/components/courses/courseValueData";
import { SUBJECTS_SEO } from "@/components/courses/subjectsSeo";

const SITE = "https://учисьпро.рф";

/** Публичная витрина курса: единственная индексируемая страница программы.
 *  Раньше курс открывался сразу в оплате, закрытой в robots.txt, — поиск
 *  не видел ни одной из 88 программ. */
export default function CoursePublic() {
  const { slug } = useParams();
  const course = useMemo(() => (slug ? findCourseBySlug(slug) : undefined), [slug]);

  if (!course) return <Navigate to="/courses" replace />;

  // Адрес нормализуем: если заголовок изменился, старая ссылка ведёт на новую.
  const canonicalPath = courseUrl(course);
  if (slug && `/kurs/${slug}` !== canonicalPath) {
    return <Navigate to={canonicalPath} replace />;
  }

  const detail = getCourseDetail(course);
  const faq = getCourseFaq(course);
  const included = getWhatsIncluded(course);
  const price = getCoursePrice(course);
  const gradeLabel = GRADES.find((g) => g.id === course.grade)?.label ?? course.grade;
  const subjectSeo = SUBJECTS_SEO.find((s) => s.subjectId === course.subject);
  const isAdult = course.grade === "adult";
  const totalLessons = detail.modules.reduce((n, m) => n + m.lessons.length, 0) || course.lessons;

  const audience = isAdult ? "взрослых" : gradeLabel;
  const title = `${course.title.split(":")[0].trim()} — онлайн-курс`;
  const description = `${course.description.slice(0, 150).trim()}`.replace(/\s+\S*$/, "") + "…";

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.description,
      url: `${SITE}${canonicalPath}`,
      inLanguage: "ru-RU",
      provider: {
        "@type": "Organization",
        name: "УЧИСЬПРО",
        url: SITE,
      },
      educationalLevel: gradeLabel,
      teaches: course.tags,
      numberOfCredits: totalLessons,
      timeRequired: `PT${totalLessons * 30}M`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: course.rating,
        reviewCount: course.reviews,
        bestRating: 5,
        worstRating: 1,
      },
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        category: price === 0 ? "Free" : "Paid",
        url: `${SITE}${canonicalPath}`,
        priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${totalLessons * 30}M`,
        instructor: { "@type": "Person", name: course.tutor },
      },
    },
  ];

  if (faq.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Курсы", href: "/courses" },
    ...(isAdult
      ? [{ label: "Взрослым", href: "/kursy-dlya-vzroslyh" }]
      : subjectSeo
        ? [{ label: subjectSeo.name, href: `/courses/${subjectSeo.slug}` }]
        : []),
    { label: course.title },
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title={title}
        description={description}
        canonical={`${SITE}${canonicalPath}`}
        type="product"
        keywords={[course.title, ...course.tags, `курс ${audience}`, "онлайн-обучение"].join(", ")}
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5 bg-background/30">
        <div className="max-w-5xl mx-auto px-5 py-2.5">
          <Breadcrumbs items={crumbs} />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-8 md:py-12">
        <div className={`h-1.5 rounded-full bg-gradient-to-r ${course.color} mb-6`} aria-hidden="true" />

        <div className="flex items-start gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-4xl flex-shrink-0`} aria-hidden="true">
            {course.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-white/45 text-xs uppercase tracking-widest mb-1">
              {gradeLabel} · {course.format === "online" ? "Онлайн" : course.format}
            </p>
            <h1 className="font-montserrat font-black text-2xl md:text-4xl leading-tight">{course.title}</h1>
          </div>
        </div>

        <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6 max-w-3xl">{course.description}</p>

        <div className="flex flex-wrap items-center gap-3 mb-8 text-sm">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Icon name="Star" size={15} aria-hidden="true" />
            {course.rating} · {course.reviews} отзывов
          </span>
          <span className="text-white/50">{course.students.toLocaleString("ru-RU")} учеников</span>
          <span className="text-white/50">{totalLessons} уроков</span>
        </div>

        {/* Оплата — отдельным шагом, чтобы витрина оставалась открытой поиску */}
        <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 mb-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-3xl font-montserrat font-black">{getCoursePriceLabel(course)}</p>
            <p className="text-white/50 text-sm mt-0.5">
              {price === 0 ? "Доступ открыт всем" : "Разовая оплата · доступ навсегда"}
            </p>
          </div>
          <Link
            to={`/course-checkout/${course.id}`}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-7 py-3.5 rounded-2xl text-center hover:opacity-90 transition-opacity"
          >
            {price === 0 ? "Начать бесплатно" : "Получить доступ"}
          </Link>
        </div>

        {detail.outcomes.length > 0 && (
          <section className="mb-10" aria-labelledby="outcomes">
            <h2 id="outcomes" className="font-montserrat font-black text-xl md:text-2xl mb-4">Чему вы научитесь</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {detail.outcomes.map((o, i) => (
                <li key={i} className="flex items-start gap-2.5 text-white/75 text-sm">
                  <Icon name="Check" size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </section>
        )}

        {detail.forWhom.length > 0 && (
          <section className="mb-10" aria-labelledby="forwhom">
            <h2 id="forwhom" className="font-montserrat font-black text-xl md:text-2xl mb-4">Кому подойдёт</h2>
            <ul className="flex flex-wrap gap-2">
              {detail.forWhom.map((f, i) => (
                <li key={i} className="text-sm text-white/70 bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2">
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {detail.modules.length > 0 && (
          <section className="mb-10" aria-labelledby="program">
            <h2 id="program" className="font-montserrat font-black text-xl md:text-2xl mb-4">
              Программа курса — {totalLessons} уроков
            </h2>
            <div className="space-y-3">
              {detail.modules.map((m) => (
                <article key={m.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-bold text-white mb-2.5">{m.title}</h3>
                  <ul className="space-y-1.5">
                    {m.lessons.map((l) => (
                      <li key={l.num} className="text-sm text-white/60 flex items-start gap-2">
                        <span className="text-white/30 tabular-nums flex-shrink-0">{l.num}.</span>
                        {l.title}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {included.length > 0 && (
          <section className="mb-10" aria-labelledby="included">
            <h2 id="included" className="font-montserrat font-black text-xl md:text-2xl mb-4">Что входит в курс</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {included.map((v, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
                    <Icon name={v.icon} size={16} className="text-purple-300" aria-hidden="true" />
                    {v.title}
                  </p>
                  <p className="text-white/55 text-sm leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {faq.length > 0 && (
          <section className="mb-10" aria-labelledby="faq">
            <h2 id="faq" className="font-montserrat font-black text-xl md:text-2xl mb-4">Частые вопросы</h2>
            <div className="space-y-3">
              {faq.map((f, i) => (
                <details key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 group">
                  <summary className="font-semibold text-white text-sm cursor-pointer list-none flex items-center justify-between gap-3">
                    {f.q}
                    <Icon name="ChevronDown" size={16} className="text-white/40 group-open:rotate-180 transition-transform flex-shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="text-white/60 text-sm mt-2.5 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-purple-500/12 to-cyan-500/12 p-7 text-center">
          <p className="font-montserrat font-black text-xl mb-2">Начать обучение</p>
          <p className="text-white/60 text-sm mb-5">{getCoursePriceLabel(course)} · доступ навсегда</p>
          <Link
            to={`/course-checkout/${course.id}`}
            className="inline-block bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
          >
            {price === 0 ? "Открыть курс" : "Получить доступ"}
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
