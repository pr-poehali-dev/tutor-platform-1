import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { DEFAULT_PILOT_CITY, findPilotCity } from "@/data/pilotCities";

export const SAMARA_PROMO_CODE = "САМАРА";

const INCLUDED = [
  { icon: "BookOpen", text: "Все курсы раздела «Школьникам»: 1–11 класс, ОГЭ и ЕГЭ" },
  { icon: "GraduationCap", text: "Предметы с ИИ-преподавателем: математика, физика, русский, химия, биология, информатика, история" },
  { icon: "CalendarCheck", text: "Доступ до 31 мая 2027 года — весь учебный год" },
];

function formatDate(iso: string | null | undefined) {
  if (!iso) return "31.05.2027";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Moscow" });
}

/**
 * Пилотный проект школ (Самара и другие города): ученик вводит промокод — название города — и получает
 * бесплатный доступ к курсам раздела «Школьникам». Взрослые курсы, «Малыш»
 * и подписка «Репетитор» промокодом не открываются — это проверяет сервер.
 */
export default function SamaraPilot() {
  const { city: citySlug } = useParams();
  const city = citySlug ? findPilotCity(citySlug) : DEFAULT_PILOT_CITY;
  if (!city) return <Navigate to="/pilot" replace />;
  return <PilotActivation key={city.slug} slug={city.slug} />;
}

function PilotActivation({ slug }: { slug: string }) {
  const city = findPilotCity(slug)!;
  const { isAuthenticated, openLogin } = useAuth();
  const { schoolAccessUntil, redeemAccessCode } = useAccess();
  const [code, setCode] = useState(city.promo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneUntil, setDoneUntil] = useState<string | null>(null);

  const activeUntil = doneUntil || schoolAccessUntil;

  const activate = async () => {
    setError(null);
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setBusy(true);
    const res = await redeemAccessCode(code.trim());
    setBusy(false);
    if (!res.ok) {
      setError(res.message || "Не удалось активировать промокод");
      return;
    }
    trackGoal("samara_promo_activated", { already: !!res.alreadyActive, city: city.slug });
    setDoneUntil(res.expiresAt || null);
  };

  return (
    <div className="min-h-screen bg-mesh text-white font-golos">
      <Seo
        title={`Пилотный проект для школ ${city.nameGen}: активация доступа`}
        description={`Страница активации доступа для учеников школ — участниц пилотного проекта УЧИСЬПРО ${city.nameIn}. Промокод ${city.promo}.`}
        canonical={`https://учисьпро.рф${city.path}`}
        noindex
      />

      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎓</div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link to="/shkola" className="text-sm font-bold text-violet-200 hover:text-white transition-colors">Школьникам</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Главная", href: "/" },
            { label: "Школьникам", href: "/shkola" },
            { label: `Пилот школ ${city.nameGen}`, href: city.path },
          ]}
        />
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/35 rounded-full px-4 py-1.5 mb-5">
            <Icon name="School" size={13} className="text-cyan-300" />
            <span className="text-xs text-cyan-100 font-bold uppercase tracking-wider">Пилотный проект школ {city.nameGen}</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
            Курсы для школьников —{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">бесплатно</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">
            Ваша школа участвует в пилотном проекте УЧИСЬПРО. Активируйте промокод — и весь учебный год занимайтесь без оплаты.
          </p>
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:p-8 mb-8">
          {activeUntil ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={30} className="text-emerald-400" />
              </div>
              <h2 className="font-montserrat font-black text-2xl mb-2">Доступ открыт</h2>
              <p className="text-white/70 mb-6">
                Курсы раздела «Школьникам» бесплатны для вас до <b className="text-white">{formatDate(activeUntil)}</b>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/courses" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 px-6 rounded-xl hover:scale-[1.02] transition-transform">
                  <Icon name="BookOpen" size={18} /> Перейти к курсам
                </Link>
                <Link to="/super-courses" className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-6 rounded-xl transition-colors">
                  <Icon name="GraduationCap" size={18} /> Предметы с ИИ-преподавателем
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-montserrat font-black text-xl mb-1 flex items-center gap-2">
                <Icon name="Ticket" size={20} className="text-amber-300" /> Активация промокода
              </h2>
              <p className="text-white/55 text-sm mb-5">
                {isAuthenticated ? "Промокод уже подставлен — нажмите кнопку." : "Сначала войдите или зарегистрируйтесь — это займёт минуту."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                  className="flex-1 rounded-xl bg-background/70 border border-white/15 px-4 py-3.5 font-mono font-bold tracking-widest text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400"
                  placeholder="ПРОМОКОД"
                  aria-label="Промокод"
                />
                <button
                  onClick={activate}
                  disabled={busy || !code.trim()}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black py-3.5 px-6 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
                >
                  {busy ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name={isAuthenticated ? "Unlock" : "LogIn"} size={18} />}
                  {isAuthenticated ? "Активировать" : "Войти и активировать"}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-rose-300 flex items-center gap-1.5">
                  <Icon name="CircleAlert" size={15} /> {error}
                </p>
              )}
            </>
          )}
        </div>

        <section className="mb-8">
          <h2 className="font-montserrat font-black text-xl mb-4">Что входит</h2>
          <div className="space-y-3">
            {INCLUDED.map((i) => (
              <div key={i.text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 flex items-center justify-center flex-shrink-0">
                  <Icon name={i.icon} size={19} className="text-cyan-200" />
                </div>
                <p className="text-white/80 text-sm md:text-base pt-2">{i.text}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-white/45 text-xs leading-relaxed">
          Промокод {city.promo} действует до 31.05.2027 включительно и только для раздела «Школьникам». Название города можно вводить в любом написании. Курсы для взрослых, раздел «Малыш» и подписка «Репетитор» оплачиваются отдельно. Один аккаунт — одна активация.
        </p>
      </main>
    </div>
  );
}
