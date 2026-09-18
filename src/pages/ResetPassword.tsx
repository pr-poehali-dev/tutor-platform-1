import { useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

const API = (func2url as Record<string, string>).notifications;

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const tooShort = password.length > 0 && password.length < 6;
  const mismatch = repeat.length > 0 && password !== repeat;
  const ready = password.length >= 6 && password === repeat && !!token;

  async function submit() {
    if (!ready || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}?action=reset_confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось сменить пароль");
      } else {
        setDone(true);
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
          {!token ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
                <Icon name="LinkOff" fallback="AlertCircle" size={26} className="text-rose-400" />
              </div>
              <h1 className="text-white text-xl font-bold mb-3">Ссылка недействительна</h1>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Похоже, ссылка неполная или устарела. Запросите новую — это займёт минуту.
              </p>
              <a
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm"
              >
                Запросить новую ссылку
              </a>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={26} className="text-emerald-400" />
              </div>
              <h1 className="text-white text-xl font-bold mb-3">Пароль изменён</h1>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Теперь можно войти в аккаунт с новым паролем.
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm"
              >
                Войти на сайт
              </a>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center mb-4">
                <Icon name="KeyRound" size={22} className="text-purple-300" />
              </div>
              <h1 className="text-white text-xl font-bold mb-2">Новый пароль</h1>
              <p className="text-white/55 text-sm leading-relaxed mb-6">
                Придумайте пароль не короче 6 символов.
              </p>

              <label className="block mb-3">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                  Пароль
                </span>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    autoFocus
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.slice(0, 128))}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 transition-colors text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Скрыть пароль" : "Показать пароль"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg text-white/45 hover:text-white flex items-center justify-center"
                  >
                    <Icon name={show ? "EyeOff" : "Eye"} size={16} />
                  </button>
                </div>
                {tooShort && (
                  <span className="text-amber-300/80 text-xs mt-1.5 block">
                    Ещё {6 - password.length} символа
                  </span>
                )}
              </label>

              <label className="block mb-4">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                  Повторите пароль
                </span>
                <input
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value.slice(0, 128))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 transition-colors text-base"
                />
                {mismatch && (
                  <span className="text-amber-300/80 text-xs mt-1.5 block">
                    Пароли не совпадают
                  </span>
                )}
              </label>

              {error && (
                <p className="mb-3 text-rose-300 text-xs flex items-start gap-1.5">
                  <Icon name="AlertCircle" size={12} className="mt-0.5 shrink-0" />
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
                  <Icon name="Check" size={14} />
                )}
                Сохранить пароль
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
