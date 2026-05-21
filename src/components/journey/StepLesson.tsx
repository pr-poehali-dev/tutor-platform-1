import { useState, useEffect } from "react";
import { Task, SubjectChoice, ProgramModule, Lesson, LEARNING_PATH_URL } from "./journeyData";
import LessonHeader from "./lesson/LessonHeader";
import LessonTheoryPhase from "./lesson/LessonTheoryPhase";
import LessonExamplesPhase from "./lesson/LessonExamplesPhase";
import LessonTasksPhase from "./lesson/LessonTasksPhase";
import LessonLoadingProgress from "./lesson/LessonLoadingProgress";
import LessonNarratorBar from "./lesson/LessonNarratorBar";
import useLessonNarrator from "@/hooks/useLessonNarrator";

interface Props {
  module: ProgramModule;
  subject: SubjectChoice;
  onModuleComplete: () => void;
  onBack: () => void;
  grade?: string;
}

type Phase = "theory" | "examples" | "tasks";

export default function StepLesson({ module, subject, onModuleComplete, onBack, grade = "5-9" }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("theory");
  const [theoryIdx, setTheoryIdx] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);

  const [taskIdx, setTaskIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const narrator = useLessonNarrator();

  const loadTasksInBackground = async (lessonRef: Lesson) => {
    try {
      const res = await fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_lesson_tasks",
          subject: subject.id,
          topic: module.topic,
          grade,
          difficulty: module.difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data?.tasks)) return;
      setLesson({ ...lessonRef, tasks: data.tasks });
    } catch {
      // тихо: пользователь увидит сообщение в фазе задач если ничего не подгрузилось
    }
  };

  const loadLesson = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_lesson",
          subject: subject.id,
          topic: module.topic,
          grade,
          difficulty: module.difficulty,
          lesson_title: module.title,
          include_tasks: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации урока");
      const lessonData = data as Lesson;
      setLesson(lessonData);
      setPhase("theory");
      setTheoryIdx(0);
      setExampleIdx(0);
      setRevealedSteps(0);
      setTaskIdx(0);
      setShowResult(false);
      setSelectedOption(null);
      setUserAnswer("");
      setHintsShown(0);
      setCorrectCount(0);

      // Если урок пришёл из кэша — задачи уже в нём; иначе подгружаем фоном
      if (!lessonData.tasks || lessonData.tasks.length === 0) {
        loadTasksInBackground(lessonData);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTask: Task | null = lesson && phase === "tasks" ? lesson.tasks[taskIdx] : null;

  // ─── Текст текущего раздела для озвучки ───
  const buildNarrationText = (): string => {
    if (!lesson) return "";
    if (phase === "theory") {
      const block = lesson.theory_blocks?.[theoryIdx];
      if (!block) return "";
      return `${block.heading}. ${block.content}`;
    }
    if (phase === "examples") {
      const ex = lesson.examples?.[exampleIdx];
      if (!ex) return "";
      return `${ex.title}. Условие: ${ex.problem}. Ответ: ${ex.answer}.${ex.note ? " " + ex.note : ""}`;
    }
    if (phase === "tasks" && currentTask) {
      let txt = `Задача ${taskIdx + 1}. ${currentTask.question}`;
      if (currentTask.type === "multiple_choice" && currentTask.options?.length) {
        txt += " Варианты: " + currentTask.options.map((o, i) => `${i + 1}. ${o}`).join("; ");
      }
      if (showResult && currentTask.explanation) {
        txt += " " + currentTask.explanation;
      }
      return txt;
    }
    return "";
  };

  // ─── Автоозвучка при смене раздела ───
  useEffect(() => {
    if (!lesson || isLoading || !narrator.enabled) return;
    const text = buildNarrationText();
    if (text) narrator.speak(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, phase, theoryIdx, exampleIdx, taskIdx, showResult, narrator.enabled, narrator.voiceId]);

  const isAnswerCorrect = () => {
    if (!currentTask || !showResult) return false;
    if (currentTask.type === "multiple_choice") {
      return selectedOption === Number(currentTask.correct_answer);
    }
    const correct = String(currentTask.correct_answer).toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();
    return user === correct || (user.length > 3 && correct.includes(user));
  };

  const checkAnswer = () => {
    if (!currentTask) return;
    let isCorrect = false;
    if (currentTask.type === "multiple_choice") {
      isCorrect = selectedOption === Number(currentTask.correct_answer);
    } else {
      const correct = String(currentTask.correct_answer).toLowerCase().trim();
      const user = userAnswer.toLowerCase().trim();
      isCorrect = user === correct || (user.length > 3 && correct.includes(user));
    }
    if (isCorrect) setCorrectCount(c => c + 1);
    setShowResult(true);
  };

  const nextTask = () => {
    if (!lesson) return;
    const total = lesson.tasks.length;
    if (taskIdx + 1 >= total) {
      onModuleComplete();
      return;
    }
    setTaskIdx(taskIdx + 1);
    setUserAnswer("");
    setSelectedOption(null);
    setShowResult(false);
    setHintsShown(0);
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <LessonLoadingProgress
          topic={module.topic}
          accent={subject.accent}
          estimateSeconds={12}
        />
      </div>
    );
  }

  // ─── Error ───
  if (error || !lesson) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-300 text-sm">
          ⚠️ {error || "Не удалось загрузить урок"}
          <button onClick={loadLesson} className="block mt-3 text-white underline text-xs">Попробовать снова</button>
        </div>
      </div>
    );
  }

  const totalTasks = lesson.tasks.length;
  const accent = subject.accent;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <LessonHeader
        module={module}
        lesson={lesson}
        phase={phase}
        theoryIdx={theoryIdx}
        exampleIdx={exampleIdx}
        taskIdx={taskIdx}
        totalTasks={totalTasks}
        correctCount={correctCount}
        accent={accent}
        onBack={onBack}
      />

      {phase === "theory" && (
        <LessonTheoryPhase
          lesson={lesson}
          theoryIdx={theoryIdx}
          setTheoryIdx={setTheoryIdx}
          onGoToExamples={() => setPhase("examples")}
          accent={accent}
        />
      )}

      {phase === "examples" && (
        <LessonExamplesPhase
          lesson={lesson}
          exampleIdx={exampleIdx}
          setExampleIdx={setExampleIdx}
          revealedSteps={revealedSteps}
          setRevealedSteps={setRevealedSteps}
          onGoBackToTheory={() => {
            setPhase("theory");
            setTheoryIdx(lesson.theory_blocks.length - 1);
          }}
          onGoToTasks={() => setPhase("tasks")}
          accent={accent}
        />
      )}

      {phase === "tasks" && currentTask && (
        <LessonTasksPhase
          lesson={lesson}
          currentTask={currentTask}
          taskIdx={taskIdx}
          totalTasks={totalTasks}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          showResult={showResult}
          hintsShown={hintsShown}
          setHintsShown={setHintsShown}
          isAnswerCorrect={isAnswerCorrect}
          onCheckAnswer={checkAnswer}
          onNextTask={nextTask}
          accent={accent}
          reportContext={{
            subject: subject.id,
            topic: module.topic,
            grade,
            lessonTitle: module.title,
          }}
        />
      )}

      {phase === "tasks" && !currentTask && (
        <LessonLoadingProgress
          topic={module.topic}
          accent={accent}
          estimateSeconds={7}
          title="Готовлю задачи для самопроверки"
        />
      )}

      <LessonNarratorBar
        status={narrator.status}
        currentText={narrator.currentText}
        error={narrator.error}
        voiceId={narrator.voiceId}
        setVoiceId={narrator.setVoiceId}
        rate={narrator.rate}
        setRate={narrator.setRate}
        enabled={narrator.enabled}
        setEnabled={narrator.setEnabled}
        onPause={narrator.pause}
        onResume={narrator.resume}
        onStop={narrator.stop}
        onReplay={() => {
          const t = buildNarrationText();
          if (t) narrator.speak(t);
        }}
        accent={accent}
      />
    </div>
  );
}