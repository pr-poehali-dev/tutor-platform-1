import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["school-pilot"];

export interface PilotSchool {
  code: string;
  school_name: string;
  contact_name: string;
  city: string;
  city_name: string;
  city_page: string;
  promo: string;
  student_url: string;
  student_label: string;
  admin_key?: string;
  stats_url?: string;
}

type Res<T> = T & { ok: boolean; error?: string };

async function call<T>(action: string, opts: { body?: unknown; query?: string; token?: string | null } = {}): Promise<Res<T>> {
  try {
    const r = await fetch(`${URL}?action=${action}${opts.query || ""}`, {
      method: opts.body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(opts.token ? { "X-Auth-Token": opts.token } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    return { ...d, ok: r.ok && d.ok !== false } as Res<T>;
  } catch {
    return { ok: false, error: "Нет связи с сервером — проверьте интернет" } as Res<T>;
  }
}

export const pilotApi = {
  cities: () => call<{ cities: { slug: string; name: string }[] }>("cities"),
  lookup: (ref: string) =>
    call<{ school_name: string; contact_name: string; contact: string; city: string }>("lookup", { query: `&ref=${encodeURIComponent(ref)}` }),
  join: (body: { school_name: string; contact_name: string; contact: string; city: string; institution_ref?: string; source?: string }) =>
    call<{ school: PilotSchool; existing: boolean }>("join", { body }),
  school: (code: string) => call<{ school: PilotSchool }>("school", { query: `&code=${encodeURIComponent(code)}` }),
  activate: (token: string, code: string, class_label: string) =>
    call<{ expires_at: string; school_name: string; already: boolean }>("activate", { body: { code, class_label }, token }),
  stats: (code: string, key: string) =>
    call<{
      school: PilotSchool;
      total: number;
      week: number;
      classes: { label: string; count: number }[];
      days: { day: string; count: number }[];
    }>("stats", { query: `&code=${encodeURIComponent(code)}&key=${encodeURIComponent(key)}` }),
};

const MY_KEY = "uchispro_pilot_school_v1";

/** Ссылки школы хранятся в браузере ответственного — чтобы вернуться к материалам без поиска письма. */
export const mySchool = {
  get(): PilotSchool | null {
    try {
      return JSON.parse(localStorage.getItem(MY_KEY) || "null");
    } catch {
      return null;
    }
  },
  set(s: PilotSchool) {
    try {
      localStorage.setItem(MY_KEY, JSON.stringify(s));
    } catch {
      /* приватный режим */
    }
  },
};

/** Ученик пришёл по ссылке школы, но ещё не вошёл: запоминаем, чтобы активировать сразу после входа. */
const PENDING_KEY = "uchispro_pilot_pending_v1";
export const pendingJoin = {
  set(code: string, classLabel: string) {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ code, classLabel, at: Date.now() }));
    } catch {
      /* ignore */
    }
  },
  get(): { code: string; classLabel: string } | null {
    try {
      const d = JSON.parse(localStorage.getItem(PENDING_KEY) || "null");
      if (!d || Date.now() - d.at > 2 * 60 * 60 * 1000) return null;
      return d;
    } catch {
      return null;
    }
  },
  clear() {
    try {
      localStorage.removeItem(PENDING_KEY);
    } catch {
      /* ignore */
    }
  },
};

export const chatText = (s: PilotSchool) =>
  `Ученики нашей школы участвуют в пилотном проекте УЧИСЬПРО. До 31 мая 2027 года бесплатно доступны ИИ-наставник по школьным предметам и курсы 1–11 класса с подготовкой к ОГЭ и ЕГЭ.\n\nКак подключиться (2 минуты): откройте ${s.student_label}, войдите через почту или Яндекс ID и укажите свой класс. Доступ откроется сразу.`;

export const parentsText = (s: PilotSchool) =>
  `Уважаемые родители! Наша школа участвует в бесплатном пилотном проекте образовательной платформы УЧИСЬПРО (учисьпро.рф). До 31 мая 2027 года ученикам бесплатно доступны ИИ-наставник по школьным предметам — он объясняет тему и подводит к ответу наводящими вопросами, а не выдаёт готовое решение, — разбор домашнего задания по фото и курсы 1–11 класса с подготовкой к ОГЭ и ЕГЭ.\n\nПодключение занимает 2 минуты: ${s.student_label}. Оплата не требуется, банковская карта не нужна.`;
