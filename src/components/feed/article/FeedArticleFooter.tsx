import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FeedArticle as FeedArticleType } from "@/components/feed/types";
import ArticleCard from "@/components/feed/ArticleCard";
import ShareButtons from "@/components/feed/ShareButtons";
import { articleUrl } from "@/components/feed/shareTargets";

interface Props {
  article: FeedArticleType;
  related: FeedArticleType[];
}

export default function FeedArticleFooter({ article, related }: Props) {
  return (
    <>
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
    </>
  );
}
