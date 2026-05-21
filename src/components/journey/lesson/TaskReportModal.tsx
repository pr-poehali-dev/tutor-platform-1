import { useState } from "react";
import Icon from "@/components/ui/icon";
import { LEARNING_PATH_URL, Task } from "@/components/journey/journeyData";

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task;
  subject: string;
  topic: string;
  grade: string;
  lessonTitle?: string;
  userAnswer?: string;
  accent?: string;
}

const REASONS = [
  { id: "no_correct_in_options", label: "Среди вариантов нет правильного ответа" },
  { id: "wrong_correct_marked", label: "Правильным помечен неверный вариант" },
  { id: "ambiguous", label: "Несколько вариантов могут быть верны" },
  { id: "unclear_question", label: "Непонятная формулировка вопроса" },
  { id: "typo", label: "Опечатка или ошибка в тексте" },
  { id: "wrong_topic", label: "Задача не по теме урока" },
  { id: "other", label: "Другое" },
];

export default function TaskReportModal({
  open,
  onClose,
  task,
  subject,
  topic,
  grade,
  lessonTitle = "",
  userAnswer = "",
  accent = "#a855f7",
}: Props) {
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    if (!reason) {
      setError("Выбери проблему из списка");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "report_task",
          subject,
          topic,
          grade,
          lesson_title: lessonTitle,
          task_id: task.task_id || "",
          task_type: task.type,
          question: task.question,
          options: task.options || [],
          correct_answer: String(task.correct_answer),
          user_answer: userAnswer,
          reason,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось отправить");
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
        setReason("");
        setComment("");
      }, 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 md:p-7 w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-8 animate-fade-in">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
            >
              <Icon name="Check" size={32} className="text-white" />
            </div>
            <p className="text-white text-xl font-bold mb-1">Спасибо!</p>
            <p className="text-white/65 text-sm">
              Жалоба отправлена — разработчик разберёт её и исправит задачу.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
                >
                  <Icon name="Flag" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-montserrat font-bold text-lg leading-tight">
                    Сообщить об ошибке
                  </h3>
                  <p className="text-white/55 text-xs mt-0.5">
                    Поможет улучшить задачи для других учеников
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Icon name="X" size={16} className="text-white/70" />
              </button>
            </div>

            {/* Превью задачи */}
            <div className="bg-white/6 border border-white/10 rounded-2xl p-3 mb-4">
              <p className="text-white/45 text-[10px] uppercase tracking-widest font-bold mb-1">
                Задача
              </p>
              <p className="text-white text-sm leading-relaxed line-clamp-3">{task.question}</p>
            </div>

            {/* Причины */}
            <div className="mb-4">
              <p className="text-white/80 text-sm font-bold mb-2">Что не так?</p>
              <div className="space-y-1.5">
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    aria-pressed={reason === r.id}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border ${
                      reason === r.id
                        ? "border-white/30 bg-white/12 text-white"
                        : "border-white/8 bg-white/4 hover:bg-white/8 text-white/75"
                    }`}
                    style={reason === r.id ? { borderColor: accent + "90" } : {}}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          reason === r.id ? "" : "border-white/30"
                        }`}
                        style={reason === r.id ? { borderColor: accent, background: accent } : {}}
                      >
                        {reason === r.id && <Icon name="Check" size={10} className="text-white" />}
                      </span>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Комментарий */}
            <div className="mb-5">
              <label className="text-white/80 text-sm font-bold mb-2 block">
                Комментарий <span className="text-white/40 font-normal">(необязательно)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Например: правильный ответ должен быть 17, а в вариантах только 11-14"
                rows={3}
                maxLength={1000}
                className="w-full bg-white/5 border border-white/15 focus:border-white/30 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/35 resize-none outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-4 text-red-200 text-xs">
                {error}
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={sending}
                className="flex-1 h-11 rounded-xl bg-white/8 hover:bg-white/15 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={submit}
                disabled={sending || !reason}
                className="flex-[2] h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
              >
                {sending ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Отправляю…
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} />
                    Отправить жалобу
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
