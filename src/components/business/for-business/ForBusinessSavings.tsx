import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

/**
 * Наглядное сравнение расходов автора: платформы с абонплатой (тип GetCourse)
 * против модели УЧИСЬПРО «только процент с продаж».
 * Автор двигает выручку — сразу видит, сколько денег остаётся у него.
 * Цифры абонплаты — усреднённый рыночный ориентир, показываем как «от».
 */

const RIVAL_MONTHLY = 15000; // усреднённая абонплата конструктора с фикс-тарифом
const RIVAL_ACQUIRING = 0.035; // эквайринг у конкурента поверх абонплаты
const OUR_FEE = 0.05; // процент УЧИСЬПРО (тариф «Про»), эквайринг уже внутри

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} ₽`;
}

export default function ForBusinessSavings() {
  const [revenue, setRevenue] = useState(150000);

  const { rivalCost, ourCost, rivalNet, ourNet, save, savePct } = useMemo(() => {
    const rivalCost = RIVAL_MONTHLY + revenue * RIVAL_ACQUIRING;
    const ourCost = revenue * OUR_FEE;
    const rivalNet = revenue - rivalCost;
    const ourNet = revenue - ourCost;
    const save = ourNet - rivalNet;
    const savePct = rivalNet > 0 ? (save / Math.max(rivalNet, 1)) * 100 : 100;
    return { rivalCost, ourCost, rivalNet, ourNet, save, savePct };
  }, [revenue]);

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-4">
          <Icon name="PiggyBank" size={13} className="text-emerald-300" />
          <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
            Ваша экономия
          </span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
          Абонплата съедает прибыль.{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            У нас — только процент
          </span>
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto">
          Конструкторы с фикс-тарифом берут деньги, даже когда у вас нет продаж. Подвиньте
          выручку и посмотрите разницу за месяц.
        </p>
      </div>

      {/* Слайдер выручки */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-white/70 text-sm">Ваша выручка в месяц</span>
          <span className="font-montserrat font-black text-white text-lg">{money(revenue)}</span>
        </div>
        <input
          type="range"
          min={20000}
          max={1000000}
          step={10000}
          value={revenue}
          onChange={(e) => setRevenue(Number(e.target.value))}
          className="w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* Две колонки сравнения */}
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {/* Конкурент */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Building2" size={18} className="text-white/50" />
            <p className="font-bold text-white/70">Конструктор с абонплатой</p>
          </div>
          <ul className="space-y-2.5 text-sm mb-5">
            <li className="flex justify-between text-white/60">
              <span>Абонплата тарифа</span>
              <span className="text-white/80">от {money(RIVAL_MONTHLY)}</span>
            </li>
            <li className="flex justify-between text-white/60">
              <span>Эквайринг ~3,5%</span>
              <span className="text-white/80">{money(revenue * RIVAL_ACQUIRING)}</span>
            </li>
            <li className="flex justify-between text-white/60 pt-2.5 border-t border-white/10">
              <span>Расходы платформе</span>
              <span className="text-rose-300 font-bold">−{money(rivalCost)}</span>
            </li>
          </ul>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <p className="text-white/45 text-[11px] mb-1">Остаётся у вас</p>
            <p className="font-montserrat font-black text-white text-2xl">{money(rivalNet)}</p>
          </div>
        </div>

        {/* Мы */}
        <div className="rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/12 to-cyan-500/8 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Sparkles" size={18} className="text-emerald-300" />
            <p className="font-bold text-white">УЧИСЬПРО</p>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-500/20 rounded-lg px-2 py-0.5">
              Без абонплаты
            </span>
          </div>
          <ul className="space-y-2.5 text-sm mb-5">
            <li className="flex justify-between text-white/70">
              <span>Абонплата</span>
              <span className="text-emerald-300 font-bold">0 ₽</span>
            </li>
            <li className="flex justify-between text-white/70">
              <span>5% с продаж (эквайринг внутри)</span>
              <span className="text-white/85">{money(ourCost)}</span>
            </li>
            <li className="flex justify-between text-white/70 pt-2.5 border-t border-white/10">
              <span>Расходы платформе</span>
              <span className="text-emerald-300 font-bold">−{money(ourCost)}</span>
            </li>
          </ul>
          <div className="rounded-2xl bg-white/[0.06] border border-emerald-400/20 p-4">
            <p className="text-white/55 text-[11px] mb-1">Остаётся у вас</p>
            <p className="font-montserrat font-black text-white text-2xl">{money(ourNet)}</p>
          </div>
        </div>
      </div>

      {/* Итог экономии */}
      {save > 0 && (
        <div className="max-w-3xl mx-auto mt-4">
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Icon name="TrendingUp" size={22} className="text-emerald-300" />
              <p className="text-white/85 text-sm md:text-base">
                С УЧИСЬПРО вы оставляете себе на{" "}
                <span className="font-montserrat font-black text-emerald-300 text-lg">
                  +{money(save)}
                </span>{" "}
                больше каждый месяц
                {savePct >= 5 && (
                  <span className="text-white/50"> · это +{Math.round(savePct)}% к прибыли</span>
                )}
              </p>
            </div>
            <a
              href="#lead"
              className="inline-flex items-center justify-center gap-2 flex-shrink-0 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform whitespace-nowrap"
            >
              <Icon name="Rocket" size={16} /> Оставить заявку
            </a>
          </div>
        </div>
      )}

      <p className="text-white/35 text-[11px] text-center mt-4 max-w-xl mx-auto">
        Абонплата и эквайринг конкурентов — усреднённые рыночные ориентиры. Точные условия
        зависят от тарифа платформы. Расчёт носит справочный характер.
      </p>
    </section>
  );
}