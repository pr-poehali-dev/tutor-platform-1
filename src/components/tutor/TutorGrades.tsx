import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { GRADE_LANDINGS } from "./gradeLandingData";

/**
 * Ссылки на страницы репетитора по классам.
 *
 * Помогает и людям (быстрый вход в свой класс), и поиску:
 * страницы классов получают внутренние ссылки с основного раздела.
 */
export default function TutorGrades() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">
          Репетитор по классам
        </h2>
        <p className="text-white/55 text-sm md:text-base mt-2">
          Программа и типичные трудности каждого класса
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {GRADE_LANDINGS.map((g) => (
          <Link
            key={g.grade}
            to={`/repetitor/${g.grade}-klass`}
            className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-card/50 py-5 hover:border-purple-400/40 hover:-translate-y-0.5 transition-all"
          >
            <Icon
              name="GraduationCap"
              size={20}
              className="text-purple-300 group-hover:scale-110 transition-transform"
            />
            <span className="font-montserrat font-black text-white text-lg leading-none">
              {g.grade}
            </span>
            <span className="text-white/45 text-[11px] uppercase tracking-wider">класс</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
