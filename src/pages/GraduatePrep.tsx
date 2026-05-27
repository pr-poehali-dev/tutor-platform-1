import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import {
  SUBJECTS,
  SubjectCode,
  getUniversity,
  getFaculty,
} from "@/components/graduate/graduateData";
import { getPrepProgram } from "@/components/graduate/prepPrograms";
import PrepCourseHero from "@/components/graduate/PrepCourseHero";
import PrepCourseWeekPlan from "@/components/graduate/PrepCourseWeekPlan";
import PrepCourseModules from "@/components/graduate/PrepCourseModules";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

/** Сколько недель осталось до 1 июня (старт ЕГЭ). */
function weeksUntilExam(): number {
  const today = new Date();
  const year = today.getMonth() > 5 ? today.getFullYear() + 1 : today.getFullYear();
  const examStart = new Date(year, 5, 1); // 1 июня
  const diffMs = examStart.getTime() - today.getTime();
  const weeks = Math.max(8, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));
  return weeks;
}

/**
 * Индивидуальный курс подготовки к ЕГЭ по конкретному предмету
 * с привязкой к выбранному вузу и факультету.
 *
 * URL: /graduate/prep/:subject/:universityId/:facultyId
 */
export default function GraduatePrep() {
  const { subject = "", universityId = "", facultyId = "" } = useParams();

  const subjectInfo = SUBJECTS[subject as SubjectCode];
  const program = subject ? getPrepProgram(subject as SubjectCode) : undefined;
  const university = universityId ? getUniversity(universityId) : undefined;
  const faculty = universityId && facultyId ? getFaculty(universityId, facultyId) : undefined;
  const examInFaculty = faculty?.exams.find((e) => e.subject === subject);
  const minScoreForFaculty = examInFaculty?.minScore;

  const weeks = useMemo(weeksUntilExam, []);

  if (!subjectInfo || !program) {
    return <Navigate to="/graduate" replace />;
  }

  // ─── Целевой балл = max(порог вуза + 15, проходной среднего топ-уровня) ──
  const targetScore = Math.max(
    minScoreForFaculty ? minScoreForFaculty + 15 : 75,
    program.maxScore >= 100 ? 90 : 75,
  );

  const canonical = `${SITE_URL}/graduate/prep/${subject}/${universityId}/${facultyId}`;

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Выпускник", href: "/graduate" },
    ...(university ? [{ label: university.shortName, href: "/graduate" }] : []),
    ...(faculty ? [{ label: faculty.specialty, href: "/graduate" }] : []),
    { label: subjectInfo.label },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: program.title,
      description: `${program.audience} ${program.outcomes.join(". ")}`,
      provider: {
        "@type": "Organization",
        name: "УЧИСЬПРО",
        sameAs: "https://учисьпро.рф",
      },
      inLanguage: "ru",
      educationalCredentialAwarded: "Подготовка к ЕГЭ",
      coursePrerequisites: "Знания школьной программы 10–11 класса",
      timeRequired: `PT${program.totalHours}H`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "RUB", availability: "https://schema.org/InStock" },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${program.totalHours}H`,
      },
      teaches: program.modules.flatMap((m) => m.topics.map((t) => t.title)),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`${program.title} — подготовка к поступлению в ${university?.shortName ?? "вуз"} | УЧИСЬПРО`}
        description={`Индивидуальный курс подготовки к ЕГЭ по предмету «${subjectInfo.label}». ${program.modules.length} модулей, ${program.totalHours} часов, ${program.modules.reduce((s, m) => s + m.topics.length, 0)} тем. Цель: ${targetScore} баллов для поступления${faculty ? ` на «${faculty.specialty}»` : ""}${university ? ` в ${university.shortName}` : ""}.`}
        canonical={canonical}
        keywords={`подготовка к егэ ${subjectInfo.label.toLowerCase()}, курс егэ ${subjectInfo.label.toLowerCase()}, ${university?.shortName ?? ""}, ${faculty?.specialty ?? ""}, ${targetScore} баллов, фипи кодификатор`}
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
            to="/graduate"
            className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Icon name="ArrowLeft" size={14} />
            К вузу
          </Link>
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 pt-3">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <PrepCourseHero
          program={program}
          subject={subjectInfo}
          university={university}
          faculty={faculty}
          targetScore={targetScore}
          minScore={minScoreForFaculty}
          weeksToExam={weeks}
        />

        {/* Outcomes — что получит */}
        <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Trophy" size={16} className="text-amber-300" />
            <span className="text-amber-300 text-[11px] uppercase tracking-wider font-bold">Результат</span>
          </div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
            Что ты получишь
          </h2>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {program.outcomes.map((o, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white/[0.03] border border-white/8 rounded-2xl p-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={14} className="text-white" />
                </div>
                <p className="text-white/85 text-sm leading-snug pt-1">{o}</p>
              </div>
            ))}
          </div>
        </section>

        <PrepCourseWeekPlan program={program} weeksToExam={weeks} />

        <PrepCourseModules program={program} />

        {/* Методика */}
        <section className="bg-gradient-to-br from-cyan-500/12 to-blue-500/12 border border-cyan-500/30 rounded-3xl p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Sparkles" size={16} className="text-cyan-300" />
            <span className="text-cyan-300 text-[11px] uppercase tracking-wider font-bold">Методика УЧИСЬПРО</span>
          </div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
            Как устроено обучение
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { icon: "Bot", title: "ИИ-репетитор 24/7", desc: "Голосовые уроки, разбор каждой ошибки, ответы на вопросы в любое время." },
              { icon: "Target", title: "Адаптивный план", desc: "Программа подстраивается под твой уровень — слабые темы повторяются чаще." },
              { icon: "FileCheck2", title: "Соответствие ФИПИ", desc: "Все задания из кодификатора и спецификатора. Критерии оценки — официальные." },
              { icon: "Trophy", title: "Геймификация", desc: "Очки, серии дней, рейтинг — учиться затягивает." },
              { icon: "ClipboardList", title: "Пробные ЕГЭ", desc: "Симулятор реального экзамена с таймером, бланками и автопроверкой." },
              { icon: "MessageCircleQuestion", title: "Связка с куратором", desc: "Раз в неделю — звонок куратора, разбор успеваемости." },
            ].map((m) => (
              <div key={m.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Icon name={m.icon} size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-montserrat font-bold text-white text-sm mb-0.5">{m.title}</p>
                  <p className="text-white/65 text-xs leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Финальный CTA */}
        <section className="bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-rose-500/20 border border-purple-500/35 rounded-3xl p-6 md:p-8 text-center">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-3xl mb-2">
            Готов начать?
          </h2>
          <p className="text-white/75 text-sm md:text-base mb-5 max-w-xl mx-auto">
            Первая неделя — бесплатно. Без карты. Дальше — тариф «Выпускник» с полным доступом к курсу и ИИ-репетитору.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm md:text-base font-black px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/30"
            >
              <Icon name="Sparkles" size={16} />
              Начать бесплатно
              <Icon name="ArrowRight" size={16} />
            </Link>
            <Link
              to="/graduate"
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm md:text-base font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Icon name="ArrowLeft" size={14} />
              Назад к вузу
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
