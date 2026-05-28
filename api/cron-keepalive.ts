/**
 * Vercel Cron: ЧАСОВОЙ пульс ленты (см. vercel.json).
 *
 * Раз в час:
 * — проверяет метрики живучести (свежие статьи, активные источники, алерты)
 * — если статей < 6 за 24ч — автодобирает из резервного demo-пула
 * — пишет алерты в feed_health_events если что-то не так
 *
 * Полностью автономно. Никаких ручных действий не требуется.
 */

const CURATOR_URL =
  "https://functions.poehali.dev/b4aed0e9-e169-4add-b041-36eaab3d44a5";

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
    const resp = await fetch(`${CURATOR_URL}?action=keep_alive`, {
      method: "GET",
    });
    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Keep-alive proxy failed",
        details: e instanceof Error ? e.message : "unknown",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const config = {
  runtime: "edge",
};
