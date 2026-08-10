import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CoursesHub from "@/components/minicourse/CoursesHub";
import LessonView from "@/components/minicourse/LessonView";
import CourseLanding from "@/components/minicourse/CourseLanding";
import { getCourse, loadDone, saveDone } from "@/components/minicourse/registry";

/* ─────────────── Страница курса и урока ─────────────── */
export default function MiniCoursePage() {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>();
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
    return (
      <LessonView
        course={course}
        lessonSlug={lessonSlug}
        done={done}
        onToggleDone={toggleDone}
      />
    );
  }

  /* ── Лендинг курса ── */
  return <CourseLanding course={course} done={done} pct={pct} />;
}
