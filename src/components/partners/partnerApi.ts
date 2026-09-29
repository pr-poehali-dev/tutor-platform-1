import func2url from "../../../backend/func2url.json";

/**
 * API партнёрской программы.
 *
 * Функция `partners` может быть ещё не развёрнута (деплой отдельный),
 * поэтому URL проверяется перед каждым вызовом: интерфейс в этом случае
 * показывает состояние «скоро», а не падает с ошибкой сети.
 */
const URL = (func2url as Record<string, string>)["partners"] || "";
const TOKEN_KEY = "uchispro_auth_token_v1";

function token(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const isPartnerApiReady = (): boolean => !!URL;

export interface PartnerMe {
  is_partner: boolean;
  status?: string;
  code: string | null;
  share_link: string | null;
  balance_rub?: number;
  total_earned_rub?: number;
  pending_payout_rub?: number;
  invited_count?: number;
  buyers_by_line?: Record<string, number>;
  payout_method?: string | null;
  payout_details?: string | null;
  line_percent: Record<string, number>;
  min_payout_rub: number;
}

export interface Commission {
  line: number;
  percent: number;
  amount_rub: number;
  source_kind: string;
  created_at: string | null;
  from_name: string;
}

export interface StructureMember {
  name: string;
  joined_at: string | null;
}

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!URL) return null;
  const t = token();
  if (!t) return null;
  try {
    const res = await fetch(`${URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", "X-Auth-Token": t, ...(init?.headers || {}) },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const fetchPartnerMe = () => call<PartnerMe>("?action=me");

export const activatePartner = () =>
  call<{ ok: boolean; already: boolean }>("?action=activate", { method: "POST", body: "{}" });

export const fetchCommissions = () =>
  call<{ items: Commission[] }>("?action=commissions").then((r) => r?.items ?? []);

export const fetchStructure = () =>
  call<{ lines: Record<string, StructureMember[]>; counts: Record<string, number> }>(
    "?action=structure"
  );

export const savePayoutDetails = (method: string, details: string) =>
  call<{ ok: boolean; error?: string }>("?action=save_payout", {
    method: "POST",
    body: JSON.stringify({ method, details }),
  });

export const requestPayout = (amountRub: number) =>
  call<{ ok: boolean; payout_id?: number; error?: string }>("?action=request_payout", {
    method: "POST",
    body: JSON.stringify({ amount_rub: amountRub }),
  });
