import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import { MyCourse } from "@/hooks/useUserData";

interface Props {
  myCourses: MyCourse[];
  coursesById: Record<number, Course>;
  compact?: boolean;
}

export default function MyCoursesRow({ myCourses, coursesById, compact }: Props) {
  if (myCourses.length === 0) {
    return (
      <div className="bg-card/50 border border-white/10 rounded-2xl p-8 text-center">
        <Icon name="GraduationCap" size={32} className="text-white/35 mx-auto mb-3" />
        <p className="text-white/75 font-bold mb-1">Пока нет начатых курсов</p>
        <p className="text-white/45 text-sm">Выбери курс из каталога и нажми «Начать»</p>
      </div>
    );
  }

  const continueOne = (subject: string, grade: string, courseId: number) => {
    try {
      localStorage.setItem("journey_preselect", JSON.stringify({ subject, grade, course_id: courseId }));
    } catch { /* empty */ }
    document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" });
  };

  const list = compact ? myCourses.slice(0, 3) : myCourses;

  return (
    <div className="bg-card/50 border border-white/10 rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-montserrat font-black text-white flex items-center gap-2">
          <Icon name="Play" size={16} className="text-green-400" />
          Продолжить обучение
        </h3>
        {compact && myCourses.length > 3 && (
          <span className="text-white/45 text-xs">+{myCourses.length - 3}</span>
        )}
      </div>
      <div className="space-y-2">
        {list.map((mc) => {
          const c = coursesById[mc.course_id];
          if (!c) return null;
          return (
            <button
              key={mc.course_id}
              onClick={() => continueOne(mc.subject, mc.grade, mc.course_id)}
              className="w-full text-left bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 rounded-xl p-3 flex items-center gap-3 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-xl flex-shrink-0`}>
                {c.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">{c.title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 transition-all"
                      style={{ width: `${mc.progress}%` }}
                    />
                  </div>
                  <span className="text-white/65 text-[11px] tabular-nums font-bold">{mc.progress}%</span>
                </div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
