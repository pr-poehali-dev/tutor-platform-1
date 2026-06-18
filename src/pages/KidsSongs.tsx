import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import {
  SONGS,
  SONG_CATEGORIES,
  SONG_AGES,
  SongCategory,
  SongAge,
  Song,
  filterSongs,
  getTotalSongDuration,
} from "@/components/kids/songsData";
import SongPlayer from "@/components/kids/SongPlayer";
import NannyFox from "@/components/kids/NannyFox";
import KidsHeroCover from "@/components/kids/KidsHeroCover";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function KidsSongs() {
  const [category, setCategory] = useState<SongCategory | "all">("all");
  const [age, setAge] = useState<SongAge | "all">("all");
  const [query, setQuery] = useState("");
  const [activeSong, setActiveSong] = useState<Song | null>(null);

  const filtered = useMemo(() => {
    const base = filterSongs(category, age);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)) ||
      s.teaches.some((t) => t.toLowerCase().includes(q)),
    );
  }, [category, age, query]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Песенки, потешки и стихи для детей 1–7 лет",
      description:
        "Учим вместе с малышом: народные потешки, пальчиковые игры, авторские песенки про машинки и зверят, считалочки, колыбельные. С подсветкой строк и подсказками для родителя.",
      url: `${SITE_URL}/kids/songs`,
      inLanguage: "ru",
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Учим песни и стихи — детские песенки, потешки, колыбельные | УЧИСЬПРО Малыш"
        description="Раздел «Учим песни и стихи»: народные потешки «Ладушки», «Сорока-белобока», пальчиковые игры, авторские песенки про машинки и зверят, считалочки и колыбельные. Каждая с подсветкой строк и советом родителю."
        canonical={`${SITE_URL}/kids/songs`}
        keywords="детские песенки слушать, потешки, пальчиковые игры, колыбельные, считалочки, песня про трактор, песенки для малышей онлайн, стихи для детей 2 года 3 года"
        jsonLd={jsonLd}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
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
              { label: "Песни и стихи" },
            ]} />
          </div>
          <Link to="/kids" className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Icon name="ArrowLeft" size={14} />
            К Малышу
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
          <Icon name="Music" size={14} className="text-amber-300" />
          <span className="text-sm text-amber-200 font-bold uppercase tracking-wider">Учим песни · {SONGS.length} песенок</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Песенки, потешки и <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">пальчиковые игры</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mb-6">
          Учим вместе! Народные «Ладушки» и «Сорока-белобока», пальчиковые игры, авторские песенки про <b className="text-white">красный трактор и весёлые машинки</b>, считалочки и колыбельные. Каждая строка подсвечивается во время песни, рядом — подсказка-движение для малыша.
        </p>

        <div className="max-w-3xl mb-7">
          <KidsHeroCover
            src="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/1e67ce8e-495c-45ec-8c02-c83c3c504571.jpg"
            alt="Лиса поёт и играет с малышами под музыку"
            caption="Поём, хлопаем и танцуем вместе с Лисой"
            glow="shadow-amber-500/20"
          />
        </div>

        {/* Поиск */}
        <div className="relative mb-5">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: трактор, машинки, счёт, животные..."
            className="w-full bg-white/5 border border-white/12 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-colors"
          />
        </div>

        {/* Фильтры — категории */}
        <div className="space-y-3">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Жанр</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("all")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === "all"
                    ? "bg-amber-500/25 border border-amber-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name="LayoutGrid" size={12} />
                Все
              </button>
              {SONG_CATEGORIES.map((c) => {
                const count = SONGS.filter((s) => s.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      category === c.id
                        ? "bg-amber-500/25 border border-amber-500/45 text-white"
                        : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                    <span className="text-white/40 text-[11px]">· {count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Возраст */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Возраст</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAge("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  age === "all"
                    ? "bg-cyan-500/25 border border-cyan-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                Любой
              </button>
              {SONG_AGES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAge(a.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    age === a.id
                      ? "bg-cyan-500/25 border border-cyan-500/45 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Сетка песенок */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/45">
            <Icon name="SearchX" size={42} className="mx-auto mb-3 opacity-40" />
            <p>Ничего не нашлось. Попробуй сбросить фильтры.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((song) => {
              const totalSec = getTotalSongDuration(song);
              const minutes = Math.max(1, Math.round(totalSec / 60));
              return (
                <button
                  key={song.id}
                  onClick={() => setActiveSong(song)}
                  className="group text-left bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:scale-[1.02] transition-all"
                >
                  <div className={`relative aspect-square bg-gradient-to-br ${song.color} flex items-center justify-center text-6xl md:text-7xl`}>
                    {song.emoji}
                    {/* Кнопка «Играть» по hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
                        <Icon name="Play" size={20} />
                      </div>
                    </div>
                    {/* Бейдж «оригинал УЧИСЬПРО» */}
                    {song.original && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold">
                        ✨ оригинал
                      </div>
                    )}
                    {/* Длительность */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold">
                      {minutes} мин
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-white font-bold text-sm leading-tight truncate group-hover:text-amber-200 transition-colors">
                      {song.title}
                    </p>
                    <p className="text-white/45 text-[11px] mt-0.5 truncate">{song.author}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {song.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-white/55 bg-white/5 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Юридическая плашка */}
        <div className="mt-10 p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex items-start gap-3">
          <Icon name="ShieldCheck" size={16} className="text-emerald-300 mt-0.5 flex-shrink-0" />
          <p className="text-white/55 text-[11px] leading-relaxed">
            Соблюдаем авторское право (ГК РФ ч. IV). В разделе только русский фольклор (общественное достояние) и авторские песенки УЧИСЬПРО, написанные методистом платформы специально для детей. Возрастная маркировка <b className="text-white/80">0+</b> по 436-ФЗ «О защите детей от информации».
          </p>
        </div>
      </section>

      <SiteFooter />
      <NannyFox />

      {activeSong && <SongPlayer song={activeSong} onClose={() => setActiveSong(null)} />}
    </div>
  );
}