import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { fetchMyEnrollments, type EnrollmentItem } from "@/components/school/api";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function SchoolLearning() {
  const { isAuthenticated, loading: authLoading, openLogin } = useAuth();
  const [items, setItems] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setError(null);
    fetchMyEnrollments().then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
      else setError(r.error || "Не удалось загрузить курсы");
      setLoading(false);
    });
  }, [isAuthenticated]);

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center max-w-sm">
          <Icon name="BookMarked" size={26} className="text-violet-300 mx-auto mb-4" />
          <h1 className="font-montserrat font-black text-xl mb-2">Моё обучение</h1>
          <p className="text-white/60 text-sm mb-5">Войдите, чтобы увидеть купленные курсы.</p>
          <button onClick={openLogin} className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3 rounded-xl">
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Моё обучение · УЧИСЬПРО" description="Купленные курсы онлайн-школ" canonical={`${SITE_URL}/school/learning`} noindex />
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8 pb-16">
        <h1 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Моё обучение</h1>
        {loading ? (
          <div className="text-white/50 text-sm py-10 text-center">Загружаем ваши курсы…</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/25 bg-rose-500/[0.06] p-8 text-center">
            <Icon name="CircleAlert" size={28} className="text-rose-300 mx-auto mb-3" />
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <Icon name="BookOpen" size={30} className="text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">У вас пока нет купленных курсов.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((c) => (
              <Link
                key={c.id}
                to={`/course/${c.id}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-violet-400/40 p-5 transition-colors"
              >
                <div className="text-white/45 text-xs mb-1">{c.school_name}</div>
                <h3 className="font-montserrat font-bold text-white mb-2">{c.title}</h3>
                <p className="text-white/50 text-xs">{c.modules_count} модулей · {c.lessons_count} уроков</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}