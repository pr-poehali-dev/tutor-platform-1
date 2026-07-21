import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { fetchArticle, fetchFeed } from "@/components/feed/api";
import { FeedArticle as FeedArticleType, CATEGORY_META } from "@/components/feed/types";
import { articleUrl } from "@/components/feed/shareTargets";
import ShareMenuButton from "@/components/feed/ShareMenuButton";
import { LoadingState, LimitedState, NotFoundState } from "@/components/feed/article/FeedArticleStates";
import FeedArticleHeader from "@/components/feed/article/FeedArticleHeader";
import FeedArticleCtas from "@/components/feed/article/FeedArticleCtas";
import FeedArticleFooter from "@/components/feed/article/FeedArticleFooter";
import FeedAudioPlayer from "@/components/feed/article/FeedAudioPlayer";

export default function FeedArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<FeedArticleType | null>(null);
  const [related, setRelated] = useState<FeedArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [limited, setLimited] = useState<{ limit?: number; message?: string } | null>(null);

  useEffect(() => {
    if (!slug) return;
    // Защита от гонки при быстрой смене статей: не обновляем состояние после размонтирования/смены slug.
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setLimited(null);
    setArticle(null);
    window.scrollTo(0, 0);
    fetchArticle(slug).then((data) => {
      if (cancelled) return;
      if (data.limited) {
        setLimited({ limit: data.limit, message: data.message });
        setLoading(false);
        return;
      }
      if (!data.item) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const item = data.item;
      setArticle(item);
      // Подгружаем 3 связанных по той же категории (сбой не критичен).
      fetchFeed(item.category, 1)
        .then((res) => {
          if (cancelled) return;
          setRelated((res.items || []).filter((a) => a.id !== item.id).slice(0, 3));
        })
        .catch(() => { /* связанные статьи необязательны */ });
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      // Сбой загрузки статьи не должен оставлять вечный спиннер.
      setNotFound(true);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return <LoadingState />;
  }

  if (limited) {
    return <LimitedState limited={limited} navigate={navigate} />;
  }

  if (notFound || !article) {
    return <NotFoundState navigate={navigate} />;
  }

  const meta = CATEGORY_META[article.category];
  const fullText = article.content || article.summary;
  const paragraphs = fullText.split(/\n+/).filter(Boolean);
  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;

  // Обложка-документ (вертикальный сертификат) — показываем целиком, без обрезки 16:9.
  const isDocCover =
    !!article.cover_url &&
    (/sertifikat|certificate|partnyorskie|partnyorstv|partner|tochka/i.test(article.slug) ||
      (article.tags || []).some((t) => /сертификат|партнёрств|партнерств/i.test(t)));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.summary || article.title,
      datePublished: article.published_at,
      dateModified: article.published_at || article.created_at,
      dateCreated: article.created_at,
      author: {
        "@type": article.source_kind === "user" ? "Person" : "Organization",
        name: article.author_display_name || article.source_name || "УЧИСЬПРО",
      },
      publisher: {
        "@type": "Organization",
        name: "УЧИСЬПРО",
        logo: {
          "@type": "ImageObject",
          url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg",
        },
      },
      image: article.cover_url ? [article.cover_url] : undefined,
      url: articleUrl(article.slug),
      mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl(article.slug) },
      inLanguage: "ru",
      articleSection: meta.label,
      keywords: (article.tags || []).join(", ") || undefined,
      wordCount,
      timeRequired: `PT${article.reading_time_min || Math.max(1, Math.round(wordCount / 180))}M`,
      isAccessibleForFree: true,
      articleBody: fullText,
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`${article.title} | Лента УЧИСЬПРО`}
        description={article.summary || article.title}
        canonical={articleUrl(article.slug)}
        image={article.cover_url || undefined}
        type="article"
        article={{
          publishedTime: article.published_at,
          modifiedTime: article.published_at,
          author: article.author_display_name || article.source_name || "УЧИСЬПРО",
          section: meta.label,
          tags: article.tags,
        }}
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-lg">📡</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShareMenuButton url={articleUrl(article.slug)} title={article.title} summary={article.summary} />
            <Link
              to="/feed"
              className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              <Icon name="ArrowLeft" size={12} />
              В ленту
            </Link>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">

        <Breadcrumbs
          className="mb-4"
          items={[
            { label: "Главная", href: "/" },
            { label: "Лента", href: "/feed" },
            { label: `${meta.emoji} ${meta.label}`, href: "/feed" },
            { label: article.title },
          ]}
        />

        <FeedArticleHeader article={article} meta={meta} isDocCover={isDocCover} />

        {article.audio_url && (
          <FeedAudioPlayer src={article.audio_url} title={`Слушать: ${article.title}`} />
        )}

        {/* Контент */}
        <article className="prose-feed text-white/85 text-base md:text-lg leading-relaxed space-y-4 mb-8">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        <FeedArticleCtas article={article} />

        <FeedArticleFooter article={article} related={related} />
      </main>

      <SiteFooter />
    </div>
  );
}