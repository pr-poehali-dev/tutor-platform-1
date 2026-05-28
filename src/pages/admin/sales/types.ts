export const PIN_KEY = "uchispro_admin_pin_v1";

export const PERIODS = [
  { id: 7, label: "7 дней" },
  { id: 30, label: "30 дней" },
  { id: 90, label: "90 дней" },
  { id: 365, label: "Год" },
];

export interface Kpi {
  revenue: number;
  orders: number;
  unique_buyers: number;
  new_users: number;
  aov: number;
  conversion: number;
  course_revenue: number;
  sub_revenue: number;
}

export interface OverviewData {
  period_days: number;
  kpi: Kpi;
  delta: { revenue_pct: number | null; orders_pct: number | null; new_users_pct: number | null };
  by_day: { date: string; revenue: number; orders: number }[];
  top_courses: { course_id: number; revenue: number; orders: number }[];
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  conv_from_top: number;
  conv_step: number;
}

export interface Customer {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  last_login_at: string | null;
  orders: number;
  spent: number;
  last_purchase_at: string | null;
  segment: "paying" | "lead" | "cold";
}

export interface CustomerDetail {
  user: { id: number; name: string | null; email: string | null; phone: string | null; created_at: string; last_login_at: string | null };
  lifetime_value: number;
  paid_orders: number;
  purchases: { id: number; course_id: number; amount: number; status: string; provider: string | null; purchased_at: string | null; created_at: string }[];
  subscriptions: { plan_id: string; status: string; amount: number; started_at: string | null; expires_at: string | null; created_at: string }[];
  znaika: { balance: number; total_earned: number; total_spent: number; streak: number; level: number } | null;
}

export const SEG_COLOR: Record<string, string> = {
  paying: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  lead:   "bg-amber-500/15 text-amber-200 border-amber-400/30",
  cold:   "bg-white/8 text-white/50 border-white/15",
};

export const SEG_LABEL: Record<string, string> = {
  paying: "Покупатель",
  lead:   "Лид",
  cold:   "Холодный",
};

export function rub(n: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
}

export function num(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n);
}
