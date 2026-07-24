import Icon from "@/components/ui/icon";
import { CareerPlan } from "./api";

interface Props {
  plan: CareerPlan;
  price: number;
  onApply: () => void;
  onRestart: () => void;
}

export default function PlanView({ plan, price, onApply, onRestart }: Props) {
  const priceFmt = price.toLocaleString("ru-RU");
  return (
    <div className="space-y-6">
      {plan.recommended_direction && (
        <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/12 to-purple-500/10 p-6 md:p-7">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200 bg-cyan-500/15 border border-cyan-400/30 rounded-lg px-3 py-1 mb-3">
            <Icon name="Compass" size={13} /> Наставник рекомендует
          </div>
          <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
            {plan.recommended_direction}
          </h3>
          {plan.direction_reason && (
            <p className="text-white/70 text-sm md:text-base">{plan.direction_reason}</p>
          )}
        </div>
      )}

      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-600/15 to-cyan-500/10 p-6 md:p-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-200 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1 mb-4">
          <Icon name="Sparkles" size={13} /> Ваш индивидуальный курс
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-3 leading-tight">
          {plan.course_title}
        </h2>
        <p className="text-white/70 text-sm md:text-base mb-5">{plan.summary}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon="Target" label="Результат" value={plan.target_role} />
          <Stat icon="Calendar" label="Срок" value={`${plan.duration_weeks} недель`} />
          <Stat icon="Clock" label="Нагрузка" value={`${plan.hours_per_week} ч/нед`} />
          <Stat icon="TrendingUp" label="Старт" value={plan.level} />
        </div>
      </div>

      {plan.skills?.length > 0 && (
        <Section icon="Award" title="Навыки, которые вы освоите">
          <div className="flex flex-wrap gap-2">
            {plan.skills.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-sm text-white/85 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5"
              >
                <Icon name="Check" size={14} className="text-emerald-400" /> {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section icon="ListChecks" title="Программа курса">
        <div className="space-y-3">
          {plan.modules.map((m, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 text-purple-200 font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-[15px]">{m.title}</h4>
                  {m.goal && <p className="text-white/50 text-xs mt-0.5">{m.goal}</p>}
                  {m.lessons?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {m.lessons.map((l, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                          <Icon name="Dot" size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {plan.final_project && (
        <Section icon="Rocket" title="Итоговый проект">
          <p className="text-white/75 text-sm">{plan.final_project}</p>
        </Section>
      )}

      {plan.why_personal?.length > 0 && (
        <Section icon="Fingerprint" title="Почему этот план — именно ваш">
          <ul className="space-y-2">
            {plan.why_personal.map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
                <Icon name="Sparkle" size={16} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                {w}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {plan.action_plan && plan.action_plan.length > 0 && (
        <Section icon="Footprints" title="Ваш план действий">
          <div className="relative pl-6">
            <span className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-purple-500/60 to-cyan-500/40" aria-hidden="true" />
            <div className="space-y-4">
              {plan.action_plan.map((s, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border-2 border-[#140f28]" aria-hidden="true" />
                  {s.when && (
                    <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 mb-0.5">{s.when}</div>
                  )}
                  <div className="text-white font-semibold text-sm">{s.action}</div>
                  {s.result && (
                    <div className="text-white/50 text-xs mt-0.5 flex items-start gap-1.5">
                      <Icon name="ArrowRight" size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      {s.result}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {plan.pep_talk && (
        <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/12 to-rose-500/8 p-6 md:p-7">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-xl">
              💪
            </div>
            <div>
              <div className="font-montserrat font-black text-white text-lg mb-1.5">
                Слово от вашего наставника
              </div>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">{plan.pep_talk}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6 md:p-8 text-center">
        <p className="text-white/60 text-sm mb-1">Стоимость вашего индивидуального курса</p>
        <div className="font-montserrat font-black text-4xl text-white mb-1">{priceFmt} ₽</div>
        <p className="text-white/45 text-xs mb-5">
          Персональная программа, ИИ-наставник и проверка результата. Оплата после согласования плана.
        </p>
        <button
          onClick={onApply}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform glow-purple"
        >
          <Icon name="Send" size={18} /> Оставить заявку на курс
        </button>
        <button
          onClick={onRestart}
          className="mt-3 block mx-auto text-white/50 hover:text-white text-sm transition-colors"
        >
          <Icon name="RotateCcw" size={14} className="inline mr-1" /> Пройти чек-лист заново
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3">
      <Icon name={icon} size={16} className="text-purple-300 mb-1.5" />
      <div className="text-white/40 text-[11px]">{label}</div>
      <div className="text-white font-semibold text-sm leading-tight mt-0.5">{value}</div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-montserrat font-black text-lg text-white mb-3">
        <Icon name={icon} size={18} className="text-purple-300" /> {title}
      </h3>
      {children}
    </div>
  );
}