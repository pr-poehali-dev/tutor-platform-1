import PracticeLayout from "@/components/practice/PracticeLayout";
import { CHEMISTRY_PROBLEMS, CHEMISTRY_TOPICS } from "@/components/practice/chemistryProblems";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function ChemistryProblems() {
  return (
    <PracticeLayout
      storageKey="uchispro_chemistry_solved_v1"
      problems={CHEMISTRY_PROBLEMS}
      topics={CHEMISTRY_TOPICS}
      accent="from-emerald-500 to-teal-500"
      subjectName="Химия"
      subjectGenitive="химии"
      subjectSlug="chemistry"
      emoji="🧪"
      badge="Сильная химия"
      h1Highlight={<>Задачи по химии <span className="gradient-text-purple">с разбором</span></>}
      intro="Строение атома, классы веществ, реакции, моль и расчёты, растворы, органика. Каждая задача — с пошаговым разбором, формулой и интерактивной проверкой. По Габриеляну и в формате ОГЭ."
      seoTitle="Химия — задачи с разбором и проверкой ответов | 8–9 класс, ОГЭ"
      seoDescription="Тренажёр по химии для школьников 8–9 классов: атом, оксиды, кислоты, основания, соли, моль, растворы, органика. Введи ответ — система проверит. Пошаговый разбор каждой задачи. Подготовка к ОГЭ."
      seoKeywords="химия задачи, тренажёр по химии, химия 8 класс, химия 9 класс, ОГЭ химия, габриелян, моль, растворы, оксиды, кислоты, соли"
      canonical={`${SITE_URL}/chemistry-problems`}
      parentLandingHref="/courses/chemistry"
      parentLandingLabel="Все курсы по химии"
    />
  );
}
