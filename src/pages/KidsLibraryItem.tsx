import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import TalePlayer from "@/components/kids/TalePlayer";
import TalePlayerBoundary from "@/components/kids/TalePlayerBoundary";
import { getLibraryItem, LIBRARY } from "@/components/kids/libraryData";

const SITE_URL = "https://учисьпро.рф";

export default function KidsLibraryItem() {
  const { id = "" } = useParams();
  const item = getLibraryItem(id);

  // Похожие произведения той же категории
  const similar = useMemo(() => {
    if (!item) return [];
    return LIBRARY.filter((it) => it.id !== item.id && it.category === item.category).slice(0, 3);
  }, [item]);

  // Следующее произведение для авто-перехода:
  //  1) приоритет — следующее в той же категории (по порядку в LIBRARY);
  //  2) если в категории больше нет — следующее по общему списку;
  //  3) циклически — если мы в самом конце, берём первое в той же категории.
  const nextItem = useMemo(() => {
    if (!item) return null;
    const sameCategory = LIBRARY.filter((it) => it.category === item.category);
    const sameIdx = sameCategory.findIndex((it) => it.id === item.id);
    if (sameIdx !== -1 && sameIdx + 1 < sameCategory.length) {
      return sameCategory[sameIdx + 1];
    }
    // Следующее по общему порядку
    const globalIdx = LIBRARY.findIndex((it) => it.id === item.id);
    if (globalIdx !== -1 && globalIdx + 1 < LIBRARY.length) {
      return LIBRARY[globalIdx + 1];
    }
    // Циклически — возвращаемся к первому в той же категории (но не к самому себе)
    if (sameCategory.length > 1) {
      return sameCategory[0].id === item.id ? sameCategory[1] : sameCategory[0];
    }
    // Совсем последний — возвращаем самое первое произведение всей библиотеки (если не сами)
    return LIBRARY[0] && LIBRARY[0].id !== item.id ? LIBRARY[0] : null;
  }, [item]);

  if (!item) return <Navigate to="/kids/library" replace />;

  const canonical = `${SITE_URL}/kids/library/${item.id}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: item.title,
      author: { "@type": "Person", name: item.author },
      inLanguage: "ru",
      url: canonical,
      audience: { "@type": "PeopleAudience", suggestedMinAge: 1, suggestedMaxAge: 7 },
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`${item.title} — ${item.author}, слушать с озвучкой`}
        description={`${item.title} (${item.author}). Аудио-сказка для детей ${item.ages.join(", ")} лет. Озвучка голосом ИИ. Общественное достояние. УЧИСЬПРО Малыш.`}
        canonical={canonical}
        keywords={`${item.title} слушать, ${item.author} для детей, ${item.tags.join(", ")}, аудиосказка, читает голос`}
        jsonLd={jsonLd}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: (i % 3) + 1 + "px",
                 height: (i % 3) + 1 + "px",
                 left: ((i * 137.5) % 100) + "%",
                 top: ((i * 97.3) % 100) + "%",
                 opacity: 0.1 + (i % 4) * 0.06,
               }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[
              { label: "Главная", href: "/" },
              { label: "Малыш", href: "/kids" },
              { label: "Библиотека", href: "/kids/library" },
              { label: item.title },
            ]} />
          </div>
          <Link to="/kids/library" className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Icon name="ArrowLeft" size={14} />
            Библиотека
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-8 md:pt-10 pb-16">
        <Link to="/kids/library" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-5 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          К библиотеке
        </Link>

        <TalePlayerBoundary>
          <TalePlayer item={item} nextItem={nextItem} />
        </TalePlayerBoundary>

        {/* Похожие */}
        {similar.length > 0 && (
          <section className="mt-10">
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-3">Похожие произведения</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {similar.map((it) => (
                <Link
                  key={it.id}
                  to={`/kids/library/${it.id}`}
                  className="group bg-card border border-white/10 rounded-2xl p-4 hover:border-white/25 transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${it.color} flex items-center justify-center text-2xl mb-3`}>
                    {it.emoji}
                  </div>
                  <p className="font-montserrat font-black text-white text-sm leading-tight mb-1 line-clamp-2">{it.title}</p>
                  <p className="text-white/45 text-[11px] line-clamp-1">{it.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}