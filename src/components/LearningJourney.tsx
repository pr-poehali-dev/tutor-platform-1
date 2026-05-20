import { useState } from "react";
import Icon from "@/components/ui/icon";
import StepSubject from "./journey/StepSubject";
import StepTest from "./journey/StepTest";
import StepResults from "./journey/StepResults";
import StepProgram from "./journey/StepProgram";
import StepLesson from "./journey/StepLesson";
import {
  LEARNING_PATH_URL,
  SubjectChoice,
  TestQuestion,
  TestAnswer,
  AnalysisResult,
  Program,
  ProgramModule,
  JourneyStep,
} from "./journey/journeyData";

export default function LearningJourney() {
  const [step, setStep] = useState<JourneyStep>("subject");
  const [subject, setSubject] = useState<SubjectChoice | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [currentModule, setCurrentModule] = useState<ProgramModule | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAPI = async <T,>(body: Record<string, unknown>): Promise<T> => {
    const res = await fetch(LEARNING_PATH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.detail || "Ошибка ИИ");
    return data;
  };

  // ─── Start: get test ───
  const startDiagnostic = async () => {
    if (!subject || !grade) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await callAPI<{ test: TestQuestion[] }>({
        action: "diagnostic_test",
        subject: subject.id,
        grade,
      });
      setQuestions(data.test);
      setStep("test");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Test completed: analyze ───
  const onTestComplete = async (answers: TestAnswer[]) => {
    if (!subject) return;
    setStep("analyzing");
    setIsLoading(true);
    try {
      const data = await callAPI<AnalysisResult>({
        action: "analyze_results",
        subject: subject.id,
        grade,
        answers,
      });
      setAnalysis(data);
      setStep("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setStep("test");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Build personal program ───
  const buildProgram = async () => {
    if (!subject || !analysis) return;
    setIsLoading(true);
    try {
      const data = await callAPI<Program>({
        action: "build_program",
        subject: subject.id,
        grade,
        weak_topics: analysis.weak_topics,
        level: analysis.level_assessment,
      });
      setProgram(data);
      setStep("program");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const startModule = (m: ProgramModule) => {
    setCurrentModule(m);
    setStep("lesson");
  };

  const onModuleComplete = () => {
    if (currentModule) {
      setCompletedModules(prev => [...new Set([...prev, currentModule.id])]);
    }
    setStep(program && completedModules.length + 1 >= program.modules.length ? "complete" : "program");
    setCurrentModule(null);
  };

  const resetAll = () => {
    setStep("subject");
    setSubject(null);
    setGrade("");
    setQuestions([]);
    setAnalysis(null);
    setProgram(null);
    setCurrentModule(null);
    setCompletedModules([]);
    setError(null);
  };

  return (
    <section id="journey" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header (only on subject step) */}
        {step === "subject" && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-4">
              <Icon name="Compass" size={14} className="text-purple-300" />
              <span className="text-sm text-purple-300 font-medium">Адаптивная программа · Bloom + Mastery Learning</span>
            </div>
            <h2 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4">
              Персональный <span className="gradient-text-purple">маршрут обучения</span>
            </h2>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              ИИ-методист протестирует, найдёт пробелы и составит программу, где каждое задание уникально
            </p>
          </div>
        )}

        {/* Progress strip (after subject) */}
        {step !== "subject" && (
          <div className="max-w-3xl mx-auto mb-8 flex items-center gap-3">
            <button
              onClick={resetAll}
              className="text-white/40 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
            >
              <Icon name="X" size={13} />
              Прервать
            </button>
            <div className="flex-1 flex items-center gap-2">
              {[
                { id: "test", label: "Тест" },
                { id: "results", label: "Анализ" },
                { id: "program", label: "Программа" },
                { id: "lesson", label: "Урок" },
              ].map((s, i) => {
                const stepOrder = ["test", "analyzing", "results", "program", "lesson", "complete"];
                const currentOrder = stepOrder.indexOf(step);
                const myOrder = stepOrder.indexOf(s.id);
                const isActive = step === s.id || (s.id === "test" && step === "analyzing");
                const isDone = currentOrder > myOrder;
                return (
                  <div key={s.id} className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: isDone ? "#06d6a0" : isActive ? subject?.accent || "#a855f7" : "rgba(255,255,255,0.1)",
                          color: isDone || isActive ? "#fff" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {isDone ? <Icon name="Check" size={11} /> : i + 1}
                      </div>
                      <span className={`text-xs whitespace-nowrap ${isActive ? "text-white font-semibold" : "text-white/40"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < 3 && <div className={`flex-1 h-px ${isDone ? "bg-green-500/50" : "bg-white/10"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global error */}
        {error && step === "subject" && (
          <div className="max-w-3xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Steps */}
        {step === "subject" && (
          <StepSubject
            selectedSubject={subject}
            setSelectedSubject={setSubject}
            selectedGrade={grade}
            setSelectedGrade={setGrade}
            onStart={startDiagnostic}
            isLoading={isLoading}
          />
        )}

        {step === "test" && subject && (
          <StepTest questions={questions} subject={subject} onComplete={onTestComplete} />
        )}

        {step === "analyzing" && subject && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="inline-block mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse-glow" style={{ background: `linear-gradient(135deg, ${subject.accent}, ${subject.accent}40)` }}>
                <Icon name="Brain" size={40} className="text-white animate-pulse" />
              </div>
            </div>
            <h3 className="font-montserrat font-black text-2xl text-white mb-2">ИИ анализирует ответы...</h3>
            <p className="text-white/55 text-sm">Выявляю пробелы, оцениваю сильные стороны, готовлю рекомендации</p>
          </div>
        )}

        {step === "results" && analysis && subject && (
          <StepResults
            analysis={analysis}
            subject={subject}
            onNext={buildProgram}
            isLoading={isLoading}
          />
        )}

        {step === "program" && program && subject && (
          <StepProgram
            program={program}
            subject={subject}
            onStartModule={startModule}
            completedModuleIds={completedModules}
          />
        )}

        {step === "lesson" && currentModule && subject && (
          <StepLesson
            module={currentModule}
            subject={subject}
            onModuleComplete={onModuleComplete}
            onBack={() => { setStep("program"); setCurrentModule(null); }}
          />
        )}

        {step === "complete" && subject && (
          <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="font-montserrat font-black text-3xl text-white mb-3">Программа завершена!</h2>
            <p className="text-white/55 mb-6">
              Ты прошёл все модули. ИИ сохранит прогресс и через 1–7 дней предложит повторение по системе Spaced Repetition.
            </p>
            <button
              onClick={resetAll}
              className="text-white font-bold px-6 py-3.5 rounded-2xl text-sm hover:opacity-90 transition-all"
              style={{ background: `linear-gradient(135deg, ${subject.accent}, ${subject.accent}cc)` }}
            >
              Выбрать новый предмет
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
