import func2url from "../../../backend/func2url.json";

const EVOLVE_URL = (func2url as Record<string, string>)["ai-evolve"];

/**
 * Отправка оценки урока — топливо для саморазвития ИИ-агентов.
 * Бэкенд пишет отзыв в content_feedback и при низком рейтинге
 * сам запускает пересборку промпта агента.
 *
 * Отправка тихая: если сеть недоступна, ученику не показываем ошибку —
 * оценка не критична для его учебного процесса.
 */

export interface AgentFeedback {
  agent_key: string;
  rating: number;
  is_helpful?: boolean;
  comment?: string;
  content_type?: string;
  content_id?: string;
  subject?: string;
  grade?: string;
  topic?: string;
}

export async function submitAgentFeedback(fb: AgentFeedback): Promise<boolean> {
  if (!EVOLVE_URL) return false;
  try {
    const r = await fetch(`${EVOLVE_URL}?action=feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fb),
    });
    return r.ok;
  } catch {
    return false;
  }
}
