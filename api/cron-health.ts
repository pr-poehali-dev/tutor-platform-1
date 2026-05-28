/**
 * Vercel Cron: пинг всех бэкенд-функций каждые 5 минут.
 * При >=3 ошибках подряд — создаётся алерт в system_alerts.
 */

const GUARDIAN_URL =
  "https://functions.poehali.dev/b26bcff9-23fd-4f6c-ada5-01f7a332d02e";

export default async function handler(request: Request): Promise<Response> {
  const auth = request.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET || "";
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const r = await fetch(`${GUARDIAN_URL}?action=ping_all`);
    const t = await r.text();
    return new Response(t, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Health proxy failed", details: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const config = { runtime: "edge" };
