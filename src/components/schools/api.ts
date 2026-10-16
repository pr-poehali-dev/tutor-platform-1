import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["school-directory"];
const PIN_KEY = "uchispro_admin_pin_v1";

export interface SchoolRating {
  list: string;
  url: string;
  place: number;
  size: number;
  year: number;
  federal: boolean;
}

export interface SchoolCard {
  id: number;
  slug: string;
  name: string;
  full_name: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  segment: string;
  kind: "gymnasium" | "lyceum" | "cadet" | "school";
  score: number;
  verified: boolean;
  ratings?: SchoolRating[];
}

export interface SchoolProfile {
  website: string | null;
  about: string | null;
  achievements: string | null;
  methods: string | null;
  profiles: string | null;
  olympiad_winners: number | null;
  avg_ege: number | null;
  updated: string | null;
}

export interface SchoolDetails extends SchoolCard {
  ratings: SchoolRating[];
  profile: SchoolProfile | null;
  city_slug: string | null;
  city_place: number | null;
  nearby: SchoolCard[];
}

export interface DirCity {
  city: string;
  schools: number;
  rated: number;
  slug: string | null;
  name_in: string;
  region: boolean;
}

export interface ProfileFields {
  website: string;
  about: string;
  achievements: string;
  methods: string;
  profiles: string;
  olympiad_winners: string;
  avg_ege: string;
  contact_name: string;
  contact_role: string;
  contact_email: string;
  publish_consent: boolean;
}

export interface AdminProfile {
  id: number;
  status: string;
  created_at: string;
  via_letter: boolean;
  website: string | null;
  about: string | null;
  achievements: string | null;
  methods: string | null;
  profiles: string | null;
  olympiad_winners: number | null;
  avg_ege: number | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  moderator_note: string | null;
  school_id: number;
  school_name: string;
  city: string;
  slug: string;
  school_email: string;
  director: string;
  email_matches_school: boolean;
}

type Res<T> = { ok: true; data: T } | { ok: false; error: string };

async function call<T>(action: string, opts: { params?: Record<string, string | number>; body?: unknown; admin?: boolean } = {}): Promise<Res<T>> {
  const qs = new URLSearchParams({ action, ...Object.fromEntries(Object.entries(opts.params || {}).map(([k, v]) => [k, String(v)])) });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.admin) headers["X-Admin-Pin"] = sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";
  try {
    const r = await fetch(`${URL}?${qs}`, {
      method: opts.body !== undefined ? "POST" : "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data.error || "Не удалось загрузить данные" };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Нет связи с сервером. Проверьте интернет." };
  }
}

export const dirApi = {
  cities: () => call<{ cities: DirCity[]; total: number }>("cities"),
  list: (p: { city_slug: string; q?: string; kind?: string; page?: number }) =>
    call<{ city: string; items: SchoolCard[]; total: number; page: number; pages: number }>("list", {
      params: Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== "")) as Record<string, string>,
    }),
  school: (slug: string) => call<SchoolDetails>("school", { params: { slug } }),
  top: (limit = 100) => call<{ items: SchoolCard[]; rated: number; verified: number; lists: number }>("top", { params: { limit } }),
  profileForm: (t: string) =>
    call<{ school: SchoolCard & { ratings: SchoolRating[] }; last: (Partial<ProfileFields> & { status: string }) | null }>("profile_form", { params: { t } }),
  submit: (t: string, f: ProfileFields) => call<{ ok: boolean; message: string }>("profile_submit", { body: { t, ...f } }),
  claim: (slug: string, f: ProfileFields) => call<{ ok: boolean; message: string }>("claim", { body: { slug, ...f } }),
  adminProfiles: (status: string) => call<{ items: AdminProfile[]; counts: Record<string, number> }>("admin_profiles", { params: { status }, admin: true }),
  adminReview: (id: number, decision: "approve" | "reject", note?: string) =>
    call<{ ok: boolean }>("admin_review", { body: { id, decision, note }, admin: true }),
  adminHide: (id: number, hidden: boolean) => call<{ ok: boolean }>("admin_hide", { body: { id, hidden }, admin: true }),
};

export const KIND_LABEL: Record<SchoolCard["kind"], string> = {
  gymnasium: "Гимназия",
  lyceum: "Лицей",
  cadet: "Кадетская школа",
  school: "Школа",
};

export const SITE_URL = "https://учисьпро.рф";
