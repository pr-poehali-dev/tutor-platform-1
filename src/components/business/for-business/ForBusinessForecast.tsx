import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/**
 * Интерактивный ИИ-прогноз запуска онлайн-школы (EduFlow AI).
 * Предприниматель задаёт вводные — модель считает выручку, доходимость,
 * чистую прибыль после комиссии платформы и налога, срок окупаемости.
 * Все коэффициенты — усреднённые рыночные ориентиры, показываем честную вилку.
 */

type NicheKey = "skills" | "school" | "lang" | "it" | "health" | "business";

const NICHES: { key: NicheKey; label: string; emoji: string; conv: number; avgPrice: number }[] = [
  { key: "skills", label: "Хобби и навыки", emoji: "🎨", conv: 0.028, avgPrice: 4900 },
  { key: "school", label: "Подготовка к экзаменам", emoji: "🎓", conv: 0.035, avgPrice: 6900 },
  { key: "lang", label: "Языки", emoji: "🗣️", conv: 0.03, avgPrice: 5900 },
  { key: "it", label: "IT и digital", emoji: "💻", conv: 0.022, avgPrice: 19900 },
  { key: "health", label: "Здоровье и спорт", emoji: "🧘", conv: 0.032, avgPrice: 5400 },
  { key: "business", label: "Бизнес и деньги", emoji: "📈", conv: 0.02, avgPrice: 14900 },
];

const TAX_RATE = 0.06; // самозанятый/УСН «доходы» — типовой сценарий автора
const PLATFORM_FEE = 0.05; // процент УЧИСЬПРО (тариф «Про»)

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

function money(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(".", ",")} млн ₽`;
  return `${fmt(n)} ₽`;
}

interface RowProps {
  label: string;
  value: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  raw: number;
  onChange: (v: number) => void;
  accent?: string;
}

function SliderRow({ label, value, hint, min, max, step, raw, onChange, accent = "accent-violet-500" }: RowProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-white/70 text-sm">{label}</span>
        <span className="font-montserrat font-black text-white text-base">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={raw}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer ${accent}`}
      />
      {hint && <p className="text-white/35 text-[11px] mt-1.5">{hint}</p>}
    </div>
  );
}

