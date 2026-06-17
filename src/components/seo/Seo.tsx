import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "product";
  keywords?: string;
  /** JSON-LD объекты — каждый будет вставлен отдельным <script> */
  jsonLd?: Record<string, unknown>[];
  noindex?: boolean;
  /** Доп. метаданные для статей (type="article") — улучшают сниппеты в выдаче */
  article?: {
    publishedTime?: string | null;
    modifiedTime?: string | null;
    author?: string | null;
    section?: string | null;
    tags?: string[];
  };
}

// Кириллический домен — отображается красиво в адресной строке и поиске.
// Punycode-зеркало (xn--h1agdcde2c.xn--p1ai) остаётся валидным,
// но мы нормализуем все URL к кириллице автоматически.
const SITE_URL = "https://учисьпро.рф";
const PUNYCODE_HOST = "xn--h1agdcde2c.xn--p1ai";
const CYRILLIC_HOST = "учисьпро.рф";
const DEFAULT_IMG = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg";

/** Привести любой URL проекта к кириллическому домену */
function normalizeUrl(url: string): string {
  if (!url) return SITE_URL;
  return url.replace(PUNYCODE_HOST, CYRILLIC_HOST);
}

/**
 * Универсальный SEO-компонент: title, description, canonical, OG, Twitter, JSON-LD.
 * Использовать в каждой странице/важной модалке.
 */
export default function Seo({
  title,
  description,
  canonical,
  image = DEFAULT_IMG,
  type = "website",
  keywords,
  jsonLd,
  noindex = false,
  article,
}: SeoProps) {
  const fullTitle = title.includes("УЧИСЬПРО") ? title : `${title} — УЧИСЬПРО`;
  const rawUrl = canonical || (typeof window !== "undefined" ? window.location.href : SITE_URL);
  const url = normalizeUrl(rawUrl);
  const img = normalizeUrl(image);

  return (
    <Helmet>
      <html lang="ru" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta name="theme-color" content="#0a0a14" />

      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={img} />
      <meta property="og:image:secure_url" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="УЧИСЬПРО" />

      {/* Article meta — для статей и лендингов с типом article */}
      {type === "article" && article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {type === "article" && article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {type === "article" && article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {type === "article" && article?.section && (
        <meta property="article:section" content={article.section} />
      )}
      {type === "article" &&
        article?.tags?.map((t) => <meta key={t} property="article:tag" content={t} />)}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* JSON-LD */}
      {jsonLd?.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}