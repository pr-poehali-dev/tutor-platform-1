import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import StepRegion from "@/components/graduate/StepRegion";
import StepUniversity from "@/components/graduate/StepUniversity";
import StepFaculty from "@/components/graduate/StepFaculty";
import StepProgram from "@/components/graduate/StepProgram";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

type Step = 1 | 2 | 3 | 4;

export default function Graduate() {
  const [step, setStep] = useState<Step>(1);
  const [regionId, setRegionId] = useState<string>("");
  const [universityId, setUniversityId] = useState<string>("");
  const [facultyId, setFacultyId] = useState<string>("");

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

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "УЧИСЬПРО Выпускник — программа поступления в вуз",
      applicationCategory: "EducationApplication",
      description:
        "Подбор вуза, факультета и индивидуальной программы подготовки к ЕГЭ для выпускников 11 класса. Топ-30 вузов России, проходные баллы, бюджетные места, военные вузы.",
      url: `${SITE_URL}/graduate`,
      inLanguage: "ru",
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Выпускник — подбор вуза и программа поступления для 11 класса | УЧИСЬПРО"
        description="Подбери вуз по региону, факультет и получи персональную программу подготовки к ЕГЭ. Топ-30 вузов России: МГУ, СПбГУ, МФТИ, Бауман, ВШЭ, военные вузы. Минимальные и проходные баллы, бюджетные места."
        canonical={`${SITE_URL}/graduate`}
        keywords="выпускник 11 класс, подбор вуза, проходные баллы егэ, поступление в вуз 2026, военные вузы россии, мгу спбгу мфти бауман, бюджетные места, программа подготовки к егэ"
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
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Выпускник" }]} />
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
              Топ-30 вузов России · Бюджетные места · Военные вузы · Проходные баллы 2025
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
                  {["Регион", "Вуз", "Факультет", "Программа"][i]}
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

      {/* Контент шага */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-6 pb-16">
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

      <SiteFooter />
    </div>
  );
}
