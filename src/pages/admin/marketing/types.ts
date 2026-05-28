export const PIN_KEY = "uchispro_admin_pin_v1";

export const PERIODS = [
  { id: 7, label: "7 дней" },
  { id: 30, label: "30 дней" },
  { id: 90, label: "90 дней" },
];

export interface Metrics {
  period_days: number;
  revenue: number;
  prev_revenue: number;
  revenue_growth_pct: number | null;
  paid_orders: number;
  unique_buyers: number;
  new_users: number;
  all_users: number;
  leads: number;
  started_checkout: number;
  aov: number;
  conv_reg_to_buy: number;
  conv_start_to_paid: number;
  repeat_buyers: number;
  arpu: number;
}

export interface Swot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface FunnelStage { key: string; label: string; count: number }
export interface FunnelData { stages: FunnelStage[]; bottleneck: { from: string; to: string; drop_pct: number; lost: number } | null }

export interface Cohort {
  week_start: string;
  size: number;
  returned: number;
  retention_pct: number;
  bought: number;
  conv_pct: number;
}

export interface RfmItem { label: string; count: number; color: string; hint: string }

export interface Idea {
  title: string;
  description: string;
  effort: "low" | "medium" | "high";
  impact: string;
  priority: number;
}

export interface Plan {
  week1: string[]; week2: string[]; week3: string[]; week4: string[];
}

export interface Analysis {
  metrics: Metrics;
  swot: Swot;
  funnel: FunnelData;
  cohorts: { cohorts: Cohort[]; avg_retention_pct: number };
  rfm: Record<string, RfmItem>;
  ideas: Idea[];
  plan: Plan;
}

export interface MktTask {
  id: number;
  title: string;
  description: string | null;
  assigned_to: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done" | "cancelled";
  created_at: string;
  due_date: string | null;
}

export interface AiResult {
  strategy_id?: number;
  ai?: {
    summary: string;
    top_priority: string;
    recommendations: { title: string; action: string; impact_rub: number; deadline_days: number }[];
    tasks_for_sales: { title: string; description: string; priority: string }[];
  };
  parsed?: boolean;
  raw_text?: string;
}

export function rub(n: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
}
export function num(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export const PRIORITY_COLOR: Record<string, string> = {
  high: "border-rose-400/40 text-rose-200 bg-rose-500/10",
  medium: "border-amber-400/40 text-amber-200 bg-amber-500/10",
  low: "border-white/15 text-white/60 bg-white/5",
};
export const STATUS_COLOR: Record<string, string> = {
  todo: "border-white/15 text-white/70 bg-white/5",
  in_progress: "border-cyan-400/40 text-cyan-200 bg-cyan-500/10",
  done: "border-emerald-400/40 text-emerald-200 bg-emerald-500/10",
  cancelled: "border-white/10 text-white/40 bg-white/3",
};
export const STATUS_LABEL: Record<string, string> = {
  todo: "К работе", in_progress: "В работе", done: "Готово", cancelled: "Отменена",
};
export const EFFORT_LABEL: Record<string, string> = {
  low: "Лёгкая", medium: "Средняя", high: "Сложная",
};
