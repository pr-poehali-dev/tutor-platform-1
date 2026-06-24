import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { COURSES, BESTSELLER_COURSE_IDS, FREE_FOREVER_COURSE_IDS } from "@/components/courses/coursesData";
import CourseCardCompact from "@/components/courses/CourseCardCompact";

// 3 хита продаж (самые модные) + ровно 1 бесплатный курс — на видном месте каталога.
const BESTSELLERS = BESTSELLER_COURSE_IDS
  .map((id) => COURSES.find((c) => c.id === id))
  .filter((c): c is NonNullable<typeof c> => Boolean(c));

// Один бесплатный курс «попробовать» — самый популярный из бесплатных.
const ONE_FREE = (() => {
  const free = FREE_FOREVER_COURSE_IDS
    .map((id) => COURSES.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  if (free.length === 0) return null;
  return [...free].sort((a, b) => b.students - a.students)[0];
})();

export default function BestsellersBlock() {
  if (BESTSELLERS.length === 0) return null;

  return (
    <section
      id="bestsellers"
      className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14"
      aria-labelledby="bestsellers-title"
    >
      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-transparent to-orange-500/[0.06] p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3.5 py-1 mb-3">
              <Icon name="Flame" size={13} className="text-white" />
              <span className="text-[11px] text-white font-black uppercase tracking-wider">Хит продаж</span>
            </div>
            <h2 id="bestsellers-title" className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight">
              Самые модные <span className="gradient-text-purple">курсы</span> сейчас
            </h2>
            <p className="text-white/65 text-sm md:text-base mt-3 max-w-2xl">
              Их выбирают чаще всего: расширенные программы с практикой, проектами и доступом навсегда.
            </p>
          </div>
          <Link
            to="/courses?badge=hit"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors whitespace-nowrap"
          >
            Все хиты
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 list-none p-0 m-0">
          {BESTSELLERS.map((course) => (
            <li key={course.id}>
              <CourseCardCompact course={course} />
            </li>
          ))}
          {ONE_FREE && (
            <li key={ONE_FREE.id}>
              <CourseCardCompact course={ONE_FREE} />
            </li>
          )}
        </ul>

        {ONE_FREE && (
          <div className="mt-6 flex items-center justify-center gap-2 text-white/50 text-xs">
            <Icon name="Gift" size={14} className="text-emerald-400" />
            Один курс — бесплатно навсегда, чтобы попробовать без оплаты.{" "}
            <Link to="/courses?badge=free" className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">
              Все бесплатные
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
