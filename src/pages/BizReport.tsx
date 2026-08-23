import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import AccessBanner from "@/components/intensive/AccessBanner";
import ReportPayForm from "@/components/bizlab/report/ReportPayForm";
import {
  REPORT_FAQ,
  REPORT_PRICE,
  REPORT_SECTIONS,
  REPORT_TRACK,
} from "@/components/bizlab/report/reportContent";

const SITE_URL = "https://учисьпро.рф";

export default function BizReport() {
  const justPaid =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("paid") === "1";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "PDF-разбор бизнес-идеи с расчётом экономики",
      description:
        "Персональный отчёт по вашей бизнес-идее: юнит-экономика, точка безубыточности, стресс-тест, проверка кредита, риски и план на 90 дней. 10-12 страниц в PDF.",
      brand: { "@type": "Brand", name: "УЧИСЬПРО" },
      offers: {
        "@type": "Offer",
        price: REPORT_PRICE,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/biz-report`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: REPORT_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={`Разбор бизнес-идеи с расчётом экономики — PDF за ${REPORT_PRICE} ₽ | УЧИСЬПРО`}
        description="Персональный PDF-разбор бизнес-идеи: юнит-экономика, точка безубыточности, стресс-тест, проверка кредита и план на 90 дней. По вашим цифрам за 15 минут."
        canonical={`${SITE_URL}/biz-report`}
        keywords="разбор бизнес идеи, расчет юнит экономики, точка безубыточности расчет, бизнес план pdf, проверить бизнес идею, финансовая модель малого бизнеса"
        type="product"
        jsonLd={jsonLd}
      />

      {/* Шапка */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-lg">
              🏗️
            </div>
            <span className="font-montserrat font-black text-base text-white">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/bizlab"
            className="text-white/60 hover:text-white text-sm font-bold transition-colors"
          >
            Бесплатный тренажёр
          </Link>
        </div>
      </div>

      {/* Вернулся с оплаты — показываем доступ */}
      {justPaid && (
        <section className="max-w-5xl mx-auto px-4 pt-8">
          <AccessBanner
            track={REPORT_TRACK}
            productName="разбор"
            grantedText="Оплата прошла. Заполните тренажёр — и на последнем шаге скачайте готовый PDF-разбор. Доступ сохранён за вашим email."
          />
          <Link
            to="/bizlab"
            className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 font-black text-white shadow-lg hover:scale-[1.01] transition-transform"
          >
            <Icon name="ArrowRight" size={18} />
            Перейти к заполнению разбора
          </Link>
        </section>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-5">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Тренажёр бизнеса", href: "/bizlab" },
            { label: "PDF-разбор идеи" },
          ]}
        />
      </div>

      {/* Первый экран */}
      <section className="max-w-5xl mx-auto px-4 pt-6 pb-8">
        <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-300 mb-5">
              <Icon name="FileText" size={13} />
              Документ на 10-12 страниц · по вашим цифрам
            </span>

            <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
              Узнайте за 490 ₽, выживет ли ваш бизнес — до того как вложите сотни тысяч
            </h1>

            <p className="text-white/70 text-lg mb-6">
              Вы отвечаете на восемь групп вопросов о своей идее — цена, расходы, план продаж,
              кредит. На выходе получаете документ, где посчитано, сходится модель или нет,
              где она сломается и что чинить в первую очередь.
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
              <p className="text-white/80 text-sm leading-relaxed">
                <span className="font-bold text-white">Считаем честно, а не подбадриваем.</span>{" "}
                Разбор чаще показывает, что идея в нынешнем виде не сходится: слишком низкая
                маржа, нереальный план продаж, кредит, который потопит бизнес при первом спаде.
                Узнать это за 490 ₽ дешевле, чем за полгода работы и свои накопления.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
                <Icon name="Clock" size={13} className="inline mr-1.5" />
                15 минут на заполнение
              </span>
              <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
                <Icon name="Zap" size={13} className="inline mr-1.5" />
                Результат сразу, без ожидания
              </span>
              <span className="rounded-lg bg-white/8 px-3 py-2 text-white/70">
                <Icon name="Printer" size={13} className="inline mr-1.5" />
                Можно распечатать
              </span>
            </div>
          </div>

          {!justPaid && (
            <div className="md:sticky md:top-20">
              <ReportPayForm />
            </div>
          )}
        </div>
      </section>

      {/* Для кого */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="font-montserrat font-black text-2xl text-white mb-5">Вам это нужно, если</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: "Lightbulb",
              t: "Есть идея, но непонятно, взлетит ли",
              d: "В голове всё складывается, а на бумаге цифры никто не проверял.",
            },
            {
              icon: "Landmark",
              t: "Думаете взять кредит на запуск",
              d: "Посчитаем платёж и покажем, переживёт ли бизнес спад продаж вместе с ним.",
            },
            {
              icon: "Store",
              t: "Уже работаете, но денег не остаётся",
              d: "Найдём, где утекает маржа и сколько продаж нужно, чтобы просто выйти в ноль.",
            },
            {
              icon: "Handshake",
              t: "Нужно показать расчёт партнёру",
              d: "Готовый документ с цифрами убеждает лучше, чем разговор на словах.",
            },
          ].map((x, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <Icon name={x.icon} size={20} className="text-amber-300" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white mb-1">{x.t}</h3>
                <p className="text-white/60 text-sm">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Состав отчёта */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="font-montserrat font-black text-2xl text-white mb-2">
          Что внутри документа
        </h2>
        <p className="text-white/60 mb-6">
          Девять разделов, каждый посчитан по данным, которые вы ввели.
        </p>
        <div className="space-y-3">
          {REPORT_SECTIONS.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center shrink-0">
                <Icon name={s.icon} size={20} className="text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="font-bold text-white leading-snug">{s.title}</h3>
                  <span className="text-white/35 text-xs shrink-0 mt-0.5">{s.pages}</span>
                </div>
                <p className="text-white/60 text-sm">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Пример расчёта */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="font-montserrat font-black text-2xl text-white mb-2">
            Как это выглядит на реальном примере
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Кофейня у метро: чашка 250 ₽, себестоимость 73 ₽, аренда 80 000 ₽, кредит 500 000 ₽
            под 25% на два года.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
            {[
              { l: "Прибыль в месяц", v: "122 925 ₽", n: "при плане 3 300 продаж", ok: true },
              { l: "Точка безубыточности", v: "2 473 шт", n: "82 продажи в день", ok: true },
              { l: "При падении на 40%", v: "−73 319 ₽", n: "убыток каждый месяц", ok: false },
              { l: "Подушки хватит на", v: "0,8 мес", n: "нужно минимум 6", ok: false },
            ].map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-4 ${
                  m.ok
                    ? "border-emerald-500/25 bg-emerald-500/[0.07]"
                    : "border-rose-500/25 bg-rose-500/[0.07]"
                }`}
              >
                <div className="text-white/45 text-[11px] uppercase tracking-wide mb-1">{m.l}</div>
                <div
                  className={`font-montserrat font-black text-xl mb-0.5 ${
                    m.ok ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {m.v}
                </div>
                <div className="text-white/40 text-xs">{m.n}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Quote" size={16} className="text-amber-300" />
              <span className="font-montserrat font-bold text-white text-sm">
                Вывод из отчёта
              </span>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">
              На бумаге бизнес прибыльный — 122 925 ₽ в месяц. Но подушки хватает на три недели,
              а при обычном для первого года спаде продаж владелец уходит в минус 73 319 ₽ ежемесячно,
              продолжая платить по кредиту. Вывод отчёта: кредит в этой модели брать не стоит,
              сначала нужен резерв на шесть месяцев работы.
            </p>
          </div>
        </div>
      </section>

      {/* Как проходит */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="font-montserrat font-black text-2xl text-white mb-5">Как это работает</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "Оплачиваете 490 ₽",
              d: "Картой или через СБП. Нужен только email — на него придёт чек и доступ.",
            },
            {
              n: "2",
              t: "Отвечаете на вопросы",
              d: "Восемь шагов про вашу идею и цифры, примерно 15 минут. Расчёт обновляется на глазах.",
            },
            {
              n: "3",
              t: "Скачиваете документ",
              d: "Готовый PDF сразу, без ожидания. Сохраняете, печатаете, показываете партнёру.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-montserrat font-black text-white mb-3">
                {s.n}
              </div>
              <h3 className="font-bold text-white mb-1.5">{s.t}</h3>
              <p className="text-white/60 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Вопросы */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="font-montserrat font-black text-2xl text-white mb-5">Частые вопросы</h2>
        <div className="space-y-3">
          {REPORT_FAQ.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                <span className="font-bold text-white">{f.q}</span>
                <Icon
                  name="ChevronDown"
                  size={18}
                  className="text-white/40 shrink-0 group-open:rotate-180 transition-transform"
                />
              </summary>
              <p className="text-white/65 text-sm mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Финальный блок оплаты */}
      {!justPaid && (
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-center">
            <div>
              <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-3">
                490 ₽ против сотен тысяч на ошибке
              </h2>
              <p className="text-white/70 mb-4">
                Средний неудачный запуск малого бизнеса стоит владельцу от 300 тысяч рублей и
                полугода жизни. Разбор занимает 15 минут и стоит как две чашки кофе.
              </p>
              <p className="text-white/50 text-sm">
                Не готовы платить — посчитайте базовые цифры в{" "}
                <Link to="/bizlab" className="text-amber-300 hover:text-amber-200 underline">
                  бесплатном тренажёре
                </Link>
                . Разбор нужен, когда результат хочется сохранить и показать другим.
              </p>
            </div>
            <ReportPayForm />
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}