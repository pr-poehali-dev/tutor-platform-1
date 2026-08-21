/**
 * Vercel Cron: ежедневный отчёт владельцу в MAX (см. vercel.json).
 *
 * Запускается в 6:00 UTC = 9:00 по Москве.
 *
 * Раньше отчёт отправлялся «прицепом» к часовому пульсу ленты, а тот
 * срабатывает нерегулярно — из-за этого за всё время не ушло ни одного
 * отчёта. Теперь у отчёта собственное расписание и он не зависит
 * ни от ленты, ни от посещаемости сайта.
 */

const DAILY_REPORT_URL =
  "https://functions.poehali.dev/f006bf6b-1ebc-47f7-8e64-fe93f8bc3c47";

export default async function handler(request: Request): Promise<Response> {
  const incomingAuth = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || "";

  if (cronSecret && incomingAuth !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized cron call" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const resp = await fetch(`${DAILY_REPORT_URL}?action=send`, {
      method: "GET",
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Daily report cron failed",
        details: e instanceof Error ? e.message : "unknown",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const config = {
  runtime: "edge",
};
