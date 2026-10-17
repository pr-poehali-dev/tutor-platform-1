import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { EXAM_TASKS, SUBJECTS, ExamTask } from "@/data/examBank";
import { isCorrect, MaxSummary, sendAnswer } from "./maxApi";
import { haptic } from "./maxBridge";

function mskDayIndex(): number {
  const msk = new Date(Date.now() + 3 * 3600 * 1000);
  return Math.floor(msk.getTime() / 86400000);
}

/** Задание дня одинаково для всех в течение суток по Москве: ОГЭ для 5–9 класса, ЕГЭ для 10–11. */
function dailyTask(grade?: string | null): ExamTask {
  const senior = Number(grade) >= 10;
  const pool = EXAM_TASKS.filter((t) => (senior ? t.exam !== "ОГЭ" : t.exam === "ОГЭ"));
  const list = pool.length ? pool : EXAM_TASKS;
  return list[(mskDayIndex() * 7919) % list.length];
}

function TaskCard({ task, token, isDaily, onDone }: { task: ExamTask; token: string | null; isDaily: boolean; onDone: (ok: boolean) => void }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const subject = SUBJECTS.find((s) => s.id === task.subject);

  const check = () => {
    if (!value.trim() || result !== null) return;
    const ok = isCorrect(value, task.answer);
    haptic(ok ? "light" : "medium");
    setResult(ok);
    if (token) sendAnswer(token, { task_id: task.id, subject: task.subject, exam: task.exam, topic: task.topic, correct: ok, is_daily: isDaily });
    onDone(ok);
  };

  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full px-2.5 py-1 font-semibold" style={{ background: `${subject?.accent}26`, color: subject?.accent }}>
          {subject?.name}
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">
          {task.exam} · №{task.taskNumber}
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">{task.topic}</span>
      </div>
      <p className="whitespace-pre-line text-[15px] leading-relaxed">{task.question}</p>

      {result === null ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
          className="flex gap-2"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Твой ответ"
            className="h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-base outline-none focus:border-primary/60"
          />
          <button type="submit" disabled={!value.trim()} className="h-12 shrink-0 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-40">
            Проверить
          </button>
        </form>
      ) : (
        <div className={`rounded-2xl px-4 py-3 text-sm ${result ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-400/15 text-amber-100"}`}>
          <p className="font-semibold">{result ? "Верно!" : `Пока нет. Правильный ответ: ${task.answer}`}</p>
        </div>
      )}

      {result !== null && (
        <button onClick={() => setShowSolution((v) => !v)} className="flex items-center gap-1 text-sm font-semibold text-primary">
          <Icon name={showSolution ? "ChevronUp" : "ChevronDown"} size={16} />
          {showSolution ? "Скрыть разбор" : "Разбор и частые ошибки"}
        </button>
      )}
      {showSolution && (
        <div className="space-y-3 text-sm leading-relaxed text-white/80">
          <p className="rounded-2xl bg-white/[0.05] p-3">{task.theory}</p>
          <ol className="list-decimal space-y-1 pl-5">
            {task.solution.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {task.mistakes.length > 0 && (
            <div>
              <p className="mb-1 font-semibold text-white">Где ошибаются</p>
              <ul className="list-disc space-y-1 pl-5 text-white/70">
                {task.mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExamTab({ token, grade, summary, onAnswered }: { token: string | null; grade?: string | null; summary: MaxSummary | null; onAnswered: () => void }) {
  const today = useMemo(() => dailyTask(grade), [grade]);
  const [subject, setSubject] = useState<string>("");
  const [practice, setPractice] = useState<ExamTask | null>(null);
  const [seed, setSeed] = useState(0);
  const dailyDone = summary?.daily.done;

  const nextPractice = () => {
    const senior = Number(grade) >= 10;
    const pool = EXAM_TASKS.filter((t) => (!subject || t.subject === subject) && (senior ? t.exam !== "ОГЭ" : t.exam === "ОГЭ"));
    const list = pool.length ? pool : EXAM_TASKS.filter((t) => !subject || t.subject === subject);
    setPractice(list[Math.floor(Math.random() * list.length)]);
    setSeed((s) => s + 1);
  };

  const topics = (summary?.topics || []).slice(0, 8);

  return (
    <div className="space-y-5 px-4 pb-6 pt-4">
      <div>
        <h1 className="text-xl font-bold">{Number(grade) >= 10 ? "ЕГЭ" : "ОГЭ"}</h1>
        <p className="text-xs text-white/50">Реальные форматы заданий 2020–2025</p>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <Icon name="CalendarCheck" size={18} className="text-amber-300" />
            Задание дня
          </h2>
          {summary && summary.stats.streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-200">
              <Icon name="Flame" size={13} />
              {summary.stats.streak} дн. подряд
            </span>
          )}
        </div>
        {dailyDone ? (
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm">
            <p className="font-semibold text-emerald-200">{summary?.daily.correct ? "Задание дня решено верно!" : "Задание дня сделано."}</p>
            <p className="mt-1 text-white/60">Новое задание — завтра. А пока можно потренироваться ниже.</p>
          </div>
        ) : (
          <TaskCard task={today} token={token} isDaily onDone={onAnswered} />
        )}
      </section>

      <section>
        <h2 className="mb-2 font-bold">Тренировка</h2>
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <button onClick={() => setSubject("")} className={`shrink-0 rounded-full px-3.5 py-2 text-sm ${!subject ? "bg-white text-background" : "bg-white/10 text-white/75"}`}>
            Все
          </button>
          {SUBJECTS.map((s) => (
            <button key={s.id} onClick={() => setSubject(s.id)} className={`shrink-0 rounded-full px-3.5 py-2 text-sm ${subject === s.id ? "bg-white text-background" : "bg-white/10 text-white/75"}`}>
              {s.name}
            </button>
          ))}
        </div>
        {practice && <TaskCard key={seed} task={practice} token={token} isDaily={false} onDone={onAnswered} />}
        <button onClick={nextPractice} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 font-semibold">
          <Icon name="Shuffle" size={18} />
          {practice ? "Следующее задание" : "Случайное задание"}
        </button>
      </section>

      <section>
        <h2 className="mb-2 font-bold">Прогресс по темам</h2>
        {!topics.length ? (
          <p className="rounded-2xl bg-white/[0.04] p-4 text-sm text-white/55">Реши пару заданий — здесь появятся темы, которые уже получаются, и те, что стоит подтянуть.</p>
        ) : (
          <div className="space-y-2">
            {topics.map((t) => {
              const pct = Math.round((t.correct / t.total) * 100);
              return (
                <div key={t.subject + t.topic} className="rounded-2xl bg-white/[0.04] p-3">
                  <div className="mb-1.5 flex justify-between gap-3 text-sm">
                    <span className="truncate">{t.topic}</span>
                    <span className="shrink-0 text-white/55">
                      {t.correct}/{t.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
