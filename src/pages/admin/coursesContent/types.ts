export interface CourseStatus {
  has_curriculum: boolean;
  total_lessons?: number;
  total_modules?: number;
  estimated_hours?: number;
  version?: number;
  updated_at?: string;
}

export interface BatchResult {
  course_id: number;
  title?: string;
  generated?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  total_lessons?: number;
  total_modules?: number;
  version?: number;
  fallback?: boolean;
  warning?: boolean;
  ai_error?: string;
}

export interface PersistedProgress {
  queue: number[];
  done: BatchResult[];
  startedAt: number;
  total: number;
}

export interface Stats {
  total: number;
  ready: number;
  missing: number;
  onSale: number;
}

export type FilterKind = "all" | "missing" | "ready";
