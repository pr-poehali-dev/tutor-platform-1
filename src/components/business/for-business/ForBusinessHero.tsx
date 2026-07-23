import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

export default function ForBusinessHero() {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Для бизнеса" }]} />
      </div>

      {/* Hero */}
      <section className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
          <Icon name="Sparkles" size={12} className="text-violet-300" />
          <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">Платформа-конструктор для школ</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-6xl mb-5 leading-tight">
          Своя онлайн-школа{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            за один вечер
          </span>
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-7">
          Вводите тему — искусственный интеллект собирает курс целиком: программу, уроки, тесты и видео. А затем работает преподавателем для ваших учеников 24/7. Ваш бренд, ваш домен, ваши деньги. Без абонплаты — платите только процент с продаж.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#lead"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="Rocket" size={18} /> Получить демо и цену
          </a>
          <Link
            to="/school-builder"
            className="inline-flex items-center justify-center gap-2 border border-violet-400/40 bg-violet-500/10 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-violet-500/20 transition-colors"
          >
            <Icon name="Sparkles" size={18} className="text-violet-300" /> Собрать курс бесплатно
          </Link>
        </div>
      </section>

    </>
  );
}