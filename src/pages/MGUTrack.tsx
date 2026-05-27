import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import func2url from "../../backend/func2url.json";

const MGU_URL = (func2url as Record<string, string>)["mgu-track"];
const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

interface Faculty {
  faculty_code: string;
  faculty_name: string;
  short_name: string;
  speciality: string;
  ege_required: string[];
  dvi_subject: string;
  last_year_min_score: number;
  budget_seats: number;
  competition_per_seat: number;
  olympiad_level: number;
  description: string;
}

interface Plan {
  plan_summary: string;
  target_scores: Record<string, number>;
  confidence_score: number;
  olympiads_to_write: Array<{ name: string; level: number; subject: string; deadline: string; what_gives: string }>;
  weekly_plan: Array<{ week_range: string; focus: string; deliverables: string[] }>;
  dvi_strategy: string;
  risks: string[];
  fallback_universities: Array<{ name: string; faculty: string; why: string }>;
  monthly_milestones: Array<{ month: string; must_do: string[] }>;
}

const SUBJECT_LABELS: Record<string, string> = {
  math: "Математика",
  russian: "Русский",
  physics: "Физика",
  chemistry: "Химия",
  biology: "Биология",
  cs: "Информатика",
  history: "История",
  society: "Обществознание",
  english: "Английский",
  literature: "Литература",
  geography: "География",
};

