import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import {
  isPromoActive, timeLeft, formatEndDate, PROMO_CODE,
} from "@/components/promo/dobroConfig";

const SITE = "https://xn--h1agdcde2c.xn--p1ai";

export default function PromoDobro() {
  const [active, setActive] = useState(false);
  const [tl, setTl] = useState(() => timeLeft());

  useEffect(() => {
    setActive(isPromoActive());
    const t = setInterval(() => setTl(timeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Акция ДОБРО — учись бесплатно до 15 июня 2026 · УЧИСЬПРО"
        description="С 28 мая по 15 июня 2026 платежи на паузе. Полный доступ ко всем курсам, ИИ-репетитору и подготовке к ЕГЭ — бесплатно для каждого школьника."
        canonical={`${SITE}/promo/dobro`}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-lg">❤️</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Акция ДОБРО" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">

        {/* HERO */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 rounded-full px-4 py-1.5 mb-4">
            <span className="text-base">❤️</span>
            <span className="text-rose-200 font-bold text-[11px] uppercase tracking-widest">
              Акция «{PROMO_CODE}» · только до {formatEndDate()}
            </span>
          </div>

          <h1 className="font-montserrat font-black text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-4">
            Учись <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">бесплатно</span><br />
            до 15 июня 2026
          </h1>
          <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
            Мы поставили все платежи на паузу. Каждый школьник России может пройти любой курс УЧИСЬПРО — <strong>без карты, без подписки, без ограничений</strong>.
          </p>

          {/* Обратный отсчёт */}
          {active && !tl.expired && (
            <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-lg mx-auto mb-6">
              {[
                { v: tl.days, l: "дней" },
                { v: tl.hours, l: "часов" },
                { v: tl.minutes, l: "минут" },
                { v: tl.seconds, l: "секунд" },
              ].map((b) => (
                <div key={b.l} className="bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-white/15 rounded-2xl p-3 text-center">
                  <p className="font-montserrat font-black text-white text-3xl md:text-5xl tabular-nums leading-none">
                    {String(b.v).padStart(2, "0")}
                  </p>
                  <p className="text-white/65 text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">{b.l}</p>
                </div>
              ))}
            </div>
          )}

          {tl.expired && (
            <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 max-w-lg mx-auto mb-6">
              <p className="text-white font-bold">Акция завершена. Спасибо всем, кто присоединился ❤️</p>
            </div>
          )}

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-base md:text-lg px-7 py-4 rounded-2xl hover:scale-[1.03] transition-transform shadow-2xl shadow-rose-500/40"
          >
            <Icon name="Rocket" size={18} />
            Начать учиться прямо сейчас
          </Link>
        </section>

        {/* ЧТО ВКЛЮЧЕНО */}
        <section className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-6">
          <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-5">
            Что доступно бесплатно
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { emoji: "🎒", title: "Все курсы 1–11 классов", desc: "Математика, физика, химия, биология, русский, английский, история, обществознание" },
              { emoji: "🤖", title: "ИИ-репетитор 24/7", desc: "Голосовое и текстовое общение, разбор любых задач за секунды" },
              { emoji: "🎓", title: "Подготовка к ЕГЭ и ОГЭ", desc: "Банк заданий ФИПИ, разборы, чек-лист «До экзамена»" },
              { emoji: "🪞", title: "Профориентация «Познай себя»", desc: "Тест на 30 минут — узнай, какая профессия твоя" },
              { emoji: "👶", title: "Малыш 1+", desc: "Развивающие занятия для дошкольников" },
              { emoji: "📡", title: "Лента новостей и грантов", desc: "Конкурсы, олимпиады, стипендии — всё про возможности" },
            ].map((p) => (
              <div key={p.title} className="flex items-start gap-3 p-3 bg-white/[0.04] rounded-2xl border border-white/8">
                <div className="text-3xl flex-shrink-0">{p.emoji}</div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm md:text-base">{p.title}</p>
                  <p className="text-white/65 text-xs md:text-sm leading-snug">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* КАК ВОСПОЛЬЗОВАТЬСЯ */}
        <section className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-3xl p-6 md:p-8 mb-6">
          <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-5">
            Как воспользоваться — 3 шага
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { n: "1", title: "Зарегистрируйся", desc: "Нужны только имя и email — займёт 30 секунд" },
              { n: "2", title: "Открой любой курс", desc: "Карта оплаты не нужна, доступ открывается автоматически" },
              { n: "3", title: "Учись до 15 июня", desc: "Прогресс сохранится — потом сможешь продолжить" },
            ].map((s) => (
              <div key={s.n} className="bg-white/[0.04] rounded-2xl p-4 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg mb-2">
                  {s.n}
                </div>
                <p className="font-bold text-white text-sm mb-1">{s.title}</p>
                <p className="text-white/65 text-xs leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ВОПРОСЫ */}
        <section className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-6">
          <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl mb-5">
            Частые вопросы
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Это правда бесплатно? В чём подвох?",
                a: "Подвоха нет. Мы хотим, чтобы как можно больше школьников успели подготовиться к концу года и попробовать ИИ-репетитора. После 15 июня платные тарифы вернутся, но прогресс сохранится — продолжишь с того же места.",
              },
              {
                q: "Карту вводить нужно?",
                a: "Нет. Все платёжные кнопки отключены до 15 июня — даже если очень захочешь, заплатить будет невозможно.",
              },
              {
                q: "Что будет с моим прогрессом после 15 июня?",
                a: "Весь прогресс, баллы, бейджи и портфолио сохранятся. После окончания акции часть материалов станет платной, но всё, что ты уже изучил — останется доступно.",
              },
              {
                q: "А если я уже оплачивал подписку раньше?",
                a: "Мы автоматически продлим твою подписку на 18 дней — на срок действия акции. Никаких заявок писать не нужно.",
              },
              {
                q: "Сколько друзей можно позвать?",
                a: "Сколько угодно. Поделись ссылкой /promo/dobro — пусть весь класс учится вместе.",
              },
            ].map((f, i) => (
              <details key={i} className="group bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-4 hover:bg-white/[0.04]">
                  <span className="font-bold text-white text-sm md:text-base">{f.q}</span>
                  <Icon name="ChevronDown" size={16} className="text-white/55 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 pt-0 text-white/75 text-sm leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ПОДЕЛИТЬСЯ */}
        <section className="bg-gradient-to-br from-purple-500/15 to-cyan-500/15 border border-purple-500/30 rounded-3xl p-6 text-center">
          <div className="text-4xl mb-2">📣</div>
          <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-2">
            Расскажи друзьям
          </h2>
          <p className="text-white/65 text-sm mb-4 max-w-md mx-auto">
            Чем больше школьников успеют попробовать — тем лучше. Поделись акцией с одноклассниками и родителями.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(SITE + "/promo/dobro")}&text=${encodeURIComponent("Акция ДОБРО на УЧИСЬПРО — все курсы и ИИ-репетитор бесплатно до 15 июня 2026")}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-[#229ED9] hover:bg-[#1b88bb] text-white font-bold text-sm px-5 py-2.5 rounded-xl"
            >
              Telegram
            </a>
            <a
              href={`https://vk.com/share.php?url=${encodeURIComponent(SITE + "/promo/dobro")}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-[#0077FF] hover:bg-[#0066dd] text-white font-bold text-sm px-5 py-2.5 rounded-xl"
            >
              ВКонтакте
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Акция ДОБРО на УЧИСЬПРО — все курсы бесплатно до 15 июня: " + SITE + "/promo/dobro")}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl"
            >
              WhatsApp
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
