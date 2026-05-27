export interface Faculty {
  faculty_code: string;
  faculty_name: string;
  short_name: string;
  speciality: string;
  ege_required: string[];
  dvi_subject: string;
  last_year_min_score: number;
  budget_seats: number;
  competition_per_seat: number;
  olympiad_level: number;
  description: string;
}

export interface Plan {
  plan_summary: string;
  target_scores: Record<string, number>;
  confidence_score: number;
  olympiads_to_write: Array<{ name: string; level: number; subject: string; deadline: string; what_gives: string }>;
  weekly_plan: Array<{ week_range: string; focus: string; deliverables: string[] }>;
  dvi_strategy: string;
  risks: string[];
  fallback_universities: Array<{ name: string; faculty: string; why: string }>;
  monthly_milestones: Array<{ month: string; must_do: string[] }>;
}

export interface QuickCompat {
  gap_points: number;
  is_safe: boolean;
  needs_olympiad: boolean;
  recommendation: string;
}

export const SUBJECT_LABELS: Record<string, string> = {
  math: "Математика",
  russian: "Русский",
  physics: "Физика",
  chemistry: "Химия",
  biology: "Биология",
  cs: "Информатика",
  history: "История",
  society: "Обществознание",
  english: "Английский",
  literature: "Литература",
  geography: "География",
};
