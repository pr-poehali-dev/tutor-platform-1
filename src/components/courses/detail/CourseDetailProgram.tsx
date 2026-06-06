import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import { CourseDetail } from "@/components/courses/courseDetailsData";
import { RealCurriculum } from "@/hooks/useCourseCurriculum";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";

interface Props {
  course: Course;
  detail: CourseDetail;
  generating: boolean;
  curriculum: RealCurriculum | null;
  expandedModule: number | null;
  setExpandedModule: (id: number | null) => void;
  setOpenLesson: (lesson: { title: string; topic: string } | null) => void;
}

export default function CourseDetailProgram({
  course,
  detail,
  generating,
  curriculum,
  expandedModule,
  setExpandedModule,
  setOpenLesson,
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
      <div className="flex flex-col gap-2">
        {detail.modules.map(m => {
          const isExpanded = expandedModule === m.id;
          return (
            <div key={m.id} className={`border rounded-2xl transition-all ${isExpanded ? "border-purple-500/40 bg-purple-500/5" : "border-white/10 bg-white/3"}`}>
              <button
                onClick={() => setExpandedModule(isExpanded ? null : m.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-montserrat font-black text-sm flex-shrink-0 ${
                  isExpanded ? "bg-purple-500 text-white" : "bg-white/8 text-white/70"
                }`}>
                  {m.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-white text-sm">{m.title}</p>
                  <p className="text-white/40 text-xs">{m.lessons.length} уроков</p>
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

                    const handleLessonClick = () => {
                      if (isFree) {
                        setOpenLesson({ title: l.title, topic: topicFromTags });
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
                          isFree
                            ? "bg-white/5 group-hover:bg-purple-500/30 text-white/60 group-hover:text-white"
                            : "bg-amber-500/10 text-amber-300/80"
                        }`}>
                          {isFree ? l.num : <Icon name="Lock" size={12} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm transition-colors ${isFree ? "text-white/85 group-hover:text-white" : "text-white/55"}`}>{l.title}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-white/35 text-xs flex items-center gap-1">
                              <Icon name="Clock" size={11} /> {l.duration}
                            </span>
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
                            {isFree && !isFirstLesson && userHasAccess && (
                              <span className="text-green-400/80 text-xs flex items-center gap-1">
                                {hasSubscription ? "По подписке" : "Курс куплен"}
                              </span>
                            )}
                            {isFree && (
                              <span className="text-purple-300/70 group-hover:text-purple-200 text-xs flex items-center gap-1 transition-colors">
                                <Icon name="Play" size={11} /> Открыть урок
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
