import { useEffect, useState } from "react";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import MGUHero, { MGUTopBar } from "@/components/mgu/MGUHero";
import MGUCalculator from "@/components/mgu/MGUCalculator";
import MGUPlanView from "@/components/mgu/MGUPlanView";
import MGUPremiumFaq from "@/components/mgu/MGUPremiumFaq";
import { Faculty, Plan, QuickCompat } from "@/components/mgu/types";
import func2url from "../../backend/func2url.json";

const MGU_URL = (func2url as Record<string, string>)["mgu-track"];
const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

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
  const [quickCompat, setQuickCompat] = useState<QuickCompat | null>(null);

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

      <MGUTopBar />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <MGUHero />

        <MGUCalculator
          faculties={faculties}
          selected={selected}
          scores={scores}
          grade={grade}
          weeks={weeks}
          loading={loading}
          building={building}
          error={error}
          quickCompat={quickCompat}
          onSelectFaculty={(f) => { setSelected(f); setQuickCompat(null); setPlan(null); }}
          onScoresChange={setScores}
          onGradeChange={setGrade}
          onWeeksChange={setWeeks}
          onCheckCompat={checkCompat}
          onBuildPlan={buildPlan}
        />

        {plan && <MGUPlanView plan={plan} />}

        <MGUPremiumFaq />
      </div>

      <SiteFooter />
    </div>
  );
}