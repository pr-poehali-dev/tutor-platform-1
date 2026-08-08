import Icon from "@/components/ui/icon";
import { BizMetrics, BizVerdict } from "./types";
import { fmt, fmt1 } from "./calc";

const ZONE = {
  green: {
    ring: "border-emerald-500/40",
    bg: "from-emerald-500/15 to-cyan-500/5",
    text: "text-emerald-300",
    bar: "from-emerald-500 to-cyan-500",
    label: "Модель выдерживает проверку",
  },
  amber: {
    ring: "border-amber-500/40",
    bg: "from-amber-500/15 to-orange-500/5",
    text: "text-amber-300",
    bar: "from-amber-500 to-orange-500",
    label: "Требует доработки",
  },
  red: {
    ring: "border-rose-500/40",
    bg: "from-rose-500/15 to-red-500/5",
    text: "text-rose-300",
    bar: "from-rose-500 to-red-500",
    label: "Высокий риск потери денег",
  },
};

function Metric({
  label,
  value,
  hint,
  danger,
  good,
}: {
  label: string;
  value: string;
  hint?: string;
  danger?: boolean;
  good?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-white/45 text-xs mb-1">{label}</div>
      <div
        className={`font-montserrat font-black text-xl ${
          danger ? "text-rose-300" : good ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </div>
      {hint && <div className="text-white/35 text-[11px] mt-1 leading-snug">{hint}</div>}
    </div>
  );
}

export default function VerdictView({
  verdict,
  m,
}: {
  verdict: BizVerdict;
  m: BizMetrics;
}) {
  const z = ZONE[verdict.zone];
  const critical = verdict.flags.filter((f) => f.level === "critical");
  const warnings = verdict.flags.filter((f) => f.level === "warning");
  const oks = verdict.flags.filter((f) => f.level === "ok");

  return (
    <div className="space-y-6">
      {/* Оценка */}
      <div className={`rounded-3xl border ${z.ring} bg-gradient-to-br ${z.bg} p-6 md:p-8`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="shrink-0">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  className={z.text}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(verdict.score / 100) * 264} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-montserrat font-black text-3xl text-white">{verdict.score}</span>
                <span className="text-white/40 text-[10px]">из 100</span>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold uppercase tracking-wider ${z.text} mb-1.5`}>{z.label}</div>
            <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2 leading-tight">
              {verdict.title}
            </h2>
            <p className="text-white/70 text-sm md:text-base">{verdict.summary}</p>
          </div>
        </div>
      </div>

      {/* Ключевые цифры */}
      <div>
        <h3 className="font-montserrat font-black text-xl text-white mb-3">Ваши цифры</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric
            label="Маржа с продажи"
            value={`${fmt(m.unitMargin)} ₽`}
            hint={`${fmt1(m.marginPct)}% от цены`}
            danger={m.unitMargin <= 0}
            good={m.marginPct >= 30}
          />
          <Metric
            label="Точка безубыточности"
            value={Number.isFinite(m.breakEvenUnits) ? `${fmt(m.breakEvenUnits)} шт` : "не достигается"}
            hint={
              Number.isFinite(m.breakEvenRevenue)
                ? `выручка ${fmt(m.breakEvenRevenue)} ₽/мес`
                : "при текущей марже"
            }
            danger={!Number.isFinite(m.breakEvenUnits)}
          />
          <Metric
            label="Прибыль в месяц"
            value={`${fmt(m.plannedProfit)} ₽`}
            hint={`при ${fmt(m.plannedUnits)} продажах`}
            danger={m.plannedProfit <= 0}
            good={m.plannedProfit > 0}
          />
          <Metric
            label="Запас прочности"
            value={`${fmt1(m.safetyMarginPct)}%`}
            hint="на столько могут упасть продажи"
            danger={m.safetyMarginPct < 20}
            good={m.safetyMarginPct >= 30}
          />
          <Metric
            label="Постоянные расходы"
            value={`${fmt(m.fixedMonthly)} ₽`}
            hint="платите даже без продаж"
          />
          <Metric
            label="Стресс-тест −40%"
            value={`${fmt(m.stressProfit)} ₽`}
            hint={m.stressSurvives ? "переживёт спад" : "уйдёт в убыток"}
            danger={!m.stressSurvives}
            good={m.stressSurvives}
          />
          <Metric
            label="Подушка"
            value={`${fmt1(m.runwayMonths)} мес.`}
            hint="проживёте без выручки"
            danger={m.runwayMonths < 3}
            good={m.runwayMonths >= 6}
          />
          <Metric
            label="Окупаемость"
            value={Number.isFinite(m.paybackMonths) ? `${fmt(m.paybackMonths)} мес.` : "не окупится"}
            hint={`вложено ${fmt(m.startCapital)} ₽`}
            danger={!Number.isFinite(m.paybackMonths) || m.paybackMonths > 36}
            good={Number.isFinite(m.paybackMonths) && m.paybackMonths <= 18}
          />
        </div>

        {m.loanMonthly > 0 && (
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Metric
              label="Платёж по кредиту"
              value={`${fmt(m.loanMonthly)} ₽`}
              hint="каждый месяц, независимо от выручки"
              danger={m.debtCover < 1}
            />
            <Metric
              label="Покрытие платежа"
              value={`${fmt1(m.debtCover)}x`}
              hint="во сколько раз прибыль больше платежа"
              danger={m.debtCover < 1.5}
              good={m.debtCover >= 2}
            />
            <Metric label="LTV / CAC" value={fmt1(m.ltvCac)} hint="норма — от 3" danger={m.ltvCac < 1} good={m.ltvCac >= 3} />
            <Metric label="Клиент стоит" value={`${fmt(m.cac)} ₽`} hint={`приносит ${fmt(m.ltv)} ₽`} />
          </div>
        )}
      </div>

      {/* Риски */}
      {critical.length > 0 && (
        <div>
          <h3 className="font-montserrat font-black text-xl text-white mb-3 flex items-center gap-2">
            <Icon name="TriangleAlert" size={20} className="text-rose-400" />
            Критично: исправьте до вложения денег
          </h3>
          <div className="space-y-3">
            {critical.map((f, i) => (
              <div key={i} className="rounded-2xl border border-rose-500/30 bg-rose-500/8 p-5">
                <h4 className="font-bold text-rose-200 mb-1.5">{f.title}</h4>
                <p className="text-white/75 text-sm mb-3">{f.text}</p>
                {f.fix && (
                  <div className="flex gap-2 rounded-xl bg-white/5 p-3">
                    <Icon name="Wrench" size={15} className="text-cyan-300 shrink-0 mt-0.5" />
                    <p className="text-white/80 text-sm">{f.fix}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h3 className="font-montserrat font-black text-xl text-white mb-3 flex items-center gap-2">
            <Icon name="CircleAlert" size={20} className="text-amber-400" />
            Слабые места
          </h3>
          <div className="space-y-3">
            {warnings.map((f, i) => (
              <div key={i} className="rounded-2xl border border-amber-500/25 bg-amber-500/8 p-5">
                <h4 className="font-bold text-amber-200 mb-1.5">{f.title}</h4>
                <p className="text-white/75 text-sm mb-3">{f.text}</p>
                {f.fix && (
                  <div className="flex gap-2 rounded-xl bg-white/5 p-3">
                    <Icon name="Wrench" size={15} className="text-cyan-300 shrink-0 mt-0.5" />
                    <p className="text-white/80 text-sm">{f.fix}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {oks.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-5">
          {oks.map((f, i) => (
            <div key={i}>
              <h4 className="font-bold text-emerald-200 mb-1.5 flex items-center gap-2">
                <Icon name="CircleCheck" size={17} />
                {f.title}
              </h4>
              <p className="text-white/75 text-sm">{f.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
