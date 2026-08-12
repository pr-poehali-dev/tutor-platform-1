import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { PLANS } from "@/components/checkout/checkoutPlans";

export type PaywallReason = "signup" | "subscribe";

interface Props {
  open: boolean;
  onClose: () => void;
  /** signup — просим зарегистрироваться, subscribe — предлагаем подписку. */
  reason: PaywallReason;
  /** Заголовок под ситуацию, например «Осталось 0 вопросов на сегодня». */
  title: string;
  /** Что человек получит, если сделает шаг. */
  bullets: string[];
  /** Короткое пояснение под заголовком. */
  note?: string;
}

/**
 * Окно на границе бесплатного.
 *
 * Появляется ровно в тот момент, когда человек получил пользу и хочет ещё.
 * Это самая денежная точка сайта, поэтому здесь: понятная причина остановки,
 * список выгод и одна главная кнопка. Никакого давления и запугивания —
 * закрыть окно можно всегда, бесплатное остаётся доступным.
 */
export default function PaywallDialog({ open, onClose, reason, title, bullets, note }: Props) {
  const { openLogin } = useAuth();
  const plan = PLANS.tutor;

  if (!open) return null;

  const isSignup = reason === "signup";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#12131c] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <Icon name="X" size={16} />
        </button>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${
            isSignup ? "from-cyan-500 to-blue-600" : "from-purple-500 to-pink-600"
          }`}
        >
          <Icon name={isSignup ? "UserPlus" : "Crown"} size={22} className="text-white" />
        </div>

        <h2 className="font-montserrat font-black text-xl mb-2 text-white leading-tight">{title}</h2>
        {note && <p className="text-white/60 text-sm mb-4 leading-relaxed">{note}</p>}

        <ul className="space-y-2.5 mb-6">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-white/85">
              <Icon
                name="Check"
                size={16}
                className={`mt-0.5 flex-shrink-0 ${isSignup ? "text-cyan-400" : "text-purple-400"}`}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {isSignup ? (
          <>
            <button
              onClick={() => {
                onClose();
                openLogin();
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
            >
              Создать бесплатный аккаунт
            </button>
            <p className="text-center text-white/40 text-xs mt-3">
              Только почта и пароль. Карта не нужна, это бесплатно.
            </p>
          </>
        ) : (
          <>
            <Link
              to="/checkout/tutor"
              onClick={onClose}
              className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
            >
              Открыть безлимит — {plan.price} ₽/мес
            </Link>
            <p className="text-center text-white/40 text-xs mt-3">
              Год — {plan.yearPrice} ₽ (выгода {plan.price * 12 - (plan.yearPrice || 0)} ₽). Отмена в любой момент.
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full text-white/45 hover:text-white/70 text-sm mt-3 py-1.5 transition-colors"
        >
          Позже
        </button>
      </div>
    </div>
  );
}