import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course, GRADES, FORMAT_CONFIG, getCoursePrice, getAgeRating, getCourseDisclaimers } from "./coursesData";
import { getCourseDetail } from "./courseDetailsData";
import LessonViewerModal from "./LessonViewerModal";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import useCourseCurriculum from "@/hooks/useCourseCurriculum";

interface Props {
  course: Course | null;
  onClose: () => void;
  onStartWithAI: (course: Course) => void;
}

export default function CourseDetailModal({ course, onClose, onStartWithAI }: Props) {
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  const { canAccessCourse, hasSubscription } = useAccess();
  const [activeTab, setActiveTab] = useState<"program" | "reviews" | "about">("about");
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [openLesson, setOpenLesson] = useState<{ title: string; topic: string } | null>(null);

  useEffect(() => {
    if (course) {
      setActiveTab("about");
      setExpandedModule(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [course]);

  // Подгружаем РЕАЛЬНУЮ программу курса из БД (если уже сгенерирована ИИ-методистом).
  // Если нет — авто-генерация в фоне через course-builder.
  // ВАЖНО: хук должен быть до early return — иначе нарушается порядок React-хуков.
  const real = useCourseCurriculum({
    id: course?.id ?? 0,
    title: course?.title ?? "",
    subject: course?.subject ?? "",
    grade: course?.grade ?? "",
    lessons: course?.lessons ?? 0,
    duration: course?.duration,
    description: course?.description,
    format: course?.format,
  }, true);

  if (!course) return null;

  const fmt = FORMAT_CONFIG[course.format];
  const gradeLabel = GRADES.find(g => g.id === course.grade)?.label || course.grade;

  const template = getCourseDetail(course);
  const detail = real.modules.length > 0
    ? {
        outcomes: real.curriculum?.learning_outcomes && real.curriculum.learning_outcomes.length > 0
          ? real.curriculum.learning_outcomes
          : template.outcomes,
        forWhom: real.curriculum?.target_audience
          ? [real.curriculum.target_audience, ...template.forWhom.slice(0, 2)]
          : template.forWhom,
        modules: real.modules,
        reviews: template.reviews,
      }
    : template;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-white/10 rounded-none md:rounded-3xl w-full max-w-4xl my-0 md:my-8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top gradient */}
        <div className={`h-1.5 bg-gradient-to-r ${course.color}`} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-6 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <Icon name="X" size={18} />
        </button>

        <div className="p-6 md:p-10 max-h-[90vh] md:max-h-[85vh] overflow-y-auto">

          {/* Header */}
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

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-white/8 overflow-x-auto -mx-1 px-1">
            {[
              { id: "about", label: "О курсе", icon: "Info" },
              { id: "program", label: "Программа", icon: "ListChecks" },
              { id: "reviews", label: "Отзывы", icon: "MessageSquare" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === t.id
                    ? "border-purple-500 text-white"
                    : "border-transparent text-white/45 hover:text-white/80"
                }`}
              >
                <Icon name={t.icon} size={14} />
                {t.label}
              </button>
            ))}
          </div>

          {/* About tab */}
          {activeTab === "about" && (
            <div className="animate-fade-in space-y-6">
              {/* Description */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
                <h3 className="font-montserrat font-black text-base text-white mb-2 flex items-center gap-2">
                  <span>📖</span> Кратко о курсе
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">{course.description}</p>
              </div>

              {/* Outcomes */}
              <div>
                <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
                  <span>🎯</span> Что освоишь
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {detail.outcomes.map((o, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white/4 rounded-xl p-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon name="Check" size={11} className="text-green-400" />
                      </div>
                      <span className="text-white/75 text-sm">{o}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* For whom */}
              <div>
                <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
                  <span>👥</span> Кому подойдёт
                </h3>
                <div className="flex flex-wrap gap-2">
                  {detail.forWhom.map((f, i) => (
                    <span key={i} className="text-sm text-white/70 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-montserrat font-black text-base text-white mb-3 flex items-center gap-2">
                  <span>🏷️</span> Темы курса
                </h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <span key={tag} className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/25 rounded-lg px-2.5 py-1.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI teacher badge */}
              <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/25 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl flex-shrink-0">
                  🤖
                </div>
                <div>
                  <p className="font-montserrat font-bold text-white text-sm">Преподаёт ИИ-методист</p>
                  <p className="text-white/55 text-xs">{course.tutorBadge} · доступен круглосуточно · подстраивается под твой уровень</p>
                </div>
              </div>

              {/* Юридическая информация и соблюдение законов РФ */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="ShieldCheck" size={16} className="text-emerald-300" />
                  <h4 className="font-montserrat font-bold text-white text-sm">
                    Юридическая информация · соответствует законодательству РФ
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-white/85 font-bold">
                    <Icon name="UserCheck" size={12} />
                    {getAgeRating(course)}
                  </span>
                  <span className="text-white/55 text-[11px]">
                    Возрастная маркировка согласно 436-ФЗ
                  </span>
                </div>
                <ul className="space-y-1.5 pt-1">
                  {getCourseDisclaimers(course).map((d, i) => (
                    <li key={i} className="flex gap-2 text-white/55 text-[11px] leading-relaxed">
                      <Icon name="Info" size={12} className="text-white/40 flex-shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-white/35 text-[10px] pt-1 border-t border-white/10">
                  Платформа работает в соответствии с 273-ФЗ «Об образовании в РФ», 152-ФЗ «О персональных данных», 38-ФЗ «О рекламе» и иными нормативными актами РФ.
                </p>
              </div>
            </div>
          )}

          {/* Program tab */}
          {activeTab === "program" && (
            <div className="animate-fade-in">
              {real.generating && (
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
              {real.curriculum && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3">
                  <Icon name="ShieldCheck" size={16} className="text-emerald-300 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-bold">Программа курса · версия {real.curriculum.version || 1} · {real.curriculum.estimated_hours}ч общего обучения</p>
                    {real.curriculum.methodology && (
                      <p className="text-white/55 text-xs">{real.curriculum.methodology.slice(0, 120)}</p>
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
          )}

          {/* Reviews tab */}
          {activeTab === "reviews" && (
            <div className="animate-fade-in">
              <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-3 mb-5 text-yellow-200/85 text-xs">
                ℹ️ Отзывы публикуются обезличенно. Указаны только инициалы и город ученика — в соответствии с требованиями Федерального закона №152-ФЗ «О персональных данных».
              </div>
              <div className="flex flex-col gap-3">
                {detail.reviews.map((r, i) => (
                  <div key={i} className="bg-white/4 border border-white/8 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                        {r.initials.split(" ").map(p => p[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">{r.initials}</p>
                        <p className="text-white/40 text-xs">{r.city} · {r.grade} · {r.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <span key={j} className={`text-sm ${j < r.rating ? "text-yellow-400" : "text-white/15"}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/75 text-sm leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal disclaimer */}
          <div className="mt-6 bg-white/3 border border-white/8 rounded-2xl p-4 text-white/40 text-xs leading-relaxed">
            <p className="mb-2">
              <strong className="text-white/55">Юридическая информация.</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside marker:text-white/30 mb-3">
              <li>Курс является информационным образовательным продуктом и не заменяет общеобразовательную программу.</li>
              <li>Результаты обучения индивидуальны и зависят от усилий и регулярности занятий ученика. Конкретный балл на экзамене или оценка в школе не гарантируются.</li>
              <li>Платформа не собирает излишних персональных данных. Регистрация — только по нику.</li>
              <li>Используются собственные методические материалы. Упоминания школьной программы — в рамках свободного использования информации в образовательных целях (ст. 1274 ГК РФ).</li>
            </ul>
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-3 border-t border-white/8">
              <Link to="/legal/offer" target="_blank" className="text-cyan-400/70 hover:text-cyan-300 transition-colors">Публичная оферта →</Link>
              <Link to="/legal/privacy" target="_blank" className="text-cyan-400/70 hover:text-cyan-300 transition-colors">Политика конфиденциальности →</Link>
              <Link to="/legal/terms" target="_blank" className="text-cyan-400/70 hover:text-cyan-300 transition-colors">Пользовательское соглашение →</Link>
            </div>
          </div>

        </div>

        {/* Sticky footer with CTA */}
        <div className="border-t border-white/10 bg-card/95 backdrop-blur-md p-4 md:p-5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {canAccessCourse(course.id) ? (
              <>
                <p className="text-green-300 text-sm font-bold flex items-center gap-1.5">
                  <Icon name="CheckCircle2" size={14} />
                  {hasSubscription ? "Открыто по подписке" : "Курс куплен"}
                </p>
                <p className="text-white/45 text-xs mt-0.5">Все уроки доступны во вкладке «Программа»</p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-montserrat font-black text-2xl text-white">
                    {getCoursePrice(course).toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="text-white/45 text-xs">за полный курс</span>
                </div>
                <p className="text-green-400 text-xs flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                  Первый урок без оплаты
                </p>
              </>
            )}
          </div>
          {canAccessCourse(course.id) ? (
            <button
              onClick={() => {
                setActiveTab("program");
                setExpandedModule(1);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 md:px-7 py-3 md:py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
            >
              <Icon name="Play" size={16} />
              <span className="hidden sm:inline">К программе</span>
              <span className="sm:hidden">Учить</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartWithAI(course)}
                className="hidden md:flex items-center gap-2 bg-white/8 border border-white/15 text-white text-sm font-medium px-4 py-3 rounded-2xl hover:bg-white/12 transition-colors"
              >
                <Icon name="Gift" size={14} />
                Пробный урок
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openLogin();
                    return;
                  }
                  navigate(`/course-checkout/${course.id}`);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 md:px-7 py-3 md:py-3.5 rounded-2xl hover:opacity-90 transition-opacity glow-purple"
              >
                <Icon name="CreditCard" size={16} />
                <span className="hidden sm:inline">Купить курс</span>
                <span className="sm:hidden">Купить</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {openLesson && (
        <LessonViewerModal
          open={!!openLesson}
          onClose={() => setOpenLesson(null)}
          subjectId={course.subject}
          topic={openLesson.topic}
          grade={course.grade}
          lessonTitle={openLesson.title}
        />
      )}
    </div>
  );
}