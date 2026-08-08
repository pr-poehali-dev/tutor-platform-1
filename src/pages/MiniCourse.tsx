import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import LessonBlocks from "@/components/minicourse/LessonBlocks";
import {
  MINI_COURSES,
  getCourse,
  getLesson,
  loadDone,
  saveDone,
} from "@/components/minicourse/registry";

const SITE_URL = "https://учисьпро.рф";

/* ─────────────── Хаб: все мини-курсы ─────────────── */
function CoursesHub() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    MINI_COURSES.forEach((c) => {
      map[c.slug] = loadDone(c.slug).length;
    });
    setProgress(map);
  }, []);

  const totalLessons = MINI_COURSES.reduce((s, c) => s + c.lessons.length, 0);

  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Бесплатные мини-курсы УЧИСЬПРО",
        description:
          "Короткие бесплатные курсы для отработки навыка: каждый проходится за один вечер, без регистрации и оплаты.",
        itemListElement: MINI_COURSES.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.title,
          url: `${SITE_URL}/mini-course/${c.slug}`,
        })),
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Бесплатные мини-курсы — отработка навыка за один вечер | УЧИСЬПРО"
        description="5 бесплатных мини-курсов для взрослых: заработок на нейросетях, переговоры о зарплате, тексты, таблицы и выступления. Без регистрации и оплаты, каждый проходится за вечер."
        canonical={`${SITE_URL}/mini-course`}
        keywords="бесплатные курсы, мини-курсы, курсы для взрослых, навыки, обучение бесплатно, саморазвитие"
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">
              🎓
            </div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link to="/courses" className="text-white/60 hover:text-white text-sm font-bold transition-colors">
            Все курсы
          </Link>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 mb-5">
          <Icon name="Gift" size={13} />
          Бесплатно · без регистрации и карты
        </span>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
          Мини-курсы на один вечер
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-6">
          Каждый курс — это один навык, отработанный до результата. Пять уроков, готовые шаблоны
          и задание после каждого урока. Никакой теории, которую негде применить.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
            <Icon name="BookOpen" size={13} className="inline mr-1.5" />
            {MINI_COURSES.length} курсов
          </span>
          <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
            <Icon name="GraduationCap" size={13} className="inline mr-1.5" />
            {totalLessons} уроков
          </span>
          <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
            <Icon name="Sparkles" size={13} className="inline mr-1.5" />
            Шаблоны и промпты
          </span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="grid gap-5 md:grid-cols-2">
          {MINI_COURSES.map((c) => {
            const done = progress[c.slug] || 0;
            const pct = Math.round((done / c.lessons.length) * 100);
            return (
              <Link
                key={c.slug}
                to={`/mini-course/${c.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 hover:border-white/25 transition-all hover:-translate-y-1"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={c.cover}
                    alt={c.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <span
                    className={`absolute top-3 left-3 rounded-full bg-gradient-to-r ${c.gradient} px-3 py-1.5 text-xs font-black text-white shadow-lg`}
                  >
                    {c.benefit}
                  </span>
                  {done > 0 && (
                    <span className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur px-2.5 py-1.5 text-xs font-bold text-white">
                      {done === c.lessons.length ? "✓ пройден" : `${done}/${c.lessons.length}`}
                    </span>
                  )}
                </div>

                <div className="p-5 pt-3">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-3xl shrink-0">{c.emoji}</span>
                    <div className="min-w-0">
                      <h2 className="font-montserrat font-black text-lg text-white group-hover:text-primary transition-colors leading-snug">
                        {c.title}
                      </h2>
                      <p className="text-white/50 text-sm">{c.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-white/65 text-sm mb-4 line-clamp-2">{c.promise}</p>

                  {done > 0 && (
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                      <div
                        className={`h-full bg-gradient-to-r ${c.gradient} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-white/45">
                      <span>
                        <Icon name="Clock" size={12} className="inline mr-1" />
                        {c.minutes} мин
                      </span>
                      <span>
                        <Icon name="ListChecks" size={12} className="inline mr-1" />
                        {c.lessons.length} уроков
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-primary">
                      {done > 0 ? "Продолжить" : "Начать"}
                      <Icon name="ArrowRight" size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-6 md:p-8 text-center">
          <h2 className="font-montserrat font-black text-2xl text-white mb-3">
            Не знаете, с какого начать?
          </h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Пройдите профориентацию — сервис подберёт направление под вашу цель и составит план:
            какие навыки осваивать, в каком порядке и за какой срок.
          </p>
          <Link
            to="/career-pro"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition-transform"
          >
            <Icon name="Compass" size={17} />
            Подобрать направление
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ─────────────── Страница курса и урока ─────────────── */
export default function MiniCoursePage() {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const [done, setDone] = useState<string[]>([]);

  const course = courseSlug ? getCourse(courseSlug) : undefined;

  useEffect(() => {
    if (course) setDone(loadDone(course.slug));
  }, [course]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseSlug, lessonSlug]);

  if (!courseSlug) return <CoursesHub />;

  if (!course) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white/60 mb-4">Такого курса нет</p>
          <Link to="/mini-course" className="text-primary font-bold">
            Все мини-курсы
          </Link>
        </div>
      </div>
    );
  }

  const pct = Math.round((done.length / course.lessons.length) * 100);

  const toggleDone = (s: string) => {
    const next = done.includes(s) ? done.filter((x) => x !== s) : [...done, s];
    setDone(next);
    saveDone(course.slug, next);
  };

  /* ── Экран урока ── */
  if (lessonSlug) {
    const lesson = getLesson(course, lessonSlug);
    if (!lesson) {
      return (
        <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-white/60 mb-4">Такого урока нет</p>
            <Link to={`/mini-course/${course.slug}`} className="text-primary font-bold">
              К программе курса
            </Link>
          </div>
        </div>
      );
    }

    const idx = course.lessons.findIndex((l) => l.slug === lesson.slug);
    const prev = idx > 0 ? course.lessons[idx - 1] : null;
    const next = idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null;
    const isDone = done.includes(lesson.slug);

    return (
      <div className="min-h-screen bg-mesh font-golos text-white">
        <Seo
          title={`${lesson.title} — ${course.title} | УЧИСЬПРО`}
          description={lesson.subtitle}
          canonical={`${SITE_URL}/mini-course/${course.slug}/${lesson.slug}`}
        />

        <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link
              to={`/mini-course/${course.slug}`}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold min-w-0"
            >
              <Icon name="ArrowLeft" size={16} className="shrink-0" />
              <span className="truncate">{course.title}</span>
            </Link>
            <span className="text-white/40 text-xs shrink-0">
              {lesson.index} / {course.lessons.length}
            </span>
          </div>
          <div className="h-0.5 bg-white/5">
            <div
              className={`h-full bg-gradient-to-r ${course.gradient} transition-all duration-500`}
              style={{ width: `${(lesson.index / course.lessons.length) * 100}%` }}
            />
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-5xl mb-4">{lesson.emoji}</div>
          <h1 className="font-montserrat font-black text-2xl md:text-4xl mb-2">{lesson.title}</h1>
          <p className="text-white/60 mb-4">{lesson.subtitle}</p>

          <div className="flex flex-wrap items-center gap-3 mb-8 text-xs">
            <span className="rounded-lg bg-white/8 px-3 py-1.5 text-white/60">
              <Icon name="Clock" size={12} className="inline mr-1" />
              {lesson.minutes} мин
            </span>
            <span className="rounded-lg bg-cyan-500/15 border border-cyan-500/25 px-3 py-1.5 text-cyan-200">
              Цель: {lesson.goal}
            </span>
          </div>

          <LessonBlocks blocks={lesson.blocks} />

          <div className="mt-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Target" size={17} className="text-primary" />
              <span className="font-montserrat font-bold text-white">Задание</span>
            </div>
            <p className="text-white/80 mb-3">{lesson.task}</p>
            <p className="text-white/50 text-sm">
              <Icon name="Gift" size={13} className="inline mr-1 text-emerald-400" />
              Результат: {lesson.result}
            </p>

            <button
              onClick={() => toggleDone(lesson.slug)}
              className={`mt-4 w-full rounded-xl px-4 py-3 font-bold transition-all ${
                isDone
                  ? "bg-green-500/20 border border-green-500/40 text-green-300"
                  : `bg-gradient-to-r ${course.gradient} text-white hover:scale-[1.01]`
              }`}
            >
              {isDone ? (
                <>
                  <Icon name="CircleCheck" size={16} className="inline mr-1.5" />
                  Урок пройден
                </>
              ) : (
                "Отметить урок пройденным"
              )}
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/mini-course/${course.slug}/${prev.slug}`}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors"
              >
                <div className="text-white/40 text-xs mb-1">← Предыдущий</div>
                <div className="text-white text-sm font-bold">{prev.title}</div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                to={`/mini-course/${course.slug}/${next.slug}`}
                className="rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 p-4 text-right transition-colors"
              >
                <div className="text-primary/80 text-xs mb-1">Следующий →</div>
                <div className="text-white text-sm font-bold">{next.title}</div>
              </Link>
            ) : (
              <button
                onClick={() => navigate(`/mini-course/${course.slug}`)}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 p-4 text-right transition-colors"
              >
                <div className="text-emerald-300/80 text-xs mb-1">Финиш 🎉</div>
                <div className="text-white text-sm font-bold">Курс пройден — что дальше</div>
              </button>
            )}
          </div>
        </article>

        <SiteFooter />
      </div>
    );
  }

  /* ── Лендинг курса ── */
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

  const others = MINI_COURSES.filter((c) => c.slug !== course.slug).slice(0, 2);

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
