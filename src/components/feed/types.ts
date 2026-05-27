export type FeedCategory = "science" | "culture" | "education" | "robots" | "ai" | "grants";

export interface FeedArticle {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content?: string;
  category: FeedCategory;
  cover_url: string | null;
  source_kind: "agent" | "user" | "manual";
  source_name: string | null;
  source_url: string | null;
  author_display_name: string | null;
  status: "draft" | "pending" | "published" | "rejected";
  tags: string[];
  reading_time_min: number;
  views: number;
  likes: number;
  published_at: string | null;
  created_at: string;
  rejected_reason?: string | null;
  auto_moderation_score?: number | null;
  auto_moderation_verdict?: "approve" | "reject" | "flag" | null;
  auto_moderation_reasoning?: string | null;
  auto_moderation_at?: string | null;
  source_language?: string | null;
  source_country?: string | null;
}

export interface FeedListResponse {
  items: FeedArticle[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
  category_counts: Partial<Record<FeedCategory, number>>;
}

export const CATEGORY_META: Record<FeedCategory, { label: string; emoji: string; tone: string; gradient: string }> = {
  science:   { label: "Наука",                    emoji: "🔬", tone: "text-cyan-300 bg-cyan-500/15 border-cyan-500/35",     gradient: "from-cyan-500/20 to-blue-500/10" },
  culture:   { label: "Культура",                 emoji: "🎭", tone: "text-pink-300 bg-pink-500/15 border-pink-500/35",     gradient: "from-pink-500/20 to-rose-500/10" },
  education: { label: "Образование",              emoji: "📚", tone: "text-amber-300 bg-amber-500/15 border-amber-500/35", gradient: "from-amber-500/20 to-orange-500/10" },
  robots:    { label: "Роботы",                   emoji: "🤖", tone: "text-emerald-300 bg-emerald-500/15 border-emerald-500/35", gradient: "from-emerald-500/20 to-teal-500/10" },
  ai:        { label: "ИИ и нейросети",           emoji: "🧠", tone: "text-purple-300 bg-purple-500/15 border-purple-500/35", gradient: "from-purple-500/20 to-fuchsia-500/10" },
  grants:    { label: "Конкурсы и гранты",        emoji: "🏆", tone: "text-yellow-300 bg-yellow-500/15 border-yellow-500/35", gradient: "from-yellow-500/20 to-orange-500/10" },
};