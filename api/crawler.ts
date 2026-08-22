/**
 * Готовый HTML для поисковых роботов.
 *
 * Проблема: сайт — SPA. Роботу отдаётся пустой <div id="root">, весь текст
 * подгружается скриптами. Google это переваривает, Яндекс — заметно хуже,
 * поэтому 500+ статей Ленты и мини-курсы плохо попадают в выдачу.
 *
 * Решение: определяем поискового робота по User-Agent и отдаём ему
 * серверный HTML с полным текстом, заголовками и разметкой schema.org.
 * Живые пользователи получают обычное SPA-приложение без изменений.
 *
 * Маршруты настроены через rewrites в vercel.json.
 */

import { MINI_COURSES_SEO } from "./_minicourses";
import { LANDINGS_SEO } from "./_landings";

const SITE = "https://учисьпро.рф";
const FEED_API = "https://functions.poehali.dev/b9f58dbe-702c-46d3-a9b1-02d5076735ef";
const DEFAULT_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg";

/** Только поисковые роботы — соцсети обслуживает /api/share. */
const CRAWLERS = [
  "googlebot",
  "yandex",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "applebot",
  "petalbot",
  "mail.ru_bot",
  "ia_archiver",
  "ahrefsbot",
  "semrushbot",
  "screaming frog",
  "seznambot",
  "rambler",
  "google-inspectiontool",
];

interface Article {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  cover_url?: string;
  category?: string;
  tags?: string[] | string;
  reading_time_min?: number;
  published_at?: string;
  updated_at?: string;
  author_display_name?: string;
  source_name?: string;
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Markdown → простой HTML: заголовки, списки, цитаты, ссылки, выделение. */
function mdToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  let inQuote = false;

  const closeAll = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
    if (inQuote) {
      out.push("</blockquote>");
      inQuote = false;
    }
  };

  const inline = (s: string) =>
    esc(s)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, u) => {
        const href = String(u).startsWith("http") ? u : `${SITE}${u}`;
        return `<a href="${esc(href)}">${t}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeAll();
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      closeAll();
      out.push("<hr/>");
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeAll();
      const lvl = Math.min(h[1].length + 1, 4); // h1 остаётся у заголовка статьи
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
      continue;
    }

    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      if (inQuote) {
        out.push("</blockquote>");
        inQuote = false;
      }
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(li[1])}</li>`);
      continue;
    }

    const num = line.match(/^\s*\d+\.\s+(.*)$/);
    if (num) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(num[1])}</li>`);
      continue;
    }

    const q = line.match(/^>\s?(.*)$/);
    if (q) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      if (!inQuote) {
        out.push("<blockquote>");
        inQuote = true;
      }
      out.push(`<p>${inline(q[1])}</p>`);
      continue;
    }

    closeAll();
    out.push(`<p>${inline(line)}</p>`);
  }

  closeAll();
  return out.join("\n");
}

function page(opts: {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  body: string;
  jsonLd?: unknown;
  type?: string;
}): string {
  const img = opts.image || DEFAULT_IMG;
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}"/>
<link rel="canonical" href="${esc(opts.canonical)}"/>
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large"/>
<meta property="og:type" content="${esc(opts.type || "website")}"/>
<meta property="og:site_name" content="УЧИСЬПРО"/>
<meta property="og:locale" content="ru_RU"/>
<meta property="og:title" content="${esc(opts.title)}"/>
<meta property="og:description" content="${esc(opts.description)}"/>
<meta property="og:url" content="${esc(opts.canonical)}"/>
<meta property="og:image" content="${esc(img)}"/>
<meta name="twitter:card" content="summary_large_image"/>
${opts.jsonLd ? `<script type="application/ld+json">${JSON.stringify(opts.jsonLd)}</script>` : ""}
</head>
<body>
<header><a href="${SITE}/">УЧИСЬПРО</a></header>
<main>
${opts.body}
</main>
<footer>
<nav>
<a href="${SITE}/">Главная</a> ·
<a href="${SITE}/courses">Курсы</a> ·
<a href="${SITE}/mini-course">Бесплатные мини-курсы</a> ·
<a href="${SITE}/feed">Лента</a> ·
<a href="${SITE}/exam-bank">Задания ЕГЭ и ОГЭ</a>
</nav>
</footer>
</body>
</html>`;
}

