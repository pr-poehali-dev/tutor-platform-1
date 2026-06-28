import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SUPER_COURSES, SuperCourse, CourseLesson } from "./superCourses";

interface Props {
  startLesson: (course: SuperCourse, lesson: CourseLesson) => void;
}

export default function SuperCoursePicker({ startLesson }: Props) {
  const [activeCourse, setActiveCourse] = useState<string>(SUPER_COURSES[0].id);
  const course = SUPER_COURSES.find(c => c.id === activeCourse) || SUPER_COURSES[0];

  const totalLessons = course.modules.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <div id="super-courses" className="mt-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 rounded-full px-3.5 py-1 mb-3">
          <span className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider">Супер-курсы · с голосом</span>
        </div>
        <h3 className="font-montserrat font-black text-2xl md:text-3xl text-white">
          Программы уровня <span className="gradient-text-purple">репетитора</span>
        </h3>
        <p className="text-white/60 text-sm mt-2 max-w-xl mx-auto">
          Готовая программа уроков по физике, математике и информатике. Нажми на урок — наставник объяснит тему голосом, как живой репетитор.
        </p>
      </div>

      {/* Course tabs */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-8">
        {SUPER_COURSES.map(c => {
          const active = c.id === activeCourse;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCourse(c.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all font-bold text-sm"
              style={{
                background: active ? `${c.accent}22` : "rgba(255,255,255,0.04)",
                borderColor: active ? `${c.accent}66` : "rgba(255,255,255,0.08)",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              <span className="text-xl">{c.emoji}</span>
              {c.subject}
            </button>
          );
        })}
      </div>

      {/* Course card */}
      <div
        className="rounded-3xl border p-6 md:p-8"
        style={{
          background: `linear-gradient(160deg, ${course.accent}12, transparent)`,
          borderColor: `${course.accent}30`,
        }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-3xl">{course.emoji}</span>
          <div className="flex-1 min-w-[200px]">
            <h4 className="font-montserrat font-black text-xl text-white">{course.title}</h4>
            <p className="text-white/50 text-sm">{course.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/8 text-white/70">{course.level}</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/8 text-white/70">{course.modules.length} разделов</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/8 text-white/70">{totalLessons} уроков</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {course.modules.map(mod => (
            <div key={mod.id} className="bg-card/50 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{mod.emoji}</span>
                <span className="font-bold text-white text-sm">{mod.title}</span>
              </div>
              <div className="flex flex-col gap-2">
                {mod.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => startLesson(course, lesson)}
                    className="group flex items-center gap-3 text-left px-3 py-2.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 transition-all"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${course.accent}22` }}
                    >
                      <Icon name="Play" size={14} style={{ color: course.accent }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold leading-tight">{lesson.title}</p>
                      <p className="text-white/40 text-xs truncate">{lesson.goal}</p>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-white/30 group-hover:text-white/70 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}