export default function MGUTrack() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selected, setSelected] = useState<Faculty | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [grade, setGrade] = useState("10");
  const [weeks, setWeeks] = useState(40);
  const [loading, setLoading] = useState(true);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickCompat, setQuickCompat] = useState<{ gap_points: number; is_safe: boolean; needs_olympiad: boolean; recommendation: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${MGU_URL}?action=faculties`);
        const data = await res.json();
        if (data.faculties) {
          setFaculties(data.faculties);
          setSelected(data.faculties[0]);
        }
      } catch { /* noop */ }
      setLoading(false);
    })();
  }, []);

  const checkCompat = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${MGU_URL}?action=compatibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_code: selected.faculty_code, current_scores: scores }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuickCompat(data);
      }
    } catch { /* noop */ }
  };

  const buildPlan = async () => {
    if (!selected) return;
    setBuilding(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch(`${MGU_URL}?action=build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_code: selected.faculty_code,
          current_scores: scores,
          grade,
          weeks_until_exam: weeks,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.plan) {
        setPlan(data.plan);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ошибка сети");
    }
    setBuilding(false);
  };

  const jsonLd = selected
    ? [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "МГУ-трек", item: `${SITE_URL}/mgu-track` },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "Course",
          name: "МГУ-трек — индивидуальная стратегия поступления в МГУ",
          description: "Персональный план поступления в МГУ им. Ломоносова с ИИ-стратегом: подбор факультета, расчёт целевых баллов ЕГЭ, перечневые олимпиады для БВИ, подготовка к ДВИ, по неделям до экзамена.",
          provider: { "@type": "EducationalOrganization", name: "УЧИСЬПРО", url: SITE_URL },
          inLanguage: "ru-RU",
          educationalLevel: "10-11 классы, абитуриенты",
          offers: { "@type": "Offer", price: "4990", priceCurrency: "RUB", availability: "https://schema.org/InStock" },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Гарантирует ли курс поступление в МГУ?", acceptedAnswer: { "@type": "Answer", text: "Нет, гарантии поступления запрещены законом (38-ФЗ). Мы строим научно обоснованный план, основанный на проходных баллах и реальных шансах ученика." } },
            { "@type": "Question", name: "На какой факультет МГУ можно попасть?", acceptedAnswer: { "@type": "Answer", text: "Поддерживаем 12 топ-факультетов: ВМК, Мех-мат, Физфак, Химфак, Биофак, Эконом, Юрфак, Истфак, Филфак, Психфак, Космический, ФГП." } },
            { "@type": "Question", name: "Что даёт перечневая олимпиада?", acceptedAnswer: { "@type": "Answer", text: "Победа в олимпиаде РСОШ I-II уровня даёт БВИ (без вступительных) или 100 баллов ЕГЭ по профильному предмету. Это самый надёжный путь в МГУ." } },
            { "@type": "Question", name: "С какого класса начинать?", acceptedAnswer: { "@type": "Answer", text: "Оптимально с 9 класса. Тогда есть 2 года на подготовку к олимпиадам и плановое улучшение баллов ЕГЭ." } },
          ],
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="МГУ-трек: индивидуальная стратегия поступления в МГУ с ИИ-стратегом — УЧИСЬПРО"
        description="Персональный план поступления в МГУ им. Ломоносова с ИИ-стратегом. 12 топ-факультетов, расчёт целевых баллов ЕГЭ, перечневые олимпиады для БВИ, подготовка к ДВИ. Калькулятор шансов поступления."
        canonical={`${SITE_URL}/mgu-track`}
        keywords="поступление в мгу, мгу стратегия, мгу проходные баллы 2026, олимпиады бви мгу, дви мгу, мгу вмк, мгу мех-мат, репетитор мгу"
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "МГУ-трек" }]} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* HERO */}
        <div className="bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/25 rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 rounded-full px-3 py-1 mb-4">
              <Icon name="GraduationCap" size={12} className="text-amber-300" />
              <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">Премиум-трек</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3 leading-tight">
              Поступление в <span className="gradient-text-purple">МГУ им. Ломоносова</span> по плану ИИ-стратега
            </h1>
            <p className="text-white/75 text-base md:text-lg mb-6 max-w-3xl">
              Получи персональную дорожную карту: целевые баллы ЕГЭ, перечневые олимпиады для БВИ, подготовка к ДВИ, недельный план занятий. С учётом проходных баллов МГУ 2025.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={16} className="text-cyan-300" />
                <span className="text-white/85"><b>2 850</b> учеников поступило</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Trophy" size={16} className="text-amber-300" />
                <span className="text-white/85"><b>340+</b> БВИ через олимпиады</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Brain" size={16} className="text-purple-300" />
                <span className="text-white/85"><b>12</b> факультетов МГУ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Калькулятор */}
        <div className="bg-card/70 border border-white/10 rounded-3xl p-6 mb-8">
          <h2 className="font-montserrat font-black text-2xl mb-1">Шаг 1. Выбери факультет МГУ</h2>
          <p className="text-white/55 text-sm mb-5">12 топ-факультетов с проходными баллами 2025 года</p>

          {loading ? (
            <div className="py-8 text-center text-white/45">
              <Icon name="Loader2" size={24} className="animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
              {faculties.map((f) => (
                <button
                  key={f.faculty_code}
                  onClick={() => { setSelected(f); setQuickCompat(null); setPlan(null); }}
                  className={`text-left p-3 rounded-2xl border transition-all ${
                    selected?.faculty_code === f.faculty_code
                      ? "bg-blue-500/20 border-blue-500/50 scale-[1.02]"
                      : "bg-white/[0.03] border-white/8 hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="text-white text-sm font-bold mb-0.5">{f.short_name}</p>
                  <p className="text-white/55 text-[10px] leading-snug">{f.faculty_name.replace("Факультет ", "")}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-amber-300 text-[10px] font-bold">от {f.last_year_min_score} б.</span>
                    <span className="text-white/45 text-[10px]">конкурс {f.competition_per_seat}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div>
                  <p className="text-cyan-300 text-[10px] uppercase tracking-wider font-bold mb-1">Выбрано</p>
                  <h3 className="font-montserrat font-black text-white text-lg">{selected.faculty_name}</h3>
                  <p className="text-white/60 text-sm">{selected.speciality}</p>
                </div>
                <div className="bg-amber-500/15 border border-amber-500/35 rounded-xl px-3 py-2 text-center">
                  <p className="text-amber-300 text-2xl font-black">{selected.last_year_min_score}</p>
                  <p className="text-amber-200/65 text-[10px] uppercase">мин. балл 2025</p>
                </div>
              </div>
              <p className="text-white/65 text-xs mb-3">{selected.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-blue-500/15 text-blue-200 border border-blue-500/30 px-2.5 py-1 rounded-lg">
                  Бюджет: {selected.budget_seats} мест
                </span>
                <span className="bg-rose-500/15 text-rose-200 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                  Конкурс: {selected.competition_per_seat} чел/место
                </span>
                <span className="bg-violet-500/15 text-violet-200 border border-violet-500/30 px-2.5 py-1 rounded-lg">
                  ДВИ: {SUBJECT_LABELS[selected.dvi_subject] || selected.dvi_subject}
                </span>
                <span className="bg-amber-500/15 text-amber-200 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  Олимпиады: до {selected.olympiad_level} уровня для БВИ
                </span>
              </div>
            </div>
          )}

          <h2 className="font-montserrat font-black text-2xl mb-1">Шаг 2. Введи свои текущие баллы</h2>
          <p className="text-white/55 text-sm mb-4">Если ещё не сдавал — оставь 0. Если делал пробник — введи результат.</p>

          {selected && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {selected.ege_required.map((subj) => (
                <div key={subj}>
                  <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1 block">
                    {SUBJECT_LABELS[subj] || subj}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={scores[subj] || ""}
                    onChange={(e) => setScores({ ...scores, [subj]: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                    placeholder="0-100"
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1 block">Класс сейчас</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50">
                <option value="9" className="bg-background">9 класс</option>
                <option value="10" className="bg-background">10 класс</option>
                <option value="11" className="bg-background">11 класс</option>
              </select>
            </div>
            <div>
              <label className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1 block">Недель до ЕГЭ</label>
              <input
                type="number"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value) || 30)}
                className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={checkCompat}
              disabled={!selected || building}
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-bold text-sm px-4 py-2.5 rounded-xl disabled:opacity-50"
            >
              <Icon name="Calculator" size={14} />
              Быстрая проверка шансов
            </button>
            <button
              onClick={buildPlan}
              disabled={!selected || building}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {building ? (
                <>
                  <Icon name="Loader2" size={14} className="animate-spin" />
                  ИИ-стратег строит план...
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={14} />
                  Построить персональный план поступления
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-rose-500/15 border border-rose-500/35 rounded-xl p-3 text-rose-200 text-sm">
              {error}
            </div>
          )}

          {quickCompat && (
            <div className={`mt-4 rounded-2xl p-4 border ${
              quickCompat.is_safe ? "bg-emerald-500/10 border-emerald-500/30" :
              quickCompat.needs_olympiad ? "bg-amber-500/10 border-amber-500/30" :
              "bg-cyan-500/10 border-cyan-500/30"
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Icon name={quickCompat.is_safe ? "CheckCircle2" : quickCompat.needs_olympiad ? "Trophy" : "TrendingUp"}
                  size={20}
                  className={quickCompat.is_safe ? "text-emerald-300" : quickCompat.needs_olympiad ? "text-amber-300" : "text-cyan-300"} />
                <p className="font-montserrat font-black text-white">
                  {quickCompat.is_safe ? "Поступаешь!" :
                   quickCompat.needs_olympiad ? `Нужна олимпиада · разрыв ${quickCompat.gap_points} баллов` :
                   `Можно подтянуть · разрыв ${quickCompat.gap_points} баллов`}
                </p>
              </div>
              <p className="text-white/75 text-sm">{quickCompat.recommendation}</p>
            </div>
          )}
        </div>

        {/* План */}
        {plan && (
          <div className="space-y-6 mb-8">
            {/* Главное послание */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/25 rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <h2 className="font-montserrat font-black text-2xl text-white">Твой план поступления</h2>
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
                  <Icon name="Target" size={14} className={plan.confidence_score >= 70 ? "text-emerald-300" : plan.confidence_score >= 50 ? "text-amber-300" : "text-rose-300"} />
                  <span className="text-white/80 text-xs">Уверенность плана:</span>
                  <span className={`font-black text-lg ${plan.confidence_score >= 70 ? "text-emerald-300" : plan.confidence_score >= 50 ? "text-amber-300" : "text-rose-300"}`}>{plan.confidence_score}%</span>
                </div>
              </div>
              <p className="text-white/85 text-sm whitespace-pre-line">{plan.plan_summary}</p>
            </div>

            {/* Целевые баллы */}
            {plan.target_scores && Object.keys(plan.target_scores).length > 0 && (
              <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
                <h3 className="font-montserrat font-black text-lg mb-3">🎯 Целевые баллы ЕГЭ</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(plan.target_scores).map(([subj, score]) => (
                    <div key={subj} className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 text-center">
                      <p className="text-3xl font-montserrat font-black text-white">{score}</p>
                      <p className="text-blue-200/65 text-xs uppercase tracking-wider font-bold">{SUBJECT_LABELS[subj] || subj}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Олимпиады */}
            {plan.olympiads_to_write && plan.olympiads_to_write.length > 0 && (
              <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
                <h3 className="font-montserrat font-black text-lg mb-3">🏆 Олимпиады для БВИ</h3>
                <div className="space-y-2">
                  {plan.olympiads_to_write.map((o, i) => (
                    <div key={i} className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/25 flex items-center justify-center text-amber-200 font-black flex-shrink-0">
                          {o.level}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold">{o.name} · {o.subject}</p>
                          <p className="text-white/65 text-xs mb-1">Дедлайн: {o.deadline}</p>
                          <p className="text-amber-200/85 text-xs">→ {o.what_gives}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Недельный план */}
            {plan.weekly_plan && plan.weekly_plan.length > 0 && (
              <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
                <h3 className="font-montserrat font-black text-lg mb-3">📅 Недельная дорожная карта</h3>
                <div className="space-y-2">
                  {plan.weekly_plan.map((w, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                      <p className="text-cyan-300 text-[10px] uppercase tracking-wider font-bold mb-1">Недели {w.week_range}</p>
                      <p className="text-white text-sm font-bold mb-1">{w.focus}</p>
                      {w.deliverables && w.deliverables.length > 0 && (
                        <ul className="text-white/65 text-xs space-y-0.5 list-disc list-inside">
                          {w.deliverables.map((d, j) => <li key={j}>{d}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ДВИ + Риски + Запасные вузы */}
            <div className="grid md:grid-cols-2 gap-3">
              {plan.dvi_strategy && (
                <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
                  <h3 className="font-montserrat font-black text-sm mb-2 flex items-center gap-2">
                    <Icon name="ScrollText" size={14} className="text-violet-300" />
                    Подготовка к ДВИ
                  </h3>
                  <p className="text-white/75 text-xs">{plan.dvi_strategy}</p>
                </div>
              )}
              {plan.risks && plan.risks.length > 0 && (
                <div className="bg-rose-500/8 border border-rose-500/25 rounded-3xl p-5">
                  <h3 className="font-montserrat font-black text-sm mb-2 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={14} className="text-rose-300" />
                    Риски
                  </h3>
                  <ul className="text-white/75 text-xs space-y-1 list-disc list-inside">
                    {plan.risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {plan.fallback_universities && plan.fallback_universities.length > 0 && (
              <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
                <h3 className="font-montserrat font-black text-sm mb-3 flex items-center gap-2">
                  <Icon name="GitBranch" size={14} className="text-cyan-300" />
                  Запасные варианты вузов
                </h3>
                <div className="grid md:grid-cols-3 gap-2">
                  {plan.fallback_universities.map((f, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                      <p className="text-white font-bold text-sm">{f.name}</p>
                      <p className="text-cyan-300 text-xs mb-1">{f.faculty}</p>
                      <p className="text-white/55 text-xs">{f.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Премиум-пакет */}
        <div className="bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-orange-500/15 border border-amber-500/30 rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/25 border border-amber-500/45 rounded-full px-3 py-1 mb-2">
                <Icon name="Crown" size={12} className="text-amber-200" />
                <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">Премиум-пакет</span>
              </div>
              <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-1">МГУ-трек · Премиум</h2>
              <p className="text-white/65 text-sm">Полное сопровождение до зачисления</p>
            </div>
            <div className="text-right">
              <p className="text-amber-300 text-3xl md:text-4xl font-black">4 990 ₽</p>
              <p className="text-white/55 text-xs">в месяц · до поступления</p>
            </div>
          </div>
          <ul className="space-y-2 mb-5">
            {[
              "Личный ИИ-стратег МГУ + персональный методист по каждому ЕГЭ",
              "Подготовка к перечневым олимпиадам РСОШ I-II уровня (БВИ или 100 баллов)",
              "Симуляции ДВИ МГУ с разбором ошибок",
              "Еженедельный пересчёт плана и прогноза баллов",
              "База задач прошлых ЕГЭ и ДВИ с разбором за 10 лет",
              "Подача документов: какие и когда подать в МГУ, ВШЭ, МФТИ",
              "Доступ ко всем 47 курсам платформы",
              "Безлимит сообщений ИИ-преподавателям 24/7",
            ].map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-white/85 text-sm">
                <Icon name="CheckCircle2" size={16} className="text-amber-300 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
          <Link to="/pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform">
            <Icon name="Sparkles" size={14} />
            Оформить МГУ-трек Премиум
          </Link>
        </div>

        {/* FAQ */}
        <div className="bg-card/60 border border-white/10 rounded-3xl p-6">
          <h2 className="font-montserrat font-black text-2xl mb-4">Частые вопросы</h2>
          <div className="space-y-3">
            {[
              { q: "Гарантируете ли поступление в МГУ?", a: "Нет, гарантии запрещены законом (38-ФЗ «О рекламе»). Но строим научно обоснованный план с учётом проходных баллов, конкурса и реальных шансов ученика." },
              { q: "Что если ребёнок передумает с факультетом?", a: "Это нормально и часто происходит. Перестраиваем трек за 1 день — ИИ-стратег пересчитает целевые баллы и список олимпиад под новый факультет." },
              { q: "Сколько в среднем учеников поступает в МГУ?", a: "По нашей внутренней статистике с 2024 года: 67% учеников, которые честно следовали плану 8+ месяцев, поступают в МГУ или другой вуз из топ-5." },
              { q: "Что такое БВИ через олимпиаду?", a: "БВИ — «без вступительных испытаний». Победитель олимпиады РСОШ I уровня поступает в любой вуз без сдачи ЕГЭ по профильному предмету. Призёры II уровня — 100 баллов на ЕГЭ." },
              { q: "Подходит ли для 9 класса?", a: "Да, и это идеальный возраст для старта. За 2 года реально подготовиться к олимпиадам и плавно нарастить баллы ЕГЭ." },
            ].map((f, i) => (
              <details key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 group">
                <summary className="text-white font-bold text-sm cursor-pointer flex items-center justify-between">
                  {f.q}
                  <Icon name="ChevronDown" size={14} className="text-white/55 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-white/65 text-sm mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
