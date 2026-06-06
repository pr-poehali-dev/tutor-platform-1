import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";

interface Props {
  course: Course;
  fmt: { label: string; color: string };
  gradeLabel: string;
}

export default function CourseDetailHeader({ course, fmt, gradeLabel }: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-5 mb-6">
      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-4xl md:text-5xl flex-shrink-0`}>
        {course.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {course.isHit && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/20">🔥 Хит</span>}
          {course.isNew && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/20">✨ Новый</span>}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${fmt.color}`}>{fmt.label}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/8 text-white/60 border border-white/10">{gradeLabel}</span>
        </div>
        <h2 className="font-montserrat font-black text-xl md:text-3xl text-white mb-2 leading-snug">{course.title}</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/55">
          <span className="flex items-center gap-1"><span className="text-yellow-400">⭐</span> {course.rating} · {course.reviews.toLocaleString("ru-RU")} оценок</span>
          <span>•</span>
          <span>{course.students.toLocaleString("ru-RU")} учеников</span>
          <span>•</span>
          <span>{course.lessons} уроков по {course.duration}</span>
        </div>
      </div>
    </div>
  );
}
