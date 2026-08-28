import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitAgentFeedback } from "@/components/courses/feedbackApi";

/**
 * Оценка урока учеником — топливо для саморазвития ИИ-агентов.
 *
 * Зачем: механизм самоулучшения (ai-evolve) переписывает промпт агента
 * на основе оценок и комментариев учеников. Без этих оценок таблица
 * content_feedback пуста, порог в 5 отзывов не набирается никогда,
 * и саморазвитие не запускается — сколько бы кода под ним ни лежало.
 *
 * Показывается на экране «Урок пройден». Одно нажатие — оценка ушла,
 * дальше можно (по желанию) добавить комментарий.
 */

interface Props {
  agentKey?: string;
  lessonTitle: string;
  subject?: string;
  grade?: string;
  topic?: string;
  accent: string;
}

export default function LessonFeedback({
  agentKey = "lesson_teacher",
  lessonTitle,
  subject,
  grade,
  topic,
  accent,
}: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const send = async (stars: number, text?: string) => {
    setRating(stars);
    await submitAgentFeedback({
      agent_key: agentKey,
      rating: stars,
      is_helpful: stars >= 4,
      comment: text,
      content_type: "lesson",
      content_id: lessonTitle.slice(0, 120),
      subject,
      grade,
      topic: topic || lessonTitle,
    });
    if (text !== undefined) setSent(true);
    else setShowComment(stars <= 3);
    if (stars >= 4) setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <Icon name="CircleCheck" size={18} className="text-emerald-400 flex-shrink-0" />
        <p className="text-emerald-100/90 text-sm text-left">
          Спасибо! Оценка учтена — преподаватель станет лучше объяснять эту тему.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-4 mb-4">
      <p className="text-white/80 text-sm font-bold mb-1">Как объяснил преподаватель?</p>
      <p className="text-white/45 text-xs mb-3">Оценка помогает ИИ стать понятнее</p>

      <div className="flex items-center justify-center gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="p-1.5 rounded-lg hover:bg-white/8 transition-colors"
            aria-label={`Оценка ${s}`}
          >
            <Icon
              name="Star"
              size={26}
              className={`transition-colors ${
                rating !== null && s <= rating ? "text-amber-400" : "text-white/25"
              }`}
            />
          </button>
        ))}
      </div>

      {showComment && (
        <div className="mt-3 animate-fade-in">
          <p className="text-white/60 text-xs mb-2 text-left">
            Что было непонятно? Это увидит ИИ-методист и исправит объяснение.
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Например: слишком быстро, мало примеров…"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/25 resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => send(rating || 3, comment)}
              className="flex-1 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              Отправить
            </button>
            <button
              onClick={() => setSent(true)}
              className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Пропустить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}