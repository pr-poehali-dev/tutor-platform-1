import { useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

const API = (func2url as Record<string, string>).notifications;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const ready = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function submit() {
    if (!ready || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}?action=reset_request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось отправить письмо");
      } else {
        setSent(true);
      }
    } catch {
      setError("Нет связи с сервером. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0A1F] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          На главную
        </a>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <Icon name="MailCheck" size={26} className="text-emerald-400" />
              </div>
              <h1 className="text-white text-xl font-bold mb-3">Письмо отправлено</h1>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Если адрес <span className="text-white/90">{email}</span> зарегистрирован,
                на него придёт ссылка для смены пароля. Она действует 2 часа.
              </p>
              <p className="text-white/40 text-xs leading-relaxed mb-6">
                Письма нет? Проверьте папку «Спам» — иногда первое письмо попадает туда.
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm"
              >
                Вернуться на сайт
              </a>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center mb-4">
                <Icon name="KeyRound" size={22} className="text-purple-300" />
              </div>
              <h1 className="text-white text-xl font-bold mb-2">Забыли пароль?</h1>
              <p className="text-white/55 text-sm leading-relaxed mb-6">
                Укажите email, которым пользовались при регистрации. Пришлём ссылку
                для создания нового пароля.
              </p>

              <label className="block mb-4">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                  placeholder="example@mail.ru"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 transition-colors text-base"
                />
              </label>

              {error && (
                <p className="mb-3 text-rose-300 text-xs flex items-center gap-1.5">
                  <Icon name="AlertCircle" size={12} />
                  {error}
                </p>
              )}

              <button
                onClick={submit}
                disabled={!ready || loading}
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  ready && !loading
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-[1.01]"
                    : "bg-white/8 text-white/40 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="Send" size={14} />
                )}
                Отправить ссылку
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
