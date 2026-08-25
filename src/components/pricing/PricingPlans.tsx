import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { PLANS, yearPrice } from "@/components/checkout/checkoutPlans";

const TUTOR = PLANS.tutor;
const KIDS = PLANS.kids;

export default function PricingPlans() {
  const [year, setYear] = useState(false);
  const tutorYear = yearPrice(TUTOR.price, TUTOR);
  const perMonth = Math.round(tutorYear / 12);
  const saving = Math.round((1 - tutorYear / (TUTOR.price * 12)) * 100);

  return (
    <section className="max-w-5xl mx-auto px-4 py-14">
      <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
        Сколько это стоит
      </h2>
      <p className="text-white/60 text-center max-w-2xl mx-auto mb-8">
        Одна оплата в месяц — все предметы и без лимита занятий. Отменить можно в любой момент.
      </p>

      <div className="flex justify-center mb-9">
        <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <button
            onClick={() => setYear(false)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              !year ? "bg-white/10 text-white" : "text-white/55 hover:text-white/80"
            }`}
          >
            Помесячно
          </button>
          <button
            onClick={() => setYear(true)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2 ${
              year ? "bg-white/10 text-white" : "text-white/55 hover:text-white/80"
            }`}
          >
            На год
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              −{saving}%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Бесплатно */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col">
          <h3 className="font-montserrat font-black text-lg text-white mb-1">Бесплатно</h3>
          <p className="text-white/50 text-sm mb-5">Попробовать без оплаты</p>
          <div className="font-montserrat font-black text-4xl text-white mb-6">0 ₽</div>
          <ul className="space-y-2.5 flex-1">
            {[
              "Первый урок каждого предмета",
              "Проверка домашки по фото",
              "Демо задачников ЕГЭ и ОГЭ",
              "Более 30 мини-курсов",
            ].map((f) => (
              <li key={f} className="flex gap-2 text-sm text-white/75">
                <Icon name="Check" size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/free-courses"
            className="mt-6 block text-center rounded-xl border border-white/15 bg-white/[0.04] text-white font-semibold py-3 hover:border-white/30 transition-colors"
          >
            Начать бесплатно
          </Link>
        </div>

        {/* Подписка Репетитор — основной тариф */}
        <div className="rounded-3xl border-2 border-purple-400/40 bg-gradient-to-b from-purple-500/12 to-cyan-500/[0.06] p-6 flex flex-col relative glow-purple">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[11px] font-bold uppercase tracking-wide whitespace-nowrap">
            Выбирают чаще всего
          </div>
          <h3 className="font-montserrat font-black text-lg text-white mb-1">
            Подписка «{TUTOR.name}»
          </h3>
          <p className="text-white/55 text-sm mb-5">Все предметы, без лимита занятий</p>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="font-montserrat font-black text-4xl text-white">
                {(year ? perMonth : TUTOR.price).toLocaleString("ru-RU")}
              </span>
              <span className="text-white/70">₽ / мес</span>
            </div>
            {year && (
              <p className="text-white/50 text-sm mt-1">
                {tutorYear.toLocaleString("ru-RU")} ₽ за год — одним платежом
              </p>
            )}
          </div>

          <ul className="space-y-2.5 flex-1">
            {TUTOR.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-white/85">
                <Icon name="Check" size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            to={`/checkout/tutor${year ? "?period=year" : ""}`}
            className="mt-6 block text-center rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3.5 hover:scale-[1.02] transition-transform"
          >
            Оформить подписку
          </Link>
          <p className="text-white/40 text-xs text-center mt-3">Отмена в любой момент</p>
        </div>

        {/* Разовая покупка */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col">
          <h3 className="font-montserrat font-black text-lg text-white mb-1">Один предмет</h3>
          <p className="text-white/50 text-sm mb-5">Разовая покупка, без подписки</p>
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="font-montserrat font-black text-4xl text-white">1 990</span>
              <span className="text-white/70">₽</span>
            </div>
            <p className="text-white/50 text-sm mt-1">навсегда, без ежемесячной платы</p>
          </div>
          <ul className="space-y-2.5 flex-1">
            {[
              "Один предмет целиком",
              "Все уроки с наставником",
              "Доступ не пропадает",
              "Без автопродления",
            ].map((f) => (
              <li key={f} className="flex gap-2 text-sm text-white/75">
                <Icon name="Check" size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/courses"
            className="mt-6 block text-center rounded-xl border border-white/15 bg-white/[0.04] text-white font-semibold py-3 hover:border-white/30 transition-colors"
          >
            Выбрать предмет
          </Link>
        </div>
      </div>

      {/* Детский тариф */}
      <div className="mt-5 rounded-3xl border border-pink-400/25 bg-gradient-to-r from-pink-500/10 to-amber-500/[0.06] p-6 flex flex-col md:flex-row md:items-center gap-5">
        <div className="text-4xl">🧸</div>
        <div className="flex-1">
          <h3 className="font-montserrat font-black text-lg text-white mb-1">
            Малышам 1–6 лет — подписка «{KIDS.name}»
          </h3>
          <p className="text-white/65 text-sm">
            {KIDS.description}. Первые 3 месяца за 1 ₽, далее {KIDS.price} ₽ в месяц.
          </p>
        </div>
        <Link
          to="/checkout/kids"
          className="rounded-xl bg-white/10 border border-white/15 text-white font-semibold px-6 py-3 text-center hover:bg-white/15 transition-colors whitespace-nowrap"
        >
          Смотреть тариф
        </Link>
      </div>
    </section>
  );
}
