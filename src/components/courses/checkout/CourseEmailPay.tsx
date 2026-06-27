import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useYookassa, isValidEmail } from "@/components/extensions/yookassa/useYookassa";
import { setPaidEmail } from "@/components/intensive/api";
import type { Course } from "@/components/courses/coursesData";
import func2url from "../../../../backend/func2url.json";

const YOOKASSA_URL = (func2url as Record<string, string>)["yookassa-yookassa"];

interface Props {
  course: Course;
  price: number;
}

/**
 * Оплата платного курса по email без обязательного логина.
 * Переиспользует механизм интенсива: после оплаты webhook (kind='intensive')
 * пишет доступ в intensive_access с track=`course-${id}`.
 */
export default function CourseEmailPay({ course, price }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const { createPayment, isLoading, error } = useYookassa({ apiUrl: YOOKASSA_URL });

  const track = `course-${course.id}`;

  const handlePay = async () => {
    setLocalError(null);
    if (!isValidEmail(email)) {
      setLocalError("Введи корректный email — на него придёт чек и доступ");
      return;
    }
    if (!agree) {
      setLocalError("Подтверди согласие с условиями");
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    setPaidEmail(cleanEmail, track);
    const returnUrl = `${window.location.origin}/course-checkout/${course.id}?paid=1`;
    const res = await createPayment({
      amount: price,
      userEmail: cleanEmail,
      userName: name.trim(),
      description: `Курс «${course.title}»`,
      returnUrl,
      cartItems: [
        { id: `course-${course.id}`, name: course.title, price, quantity: 1 },
      ],
      metadata: {
        kind: "intensive",
        email: cleanEmail,
        name: name.trim(),
        track,
      },
    });
    if (res?.payment_url && /^https:\/\//.test(res.payment_url)) {
      window.location.href = res.payment_url;
    }
  };

  const displayError = localError || (error ? error.message : null);

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
      <div className="flex items-end gap-3 mb-1">
        <span className="font-montserrat font-black text-4xl md:text-5xl text-white">
          {price.toLocaleString("ru-RU")} ₽
        </span>
      </div>
      <p className="text-white/50 text-xs mb-5">
        Доступ навсегда · оплата картой или СБП · чек по 54-ФЗ
      </p>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя (необязательно)"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email для чека и доступа"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
      </div>

      <label className="flex items-start gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 accent-purple-500"
        />
        <span className="text-white/45 text-xs">
          Согласен с условиями оферты и обработкой персональных данных
        </span>
      </label>

      {displayError && <div className="mt-3 text-rose-300 text-xs">{displayError}</div>}

      <button
        onClick={handlePay}
        disabled={isLoading}
        className={`mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${course.color} text-white font-bold py-3.5 rounded-xl disabled:opacity-60 hover:scale-[1.01] transition-transform`}
      >
        {isLoading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="CreditCard" size={18} />}
        {isLoading ? "Переходим к оплате..." : "Оплатить и получить доступ"}
      </button>

      <div className="flex items-center justify-center gap-2 mt-3 text-white/35 text-[11px]">
        <Icon name="ShieldCheck" size={13} />
        Безопасная оплата картой или СБП через ЮKassa
      </div>
    </div>
  );
}
