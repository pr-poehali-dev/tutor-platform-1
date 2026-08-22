/**
 * Живая карта сайта.
 *
 * Проблема статичного public/sitemap.xml: статьи Ленты появляются и снимаются
 * с публикации каждый день, а файл правится руками. Из-за этого в карте
 * накопилась 231 ссылка на удалённые статьи — почти треть объёма вела на 404,
 * и поисковики тратили обход впустую.
 *
 * Здесь список статей берётся из Ленты в момент запроса, поэтому карта
 * не может устареть. Статичные разделы сайта перечислены ниже вручную —
 * они меняются редко.
 *
 * Подключено через rewrite в vercel.json: /sitemap.xml → /api/sitemap
 */

const SITE = "https://учисьпро.рф";
const FEED_API =
  "https://functions.poehali.dev/b9f58dbe-702c-46d3-a9b1-02d5076735ef";

interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/** Постоянные разделы сайта. Ленту добавляем отдельно — она живая. */
const STATIC: Entry[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/courses", changefreq: "daily", priority: "0.9" },
  { loc: "/free-courses", changefreq: "weekly", priority: "0.8" },
  { loc: "/super-courses", changefreq: "weekly", priority: "0.8" },
  { loc: "/mini-course", changefreq: "weekly", priority: "0.9" },
  { loc: "/feed", changefreq: "daily", priority: "0.9" },
  { loc: "/business-2026", changefreq: "weekly", priority: "0.9" },
  { loc: "/exam-bank", changefreq: "weekly", priority: "0.9" },
  { loc: "/exam-checklist", changefreq: "monthly", priority: "0.7" },
  { loc: "/score-calculator", changefreq: "monthly", priority: "0.8" },
  { loc: "/homework", changefreq: "weekly", priority: "0.8" },
  { loc: "/math-problems", changefreq: "weekly", priority: "0.8" },
  { loc: "/biology-problems", changefreq: "weekly", priority: "0.8" },
  { loc: "/chemistry-problems", changefreq: "weekly", priority: "0.8" },
  { loc: "/tutor", changefreq: "weekly", priority: "0.8" },
  { loc: "/graduate", changefreq: "weekly", priority: "0.8" },
  { loc: "/graduates", changefreq: "monthly", priority: "0.7" },
  { loc: "/mgu-track", changefreq: "monthly", priority: "0.7" },
  { loc: "/writing-craft", changefreq: "monthly", priority: "0.7" },
  { loc: "/know-yourself", changefreq: "monthly", priority: "0.7" },
  { loc: "/psychology", changefreq: "monthly", priority: "0.7" },
  { loc: "/klinicheskiy-psiholog", changefreq: "monthly", priority: "0.7" },
  { loc: "/nlp-master", changefreq: "monthly", priority: "0.7" },
  { loc: "/personal-brand", changefreq: "monthly", priority: "0.7" },
  { loc: "/expert-content", changefreq: "monthly", priority: "0.7" },
  { loc: "/remote-professions", changefreq: "monthly", priority: "0.7" },
  { loc: "/career-pro", changefreq: "monthly", priority: "0.7" },
  { loc: "/business-coach", changefreq: "monthly", priority: "0.7" },
  { loc: "/fin-advisor", changefreq: "monthly", priority: "0.7" },
  { loc: "/bizlab", changefreq: "weekly", priority: "0.8" },
  { loc: "/biz-report", changefreq: "weekly", priority: "0.9" },
  { loc: "/instrumenty-rukovoditelya", changefreq: "monthly", priority: "0.7" },
  { loc: "/orchestrator", changefreq: "monthly", priority: "0.7" },
  { loc: "/ai-assistant", changefreq: "monthly", priority: "0.7" },
  { loc: "/ai-persona", changefreq: "monthly", priority: "0.7" },
  { loc: "/tech-trends", changefreq: "monthly", priority: "0.7" },
  { loc: "/intensive", changefreq: "monthly", priority: "0.7" },
  { loc: "/for-business", changefreq: "weekly", priority: "0.8" },
  { loc: "/for-schools", changefreq: "monthly", priority: "0.7" },
  { loc: "/corporate", changefreq: "monthly", priority: "0.7" },
  { loc: "/partners", changefreq: "monthly", priority: "0.7" },
  { loc: "/edtech-jobs", changefreq: "monthly", priority: "0.6" },
  { loc: "/school-builder", changefreq: "monthly", priority: "0.7" },
  { loc: "/grants", changefreq: "weekly", priority: "0.8" },
  { loc: "/draw", changefreq: "monthly", priority: "0.7" },
  { loc: "/silent", changefreq: "monthly", priority: "0.7" },
  { loc: "/dictionary", changefreq: "monthly", priority: "0.7" },
  { loc: "/olympiad", changefreq: "monthly", priority: "0.7" },
  { loc: "/znaika", changefreq: "monthly", priority: "0.7" },
  { loc: "/kids", changefreq: "weekly", priority: "0.9" },
  { loc: "/kids/about", changefreq: "monthly", priority: "0.7" },
  { loc: "/kids/test", changefreq: "monthly", priority: "0.8" },
  { loc: "/kids/library", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/songs", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/poznavashka", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/reading", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/games", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/my-russia", changefreq: "weekly", priority: "0.8" },
  { loc: "/app", changefreq: "monthly", priority: "0.7" },
  { loc: "/reviews", changefreq: "weekly", priority: "0.7" },
  { loc: "/help", changefreq: "monthly", priority: "0.6" },
  { loc: "/contacts", changefreq: "monthly", priority: "0.6" },
  { loc: "/referral", changefreq: "monthly", priority: "0.6" },
  { loc: "/search", changefreq: "monthly", priority: "0.5" },
];

/** Предметные лендинги каталога — совпадают со списком в subjectsSeo.ts. */
const SUBJECTS = [
  "math",
  "russian",
  "english",
  "physics",
  "chemistry",
  "cs",
  "biology",
  "history",
  "society",
  "literature",
  "geography",
  "logic",
  "ai",
  "skills",
  "career",
  "chinese",
  "korean",
  "datascience",
  "product",
  "avangard",
  "roomscan",
  "marketing",
  "prompteng",
  "neuroincome",
  "business",
  "sales",
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlTag(e: Entry, today: string): string {
  return `  <url>
    <loc>${esc(SITE + e.loc)}</loc>
    <lastmod>${e.lastmod || today}</lastmod>
    <changefreq>${e.changefreq || "monthly"}</changefreq>
    <priority>${e.priority || "0.7"}</priority>
  </url>`;
}

/** Все опубликованные статьи Ленты — постранично, пока не кончатся. */
async function fetchArticles(): Promise<Entry[]> {
  const out: Entry[] = [];
  for (let page = 1; page <= 40; page++) {
    const res = await fetch(`${FEED_API}?page=${page}&limit=50`);
    if (!res.ok) break;
    const data = await res.json();
    const items = data?.items || [];
    if (!items.length) break;
    for (const a of items) {
      if (!a?.slug) continue;
      out.push({
        loc: `/feed/${a.slug}`,
        lastmod: (a.published_at || a.created_at || "").slice(0, 10) || undefined,
        changefreq: "monthly",
        priority: "0.7",
      });
    }
    if (!data?.has_more) break;
  }
  return out;
}

export default async function handler(): Promise<Response> {
  const today = new Date().toISOString().slice(0, 10);

  const entries: Entry[] = [
    ...STATIC,
    ...SUBJECTS.map((s) => ({
      loc: `/courses/${s}`,
      changefreq: "weekly",
      priority: "0.8",
    })),
  ];

  // Сбой Ленты не должен ронять всю карту — отдаём хотя бы статичные разделы.
  try {
    entries.push(...(await fetchArticles()));
  } catch {
    /* карта останется без статей, но валидной */
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => urlTag(e, today)).join("\n")}
</urlset>`;

  return new Response(xml, {
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