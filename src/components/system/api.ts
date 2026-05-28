import func2url from "../../../backend/func2url.json";

const GUARDIAN = (func2url as Record<string, string>)["health-guardian"];
const BACKUP = (func2url as Record<string, string>)["db-backup"];

export interface BackendHealthItem {
  name: string;
  status: "ok" | "degraded" | "fail" | string;
  consecutive_failures: number;
  last_ok_at: string | null;
  last_fail_at: string | null;
  last_error: string | null;
  last_latency_ms: number | null;
  updated_at: string | null;
}

export interface SystemHealth {
  overall_status: "ok" | "warning" | "critical" | string;
  total: number;
  ok: number;
  fail: number;
  degraded: number;
  items: BackendHealthItem[];
}

export interface SystemAlert {
  id: number;
  source: string;
  severity: "critical" | "warning" | "info" | string;
  event_type: string;
  title: string;
  body: string;
  created_at: string | null;
}

export interface BackupDay {
  date: string;
  ok_count: number;
  fail_count: number;
  total_bytes: number;
  total_rows: number;
  done_at: string | null;
}

export async function fetchSystemHealth(): Promise<SystemHealth | null> {
  try {
    const r = await fetch(`${GUARDIAN}?action=status`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function fetchSystemAlerts(): Promise<SystemAlert[]> {
  try {
    const r = await fetch(`${GUARDIAN}?action=alerts`);
    if (!r.ok) return [];
    const d = await r.json();
    return d.items || [];
  } catch { return []; }
}

export async function fetchBackups(): Promise<BackupDay[]> {
  try {
    const r = await fetch(`${BACKUP}?action=list`);
    if (!r.ok) return [];
    const d = await r.json();
    return d.items || [];
  } catch { return []; }
}
