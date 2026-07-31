import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  Course,
  GRADES,
  SUBJECTS,
  getCoursePrice,
} from "@/components/courses/coursesData";
import { getCourseDetail, ModuleLesson } from "@/components/courses/courseDetailsData";

interface Props {
  course: Course;
  /** Сколько первых уроков открыть бесплатно. */
  freeLessons?: number;
}

export default function FreeVersionCard({ course, freeLessons = 2 }: Props) {
  const price = getCoursePrice(course);
  const gradeLabel = GRADES.find((g) => g.id === course.grade)?.label || course.grade;
  const subjectLabel = SUBJECTS.find((s) => s.id === course.subject)?.label || course.subject;

  // Собираем все уроки курса подряд (по модулям) и берём первые как «превью».
  const detail = getCourseDetail(course);
  const allLessons: ModuleLesson[] = detail.modules.flatMap((m) => m.lessons);
  const preview = allLessons.slice(0, freeLessons + 2); // покажем открытые + пару под замком
  const lockedTotal = Math.max(0, course.lessons - freeLessons);

  return (
    <div className="group relative flex flex-col bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-emerald-400/30 hover:translate-y-[-2px] transition-all">
      <div className={`h-1.5 bg-gradient-to-r ${course.color}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Бейдж бесплатной версии */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap min-h-[22px]">
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
            <Icon name="Gift" size={10} /> Бесплатный старт
          </span>
          <span className="inline-flex items-center gap-1 bg-white/8 border border-white/15 text-white/60 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {freeLessons} урока открыто
          </span>
        </div>

        {/* Шапка */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-3xl flex-shrink-0`}>
            {course.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-white/45 text-[11px] uppercase tracking-wider font-semibold mb-1">{subjectLabel}</p>
            <h3 className="font-montserrat font-black text-white text-base leading-snug line-clamp-2">{course.title}</h3>
          </div>
        </div>

        <p className="text-white/55 text-xs leading-relaxed line-clamp-2 mb-3">{course.description}</p>

        <div className="flex items-center gap-3 text-white/55 text-xs mb-4">
          <span className="flex items-center gap-1"><Icon name="GraduationCap" size={12} /> {gradeLabel}</span>
          <span className="flex items-center gap-1"><Icon name="BookOpen" size={12} /> {course.lessons} ур.</span>
          <span className="flex items-center gap-1"><Icon name="Star" size={12} className="text-amber-400" /> {course.rating.toFixed(2)}</span>
        </div>

        {/* Список уроков: открытые + под замком */}
        <div className="rounded-2xl bg-black/20 border border-white/8 p-3 mb-4 space-y-1.5">
          {preview.map((l, i) => {
            const isFree = i < freeLessons;
            return (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isFree ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/30"
                  }`}
                >
                  <Icon name={isFree ? "Play" : "Lock"} size={12} />
                </div>
                <span className={`text-xs leading-tight truncate ${isFree ? "text-white/80" : "text-white/35"}`}>
                  {l.title}
                </span>
                {isFree && (
                  <span className="ml-auto text-[10px] font-bold text-emerald-300 flex-shrink-0">беспл.</span>
                )}
              </div>
            );
          })}
          {lockedTotal > freeLessons && (
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-6 h-6 rounded-lg bg-white/5 text-white/30 flex items-center justify-center flex-shrink-0">
                <Icon name="Lock" size={12} />
              </div>
              <span className="text-xs text-white/35">
                и ещё {lockedTotal - freeLessons} уроков в полной версии
              </span>
            </div>
          )}
        </div>

        {/* Действия */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            to={`/course-checkout/${course.id}`}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold px-4 py-3 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="Play" size={15} /> Пройти бесплатно
          </Link>
          <Link
            to={`/course-checkout/${course.id}`}
            className="inline-flex items-center justify-center gap-1.5 text-white/55 hover:text-white text-xs font-semibold transition-colors"
          >
            Полный курс — {price.toLocaleString("ru-RU")} ₽
            <Icon name="ArrowRight" size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
