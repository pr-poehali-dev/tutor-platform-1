import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { FeedArticle, CATEGORY_META } from "./types";
import ShareMenuButton from "./ShareMenuButton";
import { articleUrl } from "./shareTargets";

interface Props {
  article: FeedArticle;
  variant?: "default" | "wide" | "compact";
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return ""; }
}

// Статья считается новой первые 3 дня после публикации.
function isFresh(iso: string | null): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 3 * 24 * 60 * 60 * 1000;
}

const NEW_BADGE =
  "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white shadow-lg shadow-fuchsia-500/30 animate-pulse";

export default function ArticleCard({ article, variant = "default" }: Props) {
  const meta = CATEGORY_META[article.category];
  const isNew = isFresh(article.published_at);
  const sourceKindLabel = article.source_kind === "user"
    ? "Статья читателя"
    : article.source_kind === "agent"
      ? "ИИ-куратор"
      : "Редакция";

  // Обложка-документ (вертикальный сертификат): вписываем целиком, не обрезаем.
  const isDocCover =
    !!article.cover_url &&
    (/sertifikat|certificate|partnyorskie|partner/i.test(article.slug) ||
      (article.tags || []).some((t) => /сертификат|партнёрств|партнерств/i.test(t)));
  const coverFit = isDocCover
    ? "object-contain bg-[#7c4dff]/15"
    : "object-cover group-hover:scale-105";

  // Флаг страны источника (для зарубежных статей с переводом)
  const countryFlag = !article.source_country || article.source_country === "Россия"
    ? ""
    : article.source_country === "Китай" ? "🇨🇳"
    : article.source_country === "США" ? "🇺🇸"
    : article.source_country === "Великобритания" ? "🇬🇧"
    : article.source_country === "Япония" ? "🇯🇵"
    : article.source_country === "Корея" ? "🇰🇷"
    : article.source_country === "Индия" ? "🇮🇳"
    : article.source_country === "ООН" ? "🇺🇳"
    : "🌐";

  if (variant === "wide") {
    return (
      <Link
        to={`/feed/${article.slug}`}
        className={`group block bg-gradient-to-br ${meta.gradient} border border-white/10 hover:border-white/25 rounded-3xl overflow-hidden transition-all hover:scale-[1.01]`}
      >
        <div className="grid md:grid-cols-5 gap-0">
          <div className="md:col-span-2 aspect-[16/10] md:aspect-auto md:min-h-full relative overflow-hidden bg-white/[0.04]">
            {article.cover_url ? (
              <img
                src={article.cover_url}
                alt={article.title}
                loading="lazy"
                className={`w-full h-full transition-transform duration-500 ${coverFit}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
                {meta.emoji}
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
              {isNew && (
                <span className={NEW_BADGE}>
                  <Icon name="Sparkles" size={10} />
                  Новое
                </span>
              )}
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${meta.tone}`}>
                <span>{meta.emoji}</span>
                {meta.label}
              </span>
            </div>
            {countryFlag && (
              <span
                className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold bg-black/45 backdrop-blur text-white px-2 py-1 rounded-full border border-white/20"
                title={`Источник: ${article.source_country}`}
              >
                <span className="text-sm">{countryFlag}</span>
                <Icon name="Languages" size={10} />
              </span>
            )}
            <div className="absolute bottom-3 right-3">
              <ShareMenuButton url={articleUrl(article.slug)} title={article.title} summary={article.summary} />
            </div>
          </div>
          <div className="md:col-span-3 p-5 md:p-6">
            <h2 className="font-montserrat font-black text-white text-xl md:text-2xl leading-tight mb-2 group-hover:text-cyan-200 transition-colors">
              {article.title}
            </h2>
            {article.summary && (
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-3 line-clamp-3">
                {article.summary}
              </p>
            )}
            <div className="flex items-center gap-3 text-white/45 text-xs flex-wrap">
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={11} />
                {article.reading_time_min} мин чтения
              </span>
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Icon name="Calendar" size={11} />
                  {formatDate(article.published_at)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Icon name="Eye" size={11} />
                {article.views}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                article.source_kind === "user" ? "bg-purple-500/15 text-purple-200" :
                article.source_kind === "agent" ? "bg-cyan-500/15 text-cyan-200" :
                "bg-amber-500/15 text-amber-200"
              }`}>
                {sourceKindLabel}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={`/feed/${article.slug}`}
        className="group flex items-start gap-3 bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/25 rounded-2xl p-3 transition-all"
      >
        <div className="w-16 h-16 rounded-xl bg-white/[0.04] overflow-hidden flex-shrink-0">
          {article.cover_url ? (
            <img src={article.cover_url} alt={article.title} loading="lazy" className={`w-full h-full ${isDocCover ? "object-contain bg-[#7c4dff]/15" : "object-cover"}`} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">{CATEGORY_META[article.category].emoji}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${meta.tone.split(" ")[0]}`}>
            {isNew && (
              <span className="inline-flex items-center gap-0.5 text-fuchsia-300">
                <Icon name="Sparkles" size={9} /> Новое ·
              </span>
            )}
            {meta.label}
            {countryFlag && <span title={article.source_country || ""}>{countryFlag}</span>}
          </p>
          <p className="font-montserrat font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-cyan-200 transition-colors">
            {article.title}
          </p>
          <p className="text-white/45 text-[11px] mt-1">{article.reading_time_min} мин · {formatDate(article.published_at)}</p>
        </div>
      </Link>
    );
  }

  // default
  return (
    <Link
      to={`/feed/${article.slug}`}
      className={`group block bg-gradient-to-br ${meta.gradient} border border-white/10 hover:border-white/25 rounded-3xl overflow-hidden transition-all hover:scale-[1.01]`}
    >
      <div className="aspect-[16/9] relative overflow-hidden bg-white/[0.04]">
        {article.cover_url ? (
          <img
            src={article.cover_url}
            alt={article.title}
            loading="lazy"
            className={`w-full h-full transition-transform duration-500 ${coverFit}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">
            {meta.emoji}
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {isNew && (
            <span className={NEW_BADGE}>
              <Icon name="Sparkles" size={10} />
              Новое
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${meta.tone}`}>
            <span>{meta.emoji}</span>
            {meta.label}
          </span>
        </div>
        {countryFlag && (
          <span
            className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold bg-black/45 backdrop-blur text-white px-2 py-1 rounded-full border border-white/20"
            title={`Переведено · ${article.source_country}`}
          >
            <span className="text-sm">{countryFlag}</span>
            <Icon name="Languages" size={10} />
          </span>
        )}
        <div className="absolute bottom-3 right-3">
          <ShareMenuButton url={articleUrl(article.slug)} title={article.title} summary={article.summary} />
        </div>
      </div>
      <div className="p-4 md:p-5">
        <h3 className="font-montserrat font-black text-white text-base md:text-lg leading-tight mb-2 line-clamp-2 group-hover:text-cyan-200 transition-colors">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-white/65 text-xs md:text-sm leading-relaxed line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}
        <div className="flex items-center gap-3 text-white/45 text-[11px] flex-wrap">
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={10} />
            {article.reading_time_min} мин
          </span>
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Icon name="Calendar" size={10} />
              {formatDate(article.published_at)}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-white/55">
            <Icon name="Eye" size={10} />
            {article.views}
          </span>
        </div>
      </div>
    </Link>
  );
}