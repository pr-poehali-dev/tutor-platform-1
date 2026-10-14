import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { MarathonProgram } from "./types";

function rub(n: number) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

export default function MarathonOffer({ program, courseUrl }: { program: MarathonProgram; courseUrl: string }) {
  const { offer } = program;
  const final = Math.round(offer.price * (1 - offer.promoPercent / 100));
  return (
    <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-fuchsia-500/10 to-violet-600/20 p-6 md:p-8">
      <span className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-100 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-4">
        <Icon name="Gift" size={13} /> Только для участников марафона
      </span>
      <h3 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">Курс «{offer.title}»</h3>
      <p className="text-white/65 text-sm mb-5">Продолжите с того места, где закончился марафон: полная программа, практика и ИИ-наставник.</p>
      <ul className="space-y-2 mb-6">
        {offer.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-white/85 text-sm">
            <Icon name="Check" size={17} className="text-emerald-300 flex-shrink-0" /> {b}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div>
          <p className="text-white/45 text-sm line-through">{rub(offer.price)}</p>
          <p className="font-montserrat font-black text-4xl text-white">{rub(final)}</p>
        </div>
        <div className="rounded-xl border border-dashed border-amber-300/60 px-4 py-2">
          <p className="text-white/55 text-[11px]">промокод на −{offer.promoPercent}%</p>
          <p className="font-mono font-bold text-amber-200 text-lg tracking-wider">{offer.promoCode}</p>
        </div>
      </div>
      <Link
        to={courseUrl}
        onClick={() => trackGoal("marathon_offer_click", { track: program.track })}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-pink-500 text-[#1a0b24] font-black px-7 py-4 rounded-2xl hover:opacity-90 transition-opacity"
      >
        Перейти к курсу <Icon name="ArrowRight" size={18} />
      </Link>
      <p className="text-white/45 text-xs mt-3">Введите промокод при оплате.</p>
    </div>
  );
}
