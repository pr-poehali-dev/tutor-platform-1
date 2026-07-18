import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function TutorHero() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-12 pb-6 text-center">
      <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5 mb-5">
        <Icon name="Sparkles" size={14} className="text-purple-300" />
        <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Личный репетитор с ИИ · с голосом</span>
      </div>

      <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white leading-[1.05]">
        Твой личный <span className="gradient-text-purple">репетитор</span>
        <br className="hidden md:block" /> по всем предметам
      </h1>

      <p className="text-white/65 text-sm md:text-lg mt-5 max-w-2xl mx-auto">
        Голосовой наставник ведёт уроки, проверяет домашку по фото и разбирает задачи —
        всё в одном месте и всегда рядом. Как настоящий репетитор, только в десятки раз дешевле.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="#journey"
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-base px-7 py-3.5 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/25"
        >
          <Icon name="ClipboardCheck" size={18} />
          Пройти тест и получить план
          <Icon name="ArrowRight" size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
        <Link
          to="/homework"
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-semibold text-base px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-all"
        >
          <Icon name="Camera" size={18} className="text-green-400" />
          Проверить домашку
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-white/50 text-xs md:text-sm">
        <span className="inline-flex items-center gap-1.5"><Icon name="Check" size={14} className="text-green-400" /> Первый урок бесплатно</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="Check" size={14} className="text-green-400" /> Без записи и ожидания</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="Check" size={14} className="text-green-400" /> Голосом, как живой учитель</span>
      </div>
    </section>
  );
}