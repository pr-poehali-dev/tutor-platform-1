/**
 * Vercel Cron-эндпоинт: вызывается раз в 6 часов (см. vercel.json).
 * Авторизуется Vercel'ом через заголовок Authorization: Bearer <CRON_SECRET>.
 * Прокидывает запрос на нашу Python Cloud Function it-trends-analyst (полный цикл:
 * сбор сигналов → анализ → авторская статья в Ленту).
 *
 * Если хостинг — не Vercel, можно настроить любой внешний cron на URL:
 *   GET https://functions.poehali.dev/<it-trends-analyst-id>?action=cron
 *   с заголовком Authorization: Bearer <CRON_SECRET>
 */

const TRENDS_URL =
  "https://functions.poehali.dev/345b51be-4247-4451-bc5b-a382df23647a";

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
    const resp = await fetch(`${TRENDS_URL}?action=cron`, {
      method: "GET",
      headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
    });
    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Cron proxy failed",
        details: e instanceof Error ? e.message : "unknown",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const config = {
  runtime: "edge",
};
