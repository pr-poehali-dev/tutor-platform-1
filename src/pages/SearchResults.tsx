import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import SearchBar from "@/components/search/SearchBar";
import { fetchSearch, SearchItem } from "@/components/search/api";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const KIND_LABELS: Record<SearchItem["kind"], { label: string; emoji: string; tone: string }> = {
  page:   { label: "Разделы сайта", emoji: "🧭", tone: "from-purple-500/20 to-fuchsia-500/10 border-purple-500/30" },
  feed:   { label: "Статьи ленты",  emoji: "📡", tone: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30" },
  course: { label: "Курсы",         emoji: "📚", tone: "from-amber-500/20 to-orange-500/10 border-amber-500/30" },
  lesson: { label: "Уроки",         emoji: "🎯", tone: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30" },
};

const KIND_ORDER: SearchItem["kind"][] = ["page", "feed", "course", "lesson"];

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [items, setItems] = useState<SearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeKind, setActiveKind] = useState<SearchItem["kind"] | "all">("all");

  useEffect(() => {
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSearch(q, 50).then((res) => {
      setItems(res.items);
      setTotal(res.total);
      setLoading(false);
    });
  }, [q]);

  // Группировка по типу
  const groups: Partial<Record<SearchItem["kind"], SearchItem[]>> = {};
  for (const it of items) {
    if (!groups[it.kind]) groups[it.kind] = [];
    groups[it.kind]!.push(it);
  }

  const visibleItems = activeKind === "all" ? items : (groups[activeKind] || []);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={q ? `«${q}» — результаты поиска · УЧИСЬПРО` : "Поиск по сайту · УЧИСЬПРО"}
        description={`Поиск по образовательной платформе УЧИСЬПРО: курсы, темы, статьи, новости, разделы сайта.${q ? ` Запрос: ${q}` : ""}`}
        canonical={`${SITE_URL}/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
        noindex={!!q}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-lg">🔎</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Поиск" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-6 pb-16">

        <section className="mb-6">
          <div className="inline-flex items-center gap-2 bg-fuchsia-500/15 border border-fuchsia-500/35 rounded-full px-4 py-1.5 mb-3">
            <Icon name="Search" size={12} className="text-fuchsia-300" />
            <span className="text-xs text-fuchsia-200 font-bold uppercase tracking-wider">Поиск по сайту</span>
          </div>
          <h1 className="font-montserrat font-black text-2xl md:text-4xl mb-4">
            {q ? <>Результаты по «<span className="text-cyan-300">{q}</span>»</> : "Что ты хочешь найти?"}
          </h1>

          <SearchBar variant="hero" autoFocus={!q} />
        </section>

        {q && (
          <>
            {loading && (
              <div className="text-center py-12 text-white/45">
                <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-2" />
                <p className="text-sm">Ищу везде…</p>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="bg-card/40 rounded-3xl text-center py-12 px-5">
                <div className="text-6xl mb-3 opacity-50">🤷‍♂️</div>
                <h2 className="font-montserrat font-black text-white text-xl mb-2">Ничего не найдено</h2>
                <p className="text-white/55 text-sm mb-4 max-w-md mx-auto">
                  Попробуй другие слова, поищи по теме (например, «ЕГЭ» или «нейросети») или загляни в основные разделы.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/courses" className="bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg">📚 Курсы</Link>
                  <Link to="/exam-bank" className="bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg">🎓 ОГЭ/ЕГЭ</Link>
                  <Link to="/feed" className="bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg">📡 Лента</Link>
                  <Link to="/graduate" className="bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg">🎓 Выпускник</Link>
                </div>
              </div>
            )}

            {!loading && items.length > 0 && (
              <>
                {/* Фильтры по типу */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <button
                    onClick={() => setActiveKind("all")}
                    className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                      activeKind === "all" ? "bg-white text-background shadow-lg" : "bg-white/8 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    Все · {total}
                  </button>
                  {KIND_ORDER.map((k) => {
                    const g = groups[k];
                    if (!g || g.length === 0) return null;
                    const m = KIND_LABELS[k];
                    return (
                      <button
                        key={k}
                        onClick={() => setActiveKind(k)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                          activeKind === k ? "bg-white text-background shadow-lg" : "bg-white/8 text-white/70 hover:bg-white/15"
                        }`}
                      >
                        <span>{m.emoji}</span>
                        {m.label}
                        <span className="opacity-65">· {g.length}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Список результатов */}
                <div className="space-y-2">
                  {visibleItems.map((it, idx) => {
                    const m = KIND_LABELS[it.kind];
                    return (
                      <Link
                        key={`${it.kind}-${it.url}-${idx}`}
                        to={it.url}
                        className={`group flex items-start gap-3 bg-gradient-to-br ${m.tone} border rounded-2xl p-4 hover:scale-[1.01] transition-all`}
                      >
                        <div className="text-3xl flex-shrink-0">{it.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/55">{it.category}</span>
                          </div>
                          <h3 className="font-montserrat font-black text-white text-base md:text-lg leading-tight mb-1 group-hover:text-cyan-200 transition-colors">
                            {it.title}
                          </h3>
                          {it.subtitle && (
                            <p className="text-white/65 text-sm leading-snug line-clamp-2">{it.subtitle}</p>
                          )}
                        </div>
                        <Icon name="ArrowUpRight" size={16} className="text-white/45 flex-shrink-0 mt-1 group-hover:text-cyan-200 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {!q && (
          <div className="bg-card/40 rounded-3xl p-6 mt-6">
            <p className="text-white/65 text-sm mb-3">Например, попробуй:</p>
            <div className="flex flex-wrap gap-2">
              {["ЕГЭ математика", "Физика 9 класс", "Курсы химии", "Чек-лист до ЕГЭ", "Профориентация", "Новости ИИ", "Малыш 1+", "Рисовашка"].map((p) => (
                <Link
                  key={p}
                  to={`/search?q=${encodeURIComponent(p)}`}
                  className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/85 text-xs px-3 py-2 rounded-lg"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
