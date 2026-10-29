import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import AccessBanner from "@/components/intensive/AccessBanner";
import { getSavedAccess } from "@/components/intensive/api";
import DayLesson from "@/components/spy-language/DayLesson";
import PayBlock from "@/components/spy-language/PayBlock";
import { METHOD, SPY_DAYS, SPY_FAQ, SPY_LANGS, SPY_META, SPY_OLD_PRICE, SPY_PRICE } from "@/components/spy-language/data";
import { LangProgress, loadProgress, saveProgress } from "@/components/spy-language/progress";

const LANG_KEY = "spy_lang_current";

export default function SpyLanguage() {
  const [lang, setLang] = useState("en");
  const [progress, setProgress] = useState<LangProgress>({ passed: [], cards: {} });
  const [loaded, setLoaded] = useState(false);
  const [day, setDay] = useState(1);
  const [granted, setGranted] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY);
    const l = saved && SPY_LANGS.some((x) => x.code === saved) ? saved : "en";
    setLang(l);
    const p = loadProgress(l);
    setProgress(p);
    setDay(Math.min(30, (p.passed.length ? Math.max(...p.passed) : 0) + 1));
    setLoaded(true);
  }, []);

  useEffect(() => {
    const acc = getSavedAccess(SPY_META.track);
    if (acc) {
      setToken(acc.token);
      setGranted(true);
    }
  }, [granted]);

  const changeLang = (code: string) => {
    setLang(code);
    localStorage.setItem(LANG_KEY, code);
    const p = loadProgress(code);
    setProgress(p);
    setDay(Math.min(30, (p.passed.length ? Math.max(...p.passed) : 0) + 1));
  };

  const updateProgress = useCallback(
    (update: (p: LangProgress) => LangProgress) => {
      setProgress((prev) => {
        const next = update(prev);
        if (loaded) saveProgress(lang, next);
        return next;
      });
    },
    [lang, loaded],
  );

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const isOpen = (d: number) => {
    if (d > 1 && !granted) return false;
    return d === 1 || progress.passed.includes(d - 1) || progress.passed.includes(d);
  };

  const selectDay = (d: number) => {
    setDay(d);
    scrollTo("mission");
  };

  const langName = SPY_LANGS.find((l) => l.code === lang)?.name ?? "";
  const current = SPY_DAYS[day - 1];
  const dayLocked = !isOpen(day);
  const learned = progress.passed.filter((d) => d <= 28).length * 36;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs className="mb-5" items={[{ label: "Главная", href: "/" }, { label: "Язык за 30 дней" }]} />

        <section className="relative overflow-hidden rounded-3xl border border-amber-400/20 mb-14">
          <img src={SPY_META.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
          <div className="relative p-6 md:p-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 mb-4">
              <Icon name="FolderLock" size={14} className="text-amber-300" />
              <span className="text-amber-200 text-xs font-bold uppercase tracking-wide">{SPY_META.subtitle}</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">{SPY_META.title}</h1>
            <p className="text-white/80 text-lg mb-6">{SPY_META.promise}</p>
            <div className="flex flex-wrap gap-2 mb-7">
              {["30 дней по 40–60 минут", "1008 слов", "Зачёт каждый день", "8 языков"].map((t) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white/85 border border-white/15">{t}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => scrollTo("mission")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black px-7 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform"
              >
                <Icon name="Play" size={18} />
                День 1 — бесплатно
              </button>
              {!granted && (
                <button onClick={() => scrollTo("pricing")} className="text-white/80 hover:text-white font-semibold px-5 py-3.5 rounded-2xl border border-white/20">
                  Весь курс за {SPY_PRICE.toLocaleString("ru-RU")} ₽ <span className="line-through text-white/40 ml-1">{SPY_OLD_PRICE.toLocaleString("ru-RU")} ₽</span>
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <AccessBanner
            track={SPY_META.track}
            productName="курс"
            grantedText="Оплата прошла — все 30 дней и 8 языков открыты. Покупка сохранена в личном кабинете."
            onGranted={() => setGranted(true)}
          />
        </section>

        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">Как устроена методика</h2>
          <p className="text-white/60 mb-6 max-w-2xl">
            Принципы программ ускоренной языковой подготовки: только нужное, жёсткий ритм и ежедневный контроль.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {METHOD.map((m) => (
              <div key={m.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-11 h-11 rounded-xl bg-amber-400/15 flex items-center justify-center mb-3">
                  <Icon name={m.icon} size={20} className="text-amber-300" />
                </div>
                <h3 className="font-montserrat font-bold text-white text-base mb-1">{m.title}</h3>
                <p className="text-white/55 text-sm">{m.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="mission" className="mb-14 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
            <div>
              <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1">Программа: 30 дней</h2>
              <p className="text-white/60 text-sm">
                Пройдено дней: {progress.passed.length} из 30 · выучено слов: ~{learned}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SPY_LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                    l.code === lang ? "bg-amber-400 text-slate-900 border-amber-400" : "bg-white/5 text-white/75 border-white/10 hover:text-white"
                  }`}
                >
                  {l.flag} {l.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 mb-6 max-w-xl">
            {SPY_DAYS.map((d) => {
              const done = progress.passed.includes(d.day);
              const open = isOpen(d.day);
              const active = d.day === day;
              return (
                <button
                  key={d.day}
                  onClick={() => selectDay(d.day)}
                  title={d.title}
                  className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center border transition-colors ${
                    active
                      ? "border-amber-400 bg-amber-400/20 text-amber-100"
                      : done
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                        : open
                          ? "border-white/15 bg-white/[0.05] text-white"
                          : "border-white/5 bg-white/[0.02] text-white/30"
                  }`}
                >
                  {done ? <Icon name="Check" size={16} /> : open ? d.day : <Icon name="Lock" size={13} />}
                </button>
              );
            })}
          </div>

          {dayLocked ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <Icon name="Lock" size={30} className="text-amber-300 mx-auto mb-3" />
              <h3 className="font-montserrat font-black text-xl text-white mb-1">День {day}. {current.title}</h3>
              {!granted ? (
                <>
                  <p className="text-white/60 text-sm mb-5">
                    Этот день откроется после оплаты. Уже оплатили? Проверьте доступ по email выше или зайдите в личный кабинет.
                  </p>
                  <button onClick={() => scrollTo("pricing")} className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black px-6 py-3 rounded-xl">
                    <Icon name="CreditCard" size={16} /> Открыть все 30 дней
                  </button>
                </>
              ) : (
                <p className="text-white/60 text-sm">Сначала сдайте зачёт за день {day - 1} — без него следующий день не откроется.</p>
              )}
            </div>
          ) : (
            <DayLesson
              day={current}
              lang={lang}
              langName={langName}
              token={token}
              progress={progress}
              onProgress={updateProgress}
              onNextDay={() => selectDay(Math.min(30, day + 1))}
            />
          )}
        </section>

        {!granted && (
          <section id="pricing" className="mb-14 scroll-mt-20">
            <PayBlock />
          </section>
        )}

        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-6">Частые вопросы</h2>
          <div className="space-y-3 max-w-3xl">
            {SPY_FAQ.map((f, i) => (
              <div key={f.q} className="rounded-2xl border border-white/10 bg-white/[0.03]">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-montserrat font-bold text-white text-sm md:text-base">{f.q}</span>
                  <Icon name="ChevronDown" size={18} className={`text-white/50 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-4 text-white/65 text-sm leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
