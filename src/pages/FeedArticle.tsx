import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "@/lib/router-compat";
import { getRouteApi } from "@tanstack/react-router";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import CityArticleNav from "@/components/business2026/CityArticleNav";
import { fetchArticle, fetchFeed } from "@/components/feed/api";
import { FeedArticle as FeedArticleType, CATEGORY_META } from "@/components/feed/types";
import { articleUrl } from "@/components/feed/shareTargets";
import ShareMenuButton from "@/components/feed/ShareMenuButton";
import { LoadingState, LimitedState, NotFoundState } from "@/components/feed/article/FeedArticleStates";
import FeedArticleHeader from "@/components/feed/article/FeedArticleHeader";
import FeedArticleCtas from "@/components/feed/article/FeedArticleCtas";
import FeedArticleFooter from "@/components/feed/article/FeedArticleFooter";
import FeedAudioPlayer from "@/components/feed/article/FeedAudioPlayer";
import FeedArticleSpoiler from "@/components/feed/article/FeedArticleSpoiler";
import SeriesNav from "@/components/feed/article/SeriesNav";
import MasshtabLink from "@/components/masshtab/MasshtabLink";
import { breadcrumbItems } from "@/components/feed/seo";

const route = getRouteApi("/feed/$slug");

// Инлайн-разметка: **жирный** текст и [ссылки](/path) внутри абзацев,
// заголовков и списков.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, idx) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    if (bold) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {bold[1]}
        </strong>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      const isInternal = href.startsWith("/");
      if (isInternal) {
        return (
          <Link
            key={idx}
            to={href}
            className="text-primary font-semibold underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
        >
          {label}
        </a>
      );
    }

    return part;
  });
}

