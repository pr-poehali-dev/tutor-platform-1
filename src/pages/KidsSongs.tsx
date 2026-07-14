import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import func2url from "../../backend/func2url.json";
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
  getSunoStyle,
  getSunoLyrics,
  getSongAvatar,
} from "@/components/kids/songsData";
import SongPlayer from "@/components/kids/SongPlayer";
import NannyFox from "@/components/kids/NannyFox";
import KidsHeroCover from "@/components/kids/KidsHeroCover";
import KidsGuard from "@/components/kids/KidsGuard";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function KidsSongs() {
  const [category, setCategory] = useState<SongCategory | "all">("all");
  const [age, setAge] = useState<SongAge | "all">("all");
  const [query, setQuery] = useState("");
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  // Карта готовых студийных треков {song_id: audioUrl}, сгенерированных через polza.ai
  const [readyAudio, setReadyAudio] = useState<Record<string, string>>({});
  // id песен, которые сейчас готовятся (в очереди генерации)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const SONG_URL = (func2url as Record<string, string>)["song-generator"];

  /** Полный цикл обслуживания песен: забрать готовые, обновить список,
   *  запустить генерацию недостающих. Вызывается при заходе и по кнопке. */
  const refresh = useCallback(async () => {
    if (!SONG_URL) return;
    setRefreshing(true);
    try {
      // 1) Забираем готовые из очереди
      await fetch(`${SONG_URL}?action=finalize`).catch(() => {});
      // 2) Актуальный список готовых + что в очереди
      const listRes = await fetch(`${SONG_URL}?action=list`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      const ready: Record<string, string> = (listRes && listRes.songs) || {};
      const pending: string[] = (listRes && listRes.pending) || [];
      setReadyAudio(ready);
      setPendingIds(new Set(pending));

      // 3) Запускаем генерацию недостающих (не готовых и не в очереди).
      //    До 3 песен за заход — чтобы каталог «допелся» живым вокалом быстрее,
      //    как только провайдер станет доступен. Если провайдер лежит (503),
      //    запросы просто вернут ошибку и песни останутся ждать следующего цикла.
      const missing = SONGS.filter((s) => !ready[s.id] && !pending.includes(s.id));
      const batch = missing.slice(0, 3);
      if (batch.length > 0) {
        setPendingIds((prev) => {
          const n = new Set(prev);
          batch.forEach((s) => n.add(s.id));
          return n;
        });
        await Promise.all(
          batch.map(async (song) => {
            const gen = await fetch(`${SONG_URL}?action=generate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                song_id: song.id,
                title: song.title.slice(0, 80),
                style: getSunoStyle(song),
                version: "V4_5",
                prompt: getSunoLyrics(song),
              }),
            }).then((r) => (r.ok || r.status === 202 ? r.json() : null)).catch(() => null);
            if (gen && gen.audioUrl) {
              setReadyAudio((prev) => ({ ...prev, [song.id]: gen.audioUrl }));
              setPendingIds((prev) => { const n = new Set(prev); n.delete(song.id); return n; });
            }
          }),
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, [SONG_URL]);

  // При заходе — обслуживаем каталог. Пока есть готовящиеся песни — тихо
  // перепроверяем каждые 60 сек, чтобы забрать готовое без перезагрузки.
  useEffect(() => {
    let cancelled = false;
    refresh();
    const timer = setInterval(() => {
      if (!cancelled) refresh();
    }, 60000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [refresh]);

  // Подмешиваем готовый вокал в песню, если он уже сгенерирован
  const withAudio = (s: Song): Song =>
    readyAudio[s.id] ? { ...s, audioUrl: readyAudio[s.id] } : s;

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
    <KidsGuard activityId="songs">
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

      {/* Статус живого вокала + ручное обновление */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 mb-4">
        <div className="flex items-center gap-3 flex-wrap bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
          <span className="text-lg">🎤</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-tight">
              Живой вокал: {Object.keys(readyAudio).length} из {SONGS.length} песен
            </p>
            <p className="text-white/50 text-[11px] leading-snug">
              {pendingIds.size > 0
                ? `Готовим ещё ${pendingIds.size} — песни допоются сами, загляни попозже`
                : Object.keys(readyAudio).length < SONGS.length
                ? "Остальные песни допоются автоматически при следующих заходах"
                : "Все песни поются живым голосом под музыку"}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <Icon name={refreshing ? "Loader" : "RefreshCw"} size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Обновляю…" : "Обновить песни"}
          </button>
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
            {filtered.map((rawSong) => {
              const song = withAudio(rawSong);
              const totalSec = getTotalSongDuration(song);
              const minutes = Math.max(1, Math.round(totalSec / 60));
              return (
                <button
                  key={song.id}
                  onClick={() => setActiveSong(song)}
                  className="group text-left bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:scale-[1.02] transition-all"
                >
                  <div className={`relative aspect-square bg-gradient-to-br ${song.color} flex items-center justify-center text-6xl md:text-7xl overflow-hidden`}>
                    <img
                      src={getSongAvatar(song)}
                      alt={song.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
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
                    {/* Бейдж «Живой вокал» — у песни есть готовый студийный трек */}
                    {song.audioUrl ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[10px] font-black shadow-sm shadow-pink-500/40 flex items-center gap-0.5">
                        🎤 вокал
                      </div>
                    ) : pendingIds.has(song.id) ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-amber-200 text-[10px] font-bold flex items-center gap-1">
                        <Icon name="Loader" size={9} className="animate-spin" />
                        готовится
                      </div>
                    ) : null}
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
    </KidsGuard>
  );
}