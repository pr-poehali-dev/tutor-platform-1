import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { Word, shuffle, speak } from "./progress";

export interface QuizItem {
  id: string;
  word: Word;
}

interface Props {
  items: QuizItem[];
  pool: Word[];
  lang: string;
  title: string;
  passPercent?: number;
  onAnswer?: (id: string, correct: boolean) => void;
  onFinish: (correct: number, total: number) => void;
}

/** Тест «выберите перевод»: 4 варианта, половина вопросов — с русского, половина — на русский. */
export default function QuizRun({ items, pool, lang, title, passPercent, onAnswer, onFinish }: Props) {
  const questions = useMemo(
    () =>
      items.map((it, i) => {
        const reverse = i % 2 === 1;
        const others = shuffle(pool.filter((w) => w.ru !== it.word.ru)).slice(0, 3);
        const options = shuffle([it.word, ...others]);
        return { ...it, reverse, options };
      }),
    [items, pool],
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const q = questions[idx];
  if (!q) return null;
  const answered = picked !== null;
  const isRight = answered && q.options[picked].ru === q.word.ru;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    const ok = q.options[i].ru === q.word.ru;
    if (ok) setCorrect((c) => c + 1);
    onAnswer?.(q.id, ok);
    if (!q.reverse || ok) speak(q.word.w, lang);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      onFinish(correct, questions.length);
      return;
    }
    setIdx(idx + 1);
    setPicked(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-xs text-white/50">
        <span className="font-bold uppercase tracking-wide text-amber-300">{title}</span>
        <span>
          {idx + 1} / {questions.length}
          {passPercent ? ` · порог ${passPercent}%` : ""}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 mb-5 overflow-hidden">
        <div className="h-full bg-amber-400 transition-all" style={{ width: `${(idx / questions.length) * 100}%` }} />
      </div>

      <div className="text-center mb-5">
        <p className="text-white/45 text-xs mb-1">{q.reverse ? "Что это значит?" : "Как сказать?"}</p>
        <p className="font-montserrat font-black text-2xl md:text-3xl text-white">{q.reverse ? q.word.w : q.word.ru}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {q.options.map((o, i) => {
          const right = o.ru === q.word.ru;
          const state = !answered ? "idle" : right ? "right" : i === picked ? "wrong" : "idle";
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className={`text-left rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                state === "right"
                  ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
                  : state === "wrong"
                    ? "border-rose-400/60 bg-rose-500/15 text-rose-100"
                    : "border-white/12 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              }`}
            >
              {q.reverse ? o.ru : o.w}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <p className={`text-sm font-semibold ${isRight ? "text-emerald-300" : "text-rose-300"}`}>
            {isRight ? "Верно" : `Правильно: ${q.word.w} — ${q.word.ru}`}
            {q.word.tr ? <span className="text-white/45 font-normal"> · [{q.word.tr}]</span> : null}
          </p>
          <button
            onClick={next}
            className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-amber-300"
          >
            {idx + 1 >= questions.length ? "Итог" : "Дальше"}
            <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
