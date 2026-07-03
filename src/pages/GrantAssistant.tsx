import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import {
  generateGrant,
  fetchGrant,
  fetchGrantPrice,
  syncGrantPayment,
  type GrantApplication,
} from "@/components/grants/api";
import GrantResult from "@/components/grants/GrantResult";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";
const IDEA_MAX = 5000;

const LOADING_STEPS = [
  "Анализирую грант и критерии оценки…",
  "Формулирую актуальность и цели…",
  "Собираю задачи, команду и календарный план…",
  "Готовлю смету и проверку по критериям…",
];

const EXAMPLES = [
  "Фонд президентских грантов",
  "ФСИ «Старт»",
  "Росмолодёжь.Гранты",
  "Грант на культурный проект",
];

export default function GrantAssistant() {
  const { isAuthenticated, openLogin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [grantName, setGrantName] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [organization, setOrganization] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [region, setRegion] = useState("");
  const [deadline, setDeadline] = useState("");
  const [extra, setExtra] = useState("");
  const [showMore, setShowMore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<GrantApplication | null>(null);
  const [priceRub, setPriceRub] = useState<number | null>(null);
  const [openingApp, setOpeningApp] = useState(false);
  const stepTimer = useRef<number | null>(null);

  // Цена полного пакета — показываем ДО генерации, чтобы не терять доверие
  useEffect(() => {
    fetchGrantPrice().then((r) => {
      if (r.ok && r.data) setPriceRub(Math.round(r.data.price_kopecks / 100));
    });
  }, []);

  useEffect(() => {
    if (loading) {
      setStep(0);
      stepTimer.current = window.setInterval(() => {
        setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
      }, 2500);
    } else if (stepTimer.current) {
      clearInterval(stepTimer.current);
    }
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, [loading]);

  // Возврат после оплаты — подтверждаем и открываем полный пакет
  useEffect(() => {
    if (searchParams.get("paid") === "1" && isAuthenticated) {
      const appId = Number(searchParams.get("app"));
      syncGrantPayment().then(async () => {
        if (appId) {
          const res = await fetchGrant(appId);
          if (res.ok && res.data) {
            setApp(res.data);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
        searchParams.delete("paid");
        searchParams.delete("app");
        setSearchParams(searchParams, { replace: true });
      });
    }
  }, [searchParams, isAuthenticated, setSearchParams]);

  // Открытие существующей заявки по ссылке /grants?app=ID (из «Моих заявок»)
  useEffect(() => {
    const appId = Number(searchParams.get("app"));
    if (searchParams.get("paid") === "1") return; // обработано выше
    if (appId && isAuthenticated && !app) {
      setOpeningApp(true);
      setError(null);
      fetchGrant(appId).then((res) => {
        setOpeningApp(false);
        if (res.ok && res.data) {
          setApp(res.data);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          setError(res.error || "Заявка не найдена. Возможно, она была удалена.");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated]);

  const submit = async () => {
    if (loading) return;
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (grantName.trim().length < 2) return setError("Укажите название гранта или конкурса");
    if (projectIdea.trim().length < 20) return setError("Опишите проект подробнее — хотя бы пару предложений");
    setError(null);
    setLoading(true);
    setApp(null);
    const res = await generateGrant({
      grant_name: grantName.trim(),
      project_idea: projectIdea.trim(),
      organization: organization.trim() || undefined,
      grant_amount: grantAmount.trim() || undefined,
      region: region.trim() || undefined,
      deadline: deadline.trim() || undefined,
      extra: extra.trim() || undefined,
    });
    setLoading(false);
    if (!res.ok || !res.data) return setError(res.error || "Не удалось подготовить заявку");
    setApp(res.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setApp(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="ИИ-помощник по грантам · Подготовьте заявку на грант за минуты — УЧИСЬПРО"
        description="Опишите грант и проект — ИИ-эксперт подготовит профессиональную заявку: актуальность, цели, смета, календарный план и проверка по критериям. Услуга дешевле рынка."
        canonical={`${SITE_URL}/grants`}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎯</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
            <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">гранты</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/grants/my" className="text-sm text-white/65 hover:text-white transition-colors inline-flex items-center gap-1.5">
              <Icon name="FolderOpen" size={15} /> Мои заявки
            </Link>
            <Link to="/for-business" className="hidden sm:inline-flex text-sm text-white/65 hover:text-white transition-colors items-center gap-1.5">
              <Icon name="Building2" size={15} /> Для бизнеса
            </Link>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {openingApp ? (
          <div className="py-24 text-center">
            <Icon name="Loader2" size={30} className="text-violet-300 animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-sm">Открываю заявку…</p>
          </div>
        ) : app ? (
          <GrantResult app={app} onRestart={restart} />
        ) : (
          <>
            {/* Hero */}
            <section className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
                <Icon name="Sparkles" size={12} className="text-violet-300" />
                <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">ИИ-помощник по грантам</span>
              </div>
              <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
                Заявка на грант{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">за считанные минуты</span>
              </h1>
              <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto">
                Опишите грант и свой проект — ИИ-эксперт подготовит профессиональную заявку: актуальность, цели, задачи,
                смету, календарный план и разбор по критериям. Черновик — бесплатно.
              </p>
              <div className="inline-flex items-center gap-2 mt-5 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5">
                <Icon name="Sparkles" size={13} className="text-emerald-300" />
                <span className="text-sm text-white/75">
                  Черновик и оценка шансов — <span className="text-emerald-300 font-bold">бесплатно</span>
                  {priceRub != null && (
                    <>
                      {" · "}полный пакет — <span className="text-white font-bold">{priceRub.toLocaleString("ru-RU")} ₽</span>
                    </>
                  )}
                </span>
              </div>
            </section>

            {/* Форма */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 max-w-2xl mx-auto">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-5">
                    <Icon name="Loader2" size={28} className="text-violet-300 animate-spin" />
                  </div>
                  <div className="font-montserrat font-bold text-lg text-white mb-4">Готовлю вашу заявку…</div>
                  <div className="space-y-2 max-w-sm mx-auto text-left">
                    {LOADING_STEPS.map((s, i) => (
                      <div key={i} className={`flex items-center gap-2.5 text-sm transition-all ${i <= step ? "text-white/85" : "text-white/30"}`}>
                        <Icon
                          name={i < step ? "CircleCheck" : i === step ? "Loader2" : "Circle"}
                          size={15}
                          className={i < step ? "text-emerald-400" : i === step ? "text-violet-300 animate-spin" : "text-white/25"}
                        />
                        {s}
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-5">Обычно занимает 20–50 секунд</p>
                </div>
              ) : (
                <>
                  <label className="block text-white/70 text-sm font-medium mb-2">На какой грант или конкурс?</label>
                  <input
                    value={grantName}
                    onChange={(e) => setGrantName(e.target.value)}
                    placeholder="Например: Фонд президентских грантов"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 mb-3"
                  />
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setGrantName(ex)}
                        className="text-xs bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg px-2.5 py-1 transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  <label className="block text-white/70 text-sm font-medium mb-2">Расскажите о проекте</label>
                  <textarea
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value.slice(0, IDEA_MAX))}
                    rows={4}
                    maxLength={IDEA_MAX}
                    placeholder="Что за проект, какую проблему решает, для кого, что планируете сделать…"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 resize-y mb-1"
                  />
                  <div className="text-right text-xs text-white/35 mb-3">{projectIdea.length} / {IDEA_MAX}</div>

                  <button
                    onClick={() => setShowMore((v) => !v)}
                    className="text-sm text-violet-300 hover:text-violet-200 inline-flex items-center gap-1 mb-3"
                  >
                    <Icon name={showMore ? "ChevronUp" : "ChevronDown"} size={14} />
                    {showMore ? "Скрыть детали" : "Добавить детали (точнее заявка)"}
                  </button>

                  {showMore && (
                    <div className="space-y-3 mb-4">
                      <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Заявитель: НКО, ИП, компания, физлицо" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50" />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} placeholder="Запрашиваемая сумма" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50" />
                        <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Регион" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50" />
                      </div>
                      <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Срок подачи / дедлайн" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50" />
                      <textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={2} placeholder="Особые требования площадки / критерии (если знаете)" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 resize-y" />
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3.5 py-2.5 mb-3">
                      <p className="text-rose-200 text-sm">{error}</p>
                      <button
                        onClick={submit}
                        className="flex-shrink-0 text-xs font-bold text-white bg-rose-500/25 hover:bg-rose-500/40 border border-rose-400/30 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Повторить
                      </button>
                    </div>
                  )}

                  <button
                    onClick={submit}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 rounded-xl hover:scale-[1.01] transition-transform"
                  >
                    <Icon name="Wand2" size={18} /> Подготовить заявку
                  </button>
                  <p className="text-white/40 text-xs text-center mt-3">
                    Черновик и оценка шансов — бесплатно.
                    {priceRub != null
                      ? ` Полный пакет — ${priceRub.toLocaleString("ru-RU")} ₽, дешевле рынка в десятки раз.`
                      : " Полный пакет — по желанию, дешевле рынка."}
                  </p>
                </>
              )}
            </section>

            {/* Преимущества */}
            <section className="grid sm:grid-cols-3 gap-3 mt-8 max-w-3xl mx-auto">
              {[
                { icon: "FileText", t: "Готовый текст", d: "Актуальность, цели, задачи, соцэффект, команда" },
                { icon: "Calculator", t: "Смета и план", d: "Бюджет с обоснованием и календарный план" },
                { icon: "ShieldCheck", t: "Проверка", d: "Разбор по критериям и оценка шансов" },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-center">
                  <Icon name={c.icon} size={20} className="text-violet-300 mx-auto mb-2" />
                  <div className="text-white font-bold text-sm mb-1">{c.t}</div>
                  <div className="text-white/55 text-xs">{c.d}</div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}