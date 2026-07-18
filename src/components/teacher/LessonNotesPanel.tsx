import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { LessonNotes } from "./lessonTypes";

interface Props {
  notes: LessonNotes;
  accent: string;
  bigText?: boolean;
}

type Tab = "theory" | "examples" | "practice";

/**
 * Выверенный конспект урока: теория, формулы, разобранные примеры и задачи.
 * Показывается над чатом с наставником — ученик учится по реальному материалу,
 * а не только по ответам ИИ.
 */
export default function LessonNotesPanel({ notes, accent, bigText }: Props) {
  const [tab, setTab] = useState<Tab>("theory");
  const [open, setOpen] = useState(true);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const textSize = bigText ? "text-base" : "text-sm";

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "theory", label: "Теория", icon: "BookOpen" },
    { id: "examples", label: "Примеры", icon: "PencilRuler" },
    { id: "practice", label: "Практика", icon: "Target" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-card/50 mb-3 overflow-hidden">
      {/* Заголовок */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
        style={{ background: `${accent}10` }}
      >
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}22`, color: accent }}
        >
          <Icon name="GraduationCap" size={16} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-white text-sm">Конспект урока</span>
          <span className="block text-white/50 text-xs truncate">{notes.summary}</span>
        </span>
        <Icon
          name="ChevronDown"
          size={16}
          className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {/* Вкладки */}
          <div className="flex gap-1.5 py-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  tab === t.id ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
                style={tab === t.id ? { background: `${accent}25` } : { background: "rgba(255,255,255,0.04)" }}
              >
                <Icon name={t.icon} size={13} />
                {t.label}
              </button>
            ))}
          </div>

          <div className={`${textSize} text-white/80 leading-relaxed max-h-[280px] overflow-y-auto pr-1`}>
            {/* ТЕОРИЯ */}
            {tab === "theory" && (
              <div className="space-y-3">
                {notes.theory.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {notes.formulas && notes.formulas.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Формулы</p>
                    {notes.formulas.map((f, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-black/25 px-3 py-2"
                      >
                        <p className="font-mono font-bold" style={{ color: accent }}>
                          {f.expr}
                        </p>
                        <p className="text-white/55 text-xs mt-0.5">{f.note}</p>
                      </div>
                    ))}
                  </div>
                )}
                {notes.mistakes && notes.mistakes.length > 0 && (
                  <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2.5">
                    <p className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1.5">
                      <Icon name="TriangleAlert" size={13} />
                      Частые ошибки
                    </p>
                    <ul className="space-y-1 text-white/70 text-xs">
                      {notes.mistakes.map((m, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span style={{ color: accent }}>•</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ПРИМЕРЫ */}
            {tab === "examples" && (
              <div className="space-y-3">
                {notes.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-bold text-white mb-2">
                      Пример {i + 1}. {ex.problem}
                    </p>
                    <ol className="space-y-1.5 mb-2">
                      {ex.solution.map((s, j) => (
                        <li key={j} className="flex gap-2">
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center"
                            style={{ background: `${accent}22`, color: accent }}
                          >
                            {j + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="text-sm font-bold" style={{ color: accent }}>
                      Ответ: {ex.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ПРАКТИКА */}
            {tab === "practice" && (
              <div className="space-y-2.5">
                {notes.practice.map((task, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-bold text-white mb-1.5">
                      Задача {i + 1}. {task.question}
                    </p>
                    {task.hint && (
                      <p className="text-white/45 text-xs mb-2">Подсказка: {task.hint}</p>
                    )}
                    {revealed[i] ? (
                      <p className="text-sm font-bold" style={{ color: accent }}>
                        Ответ: {task.answer}
                      </p>
                    ) : (
                      <button
                        onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        Показать ответ
                      </button>
                    )}
                  </div>
                ))}
                <p className="text-white/40 text-xs pt-1">
                  Реши сам, затем спроси наставника в чате, если что-то непонятно.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
