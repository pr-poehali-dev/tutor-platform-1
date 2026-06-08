import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course, GRADES, FORMAT_CONFIG, examBadgeLabel } from "./coursesData";
import { getCourseDetail } from "./courseDetailsData";
import LessonViewerModal from "./LessonViewerModal";
import ModuleQuizModal from "./ModuleQuizModal";
import useCourseCurriculum from "@/hooks/useCourseCurriculum";
import useCourseProgress, { lessonKey, quizKey } from "@/hooks/useCourseProgress";
import { SUBJECTS } from "@/components/journey/journeyData";
import { isPromoActive } from "@/components/promo/dobroConfig";
import CourseDetailHeader from "./detail/CourseDetailHeader";
import CourseDetailAbout from "./detail/CourseDetailAbout";
import CourseDetailProgram from "./detail/CourseDetailProgram";
import CourseDetailReviews from "./detail/CourseDetailReviews";
import CourseDetailFooter from "./detail/CourseDetailFooter";

interface Props {
  course: Course | null;
  onClose: () => void;
  onStartWithAI: (course: Course) => void;
}

export default function CourseDetailModal({ course, onClose, onStartWithAI }: Props) {
  const [activeTab, setActiveTab] = useState<"program" | "reviews" | "about">("about");
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [openLesson, setOpenLesson] = useState<{ title: string; topic: string; moduleId: number; num: number } | null>(null);
  const [openQuiz, setOpenQuiz] = useState<{ moduleId: number; title: string; topics: string[] } | null>(null);

  const progress = useCourseProgress(course?.id ?? null, !!course);

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

  const promoOn = isPromoActive();
  const subjectAccent = SUBJECTS.find(s => s.id === course.subject)?.accent || "#a855f7";
  const fmt = FORMAT_CONFIG[course.format];
  const gradeLabel = GRADES.find(g => g.id === course.grade)?.label || course.grade;
  const examLabel = examBadgeLabel(course);

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
          <CourseDetailHeader course={course} fmt={fmt} gradeLabel={gradeLabel} />

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
            <CourseDetailAbout course={course} detail={detail} examLabel={examLabel} />
          )}

          {/* Program tab */}
          {activeTab === "program" && (
            <CourseDetailProgram
              course={course}
              detail={detail}
              generating={real.generating}
              curriculum={real.curriculum}
              expandedModule={expandedModule}
              setExpandedModule={setExpandedModule}
              setOpenLesson={setOpenLesson}
              isLessonDone={progress.isLessonDone}
              moduleProgress={progress.moduleProgress}
              getQuiz={progress.getQuiz}
              setOpenQuiz={setOpenQuiz}
            />
          )}

          {/* Reviews tab */}
          {activeTab === "reviews" && (
            <CourseDetailReviews detail={detail} />
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
        <CourseDetailFooter
          course={course}
          promoOn={promoOn}
          onStartWithAI={onStartWithAI}
          setActiveTab={setActiveTab}
          setExpandedModule={setExpandedModule}
        />

      </div>

      {openLesson && (
        <LessonViewerModal
          open={!!openLesson}
          onClose={() => setOpenLesson(null)}
          subjectId={course.subject}
          topic={openLesson.topic}
          grade={course.grade}
          lessonTitle={openLesson.title}
          accent={subjectAccent}
          onComplete={(correct, total) => {
            progress.completeLesson({
              courseId: course.id,
              key: lessonKey(openLesson.moduleId, openLesson.num),
              title: openLesson.title,
              moduleId: openLesson.moduleId,
              score: correct,
              total,
            });
          }}
        />
      )}

      {openQuiz && (
        <ModuleQuizModal
          open={!!openQuiz}
          onClose={() => setOpenQuiz(null)}
          subjectId={course.subject}
          grade={course.grade}
          moduleTitle={openQuiz.title}
          topics={openQuiz.topics}
          accent={subjectAccent}
          onFinish={(correct, total) => {
            progress.saveQuiz({
              courseId: course.id,
              key: quizKey(openQuiz.moduleId),
              title: `Квиз: ${openQuiz.title}`,
              moduleId: openQuiz.moduleId,
              score: correct,
              total,
            });
          }}
        />
      )}
    </div>
  );
}