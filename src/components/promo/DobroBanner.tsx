import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  isPromoActive, timeLeft, formatEndDate, PROMO_CODE,
} from "./dobroConfig";

/**
 * Главный баннер акции «ДОБРО» — большой, акцентный, с обратным отсчётом.
 * Ставится на главной странице между hero и каталогом.
 */
export default function DobroBanner() {
  const [active, setActive] = useState(false);
  const [tl, setTl] = useState(() => timeLeft());

  useEffect(() => {
    setActive(isPromoActive());
    const t = setInterval(() => setTl(timeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!active || tl.expired) return null;

  return (
    <section className="relative max-w-6xl mx-auto px-4 md:px-6 my-8 md:my-12">
      <div className="relative overflow-hidden rounded-3xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/25 via-pink-500/20 to-orange-500/25 backdrop-blur-sm p-6 md:p-10">
        {/* Декор */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-rose-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-orange-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-3 right-3 text-5xl md:text-7xl opacity-25 select-none pointer-events-none">❤️</div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-3">
            <span className="text-base">❤️</span>
            <span className="text-white font-bold text-[11px] uppercase tracking-widest">
              Акция «{PROMO_CODE}» · до {formatEndDate()}
            </span>
          </div>

          <h2 className="font-montserrat font-black text-white text-3xl md:text-5xl lg:text-6xl leading-[1.05] mb-3">
            Платежи на паузе.<br />
            <span className="bg-gradient-to-r from-yellow-200 via-pink-100 to-orange-200 bg-clip-text text-transparent">
              Учись бесплатно
            </span> прямо сейчас
          </h2>

          <p className="text-white/90 text-base md:text-lg max-w-2xl mb-5 leading-relaxed">
            До <strong>{formatEndDate()}</strong> мы открыли полный доступ ко всем курсам, ИИ-репетитору и инструментам подготовки к ЕГЭ — <strong>бесплатно для каждого школьника</strong>. Без карты, без подписки. Просто заходи и учись.
          </p>

          {/* Обратный отсчёт */}
          <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-md mb-5">
            {[
              { v: tl.days, l: "дней" },
              { v: tl.hours, l: "часов" },
              { v: tl.minutes, l: "минут" },
              { v: tl.seconds, l: "секунд" },
            ].map((b) => (
              <div key={b.l} className="bg-black/35 backdrop-blur-sm rounded-2xl p-2 md:p-3 text-center border border-white/15">
                <p className="font-montserrat font-black text-white text-2xl md:text-4xl tabular-nums leading-none">
                  {String(b.v).padStart(2, "0")}
                </p>
                <p className="text-white/65 text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">{b.l}</p>
              </div>
            ))}
          </div>

          {/* Перки */}
          <div className="grid sm:grid-cols-3 gap-2 mb-5 max-w-2xl">
            {[
              { icon: "Sparkles", text: "Все курсы 1–11 кл" },
              { icon: "Bot",      text: "ИИ-репетитор 24/7" },
              { icon: "GraduationCap", text: "Подготовка к ЕГЭ/ОГЭ" },
            ].map((p) => (
              <div key={p.text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/15">
                <Icon name={p.icon} size={14} className="text-yellow-200 flex-shrink-0" />
                <span className="text-white text-xs md:text-sm font-bold">{p.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-white text-rose-600 font-black text-sm md:text-base px-6 py-3.5 rounded-xl hover:scale-[1.03] transition-transform shadow-2xl shadow-black/30"
            >
              <Icon name="Rocket" size={16} />
              Начать учиться бесплатно
            </Link>
            <Link
              to="/promo/dobro"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-bold text-sm md:text-base px-5 py-3.5 rounded-xl"
            >
              Подробнее об акции
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
