import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { checkAccess, getPaidEmail, getSavedAccess, saveAccess, setPaidEmail } from "./api";

type State = "idle" | "checking" | "granted" | "pending";

interface Props {
  /** Идентификатор продукта. Если не задан — поведение как раньше (интенсив). */
  track?: string;
  /** Название продукта для текстов («интенсив», «курс»). */
  productName?: string;
  /** Текст под заголовком «Доступ открыт». */
  grantedText?: string;
}

/**
 * Баннер доступа к платному продукту (интенсив/курс).
 * - После оплаты (?paid=1) опрашивает бэкенд, пока вебхук не активирует доступ.
 * - Если доступ уже сохранён локально — показывает «Доступ открыт».
 * - Иначе позволяет проверить доступ по email (для тех, кто оплатил с другого устройства).
 */
export default function AccessBanner({ track, productName = "интенсив", grantedText }: Props) {
  const justPaid = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("paid") === "1";
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState(getPaidEmail(track) || "");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Если доступ уже есть в localStorage — сразу показываем
  useEffect(() => {
    const saved = getSavedAccess(track);
    if (saved) {
      setState("granted");
      setName("");
    }
  }, [track]);

  // После оплаты — поллинг доступа (вебхук может прийти с задержкой)
  useEffect(() => {
    if (!justPaid || state === "granted") return;
    const paidEmail = getPaidEmail(track);
    if (!paidEmail) return;
    let cancelled = false;
    setState("checking");
    const poll = async () => {
      const res = await checkAccess(paidEmail, track);
      if (cancelled) return;
      if (res.access) {
        saveAccess(paidEmail, res.token, track);
        setName(res.name || "");
        setState("granted");
      } else if (attempt < 6) {
        setTimeout(() => setAttempt((a) => a + 1), 2500);
        setState("pending");
      } else {
        setState("pending");
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justPaid, attempt, track]);

  const manualCheck = async () => {
    setError(null);
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setError("Введи email, на который оформлял оплату");
      return;
    }
    setPaidEmail(e, track);
    setState("checking");
    const res = await checkAccess(e, track);
    if (res.access) {
      saveAccess(e, res.token, track);
      setName(res.name || "");
      setState("granted");
    } else {
      setState("idle");
      setError(res.message || res.error || "Оплата по этому email не найдена");
    }
  };

  const defaultGranted = `Оплата прошла — ${productName} полностью твой. Проходи в своём темпе, ИИ-наставник на связи 24/7.`;

  if (state === "granted") {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-teal-500/5 p-6 md:p-7 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Icon name="CheckCircle2" size={24} className="text-emerald-300" />
        </div>
        <div>
          <h3 className="font-montserrat font-black text-xl text-white mb-1">
            Доступ открыт{name ? `, ${name}` : ""}!
          </h3>
          <p className="text-white/70 text-sm">{grantedText || defaultGranted}</p>
        </div>
      </div>
    );
  }

  if (justPaid && (state === "checking" || state === "pending")) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/[0.08] p-6 md:p-7">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="Loader2" size={20} className="text-amber-300 animate-spin" />
          <h3 className="font-montserrat font-black text-lg text-white">Подтверждаем оплату...</h3>
        </div>
        <p className="text-white/65 text-sm">
          Это занимает до минуты. Страница обновится автоматически, как только банк подтвердит платёж.
        </p>
        {state === "pending" && attempt >= 6 && (
          <button
            onClick={() => setAttempt((a) => a + 1)}
            className="mt-3 text-amber-200 text-sm font-semibold underline underline-offset-2"
          >
            Проверить ещё раз
          </button>
        )}
      </div>
    );
  }

  // Ручная проверка доступа по email
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="KeyRound" size={18} className="text-purple-300" />
        <h3 className="font-montserrat font-bold text-white text-base">Уже оплатил? Открой доступ</h3>
      </div>
      <p className="text-white/55 text-sm mb-4">
        Введи email, на который оформлял оплату — и {productName} откроется на этом устройстве.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email оплаты"
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <button
          onClick={manualCheck}
          disabled={state === "checking"}
          className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3 rounded-xl disabled:opacity-50 transition-colors"
        >
          {state === "checking" ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Unlock" size={16} />}
          Открыть
        </button>
      </div>
      {error && <div className="mt-2 text-rose-300 text-xs">{error}</div>}
    </div>
  );
}