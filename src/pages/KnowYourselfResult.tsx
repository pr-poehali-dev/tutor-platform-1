import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import ScaleBar from "@/components/knowYourself/ScaleBar";
import { computeResult, loadAnswers, clearAnswers, syncResultToCloud } from "@/components/knowYourself/scoring";
import {
  RIASEC_LABELS,
  VALUE_LABELS,
  ABILITY_LABELS,
  SCHOOL_LABELS,
  TestResult,
} from "@/components/knowYourself/types";
import { getUniversity, SUBJECTS } from "@/components/graduate/graduateData";
import { useAuth } from "@/context/AuthContext";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const OUTLOOK_LABELS = {
  rising: { label: "Растёт", emoji: "📈", tone: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" },
  stable: { label: "Стабильно", emoji: "▶", tone: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30" },
  declining: { label: "Сокращается", emoji: "📉", tone: "text-rose-300 bg-rose-500/15 border-rose-500/30" },
} as const;

export default function KnowYourselfResult() {
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  const [result, setResult] = useState<TestResult | null>(null);
  const [cloudStatus, setCloudStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const saved = loadAnswers();
    if (!saved || Object.keys(saved).length === 0) {
      navigate("/know-yourself");
      return;
    }
    const r = computeResult(saved);
    setResult(r);

    // Автоматически сохраняем результат в личный кабинет (если пользователь вошёл)
    if (isAuthenticated) {
      setCloudStatus("saving");
      syncResultToCloud(saved, r).then((res) => {
        setCloudStatus(res.saved ? "saved" : "error");
      });
    }
  }, [navigate, isAuthenticated]);

  const topRiasecLabel = useMemo(() => {
    if (!result) return null;
    const codes = result.topRiasec;
    return codes.map((c) => RIASEC_LABELS[c]).filter(Boolean);
  }, [result]);

  if (!result || !topRiasecLabel) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-white">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3 text-cyan-300" />
          <p className="text-white/55 text-sm">Анализирую твои ответы...</p>
        </div>
      </div>
    );
  }

  const handleRetake = () => {
    if (!confirm("Пройти тест заново? Текущий результат будет удалён.")) return;
    clearAnswers();
    navigate("/know-yourself");
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `Профориентационный результат: ${topRiasecLabel[0].label} + ${topRiasecLabel[1]?.label || ""}`,
      author: { "@type": "Organization", name: "УЧИСЬПРО" },
      datePublished: new Date().toISOString(),
      inLanguage: "ru",
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Результат теста «Познай себя» — топ-10 профессий и вузов | УЧИСЬПРО"
        description="Твой профориентационный профиль: тип личности по Холланду, сильные стороны, ценности и 10 рекомендованных профессий со списком вузов."
        canonical={`${SITE_URL}/know-yourself/result`}
        noindex
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-lg">🪞</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[
              { label: "Главная", href: "/" },
              { label: "Познай себя", href: "/know-yourself" },
              { label: "Результат" },
            ]} />
          </div>
          <button
            onClick={handleRetake}
            className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Icon name="RefreshCw" size={14} />
            Пройти заново
          </button>
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 pt-3">
        <Breadcrumbs items={[
          { label: "Главная", href: "/" },
          { label: "Познай себя", href: "/know-yourself" },
          { label: "Результат" },
        ]} />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-6 pb-16">

        {/* Плашка статуса синхронизации с личным кабинетом */}
        {isAuthenticated && cloudStatus !== "idle" && (
          <div className={`mb-4 flex items-center gap-2 text-xs rounded-2xl px-4 py-2.5 border ${
            cloudStatus === "saved"  ? "bg-emerald-500/12 border-emerald-500/30 text-emerald-200" :
            cloudStatus === "saving" ? "bg-cyan-500/12 border-cyan-500/30 text-cyan-200" :
                                       "bg-rose-500/12 border-rose-500/30 text-rose-200"
          }`}>
            <Icon
              name={cloudStatus === "saved" ? "CloudCheck" : cloudStatus === "saving" ? "Loader2" : "CloudOff"}
              size={14}
              className={cloudStatus === "saving" ? "animate-spin" : ""}
            />
            <span className="font-bold">
              {cloudStatus === "saved" && "Результат сохранён в твой личный кабинет"}
              {cloudStatus === "saving" && "Сохраняю в личный кабинет..."}
              {cloudStatus === "error" && "Не удалось сохранить — попробуй обновить страницу"}
            </span>
          </div>
        )}
        {!isAuthenticated && (
          <div className="mb-4 flex items-center gap-2 text-xs rounded-2xl px-4 py-2.5 border bg-amber-500/12 border-amber-500/30 text-amber-200 flex-wrap">
            <Icon name="Cloud" size={14} />
            <span className="font-bold flex-1">Войди в аккаунт, чтобы сохранить результат в личный кабинет</span>
            <button
              onClick={openLogin}
              className="bg-amber-500/30 hover:bg-amber-500/45 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors"
            >
              Войти
            </button>
          </div>
        )}

        {/* ─── HERO: ТИП ЛИЧНОСТИ ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 via-blue-900/25 to-indigo-900/30 p-6 md:p-8 mb-6">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/35 rounded-full px-3 py-1 mb-3">
              <Icon name="Sparkles" size={11} className="text-cyan-200" />
              <span className="text-xs text-cyan-200 font-bold uppercase tracking-wider">Твой профиль</span>
            </div>
            <h1 className="font-montserrat font-black text-white text-2xl md:text-4xl leading-tight mb-3">
              Ты — <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">{topRiasecLabel[0].label}</span>
              {topRiasecLabel[1] && (
                <>{" + "}<span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">{topRiasecLabel[1].label}</span></>
              )}
            </h1>
            <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-2xl mb-4">
              {topRiasecLabel[0].description} {topRiasecLabel[1] && `Также тебе близко: ${topRiasecLabel[1].description.toLowerCase()}`}
            </p>

            <div className="flex flex-wrap gap-2">
              {topRiasecLabel.map((l, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-full px-3 py-1.5 text-white text-sm font-bold"
                >
                  <span className="text-base">{l.emoji}</span>
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 4 ШКАЛЫ ───────────────────────────────────────────────────── */}
        <section className="grid md:grid-cols-2 gap-6 mb-6">
          {/* RIASEC */}
          <div className="bg-card border border-white/10 rounded-3xl p-5">
            <h2 className="font-montserrat font-black text-white text-lg mb-3 flex items-center gap-2">
              <span>🎯</span> Тип личности (RIASEC)
            </h2>
            <div className="space-y-2">
              {(Object.entries(result.riasec) as [keyof typeof RIASEC_LABELS, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([code, value]) => (
                  <ScaleBar
                    key={code}
                    label={RIASEC_LABELS[code].label}
                    emoji={RIASEC_LABELS[code].emoji}
                    value={value}
                    highlighted={result.topRiasec.includes(code)}
                    tone="cyan"
                  />
                ))}
            </div>
          </div>

          {/* Способности */}
          <div className="bg-card border border-white/10 rounded-3xl p-5">
            <h2 className="font-montserrat font-black text-white text-lg mb-3 flex items-center gap-2">
              <span>💪</span> Сильные стороны
            </h2>
            <div className="space-y-2">
              {(Object.entries(result.abilities) as [keyof typeof ABILITY_LABELS, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([code, value]) => (
                  <ScaleBar
                    key={code}
                    label={ABILITY_LABELS[code].label}
                    emoji={ABILITY_LABELS[code].emoji}
                    value={value}
                    highlighted={result.topAbilities.includes(code)}
                    tone="purple"
                  />
                ))}
            </div>
          </div>

          {/* Ценности */}
          <div className="bg-card border border-white/10 rounded-3xl p-5">
            <h2 className="font-montserrat font-black text-white text-lg mb-3 flex items-center gap-2">
              <span>🧭</span> Ценности
            </h2>
            <div className="space-y-2">
              {(Object.entries(result.values) as [keyof typeof VALUE_LABELS, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([code, value]) => (
                  <ScaleBar
                    key={code}
                    label={VALUE_LABELS[code].label}
                    emoji={VALUE_LABELS[code].emoji}
                    value={value}
                    highlighted={result.topValues.includes(code)}
                    tone="amber"
                  />
                ))}
            </div>
          </div>

          {/* Предметы */}
          <div className="bg-card border border-white/10 rounded-3xl p-5">
            <h2 className="font-montserrat font-black text-white text-lg mb-3 flex items-center gap-2">
              <span>📚</span> Любимые школьные предметы
            </h2>
            <div className="space-y-2">
              {(Object.entries(result.subjects) as [keyof typeof SCHOOL_LABELS, number][])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([code, value]) => (
                  <ScaleBar
                    key={code}
                    label={SCHOOL_LABELS[code].label}
                    emoji={SCHOOL_LABELS[code].emoji}
                    value={value}
                    highlighted={result.topSubjects.includes(code)}
                    tone="emerald"
                  />
                ))}
            </div>
          </div>
        </section>

        {/* ─── ТОП-10 ПРОФЕССИЙ ──────────────────────────────────────────── */}
        <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Trophy" size={16} className="text-amber-300" />
            <span className="text-amber-300 text-[11px] uppercase tracking-wider font-bold">Топ-10 для тебя</span>
          </div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
            Рекомендованные профессии
          </h2>

          <div className="space-y-3">
            {result.professions.map((item, idx) => {
              const p = item.profession;
              const outlook = OUTLOOK_LABELS[p.outlook];
              const universities = p.universityIds
                .map((id) => getUniversity(id))
                .filter((u): u is NonNullable<ReturnType<typeof getUniversity>> => u !== undefined)
                .slice(0, 6);

              return (
                <div
                  key={p.id}
                  className={`bg-white/[0.03] border rounded-2xl p-4 md:p-5 transition-all ${
                    idx === 0 ? "border-amber-500/40 bg-amber-500/[0.04]" :
                    idx <= 2 ? "border-cyan-500/30 bg-cyan-500/[0.03]" :
                    "border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center text-3xl md:text-4xl">
                        {p.emoji}
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[11px] font-black flex items-center justify-center shadow-lg">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-montserrat font-black text-white text-base md:text-lg leading-tight">{p.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${outlook.tone}`}>
                          <span>{outlook.emoji}</span>
                          {outlook.label}
                        </span>
                      </div>
                      <p className="text-white/65 text-xs md:text-sm leading-relaxed">{p.short}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-montserrat font-black text-cyan-300 text-xl md:text-2xl tabular-nums leading-none">{item.score}%</p>
                      <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold">совпадение</p>
                    </div>
                  </div>

                  {/* Метрики */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2">
                      <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold">Зарплата, тыс. ₽</p>
                      <p className="font-montserrat font-black text-emerald-300 text-sm tabular-nums">
                        {p.salaryFrom === 0 ? "0" : p.salaryFrom}–{p.salaryTo}
                      </p>
                    </div>
                    <div className="bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2">
                      <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold">ЕГЭ для поступления</p>
                      <p className="font-bold text-white text-xs leading-tight">
                        {p.egeSubjects.map((s) => SUBJECTS[s]?.label || s).join(" · ")}
                      </p>
                    </div>
                    <div className="bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2 col-span-2 md:col-span-1">
                      <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold">Подходящих вузов</p>
                      <p className="font-montserrat font-black text-purple-300 text-sm">{p.universityIds.length}</p>
                    </div>
                  </div>

                  {/* День из жизни */}
                  <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 mb-3">
                    <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                      <Icon name="Clock" size={10} />
                      Один день из жизни
                    </p>
                    <p className="text-white/75 text-xs leading-relaxed">{p.dayInLife}</p>
                  </div>

                  {/* Вузы */}
                  {universities.length > 0 && (
                    <div className="mb-2">
                      <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1">
                        <Icon name="Building2" size={10} />
                        Где учат
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {universities.map((u) => (
                          <Link
                            key={u.id}
                            to="/graduate"
                            className="inline-flex items-center gap-1.5 bg-purple-500/12 hover:bg-purple-500/20 border border-purple-500/30 text-purple-100 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <span className="text-sm">{u.emoji}</span>
                            {u.shortName}
                            <span className="text-purple-200/55">· {u.city}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── CTA ───────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-rose-500/20 border border-purple-500/35 rounded-3xl p-6 md:p-8 text-center">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-3xl mb-2">
            Готов идти дальше?
          </h2>
          <p className="text-white/75 text-sm md:text-base mb-5 max-w-xl mx-auto">
            Открой модуль «Выпускник» — выбери вуз, факультет и получи индивидуальный курс подготовки к ЕГЭ под твою профессию.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/graduate"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm md:text-base font-black px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/30"
            >
              <Icon name="GraduationCap" size={16} />
              Подобрать вуз и программу
              <Icon name="ArrowRight" size={16} />
            </Link>
            <Link
              to="/score-calculator"
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm md:text-base font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Icon name="Calculator" size={14} />
              Калькулятор баллов ЕГЭ
            </Link>
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 text-sm md:text-base font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Icon name="RefreshCw" size={14} />
              Пройти заново
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}