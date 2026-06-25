import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import DirectionCard from "@/components/techtrends/DirectionCard";
import MaxChannelsBlock from "@/components/techtrends/MaxChannelsBlock";
import { fetchTrendsDashboard, seedTrendsIfEmpty, tickTrends, TrendsDashboard } from "@/components/techtrends/api";

const CATEGORY_LABELS: Record<string, string> = {
  lang: "Языки",
  ai: "ИИ / ML",
  data: "Данные",
  devops: "DevOps",
  web: "Веб",
  mobile: "Мобайл",
  security: "Безопасность",
  iot: "IoT",
};

export default function TechTrends() {
  const [data, setData] = useState<TrendsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Ленивый дневной запуск конвейера (резерв к внешнему cron, бэкенд сам лимитирует раз в сутки)
  useEffect(() => {
    tickTrends();
  }, []);

  useEffect(() => {
    (async () => {
      let res = await fetchTrendsDashboard();
      // Если сигналов ещё нет — запускаем авто-посев и перезагружаем данные.
      if (res && res.total_signals === 0) {
        const seed = await seedTrendsIfEmpty();
        if (seed.auto_seeded) {
          res = await fetchTrendsDashboard();
        }
      }
      setData(res);
      setLoading(false);
    })();
  }, []);

  const sorted = useMemo(() => {
    const dirs = data?.directions ? [...data.directions] : [];
    dirs.sort((a, b) => b.score - a.score);
    return filter === "all" ? dirs : dirs.filter((d) => d.category === filter);
  }, [data, filter]);

  const categories = useMemo(() => {
    const set = new Set((data?.directions || []).map((d) => d.category));
    return Array.from(set);
  }, [data]);

  const topRising = useMemo(() => {
    return (data?.directions || [])
      .filter((d) => d.momentum > 5 && d.signals_7d > 0)
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, 3);
  }, [data]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Seo
        title="Тренды программирования: рейтинг перспективных IT-направлений"
        description="ИИ-аналитика трендов программирования: рейтинг языков и технологий, динамика спроса, перспективные направления для изучения и карьеры. Данные из открытых IT-источников, обновляется автоматически."
        canonical="https://учисьпро.рф/tech-trends"
        keywords="тренды программирования, перспективные языки программирования, что учить в 2026, IT-направления, аналитика технологий, какой язык учить, востребованные технологии"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-5"
          items={[
            { label: "Главная", href: "/" },
            { label: "Тренды программирования" },
          ]}
        />

        {/* Заголовок */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 mb-4">
            <Icon name="Cpu" size={14} className="text-sky-300" />
            <span className="text-sky-300 text-xs font-bold uppercase tracking-wide">ИИ-аналитика</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
            Тренды программирования
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl">
            Наш ИИ непрерывно анализирует открытые IT-источники и определяет, какие направления
            программирования растут, где спрос и что стоит изучать. Рейтинг обновляется автоматически.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Icon name="Loader2" size={32} className="animate-spin text-sky-400" />
          </div>
        ) : !data || data.directions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-5xl mb-4">📡</div>
            <h2 className="font-montserrat font-bold text-xl text-white mb-2">Собираем данные</h2>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              ИИ-аналитик уже изучает IT-источники. Первый рейтинг появится здесь совсем скоро —
              загляни позже.
            </p>
          </div>
        ) : (
          <>
            {/* Метрики сверху */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-white/50 text-xs mb-1">Направлений</div>
                <div className="font-montserrat font-black text-2xl text-white">{data.directions.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-white/50 text-xs mb-1">Сигналов собрано</div>
                <div className="font-montserrat font-black text-2xl text-sky-300">{data.total_signals}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-white/50 text-xs mb-1">Растут</div>
                <div className="font-montserrat font-black text-2xl text-emerald-300">{topRising.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-white/50 text-xs mb-1">Лидер</div>
                <div className="font-montserrat font-black text-lg text-white truncate">
                  {sorted[0]?.emoji} {sorted[0]?.name}
                </div>
              </div>
            </div>

            {/* Фильтр по категориям */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  filter === "all"
                    ? "bg-sky-500/20 text-sky-200 border border-sky-500/40"
                    : "bg-white/5 text-white/60 border border-white/10 hover:text-white"
                }`}
              >
                Все
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    filter === c
                      ? "bg-sky-500/20 text-sky-200 border border-sky-500/40"
                      : "bg-white/5 text-white/60 border border-white/10 hover:text-white"
                  }`}
                >
                  {CATEGORY_LABELS[c] || c}
                </button>
              ))}
            </div>

            {/* Сетка направлений */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {sorted.map((dir, i) => (
                <DirectionCard key={dir.key} dir={dir} index={i} />
              ))}
            </div>

            {/* IT-каналы в MAX */}
            <MaxChannelsBlock channels={data.channels || []} />

            {/* CTA к Ленте */}
            <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 p-6 md:p-8 text-center">
              <h2 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
                Глубокие аналитические отчёты — в Ленте
              </h2>
              <p className="text-white/65 text-sm md:text-base mb-5 max-w-xl mx-auto">
                ИИ-аналитик регулярно пишет подробные разборы перспективных направлений: где
                применяется, стоит ли изучать и с чего начать.
              </p>
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:scale-[1.02] transition-transform"
              >
                <Icon name="Newspaper" size={18} />
                Читать отчёты в Ленте
              </Link>
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}