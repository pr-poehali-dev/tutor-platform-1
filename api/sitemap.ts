/**
 * Живая карта сайта (edge-функция).
 *
 * Проблема статичного sitemap.xml: статьи Ленты появляются и снимаются
 * с публикации каждый день, а файл правится руками. Из-за этого в карте
 * накопилась 231 ссылка на удалённые статьи — почти треть объёма вела на 404,
 * и поисковики тратили обход впустую.
 *
 * Здесь список статей берётся из Ленты в момент запроса, поэтому карта
 * не может устареть. Сама сборка адресов живёт в _sitemapData.ts — тот же
 * модуль использует плагин сборки, который пишет dist/sitemap.xml для
 * статического хостинга, где функции не поднимаются.
 *
 * Подключено через rewrite в vercel.json: /sitemap.xml → /api/sitemap
 */

import { staticEntries, fetchArticles, buildXml, type Entry } from "./_sitemapData";

export default async function handler(): Promise<Response> {
  const entries: Entry[] = staticEntries();

  // Сбой Ленты не должен ронять всю карту — отдаём хотя бы статичные разделы.
  try {
    entries.push(...(await fetchArticles()));
  } catch {
    /* карта останется без статей, но валидной */
  }

  return new Response(buildXml(entries), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=21600",
    },
  });
}

export const config = {
  runtime: "edge",
};
