import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["search"];

export interface SearchItem {
  kind: "page" | "feed" | "course" | "lesson";
  title: string;
  subtitle: string;
  category: string;
  emoji: string;
  url: string;
  cover_url?: string | null;
  extra?: string;
  published_at?: string | null;
  score?: number;
}

export interface SearchResponse {
  q: string;
  items: SearchItem[];
  grouped?: Partial<Record<SearchItem["kind"], SearchItem[]>>;
  total: number;
  message?: string;
}

export async function fetchSuggest(q: string, limit = 6): Promise<SearchItem[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  try {
    const res = await fetch(`${URL}?action=suggest&q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function fetchSearch(q: string, limit = 30, kind?: SearchItem["kind"]): Promise<SearchResponse> {
  const query = q.trim();
  if (query.length < 2) {
    return { q: query, items: [], total: 0, message: "Минимум 2 символа" };
  }
  const params = new URLSearchParams({ action: "search", q: query, limit: String(limit) });
  if (kind) params.set("kind", kind);
  try {
    const res = await fetch(`${URL}?${params}`);
    if (!res.ok) return { q: query, items: [], total: 0 };
    return await res.json();
  } catch {
    return { q: query, items: [], total: 0 };
  }
}
