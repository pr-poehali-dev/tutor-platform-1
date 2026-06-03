import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";

/** Страница возврата после авторизации через Яндекс: /auth/yandex/callback */
export default function YandexCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeYandexLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = params.get("code");
    const errorParam = params.get("error");

    if (errorParam || !code) {
      setError("Вход через Яндекс отменён или не удался. Попробуй ещё раз.");
      return;
    }

    completeYandexLogin(code).then((res) => {
      if (res.ok) {
        navigate("/", { replace: true });
      } else {
        setError(res.message || "Не удалось войти через Яндекс");
      }
    });
  }, [params, completeYandexLogin, navigate]);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-4">
      <Seo title="Вход через Яндекс — УЧИСЬПРО" description="Завершаем вход через Яндекс" canonical="https://xn--h1agdcde2c.xn--p1ai/auth/yandex/callback" noindex />

      <div className="max-w-md w-full text-center">
        {error ? (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-5">
              <Icon name="TriangleAlert" size={26} className="text-rose-300" />
            </div>
            <h1 className="font-montserrat font-black text-xl mb-2">Не получилось войти</h1>
            <p className="text-white/60 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              <Icon name="Home" size={16} />
              На главную
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mb-5" />
            <p className="text-white/70 text-sm">Завершаем вход через Яндекс…</p>
          </>
        )}
      </div>
    </div>
  );
}
