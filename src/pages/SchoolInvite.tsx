import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { acceptInvite } from "@/components/school/api";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

type State = "loading" | "need_login" | "activating" | "success" | "error";

export default function SchoolInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, openLogin } = useAuth();
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setState("need_login");
      return;
    }
    if (!token) {
      setState("error");
      setError("Ссылка приглашения повреждена");
      return;
    }
    setState("activating");
    acceptInvite(token).then((res) => {
      if (res.ok && res.data) {
        setState("success");
        setTimeout(() => navigate("/school"), 1500);
      } else {
        setState("error");
        setError(res.error || "Не удалось активировать приглашение");
      }
    });
  }, [authLoading, isAuthenticated, token, navigate]);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-5">
      <Seo title="Приглашение в конструктор школ · УЧИСЬПРО" canonical={`${SITE_URL}/school`} noindex />
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center max-w-sm w-full">
        {(state === "loading" || state === "activating") && (
          <>
            <Icon name="Loader2" size={28} className="text-violet-300 animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-sm">Активируем ваш доступ…</p>
          </>
        )}

        {state === "need_login" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-4">
              <Icon name="Mail" size={26} className="text-violet-300" />
            </div>
            <h1 className="font-montserrat font-black text-xl mb-2">Вас пригласили в конструктор школ</h1>
            <p className="text-white/60 text-sm mb-5">
              Войдите под тем email, на который выслано приглашение, чтобы активировать доступ.
            </p>
            <button
              onClick={openLogin}
              className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform"
            >
              Войти и активировать
            </button>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <Icon name="CircleCheck" size={28} className="text-emerald-300" />
            </div>
            <h1 className="font-montserrat font-black text-xl mb-2">Доступ открыт!</h1>
            <p className="text-white/60 text-sm">Переносим вас в кабинет школы…</p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
              <Icon name="CircleAlert" size={28} className="text-rose-300" />
            </div>
            <h1 className="font-montserrat font-black text-xl mb-2">Не получилось</h1>
            <p className="text-white/60 text-sm mb-5">{error}</p>
            <Link
              to="/school"
              className="inline-block w-full bg-white/[0.06] border border-white/15 text-white font-bold py-3 rounded-xl hover:border-violet-400/40 transition-colors"
            >
              Перейти в кабинет
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
