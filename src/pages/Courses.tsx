import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import PersonaWidget from "@/components/persona/PersonaWidget";
import BestsellersBlock from "@/components/courses/BestsellersBlock";
import useReadyCourses from "@/hooks/useReadyCourses";
import {
  COURSES,
  SortKey,
  getCoursePrice,
} from "@/components/courses/coursesData";
import { BadgeFilter, COURSES_JSON_LD } from "@/components/courses/catalog/coursesCatalogData";
import CoursesHeader from "@/components/courses/catalog/CoursesHeader";
import CoursesFilters from "@/components/courses/catalog/CoursesFilters";
import CoursesGrid from "@/components/courses/catalog/CoursesGrid";
import AiPicker from "@/components/ai/AiPicker";

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const initialBadge: BadgeFilter =
    searchParams.get("badge") === "free" ? "free" : "all";
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [format, setFormat] = useState("all");
  const [badge, setBadge] = useState<BadgeFilter>(initialBadge);
  const [sort, setSort] = useState<SortKey>("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Только курсы с реальной (НЕ шаблонной) программой — нельзя продавать продукт без качества
  const { readyIds, loaded: readyLoaded } = useReadyCourses();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = COURSES.filter((c) => {
      // Главный фильтр: курсы без реальной программы НЕ показываем
      if (!readyIds.has(c.id)) return false;
      if (subject !== "all" && c.subject !== subject) return false;
      if (grade !== "all" && c.grade !== grade) return false;
      if (format !== "all" && c.format !== format) return false;
      if (badge === "free" && !c.freeForever) return false;
      if (badge === "hit" && !c.isHit) return false;
      if (badge === "new" && !c.isNew) return false;
      if (badge === "sale" && !c.isSale) return false;
      if (badge === "trial" && !c.trialAvailable) return false;
      if (q) {
        const blob = [
          c.title,
          c.description,
          c.tutor,
          c.tutorBadge,
          ...c.tags,
        ].join(" ").toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "price_asc":
        sorted.sort((a, b) => getCoursePrice(a) - getCoursePrice(b));
        break;
      case "price_desc":
        sorted.sort((a, b) => getCoursePrice(b) - getCoursePrice(a));
        break;
      case "new":
        sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case "popular":
      default:
        sorted.sort((a, b) => b.students - a.students);
    }
    return sorted;
  }, [query, subject, grade, format, badge, sort, readyIds]);

  // Список для ИИ-подборщика: только готовые курсы, чтобы он не советовал
  // то, что человек не сможет открыть.
  const pickerItems = useMemo(() => {
    const GRADE_LABEL: Record<string, string> = {
      "1-4": "1-4 класс",
      "5-9": "5-9 класс",
      "10-11": "10-11 класс",
      ege: "подготовка к ЕГЭ",
      oge: "подготовка к ОГЭ",
      adult: "для взрослых",
    };
    return COURSES.filter((c) => readyIds.has(c.id)).map((c) => {
      const price = getCoursePrice(c);
      return {
        id: String(c.id),
        title: c.title,
        meta: `${GRADE_LABEL[c.grade] || c.grade} · ${
          price === 0 ? "бесплатно" : `${price.toLocaleString("ru-RU")} ₽`
        } · ${c.lessons} уроков`,
        url: `/course/${c.id}`,
        emoji: "📚",
      };
    });
  }, [readyIds]);

  const activeFilters =
    (subject !== "all" ? 1 : 0) +
    (grade !== "all" ? 1 : 0) +
    (format !== "all" ? 1 : 0) +
    (badge !== "all" ? 1 : 0) +
    (query ? 1 : 0);

  const resetAll = () => {
    setQuery("");
    setSubject("all");
    setGrade("all");
    setFormat("all");
    setBadge("all");
    setSort("popular");
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Каталог курсов УЧИСЬПРО — школа, ЕГЭ/ОГЭ и обучение взрослых"
        description="Каталог онлайн-курсов УЧИСЬПРО: школьные предметы 1–11 классов и подготовка к ОГЭ/ЕГЭ, а также курсы для взрослых — ИИ, продажи, бизнес. Поиск и фильтры."
        canonical="https://учисьпро.рф/courses"
        keywords="каталог курсов, онлайн курсы, курсы 1-11 классы, подготовка к егэ, подготовка к огэ, курсы для взрослых, курсы по ии, курсы по продажам"
        jsonLd={COURSES_JSON_LD}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 137.5) % 100) + "%",
              top: ((i * 97.3) % 100) + "%",
              opacity: 0.12 + (i % 4) * 0.08,
            }}
          />
        ))}
      </div>

      <CoursesHeader />

      <main>
        {/* ИИ-подборщик: родителю проще спросить словами «что подойдёт
            восьмикласснику по математике», чем крутить пять фильтров. */}
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <AiPicker
            items={pickerItems}
            source="courses"
            title="Не знаете, что выбрать?"
            subtitle="Опишите задачу своими словами — подберу курс из каталога"
            placeholder="Например: сыну 8 класс, проседает математика"
            chips={[
              "Ребёнку 8 класс, проседает математика",
              "Готовиться к ЕГЭ по русскому с нуля",
              "Хочу сменить профессию, ничего не умею",
              "Что-то бесплатное для 5 класса",
            ]}
            role={
              "Ты — консультант образовательной платформы УЧИСЬПРО. " +
              "Помогаешь родителю или взрослому выбрать курс. " +
              "Говори просто и по-человечески, без рекламных штампов."
            }
          />
        </div>

        {/* Хиты продаж + 1 бесплатный — на видном месте, пока не начали искать/фильтровать */}
        {badge === "all" && subject === "all" && grade === "all" && format === "all" && !query && (
          <BestsellersBlock />
        )}

        <CoursesFilters
          query={query}
          setQuery={setQuery}
          subject={subject}
          setSubject={setSubject}
          grade={grade}
          setGrade={setGrade}
          format={format}
          setFormat={setFormat}
          badge={badge}
          setBadge={setBadge}
          sort={sort}
          setSort={setSort}
          filteredCount={filtered.length}
          activeFilters={activeFilters}
          resetAll={resetAll}
        />

        <CoursesGrid
          readyLoaded={readyLoaded}
          readyIds={readyIds}
          filtered={filtered}
          resetAll={resetAll}
        />
      </main>

      <SiteFooter />

      {/* Живой консультант: помогает выбрать курс голосом, если человек растерялся */}
      <PersonaWidget personaId="dmitry" />

      {showMobileFilters && <div onClick={() => setShowMobileFilters(false)} />}
    </div>
  );
}