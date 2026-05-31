import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "register";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginModal() {
  const { isModalOpen, closeLogin, register, login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isModalOpen) {
      setMode("register");
      setEmail("");
      setPassword("");
      setName("");
      setShowPassword(false);
      setError(null);
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const emailReady = EMAIL_RE.test(email.trim());
  const passwordReady = password.length >= 6;
  const ready = emailReady && passwordReady;

  const handleSubmit = async () => {
    if (!ready || loading) return;
    setError(null);
    setLoading(true);
    const res =
      mode === "register"
        ? await register(email.trim(), password, name.trim() || undefined)
        : await login(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.message ?? "Не получилось");
      return;
    }
    closeLogin();
    let pendingPlan: string | null = null;
    let pendingPeriod: string | null = null;
    try {
      pendingPlan = sessionStorage.getItem("pending_checkout_plan");
      pendingPeriod = sessionStorage.getItem("pending_checkout_period");
      if (pendingPlan) sessionStorage.removeItem("pending_checkout_plan");
      if (pendingPeriod) sessionStorage.removeItem("pending_checkout_period");
    } catch {
      // ignore
    }
    if (pendingPlan) {
      const q = pendingPeriod === "year" ? "?period=year" : "";
      navigate(`/checkout/${pendingPlan}${q}`);
    }
    else navigate("/cabinet");
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
              <p className="text-white font-montserrat font-black text-base leading-tight">
                {mode === "register" ? "Регистрация" : "Вход в УЧИСЬПРО"}
              </p>
              <p className="text-white/55 text-xs">
                {mode === "register" ? "Создай аккаунт за полминуты" : "Личный кабинет ученика"}
              </p>
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
          <div className="grid grid-cols-2 gap-1 mb-4 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "register"
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-white/65 hover:text-white"
              }`}
            >
              Регистрация
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "login"
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-white/65 hover:text-white"
              }`}
            >
              У меня есть аккаунт
            </button>
          </div>

          {mode === "register" && (
            <label className="block mb-3">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                Имя <span className="text-white/30 normal-case font-normal">(необязательно)</span>
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 80))}
                placeholder="Как тебя зовут"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors text-base"
              />
            </label>
          )}

          <label className="block mb-3">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
              Email
            </span>
            <input
              type="email"
              inputMode="email"
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, 120))}
              placeholder="example@mail.ru"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && ready && !loading) handleSubmit();
              }}
            />
          </label>

          <label className="block">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
              Пароль <span className="text-white/30 normal-case font-normal">(минимум 6 символов)</span>
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value.slice(0, 128))}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && ready && !loading) handleSubmit();
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg text-white/45 hover:text-white hover:bg-white/8 flex items-center justify-center transition-colors"
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
              </button>
            </div>
          </label>

          {error && (
            <p className="mt-3 text-rose-300 text-xs flex items-center gap-1.5">
              <Icon name="AlertCircle" size={12} />
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!ready || loading}
            className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${
              ready && !loading
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-[1.01] shadow-lg shadow-purple-500/30"
                : "bg-white/8 text-white/40 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <Icon name={mode === "register" ? "UserPlus" : "LogIn"} size={14} />
            )}
            {mode === "register" ? "Создать аккаунт" : "Войти"}
          </button>

          <p className="text-white/45 text-[11px] text-center mt-3 leading-relaxed">
            Продолжая, ты соглашаешься с{" "}
            <a href="/legal/terms" className="text-purple-300 hover:text-purple-200 underline">
              условиями
            </a>{" "}
            и{" "}
            <a href="/legal/privacy" className="text-purple-300 hover:text-purple-200 underline">
              политикой обработки данных
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}