import { useEffect, useMemo, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import PracticeSolver from "@/components/practice/PracticeSolver";
import { PracticeProblem, Difficulty } from "@/components/practice/types";

interface Props {
  storageKey: string;
  problems: PracticeProblem[];
  topics: { id: string; label: string; emoji: string }[];
  accent: string; // "from-emerald-500 to-teal-500"
  subjectName: string;
  subjectGenitive: string;
  subjectSlug: string;
  emoji: string;
  badge: string;
  h1Highlight: ReactNode;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonical: string;
  parentLandingHref: string;
  parentLandingLabel: string;
}

const DIFFS: { id: Difficulty | "all"; label: string }[] = [
  { id: "all", label: "Любая сложность" },
  { id: "easy", label: "Легко" },
  { id: "medium", label: "Средне" },
  { id: "hard", label: "Сложно" },
];

export default function PracticeLayout(p: Props) {
  const [topic, setTopic] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [solved, setSolved] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(p.storageKey);
      if (raw) setSolved(new Set(JSON.parse(raw)));
    } catch { /* noop */ }
  }, [p.storageKey]);

  const markSolved = (id: number) => {
    setSolved((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(p.storageKey, JSON.stringify([...next])); } catch { /* noop */ }
      return next;
    });
  };

  const resetProgress = () => {
    setSolved(new Set());
    try { localStorage.removeItem(p.storageKey); } catch { /* noop */ }
  };

  const filtered = useMemo(
    () => p.problems.filter((pr) => {
      if (topic !== "all" && pr.topic !== topic) return false;
      if (difficulty !== "all" && pr.difficulty !== difficulty) return false;
      return true;
    }),
    [p.problems, topic, difficulty],
  );

  const progress = Math.round((solved.size / p.problems.length) * 100);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: p.seoTitle,
      description: p.seoDescription,
      learningResourceType: "Problem set",
      inLanguage: "ru",
      url: p.canonical,
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={p.seoTitle}
        description={p.seoDescription}
        canonical={p.canonical}
        keywords={p.seoKeywords}
        jsonLd={jsonLd}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: (i % 3) + 1 + "px",
                 height: (i % 3) + 1 + "px",
                 left: ((i * 137.5) % 100) + "%",
                 top: ((i * 97.3) % 100) + "%",
                 opacity: 0.12 + (i % 4) * 0.08,
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
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: p.subjectName, href: p.parentLandingHref }, { label: "Задачи-тренажёр" }]} />
          </div>
          <Link
            to="/courses"
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="Sparkles" size={14} />
            Все курсы
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-6">
        <Link to={p.parentLandingHref} className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          {p.parentLandingLabel}
        </Link>

        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${p.accent} bg-opacity-20 border border-white/20 rounded-full px-4 py-1.5 mb-5`}
                 style={{ background: "rgba(255,255,255,0.06)" }}>
              <span className="text-base">{p.emoji}</span>
              <span className="text-sm text-white font-bold uppercase tracking-wider">{p.badge} · {p.problems.length} задач</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-4 leading-[1.05]">
              {p.h1Highlight}
            </h1>
            <p className="text-white/65 text-base md:text-lg max-w-2xl">{p.intro}</p>
          </div>

          {/* Прогресс */}
          <div className="hidden md:flex flex-col items-center bg-card border border-white/10 rounded-3xl p-5 min-w-[180px]">
            <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-2">Твой прогресс</p>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="42" stroke="url(#prGrad)"
                        strokeWidth="8" fill="none"
                        strokeDasharray={`${(progress / 100) * 264} 264`}
                        strokeLinecap="round" className="transition-all duration-700" />
                <defs>
                  <linearGradient id="prGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="font-montserrat font-black text-white text-2xl">{progress}%</p>
                <p className="text-white/45 text-[10px]">{solved.size} / {p.problems.length}</p>
              </div>
            </div>
            {solved.size > 0 && (
              <button onClick={resetProgress} className="mt-3 text-white/40 hover:text-white/70 text-[11px] underline transition-colors">
                Сбросить
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-6">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-2">Тема</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setTopic("all")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              topic === "all"
                ? "bg-purple-500/25 border border-purple-500/45 text-white"
                : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name="LayoutGrid" size={12} />
            Все темы
          </button>
          {p.topics.map((t) => {
            const count = p.problems.filter((pr) => pr.topic === t.id).length;
            if (count === 0) return null;
            return (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  topic === t.id
                    ? "bg-purple-500/25 border border-purple-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
                <span className="text-white/40 text-[11px]">· {count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mr-2">Сложность:</p>
          {DIFFS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                difficulty === d.id
                  ? "bg-cyan-500/25 border border-cyan-500/45 text-white"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* Список задач */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pb-16 space-y-6">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-white/65 text-sm mb-4">По этим фильтрам задач пока нет. Попробуй другие.</p>
            <button
              onClick={() => { setTopic("all"); setDifficulty("all"); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-2xl"
            >
              <Icon name="RefreshCw" size={14} />
              Сбросить фильтры
            </button>
          </div>
        ) : (
          filtered.map((pr) => (
            <PracticeSolver
              key={pr.id}
              problem={pr}
              solved={solved.has(pr.id)}
              onSolved={markSolved}
              accent={p.accent}
            />
          ))
        )}
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pb-16">
        <div className={`rounded-3xl bg-gradient-to-br ${p.accent} p-8 md:p-12 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative">
            <div className="text-6xl mb-4">{p.emoji}</div>
            <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3 leading-tight">
              Хочешь индивидуальный маршрут по {p.subjectGenitive}?
            </h2>
            <p className="text-white/85 text-base md:text-lg mb-6 max-w-xl mx-auto">
              ИИ-преподаватель найдёт твои пробелы и подберёт задачи именно под твой уровень.
            </p>
            <Link
              to={p.parentLandingHref}
              className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm md:text-base font-black px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl"
            >
              <Icon name="Rocket" size={16} />
              Перейти к курсам по {p.subjectGenitive}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}