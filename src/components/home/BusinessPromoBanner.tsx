import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function BusinessPromoBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-6" aria-label="Конструктор онлайн-школ для бизнеса">
      <Link
        to="/for-business"
        className="group block rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/12 via-fuchsia-500/8 to-cyan-500/10 hover:border-violet-400/45 transition-all overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 p-6 md:p-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl flex-shrink-0">
            🚀
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-violet-200 font-bold uppercase tracking-wider mb-1.5">
              <Icon name="Building2" size={12} /> Новое · Для бизнеса
            </div>
            <h3 className="font-montserrat font-black text-white text-xl md:text-2xl leading-tight mb-1.5">
              Запустите свою онлайн-школу за вечер
            </h3>
            <p className="text-white/65 text-sm leading-snug max-w-2xl">
              White-label платформа для авторов, школ и компаний. ИИ соберёт курс целиком за час и станет преподавателем для ваших учеников 24/7. Ваш бренд, ваш домен, ваши деньги.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-xl flex-shrink-0 group-hover:scale-[1.03] transition-transform">
            Узнать больше <Icon name="ChevronRight" size={16} />
          </span>
        </div>
      </Link>
    </section>
  );
}
