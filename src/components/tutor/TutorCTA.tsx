import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function TutorCTA() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 to-cyan-500/15 p-8 md:p-12 text-center">
        <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-purple-500/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-cyan-500/25 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <span className="text-4xl">🎓</span>
          <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mt-3 leading-tight">
            Первый урок — бесплатно
          </h2>
          <p className="text-white/70 text-sm md:text-lg mt-3 max-w-xl mx-auto">
            Попробуй наставника прямо сейчас: без карты, без регистрации. Понравится — откроешь весь предмет за 1990 ₽ навсегда.
          </p>
          <Link
            to="/super-courses"
            className="group inline-flex items-center gap-2 bg-white text-purple-700 font-bold text-base px-8 py-3.5 rounded-2xl hover:bg-white/90 transition-all mt-7 shadow-lg"
          >
            <Icon name="Play" size={18} />
            Начать первый урок
            <Icon name="ArrowRight" size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
