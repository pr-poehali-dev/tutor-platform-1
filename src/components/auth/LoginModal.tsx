import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";

type Step = "phone" | "code";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  if (!digits) return "";
  const parts = ["+7"];
  if (digits.length > 1) parts.push(" (" + digits.slice(1, 4));
  if (digits.length >= 4) parts.push(") " + digits.slice(4, 7));
  if (digits.length >= 7) parts.push("-" + digits.slice(7, 9));
  if (digits.length >= 9) parts.push("-" + digits.slice(9, 11));
  return parts.join("");
}

export default function LoginModal() {
  const { isModalOpen, closeLogin, sendCode, verifyCode } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isModalOpen) {
      setStep("phone");
      setCode("");
      setError(null);
      setTestMode(false);
      setResendIn(0);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (step === "code" && codeRef.current) codeRef.current.focus();
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [resendIn]);

  if (!isModalOpen) return null;

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneReady = phoneDigits.length === 11;
  const codeReady = /^\d{4}$/.test(code);

  const handleSendCode = async () => {
    setError(null);
    setLoading(true);
    const res = await sendCode("+" + phoneDigits);
    setLoading(false);
    if (!res.ok) {
      setError(res.message ?? "Ошибка отправки");
      return;
    }
    setTestMode(!!res.testMode);
    setResendIn(60);
    setStep("code");
  };

  const handleVerify = async () => {
    setError(null);
    setLoading(true);
    const res = await verifyCode("+" + phoneDigits, code);
    setLoading(false);
    if (!res.ok) {
      setError(res.message ?? "Неверный код");
      return;
    }
    closeLogin();
    let pendingPlan: string | null = null;
    try {
      pendingPlan = sessionStorage.getItem("pending_checkout_plan");
      if (pendingPlan) sessionStorage.removeItem("pending_checkout_plan");
    } catch {
      // ignore
    }
    if (pendingPlan) {
      navigate(`/checkout/${pendingPlan}`);
    } else {
      navigate("/cabinet");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLogin();
      }}
    >
      <div className="w-full max-w-md bg-card border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base">
              🚀
            </div>
            <div>
              <p className="text-white font-montserrat font-black text-base leading-tight">Вход в УЧИСЬПРО</p>
              <p className="text-white/55 text-xs">Личный кабинет ученика</p>
            </div>
          </div>
          <button
            onClick={closeLogin}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-xl text-white/55 hover:text-white hover:bg-white/8 flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="px-5 pb-5">
          {step === "phone" ? (
            <>
              <p className="text-white/75 text-sm leading-relaxed mb-4">
                Введи номер телефона — пришлём SMS с кодом. Это и регистрация, и вход одновременно.
              </p>
              <label className="block">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                  Телефон
                </span>
                <input
                  inputMode="tel"
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && phoneReady && !loading) handleSendCode();
                  }}
                />
              </label>
              {error && (
                <p className="mt-2 text-rose-300 text-xs flex items-center gap-1.5">
                  <Icon name="AlertCircle" size={12} />
                  {error}
                </p>
              )}

              <button
                onClick={handleSendCode}
                disabled={!phoneReady || loading}
                className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  phoneReady && !loading
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-[1.01] shadow-lg shadow-purple-500/30"
                    : "bg-white/8 text-white/40 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="Send" size={14} />
                )}
                Получить код
              </button>

              <p className="text-white/45 text-[11px] text-center mt-3 leading-relaxed">
                Нажимая кнопку, ты соглашаешься с{" "}
                <a href="/legal/terms" className="text-purple-300 hover:text-purple-200 underline">
                  условиями
                </a>{" "}
                и{" "}
                <a href="/legal/privacy" className="text-purple-300 hover:text-purple-200 underline">
                  политикой обработки данных
                </a>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs mb-3 transition-colors"
              >
                <Icon name="ArrowLeft" size={12} />
                Изменить номер
              </button>

              <p className="text-white/75 text-sm leading-relaxed mb-1">
                Код отправлен на <span className="text-white font-semibold">{phone}</span>
              </p>
              {testMode && (
                <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-200 text-xs">
                  <Icon name="Info" size={12} className="inline mr-1" />
                  Тестовый режим. Используй код <span className="font-mono font-bold">1234</span>
                </div>
              )}

              <label className="block mt-3">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                  Код из SMS
                </span>
                <input
                  ref={codeRef}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors text-2xl tracking-[0.5em] text-center font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && codeReady && !loading) handleVerify();
                  }}
                />
              </label>
              {error && (
                <p className="mt-2 text-rose-300 text-xs flex items-center gap-1.5">
                  <Icon name="AlertCircle" size={12} />
                  {error}
                </p>
              )}

              <button
                onClick={handleVerify}
                disabled={!codeReady || loading}
                className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  codeReady && !loading
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-[1.01] shadow-lg shadow-purple-500/30"
                    : "bg-white/8 text-white/40 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="Check" size={14} />
                )}
                Войти
              </button>

              <div className="mt-3 text-center">
                {resendIn > 0 ? (
                  <p className="text-white/50 text-xs">
                    Запросить новый код можно через {resendIn} сек
                  </p>
                ) : (
                  <button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="text-purple-300 hover:text-purple-200 text-xs font-medium"
                  >
                    Отправить код повторно
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}