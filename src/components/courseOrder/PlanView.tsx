import Icon from "@/components/ui/icon";
import { OrderPlan, MIN_PRICE } from "./api";

interface Props {
  plan: OrderPlan;
  onOrder: () => void;
  onRestart: () => void;
}

export default function PlanView({ plan, onOrder, onRestart }: Props) {
  const percent = Math.max(0, Math.min(100, Number(plan.match_percent) || 0));
  const hasMatch = Boolean(plan.matched_course_title);

  return (
    <div className="space-y-6 animate-fade-in">
      {hasMatch && (
        <div className="rounded-3xl border border-cyan-400/25 bg-cyan-500/[0.07] p-6 md:p-8">
          <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold mb-3">
            <Icon name="Search" size={16} />
            Ближайший курс в каталоге
          </div>
          <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-3">
            {plan.matched_course_title}
          </h3>

          {percent > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-white/70">Закрывает ваш запрос примерно на</span>
                <span className="text-cyan-300 font-bold">{percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {plan.match_reason && <p className="text-white/75 leading-relaxed">{plan.match_reason}</p>}

          {(plan.covered?.length || plan.missing?.length) && (
            <div className="grid md:grid-cols-2 gap-4 mt-5">
              {plan.covered && plan.covered.length > 0 && (
                <div className="rounded-2xl bg-emerald-500/[0.08] border border-emerald-400/20 p-4">
                  <div className="text-emerald-300 text-sm font-semibold mb-2.5">Уже есть в курсе</div>
                  <ul className="space-y-2">
                    {plan.covered.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/80">
                        <Icon name="Check" size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.missing && plan.missing.length > 0 && (
                <div className="rounded-2xl bg-amber-500/[0.08] border border-amber-400/20 p-4">
                  <div className="text-amber-300 text-sm font-semibold mb-2.5">Добавим под ваш запрос</div>
                  <ul className="space-y-2">
                    {plan.missing.map((m, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/80">
                        <Icon name="Plus" size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-3xl border border-purple-400/25 bg-purple-500/[0.06] p-6 md:p-8">
        <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold mb-3">
          <Icon name="Sparkles" size={16} />
          Ваш индивидуальный курс
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-3">
          {plan.course_title}
        </h2>
        <p className="text-white/80 leading-relaxed">{plan.summary}</p>

        <div className="flex flex-wrap gap-3 mt-5">
          {plan.duration_weeks ? (
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2 text-sm text-white/85">
              <Icon name="CalendarDays" size={15} className="text-purple-300" />
              {plan.duration_weeks} недель
            </div>
          ) : null}
          {plan.hours_per_week ? (
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2 text-sm text-white/85">
              <Icon name="Clock" size={15} className="text-purple-300" />
              {plan.hours_per_week} ч в неделю
            </div>
          ) : null}
          {plan.modules?.length ? (
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2 text-sm text-white/85">
              <Icon name="LayoutList" size={15} className="text-purple-300" />
              {plan.modules.length} модулей
            </div>
          ) : null}
        </div>
      </div>

      {plan.modules?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-montserrat font-bold text-lg text-white px-1">Программа курса</h3>
          {plan.modules.map((m, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="text-white font-semibold">{m.title}</div>
                  {m.goal && <div className="text-white/55 text-sm mt-0.5">{m.goal}</div>}
                </div>
              </div>
              {m.lessons?.length > 0 && (
                <ul className="space-y-1.5 pl-10">
                  {m.lessons.map((l, j) => (
                    <li key={j} className="flex gap-2 text-sm text-white/70">
                      <Icon name="Dot" size={16} className="text-purple-400 flex-shrink-0" />
                      {l}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {plan.extras && plan.extras.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="font-montserrat font-bold text-lg text-white mb-3">
            Дополнительно к курсу
          </h3>
          <ul className="space-y-2.5">
            {plan.extras.map((e, i) => (
              <li key={i} className="flex gap-2.5 text-white/80">
                <Icon name="Gift" size={16} className="text-cyan-300 flex-shrink-0 mt-1" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.final_project && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="font-montserrat font-bold text-lg text-white mb-2">Итоговая работа</h3>
          <p className="text-white/80 leading-relaxed">{plan.final_project}</p>
        </div>
      )}

      <div className="rounded-3xl border border-purple-400/30 bg-gradient-to-br from-purple-500/15 to-cyan-500/10 p-6 md:p-8 text-center">
        <div className="text-white/70 mb-1">Стоимость индивидуального курса</div>
        <div className="font-montserrat font-black text-3xl md:text-4xl gradient-text-purple mb-2">
          от {MIN_PRICE.toLocaleString("ru-RU")} ₽
        </div>
        <p className="text-white/60 text-sm max-w-lg mx-auto mb-6">
          Точную стоимость назовём после разговора — она зависит от объёма программы.
          Программу выше вы уже видите бесплатно.
        </p>
        <button
          onClick={onOrder}
          className="w-full md:w-auto md:px-10 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-2xl hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2"
        >
          <Icon name="Send" size={18} />
          Оставить заявку на курс
        </button>
        <button
          onClick={onRestart}
          className="block mx-auto mt-4 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          Описать другой запрос
        </button>
      </div>
    </div>
  );
}
