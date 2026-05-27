/**
 * Vercel Cron-эндпоинт: вызывается раз в 6 часов (см. vercel.json).
 * Авторизуется Vercel'ом через заголовок Authorization: Bearer <CRON_SECRET>.
 * Прокидывает запрос на нашу Python Cloud Function feed-curator.
 *
 * Если хостинг — не Vercel, можно настроить любой внешний cron
 * (cron-job.org, EasyCron) на URL:
 *   GET https://functions.poehali.dev/<feed-curator-id>?action=cron&secret=<ADMIN_KEY>
 */

const CURATOR_URL =
  "https://functions.poehali.dev/b4aed0e9-e169-4add-b041-36eaab3d44a5";

export default async function handler(request: Request): Promise<Response> {
  // Vercel передаёт нам Bearer-токен CRON_SECRET — пробрасываем его дальше
  const incomingAuth = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || "";

  // Проверяем, что запрос пришёл от Vercel Cron (или вручную с правильным токеном)
  if (cronSecret && incomingAuth !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized cron call" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const resp = await fetch(`${CURATOR_URL}?action=cron`, {
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
