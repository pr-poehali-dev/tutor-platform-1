import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import ArticleCard from "@/components/feed/ArticleCard";
import { fetchFeed, seedIfEmpty, keepAlive, tickMaxChannel } from "@/components/feed/api";
import { CATEGORY_META, FeedArticle, FeedCategory } from "@/components/feed/types";

const SITE_URL = "https://учисьпро.рф";

type CatFilter = FeedCategory | "all";

export default function Feed() {
  const [category, setCategory] = useState<CatFilter>("all");
  const [items, setItems] = useState<FeedArticle[]>([]);
  const [counts, setCounts] = useState<Partial<Record<FeedCategory, number>>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Ленивый дневной запуск бота канала MAX (бэкенд не чаще 1 раза в сутки)
  useEffect(() => {
    tickMaxChannel();
  }, []);

  useEffect(() => {
    // Защита от гонки запросов: если категория сменилась, пока грузился старый
    // ответ — игнорируем его, чтобы лента не перезаписалась чужим контентом.
    let cancelled = false;

    setPage(1);
    setLoading(true);

    (async () => {
      try {
        const res = await fetchFeed(category, 1);
        if (cancelled) return;
        setItems(res.items || []);
        setCounts(res.category_counts);
        setTotal(res.total);
        setHasMore(res.has_more);

        // Авто-наполнение: если лента полностью пуста — экстренный посев.
        const noContent = (res.items?.length || 0) === 0 && (res.total || 0) === 0;
        if (noContent && category === "all") {
          const seed = await seedIfEmpty();
          if (!cancelled && seed.auto_seeded) {
            setTimeout(async () => {
              const r2 = await fetchFeed(category, 1);
              if (cancelled) return;
              setItems(r2.items || []);
              setCounts(r2.category_counts);
              setTotal(r2.total);
              setHasMore(r2.has_more);
            }, 8000);
          }
          return;
        }

        // Иначе — фоновое обновление: дёргаем keep_alive (rate-limited 25 мин).
        // Старые статьи НЕ удаляются.
        if (category === "all") {
          keepAlive().then((ka) => {
            if (!cancelled && ka.ok && !ka.skipped && (ka.topup_created || 0) > 0) {
              setTimeout(async () => {
                const r2 = await fetchFeed(category, 1);
                if (cancelled) return;
                setItems(r2.items || []);
                setCounts(r2.category_counts);
                setTotal(r2.total);
                setHasMore(r2.has_more);
              }, 6000);
            }
          });
        }
      } catch {
        // Сбой сети не должен оставлять ленту в вечной загрузке.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await fetchFeed(category, next);
      setItems((prev) => [...prev, ...(res.items || [])]);
      setPage(next);
      setHasMore(res.has_more);
    } catch {
      // Сбой подгрузки не ломает уже показанную ленту.
    } finally {
      setLoadingMore(false);
    }
  };

  const featured = items[0];
  const rest = items.slice(1);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Лента УЧИСЬПРО — наука, культура, образование, ИИ и роботы",
      description: "Свежие новости и статьи для школьников: научные открытия, культура, министерство просвещения, разработки нейросетей и роботов. По типу журнала «Хочу всё знать».",
      inLanguage: "ru",
      publisher: { "@type": "Organization", name: "УЧИСЬПРО" },
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Лента — наука, культура, ИИ и роботы | УЧИСЬПРО"
        description="Свежие новости и статьи для школьников: научные открытия, культура, образование, нейросети и роботы. Как журнал «Хочу всё знать», только онлайн."
        canonical={`${SITE_URL}/feed`}
        keywords="лента новостей для школьников, новости науки, новости культуры, минпросвещения, новости ии, новости роботов, хочу всё знать"
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-lg">📡</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Лента" }]} />
          </div>
          <Link
            to="/feed/submit"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:scale-[1.02] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-fuchsia-500/25 transition-transform"
          >
            <Icon name="PenLine" size={14} />
            Опубликовать статью
          </Link>
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 pt-3">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Лента" }]} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-6 pb-16">

        {/* HERO */}
        <section className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-base">📡</span>
            <span className="text-sm text-fuchsia-200 font-bold uppercase tracking-wider">Лента УЧИСЬПРО</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-3 leading-[1.05]">
            <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Хочу всё знать</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Наука, культура, образование, нейросети и роботы — свежие новости простым языком для школьников.
            Можешь и сам публиковать свои статьи!
          </p>
        </section>

        {/* Глобальный охват с приоритетом на Китай */}
        <section className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-cyan-500/10 border border-amber-500/25 rounded-2xl p-4 mb-6 flex items-center gap-3 flex-wrap">
          <div className="text-3xl">🌏</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-montserrat font-black text-sm md:text-base mb-0.5">
              Глобальный охват · 45 источников из 8 стран
            </p>
            <p className="text-white/65 text-xs leading-snug">
              ИИ-куратор собирает новости со всего мира и переводит на русский. Приоритет: <span className="text-amber-200 font-bold">🇨🇳 Китай</span> и <span className="text-amber-200 font-bold">🇷🇺 Россия</span>. Также: 🇯🇵 Япония, 🇰🇷 Корея, 🇮🇳 Индия, 🇺🇸 США, 🇬🇧 Великобритания, 🇺🇳 ЮНЕСКО.
            </p>
          </div>
        </section>

        {/* Фильтры по категориям */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCategory("all")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              category === "all"
                ? "bg-white text-background shadow-lg"
                : "bg-white/8 text-white/70 hover:bg-white/15"
            }`}
          >
            <Icon name="LayoutGrid" size={12} />
            Все ({total})
          </button>
          {(Object.keys(CATEGORY_META) as FeedCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = counts[cat] || 0;
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  active
                    ? `${meta.tone} shadow-lg scale-[1.02]`
                    : "bg-white/[0.03] border-white/10 text-white/65 hover:bg-white/[0.08]"
                }`}
              >
                <span>{meta.emoji}</span>
                {meta.label}
                <span className="text-white/45">·{count}</span>
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-white/45">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3" />
            <p className="text-sm">Загружаю свежие материалы...</p>
          </div>
        )}

        {/* Пустая лента */}
        {!loading && items.length === 0 && (
          <div className="text-center py-16 bg-card/40 rounded-3xl">
            <div className="text-6xl mb-4 opacity-50">📭</div>
            <h3 className="font-montserrat font-black text-white text-xl mb-2">В этой категории пока пусто</h3>
            <p className="text-white/55 text-sm mb-5 max-w-md mx-auto">
              ИИ-куратор скоро принесёт свежие материалы. А пока — можешь стать первым автором!
            </p>
            <Link
              to="/feed/submit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
            >
              <Icon name="PenLine" size={14} />
              Написать первую статью
            </Link>
          </div>
        )}

        {/* Featured + grid */}
        {!loading && items.length > 0 && (
          <>
            {featured && page === 1 && (
              <div className="mb-6">
                <ArticleCard article={featured} variant="wide" />
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {rest.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white font-bold text-sm px-6 py-3 rounded-xl"
                >
                  {loadingMore ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="MoreHorizontal" size={14} />}
                  Показать ещё
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA публикации */}
        <section className="mt-10 bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-cyan-500/15 border border-fuchsia-500/30 rounded-3xl p-6 md:p-8 text-center">
          <div className="text-5xl mb-3">✍️</div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-3xl mb-2">
            У тебя есть, чем поделиться?
          </h2>
          <p className="text-white/75 text-sm md:text-base mb-5 max-w-xl mx-auto">
            Напиши свою статью о науке, культуре, школе, ИИ или роботах. После модерации она появится в общей ленте — и тысячи школьников её прочитают.
          </p>
          <Link
            to="/feed/submit"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-base font-black px-7 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-fuchsia-500/30"
          >
            <Icon name="PenLine" size={16} />
            Написать статью
            <Icon name="ArrowRight" size={14} />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}