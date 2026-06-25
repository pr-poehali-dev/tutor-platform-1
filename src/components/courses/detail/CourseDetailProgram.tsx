import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import { CourseDetail } from "@/components/courses/courseDetailsData";
import { RealCurriculum } from "@/hooks/useCourseCurriculum";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { isPromoActive } from "@/components/promo/dobroConfig";

interface Props {
  course: Course;
  detail: CourseDetail;
  generating: boolean;
  curriculum: RealCurriculum | null;
  expandedModule: number | null;
  setExpandedModule: (id: number | null) => void;
  setOpenLesson: (lesson: { title: string; topic: string; moduleId: number; num: number } | null) => void;
  isLessonDone: (key: string) => boolean;
  moduleProgress: (moduleId: number, totalLessons: number) => number;
  getQuiz: (key: string) => { score: number | null; total: number | null } | null;
  setOpenQuiz: (quiz: { moduleId: number; title: string; topics: string[] } | null) => void;
}

const lKey = (moduleId: number, num: number) => `m${moduleId}-l${num}`;
const qKey = (moduleId: number) => `m${moduleId}-quiz`;

export default function CourseDetailProgram({
  course,
  detail,
  generating,
  curriculum,
  expandedModule,
  setExpandedModule,
  setOpenLesson,
  isLessonDone,
  moduleProgress,
  getQuiz,
  setOpenQuiz,
}: Props) {
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  const { canAccessCourse, hasSubscription } = useAccess();

  return (
    <div className="animate-fade-in">
      {generating && (
        <div className="mb-4 bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-purple-500/30 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/25 flex items-center justify-center flex-shrink-0">
            <Icon name="Loader2" size={16} className="animate-spin text-purple-200" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-bold">ИИ-методист готовит программу под тебя</p>
            <p className="text-white/55 text-xs">Несколько секунд — собирает темы по ФГОС и расставляет по сложности</p>
          </div>
        </div>
      )}
      {curriculum && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3">
          <Icon name="ShieldCheck" size={16} className="text-emerald-300 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-bold">Программа курса · версия {curriculum.version || 1} · {curriculum.estimated_hours}ч общего обучения</p>
            {curriculum.methodology && (
              <p className="text-white/55 text-xs">{curriculum.methodology.slice(0, 120)}</p>
            )}
          </div>
        </div>
      )}
      <p className="text-white/50 text-xs mb-4">
        Программа делится на {detail.modules.length} {detail.modules.length === 1 ? "модуль" : "модуля"}. Нажми на любой урок — ИИ-методист откроет его прямо сейчас с теорией, разобранными примерами и задачами для самопроверки.
      </p>

      {/* Плашка подписки: показываем, когда у пользователя нет доступа к курсу.
          Первый урок бесплатный, остальные открываются по подписке.
          Во время акции «ДОБРО» всё бесплатно — плашку не показываем. */}
      {!canAccessCourse(course.id) && !course.freeForever && !isPromoActive() && (
        <div className="mb-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-cyan-500/15 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/25 border border-purple-400/30 flex items-center justify-center flex-shrink-0">
              <Icon name="Sparkles" size={18} className="text-purple-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-montserrat font-black text-white text-sm md:text-base">
                Открой все уроки по подписке
              </p>
              <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                Первый урок — бесплатно. Подписка открывает все уроки этого курса,
                остальные 36+ курсов и индивидуальный маршрут.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                try {
                  sessionStorage.setItem("pending_checkout_plan", "pro");
                  sessionStorage.setItem("pending_checkout_period", "month");
                  sessionStorage.setItem("pending_checkout_from", window.location.pathname);
                } catch { /* ignore */ }
                openLogin();
                return;
              }
              navigate(`/checkout/pro?from=${encodeURIComponent(window.location.pathname)}`);
            }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity glow-purple"
          >
            <Icon name="Unlock" size={16} />
            Открыть все уроки по подписке
          </button>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {detail.modules.map(m => {
          const isExpanded = expandedModule === m.id;
          const modPercent = moduleProgress(m.id, m.lessons.length);
          const moduleDone = modPercent >= 100;
          return (
            <div key={m.id} className={`border rounded-2xl transition-all ${isExpanded ? "border-purple-500/40 bg-purple-500/5" : "border-white/10 bg-white/3"}`}>
              <button
                onClick={() => setExpandedModule(isExpanded ? null : m.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-montserrat font-black text-sm flex-shrink-0 ${
                  moduleDone ? "bg-green-500 text-white" : isExpanded ? "bg-purple-500 text-white" : "bg-white/8 text-white/70"
                }`}>
                  {moduleDone ? <Icon name="Check" size={16} /> : m.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-white text-sm">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40 text-xs">{m.lessons.length} уроков</span>
                    {modPercent > 0 && (
                      <>
                        <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${moduleDone ? "bg-green-500" : "bg-purple-500"}`} style={{ width: `${modPercent}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${moduleDone ? "text-green-400" : "text-purple-300"}`}>{modPercent}%</span>
                      </>
                    )}
                  </div>
                </div>
                <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} className="text-white/40" />
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 pl-16 flex flex-col gap-2 animate-fade-in">
                  {m.lessons.map(l => {
                    const topicFromTags = l.topics?.[0] || course.tags[0] || course.title;
                    const isFirstLesson = m.id === 1 && l.num === 1;
                    const userHasAccess = canAccessCourse(course.id);
                    const isFree = isFirstLesson || userHasAccess;
                    const done = isLessonDone(lKey(m.id, l.num));

                    const handleLessonClick = () => {
                      if (isFree) {
                        setOpenLesson({ title: l.title, topic: topicFromTags, moduleId: m.id, num: l.num });
                        return;
                      }
                      if (!isAuthenticated) {
                        openLogin();
                        return;
                      }
                      navigate(`/course-checkout/${course.id}`);
                    };

                    return (
                      <button
                        key={l.num}
                        onClick={handleLessonClick}
                        className={`flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-xl border-t border-white/5 first:border-t-0 transition-colors text-left group ${
                          isFree ? "hover:bg-white/5" : "hover:bg-amber-500/5"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                          done
                            ? "bg-green-500 text-white"
                            : isFree
                              ? "bg-white/5 group-hover:bg-purple-500/30 text-white/60 group-hover:text-white"
                              : "bg-amber-500/10 text-amber-300/80"
                        }`}>
                          {done ? <Icon name="Check" size={13} /> : isFree ? l.num : <Icon name="Lock" size={12} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm transition-colors ${done ? "text-white/70" : isFree ? "text-white/85 group-hover:text-white" : "text-white/55"}`}>{l.title}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-white/35 text-xs flex items-center gap-1">
                              <Icon name="Clock" size={11} /> {l.duration}
                            </span>
                            <span className="text-cyan-300/70 text-xs flex items-center gap-1">
                              <Icon name="Sparkles" size={11} /> Практика с проверкой
                            </span>
                            {done && (
                              <span className="text-green-400 text-xs flex items-center gap-1 font-semibold">
                                <Icon name="CircleCheck" size={11} /> Пройден
                              </span>
                            )}
                            {isFirstLesson && !userHasAccess && (
                              <span className="text-green-400 text-xs flex items-center gap-1 font-semibold">
                                <Icon name="Gift" size={11} /> Бесплатно
                              </span>
                            )}
                            {!isFree && (
                              <span className="text-amber-300/80 group-hover:text-amber-200 text-xs flex items-center gap-1 transition-colors">
                                <Icon name="Lock" size={11} /> Открыть после оплаты
                              </span>
                            )}
                            {isFree && !done && !isFirstLesson && userHasAccess && (
                              <span className="text-green-400/80 text-xs flex items-center gap-1">
                                {hasSubscription ? "По подписке" : "Курс куплен"}
                              </span>
                            )}
                            {isFree && !done && (
                              <span className="text-purple-300/70 group-hover:text-purple-200 text-xs flex items-center gap-1 transition-colors">
                                <Icon name="Play" size={11} /> Открыть урок
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Итоговый квиз модуля */}
                  {(() => {
                    const userHasAccess = canAccessCourse(course.id);
                    const quizFree = m.id === 1 || userHasAccess;
                    const quizResult = getQuiz(qKey(m.id));
                    const topics = Array.from(
                      new Set(m.lessons.flatMap(l => l.topics || []).filter(Boolean)),
                    );
                    const handleQuiz = () => {
                      if (!quizFree) {
                        if (!isAuthenticated) { openLogin(); return; }
                        navigate(`/course-checkout/${course.id}`);
                        return;
                      }
                      setOpenQuiz({ moduleId: m.id, title: m.title, topics });
                    };
                    return (
                      <button
                        onClick={handleQuiz}
                        className="mt-1 flex items-center gap-3 py-3 px-3 -mx-2 rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-colors text-left group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-500/25 flex items-center justify-center flex-shrink-0">
                          <Icon name="ClipboardCheck" size={14} className="text-purple-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">Итоговый квиз модуля</p>
                          <p className="text-white/45 text-xs">
                            {quizResult && quizResult.total
                              ? `Лучший результат: ${quizResult.score}/${quizResult.total}`
                              : "6 вопросов с мгновенной проверкой и разбором"}
                          </p>
                        </div>
                        {!quizFree
                          ? <Icon name="Lock" size={14} className="text-amber-300/70" />
                          : <Icon name="ArrowRight" size={14} className="text-purple-300/70 group-hover:text-purple-200" />}
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}