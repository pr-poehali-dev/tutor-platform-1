import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { countWords, NORMS, READING_TEXTS } from "./readingTexts";
import { marathonApi } from "./api";

type Stage = "choose" | "reading" | "questions" | "result";

interface Props {
  /** Токен участника марафона — чтобы замер сохранился в его прогрессе */
  token?: string;
  defaultGrade?: string;
  onDone?: (wpm: number, comprehension: number) => void;
  compact?: boolean;
}

export default function ReadingTest({ token, defaultGrade, onDone, compact }: Props) {
  const [grade, setGrade] = useState(defaultGrade || "2");
  const [stage, setStage] = useState<Stage>(defaultGrade ? "choose" : "choose");
  const [startAt, setStartAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number | null>(null);

  const item = READING_TEXTS.find((t) => t.grade === grade) || READING_TEXTS[1];
  const words = countWords(item.text);
  const norm = NORMS[grade];

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const start = () => {
    setAnswers([]);
    setStartAt(performance.now());
    setElapsed(0);
    setStage("reading");
    timer.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    trackGoal("reading_test_start", { grade });
  };

  const finishReading = () => {
    if (timer.current) window.clearInterval(timer.current);
    setSeconds(Math.max(3, (performance.now() - startAt) / 1000));
    setStage("questions");
  };

  const wpm = seconds ? Math.round((words / seconds) * 60) : 0;
  const correct = answers.filter((a, i) => a === item.questions[i]?.correct).length;
  const comprehension = Math.round((correct / item.questions.length) * 100);

  const submit = async () => {
    setSaving(true);
    try {
      if (wpm <= (grade === "adult" ? 900 : 300)) {
        await marathonApi.saveTest({ token, grade, words, seconds, comprehension });
      }
    } catch {
      /* результат покажем и без сохранения */
    }
    setSaving(false);
    setStage("result");
    trackGoal("reading_test_done", { grade, wpm });
    onDone?.(wpm, comprehension);
  };

  const tooFast = wpm > (grade === "adult" ? 900 : 300);

  const verdict = () => {
    if (tooFast) return "Результат подозрительно высокий — похоже, текст прочитали не полностью. Пройдите тест ещё раз в обычном темпе.";
    if (!norm) return "";
    if (wpm >= norm.max) return "Скорость выше ориентира для этого уровня — отличный результат.";
    if (wpm >= norm.min) return "Скорость в пределах ориентира. Есть куда расти — упражнения марафона помогут.";
    return "Скорость пока ниже ориентира. Это не повод для тревоги: навык хорошо тренируется короткими ежедневными занятиями.";
  };

  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.03] ${compact ? "p-5" : "p-6 md:p-8"}`}>
      {stage === "choose" && (
        <div>
          <p className="text-white/70 text-sm mb-4">Кто читает? Выберите уровень — подберём текст.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {READING_TEXTS.map((t) => (
              <button
                key={t.grade}
                onClick={() => setGrade(t.grade)}
                className={`px-3 py-3 rounded-xl text-sm font-bold border transition-colors ${
                  grade === t.grade ? "bg-violet-500/25 border-violet-400/60 text-white" : "bg-white/[0.03] border-white/10 text-white/70 hover:border-white/25"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ul className="text-white/55 text-sm space-y-1.5 mb-6">
            <li className="flex gap-2"><Icon name="Timer" size={16} className="text-cyan-300 flex-shrink-0 mt-0.5" />Нажмите «Начать» и читайте текст в обычном темпе</li>
            <li className="flex gap-2"><Icon name="MousePointerClick" size={16} className="text-cyan-300 flex-shrink-0 mt-0.5" />Дочитали — нажмите «Готово»</li>
            <li className="flex gap-2"><Icon name="ListChecks" size={16} className="text-cyan-300 flex-shrink-0 mt-0.5" />Ответьте на 3 вопроса — проверим понимание</li>
          </ul>
          <button onClick={start} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-7 py-3.5 rounded-2xl hover:opacity-90 transition-opacity">
            <Icon name="Play" size={18} /> Начать тест
          </button>
        </div>
      )}

      {stage === "reading" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-montserrat font-black text-white text-lg">{item.title}</p>
            <span className="inline-flex items-center gap-1.5 text-cyan-200 text-sm font-bold bg-cyan-500/10 border border-cyan-400/25 rounded-full px-3 py-1">
              <Icon name="Timer" size={14} /> {elapsed} с
            </span>
          </div>
          <p className="text-white text-lg md:text-xl leading-relaxed mb-6 select-none">{item.text}</p>
          <button onClick={finishReading} className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-3.5 rounded-2xl transition-colors">
            <Icon name="Check" size={18} /> Готово, прочитал(а)
          </button>
        </div>
      )}

      {stage === "questions" && (
        <div>
          <p className="text-white/60 text-sm mb-4">Текст скрыт. Ответьте по памяти:</p>
          <div className="space-y-5 mb-6">
            {item.questions.map((q, qi) => (
              <div key={q.q}>
                <p className="text-white font-bold mb-2">{qi + 1}. {q.q}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((o, oi) => (
                    <button
                      key={o}
                      onClick={() => setAnswers((a) => { const n = [...a]; n[qi] = oi; return n; })}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                        answers[qi] === oi ? "bg-violet-500/30 border-violet-400/60 text-white" : "bg-white/[0.04] border-white/10 text-white/75 hover:border-white/25"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={submit}
            disabled={answers.filter((a) => a !== undefined).length < item.questions.length || saving}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-7 py-3.5 rounded-2xl disabled:opacity-40 transition-opacity"
          >
            {saving ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="BarChart3" size={18} />}
            Узнать результат
          </button>
        </div>
      )}

      {stage === "result" && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl bg-violet-500/15 border border-violet-400/30 p-4 text-center">
              <p className="font-montserrat font-black text-3xl md:text-4xl text-white">{wpm}</p>
              <p className="text-white/60 text-xs mt-1">слов в минуту</p>
            </div>
            <div className="rounded-2xl bg-cyan-500/15 border border-cyan-400/30 p-4 text-center">
              <p className="font-montserrat font-black text-3xl md:text-4xl text-white">{comprehension}%</p>
              <p className="text-white/60 text-xs mt-1">понимание</p>
            </div>
          </div>
          {norm && (
            <p className="text-white/65 text-sm mb-2">
              Ориентир ({norm.label}): <b className="text-white">{norm.min}–{norm.max} слов в минуту</b>.
            </p>
          )}
          <p className="text-white/80 text-sm mb-5">{verdict()}</p>
          {comprehension < 70 && (
            <p className="text-amber-200/90 text-sm mb-5">Понимание ниже 70% — стоит читать чуть медленнее и обсуждать прочитанное.</p>
          )}
          <button onClick={() => setStage("choose")} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold">
            <Icon name="RotateCcw" size={15} /> Пройти ещё раз
          </button>
        </div>
      )}
    </div>
  );
}
