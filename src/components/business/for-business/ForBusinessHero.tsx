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

      {/* ИИ-помощник по грантам */}
      <section className="mb-16">
        <div className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-700/25 via-fuchsia-600/12 to-cyan-700/20 p-6 md:p-10">
          <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-4">
              <span className="text-lg">🎯</span>
              <span className="text-xs text-white font-bold uppercase tracking-wider">Новое · ИИ-помощник по грантам</span>
            </div>
            <h2 className="font-montserrat font-black text-2xl md:text-4xl mb-3 leading-tight">
              Заявка на грант, которую{" "}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">не стыдно подать</span>
            </h2>
            <p className="text-white/75 text-sm md:text-base max-w-2xl mb-6">
              Опишите любой грант или конкурс и свой проект — ИИ-эксперт подготовит профессиональную заявку:
              актуальность, цели, задачи, социальный эффект, смету, календарный план и разбор по критериям с оценкой шансов.
              На рынке такая услуга стоит от 150 000 ₽ — у нас в разы дешевле, а черновик бесплатный.
            </p>
            <div className="grid sm:grid-cols-4 gap-2 mb-7">
              {[
                { icon: "FileText", t: "Готовый текст заявки" },
                { icon: "Calculator", t: "Смета и бюджет" },
                { icon: "CalendarClock", t: "Календарный план" },
                { icon: "ShieldCheck", t: "Проверка по критериям" },
              ].map((c) => (
                <div key={c.t} className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5">
                  <Icon name={c.icon} size={16} className="text-violet-300 flex-shrink-0" />
                  <span className="text-white/80 text-xs leading-tight">{c.t}</span>
                </div>
              ))}
            </div>
            <Link
              to="/grants"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/25"
            >
              <Icon name="Wand2" size={18} /> Подготовить заявку — бесплатный черновик
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
