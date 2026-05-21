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
}

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";
const DEFAULT_IMG = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg";

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
}: SeoProps) {
  const fullTitle = title.includes("УЧИСЬПРО") ? title : `${title} — УЧИСЬПРО`;
  const url = canonical || (typeof window !== "undefined" ? window.location.href : SITE_URL);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="УЧИСЬПРО" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLd?.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}