import Icon from "@/components/ui/icon";
import { PlanDef } from "./checkoutPlans";

interface Props {
  plan: PlanDef;
  displayPrice: number;
  displayPeriod: string;
  isYear: boolean;
  isKids: boolean;
  isFree: boolean;
}

export default function CheckoutPlanCard({
  plan,
  displayPrice,
  displayPeriod,
  isYear,
  isKids,
  isFree,
}: Props) {
  return (
    <>
      <div className={`rounded-3xl border border-white/12 bg-gradient-to-br ${plan.gradient} p-6 md:p-7 mb-6`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-montserrat font-black text-4xl md:text-5xl text-white">
            {displayPrice === 0 ? "0" : displayPrice.toLocaleString("ru-RU")}
          </span>
          <span className="text-white/65 text-base">₽ / {displayPeriod}</span>
        </div>
        {isYear && plan && (
          <p className="text-emerald-300 text-sm font-bold mb-3">
            ≈ {Math.round(displayPrice / 12).toLocaleString("ru-RU")} ₽/мес · экономия{" "}
            {(plan.price * 12 - displayPrice).toLocaleString("ru-RU")} ₽ против помесячной оплаты
          </p>
        )}
        {isKids && (
          <p className="text-pink-300 text-sm font-bold mb-3">
            Акция: первые 3 месяца за 1 ₽, далее {plan.price} ₽/мес. Отменить можно в любой момент.
          </p>
        )}
        <p className="text-white/70 text-sm md:text-base mb-4 mt-2">{plan.description}</p>
        <ul className="space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-white/85">
              <Icon name="Check" size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Блок доверия — гарантия возврата + безопасность */}
      {!isFree && (
        <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-5 md:p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="ShieldCheck" size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-white text-base md:text-lg mb-1">
                Гарантия возврата 7 дней
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Если платформа не подойдёт — вернём деньги в течение 7 дней без вопросов
                (ст. 32 ЗоЗПП). Отмена подписки в любой момент из личного кабинета.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10">
            {[
              { icon: "Lock", text: "Оплата через ЮKassa" },
              { icon: "FileCheck", text: "Чек по 54-ФЗ" },
              { icon: "MapPin", text: "Серверы в РФ" },
            ].map((b) => (
              <div key={b.text} className="flex flex-col items-center text-center gap-1.5">
                <Icon name={b.icon} size={16} className="text-emerald-300" />
                <span className="text-white/60 text-[11px] leading-tight">{b.text}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-4 pt-4 border-t border-white/10">
            <span className="text-white/40 text-[11px] mr-1">Принимаем:</span>
            {["Мир", "Visa", "Mastercard", "СБП"].map((m) => (
              <span
                key={m}
                className="bg-white/8 border border-white/12 rounded-lg px-2.5 py-1 text-white/75 text-[11px] font-semibold"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
