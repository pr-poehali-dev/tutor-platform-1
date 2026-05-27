import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs, { Crumb } from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import StepRegion from "@/components/graduate/StepRegion";
import StepUniversity from "@/components/graduate/StepUniversity";
import StepFaculty from "@/components/graduate/StepFaculty";
import StepProgram from "@/components/graduate/StepProgram";
import UniversitySearch from "@/components/graduate/UniversitySearch";
import {
  REGIONS,
  UNIVERSITIES,
  getRegion,
  getUniversity,
  getFaculty,
} from "@/components/graduate/graduateData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

type Step = 1 | 2 | 3 | 4;

export default function Graduate() {
  const [step, setStep] = useState<Step>(1);
  const [regionId, setRegionId] = useState<string>("");
  const [universityId, setUniversityId] = useState<string>("");
  const [facultyId, setFacultyId] = useState<string>("");

  const region = regionId ? getRegion(regionId) : undefined;
  const university = universityId ? getUniversity(universityId) : undefined;
  const faculty = universityId && facultyId ? getFaculty(universityId, facultyId) : undefined;

  const handleSelectRegion = (id: string) => {
    setRegionId(id);
    setStep(2);
  };
  const handleSelectUniversity = (id: string) => {
    setUniversityId(id);
    setStep(3);
  };
  const handleSelectFaculty = (id: string) => {
    setFacultyId(id);
    setStep(4);
  };
  const handleRestart = () => {
    setStep(1);
    setRegionId("");
    setUniversityId("");
    setFacultyId("");
  };

  /** Поиск напрямую: пользователь нашёл вуз через поиск — прыгаем на шаг "Факультет". */
  const handleSearchPick = (u: { id: string; regionId: string }) => {
    setRegionId(u.regionId);
    setUniversityId(u.id);
    setFacultyId("");
    setStep(3);
  };

  // ─── Хлебные крошки на каждом шаге ────────────────────────────────────
  const breadcrumbs: Crumb[] = useMemo(() => {
    const base: Crumb[] = [
      { label: "Главная", href: "/" },
      { label: "Выпускник", href: "/graduate" },
    ];
    if (step === 1) {
      return [{ label: "Главная", href: "/" }, { label: "Выпускник" }];
    }
    if (step >= 2 && region) {
      base.push({ label: region.name, href: step > 2 ? "/graduate" : undefined });
    }
    if (step >= 3 && university) {
      base.push({ label: university.shortName, href: step > 3 ? "/graduate" : undefined });
    }
    if (step === 4 && faculty) {
      base.push({ label: faculty.specialty });
    }
    return base;
  }, [step, region, university, faculty]);

  // ─── Динамический SEO-title и description под текущий шаг ────────────
  const seo = useMemo(() => {
    if (step === 4 && university && faculty) {
      const exams = faculty.exams.map((e) => e.subject).length;
      return {
        title: `${faculty.specialty} в ${university.shortName} — ${exams} ЕГЭ, проходной ${faculty.passingScore} | УЧИСЬПРО`,
        description: `Поступление в ${university.shortName} (${university.city}) на «${faculty.specialty}». Какие ЕГЭ сдавать, минимальные и проходные баллы, бюджетные места. Программа подготовки от УЧИСЬПРО.`,
        keywords: `${university.shortName}, ${faculty.specialty}, проходной балл ${university.shortName}, поступление ${university.shortName}, ${faculty.exams.map((e) => e.subject).join(", ")}, бюджетные места`,
      };
    }
    if (step === 3 && university) {
      return {
        title: `${university.shortName} — факультеты, проходные баллы, ЕГЭ 2025 | УЧИСЬПРО`,
        description: `${university.fullName}, ${university.city}. Список факультетов и направлений: проходные баллы, какие ЕГЭ сдавать, бюджетные места. ${university.isMilitary ? "Военный вуз: ВВК, физподготовка." : ""}`,
        keywords: `${university.shortName}, факультеты ${university.shortName}, поступление в ${university.shortName}, ${university.fullName}, проходные баллы 2025`,
      };
    }
    if (step === 2 && region) {
      const count = UNIVERSITIES.filter((u) => u.regionId === region.id).length;
      return {
        title: `Вузы ${region.name} — ${count} учебных заведений | УЧИСЬПРО Выпускник`,
        description: `${count} вузов в регионе «${region.name}»: список с проходными баллами, бюджетными местами и программами поступления. Гражданские и военные вузы.`,
        keywords: `вузы ${region.name}, поступление ${region.name}, проходные баллы ${region.name}, бюджетные места 2025`,
      };
    }
    return {
      title: "Выпускник — подбор вуза и программа поступления для 11 класса | УЧИСЬПРО",
      description:
        "100 вузов России: МГУ, СПбГУ, МФТИ, Бауман, ВШЭ, МГИМО, Сеченовский, военные вузы. Подбери вуз по региону, факультет и получи персональную программу подготовки к ЕГЭ. Проходные баллы 2025, бюджетные места.",
      keywords:
        "выпускник 11 класс, подбор вуза, проходные баллы егэ 2025, поступление в вуз 2026, военные вузы россии, мгу спбгу мфти бауман вшэ мгимо, бюджетные места, программа подготовки к егэ, какие предметы егэ сдавать, абитуриент",
    };
  }, [step, region, university, faculty]);

  // ─── Расширенный JSON-LD: WebApplication + FAQPage + ItemList вузов ──
  const jsonLd = useMemo(() => {
    const base: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "УЧИСЬПРО Выпускник — подбор вуза и программа поступления",
        applicationCategory: "EducationApplication",
        operatingSystem: "Web",
        description:
          "100 вузов России: подбор по региону, факультет, программа подготовки к ЕГЭ с проходными баллами. Гражданские и военные вузы.",
        url: `${SITE_URL}/graduate`,
        inLanguage: "ru",
        offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Сколько вузов в каталоге?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "100 вузов в 30 регионах России: МГУ, СПбГУ, МФТИ, МГТУ им. Баумана, ВШЭ, МГИМО, Сеченовский, а также военные вузы (ВУНЦ ВВС, ВКА, ВМА им. Кирова).",
            },
          },
          {
            "@type": "Question",
            name: "Откуда берутся проходные баллы?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Проходные баллы — ориентир за прошлую приёмную кампанию (2024–2025), из официальных публикаций приёмных комиссий вузов. Минимальные баллы — официальные пороги допуска вуза.",
            },
          },
          {
            "@type": "Question",
            name: "Как подобрать вуз?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Пройди 4 шага: 1) выбери регион; 2) выбери вуз из списка региона; 3) выбери факультет/специальность; 4) получи программу поступления с предметами ЕГЭ, баллами и ссылками на курсы. Или воспользуйся быстрым поиском по названию.",
            },
          },
          {
            "@type": "Question",
            name: "Есть ли военные вузы?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Да, в каталоге есть военные вузы РФ: ВУНЦ ВВС, ВКА им. Можайского, ВМА им. Кирова, МВАА, Военный университет МО, КВВАУЛ, РВВКУ, ТОВВМУ, КВТКУ и другие. Для них показана специфика — ВВК, физподготовка, контракт с МО РФ.",
            },
          },
        ],
      },
    ];
    // ItemList всех 100 вузов — для богатой выдачи в поиске
    base.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Топ-100 вузов России — каталог УЧИСЬПРО Выпускник",
      numberOfItems: UNIVERSITIES.length,
      itemListElement: UNIVERSITIES.slice(0, 100).map((u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CollegeOrUniversity",
          name: u.fullName,
          alternateName: u.shortName,
          address: { "@type": "PostalAddress", addressLocality: u.city, addressCountry: "RU" },
          url: u.website || `${SITE_URL}/graduate`,
        },
      })),
    });
    return base;
  }, []);

  const canonical = useMemo(() => {
    if (step === 4 && university && faculty) return `${SITE_URL}/graduate#${university.id}/${faculty.id}`;
    if (step === 3 && university) return `${SITE_URL}/graduate#${university.id}`;
    if (step === 2 && region) return `${SITE_URL}/graduate#region-${region.id}`;
    return `${SITE_URL}/graduate`;
  }, [step, region, university, faculty]);

  const stepLabels = ["Регион", "Вуз", "Факультет", "Программа"];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={seo.title}
        description={seo.description}
        canonical={canonical}
        keywords={seo.keywords}
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">🎓</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <Link
            to="/score-calculator"
            className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Icon name="Calculator" size={14} />
            Калькулятор баллов
          </Link>
        </div>
      </div>

      {/* Мобильные крошки */}
      <div className="md:hidden max-w-7xl mx-auto px-4 pt-3">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* Hero — только на первом шаге */}
      {step === 1 && (
        <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="text-base">🎓</span>
              <span className="text-sm text-purple-200 font-bold uppercase tracking-wider">Выпускник · 11 класс</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-4 leading-[1.05]">
              Подбери вуз и составь{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">программу поступления</span>
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
              4 шага: регион → вуз → факультет → твоя программа подготовки к ЕГЭ с проходными баллами и нашими курсами.
            </p>
            <p className="text-white/45 text-xs md:text-sm">
              100 вузов · {REGIONS.length} регионов · Бюджетные места · Военные вузы · Проходные баллы 2025
            </p>
          </div>
        </section>
      )}

      {/* Прогресс-бар шагов */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3, 4].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all ${
                    step === s
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110 shadow-lg shadow-purple-500/40"
                      : step > s
                      ? "bg-emerald-500/25 border border-emerald-500/45 text-emerald-200"
                      : "bg-white/5 border border-white/10 text-white/45"
                  }`}
                >
                  {step > s ? <Icon name="Check" size={14} /> : s}
                </div>
                <p className={`text-[9px] md:text-[11px] mt-1 font-bold uppercase tracking-wider hidden sm:block ${
                  step === s ? "text-white" : step > s ? "text-emerald-300" : "text-white/35"
                }`}>
                  {stepLabels[i]}
                </p>
              </div>
              {i < 3 && (
                <div className={`h-0.5 flex-1 mx-1 md:mx-2 rounded-full transition-colors ${
                  step > s ? "bg-emerald-500/50" : "bg-white/8"
                }`} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Поиск — только на шаге 1 */}
      {step === 1 && (
        <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-6">
          <UniversitySearch onPick={(u) => handleSearchPick({ id: u.id, regionId: u.regionId })} />
        </section>
      )}

      {/* Контент шага */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-2 pb-16">
        {step === 1 && <StepRegion onSelect={handleSelectRegion} />}
        {step === 2 && (
          <StepUniversity
            regionId={regionId}
            onSelect={handleSelectUniversity}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepFaculty
            universityId={universityId}
            onSelect={handleSelectFaculty}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepProgram
            universityId={universityId}
            facultyId={facultyId}
            onBack={() => setStep(3)}
            onRestart={handleRestart}
          />
        )}
      </section>

      {/* SEO-блок: невидимый текст-якорь с ключевыми названиями вузов (доступен поисковикам) */}
      {step === 1 && (
        <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pb-10">
          <details className="group bg-card border border-white/10 rounded-3xl">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-5 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2">
                <Icon name="Building2" size={16} className="text-purple-300" />
                <span className="font-montserrat font-bold text-white text-sm md:text-base">Все 100 вузов в каталоге</span>
              </div>
              <Icon name="ChevronDown" size={16} className="text-white/55 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {UNIVERSITIES.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSearchPick({ id: u.id, regionId: u.regionId })}
                  className="text-left text-white/60 hover:text-white text-xs leading-tight transition-colors py-1.5"
                  title={u.fullName}
                >
                  <span className="font-semibold">{u.shortName}</span>
                  <span className="text-white/35"> · {u.city}</span>
                </button>
              ))}
            </div>
          </details>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}