export default function ForBusinessForecast() {
  const [nicheKey, setNicheKey] = useState<NicheKey>("school");
  const [price, setPrice] = useState(6900);
  const [adBudget, setAdBudget] = useState(50000);
  const [cpc, setCpc] = useState(25);
  const [withAi, setWithAi] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const niche = NICHES.find((n) => n.key === nicheKey)!;

  const result = useMemo(() => {
    const clicks = adBudget / cpc; // визиты с рекламы
    // ИИ-наставник и автоворонки поднимают конверсию в оплату (доходимость лида)
    const convBoost = withAi ? 1.35 : 1;
    const conv = niche.conv * convBoost;
    const sales = clicks * conv;
    const revenue = sales * price;

    // Доходимость до конца курса — влияет на возвраты/репутацию/LTV
    const completion = withAi ? 0.72 : 0.45;

    const platformFee = revenue * PLATFORM_FEE;
    const tax = revenue * TAX_RATE;
    const netProfit = revenue - adBudget - platformFee - tax;
    const romi = adBudget > 0 ? ((revenue - adBudget) / adBudget) * 100 : 0;
    const cac = sales > 0 ? adBudget / sales : 0;
    const paybackDays = netProfit > 0 ? Math.max(1, Math.round((adBudget / (netProfit + adBudget)) * 30)) : 0;

    return { clicks, sales, revenue, completion, platformFee, tax, netProfit, romi, cac, conv, paybackDays };
  }, [niche, price, adBudget, cpc, withAi]);

  const positive = result.netProfit > 0;

  return (
    <section id="forecast" className="mb-16 scroll-mt-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 rounded-full px-4 py-1.5 mb-4">
          <Icon name="Sparkles" size={13} className="text-violet-300" />
          <span className="text-violet-200 text-xs font-bold uppercase tracking-wider">EduFlow AI · прогноз запуска</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
          Посчитайте свою школу{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">до запуска</span>
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto">
          Задайте вводные — ИИ-модель спрогнозирует выручку, доходимость и чистую прибыль
          с учётом комиссии платформы и налогов.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4">
        {/* Ввод */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <p className="text-white/45 text-xs mb-3 font-bold uppercase tracking-wider">Ниша курса</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {NICHES.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => {
                  setNicheKey(n.key);
                  setPrice(n.avgPrice);
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                  nicheKey === n.key
                    ? "border-violet-400/60 bg-violet-500/15 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25"
                }`}
              >
                <span>{n.emoji}</span>
                <span className="truncate">{n.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <SliderRow
              label="Цена курса"
              value={money(price)}
              min={990}
              max={49900}
              step={500}
              raw={price}
              onChange={setPrice}
            />
            <SliderRow
              label="Бюджет на рекламу в месяц"
              value={money(adBudget)}
              min={10000}
              max={500000}
              step={5000}
              raw={adBudget}
              onChange={setAdBudget}
              accent="accent-cyan-500"
            />
            <SliderRow
              label="Цена клика (CPC)"
              value={`${cpc} ₽`}
              hint="Средняя стоимость перехода из рекламы в вашей нише"
              min={8}
              max={120}
              step={1}
              raw={cpc}
              onChange={setCpc}
              accent="accent-cyan-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setWithAi((v) => !v)}
            className={`mt-6 w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
              withAi ? "border-emerald-400/50 bg-emerald-500/10" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${withAi ? "bg-emerald-500/25" : "bg-white/10"}`}>
                <Icon name="Bot" size={18} className={withAi ? "text-emerald-300" : "text-white/50"} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">ИИ-наставник и автоворонки</p>
                <p className="text-white/45 text-[11px]">Поднимают конверсию и доходимость</p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${withAi ? "bg-emerald-500" : "bg-white/15"}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${withAi ? "translate-x-5" : ""}`} />
            </div>
          </button>
        </div>

        {/* Результат */}
        <div className="bg-gradient-to-br from-violet-500/[0.08] to-cyan-500/[0.05] border border-white/10 rounded-3xl p-6 flex flex-col">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <p className="text-white/45 text-[11px] mb-1">Выручка в месяц</p>
              <p className="font-montserrat font-black text-white text-2xl">{money(result.revenue)}</p>
            </div>
            <div className={`rounded-2xl p-4 border ${positive ? "bg-emerald-500/[0.08] border-emerald-500/25" : "bg-rose-500/[0.08] border-rose-500/25"}`}>
              <p className="text-white/45 text-[11px] mb-1">Чистая прибыль</p>
              <p className={`font-montserrat font-black text-2xl ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                {positive ? money(result.netProfit) : money(result.netProfit)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="font-montserrat font-black text-white text-lg">{fmt(result.sales)}</p>
              <p className="text-white/45 text-[10px] leading-tight mt-0.5">продаж курса</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="font-montserrat font-black text-cyan-300 text-lg">{Math.round(result.romi)}%</p>
              <p className="text-white/45 text-[10px] leading-tight mt-0.5">ROMI рекламы</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="font-montserrat font-black text-white text-lg">{Math.round(result.completion * 100)}%</p>
              <p className="text-white/45 text-[10px] leading-tight mt-0.5">доходимость</p>
            </div>
          </div>

          {/* Разбор экономики */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-between w-full text-white/60 hover:text-white text-xs font-bold py-2 transition-colors"
          >
            <span>Как считается экономика</span>
            <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={16} />
          </button>
          {expanded && (
            <div className="space-y-1.5 text-xs mb-2">
              {[
                { l: "Визитов с рекламы", v: `${fmt(result.clicks)}` },
                { l: `Конверсия в оплату${withAi ? " (с ИИ)" : ""}`, v: `${(result.conv * 100).toFixed(1)}%` },
                { l: "Стоимость клиента (CAC)", v: money(result.cac) },
                { l: "− Реклама", v: `−${money(adBudget)}`, neg: true },
                { l: "− Комиссия платформы (5%)", v: `−${money(result.platformFee)}`, neg: true },
                { l: "− Налог (6%)", v: `−${money(result.tax)}`, neg: true },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/50">{r.l}</span>
                  <span className={r.neg ? "text-rose-300/80" : "text-white/80"}>{r.v}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3">
            {positive ? (
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3 mb-3">
                <Icon name="TrendingUp" size={16} className="text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-white/75 text-xs leading-snug">
                  Реклама окупается примерно за <b className="text-white">{result.paybackDays} дн.</b> Дальше каждый вложенный
                  рубль работает в плюс. Масштабируйте бюджет — модель почти линейна.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 mb-3">
                <Icon name="TriangleAlert" size={16} className="text-amber-300 mt-0.5 flex-shrink-0" />
                <p className="text-white/75 text-xs leading-snug">
                  При этих вводных реклама пока не окупается. Поднимите цену курса, снизьте CPC
                  или включите ИИ-наставника — он поднимает конверсию на ~35%.
                </p>
              </div>
            )}

            <a
              href="#lead"
              onClick={() => trackGoal("forecast_cta_click", { niche: nicheKey, net_profit: Math.round(result.netProfit) })}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3.5 rounded-2xl hover:scale-[1.01] transition-transform"
            >
              <Icon name="Rocket" size={17} />
              Запустить эту школу
            </a>
          </div>
        </div>
      </div>

      <p className="text-white/30 text-[11px] text-center mt-4 max-w-2xl mx-auto">
        Прогноз ориентировочный: основан на усреднённых рыночных показателях конверсии и стоимости трафика.
        Реальные цифры зависят от оффера, качества креативов и аудитории.
      </p>
    </section>
  );
}