/** Статья Ленты. */
async function renderArticle(slug: string): Promise<Response | null> {
  const res = await fetch(`${FEED_API}?action=item&slug=${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as Record<string, unknown>;
  const a = ((data.item || data.article || data) as Article) || null;
  if (!a || !a.title) return null;

  const url = `${SITE}/feed/${a.slug}`;
  const desc = (a.summary || String(a.content || "").slice(0, 200) || a.title).trim();
  const tags = Array.isArray(a.tags)
    ? a.tags
    : typeof a.tags === "string"
      ? (() => {
          try {
            return JSON.parse(a.tags as string);
          } catch {
            return [];
          }
        })()
      : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: desc,
    image: a.cover_url || DEFAULT_IMG,
    datePublished: a.published_at,
    dateModified: a.updated_at || a.published_at,
    author: {
      "@type": "Organization",
      name: a.author_display_name || a.source_name || "УЧИСЬПРО",
    },
    publisher: {
      "@type": "Organization",
      name: "УЧИСЬПРО",
      url: SITE,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(tags.length ? { keywords: tags.join(", ") } : {}),
  };

  const body = `
<nav aria-label="Хлебные крошки">
<a href="${SITE}/">Главная</a> › <a href="${SITE}/feed">Лента</a> › ${esc(a.title)}
</nav>
<article>
<h1>${esc(a.title)}</h1>
${a.summary ? `<p><strong>${esc(a.summary)}</strong></p>` : ""}
${a.cover_url ? `<img src="${esc(a.cover_url)}" alt="${esc(a.title)}" width="1200" height="630"/>` : ""}
${a.published_at ? `<p><time datetime="${esc(a.published_at)}">${esc(String(a.published_at).slice(0, 10))}</time>${a.reading_time_min ? ` · ${a.reading_time_min} мин чтения` : ""}</p>` : ""}
${mdToHtml(String(a.content || ""))}
${tags.length ? `<p>Темы: ${tags.map((t: string) => esc(t)).join(", ")}</p>` : ""}
</article>`;

  return new Response(
    page({
      title: `${a.title} | УЧИСЬПРО`,
      description: desc,
      canonical: url,
      image: a.cover_url,
      body,
      jsonLd,
      type: "article",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
        "X-Robots-Tag": "index, follow",
      },
    },
  );
}

/** Список статей Ленты. Бэкенд отдаёт по 12 на страницу — собираем несколько. */
async function renderFeed(): Promise<Response | null> {
  const pages = [1, 2, 3, 4, 5];
  const results = await Promise.all(
    pages.map((p) =>
      fetch(`${FEED_API}?action=list&page=${p}`, { headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ),
  );

  const items: Article[] = [];
  for (const data of results) {
    const list = (data as { items?: Article[] } | null)?.items;
    if (Array.isArray(list)) items.push(...list);
  }
  if (!items.length) return null;

  const body = `
<h1>Лента УЧИСЬПРО — статьи об образовании, науке и технологиях</h1>
<p>Новости и разборы про учёбу, нейросети, гранты, науку и профессии. Материалы обновляются каждый день.</p>
<ul>
${items
  .map(
    (a) =>
      `<li><a href="${SITE}/feed/${esc(a.slug)}"><strong>${esc(a.title)}</strong></a>${a.summary ? ` — ${esc(a.summary)}` : ""}</li>`,
  )
  .join("\n")}
</ul>
<p><a href="${SITE}/feed">Все материалы Ленты</a></p>`;

  return new Response(
    page({
      title: "Лента — статьи об образовании, науке и технологиях | УЧИСЬПРО",
      description:
        "Ежедневные материалы про учёбу, нейросети, гранты, науку и профессии. Разборы, новости и практические советы для школьников и взрослых.",
      canonical: `${SITE}/feed`,
      body,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=1800",
      },
    },
  );
}

/** Страница одного мини-курса. */
function renderMiniCourse(slug: string): Response | null {
  const c = MINI_COURSES_SEO.find((x) => x.slug === slug);
  if (!c) return null;

  const url = `${SITE}/mini-course/${c.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description: c.promise,
    url,
    image: c.cover,
    inLanguage: "ru",
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "УЧИСЬПРО", url: SITE },
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      category: "Free",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${c.minutes}M`,
    },
  };

  const body = `
<nav aria-label="Хлебные крошки">
<a href="${SITE}/">Главная</a> › <a href="${SITE}/mini-course">Мини-курсы</a> › ${esc(c.title)}
</nav>
<article>
<h1>${esc(c.title)} — бесплатный мини-курс</h1>
<p><strong>${esc(c.subtitle)}</strong></p>
<img src="${esc(c.cover)}" alt="${esc(c.title)}" width="1200" height="630"/>
<p>${esc(c.promise)}</p>
<p>${esc(c.audience)} · ${c.lessons.length} уроков · около ${c.minutes} минут · бесплатно, без регистрации.</p>
<h2>Программа курса</h2>
<ol>
${c.lessons.map((l) => `<li>${esc(l)}</li>`).join("\n")}
</ol>
<h2>Что будет после курса</h2>
<p>${esc(c.outcome)}</p>
<p><a href="${url}">Начать курс бесплатно</a></p>
</article>
<h2>Другие бесплатные мини-курсы</h2>
<ul>
${MINI_COURSES_SEO.filter((x) => x.slug !== c.slug && x.track === c.track)
  .slice(0, 8)
  .map((x) => `<li><a href="${SITE}/mini-course/${x.slug}">${esc(x.title)}</a> — ${esc(x.subtitle)}</li>`)
  .join("\n")}
</ul>`;

  return new Response(
    page({
      title: `${c.title} — бесплатный мини-курс | УЧИСЬПРО`,
      description: c.promise,
      canonical: url,
      image: c.cover,
      body,
      jsonLd,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}

/** Хаб мини-курсов. */
function renderMiniCoursesHub(): Response {
  const adult = MINI_COURSES_SEO.filter((c) => c.track === "adult");
  const school = MINI_COURSES_SEO.filter((c) => c.track === "school");
  const lessons = MINI_COURSES_SEO.reduce((s, c) => s + c.lessons.length, 0);

  const list = (arr: typeof MINI_COURSES_SEO) =>
    arr
      .map(
        (c) =>
          `<li><a href="${SITE}/mini-course/${c.slug}"><strong>${esc(c.title)}</strong></a> — ${esc(c.subtitle)} (${c.lessons.length} уроков, ${c.minutes} мин)</li>`,
      )
      .join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Бесплатные мини-курсы УЧИСЬПРО",
    numberOfItems: MINI_COURSES_SEO.length,
    itemListElement: MINI_COURSES_SEO.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/mini-course/${c.slug}`,
      name: c.title,
    })),
  };

  const body = `
<nav aria-label="Хлебные крошки">
<a href="${SITE}/">Главная</a> › Мини-курсы
</nav>
<h1>Бесплатные мини-курсы — один навык за вечер</h1>
<p>${MINI_COURSES_SEO.length} коротких курсов и ${lessons} уроков. Каждый курс — это один навык,
отработанный до результата: пять-шесть уроков, готовые шаблоны и задание после каждого урока.
Без регистрации, без карты и без ограничений по времени.</p>
<h2>Курсы для взрослых (${adult.length})</h2>
<ul>${list(adult)}</ul>
<h2>Курсы для школьников (${school.length})</h2>
<ul>${list(school)}</ul>`;

  return new Response(
    page({
      title: "Бесплатные мини-курсы — отработка навыка за один вечер | УЧИСЬПРО",
      description: `${MINI_COURSES_SEO.length} бесплатных мини-курсов для взрослых и школьников: нейросети, зарплата, переговоры, права потребителя, сон, готовка, ремонт, а также математика, физика, английский и астрономия. Без регистрации и оплаты.`,
      canonical: `${SITE}/mini-course`,
      body,
      jsonLd,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}

/** Ключевые посадочные страницы: текст берём из _landings.ts. */
function renderLanding(path: string): Response | null {
  const L = LANDINGS_SEO.find((l) => l.path === path);
  if (!L) return null;

  const sections = L.sections
    .map((s) => `<h2>${esc(s.h2)}</h2>\n<p>${esc(s.text)}</p>`)
    .join("\n");

  const links = L.links
    .map((l) => `<li><a href="${SITE}${l.url}">${esc(l.label)}</a></li>`)
    .join("\n");

  const faq = L.faq?.length
    ? `<h2>Частые вопросы</h2>\n` +
      L.faq
        .map((f) => `<h3>${esc(f.q)}</h3>\n<p>${esc(f.a)}</p>`)
        .join("\n")
    : "";

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: L.h1,
      description: L.description,
      url: `${SITE}${L.path}`,
      inLanguage: "ru-RU",
      isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website` },
    },
  ];

  if (L.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: L.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  const body = `
<nav aria-label="Хлебные крошки">
<a href="${SITE}/">Главная</a> › ${esc(L.h1)}
</nav>
<h1>${esc(L.h1)}</h1>
<p>${esc(L.intro)}</p>
${sections}
<h2>Смотрите также</h2>
<ul>${links}</ul>
${faq}`;

  return new Response(
    page({
      title: L.title,
      description: L.description,
      canonical: `${SITE}${L.path}`,
      body,
      jsonLd,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const isCrawler = CRAWLERS.some((m) => ua.includes(m));

  // Реальный путь: из ?path= (rewrite) или из самого URL
  const path = url.searchParams.get("path") || url.pathname;

  // Живому пользователю — обычное SPA
  if (!isCrawler) {
    return new Response(null, {
      status: 302,
      headers: { Location: path || "/", "Cache-Control": "no-cache" },
    });
  }

  try {
    const article = path.match(/^\/feed\/([^/?#]+)/);
    if (article) {
      const r = await renderArticle(decodeURIComponent(article[1]));
      if (r) return r;
    }
    if (/^\/feed\/?$/.test(path)) {
      const r = await renderFeed();
      if (r) return r;
    }

    const mini = path.match(/^\/mini-course\/([^/?#]+)/);
    if (mini) {
      const r = renderMiniCourse(decodeURIComponent(mini[1]));
      if (r) return r;
    }
    if (/^\/mini-course\/?$/.test(path)) {
      return renderMiniCoursesHub();
    }

    // Ключевые посадочные страницы (каталог курсов, ЕГЭ, бизнес-разбор)
    const landing = renderLanding(path.replace(/\/$/, "") || "/");
    if (landing) return landing;
  } catch {
    // Любая ошибка — отдаём SPA, робот увидит обычную страницу
  }

  return new Response(null, {
    status: 302,
    headers: { Location: path || "/", "Cache-Control": "no-cache" },
  });
}

export const config = {
  runtime: "edge",
};