import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const FREE_FEATURES = [
  "Первый урок каждого предмета",
  "Безлимитная проверка домашки по фото",
  "Демо задачников по предметам",
];

const ONCE_FEATURES = [
  "Один предмет целиком навсегда",
  "Все уроки предмета с наставником",
  "Без ежемесячной оплаты",
];

const SUB_FEATURES = [
  "Все предметы: физика, математика, информатика",
  "Безлимит голосовых уроков",
  "Безлимит проверки домашки",
  "Все задачники и подготовка к ЕГЭ",
];

export default function TutorPricing() {
  const [period, setPeriod] = useState<"month" | "year">("month");
  const subPrice = period === "month" ? 1490 : 9990;
  const subPeriod = period === "month" ? "мес" : "год";
  const subHint = period === "year" ? "≈ 832 ₽/мес · экономия 44%" : "или 9 990 ₽ за год";

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Сколько стоит</h2>
        <p className="text-white/55 text-sm md:text-base mt-2">
          Начни бесплатно. Нужен один предмет — купи навсегда. Хочешь всё — подписка дешевле репетитора в разы.
        </p>
      </div>

      {/* Переключатель периода */}
      <div className="flex justify-center mb-7">
        <div className="inline-flex bg-white/5 border border-white/10 rounded-2xl p-1">
          <button
            onClick={() => setPeriod("month")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${period === "month" ? "bg-white text-purple-700" : "text-white/60 hover:text-white"}`}
          >
            Помесячно
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${period === "year" ? "bg-white text-purple-700" : "text-white/60 hover:text-white"}`}
          >
            За год · −44%
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-5 items-stretch">
        {/* Бесплатно */}
        <div className="rounded-3xl border border-white/10 bg-card/60 p-6 flex flex-col">
          <div className="text-2xl mb-2">🎁</div>
          <h3 className="font-montserrat font-black text-lg text-white">Бесплатно</h3>
          <div className="mt-2 mb-4">
            <span className="font-montserrat font-black text-3xl text-white">0 ₽</span>
          </div>
          <ul className="space-y-2.5 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-white/70 text-sm">
                <Icon name="Check" size={16} className="text-green-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link to="/super-courses" className="mt-5 text-center bg-white/5 border border-white/10 text-white font-semibold text-sm py-3 rounded-xl hover:bg-white/10 transition-all">
            Начать бесплатно
          </Link>
        </div>

        {/* Один предмет */}
        <div className="rounded-3xl border border-cyan-500/25 bg-card/60 p-6 flex flex-col">
          <div className="text-2xl mb-2">📘</div>
          <h3 className="font-montserrat font-black text-lg text-white">Один предмет</h3>
          <div className="mt-2 mb-4">
            <span className="font-montserrat font-black text-3xl text-white">1 990 ₽</span>
            <span className="text-white/50 text-sm ml-1">навсегда</span>
          </div>
          <ul className="space-y-2.5 flex-1">
            {ONCE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-white/70 text-sm">
                <Icon name="Check" size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link to="/super-courses" className="mt-5 text-center bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 font-semibold text-sm py-3 rounded-xl hover:bg-cyan-500/25 transition-all">
            Выбрать предмет
          </Link>
        </div>

        {/* Подписка — рекомендуемая */}
        <div className="relative rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-600/20 to-cyan-500/12 p-6 flex flex-col shadow-lg shadow-purple-500/10">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full whitespace-nowrap">
            Выгоднее всего
          </span>
          <div className="text-2xl mb-2">🎓</div>
          <h3 className="font-montserrat font-black text-lg text-white">Подписка «Репетитор»</h3>
          <div className="mt-2 mb-1">
            <span className="font-montserrat font-black text-3xl text-white">{subPrice.toLocaleString("ru-RU")} ₽</span>
            <span className="text-white/50 text-sm ml-1">/ {subPeriod}</span>
          </div>
          <div className="text-purple-200 text-xs mb-4">{subHint}</div>
          <ul className="space-y-2.5 flex-1">
            {SUB_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-white/80 text-sm">
                <Icon name="Check" size={16} className="text-purple-300 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to={`/checkout/tutor?period=${period}&from=/tutor`}
            className="mt-5 text-center bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-all"
          >
            Оформить подписку
          </Link>
        </div>
      </div>

      <p className="text-center text-white/40 text-xs mt-6">
        Живой репетитор стоит 1 000–2 000 ₽ за одно занятие. Подписка «Репетитор» — это безлимит на месяц по цене одного урока.
      </p>
    </section>
  );
}
