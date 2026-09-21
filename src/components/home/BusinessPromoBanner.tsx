import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/**
 * Блок про конструктор онлайн-школ на главной.
 *
 * Раньше вёл на /for-business — витрину с описанием возможностей и кнопкой
 * «Узнать больше». Это лишний шаг: у конструктора есть бесплатная демонстрация,
 * где за минуту собирается готовая программа курса. Показать продукт в работе
 * убедительнее, чем рассказать о нём, поэтому основная кнопка ведёт прямо
 * в конструктор, а ссылка на условия оставлена второй.
 */
export default function BusinessPromoBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-6" aria-label="Конструктор онлайн-школ">
      <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/12 via-fuchsia-500/8 to-cyan-500/10 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 p-6 md:p-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl flex-shrink-0">
            🏫
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-violet-200 font-bold uppercase tracking-wider mb-1.5">
              <Icon name="Sparkles" size={12} /> Бесплатно · без регистрации
            </div>
            <h3 className="font-montserrat font-black text-white text-xl md:text-2xl leading-tight mb-1.5">
              Соберите онлайн-курс за минуту
            </h3>
            <p className="text-white/65 text-sm leading-snug max-w-2xl">
              Назовите тему — ИИ составит программу, уроки с заданиями и квизами,
              плюс тексты для продаж. Результат скачивается в PDF и остаётся вашим.
              Дальше при желании — свой бренд, домен и приём оплат.
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0 w-full md:w-auto">
            <Link
              to="/school-builder"
              onClick={() => trackGoal("home_builder_click", { place: "banner" })}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-xl hover:scale-[1.03] transition-transform"
            >
              Собрать курс бесплатно <Icon name="ChevronRight" size={16} />
            </Link>
            <Link
              to="/repetitoram"
              className="text-center text-white/50 hover:text-white/80 text-xs underline underline-offset-2 transition-colors"
            >
              Условия и тарифы
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
