import Icon from "@/components/ui/icon";
import { STAGES, visibleFields } from "./stages";
import { BizAnswers, BizMetrics, BizStage } from "./types";
import { fmt } from "./calc";
import Field from "./BizLabField";

export default function BizLabForm({
  step,
  stepIdx,
  answers,
  metrics,
  ready,
  onSet,
  onNext,
  onBack,
}: {
  step: BizStage;
  stepIdx: number;
  answers: BizAnswers;
  metrics: BizMetrics;
  ready: boolean;
  onSet: (k: string, v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-white/45 mb-3">
          <span>
            Этап {step.index} из {STAGES.length}
          </span>
          <span>{Math.round((stepIdx / STAGES.length) * 100)}%</span>
        </div>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-4xl shrink-0">{step.emoji}</span>
          <div>
            <h1 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight">
              {step.title}
            </h1>
            <p className="text-white/55">{step.subtitle}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/8 p-4 mb-3">
          <div className="flex gap-2.5">
            <Icon name="Info" size={16} className="text-cyan-300 shrink-0 mt-0.5" />
            <p className="text-white/80 text-sm">{step.why}</p>
          </div>
        </div>

        {step.trap && (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/8 p-4">
            <div className="flex gap-2.5">
              <Icon name="TriangleAlert" size={16} className="text-rose-300 shrink-0 mt-0.5" />
              <div>
                <span className="text-rose-200 text-xs font-bold uppercase tracking-wide block mb-1">
                  Здесь ошибаются чаще всего
                </span>
                <p className="text-white/80 text-sm">{step.trap}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7 space-y-4">
        {visibleFields(step, answers).map((f) => (
          <Field key={f.key} field={f} value={answers[f.key] || ""} onSet={onSet} />
        ))}
      </div>

      {/* Живой расчёт — человек сразу видит последствия своих цифр */}
      {stepIdx >= 2 && metrics.unitMargin !== 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-white/45 text-xs font-bold uppercase tracking-wide mb-2.5">
            Считаем на лету
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-white/40 text-xs">Маржа с продажи</div>
              <div
                className={`font-bold ${metrics.unitMargin > 0 ? "text-emerald-300" : "text-rose-300"}`}
              >
                {fmt(metrics.unitMargin)} ₽
              </div>
            </div>
            {stepIdx >= 4 && (
              <>
                <div>
                  <div className="text-white/40 text-xs">Нужно продаж</div>
                  <div className="font-bold text-white">
                    {Number.isFinite(metrics.breakEvenUnits) ? fmt(metrics.breakEvenUnits) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">Прибыль/мес</div>
                  <div
                    className={`font-bold ${metrics.plannedProfit > 0 ? "text-emerald-300" : "text-rose-300"}`}
                  >
                    {fmt(metrics.plannedProfit)} ₽
                  </div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">Запас прочности</div>
                  <div
                    className={`font-bold ${metrics.safetyMarginPct >= 30 ? "text-emerald-300" : metrics.safetyMarginPct >= 0 ? "text-amber-300" : "text-rose-300"}`}
                  >
                    {metrics.safetyMarginPct.toFixed(0)}%
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm px-4 py-3.5 rounded-xl border border-white/10 transition-colors"
        >
          <Icon name="ChevronLeft" size={16} /> Назад
        </button>
        <button
          onClick={onNext}
          disabled={!ready}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform"
        >
          {stepIdx === STAGES.length - 1 ? (
            <>
              <Icon name="Gauge" size={18} /> Проверить жизнеспособность
            </>
          ) : (
            <>
              Далее <Icon name="ChevronRight" size={18} />
            </>
          )}
        </button>
      </div>
      {!ready && (
        <p className="text-white/35 text-xs text-center mt-3">
          Заполните все поля — от них зависит точность расчёта
        </p>
      )}
    </div>
  );
}
