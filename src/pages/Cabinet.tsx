import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import KnowYourselfWidget from "@/components/knowYourself/KnowYourselfWidget";
import ExamChecklistWidget from "@/components/examChecklist/ExamChecklistWidget";
import ConsultationRequest from "@/components/cabinet/ConsultationRequest";

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  trial: { name: "Пробный (7 дней)", color: "from-white/10 to-white/5" },
  base: { name: "Базовый", color: "from-cyan-500/15 to-blue-500/10" },
  pro: { name: "Профи", color: "from-purple-500/20 to-pink-500/15" },
  family: { name: "Семейный", color: "from-green-500/15 to-emerald-500/10" },
};

function formatExpires(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Cabinet() {
  const { user, subscription, loading, isAuthenticated, openLogin, logout } = useAuth();
  const { syncPayment } = useAccess();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openLogin();
    }
  }, [loading, isAuthenticated, openLogin]);

  // При входе в кабинет — подтягиваем «зависшие» оплаты напрямую из ЮKassa
  useEffect(() => {
    if (isAuthenticated) syncPayment();
  }, [isAuthenticated, syncPayment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-white">
        <Icon name="Loader2" size={32} className="animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-white px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-montserrat font-black text-2xl mb-2">Нужен вход</h1>
          <p className="text-white/65 text-sm mb-5">
            Чтобы попасть в личный кабинет, войди по номеру телефона. Регистрация занимает 30 секунд.
          </p>
          <button
            onClick={openLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm hover:scale-[1.02] shadow-lg shadow-purple-500/30 transition-all"
          >
            <Icon name="LogIn" size={16} />
            Войти / Зарегистрироваться
          </button>
        </div>
      </div>
    );
  }

  const hasActiveSub = subscription && subscription.status === "active";
  const planInfo = subscription ? PLAN_LABELS[subscription.plan_id] : null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white pb-16">
      <Seo title="Личный кабинет — УЧИСЬПРО" description="Управление подпиской, профиль и прогресс ученика" canonical="https://xn--h1agdcde2c.xn--p1ai/cabinet" noindex />

      <div className="max-w-5xl mx-auto px-4 pt-10 md:pt-14">
        <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Личный кабинет</p>
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white">
              Привет{user?.name ? `, ${user.name}` : ""} <span className="inline-block">👋</span>
            </h1>
            <p className="text-white/55 text-sm mt-1">{user?.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/12 text-white/65 hover:text-white hover:border-white/25 text-sm transition-colors self-start sm:self-auto"
          >
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
        </div>

        {/* Карточка подписки */}
        <div
          className={`rounded-3xl border border-white/12 bg-gradient-to-br ${planInfo?.color ?? "from-white/8 to-white/3"} backdrop-blur-md p-6 md:p-7 mb-6`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <p className="text-white/55 text-xs font-semibold uppercase tracking-wide mb-1.5">Подписка</p>
              {hasActiveSub && planInfo ? (
                <>
                  <h2 className="font-montserrat font-black text-2xl text-white mb-1">{planInfo.name}</h2>
                  <p className="text-white/70 text-sm">Активна до {formatExpires(subscription!.expires_at)}</p>
                </>
              ) : (
                <>
                  <h2 className="font-montserrat font-black text-2xl text-white mb-1">Подписки нет</h2>
                  <p className="text-white/70 text-sm">Выбери тариф, чтобы открыть все курсы и ИИ-репетитора</p>
                </>
              )}
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:scale-[1.02] shadow-lg shadow-purple-500/30 transition-all whitespace-nowrap"
            >
              <Icon name={hasActiveSub ? "Settings" : "Rocket"} size={14} />
              {hasActiveSub ? "Управлять" : "Выбрать тариф"}
            </Link>
          </div>
        </div>

        {/* Чек-лист «До ЕГЭ» */}
        <ExamChecklistWidget />

        {/* Профориентационный виджет «Познай себя» */}
        <KnowYourselfWidget />

        {/* Быстрые карточки */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/exam-bank"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 p-5 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-3">
              <Icon name="Library" size={20} className="text-cyan-300" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Банк заданий</h3>
            <p className="text-white/55 text-sm">Реальные задания ЕГЭ и ОГЭ с разбором</p>
          </Link>

          <Link
            to="/score-calculator"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 p-5 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-3">
              <Icon name="Calculator" size={20} className="text-purple-300" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Калькулятор баллов</h3>
            <p className="text-white/55 text-sm">Рассчитай свой балл по ЕГЭ и поступление</p>
          </Link>

          <Link
            to="/know-yourself"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 p-5 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
              <Icon name="Compass" size={20} className="text-emerald-300" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Подобрать маршрут</h3>
            <p className="text-white/55 text-sm">Пройди квиз и получи персональный план</p>
          </Link>
        </div>

        {/* Заявка на консультацию — закрывает узкое место воронки */}
        <ConsultationRequest />

        {!hasActiveSub && (
          <div className="mt-8 rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-cyan-500/10 p-6 md:p-8 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
              Открой все возможности платформы
            </h3>
            <p className="text-white/70 text-sm md:text-base mb-5 max-w-lg mx-auto">
              ИИ-репетитор, голосовые ответы, разбор сочинений, пробные экзамены — всё это в подписке от 3999 ₽/мес
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-sm hover:scale-[1.02] shadow-lg shadow-purple-500/30 transition-all"
            >
              <Icon name="Sparkles" size={16} />
              Выбрать тариф
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}