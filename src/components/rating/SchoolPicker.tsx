import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { PICKER, pickSchools, PickAnswers, PRICE_LABEL } from "./kidsSchools";

type Step = keyof PickAnswers;
const STEPS: { key: Step; title: string }[] = [
  { key: "grade", title: "В каком классе ребёнок?" },
  { key: "goal", title: "Какая главная цель?" },
  { key: "format", title: "Как удобнее заниматься?" },
  { key: "budget", title: "Какой бюджет?" },
];

export default function SchoolPicker() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<PickAnswers>>({});
  const done = step >= STEPS.length;
  const results = done ? pickSchools(answers as PickAnswers) : [];

  const choose = (key: Step, v: string) => {
    setAnswers((a) => ({ ...a, [key]: v }));
    setStep((s) => s + 1);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const options = !done
    ? (PICKER[STEPS[step].key] as { v: string; label: string; icon?: string }[])
    : [];

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-white/[0.03] to-cyan-500/10 p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-bold">
          <Icon name="Sparkles" size={18} className="text-primary" />
          Подбор школы за 4 вопроса
        </p>
        {step > 0 && (
          <button onClick={reset} className="flex items-center gap-1 text-sm text-white/60 hover:text-white">
            <Icon name="RotateCcw" size={14} />
            Заново
          </button>
        )}
      </div>

      <div className="mb-5 flex gap-1.5" aria-hidden="true">
        {STEPS.map((s, i) => (
          <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-white/10"}`} />
        ))}
      </div>

      {!done && (
        <>
          <p className="mb-4 text-xl font-bold sm:text-2xl">{STEPS[step].title}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o) => (
              <button
                key={o.v}
                onClick={() => choose(STEPS[step].key, o.v)}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-left font-semibold transition hover:border-primary/50 hover:bg-primary/10"
              >
                {o.icon && <Icon name={o.icon} size={18} className="text-primary" />}
                {o.label}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="mt-4 flex items-center gap-1 text-sm text-white/50 hover:text-white">
              <Icon name="ArrowLeft" size={14} />
              Назад
            </button>
          )}
        </>
      )}

      {done && (
        <div>
          <p className="mb-4 text-xl font-bold sm:text-2xl">
            {results.length ? "Вам подойдут" : "Точного совпадения нет"}
          </p>
          {!results.length && (
            <p className="text-white/70">Попробуйте изменить формат или бюджет — например, выбрать «Не главное».</p>
          )}
          <div className="space-y-3">
            {results.map((r, i) => (
              <div
                key={r.school.slug}
                className={`rounded-2xl border p-4 ${i === 0 ? "border-primary/50 bg-primary/10" : "border-white/10 bg-white/[0.04]"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-lg font-bold">
                    {i === 0 && <Icon name="Award" size={18} className="text-amber-300" />}
                    {r.school.name}
                    <span className="text-sm font-normal text-white/50">{PRICE_LABEL[r.school.priceLevel]}</span>
                  </p>
                  {r.school.own ? (
                    <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">
                      Попробовать бесплатно →
                    </Link>
                  ) : (
                    <a href={`#${r.school.slug}`} className="text-sm text-white/60 hover:text-white">
                      Плюсы и минусы ↓
                    </a>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/60">{r.school.bestFor}</p>
                {r.reasons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.reasons.map((reason) => (
                      <span key={reason} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40">
            Подбор учитывает класс, цель, формат и бюджет. Место школы в рейтинге и наша платформа на результат не влияют.
          </p>
        </div>
      )}
    </div>
  );
}
