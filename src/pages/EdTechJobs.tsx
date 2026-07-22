import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import EdTechSchoolCard from "@/components/edtech/EdTechSchoolCard";
import {
  EDTECH_SCHOOLS,
  SEGMENTS,
  HIRING_LABELS,
  HiringStatus,
  SchoolSegment,
  countActiveHiring,
} from "@/components/edtech/edtechSchoolsData";

const HIRING_FILTERS: { id: HiringStatus | "all"; label: string }[] = [
  { id: "all", label: "Любой статус" },
  { id: "active", label: "Активно нанимает" },
  { id: "regular", label: "Регулярный набор" },
  { id: "occasional", label: "Точечный набор" },
];

const REMOTE_FILTERS: { id: "all" | "remote" | "office"; label: string }[] = [
  { id: "all", label: "Любой формат" },
  { id: "remote", label: "Удалёнка" },
  { id: "office", label: "Офлайн / гибрид" },
];

export default function EdTechJobsPage() {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<SchoolSegment | "all">("all");
  const [hiring, setHiring] = useState<HiringStatus | "all">("all");
  const [remote, setRemote] = useState<"all" | "remote" | "office">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EDTECH_SCHOOLS.filter((s) => {
      if (segment !== "all" && s.segment !== segment) return false;
      if (hiring !== "all" && s.hiring !== hiring) return false;
      if (remote === "remote" && !s.remote) return false;
      if (remote === "office" && s.remote) return false;
      if (q) {
        const blob = [s.name, s.note, ...s.subjects, ...s.roles].join(" ").toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      const order: Record<HiringStatus, number> = { active: 0, regular: 1, occasional: 2 };
      return order[a.hiring] - order[b.hiring];
    });
  }, [query, segment, hiring, remote]);

  const activeCount = countActiveHiring();

  const resetAll = () => {
    setQuery("");
    setSegment("all");
    setHiring("all");
    setRemote("all");
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="EdTech-работодатели — где онлайн-школы ищут преподавателей | УЧИСЬПРО"
        description="Карта онлайн-школ России, которые нанимают преподавателей, кураторов и методистов. Поиск по направлениям, статусу найма и формату работы. Прямые ссылки на вакансии школ."
        canonical="https://xn--h1agdcde2c.xn--p1ai/edtech-jobs"
        keywords="работа преподавателем онлайн, вакансии в онлайн-школах, edtech вакансии, преподаватель удалённо, работа репетитором онлайн, куратор онлайн-школы"
      />

      {/* Header bar */}
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" aria-label="Шапка сайта">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="На главную УЧИСЬПРО">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "EdTech-работодатели" }]} />
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-5 transition-colors">
            <Icon name="ArrowLeft" size={14} />
            На главную
          </Link>

          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-3.5 py-1 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
              {activeCount} школ активно нанимают
            </span>
          </div>

          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
            Где онлайн-школы <span className="gradient-text-purple">ищут преподавателей</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mb-6">
            Карта EdTech-работодателей России: {EDTECH_SCHOOLS.length} школ, которые нанимают
            преподавателей, кураторов, наставников и методистов. Фильтруйте по направлению
            и формату работы — и переходите прямо на страницу вакансий школы.
          </p>

          {/* Мини-статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: "Building2", value: EDTECH_SCHOOLS.length, label: "школ в базе" },
              { icon: "Zap", value: activeCount, label: "активно нанимают" },
              { icon: "Wifi", value: EDTECH_SCHOOLS.filter((s) => s.remote).length, label: "с удалёнкой" },
              { icon: "LayoutGrid", value: SEGMENTS.length - 1, label: "направлений" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-white/10 rounded-2xl p-4">
                <Icon name={stat.icon} size={18} className="text-purple-300 mb-2" />
                <p className="font-montserrat font-black text-2xl text-white leading-none">{stat.value}</p>
                <p className="text-white/50 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Фильтры */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pb-6 space-y-4">
          {/* Поиск */}
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск: английский, программирование, ЕГЭ, куратор…"
              className="w-full bg-card border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          {/* Направления */}
          <div className="flex flex-wrap gap-2">
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSegment(s.id)}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl border transition-colors ${
                  segment === s.id
                    ? "bg-purple-500/25 border-purple-400/50 text-white"
                    : "bg-card border-white/10 text-white/60 hover:text-white hover:border-white/25"
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Статус найма + формат */}
          <div className="flex flex-wrap items-center gap-2">
            {HIRING_FILTERS.map((h) => (
              <button
                key={h.id}
                onClick={() => setHiring(h.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                  hiring === h.id
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                    : "bg-white/5 border-white/10 text-white/55 hover:text-white"
                }`}
              >
                {h.label}
              </button>
            ))}
            <span className="w-px h-5 bg-white/10 mx-1 hidden md:inline-block" />
            {REMOTE_FILTERS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRemote(r.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                  remote === r.id
                    ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                    : "bg-white/5 border-white/10 text-white/55 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-white/50 text-sm">
              Найдено школ: <span className="text-white font-bold">{filtered.length}</span>
            </p>
            {(query || segment !== "all" || hiring !== "all" || remote !== "all") && (
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors"
              >
                <Icon name="RefreshCw" size={14} />
                Сбросить
              </button>
            )}
          </div>
        </section>

        {/* Сетка школ */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pb-12">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white/60 mb-4">По вашему запросу школ не нашлось.</p>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-200 text-sm font-bold px-4 py-2 rounded-xl hover:bg-purple-500/25 transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((school) => (
                <EdTechSchoolCard key={school.id} school={school} />
              ))}
            </div>
          )}
        </section>

        {/* Дисклеймер — честно о данных */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-start gap-3">
            <Icon name="Info" size={18} className="text-white/50 mt-0.5 flex-shrink-0" />
            <p className="text-white/50 text-xs leading-relaxed">
              Справочник собран по публично известным онлайн-школам России. Статус найма — наша
              экспертная оценка активности набора, а не гарантия открытой вакансии в конкретный
              момент. Актуальность вакансий и условия проверяйте на официальных страницах школ по
              кнопке «Смотреть вакансии». Названия и логотипы принадлежат их правообладателям.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
