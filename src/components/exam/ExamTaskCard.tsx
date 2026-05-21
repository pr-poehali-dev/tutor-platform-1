import { useState } from "react";
import Icon from "@/components/ui/icon";
import { ExamTask, SUBJECTS } from "@/data/examBank";

type Tab = "theory" | "solution" | "mistakes";

interface ExamTaskCardProps {
  task: ExamTask;
}

const DIFFICULTY_COLOR: Record<ExamTask["difficulty"], string> = {
  "лёгкое": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "среднее": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "сложное": "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function ExamTaskCard({ task }: ExamTaskCardProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("theory");
  const [revealed, setRevealed] = useState(false);

  const subject = SUBJECTS.find((s) => s.id === task.subject)!;

  return (
    <div
      className="rounded-3xl border border-white/8 bg-card/40 hover:border-white/20 transition-all overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${subject.accent}08, transparent)` }}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
            style={{
              background: `${subject.accent}20`,
              borderColor: `${subject.accent}40`,
              color: subject.accent,
            }}
          >
            <Icon name={subject.icon} size={12} />
            {subject.name}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/6 border border-white/10 text-white/80">
            {task.exam}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/6 border border-white/10 text-white/60">
            {task.year} г.
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/6 border border-white/10 text-white/60">
            № {task.taskNumber}
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${DIFFICULTY_COLOR[task.difficulty]}`}
          >
            {task.difficulty}
          </span>
        </div>

        <p className="text-white/50 text-xs mb-2 font-medium">Тема: {task.topic}</p>
        <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">{task.question}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setRevealed((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-sm text-white/80 transition-colors"
          >
            <Icon name={revealed ? "EyeOff" : "Eye"} size={14} />
            {revealed ? "Скрыть ответ" : "Показать ответ"}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: open ? `${subject.accent}30` : `${subject.accent}18`,
              color: subject.accent,
              border: `1px solid ${subject.accent}40`,
            }}
          >
            <Icon name={open ? "ChevronUp" : "BookOpen"} size={14} />
            {open ? "Свернуть разбор" : "Разбор задания"}
          </button>
        </div>

        {revealed && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-fade-in">
            <p className="text-emerald-300 text-xs font-semibold mb-1">Правильный ответ</p>
            <p className="text-emerald-100 text-sm whitespace-pre-wrap">{task.answer}</p>
          </div>
        )}
      </div>

      {open && (
        <div className="border-t border-white/8 animate-fade-in">
          <div className="px-5 pt-4 flex gap-2 flex-wrap">
            {[
              { id: "theory" as Tab, label: "Теория", icon: "GraduationCap" },
              { id: "solution" as Tab, label: "Пошаговое решение", icon: "ListChecks" },
              { id: "mistakes" as Tab, label: "Типичные ошибки", icon: "AlertTriangle" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  tab === t.id
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-transparent text-white/50 border-transparent hover:text-white/80"
                }`}
              >
                <Icon name={t.icon} size={13} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="px-5 py-4">
            {tab === "theory" && (
              <div className="rounded-2xl bg-blue-500/8 border border-blue-500/20 p-4">
                <p className="text-blue-200/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {task.theory}
                </p>
              </div>
            )}

            {tab === "solution" && (
              <ol className="flex flex-col gap-2">
                {task.solution.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 p-3 rounded-xl bg-white/4 border border-white/8"
                  >
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-montserrat font-bold text-xs text-white"
                      style={{ background: subject.accent }}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed flex-1 pt-0.5 whitespace-pre-wrap">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            {tab === "mistakes" && (
              <ul className="flex flex-col gap-2">
                {task.mistakes.map((mistake, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 p-3 rounded-xl bg-rose-500/8 border border-rose-500/20"
                  >
                    <Icon
                      name="AlertTriangle"
                      size={16}
                      className="text-rose-300 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-rose-100/90 text-sm leading-relaxed flex-1">{mistake}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
