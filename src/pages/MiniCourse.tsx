import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import LessonBlocks from "@/components/minicourse/LessonBlocks";
import { LESSONS, MINI_COURSE, getLesson } from "@/components/minicourse/lessons";

const SITE_URL = "https://учисьпро.рф";
const COVER =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/cd76d428-a4f3-4b3a-be68-2ce54ba0755f.jpg";
const DONE_KEY = "minicourse_ai_money_done_v1";

function loadDone(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDone(list: string[]) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(list));
  } catch {
    /* приватный режим — прогресс просто не сохранится */
  }
}

export default function MiniCourse() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDone(loadDone());
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const lesson = slug ? getLesson(slug) : undefined;
  const pct = Math.round((done.length / LESSONS.length) * 100);

  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: MINI_COURSE.title,
        description: MINI_COURSE.promise,
        provider: { "@type": "Organization", name: "УЧИСЬПРО", sameAs: SITE_URL },
        isAccessibleForFree: true,
        inLanguage: "ru",
        offers: { "@type": "Offer", price: "0", priceCurrency: "RUB", availability: "https://schema.org/InStock" },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `PT${MINI_COURSE.minutes}M`,
        },
      },
    ],
    [],
  );

  const toggleDone = (s: string) => {
    const next = done.includes(s) ? done.filter((x) => x !== s) : [...done, s];
    setDone(next);
    saveDone(next);
  };

  // ─────────── Экран урока ───────────
  if (slug) {
    if (!lesson) {
      return (
        <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-white/60 mb-4">Такого урока нет</p>
            <Link to="/mini-course" className="text-primary font-bold">
              Вернуться к курсу
            </Link>
          </div>
        </div>
      );
    }

    const idx = LESSONS.findIndex((l) => l.slug === lesson.slug);
    const prev = idx > 0 ? LESSONS[idx - 1] : null;
    const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;
    const isDone = done.includes(lesson.slug);

    return (
      <div className="min-h-screen bg-mesh font-golos text-white">
        <Seo
          title={`${lesson.title} — ${MINI_COURSE.title} | УЧИСЬПРО`}
          description={lesson.subtitle}
          canonical={`${SITE_URL}/mini-course/${lesson.slug}`}
        />

        <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link to="/mini-course" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold">
              <Icon name="ArrowLeft" size={16} />
              К программе
            </Link>
            <span className="text-white/40 text-xs">
              Урок {lesson.index} из {LESSONS.length}
            </span>
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

          {/* Задание */}
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
                  : "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-[1.01]"
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

          {/* Навигация */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/mini-course/${prev.slug}`}
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
                to={`/mini-course/${next.slug}`}
                className="rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 p-4 text-right transition-colors"
              >
                <div className="text-primary/80 text-xs mb-1">Следующий →</div>
                <div className="text-white text-sm font-bold">{next.title}</div>
              </Link>
            ) : (
              <button
                onClick={() => navigate("/mini-course")}
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

  // ─────────── Лендинг курса ───────────
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`${MINI_COURSE.title} — бесплатный мини-курс | УЧИСЬПРО`}
        description={MINI_COURSE.promise}
        canonical={`${SITE_URL}/mini-course`}
        keywords="заработок на нейросетях, курс бесплатно, дополнительный доход, нейросети для заработка, подработка, фриланс с нуля"
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">
              🚀
            </div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/courses"
            className="text-white/60 hover:text-white text-sm font-bold transition-colors"
          >
            Все курсы
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 mb-4">
              <Icon name="Gift" size={13} />
              Бесплатно · без карты и регистрации
            </span>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
              {MINI_COURSE.title}
            </h1>
            <p className="text-white/70 text-lg mb-6">{MINI_COURSE.promise}</p>

            <div className="flex flex-wrap gap-3 mb-6 text-sm">
              <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
                <Icon name="Clock" size={13} className="inline mr-1.5" />
                {MINI_COURSE.minutes} минут
              </span>
              <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
                <Icon name="BookOpen" size={13} className="inline mr-1.5" />
                {LESSONS.length} уроков
              </span>
              <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
                <Icon name="Sparkles" size={13} className="inline mr-1.5" />
                Готовые промпты
              </span>
            </div>

            <Link
              to={`/mini-course/${LESSONS[0].slug}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 px-7 py-4 font-black text-white text-lg shadow-xl shadow-purple-500/25 hover:scale-[1.02] transition-transform"
            >
              {done.length > 0 ? "Продолжить курс" : "Начать бесплатно"}
              <Icon name="ArrowRight" size={18} />
            </Link>
          </div>

          <div className="relative">
            <img
              src={COVER}
              alt="Человек учится зарабатывать на нейросетях дома"
              className="rounded-3xl w-full object-cover shadow-2xl"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Прогресс */}
      {done.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-bold">Ваш прогресс</span>
              <span className="text-white/50 text-sm">
                {done.length} из {LESSONS.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Для кого */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-montserrat font-bold text-white mb-3">Кому подойдёт</h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              "Хотите дополнительный доход к основной работе",
              "Начинаете с нуля — опыт и техническое образование не нужны",
              "Нет денег на платные подписки и оборудование",
              "Устали от теории и хотите конкретные шаги",
            ].map((t, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-white/75">
                <Icon name="Check" size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Программа */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="font-montserrat font-black text-2xl text-white mb-5">Программа курса</h2>
        <div className="space-y-3">
          {LESSONS.map((l) => {
            const isDone = done.includes(l.slug);
            return (
              <Link
                key={l.slug}
                to={`/mini-course/${l.slug}`}
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

      {/* Что дальше */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-6 md:p-8 text-center">
          <h2 className="font-montserrat font-black text-2xl text-white mb-3">
            Прошли курс и хотите дальше?
          </h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Мини-курс даёт первую услугу и первого клиента. Дальше — личный план под вашу цель:
            какие навыки осваивать, в каком порядке и за какой срок выйти на нужный доход.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/career-pro"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition-transform"
            >
              <Icon name="Compass" size={17} />
              Составить личный план
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 px-6 py-3.5 font-bold text-white transition-colors"
            >
              Посмотреть курсы
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
