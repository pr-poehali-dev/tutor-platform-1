import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import StepSubject from "./journey/StepSubject";
import StepTest from "./journey/StepTest";
import StepResults from "./journey/StepResults";
import StepProgram from "./journey/StepProgram";
import StepLesson from "./journey/StepLesson";
import UserLoginPanel from "./journey/UserLoginPanel";
import { useUserProgress, SavedJourney } from "./journey/useUserProgress";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import {
  LEARNING_PATH_URL,
  SUBJECTS,
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
  const [currentJourneyId, setCurrentJourneyId] = useState<number | null>(null);
  const [currentModule, setCurrentModule] = useState<ProgramModule | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const progress = useUserProgress();
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  const { hasSubscription } = useAccess();

  // Load journeys when user logs in
  useEffect(() => {
    if (progress.user) {
      progress.loadJourneys(progress.user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.user?.id]);

  // ─── Preselect из CourseCard ("Начать обучение") ───
  useEffect(() => {
    try {
      const raw = localStorage.getItem("journey_preselect");
      if (!raw) return;
      const pre = JSON.parse(raw) as { subject?: string; grade?: string };
      if (pre.subject) {
        const found = SUBJECTS.find((s) => s.id === pre.subject);
        if (found) {
          setSubject(found);
          if (pre.grade) setGrade(pre.grade);
        }
      }
      localStorage.removeItem("journey_preselect");
    } catch { /* empty */ }
  }, []);

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

  // ─── Login ───
  const handleLogin = async (nick: string, dn?: string, av?: string) => {
    setLoginError(null);
    try {
      await progress.login(nick, dn, av);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Ошибка входа");
    }
  };

  // ─── Continue saved journey ───
  const continueSavedJourney = (j: SavedJourney) => {
    const subj = SUBJECTS.find(s => s.id === j.subject);
    if (!subj) return;
    setSubject(subj);
    setGrade(j.grade);
    setAnalysis({
      score_percent: j.initial_score_percent,
      level_assessment: j.level_assessment,
      weak_topics: j.weak_topics || [],
      strong_topics: j.strong_topics || [],
      personalized_message: "С возвращением! Продолжим с того места, где остановились.",
      follow_up_questions: [],
    });
    setProgram(j.program_data);
    setCurrentJourneyId(j.id);
    setCompletedModules(j.completed_module_ids || []);
    setStep("program");
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

  // ─── Build personal program (+ save to DB if logged in) ───
  const buildProgram = async () => {
    if (!subject || !analysis) return;
    // Пейволл: индивидуальный маршрут — только для подписчиков
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (!hasSubscription) {
      setStep("paywall");
      return;
    }
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

      // Save to DB if user logged in
      if (progress.user) {
        try {
          const journeyId = await progress.saveJourney({
            user_id: progress.user.id,
            subject: subject.id,
            grade,
            level_assessment: analysis.level_assessment,
            initial_score_percent: analysis.score_percent,
            program_data: data,
            weak_topics: analysis.weak_topics,
            strong_topics: analysis.strong_topics,
          });
          setCurrentJourneyId(journeyId);
          progress.loadJourneys(progress.user.id);
        } catch {
          // continue without DB
        }
      }

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

  const onModuleComplete = async () => {
    if (currentModule) {
      const newCompleted = [...new Set([...completedModules, currentModule.id])];
      setCompletedModules(newCompleted);

      // Save to DB
      if (progress.user && currentJourneyId) {
        try {
          await progress.completeModule({
            user_id: progress.user.id,
            journey_id: currentJourneyId,
            module_id: currentModule.id,
            repeat_after_days: currentModule.repeat_after_days || [1, 3, 7],
            topic: currentModule.topic,
          });
        } catch {
          // continue
        }
      }
    }
    const allDone = program && currentModule && completedModules.length + 1 >= program.modules.length;
    setStep(allDone ? "complete" : "program");
    setCurrentModule(null);
  };

  const resetAll = () => {
    setStep("subject");
    setSubject(null);
    setGrade("");
    setQuestions([]);
    setAnalysis(null);
    setProgram(null);
    setCurrentJourneyId(null);
    setCurrentModule(null);
    setCompletedModules([]);
    setError(null);
  };

  return (
    <section id="journey" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header (only on subject step) */}
        {step === "subject" && (
          <>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-4">
                  <Icon name="Compass" size={14} className="text-purple-300" />
                  <span className="text-sm text-purple-300 font-medium">Адаптивная программа</span>
                </div>
                <h2 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4">
                  Персональный <span className="gradient-text-purple">маршрут обучения</span>
                </h2>
                <p className="text-white/55 text-lg">
                  ИИ-методист протестирует, найдёт пробелы и составит программу, где каждое задание уникально
                </p>
              </div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 glow-purple">
                <img
                  src="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/7bf89b3e-5e97-48ee-aaee-92f99b11c09d.jpg"
                  alt="Школьники занимаются вместе"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Login / saved journeys */}
            <UserLoginPanel
              user={progress.user}
              savedJourneys={progress.savedJourneys}
              onLogin={handleLogin}
              onLogout={progress.logout}
              onContinueJourney={continueSavedJourney}
              isLoading={progress.isLoading}
              error={loginError}
            />
          </>
        )}

        {/* Progress strip (after subject) */}
        {step !== "subject" && (
          <div className="max-w-3xl mx-auto mb-8 flex items-center gap-3">
            <button
              onClick={resetAll}
              className="text-white/40 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
            >
              <Icon name="X" size={13} />
              К списку маршрутов
            </button>
            {progress.user && (
              <div className="ml-auto flex items-center gap-2 text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                <span className="text-lg">{progress.user.avatar_emoji}</span>
                <span className="text-white/70">{progress.user.display_name || progress.user.nickname}</span>
                <span className="text-yellow-400 font-bold">⚡ {progress.user.total_xp}</span>
              </div>
            )}
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

        {step === "paywall" && subject && analysis && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border border-purple-500/30 rounded-3xl p-6 md:p-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 text-4xl mb-5 shadow-lg shadow-purple-500/30">
                🗺️
              </div>
              <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-3">
                Твой персональный маршрут готов
              </h2>
              <p className="text-white/65 text-sm md:text-base leading-relaxed mb-6 max-w-md mx-auto">
                Диагностику ты прошёл бесплатно. <strong className="text-white">Индивидуальный маршрут с трекингом прогресса и адаптивными модулями</strong> доступен по подписке.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left max-w-md mx-auto">
                <p className="text-white/85 text-sm font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Sparkles" size={14} className="text-purple-300" />
                  Что входит в подписку
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2"><Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" /> Персональный маршрут под твой уровень</li>
                  <li className="flex items-start gap-2"><Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" /> Все 39 курсов в каталоге</li>
                  <li className="flex items-start gap-2"><Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" /> Трекинг прогресса и интервальное повторение</li>
                  <li className="flex items-start gap-2"><Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" /> Безлимит сообщений ИИ-методисту</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate(`/pricing?from=${encodeURIComponent(window.location.pathname)}`)}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-7 py-3.5 rounded-2xl hover:opacity-90 transition-opacity glow-purple"
                >
                  <Icon name="Sparkles" size={16} />
                  Посмотреть тарифы
                </button>
                <button
                  onClick={() => setStep("results")}
                  className="inline-flex items-center justify-center gap-2 bg-white/8 border border-white/15 text-white/75 text-sm font-medium px-5 py-3.5 rounded-2xl hover:bg-white/12 transition-colors"
                >
                  <Icon name="ArrowLeft" size={14} />
                  Вернуться к анализу
                </button>
              </div>

              <p className="text-white/40 text-xs mt-5">
                Уже есть подписка?{" "}
                <Link to="/cabinet" className="text-purple-300 underline">Войти в кабинет</Link>
              </p>
            </div>
          </div>
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
            grade={grade}
            onModuleComplete={onModuleComplete}
            onBack={() => { setStep("program"); setCurrentModule(null); }}
          />
        )}

        {step === "complete" && subject && (
          <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="font-montserrat font-black text-3xl text-white mb-3">Программа завершена!</h2>
            <p className="text-white/55 mb-6">
              {progress.user
                ? `Прогресс сохранён. Через 1–7 дней ИИ напомнит о повторении ключевых тем по системе интервального повторения.`
                : "Войди в аккаунт, чтобы сохранять прогресс и продолжать с любого устройства."}
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