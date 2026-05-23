import PracticeLayout from "@/components/practice/PracticeLayout";
import { MATH_PROBLEMS, MATH_TOPICS } from "@/components/practice/mathProblems";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function MathProblems() {
  return (
    <PracticeLayout
      storageKey="uchispro_math_solved_v1"
      problems={MATH_PROBLEMS}
      topics={MATH_TOPICS}
      accent="from-purple-500 to-cyan-500"
      subjectName="Математика"
      subjectGenitive="математике"
      subjectSlug="math"
      emoji="📐"
      badge="Сильная математика"
      h1Highlight={<>Текстовые задачи <span className="gradient-text-purple">с разбором</span></>}
      intro="По учебнику Виленкина и сборникам ОГЭ. У каждой задачи — анализ, план решения, шаги с формулами и интерактивная проверка ответа. Учим не зубрить, а думать как математик."
      seoTitle="Сильная математика — задачи с разбором и проверкой ответов | 6 класс, ОГЭ"
      seoDescription="Решай текстовые задачи по математике как настоящий математик: дроби, проценты, движение, работа, смеси, геометрия. Введи ответ — система проверит. Анализ, план и пошаговое решение."
      seoKeywords="математика 6 класс, текстовые задачи, виленкин, дроби, проценты, пропорции, задачи на движение, задачи на работу, смеси, концентрация, разбор задач"
      canonical={`${SITE_URL}/math-problems`}
      parentLandingHref="/courses/math"
      parentLandingLabel="Все курсы по математике"
    />
  );
}
