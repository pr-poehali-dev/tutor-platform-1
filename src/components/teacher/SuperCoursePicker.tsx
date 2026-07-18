import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SUPER_COURSES, SuperCourse, CourseLesson, isLessonFree, moduleMatchesGrade, GRADE_ORDER, GradeLevel } from "./superCourses";
import DiagnosticModal from "./DiagnosticModal";

interface ProgressApi {
  isDone: (lessonId: string) => boolean;
  countDone: (lessonIds: string[]) => number;
}

interface Props {
  startLesson: (course: SuperCourse, lesson: CourseLesson) => void;
  progress: ProgressApi;
  /** Куплен ли конкретный супер-курс (по его courseId). */
  hasCourseAccess?: (courseId: number) => boolean;
  /** Купить конкретный супер-курс. */
  onBuy?: (course: SuperCourse) => void;
  /** Класс ученика — для индивидуальной программы по уровню. */
  grade?: string;
  setGrade?: (g: string) => void;
}

const GRADE_LABEL: Record<GradeLevel, string> = {
  "7": "7 класс", "8": "8 класс", "9": "9 класс",
  "10": "10 класс", "11": "11 класс", "ege": "ЕГЭ",
};

export default function SuperCoursePicker({ startLesson, progress, hasCourseAccess, onBuy, grade = "", setGrade }: Props) {
  const [activeCourse, setActiveCourse] = useState<string>(SUPER_COURSES[0].id);
  const [diagOpen, setDiagOpen] = useState(false);
  const course = SUPER_COURSES.find(c => c.id === activeCourse) || SUPER_COURSES[0];

  const hasAccess = hasCourseAccess ? hasCourseAccess(course.courseId) : false;

  // Индивидуальная программа: если класс выбран — показываем разделы своего уровня и ниже.
  const visibleModules = course.modules.filter(m => moduleMatchesGrade(m.grade, grade));

  const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
  const totalLessons = allLessonIds.length;
  const doneCount = progress.countDone(allLessonIds);
  const coursePct = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;

  // Можно ли открыть урок: есть доступ ИЛИ это бесплатный демо-урок.
  const canOpen = (lesson: CourseLesson) => hasAccess || isLessonFree(course, lesson.id);

  const handleLessonClick = (lesson: CourseLesson) => {
    if (canOpen(lesson)) startLesson(course, lesson);
    else onBuy?.(course);
  };

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
          const cDone = progress.countDone(c.modules.flatMap(m => m.lessons.map(l => l.id)));
          return (
            <button
              key={c.id}
              onClick={() => { setActiveCourse(c.id); setDiagOpen(false); }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all font-bold text-sm"
              style={{
                background: active ? `${c.accent}22` : "rgba(255,255,255,0.04)",
                borderColor: active ? `${c.accent}66` : "rgba(255,255,255,0.08)",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              <span className="text-xl">{c.emoji}</span>
              {c.subject}
              {cDone > 0 && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: `${c.accent}33`, color: c.accent }}
                >
                  {cDone}
                </span>
              )}
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

        {/* Knowledge growth — клиент видит рост своих знаний */}
        <div
          className="mb-6 rounded-2xl border p-5"
          style={{ background: `${course.accent}10`, borderColor: `${course.accent}30` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="TrendingUp" size={18} style={{ color: course.accent }} />
              <span className="text-white font-bold text-sm">Твои знания по предмету</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-montserrat font-black text-2xl" style={{ color: course.accent }}>{coursePct}%</span>
            </div>
          </div>
          <div className="h-2.5 bg-white/8 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${coursePct}%`,
                background: `linear-gradient(90deg, ${course.accent}aa, ${course.accent})`,
              }}
            />
          </div>
          <p className="text-white/55 text-xs">
            {doneCount === 0
              ? "Пройди первый урок — и шкала знаний начнёт расти."
              : coursePct >= 100
                ? "🏆 Программа освоена полностью! Ты готов к ЕГЭ и ДВИ."
                : `Освоено ${doneCount} из ${totalLessons} уроков. Так держать!`}
          </p>
        </div>

        {/* Price / access CTA */}
        {!hasAccess && (
          <div
            className="mb-6 rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ background: `${course.accent}10`, borderColor: `${course.accent}35` }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-montserrat font-black text-2xl text-white">
                  {course.price.toLocaleString("ru-RU")} ₽
                </span>
                <span className="text-white/40 text-sm line-through">
                  {course.oldPrice.toLocaleString("ru-RU")} ₽
                </span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: `${course.accent}30`, color: course.accent }}
                >
                  −{Math.round((1 - course.price / course.oldPrice) * 100)}%
                </span>
              </div>
              <p className="text-white/55 text-xs">
                Полный доступ ко всем {totalLessons} урокам курса с наставником и голосом. Первый урок — бесплатно.
              </p>
            </div>
            <button
              onClick={() => onBuy?.(course)}
              className="px-6 py-3 rounded-2xl font-bold text-white whitespace-nowrap transition-all hover:scale-[1.03]"
              style={{ background: `linear-gradient(135deg, ${course.accent}, ${course.accent}aa)` }}
            >
              Купить за {course.price.toLocaleString("ru-RU")} ₽
            </button>
          </div>
        )}

        {/* Diagnostic banner */}
        <button
          onClick={() => setDiagOpen(true)}
          className="w-full mb-6 flex items-center gap-4 text-left px-5 py-4 rounded-2xl border transition-all hover:scale-[1.01]"
          style={{ background: `${course.accent}14`, borderColor: `${course.accent}40` }}
        >
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${course.accent}25` }}
          >
            <Icon name="ClipboardCheck" size={22} style={{ color: course.accent }} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Не знаешь, с чего начать? Пройди диагностику</p>
            <p className="text-white/50 text-xs">5 коротких вопросов — наставник определит уровень и подберёт раздел</p>
          </div>
          <Icon name="ArrowRight" size={18} className="text-white/40 flex-shrink-0" />
        </button>

        {/* Индивидуальная программа по классу — не одна программа для всех */}
        {setGrade && (
          <div className="mb-5 rounded-2xl border border-white/8 bg-card/40 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Icon name="GraduationCap" size={16} style={{ color: course.accent }} />
              <span className="text-white font-bold text-sm">Твой класс — покажем программу под твой уровень</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {GRADE_ORDER.map(g => {
                const active = grade === g;
                return (
                  <button
                    key={g}
                    onClick={() => setGrade(active ? "" : g)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${active ? "text-white" : "text-white/55 hover:text-white bg-white/5"}`}
                    style={active ? { background: course.accent } : undefined}
                  >
                    {GRADE_LABEL[g]}
                  </button>
                );
              })}
              {grade && (
                <button onClick={() => setGrade("")} className="text-xs font-bold px-3 py-1.5 rounded-xl text-white/45 hover:text-white bg-white/5">
                  Показать всё
                </button>
              )}
            </div>
            <p className="text-white/40 text-[11px] mt-2.5">
              {grade
                ? `Показаны темы для уровня «${GRADE_LABEL[grade as GradeLevel] ?? grade}» и предыдущих классов. Наставник объяснит по твоему уровню.`
                : "Выбери класс — покажем только нужные темы и уберём лишнее."}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {visibleModules.map(mod => {
            const modIds = mod.lessons.map(l => l.id);
            const modDone = progress.countDone(modIds);
            const modPct = modIds.length ? Math.round((modDone / modIds.length) * 100) : 0;
            return (
              <div key={mod.id} className="bg-card/50 border border-white/8 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{mod.emoji}</span>
                  <span className="font-bold text-white text-sm flex-1">{mod.title}</span>
                  {mod.grade && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${course.accent}22`, color: course.accent }}>
                      {GRADE_LABEL[mod.grade]}
                    </span>
                  )}
                  <span className="text-[11px] text-white/40 font-bold">{modDone}/{modIds.length}</span>
                </div>
                {/* Module progress bar */}
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${modPct}%`, backgroundColor: course.accent }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {mod.lessons.map(lesson => {
                    const done = progress.isDone(lesson.id);
                    const locked = !canOpen(lesson);
                    const free = isLessonFree(course, lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className="group flex items-center gap-3 text-left px-3 py-2.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 transition-all"
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                          style={{ background: done ? `${course.accent}` : locked ? "rgba(255,255,255,0.06)" : `${course.accent}22` }}
                        >
                          <Icon
                            name={done ? "Check" : locked ? "Lock" : "Play"}
                            size={14}
                            style={{ color: done ? "#0a0a14" : locked ? "rgba(255,255,255,0.5)" : course.accent }}
                          />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-tight ${done ? "text-white/60" : locked ? "text-white/55" : "text-white"}`}>
                            {lesson.title}
                          </p>
                          <p className="text-white/40 text-xs truncate">
                            {done ? "Пройдено · повторить" : free ? "Бесплатный урок" : locked ? "Откроется с полным доступом" : lesson.goal}
                          </p>
                        </div>
                        <Icon
                          name={locked ? "Lock" : "ChevronRight"}
                          size={16}
                          className="text-white/30 group-hover:text-white/70 transition-colors flex-shrink-0"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {diagOpen && (
        <DiagnosticModal
          course={course}
          onClose={() => setDiagOpen(false)}
          startLesson={(c, l) => {
            setDiagOpen(false);
            startLesson(c, l);
          }}
        />
      )}
    </div>
  );
}