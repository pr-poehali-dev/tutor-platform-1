import func2url from "../../../backend/func2url.json";

const TRENDS_URL = (func2url as Record<string, string>)["it-trends-analyst"];

export interface TrendDirection {
  key: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  signals_total: number;
  signals_7d: number;
  signals_30d: number;
  score: number;
  momentum: number;
  rank: number | null;
  ai_insight: string | null;
  last_article_slug: string | null;
  updated_at: string | null;
}

export interface RecentSignal {
  title: string;
  direction: string;
  source: string;
  at: string;
}

export interface MaxChannel {
  handle: string;
  name: string;
  max_url: string;
  direction: string;
  topic: string;
  emoji: string;
}

export interface TrendsDashboard {
  directions: TrendDirection[];
  channels: MaxChannel[];
  total_signals: number;
  last_signal_at: string | null;
  recent_signals: RecentSignal[];
  last_run: { kind: string; status: string; signals: number; articles: number; at: string } | null;
}

export async function fetchTrendsDashboard(): Promise<TrendsDashboard | null> {
  if (!TRENDS_URL) return null;
  try {
    const res = await fetch(`${TRENDS_URL}?action=dashboard`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Ленивый дневной запуск конвейера (резерв, если внешний cron не сработал).
 * Бэкенд сам ограничивает выполнение до 1 раза в сутки — лишних запусков не будет.
 */
export async function tickTrends(): Promise<void> {
  if (!TRENDS_URL) return;
  try {
    await fetch(`${TRENDS_URL}?action=tick`);
  } catch {
    /* тихо игнорируем — фоновая задача */
  }
}

/** Авто-посев при первом заходе: бэкенд соберёт данные, если их ещё нет (rate-limit 30 мин). */
export async function seedTrendsIfEmpty(): Promise<{ ok: boolean; auto_seeded?: boolean; signals_collected?: number }> {
  if (!TRENDS_URL) return { ok: false };
  try {
    const res = await fetch(`${TRENDS_URL}?action=seed_if_empty`);
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export async function fetchDirections(): Promise<TrendDirection[]> {
  if (!TRENDS_URL) return [];
  try {
    const res = await fetch(`${TRENDS_URL}?action=directions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.directions || [];
  } catch {
    return [];
  }
}