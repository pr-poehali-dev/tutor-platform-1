import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import LessonBlocks from "./LessonBlocks";
import LessonLockedBlock from "./LessonLockedBlock";
import { MiniCourse } from "./types";
import { getLesson } from "./registry";
import { useAuth } from "@/context/AuthContext";
import { FREE_LESSONS_BEFORE_SIGNUP } from "@/components/paywall/limits";
import { OPEN_COURSE_SLUGS } from "./registry";

const SITE_URL = "https://учисьпро.рф";

/* ── Экран урока ── */
export default function LessonView({
  course,
  lessonSlug,
  done,
  onToggleDone,
}: {
  course: MiniCourse;
  lessonSlug: string;
  done: string[];
  onToggleDone: (s: string) => void;
}) {
  const navigate = useNavigate();
  const lesson = getLesson(course, lessonSlug);
  const { isAuthenticated } = useAuth();

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
  // Первый урок открыт всем — дальше просим бесплатную регистрацию.
  // Курсы из OPEN_COURSE_SLUGS открыты целиком и без регистрации:
  // это общественно полезный материал, который должен быть доступен всем.
  const fullyOpen = OPEN_COURSE_SLUGS.includes(course.slug);
  const locked =
    !fullyOpen && !isAuthenticated && lesson.index > FREE_LESSONS_BEFORE_SIGNUP;

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

        {locked ? (
          <LessonLockedBlock course={course} />
        ) : (
          <LessonBlocks blocks={lesson.blocks} />
        )}

        {!locked && (
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
            onClick={() => onToggleDone(lesson.slug)}
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
        )}

        {!locked && (
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
        )}
      </article>

      <SiteFooter />
    </div>
  );
}