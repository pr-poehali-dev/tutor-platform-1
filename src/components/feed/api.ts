import func2url from "../../../backend/func2url.json";
import { FeedArticle, FeedCategory, FeedListResponse } from "./types";

const FEED_URL = (func2url as Record<string, string>)["feed"];
const CURATOR_URL = (func2url as Record<string, string>)["feed-curator"];

/** Авто-запуск парсера если лента пустая (на бэке стоит rate-limit 30 мин). */
export async function seedIfEmpty(): Promise<{ ok: boolean; auto_seeded?: boolean; fetched?: number }> {
  try {
    const res = await fetch(`${CURATOR_URL}?action=seed_if_empty`);
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

/** Часовой освежитель ленты (заменяет нерабочий Vercel-cron).
 *  Вызывается при заходе на /feed. На бэке стоит rate-limit 25 минут —
 *  значит реальное обновление произойдёт не чаще раза в 25 минут,
 *  даже если страницу открывает тысячи людей одновременно.
 *  Старые статьи НЕ удаляются. */
export async function keepAlive(): Promise<{
  ok: boolean; topup_created?: number; action_taken?: string; skipped?: boolean;
}> {
  try {
    const res = await fetch(`${CURATOR_URL}?action=keep_alive`);
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

// ─── Health-monitor ──────────────────────────────────────────────────
export interface FeedHealthAlert {
  severity: "critical" | "warning" | "info" | string;
  type: string;
  title: string;
  body: string;
  created_at: string | null;
}

export interface FeedHealth {
  status: "ok" | "warning" | "critical" | string;
  metrics: {
    total_published: number;
    fresh_24h: number;
    sources_active: number;
    sources_disabled: number;
  };
  alerts_count: number;
  alerts: FeedHealthAlert[];
  last_run: { kind: string | null; status: string | null; at: string | null } | null;
}

export async function fetchFeedHealth(): Promise<FeedHealth | null> {
  try {
    const res = await fetch(`${CURATOR_URL}?action=health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
const TOKEN_KEY = "uchispro_auth_token_v1";

function authToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

const ADMIN_KEY_STORAGE = "uchispro_feed_admin_key";

export function setAdminKey(key: string) {
  try { localStorage.setItem(ADMIN_KEY_STORAGE, key); } catch { /* noop */ }
}
export function getAdminKey(): string {
  try { return localStorage.getItem(ADMIN_KEY_STORAGE) || ""; } catch { return ""; }
}
export function clearAdminKey() {
  try { localStorage.removeItem(ADMIN_KEY_STORAGE); } catch { /* noop */ }
}

// ─── ПУБЛИЧНЫЕ ─────────────────────────────────────────────────────────

export async function fetchFeed(category?: FeedCategory | "all", page = 1): Promise<FeedListResponse> {
  const params = new URLSearchParams({ action: "list", page: String(page) });
  if (category && category !== "all") params.set("category", category);
  const res = await fetch(`${FEED_URL}?${params}`);
  if (!res.ok) return { items: [], page: 1, per_page: 12, total: 0, has_more: false, category_counts: {} };
  return await res.json();
}

export interface ArticleResult {
  item: FeedArticle | null;
  limited?: boolean;
  limit?: number;
  message?: string;
}

export async function fetchArticle(slug: string): Promise<ArticleResult> {
  const t = authToken();
  const headers: Record<string, string> = {};
  if (t) headers["X-Auth-Token"] = t;
  const res = await fetch(`${FEED_URL}?action=item&slug=${encodeURIComponent(slug)}`, { headers });
  if (!res.ok) return { item: null };
  const data = await res.json();
  if (data.limited) {
    return { item: null, limited: true, limit: data.limit, message: data.message };
  }
  return { item: data.item || null };
}

export interface SubmitPayload {
  title: string;
  summary: string;
  content: string;
  category: FeedCategory;
  cover_url?: string;
  source_url?: string;
  author_display_name?: string;
}

export async function submitArticle(payload: SubmitPayload):
  Promise<{ ok: boolean; message?: string; slug?: string }> {
  const t = authToken();
  if (!t) return { ok: false, message: "Войди в аккаунт, чтобы публиковать статьи" };
  try {
    const res = await fetch(`${FEED_URL}?action=submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error || "Ошибка отправки" };
    return { ok: true, message: data.message, slug: data.slug };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Сеть недоступна" };
  }
}

// ─── АДМИНСКИЕ ────────────────────────────────────────────────────────

export async function fetchPending(): Promise<FeedArticle[]> {
  const key = getAdminKey();
  if (!key) return [];
  try {
    const res = await fetch(`${FEED_URL}?action=pending`, { headers: { "X-Admin-Key": key } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function moderate(id: number, decision: "approve" | "reject", reason?: string): Promise<boolean> {
  const key = getAdminKey();
  if (!key) return false;
  const res = await fetch(`${FEED_URL}?action=moderate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": key },
    body: JSON.stringify({ id, decision, reason: reason || "" }),
  });
  return res.ok;
}

export interface SourceInfo {
  code: string;
  name: string;
  category: FeedCategory;
  rss_url: string;
  enabled: boolean;
  last_fetched_at: string | null;
  last_fetch_count: number | null;
  last_error: string | null;
  language?: string;
  country?: string;
  country_flag?: string;
  priority?: number;
}

export async function fetchSources(): Promise<SourceInfo[]> {
  const key = getAdminKey();
  if (!key) return [];
  try {
    const res = await fetch(`${CURATOR_URL}?action=sources`, { headers: { "X-Admin-Key": key } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function curatorFetchAll(limitPerSource = 3): Promise<{ ok: boolean; total_created?: number; results?: { source: string; created?: number; error?: string }[] }> {
  const key = getAdminKey();
  if (!key) return { ok: false };
  try {
    const res = await fetch(`${CURATOR_URL}?action=fetch_all`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": key },
      body: JSON.stringify({ limit: limitPerSource }),
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export async function curatorFetchOne(source_code: string, limit = 5):
  Promise<{ ok: boolean; result?: { source: string; created?: number; error?: string } }> {
  const key = getAdminKey();
  if (!key) return { ok: false };
  try {
    const res = await fetch(`${CURATOR_URL}?action=fetch_one`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": key },
      body: JSON.stringify({ source_code, limit }),
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

// ─── Автомодерация (ИИ-агент) ────────────────────────────────────────

export interface AutoModerationResult {
  ok: boolean;
  moderated?: number;
  approved?: number;
  rejected?: number;
  flagged?: number;
  details?: { id: number; title: string; verdict: string; score: number }[];
}

export async function autoModerate(limit = 20): Promise<AutoModerationResult> {
  const key = getAdminKey();
  if (!key) return { ok: false };
  try {
    const res = await fetch(`${CURATOR_URL}?action=auto_moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": key },
      body: JSON.stringify({ limit }),
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export interface CronRun {
  id: number;
  kind: string;
  status: "ok" | "error" | "running" | string;
  fetched: number;
  moderated: number;
  approved: number;
  rejected: number;
  flagged: number;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export async function fetchCronLog(): Promise<CronRun[]> {
  const key = getAdminKey();
  if (!key) return [];
  try {
    const res = await fetch(`${CURATOR_URL}?action=cron_log`, {
      headers: { "X-Admin-Key": key },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}