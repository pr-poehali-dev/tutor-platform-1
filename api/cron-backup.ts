/**
 * Vercel Cron: ежедневный бэкап критичных таблиц в S3 (раз в сутки в 03:00 UTC).
 * Сохраняет 25 таблиц в gzipped JSONL, retention 30 дней.
 */

const BACKUP_URL =
  "https://functions.poehali.dev/4a67fc8e-2abe-4c78-88cf-f732855e95f9";

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
    const r = await fetch(`${BACKUP_URL}?action=run`);
    const t = await r.text();
    return new Response(t, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Backup proxy failed", details: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const config = { runtime: "edge" };
