import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { FeedArticle as FeedArticleType } from "@/components/feed/types";
import { formatDate } from "./formatDate";

interface Props {
  article: FeedArticleType;
  meta: { emoji: string; label: string; tone: string };
  isDocCover: boolean;
}

/**
 * Статьи, у которых обложка (сертификат/баннер) должна вести не на саму
 * картинку, а на внешнюю партнёрскую ссылку. Ключ — slug статьи.
 */
const COVER_EXTERNAL_LINKS: Record<string, string> = {
  "grant-ai-ru-partnyorstvo-tochka-bank-marketplace":
    "https://partner.tochka.com?referer1=6312223437",
};

export default function FeedArticleHeader({ article, meta, isDocCover }: Props) {
  const coverLink = COVER_EXTERNAL_LINKS[article.slug];
  const coverHref = coverLink || article.cover_url || "";
  const isPartnerLink = Boolean(coverLink);
  return (
    <>
      {/* Хлебные крошки (видны всегда + BreadcrumbList JSON-LD) */}
      <div className="mb-4">
        <Breadcrumbs items={[
          { label: "Главная", href: "/" },
          { label: "Лента", href: "/feed" },
          { label: meta.label, href: "/feed" },
          { label: article.title.slice(0, 60) },
        ]} />
      </div>

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
        isDocCover ? (
          // Вертикальный документ (сертификат): показываем целиком, без обрезки
          <a
            href={coverHref}
            target="_blank"
            rel="noopener noreferrer"
            title={isPartnerLink ? "Перейти на сайт партнёра" : "Открыть сертификат в полном размере"}
            className="group block rounded-3xl overflow-hidden mb-6 border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 md:p-6"
          >
            <img
              src={article.cover_url}
              alt={article.title}
              loading="eager"
              className="mx-auto w-auto max-w-full max-h-[80vh] rounded-xl shadow-2xl shadow-black/40 group-hover:scale-[1.01] transition-transform"
            />
            <span className="mt-3 flex items-center justify-center gap-1.5 text-white/55 group-hover:text-white/80 text-xs transition-colors">
              <Icon name={isPartnerLink ? "ExternalLink" : "ZoomIn"} size={13} />
              {isPartnerLink
                ? "Нажмите на сертификат, чтобы перейти к партнёру"
                : "Нажмите, чтобы открыть сертификат в полном размере"}
            </span>
          </a>
        ) : (
          <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-6 border border-white/10">
            <img src={article.cover_url} alt={article.title} loading="eager" className="w-full h-full object-cover" />
          </div>
        )
      )}

      {/* Лид */}
      {article.summary && (
        <p className="text-white/80 text-lg md:text-xl font-medium leading-relaxed mb-6 border-l-4 border-cyan-500/50 pl-4">
          {article.summary}
        </p>
      )}
    </>
  );
}