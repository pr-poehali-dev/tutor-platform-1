import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

/** Детерминированное число «купили сегодня» — одинаковое у всех пользователей в течение дня. */
export function getTodayPurchases(courseId: number, popularity: number): number {
  const today = new Date();
  const dayKey = today.getFullYear() * 1000 + today.getMonth() * 31 + today.getDate();
  const seed = (dayKey * 9301 + courseId * 49297) % 233280;
  const rand = seed / 233280;
  const base = Math.max(3, Math.round(popularity / 1500));
  const variance = Math.round(rand * base * 0.8);
  return base + variance;
}

/** Аватарки последних "покупателей" — стабильно для дня и курса. */
function getBuyersAvatars(courseId: number): { emoji: string; name: string }[] {
  const today = new Date();
  const dayKey = today.getFullYear() * 1000 + today.getMonth() * 31 + today.getDate();
  const avatars = [
    { emoji: "🦊", name: "Анна" },
    { emoji: "🐯", name: "Максим" },
    { emoji: "🦁", name: "Полина" },
    { emoji: "🐼", name: "Артём" },
    { emoji: "🦄", name: "София" },
    { emoji: "🐧", name: "Иван" },
    { emoji: "🐨", name: "Мария" },
    { emoji: "🦊", name: "Кирилл" },
    { emoji: "🐰", name: "Алиса" },
    { emoji: "🐺", name: "Даниил" },
  ];
  const seed = (dayKey + courseId * 7) % avatars.length;
  return [
    avatars[seed % avatars.length],
    avatars[(seed + 3) % avatars.length],
    avatars[(seed + 6) % avatars.length],
  ];
}

/** Социальное доказательство: счётчик покупок сегодня + аватарки. */
export function SocialProof({ courseId, popularity }: { courseId: number; popularity: number }) {
  const todayCount = useMemo(() => getTodayPurchases(courseId, popularity), [courseId, popularity]);
  const buyers = useMemo(() => getBuyersAvatars(courseId), [courseId]);

  return (
    <div className="bg-gradient-to-br from-emerald-500/8 to-teal-500/8 border border-emerald-500/25 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2 flex-shrink-0">
          {buyers.map((b, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-2 border-background flex items-center justify-center text-lg"
              title={b.name}
            >
              {b.emoji}
            </div>
          ))}
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border-2 border-background flex items-center justify-center text-emerald-300 text-[10px] font-black">
            +{todayCount - 3}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white/90 text-sm font-semibold flex items-center gap-1.5">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Купили сегодня: <span className="text-emerald-300 font-black">{todayCount}</span>
          </p>
          <p className="text-white/50 text-xs mt-0.5">Курс — в топе продаж этой недели</p>
        </div>
      </div>
    </div>
  );
}

/** Таймер скидки до конца суток (00:00 МСК). */
export function DiscountTimer({ percent = 15 }: { percent?: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(0, end.getTime() - now);
    const totalSec = Math.floor(diff / 1000);
    return {
      h: Math.floor(totalSec / 3600),
      m: Math.floor((totalSec % 3600) / 60),
      s: totalSec % 60,
    };
  }, [now]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="bg-gradient-to-br from-rose-500/12 to-orange-500/12 border border-rose-500/30 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-rose-200 text-sm font-bold flex items-center gap-1.5 mb-0.5">
            <Icon name="Flame" size={14} className="text-orange-400" />
            Скидка −{percent}% сгорит через
          </p>
          <p className="text-white/55 text-xs">Цена вернётся к стандартной в полночь</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-background/60 border border-white/15 rounded-xl px-2.5 py-1.5 min-w-[42px] text-center">
            <p className="font-montserrat font-black text-white text-base leading-none tabular-nums">{pad(h)}</p>
            <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">час</p>
          </div>
          <span className="text-white/30 font-black">:</span>
          <div className="bg-background/60 border border-white/15 rounded-xl px-2.5 py-1.5 min-w-[42px] text-center">
            <p className="font-montserrat font-black text-white text-base leading-none tabular-nums">{pad(m)}</p>
            <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">мин</p>
          </div>
          <span className="text-white/30 font-black">:</span>
          <div className="bg-background/60 border border-white/15 rounded-xl px-2.5 py-1.5 min-w-[42px] text-center">
            <p className="font-montserrat font-black text-rose-300 text-base leading-none tabular-nums">{pad(s)}</p>
            <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">сек</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Гарантия возврата 7 дней + бейджи доверия. */
export function MoneyBackGuarantee() {
  return (
    <div className="bg-gradient-to-br from-cyan-500/8 to-blue-500/8 border border-cyan-500/25 rounded-2xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <Icon name="ShieldCheck" size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-montserrat font-black text-white text-sm mb-1">
            Гарантия возврата 7 дней
          </p>
          <p className="text-white/65 text-xs leading-relaxed">
            Если курс не подойдёт — вернём 100% оплаты в течение недели после покупки. Без вопросов и сложных форм.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Значок защищённой оплаты ЮKassa + принимаемые платёжные системы. */
export function SecurePaymentBadge() {
  const methods = ["Мир", "Visa", "Mastercard", "СБП"];
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
          <Icon name="ShieldCheck" size={18} className="text-emerald-300" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-bold leading-tight">Оплата защищена ЮKassa</p>
          <p className="text-white/50 text-[11px] leading-tight mt-0.5">
            Данные карты шифруются и не хранятся на сайте
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {methods.map((m) => (
          <span
            key={m}
            className="bg-white/8 border border-white/12 rounded-lg px-2.5 py-1 text-white/75 text-[11px] font-semibold"
          >
            {m}
          </span>
        ))}
        <span className="flex items-center gap-1 text-white/45 text-[11px] ml-auto">
          <Icon name="Lock" size={11} />
          SSL-шифрование
        </span>
      </div>
    </div>
  );
}

/** Маленькие бейджи доверия под кнопкой. */
export function TrustBadges() {
  const badges = [
    { icon: "Lock", label: "Оплата ЮKassa" },
    { icon: "RefreshCw", label: "Возврат 7 дней" },
    { icon: "Infinity", label: "Доступ навсегда" },
    { icon: "Receipt", label: "Чек 54-ФЗ" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
      {badges.map((b) => (
        <div
          key={b.label}
          className="bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2 flex items-center gap-1.5"
        >
          <Icon name={b.icon} size={12} className="text-white/55 flex-shrink-0" />
          <p className="text-white/65 text-[11px] font-medium truncate">{b.label}</p>
        </div>
      ))}
    </div>
  );
}