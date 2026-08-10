import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import { MiniCourse } from "./types";
import { MINI_COURSES } from "./registry";

const SITE_URL = "https://учисьпро.рф";

/* ── Лендинг курса ── */
export default function CourseLanding({
  course,
  done,
  pct,
}: {
  course: MiniCourse;
  done: string[];
  pct: number;
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.promise,
      provider: { "@type": "Organization", name: "УЧИСЬПРО", sameAs: SITE_URL },
      isAccessibleForFree: true,
      inLanguage: "ru",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${course.minutes}M`,
      },
    },
  ];

  const others = MINI_COURSES.filter(
    (c) => c.slug !== course.slug && c.track === course.track,
  ).slice(0, 2);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`${course.title} — бесплатный мини-курс | УЧИСЬПРО`}
        description={course.promise}
        canonical={`${SITE_URL}/mini-course/${course.slug}`}
        keywords={course.seoKeywords}
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/mini-course" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold">
            <Icon name="ArrowLeft" size={16} />
            Все мини-курсы
          </Link>
          <Link to="/courses" className="text-white/60 hover:text-white text-sm font-bold transition-colors">
            Каталог
          </Link>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 pt-10 pb-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 mb-4">
              <Icon name="Gift" size={13} />
              Бесплатно · без карты и регистрации
            </span>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-3">
              {course.title}
            </h1>
            <p className="text-white/60 text-lg mb-4">{course.subtitle}</p>
            <p className="text-white/70 mb-6">{course.promise}</p>

            <div className="flex flex-wrap gap-3 mb-6 text-sm">
              <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
                <Icon name="Clock" size={13} className="inline mr-1.5" />
                {course.minutes} минут
              </span>
              <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
                <Icon name="BookOpen" size={13} className="inline mr-1.5" />
                {course.lessons.length} уроков
              </span>
            </div>

            <Link
              to={`/mini-course/${course.slug}/${course.lessons[0].slug}`}
              className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${course.gradient} px-7 py-4 font-black text-white text-lg shadow-xl hover:scale-[1.02] transition-transform`}
            >
              {done.length > 0 ? "Продолжить курс" : "Начать бесплатно"}
              <Icon name="ArrowRight" size={18} />
            </Link>
          </div>

          <div>
            <img
              src={course.cover}
              alt={course.title}
              className="rounded-3xl w-full object-cover shadow-2xl"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {done.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-bold">Ваш прогресс</span>
              <span className="text-white/50 text-sm">
                {done.length} из {course.lessons.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${course.gradient} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-4 pb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-montserrat font-bold text-white mb-3">Кому подойдёт</h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {course.forWhom.map((t, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-white/75">
                <Icon name="Check" size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="font-montserrat font-black text-2xl text-white mb-5">Программа курса</h2>
        <div className="space-y-3">
          {course.lessons.map((l) => {
            const isDone = done.includes(l.slug);
            return (
              <Link
                key={l.slug}
                to={`/mini-course/${course.slug}/${l.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 p-4 transition-all group"
              >
                <div className="text-3xl shrink-0">{l.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white/40 text-xs font-bold">Урок {l.index}</span>
                    {isDone && (
                      <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-bold text-green-300">
                        пройден
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-white group-hover:text-primary transition-colors truncate">
                    {l.title}
                  </div>
                  <div className="text-white/50 text-sm truncate">{l.subtitle}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-white/40 text-xs mb-1">{l.minutes} мин</div>
                  <Icon
                    name={isDone ? "CircleCheck" : "ChevronRight"}
                    size={18}
                    className={isDone ? "text-green-400" : "text-white/30"}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Trophy" size={17} className="text-emerald-400" />
            <h2 className="font-montserrat font-bold text-white">Что будет в конце</h2>
          </div>
          <p className="text-white/75">{course.outcome}</p>
        </div>
      </section>

      {course.slug === "business-2026" && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/12 to-orange-500/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="text-5xl shrink-0">🏗️</div>
              <div className="flex-1 min-w-0">
                <h2 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
                  Проверьте свою идею на цифрах
                </h2>
                <p className="text-white/70 text-sm md:text-base">
                  Тренажёр посчитает юнит-экономику, точку безубыточности и запас прочности вашего
                  бизнеса, проведёт стресс-тест и покажет, выдержит ли модель кредит. Плюс разбор от
                  ИИ-совета директоров. Бесплатно.
                </p>
              </div>
              <Link
                to="/bizlab"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 font-bold text-white shadow-lg hover:scale-[1.02] transition-transform whitespace-nowrap"
              >
                <Icon name="Gauge" size={17} />
                Открыть тренажёр
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="font-montserrat font-black text-xl text-white mb-4">Другие мини-курсы</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {others.map((c) => (
            <Link
              key={c.slug}
              to={`/mini-course/${c.slug}`}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors group"
            >
              <span className="text-3xl shrink-0">{c.emoji}</span>
              <div className="min-w-0">
                <div className="font-bold text-white group-hover:text-primary transition-colors truncate">
                  {c.title}
                </div>
                <div className="text-white/50 text-sm truncate">{c.benefit}</div>
              </div>
              <Icon name="ArrowRight" size={16} className="ml-auto shrink-0 text-white/30" />
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
