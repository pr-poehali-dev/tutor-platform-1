import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { COURSES } from "@/components/courses/coursesData";

export default function CoursesTeaser() {
  const featured = COURSES.slice(0, 6);

  return (
    <section id="courses" className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-3.5 py-1 mb-3">
            <Icon name="Library" size={13} className="text-purple-300" />
            <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Каталог</span>
          </div>
          <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white leading-tight">
            Курсы для <span className="gradient-text-purple">любого уровня</span>
          </h2>
          <p className="text-white/55 text-sm md:text-base mt-2 max-w-xl">
            Математика, физика, русский, английский и ещё 30+ предметов. От 1 класса до подготовки к ЕГЭ.
          </p>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-colors"
        >
          Все курсы
          <Icon name="ArrowRight" size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {featured.map((course) => (
          <Link
            key={course.id}
            to="/courses"
            className="group relative bg-card border border-white/10 rounded-2xl p-4 md:p-5 hover:border-white/25 transition-all overflow-hidden"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${course.color} opacity-70`} />
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl mb-3`}>
              {course.emoji}
            </div>
            <h3 className="font-montserrat font-bold text-white text-sm md:text-base leading-snug mb-1 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-white/45 text-xs">{course.lessons} уроков</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-6 py-3.5 rounded-2xl hover:opacity-90 transition-opacity glow-purple"
        >
          <Icon name="Library" size={16} />
          Открыть весь каталог
        </Link>
      </div>
    </section>
  );
}
