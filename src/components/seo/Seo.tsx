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
  /**
   * HTTP-код страницы. Указывается только для 404: сайт — SPA, сервер всегда
   * отвечает 200, поэтому робот считает несуществующие адреса рабочими
   * страницами. Тег prerender-status-code — стандартный способ сообщить
   * поисковику и пререндеру настоящий статус.
   */
  statusCode?: number;
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
// Punycode-зеркало (xn--h1amcedk2a6b.xn--p1ai) остаётся валидным,
// но мы нормализуем все URL к кириллице автоматически.
const SITE_URL = "https://учисьпро.рф";
const PUNYCODE_HOST = "xn--h1amcedk2a6b.xn--p1ai";
const CYRILLIC_HOST = "учисьпро.рф";
const DEFAULT_IMG = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg";

/** Сколько символов заголовка реально показывает поиск, дальше — многоточие. */
const TITLE_LIMIT = 65;
/** Верхняя граница описания в сниппете. */
const DESC_LIMIT = 170;

/** Привести любой URL проекта к кириллическому домену */
function normalizeUrl(url: string): string {
  if (!url) return SITE_URL;
  return url.replace(PUNYCODE_HOST, CYRILLIC_HOST);
}

/**
 * Технический preview-домен, а не рабочий адрес сайта.
 *
 * Preview-домены раздают ту же сборку и тот же robots.txt с «Allow: /»,
 * а canonical до этого собирался из window.location.href — то есть превью
 * ссылалось само на себя и попадало в индекс полной копией сайта. Для поиска
 * это два сайта с одинаковым контентом: он выбирает главный сам и может
 * предпочесть технический адрес.
 */
function isPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h !== CYRILLIC_HOST && h !== PUNYCODE_HOST && h !== "localhost" && !h.startsWith("127.");
}

/**
 * Канонический адрес страницы: без параметров и якоря, без хвостового слэша.
 *
 * Раньше сюда попадал весь window.location.href — значит переход из рекламы
 * (?utm_source=…) или из письма (?paid=1) создавал для поиска отдельный адрес
 * той же страницы. Это плодило дубли: одна страница — десяток «разных» URL.
 */
function canonicalize(url: string): string {
  if (!url) return SITE_URL;
  let clean = normalizeUrl(url).split("#")[0].split("?")[0];
  // С preview-домена канонический адрес обязан указывать на рабочий сайт:
  // путь сохраняем, хост подменяем.
  if (isPreviewHost()) {
    try {
      clean = SITE_URL + new URL(clean).pathname;
    } catch {
      clean = SITE_URL;
    }
  }
  // Хвостовой слэш убираем везде, кроме корня: /courses/ и /courses — одна страница.
  if (clean.length > SITE_URL.length + 1 && clean.endsWith("/")) {
    return clean.slice(0, -1);
  }
  return clean;
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
  statusCode,
  article,
}: SeoProps) {
  // Бренд к заголовку добавляем только если он влезает в выдачу: Яндекс и Google
  // показывают около 65 символов, дальше идёт многоточие. Раньше суффикс клеился
  // всегда — и у половины страниц название обрезалось на полуслове.
  const fullTitle =
    title.includes("УЧИСЬПРО") || title.length + 11 > TITLE_LIMIT
      ? title
      : `${title} — УЧИСЬПРО`;
  const rawUrl = canonical || (typeof window !== "undefined" ? window.location.href : SITE_URL);
  const url = canonicalize(rawUrl);
  const img = normalizeUrl(image);
  // Технический домен закрываем целиком: одного canonical мало, поиск
  // трактует его как подсказку и всё равно может показать копию.
  const blockIndex = noindex || isPreviewHost();

  // Подсказка разработчику: в продакшене молчим, чтобы не шуметь в консоли посетителю.
  if (import.meta.env.DEV) {
    if (fullTitle.length > TITLE_LIMIT) {
      console.warn(
        `[SEO] Заголовок длиннее ${TITLE_LIMIT} символов (${fullTitle.length}) — обрежется в выдаче: «${fullTitle}»`,
      );
    }
    if (description.length > DESC_LIMIT) {
      console.warn(
        `[SEO] Описание длиннее ${DESC_LIMIT} символов (${description.length}) на «${fullTitle}»`,
      );
    }
  }

  return (
    <Helmet>
      <html lang="ru" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta name="theme-color" content="#0a0a14" />

      {statusCode && statusCode !== 200 && (
        <meta name="prerender-status-code" content={String(statusCode)} />
      )}

      {blockIndex ? (
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
      {/* Размеры указываем только для картинки по умолчанию — её формат известен
          точно (1024×1024). Раньше здесь жёстко стояло 1200×630 для любой
          обложки: соцсети верили тегу, резервировали неверную пропорцию и
          показывали превью с обрезкой или полями. Для своих обложек размер
          не заявляем — краулер измерит файл сам. */}
      {img === DEFAULT_IMG && <meta property="og:image:width" content="1024" />}
      {img === DEFAULT_IMG && <meta property="og:image:height" content="1024" />}
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