import Icon from "@/components/ui/icon";
import { BoardReview } from "./api";

export default function BoardView({ r }: { r: BoardReview }) {
  return (
    <div className="space-y-6">
      {/* Главный вывод */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 to-cyan-500/5 p-6 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-4">
          <Icon name="Users" size={13} />
          Заключение совета
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight mb-4">
          {r.headline}
        </h2>
        {r.reality_check && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Eye" size={16} className="text-amber-300" />
              <span className="font-bold text-amber-200 text-sm uppercase tracking-wide">
                Проверка на реализм
              </span>
            </div>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">{r.reality_check}</p>
          </div>
        )}
      </div>

      {/* Эксперты */}
      {r.board?.length > 0 && (
        <div>
          <h3 className="font-montserrat font-black text-xl text-white mb-3">Разбор по ролям</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {r.board.map((b, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-2xl">{b.emoji}</span>
                  <span className="font-montserrat font-black text-white">{b.role}</span>
                </div>
                <p className="text-white/80 text-sm font-semibold mb-3">{b.verdict}</p>
                <ul className="space-y-2 mb-4">
                  {b.points?.map((p, j) => (
                    <li key={j} className="flex gap-2 text-white/65 text-sm">
                      <Icon name="Dot" size={16} className="text-purple-300 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                {b.action && (
                  <div className="flex gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3">
                    <Icon name="ArrowRight" size={15} className="text-cyan-300 shrink-0 mt-0.5" />
                    <p className="text-white/85 text-sm">{b.action}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Что может убить бизнес */}
      {r.killers?.length > 0 && (
        <div>
          <h3 className="font-montserrat font-black text-xl text-white mb-3 flex items-center gap-2">
            <Icon name="Skull" size={20} className="text-rose-400" />
            Что может убить этот бизнес
          </h3>
          <div className="space-y-3">
            {r.killers.map((k, i) => (
              <div key={i} className="rounded-2xl border border-rose-500/30 bg-rose-500/8 p-5">
                <h4 className="font-bold text-rose-200 mb-1.5">{k.title}</h4>
                <p className="text-white/75 text-sm mb-3">{k.why}</p>
                <div className="flex gap-2 rounded-xl bg-white/5 p-3">
                  <Icon name="ShieldCheck" size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                  <p className="text-white/80 text-sm">{k.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* План проверки спроса — главная ценность */}
      {r.demand_plan && (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 to-cyan-500/5 p-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-2">
                <Icon name="FlaskConical" size={13} />
                Сделайте это до вложений
              </div>
              <h3 className="font-montserrat font-black text-xl text-white">{r.demand_plan.title}</h3>
            </div>
            {r.demand_plan.budget && (
              <div className="rounded-xl bg-white/8 px-4 py-2">
                <div className="text-white/45 text-[10px] uppercase tracking-wide">Бюджет</div>
                <div className="font-montserrat font-black text-emerald-300">{r.demand_plan.budget}</div>
              </div>
            )}
          </div>

          <ol className="space-y-2.5 mb-5">
            {r.demand_plan.steps?.map((s, i) => (
              <li key={i} className="flex gap-3 text-white/80 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black">
                  {i + 1}
                </span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wide mb-1.5">
                <Icon name="CircleCheck" size={13} />
                Спрос есть
              </div>
              <p className="text-white/80 text-sm">{r.demand_plan.success_metric}</p>
            </div>
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4">
              <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold uppercase tracking-wide mb-1.5">
                <Icon name="CircleX" size={13} />
                Идею надо менять
              </div>
              <p className="text-white/80 text-sm">{r.demand_plan.fail_metric}</p>
            </div>
          </div>
        </div>
      )}

      {/* Чек-лист перед запуском */}
      {r.before_launch?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="font-montserrat font-black text-xl text-white mb-4 flex items-center gap-2">
            <Icon name="ListChecks" size={20} className="text-cyan-300" />
            Чек-лист перед запуском
          </h3>
          <ul className="space-y-2.5">
            {r.before_launch.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-white/75 text-sm">
                <Icon name="Square" size={16} className="text-white/25 shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Первые 90 дней */}
      {r.first_90_days?.length > 0 && (
        <div>
          <h3 className="font-montserrat font-black text-xl text-white mb-3">Первые 90 дней</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {r.first_90_days.map((p, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
                  {p.period}
                </div>
                <h4 className="font-bold text-white mb-3">{p.focus}</h4>
                <ul className="space-y-2 mb-3">
                  {p.tasks?.map((t, j) => (
                    <li key={j} className="flex gap-2 text-white/65 text-sm">
                      <Icon name="Check" size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                {p.metric && (
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60">
                    <Icon name="Target" size={12} className="inline mr-1.5 text-cyan-300" />
                    {p.metric}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Про деньги */}
      {r.money_advice && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-6">
          <h3 className="font-montserrat font-black text-lg text-white mb-2 flex items-center gap-2">
            <Icon name="Banknote" size={19} className="text-amber-300" />
            Про деньги и кредит
          </h3>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">{r.money_advice}</p>
        </div>
      )}

      {/* Итог */}
      {r.verdict_short && (
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/8 to-white/[0.02] p-6 md:p-8">
          <h3 className="font-montserrat font-black text-lg text-white mb-3 flex items-center gap-2">
            <Icon name="Gavel" size={19} className="text-purple-300" />
            Итог
          </h3>
          <p className="text-white/85 text-base md:text-lg leading-relaxed">{r.verdict_short}</p>
        </div>
      )}
    </div>
  );
}
