import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { fetchArticle, fetchFeed } from "@/components/feed/api";
import { FeedArticle as FeedArticleType, CATEGORY_META } from "@/components/feed/types";
import ArticleCard from "@/components/feed/ArticleCard";
import ShareButtons from "@/components/feed/ShareButtons";
import { articleUrl } from "@/components/feed/shareTargets";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return ""; }
}

export default function FeedArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<FeedArticleType | null>(null);
  const [related, setRelated] = useState<FeedArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setArticle(null);
    window.scrollTo(0, 0);
    fetchArticle(slug).then((data) => {
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setArticle(data);
      // Подгружаем 3 связанных по той же категории
      fetchFeed(data.category, 1).then((res) => {
        setRelated(res.items.filter((a) => a.id !== data.id).slice(0, 3));
      });
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-white">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3 text-cyan-300" />
          <p className="text-white/55 text-sm">Загружаю статью...</p>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-white px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="font-montserrat font-black text-2xl mb-2">Статья не найдена</h1>
          <p className="text-white/65 text-sm mb-5">
            Возможно, она снята с публикации или ссылка устарела.
          </p>
          <button
            onClick={() => navigate("/feed")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold text-sm"
          >
            <Icon name="ArrowLeft" size={14} />
            Вернуться в ленту
          </button>
        </div>
      </div>
    );
  }

  const meta = CATEGORY_META[article.category];
  const paragraphs = (article.content || article.summary).split(/\n+/).filter(Boolean);

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
      image: article.cover_url || undefined,
      mainEntityOfPage: articleUrl(article.slug),
      inLanguage: "ru",
      articleSection: meta.label,
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
          <div className="hidden md:block">
            <Breadcrumbs items={[
              { label: "Главная", href: "/" },
              { label: "Лента", href: "/feed" },
              { label: article.title.slice(0, 60) },
            ]} />
          </div>
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            <Icon name="ArrowLeft" size={12} />
            В ленту
          </Link>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">

        {/* Категория */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Link
            to={`/feed`}
            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${meta.tone}`}
          >
            <span>{meta.emoji}</span>
            {meta.label}
          </Link>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
            article.source_kind === "user" ? "bg-purple-500/15 text-purple-200 border border-purple-500/35" :
            article.source_kind === "agent" ? "bg-cyan-500/15 text-cyan-200 border border-cyan-500/35" :
            "bg-amber-500/15 text-amber-200 border border-amber-500/35"
          }`}>
            {article.source_kind === "user" ? "Статья читателя" : article.source_kind === "agent" ? "ИИ-куратор" : "Редакция"}
          </span>
        </div>

        {/* Заголовок */}
        <h1 className="font-montserrat font-black text-white text-3xl md:text-5xl leading-[1.1] mb-3">
          {article.title}
        </h1>

        {/* Мета */}
        <div className="flex items-center gap-4 text-white/55 text-xs md:text-sm mb-6 flex-wrap">
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Icon name="Calendar" size={13} />
              {formatDate(article.published_at)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={13} />
            {article.reading_time_min} мин чтения
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={13} />
            {article.views} просмотров
          </span>
          {(article.author_display_name || article.source_name) && (
            <span className="flex items-center gap-1">
              <Icon name="User" size={13} />
              {article.author_display_name || article.source_name}
            </span>
          )}
          {article.source_country && article.source_country !== "Россия" && (
            <span className="inline-flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/35 text-cyan-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
              <Icon name="Languages" size={11} />
              Переведено с {(article.source_language || "en") === "en" ? "английского" :
                (article.source_language === "zh" ? "китайского" :
                (article.source_language === "ja" ? "японского" :
                (article.source_language === "ko" ? "корейского" : article.source_language)))}
              · {article.source_country}
            </span>
          )}
        </div>

        {/* Обложка */}
        {article.cover_url && (
          <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-6 border border-white/10">
            <img src={article.cover_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Лид */}
        {article.summary && (
          <p className="text-white/80 text-lg md:text-xl font-medium leading-relaxed mb-6 border-l-4 border-cyan-500/50 pl-4">
            {article.summary}
          </p>
        )}

        {/* Контент */}
        <article className="prose-feed text-white/85 text-base md:text-lg leading-relaxed space-y-4 mb-8">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        {/* CTA «Малыш» — для статей про детей/дошкольников */}
        {article.tags && article.tags.some((t) => ["дети", "развитие детей", "дошкольное образование", "аудиосказки"].includes(t.toLowerCase())) && (
          <div className="relative overflow-hidden rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-600/30 via-rose-500/20 to-amber-500/20 p-5 md:p-6 mb-8 text-center">
            <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="text-4xl mb-2">🦊</div>
              <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
                Откройте «Малыш» прямо сейчас
              </h3>
              <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-4">
                Сказки с озвучкой, обучение чтению, умные игры и песни для детей от 2 лет. Бесплатно, без карты — первое занятие за полминуты.
              </p>
              <Link
                to="/kids"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black px-6 py-3 rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-pink-500/20"
              >
                <Icon name="Sparkles" size={18} />
                Войти в Малыша
              </Link>
            </div>
          </div>
        )}

        {/* CTA олимпиады — для статей с тегом «олимпиада» */}
        {article.tags && article.tags.some((t) => t.toLowerCase() === "олимпиада") && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-purple-700/40 to-cyan-700/30 p-5 md:p-6 mb-8 text-center">
            <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1.5">
                Готов проверить свои силы?
              </h3>
              <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-4">
                Пройди мини-олимпиаду без ошибок и забери главный приз — 5000 ЗНАЕК.
              </p>
              <Link
                to="/olympiad"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-6 py-3 rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/20"
              >
                <Icon name="Rocket" size={18} />
                Участвовать в олимпиаде
              </Link>
            </div>
          </div>
        )}

        {/* Поделиться */}
        <ShareButtons
          url={articleUrl(article.slug)}
          title={article.title}
          summary={article.summary}
        />

        {/* Теги */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/10 text-white/65 text-xs font-bold px-2.5 py-1 rounded-full">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Источник */}
        {article.source_url && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Icon name="ExternalLink" size={18} className="text-white/55 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-white/55 text-[10px] uppercase tracking-wider font-bold mb-0.5">Первоисточник</p>
              <a
                href={article.source_url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-cyan-300 hover:text-cyan-200 text-sm font-bold break-words"
              >
                {article.source_name || article.source_url}
              </a>
            </div>
          </div>
        )}

        {/* Связанные */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
              Похожие материалы
            </h2>
            <div className="space-y-2">
              {related.map((r) => (
                <ArticleCard key={r.id} article={r} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* CTA: написать свою */}
        <section className="mt-10 bg-gradient-to-br from-fuchsia-500/15 to-cyan-500/15 border border-fuchsia-500/30 rounded-3xl p-5 md:p-6 text-center">
          <p className="font-montserrat font-black text-white text-lg md:text-xl mb-2">
            Знаешь интересный факт?
          </p>
          <p className="text-white/65 text-sm mb-3">
            Поделись им со школьниками — напиши свою статью.
          </p>
          <Link
            to="/feed/submit"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="PenLine" size={14} />
            Написать статью
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}