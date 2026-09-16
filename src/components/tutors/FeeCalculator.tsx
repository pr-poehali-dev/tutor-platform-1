import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

/**
 * Калькулятор расходов репетитора: комиссия с продаж против абонплаты.
 *
 * Зачем нужен: главный конкурент на рынке — платформы с абонплатой
 * (от 5 900 ₽/мес) плюс комиссия эквайринга ~3,5%. Для новичка, у которого
 * продаж ещё нет, это плата за надежду: ноль продаж — всё равно минус 5 900 ₽.
 * Наша модель ровно наоборот: 0 ₽ вход и 8% только с реальных продаж.
 *
 * Калькулятор считает ОБА сценария честно, включая точку, где абонплата
 * становится выгоднее. Скрывать её бессмысленно: репетитор с большими
 * оборотами всё равно посчитает сам, а пойманная натяжка убивает доверие
 * ко всей странице.
 */

interface Props {
  /** Комиссия платформы, % — совпадает с platform_fee_percent в базе */
  feePercent: number;
}

/** Типичная абонплата стартового тарифа платформы с подпиской, ₽/мес */
const RIVAL_MONTHLY = 5900;
/** Комиссия за приём платежей у таких платформ, доля */
const RIVAL_FEE = 0.035;

const PRICE_PRESETS = [990, 2500, 5000, 12000];

function money(n: number): string {
  return Math.round(n).toLocaleString("ru-RU") + " ₽";
}

export default function FeeCalculator({ feePercent }: Props) {
  const [price, setPrice] = useState(5000);
  const [sales, setSales] = useState(4);

  const calc = useMemo(() => {
    const revenue = price * sales;
    const ours = (revenue * feePercent) / 100;
    const rival = RIVAL_MONTHLY + revenue * RIVAL_FEE;
    const diff = rival - ours;

    // Точка равенства: RIVAL_MONTHLY + rev*RIVAL_FEE = rev*fee
    const feeGap = feePercent / 100 - RIVAL_FEE;
    const breakEvenRevenue = feeGap > 0 ? RIVAL_MONTHLY / feeGap : Infinity;
    const breakEvenSales = price > 0 ? Math.ceil(breakEvenRevenue / price) : 0;

    return {
      revenue,
      ours,
      rival,
      diff,
      weWin: diff > 0,
      ourNet: revenue - ours,
      breakEvenSales,
    };
  }, [price, sales, feePercent]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
          <Icon name="Calculator" size={22} className="text-cyan-300" />
        </div>
        <div>
          <h2 className="font-montserrat font-black text-xl md:text-2xl text-white">
            Сколько вы отдадите платформе
          </h2>
          <p className="text-white/55 text-sm">
            Сравнение с площадкой, где есть абонплата
          </p>
        </div>
      </div>

      {/* Цена курса */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="course-price" className="text-white/75 text-sm font-semibold">
            Цена вашего курса
          </label>
          <span className="font-montserrat font-black text-lg text-white">
            {money(price)}
          </span>
        </div>
        <input
          id="course-price"
          type="range"
          min={490}
          max={30000}
          step={10}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full accent-violet-500 cursor-pointer"
          aria-label="Цена курса в рублях"
        />
        <div className="flex flex-wrap gap-2 mt-2.5">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrice(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                price === p
                  ? "bg-violet-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {money(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Продаж в месяц */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="sales-count" className="text-white/75 text-sm font-semibold">
            Продаж в месяц
          </label>
          <span className="font-montserrat font-black text-lg text-white">
            {sales}
          </span>
        </div>
        <input
          id="sales-count"
          type="range"
          min={0}
          max={60}
          step={1}
          value={sales}
          onChange={(e) => setSales(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
          aria-label="Количество продаж в месяц"
        />
        <p className="text-white/40 text-xs mt-2">
          Выручка: <span className="text-white/70 font-semibold">{money(calc.revenue)}</span> в месяц
        </p>
      </div>

      {/* Сравнение */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div
          className={`rounded-2xl p-4 border transition-colors ${
            calc.weWin
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <p className="text-white/55 text-xs uppercase tracking-wider font-bold mb-1">
            УЧИСЬПРО
          </p>
          <p className="font-montserrat font-black text-2xl text-white">
            {money(calc.ours)}
          </p>
          <p className="text-white/50 text-xs mt-1">
            {feePercent}% с продаж, абонплаты нет
          </p>
        </div>

        <div
          className={`rounded-2xl p-4 border transition-colors ${
            !calc.weWin
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <p className="text-white/55 text-xs uppercase tracking-wider font-bold mb-1">
            Площадка с абонплатой
          </p>
          <p className="font-montserrat font-black text-2xl text-white">
            {money(calc.rival)}
          </p>
          <p className="text-white/50 text-xs mt-1">
            {money(RIVAL_MONTHLY)}/мес + {(RIVAL_FEE * 100).toFixed(1)}% эквайринг
          </p>
        </div>
      </div>

      {/* Вывод */}
      {calc.weWin ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-emerald-200 font-bold text-sm mb-1">
            <Icon name="TrendingDown" size={15} className="inline mr-1.5" />
            Вы экономите {money(calc.diff)} в месяц
          </p>
          <p className="text-white/65 text-sm">
            {calc.revenue === 0
              ? "Продаж пока нет — и вы не платите ничего. На площадке с абонплатой этот месяц всё равно стоил бы " +
                money(RIVAL_MONTHLY) +
                "."
              : `На руки остаётся ${money(calc.ourNet)}. Абонплата начнёт окупаться примерно с ${calc.breakEvenSales} продаж в месяц при этой цене.`}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-amber-200 font-bold text-sm mb-1">
            <Icon name="Info" size={15} className="inline mr-1.5" />
            На таких оборотах абонплата выгоднее на {money(-calc.diff)}
          </p>
          <p className="text-white/65 text-sm">
            Честно: при {sales} продажах в месяц процент с выручки обходится дороже
            фиксированной платы. Мы удобны на старте и при небольших объёмах —
            а программу курса можно забрать в PDF и работать с ней где угодно.
          </p>
        </div>
      )}

      <p className="text-white/35 text-[11px] mt-4 leading-relaxed">
        Расчёт приблизительный. За основу взяты публичные условия распространённой
        платформы с подпиской: стартовый тариф {money(RIVAL_MONTHLY)} в месяц
        и {(RIVAL_FEE * 100).toFixed(1)}% за приём платежей. Тарифы площадок меняются —
        проверяйте актуальные цены перед выбором.
      </p>
    </div>
  );
}