export default function FeedArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const initial = route.useLoaderData()?.seo ?? null;
  const ssrArticle = initial && !initial.seo_only && initial.slug === slug ? initial : null;
  const [article, setArticle] = useState<FeedArticleType | null>(ssrArticle);
  const [related, setRelated] = useState<FeedArticleType[]>([]);
  const [loading, setLoading] = useState(!ssrArticle);
  const [notFound, setNotFound] = useState(false);
  const [limited, setLimited] = useState<{ limit?: number; message?: string } | null>(null);

  useEffect(() => {
    if (!slug) return;
    // Мессенджеры приклеивают к ссылке точку, запятую, скобку или кавычку — убираем и открываем статью.
    const clean = slug.trim().replace(/[\s.,;:!?)\]}»"'…]+$/u, "");
    if (clean && clean !== slug) {
      navigate(`/feed/${clean}${window.location.search}`, { replace: true });
      return;
    }
    // Защита от гонки при быстрой смене статей: не обновляем состояние после размонтирования/смены slug.
    let cancelled = false;
    const hasSsr = !!ssrArticle && ssrArticle.slug === slug;
    if (!hasSsr) {
      setLoading(true);
      setArticle(null);
    }
    setNotFound(false);
    setLimited(null);
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
  const rawBlocks = fullText.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  // Собираем блоки-спойлеры: ":::spoiler Заголовок" ... ":::"
  // Всё между маркерами прячется под кнопку — чтобы в статьях-практикумах
  // человек сначала попробовал сам, а потом открыл разбор.
  const paragraphs: (string | { spoiler: string; body: string[] })[] = [];
  let openSpoiler: { spoiler: string; body: string[] } | null = null;
  rawBlocks.forEach((b) => {
    const start = b.match(/^:::spoiler\s*(.*)$/);
    if (start) {
      openSpoiler = { spoiler: start[1].trim() || "Показать разбор", body: [] };
      return;
    }
    if (/^:::$/.test(b)) {
      if (openSpoiler) paragraphs.push(openSpoiler);
      openSpoiler = null;
      return;
    }
    if (openSpoiler) openSpoiler.body.push(b);
    else paragraphs.push(b);
  });
  if (openSpoiler) paragraphs.push(openSpoiler);

  // Обложка-документ (вертикальный сертификат) — показываем целиком, без обрезки 16:9.
  const isDocCover =
    !!article.cover_url &&
    (/sertifikat|certificate|partnyorskie|partnyorstv|partner|tochka/i.test(article.slug) ||
      (article.tags || []).some((t) => /сертификат|партнёрств|партнерств/i.test(t)));


  return (
    <div className="min-h-screen bg-mesh font-golos text-white">

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
          items={breadcrumbItems(article).map((c, i, all) => (i === all.length - 1 ? { label: c.label } : c))}
          withJsonLd={false}
        />

        <FeedArticleHeader article={article} meta={meta} isDocCover={isDocCover} />

        {article.audio_url && (
          <FeedAudioPlayer src={article.audio_url} title={`Слушать: ${article.title}`} />
        )}

        {/* Контент */}
        <article className="prose-feed text-white/85 text-base md:text-lg leading-relaxed space-y-4 mb-8">
          {paragraphs.map((block, i) => {
            if (typeof block !== "string") {
              return (
                <FeedArticleSpoiler key={i} title={block.spoiler}>
                  {block.body.map((line, j) => (
                    <p key={j}>{renderInline(line)}</p>
                  ))}
                </FeedArticleSpoiler>
              );
            }
            const p = block;
            const h2 = /^##\s+/.test(p);
            const h3 = /^###\s+/.test(p);
            if (h3) {
              return (
                <h3 key={i} className="font-montserrat font-bold text-white text-lg md:text-xl mt-6 mb-1">
                  {renderInline(p.replace(/^###\s+/, ""))}
                </h3>
              );
            }
            if (h2) {
              return (
                <h2 key={i} className="font-montserrat font-black text-white text-xl md:text-2xl mt-8 mb-2">
                  {renderInline(p.replace(/^##\s+/, ""))}
                </h2>
              );
            }
            const lines = p.split(/\n/);
            // Иллюстрация: абзац вида ![подпись](адрес) — график или фото с подписью.
            const img = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(p.trim());
            if (img) {
              const [, alt, src] = img;
              return (
                <figure key={i} className="my-6">
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className="w-full rounded-2xl border border-white/10 bg-[#0b0d16]"
                  />
                  {alt && <figcaption className="mt-2 text-center text-sm text-white/50">{alt}</figcaption>}
                </figure>
              );
            }
            // Цитата: все строки абзаца начинаются с «>»
            const isQuote = lines.length > 0 && lines.every((l) => /^\s*>\s?/.test(l));
            if (isQuote) {
              return (
                <blockquote
                  key={i}
                  className="border-l-4 border-primary/60 bg-white/[0.04] rounded-r-2xl pl-5 pr-4 py-4 my-6 text-white/90 italic"
                >
                  {renderInline(lines.map((l) => l.replace(/^\s*>\s?/, "")).join(" "))}
                </blockquote>
              );
            }
            // Разделитель «---»
            if (/^\s*---+\s*$/.test(p)) {
              return <hr key={i} className="border-white/10 my-8" />;
            }
            // Таблица в markdown: строка заголовка, строка-разделитель вида
            // |---|---|, дальше данные. Без этой ветки таблица выводилась
            // сырым текстом с вертикальными чертами.
            const isTable =
              lines.length >= 2 &&
              /^\s*\|.*\|\s*$/.test(lines[0]) &&
              /^\s*\|[\s:|-]+\|\s*$/.test(lines[1]);
            if (isTable) {
              const cells = (l: string) =>
                l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
              const head = cells(lines[0]);
              const body = lines.slice(2).filter((l) => /\|/.test(l)).map(cells);
              return (
                <div key={i} className="overflow-x-auto my-6 rounded-2xl border border-white/10">
                  <table className="w-full text-sm md:text-base border-collapse">
                    <thead>
                      <tr className="bg-white/[0.06]">
                        {head.map((c, j) => (
                          <th
                            key={j}
                            className="text-left font-montserrat font-bold text-white px-4 py-3 border-b border-white/10"
                          >
                            {renderInline(c)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {body.map((row, j) => (
                        <tr key={j} className="border-b border-white/5 last:border-0">
                          {row.map((c, k) => (
                            <td key={k} className="px-4 py-3 align-top text-white/85">
                              {renderInline(c)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            const isList = lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
            if (isList) {
              return (
                <ul key={i} className="list-disc pl-5 space-y-2 marker:text-primary">
                  {lines.map((l, j) => (
                    <li key={j}>{renderInline(l.replace(/^\s*[-*]\s+/, ""))}</li>
                  ))}
                </ul>
              );
            }
            const isOrderedList = lines.length > 1 && lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
            if (isOrderedList) {
              return (
                <ol key={i} className="list-decimal pl-5 space-y-2 marker:text-primary marker:font-bold">
                  {lines.map((l, j) => (
                    <li key={j}>{renderInline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>
                  ))}
                </ol>
              );
            }
            return <p key={i}>{renderInline(p)}</p>;
          })}
        </article>

        <CityArticleNav slug={article.slug} />
        <SeriesNav slug={article.slug} />

        <FeedArticleCtas article={article} />

        {article.category === "business" && <MasshtabLink place={`article_${article.slug}`.slice(0, 80)} />}

        <FeedArticleFooter article={article} related={related} />
      </main>

      <SiteFooter />
    </div>
  );
}