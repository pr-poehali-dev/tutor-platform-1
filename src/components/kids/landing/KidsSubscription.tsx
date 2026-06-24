import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

// Абонемент «Малыш»: 399 ₽/мес, первые 3 месяца за 1 ₽.
export default function KidsSubscription() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-16" aria-labelledby="kids-sub-title">
      <div className="relative overflow-hidden rounded-3xl border border-pink-400/30 bg-gradient-to-br from-pink-600/25 via-rose-500/15 to-amber-500/15 p-6 md:p-10">
        <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3.5 py-1 mb-4">
            <Icon name="Sparkles" size={13} className="text-amber-200" />
            <span className="text-[11px] text-white font-black uppercase tracking-wider">Акция · первые 3 месяца за 1 ₽</span>
          </div>

          <h2 id="kids-sub-title" className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight mb-3">
            Абонемент «Малыш» — всё для развития ребёнка
          </h2>
          <p className="text-white/75 text-sm md:text-base max-w-2xl mb-6">
            Сказки с озвучкой, обучение чтению, развивающие игры, песни и занятия по методикам Монтессори.
            Попробуйте 3 месяца за 1 ₽, дальше — всего 399 ₽ в месяц. Отменить можно в любой момент.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-7">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-montserrat font-black text-5xl text-white">1</span>
                <span className="text-white/80 text-lg">₽ за 3 месяца</span>
              </div>
              <p className="text-white/55 text-sm mt-1">далее 399 ₽/мес</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 flex-1">
              {[
                "Все занятия и аудиосказки",
                "Игры, песни, обучение чтению",
                "Контроль экранного времени",
                "Советы родителям",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/85">
                  <Icon name="Check" size={14} className="text-emerald-300 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/checkout/kids"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-base px-7 py-4 rounded-2xl hover:opacity-95 transition-opacity shadow-lg shadow-pink-500/25"
          >
            <Icon name="Heart" size={18} />
            Оформить за 1 ₽
            <Icon name="ArrowRight" size={18} />
          </Link>

          <div className="mt-4 flex items-center gap-2 text-white/50 text-xs">
            <Icon name="ShieldCheck" size={14} className="text-emerald-300" />
            Безопасная оплата через ЮKassa, чек по 54-ФЗ. Без скрытых платежей.
          </div>
        </div>
      </div>
    </section>
  );
}
