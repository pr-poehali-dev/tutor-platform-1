import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  ChecklistTask,
  ChecklistCategory,
  CATEGORY_LABELS,
} from "./checklistTasks";
import { SUBJECTS } from "@/components/graduate/graduateData";

interface Props {
  category: ChecklistCategory;
  tasks: ChecklistTask[];
  doneSet: Set<string>;
  onToggle: (taskId: string, done: boolean) => void;
}

const IMPORTANCE_DOT: Record<NonNullable<ChecklistTask["importance"]>, string> = {
  critical: "bg-rose-400",
  high: "bg-amber-400",
  normal: "bg-emerald-400",
};

function formatDeadline(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("ru-RU", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch {
    return null;
  }
}

function daysLeft(iso?: string): number | null {
  if (!iso) return null;
  const t = new Date(iso + "T00:00:00").getTime();
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function ChecklistGroup({ category, tasks, doneSet, onToggle }: Props) {
  const [open, setOpen] = useState(true);
  const meta = CATEGORY_LABELS[category];

  const stats = useMemo(() => {
    const done = tasks.filter((t) => doneSet.has(t.id)).length;
    return { done, total: tasks.length, pct: tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100) };
  }, [tasks, doneSet]);

  if (tasks.length === 0) return null;

  return (
    <section className={`bg-gradient-to-br border rounded-3xl p-4 md:p-5 ${meta.color}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 mb-3 text-left"
        aria-expanded={open}
      >
        <div className="text-2xl md:text-3xl">{meta.emoji}</div>
        <div className="min-w-0 flex-1">
          <p className="font-montserrat font-black text-white text-base md:text-lg leading-tight">{meta.label}</p>
          <p className="text-white/65 text-[11px] mt-0.5">
            {stats.done} из {stats.total} выполнено · {stats.pct}%
          </p>
        </div>
        <div className="w-24 hidden md:block">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/70 transition-all"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
        <Icon
          name="ChevronDown"
          size={16}
          className={`text-white/65 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-2">
          {tasks.map((task) => {
            const done = doneSet.has(task.id);
            const deadlineStr = formatDeadline(task.deadline);
            const left = daysLeft(task.deadline);
            const isOverdue = left !== null && left < 0 && !done;
            const isUrgent = left !== null && left >= 0 && left <= 14 && !done;
            const subj = task.subject ? SUBJECTS[task.subject] : null;

            return (
              <div
                key={task.id}
                className={`bg-white/[0.04] border rounded-2xl p-3 transition-all ${
                  done ? "border-emerald-500/40 bg-emerald-500/[0.05] opacity-75" :
                  isOverdue ? "border-rose-500/50 bg-rose-500/[0.07]" :
                  isUrgent ? "border-amber-500/40" :
                  "border-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggle(task.id, !done)}
                    aria-label={done ? "Отметить как невыполненное" : "Отметить как выполненное"}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 ${
                      done
                        ? "bg-emerald-500 border-emerald-400"
                        : "border-white/35 hover:border-white/65 hover:bg-white/8"
                    }`}
                  >
                    {done && <Icon name="Check" size={14} className="text-white" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 flex-wrap mb-1">
                      <p className={`font-montserrat font-bold text-sm leading-tight ${done ? "text-white/55 line-through" : "text-white"}`}>
                        {task.title}
                      </p>
                      {task.importance && (
                        <span className="flex items-center gap-1 text-[10px] text-white/55 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${IMPORTANCE_DOT[task.importance]}`} />
                          {task.importance === "critical" ? "Критично" : task.importance === "high" ? "Важно" : "Обычное"}
                        </span>
                      )}
                      {subj && (
                        <span className="inline-flex items-center gap-1 bg-white/8 border border-white/12 text-white/75 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {subj.emoji} {subj.label}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${done ? "text-white/45" : "text-white/65"}`}>
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap text-[11px]">
                      {deadlineStr && (
                        <span className={`flex items-center gap-1 font-bold ${
                          isOverdue ? "text-rose-300" :
                          isUrgent ? "text-amber-300" :
                          "text-white/45"
                        }`}>
                          <Icon name="CalendarDays" size={11} />
                          {isOverdue
                            ? `Просрочено на ${Math.abs(left!)} дн.`
                            : left !== null && left === 0 ? "Сегодня"
                            : left !== null && left > 0 ? `Через ${left} дн. · ${deadlineStr}`
                            : deadlineStr}
                        </span>
                      )}
                      {task.estimatedHours && (
                        <span className="flex items-center gap-1 text-white/45">
                          <Icon name="Clock" size={11} />
                          ~{task.estimatedHours} ч
                        </span>
                      )}
                      {task.link && !done && (
                        <Link
                          to={task.link}
                          className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 font-bold"
                        >
                          Перейти
                          <Icon name="ArrowRight" size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
