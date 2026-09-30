#!/usr/bin/env node
/**
 * Генерация public/sitemap.xml.
 *
 * Зачем файл, если есть api/sitemap.ts. robots.txt указывает на /sitemap.xml,
 * но на проде этот адрес отвечал 404: карта отдавалась edge-функцией через
 * rewrite в vercel.json, а сайт раздаётся как статика — функции из /api
 * не поднимаются. Для поиска это читалось как «карты нет»: обход шёл наугад
 * по ссылкам, и глубокие страницы (курсы, предметные лендинги, раздел
 * «Малыш» — больше 270 адресов) находились долго или не находились совсем.
 *
 * Файл в public/ попадает в сборку и работает на любом хостинге. Логика
 * адресов не дублируется — берётся из api/_sitemapData.ts, того же модуля,
 * что использует функция.
 *
 * Запуск:  node scripts/buildSitemap.mjs
 * Нужен после добавления курсов, предметов и прочих новых разделов.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { staticEntries, fetchArticles, buildXml } = await import(
  resolve(__dirname, "../api/_sitemapData.ts")
);

const entries = staticEntries();
const staticCount = entries.length;

// Статьи требуют сети. Без неё карта выйдет без Ленты, но валидной
// и со всеми постоянными разделами — это лучше, чем отсутствие карты.
try {
  entries.push(...(await fetchArticles()));
} catch {
  console.warn("[sitemap] Лента недоступна — карта собрана без статей");
}

const out = resolve(__dirname, "../public/sitemap.xml");
writeFileSync(out, buildXml(entries), "utf8");

console.log(
  `[sitemap] разделов: ${staticCount}, статей: ${entries.length - staticCount}, всего: ${entries.length}`,
);
console.log(`[sitemap] записано: ${out}`);
