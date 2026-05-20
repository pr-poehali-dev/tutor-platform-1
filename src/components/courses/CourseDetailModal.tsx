import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Course, GRADES, FORMAT_CONFIG } from "./coursesData";
import { getCourseDetail } from "./courseDetailsData";

interface Props {
  course: Course | null;
  onClose: () => void;
  onStartWithAI: (course: Course) => void;
}

export default function CourseDetailModal({ course, onClose, onStartWithAI }: Props) {
  const [activeTab, setActiveTab] = useState<"program" | "reviews" | "about">("about");
  const [expandedModule, setExpandedModule] = useState<number | null>(1);

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

  if (!course) return null;

  const detail = getCourseDetail(course);
  const fmt = FORMAT_CONFIG[course.format];
  const gradeLabel = GRADES.find(g => g.id === course.grade)?.label || course.grade;

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
                  <p className="text-white/55 text-xs">{course.tutorBadge} · доступен 24/7 · подстраивается под твой уровень</p>
                </div>
              </div>
            </div>
          )}

          {/* Program tab */}
          {activeTab === "program" && (
            <div className="animate-fade-in">
              <p className="text-white/50 text-xs mb-4">
                Программа делится на {detail.modules.length} модуля. Каждый модуль — несколько уроков, по итогу — проверочные задания.
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
                          {m.lessons.map(l => (
                            <div key={l.num} className="flex items-start gap-3 py-2 border-t border-white/5 first:border-t-0">
                              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/50 text-xs font-bold flex-shrink-0">
                                {l.num}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/85 text-sm">{l.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-white/35 text-xs flex items-center gap-1">
                                    <Icon name="Clock" size={11} /> {l.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
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
            <ul className="space-y-1 list-disc list-inside marker:text-white/30">
              <li>Курс является информационным образовательным продуктом и не заменяет общеобразовательную программу.</li>
              <li>Результаты обучения индивидуальны и зависят от усилий и регулярности занятий ученика. Конкретный балл на экзамене или оценка в школе не гарантируются.</li>
              <li>Платформа не собирает излишних персональных данных. Регистрация — только по нику. См. Политику конфиденциальности.</li>
              <li>Используются собственные методические материалы. Упоминания школьной программы — в рамках свободного использования информации в образовательных целях (ст. 1274 ГК РФ).</li>
            </ul>
          </div>

        </div>

        {/* Sticky footer with CTA */}
        <div className="border-t border-white/10 bg-card/95 backdrop-blur-md p-4 md:p-5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-montserrat font-black text-2xl text-white">
                {course.price === 0 ? "Бесплатно" : `${course.price.toLocaleString("ru-RU")} ₽`}
              </span>
              {course.price > 0 && <span className="text-white/45 text-xs">{course.priceUnit}</span>}
            </div>
            {course.trialAvailable && (
              <p className="text-green-400 text-xs flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                Пробный урок без оплаты
              </p>
            )}
          </div>
          <button
            onClick={() => onStartWithAI(course)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 md:px-7 py-3 md:py-3.5 rounded-2xl hover:opacity-90 transition-opacity glow-purple"
          >
            <Icon name="Bot" size={16} />
            <span className="hidden sm:inline">Начать с ИИ-учителем</span>
            <span className="sm:hidden">Начать</span>
          </button>
        </div>

      </div>
    </div>
  );
}
