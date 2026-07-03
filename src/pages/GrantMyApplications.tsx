import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { fetchMyGrants, fetchGrant, type GrantApplication } from "@/components/grants/api";
import GrantResult from "@/components/grants/GrantResult";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

export default function GrantMyApplications() {
  const { isAuthenticated, loading: authLoading, openLogin } = useAuth();
  const [items, setItems] = useState<GrantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openApp, setOpenApp] = useState<GrantApplication | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setError(null);
    fetchMyGrants().then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
      else setError(r.error || "Не удалось загрузить заявки");
      setLoading(false);
    });
  }, [isAuthenticated]);

  const open = async (id: number) => {
    setOpeningId(id);
    const res = await fetchGrant(id);
    setOpeningId(null);
    if (res.ok && res.data) {
      setOpenApp(res.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-4">
            <Icon name="Target" size={26} className="text-violet-300" />
          </div>
          <h1 className="font-montserrat font-black text-xl mb-2">Мои заявки на гранты</h1>
          <p className="text-white/60 text-sm mb-5">Войдите, чтобы увидеть подготовленные заявки.</p>
          <button
            onClick={openLogin}
            className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Мои заявки на гранты · УЧИСЬПРО" canonical={`${SITE_URL}/grants/my`} noindex />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎯</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/grants"
            className="inline-flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <Icon name="Plus" size={15} /> Новая заявка
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8 pb-16">
        {openApp ? (
          <>
            <button
              onClick={() => setOpenApp(null)}
              className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-5"
            >
              <Icon name="ArrowLeft" size={15} /> Ко всем заявкам
            </button>
            <GrantResult app={openApp} onRestart={() => setOpenApp(null)} />
          </>
        ) : (
          <>
            <h1 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Мои заявки на гранты</h1>

            {loading ? (
              <div className="text-white/50 text-sm py-16 text-center">Загружаем заявки…</div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-500/25 bg-rose-500/[0.06] p-8 text-center">
                <Icon name="CircleAlert" size={28} className="text-rose-300 mx-auto mb-3" />
                <p className="text-white/60 text-sm">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
                <Icon name="FileText" size={30} className="text-white/40 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-5">Вы ещё не готовили заявок на гранты.</p>
                <Link
                  to="/grants"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
                >
                  <Icon name="Wand2" size={16} /> Подготовить первую заявку
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => open(a.id)}
                    disabled={openingId === a.id}
                    className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:border-violet-400/40 p-4 md:p-5 transition-colors disabled:opacity-60"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-montserrat font-bold text-base text-white">
                            {a.preview?.project_title || a.project_title || "Проект"}
                          </h3>
                          {a.is_paid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-md px-2 py-0.5">
                              <Icon name="ShieldCheck" size={10} /> Оплачено
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-md px-2 py-0.5">
                              <Icon name="Lock" size={10} /> Черновик
                            </span>
                          )}
                        </div>
                        <p className="text-white/45 text-xs">
                          {a.grant_name} · {fmtDate(a.created_at)}
                          {a.preview?.expert_score != null && ` · шансы ${a.preview.expert_score}/100`}
                        </p>
                      </div>
                      <Icon
                        name={openingId === a.id ? "Loader2" : "ChevronRight"}
                        size={18}
                        className={`text-white/40 flex-shrink-0 ${openingId === a.id ? "animate-spin" : ""}`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
