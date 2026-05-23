import PracticeLayout from "@/components/practice/PracticeLayout";
import { BIOLOGY_PROBLEMS, BIOLOGY_TOPICS } from "@/components/practice/biologyProblems";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function BiologyProblems() {
  return (
    <PracticeLayout
      storageKey="uchispro_biology_solved_v1"
      problems={BIOLOGY_PROBLEMS}
      topics={BIOLOGY_TOPICS}
      accent="from-green-500 to-emerald-500"
      subjectName="Биология"
      subjectGenitive="биологии"
      subjectSlug="biology"
      emoji="🧬"
      badge="Сильная биология"
      h1Highlight={<>Задачи по биологии <span className="gradient-text-purple">с разбором</span></>}
      intro="Клетка, ботаника, зоология, анатомия, генетика, экология. У каждой задачи — анализ, план, пошаговое решение и интерактивная проверка ответа. По программе 6–9 классов и ОГЭ."
      seoTitle="Биология — задачи с разбором и проверкой ответов | 6–9 класс, ОГЭ"
      seoDescription="Тренажёр по биологии для школьников 6–9 классов: клетка, ботаника, зоология, анатомия, генетика, экология. Введи ответ — система проверит. Анализ, план и пошаговое решение каждой задачи. Подготовка к ОГЭ."
      seoKeywords="биология задачи, тренажёр по биологии, биология 8 класс, биология 9 класс, ОГЭ биология, клетка, фотосинтез, генетика, анатомия человека, экология"
      canonical={`${SITE_URL}/biology-problems`}
      parentLandingHref="/courses/biology"
      parentLandingLabel="Все курсы по биологии"
    />
  );
}
