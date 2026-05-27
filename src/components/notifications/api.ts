import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["notifications"];
const TOKEN_KEY = "uchispro_auth_token_v1";

function token(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export interface Notification {
  id: number;
  kind: string;
  title: string;
  body: string;
  icon: string;
  url: string | null;
  is_read: boolean;
  created_at: string | null;
}

export async function fetchUnreadCount(): Promise<number> {
  const t = token();
  if (!t) return 0;
  try {
    const res = await fetch(`${URL}?action=unread_count`, { headers: { "X-Auth-Token": t } });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

export async function fetchNotifications(): Promise<Notification[]> {
  const t = token();
  if (!t) return [];
  try {
    const res = await fetch(`${URL}?action=list`, { headers: { "X-Auth-Token": t } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function markRead(id: number): Promise<boolean> {
  const t = token();
  if (!t) return false;
  try {
    const res = await fetch(`${URL}?action=mark_read`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: JSON.stringify({ id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function markAllRead(): Promise<boolean> {
  const t = token();
  if (!t) return false;
  try {
    const res = await fetch(`${URL}?action=mark_read`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: JSON.stringify({ all: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
