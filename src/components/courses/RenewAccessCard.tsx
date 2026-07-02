import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

// Ненавязчивый блок «Продлить доступ» — показывается, когда курс уже открыт.
// Не давит на покупку: предлагает продлить полный доступ на удобный период.
const YEAR_DISCOUNT = 0.4;

interface PeriodOption {
  id: "month" | "year";
  label: string;
  monthly: number;
  note?: string;
}

const PRO_MONTHLY = 5990;

const OPTIONS: PeriodOption[] = [
  { id: "month", label: "На месяц", monthly: PRO_MONTHLY },
  {
    id: "year",
    label: "На год",
    monthly: Math.round((PRO_MONTHLY * 12 * (1 - YEAR_DISCOUNT)) / 12),
    note: "выгода 40%",
  },
];

export default function RenewAccessCard() {
  const navigate = useNavigate();
  // Чтобы после оплаты вернуть пользователя на эту же страницу курса.
  const fromQuery = `&from=${encodeURIComponent(window.location.pathname)}`;

  return (
    <div className="bg-white/4 border border-white/10 rounded-2xl p-5 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="Infinity" size={16} className="text-purple-300" />
        <p className="text-white/85 font-bold text-sm">Хочешь продлить полный доступ?</p>
      </div>
      <p className="text-white/50 text-xs mb-4 leading-relaxed">
        Подписка открывает все 36+ курсов и индивидуальный маршрут. Выбери удобный период — без автосписаний.
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => navigate(`/checkout/pro?${o.id === "year" ? "period=year" : "p=1"}${fromQuery}`)}
            className="group relative text-left rounded-xl border border-white/12 bg-white/[0.03] hover:border-purple-500/50 hover:bg-purple-500/[0.06] transition-all p-3.5"
          >
            {o.note && (
              <span className="absolute -top-2 right-2 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-1.5 py-0.5 rounded-full">
                {o.note}
              </span>
            )}
            <p className="text-white/60 text-[11px] mb-1">{o.label}</p>
            <p className="font-montserrat font-black text-lg text-white leading-none">
              {o.monthly.toLocaleString("ru-RU")} <span className="text-xs text-white/50 font-bold">₽/мес</span>
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-purple-300 group-hover:text-purple-200 text-xs font-semibold transition-colors">
              Продлить
              <Icon name="ArrowRight" size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}