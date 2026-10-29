import func2url from "../../../backend/func2url.json";
import { CATEGORY_META, FeedArticle, FeedCategory } from "./types";

const FEED_URL = (func2url as Record<string, string>)["feed"];
export const SITE_URL = "https://учисьпро.рф";
const LOGO =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg";

export type SeoArticle = FeedArticle & { updated_at?: string | null; content_length?: number; seo_only?: boolean };

/** Статья для серверной отрисовки и метатегов (без счётчика просмотров).
 *  "missing" — статьи точно нет (404), null — сервер не ответил (страница догрузит статью сама). */
export async function fetchSeoArticle(slug: string): Promise<SeoArticle | "missing" | null> {
  if (!FEED_URL || !slug) return null;
  try {
    const res = await fetch(`${FEED_URL}?action=seo&slug=${encodeURIComponent(slug)}`);
    if (res.status === 404) return "missing";
    if (!res.ok) return null;
    const data = await res.json();
    return (data.item as SeoArticle) || null;
  } catch {
    return null;
  }
}

export const articleAbsUrl = (slug: string) => `${SITE_URL}/feed/${slug}`;
export const categoryPath = (c: FeedCategory) => `/feed?c=${c}`;

/** Описание для сниппета: до 160 символов, по границе слова. */
export function seoDescription(a: Pick<FeedArticle, "summary" | "title">): string {
  const raw = (a.summary || a.title || "").replace(/\s+/g, " ").trim();
  if (raw.length <= 160) return raw;
  const cut = raw.slice(0, 159);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 100 ? cut.slice(0, sp) : cut).replace(/[\s,.;:—–-]+$/, "")}…`;
}

/** Заголовок для вкладки и выдачи: бренд — только если влезает в ~65 символов. */
export function seoTitle(title: string): string {
  return title.length + 11 > 65 ? title : `${title} — УЧИСЬПРО`;
}

export function breadcrumbItems(a: Pick<FeedArticle, "category" | "title" | "slug">) {
  const meta = CATEGORY_META[a.category];
  return [
    { label: "Главная", href: "/" },
    { label: "Лента", href: "/feed" },
    ...(meta ? [{ label: meta.label, href: categoryPath(a.category) }] : []),
    { label: a.title, href: `/feed/${a.slug}` },
  ];
}

export function breadcrumbJsonLd(a: Pick<FeedArticle, "category" | "title" | "slug">) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems(a).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${SITE_URL}${c.href}`,
    })),
  };
}

export function articleJsonLd(a: SeoArticle) {
  const meta = CATEGORY_META[a.category];
  const url = articleAbsUrl(a.slug);
  const isPerson = a.source_kind === "user";
  return {
    "@context": "https://schema.org",
    "@type": a.category === "business" || a.category === "science" ? "NewsArticle" : "Article",
    headline: a.title.slice(0, 110),
    description: seoDescription(a),
    datePublished: a.published_at || a.created_at,
    dateModified: a.updated_at || a.published_at || a.created_at,
    author: {
      "@type": isPerson ? "Person" : "Organization",
      name: a.author_display_name || a.source_name || "Редакция УЧИСЬПРО",
      ...(isPerson ? {} : { url: SITE_URL }),
    },
    publisher: { "@type": "Organization", name: "УЧИСЬПРО", url: SITE_URL, logo: { "@type": "ImageObject", url: LOGO } },
    image: a.cover_url ? [a.cover_url] : [LOGO],
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "ru",
    articleSection: meta?.label,
    keywords: (a.tags || []).join(", ") || undefined,
    isAccessibleForFree: true,
    ...(a.source_url ? { isBasedOn: a.source_url, citation: a.source_url } : {}),
    ...(a.video_url
      ? {
          video: {
            "@type": "VideoObject",
            name: a.title,
            description: seoDescription(a),
            thumbnailUrl: a.cover_url || LOGO,
            contentUrl: a.video_url,
            uploadDate: a.published_at || a.created_at,
          },
        }
      : {}),
  };
}

/** Метатеги и разметка статьи для head() маршрута — уходят в HTML с сервера. */
export function articleHead(a: SeoArticle | null | undefined, slug: string) {
  if (!a) {
    return { meta: [{ title: "Статья не найдена — УЧИСЬПРО" }, { name: "robots", content: "noindex, follow" }] };
  }
  const url = articleAbsUrl(a.slug || slug);
  const title = seoTitle(a.title);
  const desc = seoDescription(a);
  const img = a.cover_url || LOGO;
  const thin = !a.seo_only && (a.content_length ?? 0) < 1500;
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: desc },
    { name: "robots", content: thin ? "noindex, follow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: "УЧИСЬПРО" },
    { property: "og:locale", content: "ru_RU" },
    { property: "og:title", content: a.title },
    { property: "og:description", content: desc },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:image:alt", content: a.title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: a.title },
    { name: "twitter:description", content: desc },
    { name: "twitter:image", content: img },
  ];
  if (a.published_at) meta.push({ property: "article:published_time", content: a.published_at });
  if (a.updated_at) meta.push({ property: "article:modified_time", content: a.updated_at });
  const section = CATEGORY_META[a.category]?.label;
  if (section) meta.push({ property: "article:section", content: section });
  (a.tags || []).slice(0, 8).forEach((t) => meta.push({ property: "article:tag", content: t }));
  if (a.video_url) {
    meta.push({ property: "og:video", content: a.video_url }, { property: "og:video:type", content: "video/mp4" });
  }
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(articleJsonLd(a)) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd(a)) },
    ],
  };
}
