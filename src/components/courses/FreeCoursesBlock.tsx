import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { COURSES, FREE_FOREVER_COURSE_IDS } from "@/components/courses/coursesData";
import CourseCardCompact from "@/components/courses/CourseCardCompact";

interface Props {
  /** Заголовок секции (по умолчанию — для главной). */
  compact?: boolean;
}

const FREE_COURSES = FREE_FOREVER_COURSE_IDS
  .map((id) => COURSES.find((c) => c.id === id))
  .filter((c): c is NonNullable<typeof c> => Boolean(c));

export default function FreeCoursesBlock({ compact = false }: Props) {
  if (FREE_COURSES.length === 0) return null;

  return (
    <section
      id="free-courses"
      className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16"
      aria-labelledby="free-courses-title"
    >
      <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-cyan-500/[0.06] p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3.5 py-1 mb-3">
              <Icon name="Gift" size={13} className="text-emerald-300" />
              <span className="text-[11px] text-emerald-200 font-bold uppercase tracking-wider">Бесплатно навсегда</span>
            </div>
            <h2 id="free-courses-title" className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight">
              Начни учиться <span className="gradient-text-purple">бесплатно</span> — прямо сейчас
            </h2>
            <p className="text-white/65 text-sm md:text-base mt-3 max-w-2xl">
              Эти курсы открыты полностью и навсегда: без оплаты, без карты и без ограничения по времени. Заходи и учись.
            </p>
          </div>
          <Link
            to="/courses?badge=free"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors whitespace-nowrap"
          >
            Все бесплатные
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 list-none p-0 m-0">
          {FREE_COURSES.map((course) => (
            <li key={course.id}>
              <CourseCardCompact course={course} />
            </li>
          ))}
        </ul>

        {!compact && (
          <>
            {/* Мост к каталогу: бесплатное затянуло — предлагаем полный каталог */}
            <div className="mt-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/15 to-cyan-500/10 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-montserrat font-bold text-white text-base md:text-lg mb-1">
                  Понравилось? Открой все курсы и ИИ-репетитора
                </p>
                <p className="text-white/60 text-sm leading-relaxed">
                  Полный каталог, персональный маршрут и голосовой репетитор 24/7.
                  Каждый курс покупается отдельно, оплата разовая — доступ открывается навсегда.
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
              >
                Все курсы
                <Icon name="ArrowRight" size={15} />
              </Link>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-white/45 text-xs">
              <Icon name="ShieldCheck" size={14} className="text-emerald-400" />
              Никаких скрытых платежей. Платные курсы — только по желанию, как продолжение.
            </div>
          </>
        )}
      </div>
    </section>
  );
}