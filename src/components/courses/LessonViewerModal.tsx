import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { LEARNING_PATH_URL, Lesson, Task } from "@/components/journey/journeyData";
import LessonLoadingProgress from "@/components/journey/lesson/LessonLoadingProgress";
import LessonNarratorBar from "@/components/journey/lesson/LessonNarratorBar";
import useLessonNarrator from "@/hooks/useLessonNarrator";
import LessonViewerHeader from "./lessonViewer/LessonViewerHeader";
import LessonViewerTheory from "./lessonViewer/LessonViewerTheory";
import LessonViewerExamples from "./lessonViewer/LessonViewerExamples";
import LessonViewerTasks, { LessonViewerDone } from "./lessonViewer/LessonViewerTasks";

interface Props {
  open: boolean;
  onClose: () => void;
  subjectId: string;          // math/physics/english/russian/...
  topic: string;              // тема урока
  grade: string;              // 5-9 / 10-11 / ege / oge / 1-4
  lessonTitle: string;        // название урока из программы курса
  accent?: string;
}

const SUPPORTED_SUBJECTS = ["math", "physics", "english", "russian"];

const mapSubject = (s: string): string => {
  if (SUPPORTED_SUBJECTS.includes(s)) return s;
  if (s === "literature") return "russian";
  if (s === "chemistry" || s === "biology" || s === "cs") return "physics";
  return "math";
};

const mapGrade = (g: string): string => {
  if (["5-9", "10-11", "ege"].includes(g)) return g;
  if (g === "oge") return "5-9";
  if (g === "1-4") return "5-9";
  return "5-9";
};

type Phase = "theory" | "examples" | "tasks" | "done";

export default function LessonViewerModal({ open, onClose, subjectId, topic, grade, lessonTitle, accent = "#a855f7" }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("theory");
  const [theoryIdx, setTheoryIdx] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);

  const [taskIdx, setTaskIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const narrator = useLessonNarrator();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      loadLesson();
    } else {
      document.body.style.overflow = "";
      narrator.stop();
    }
    return () => { document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, topic, lessonTitle]);

  const loadTasksInBackground = async (lessonRef: Lesson) => {
    try {
      const res = await fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_lesson_tasks",
          subject: mapSubject(subjectId),
          topic,
          grade: mapGrade(grade),
          difficulty: "средний",
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data?.tasks)) return;
      setLesson({ ...lessonRef, tasks: data.tasks });
    } catch {
      // тихо
    }
  };

  const loadLesson = async () => {
    setIsLoading(true);
    setError(null);
    setLesson(null);
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
    try {
      const res = await fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_lesson",
          subject: mapSubject(subjectId),
          topic,
          grade: mapGrade(grade),
          difficulty: "средний",
          lesson_title: lessonTitle,
          include_tasks: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации урока");
      const lessonData = data as Lesson;
      setLesson(lessonData);
      if (!lessonData.tasks || lessonData.tasks.length === 0) {
        loadTasksInBackground(lessonData);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const currentTask: Task | null = lesson && phase === "tasks" ? lesson.tasks[taskIdx] : null;

  // ─── Озвучка текущего раздела ───
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
    if (phase === "done" && lesson) {
      return `Урок пройден! Правильных ответов: ${correctCount} из ${lesson.tasks.length}. Молодец!`;
    }
    return "";
  };

  useEffect(() => {
    if (!open || !lesson || isLoading || !narrator.enabled) return;
    const text = buildNarrationText();
    if (text) narrator.speak(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, phase, theoryIdx, exampleIdx, taskIdx, showResult, narrator.enabled, narrator.voiceId, open]);

  if (!open) return null;

  const isAnswerCorrect = () => {
    if (!currentTask || !showResult) return false;
    if (currentTask.type === "multiple_choice") return selectedOption === Number(currentTask.correct_answer);
    const correct = String(currentTask.correct_answer).toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();
    return user === correct || (user.length > 3 && correct.includes(user));
  };

  const checkAnswer = () => {
    if (!currentTask) return;
    const correct = isAnswerCorrect() || (
      currentTask.type === "multiple_choice"
        ? selectedOption === Number(currentTask.correct_answer)
        : String(currentTask.correct_answer).toLowerCase().trim() === userAnswer.toLowerCase().trim()
    );
    if (correct) setCorrectCount(c => c + 1);
    setShowResult(true);
  };

  const nextTask = () => {
    if (!lesson) return;
    if (taskIdx + 1 >= lesson.tasks.length) {
      setPhase("done");
      return;
    }
    setTaskIdx(taskIdx + 1);
    setUserAnswer("");
    setSelectedOption(null);
    setShowResult(false);
    setHintsShown(0);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-white/10 rounded-none md:rounded-3xl w-full max-w-3xl my-0 md:my-8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }} />

        <button
          onClick={onClose}
          className="absolute right-4 top-6 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <Icon name="X" size={18} />
        </button>

        <div className="p-6 md:p-8 max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
          {/* Loading */}
          {isLoading && (
            <LessonLoadingProgress
              topic={topic}
              accent={accent}
              estimateSeconds={12}
            />
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-300 text-sm">
              ⚠️ {error}
              <button onClick={loadLesson} className="block mt-3 text-white underline text-xs">Попробовать снова</button>
            </div>
          )}

          {/* Content */}
          {lesson && !isLoading && (
            <>
              <LessonViewerHeader lesson={lesson} topic={topic} phase={phase} />

              {phase === "theory" && (
                <LessonViewerTheory
                  lesson={lesson}
                  theoryIdx={theoryIdx}
                  setTheoryIdx={setTheoryIdx}
                  setPhase={setPhase}
                  accent={accent}
                />
              )}

              {phase === "examples" && (
                <LessonViewerExamples
                  lesson={lesson}
                  exampleIdx={exampleIdx}
                  setExampleIdx={setExampleIdx}
                  revealedSteps={revealedSteps}
                  setRevealedSteps={setRevealedSteps}
                  setPhase={setPhase}
                  setTheoryIdx={setTheoryIdx}
                  accent={accent}
                />
              )}

              {phase === "tasks" && currentTask && (
                <LessonViewerTasks
                  lesson={lesson}
                  currentTask={currentTask}
                  taskIdx={taskIdx}
                  selectedOption={selectedOption}
                  setSelectedOption={setSelectedOption}
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  showResult={showResult}
                  hintsShown={hintsShown}
                  setHintsShown={setHintsShown}
                  isAnswerCorrect={isAnswerCorrect}
                  checkAnswer={checkAnswer}
                  nextTask={nextTask}
                  accent={accent}
                />
              )}

              {phase === "tasks" && !currentTask && (
                <LessonLoadingProgress
                  topic={topic}
                  accent={accent}
                  estimateSeconds={7}
                  title="Готовлю задачи для самопроверки"
                />
              )}

              {phase === "done" && (
                <LessonViewerDone
                  lesson={lesson}
                  correctCount={correctCount}
                  accent={accent}
                  onRetry={loadLesson}
                  onClose={onClose}
                />
              )}
            </>
          )}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
}