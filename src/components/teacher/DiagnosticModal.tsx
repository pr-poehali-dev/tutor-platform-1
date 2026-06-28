import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SuperCourse, CourseLesson } from "./superCourses";
import { DIAGNOSTICS, evaluateDiagnostic } from "./diagnosticData";

interface Props {
  course: SuperCourse;
  onClose: () => void;
  startLesson: (course: SuperCourse, lesson: CourseLesson) => void;
}

export default function DiagnosticModal({ course, onClose, startLesson }: Props) {
  const questions = DIAGNOSTICS[course.id] || [];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const accent = course.accent;

  const pick = (optionIdx: number) => {
    const next = [...answers];
    next[step] = optionIdx;
    setAnswers(next);
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 180);
    } else {
      setTimeout(() => setFinished(true), 180);
    }
  };

  const { result, recommendedModuleId } = finished
    ? evaluateDiagnostic(course.id, answers)
    : { result: null, recommendedModuleId: "" };

  const recommendedModule = course.modules.find(m => m.id === recommendedModuleId);
  const recommendedLesson = recommendedModule?.lessons[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border p-6 md:p-8 bg-card max-h-[90vh] overflow-y-auto"
        style={{ borderColor: `${accent}40`, boxShadow: `0 0 60px ${accent}25` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{course.emoji}</span>
          <div className="flex-1">
            <h3 className="font-montserrat font-black text-lg text-white">Диагностика · {course.subject}</h3>
            <p className="text-white/50 text-xs">{finished ? "Результат готов" : `Вопрос ${step + 1} из ${questions.length}`}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        {!finished ? (
          <>
            {/* Progress */}
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-6">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${((step) / questions.length) * 100}%`, backgroundColor: accent }}
              />
            </div>

            {/* Question */}
            <p className="text-white text-base font-semibold mb-5 leading-relaxed">{questions[step].text}</p>

            <div className="flex flex-col gap-2.5">
              {questions[step].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  className="text-left px-4 py-3 rounded-2xl bg-white/4 hover:bg-white/10 border border-white/8 text-white/90 text-sm transition-all hover:border-white/25"
                >
                  <span className="font-bold mr-2" style={{ color: accent }}>{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <div className="text-5xl mb-3">{result!.emoji}</div>
            <h4 className="font-montserrat font-black text-xl text-white mb-1">{result!.level}</h4>
            <p className="text-white/60 text-sm mb-6">{result!.comment}</p>

            <div
              className="rounded-2xl border p-4 mb-5 text-left"
              style={{ background: `${accent}12`, borderColor: `${accent}30` }}
            >
              <p className="text-white/50 text-xs mb-1">Наставник рекомендует начать с раздела</p>
              <p className="text-white font-bold flex items-center gap-2">
                <span>{recommendedModule?.emoji}</span>
                {recommendedModule?.title}
              </p>
              {recommendedLesson && (
                <p className="text-white/50 text-sm mt-1">Первый урок: «{recommendedLesson.title}»</p>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {recommendedLesson && (
                <button
                  onClick={() => startLesson(course, recommendedLesson)}
                  className="w-full py-3 rounded-2xl font-bold text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
                >
                  Начать с рекомендованного урока
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 transition-all"
              >
                Выбрать урок самому
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
