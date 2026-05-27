import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["referrals"];
const TOKEN_KEY = "uchispro_auth_token_v1";

function token(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export interface MyRefCode {
  code: string;
  invited_count: number;
  rewards_earned_days: number;
  share_link: string;
  share_text: string;
}

export async function fetchMyCode(): Promise<MyRefCode | null> {
  const t = token();
  if (!t) return null;
  try {
    const res = await fetch(`${URL}?action=my_code`, { headers: { "X-Auth-Token": t } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function useCode(code: string): Promise<{ ok: boolean; message?: string; bonus_days?: number }> {
  const t = token();
  if (!t) return { ok: false, message: "Войди в кабинет" };
  try {
    const res = await fetch(`${URL}?action=use_code`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true, bonus_days: data.bonus_days };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export interface InvitedFriend {
  user_id: number;
  name: string;
  joined_at: string | null;
}

export async function fetchInvited(): Promise<InvitedFriend[]> {
  const t = token();
  if (!t) return [];
  try {
    const res = await fetch(`${URL}?action=invited_list`, { headers: { "X-Auth-Token": t } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}
