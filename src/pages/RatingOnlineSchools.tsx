import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import SchoolCard from "@/components/rating/SchoolCard";
import { CRITERIA, FAQ, RATING_SOURCE, RATING_UPDATED, SCHOOLS } from "@/components/rating/schools";

const SITE_URL = "https://учисьпро.рф";
const PATH = "/reyting-onlayn-shkol";
const TITLE = "Рейтинг онлайн-школ 2026: топ-10 с плюсами и минусами";

export default function RatingOnlineSchools() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: TITLE,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: SCHOOLS.length,
      itemListElement: SCHOOLS.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `${SITE_URL}${PATH}#${s.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={TITLE}
        description="Топ-10 онлайн-школ России по выручке за 2025 год: Синергия, Skillbox, Skyeng, Яндекс Практикум, Учи.ру, Фоксфорд, Умскул и другие. Честные плюсы и минусы, кому какая школа подходит."
        canonical={`${SITE_URL}${PATH}`}
        keywords="рейтинг онлайн школ, лучшие онлайн школы 2026, топ онлайн школ россии, онлайн школы плюсы и минусы, какую онлайн школу выбрать, онлайн школа для школьников, подготовка к егэ онлайн"
        jsonLd={jsonLd}
      />

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-bold">У</span>
            <span className="text-lg font-bold tracking-tight">УЧИСЬПРО</span>
          </Link>
          <Link to="/pricing" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
            Тарифы
            <Icon name="ArrowRight" size={15} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Рейтинг онлайн-школ" }]} />

        <section className="mb-10 mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Icon name="Trophy" size={13} />
            Обновлено: {RATING_UPDATED}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
            Рейтинг онлайн-школ 2026: <span className="gradient-text-purple">топ-10</span>
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/70 sm:text-lg">
            Крупнейшие онлайн-школы России для детей и взрослых — по размеру выручки, с честными плюсами и минусами каждой.
            Мы добавили в список и нашу платформу УЧИСЬПРО: она стоит на своём месте, со своими слабыми сторонами.
          </p>
        </section>

        <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CRITERIA.map((c) => (
            <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Icon name={c.icon} size={20} className="text-primary" />
              <p className="mt-2 font-semibold">{c.title}</p>
              <p className="mt-1 text-sm text-white/60">{c.text}</p>
            </div>
          ))}
        </section>

        <section className="mb-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs text-white/50">
                <th className="p-3">#</th>
                <th className="p-3">Школа</th>
                <th className="p-3">Для кого</th>
                <th className="p-3 text-right">Выручка 2025</th>
                <th className="p-3 text-right">За год</th>
              </tr>
            </thead>
            <tbody>
              {SCHOOLS.map((s, i) => (
                <tr key={s.slug} className={`border-t border-white/5 ${s.own ? "bg-primary/10" : ""}`}>
                  <td className="p-3 text-white/50">{i + 1}</td>
                  <td className="p-3 font-semibold">
                    <a href={`#${s.slug}`} className="hover:text-primary">{s.name}</a>
                  </td>
                  <td className="p-3 text-white/70">{s.segment}</td>
                  <td className="p-3 text-right">{s.revenue ?? "—"}</td>
                  <td className="p-3 text-right text-emerald-300">{s.growth ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-5">
          {SCHOOLS.map((s, i) => (
            <SchoolCard key={s.slug} school={s} place={i + 1} />
          ))}
        </section>

        <p className="mt-6 text-xs text-white/40">
          Выручка — по данным{" "}
          <a href={RATING_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">
            {RATING_SOURCE.name}
          </a>
          . Из топ-10 рейтинга мы исключили GetCourse: это платформа для создания курсов, а не онлайн-школа. Плюсы и минусы —
          обобщение открытой информации и отзывов, а не реклама. Перед оплатой проверяйте актуальные цены и условия на сайте школы.
        </p>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Частые вопросы</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {f.q}
                  <Icon name="ChevronDown" size={18} className="shrink-0 text-white/50 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-white/70">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-primary/30 bg-primary/10 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Попробуйте УЧИСЬПРО бесплатно</h2>
          <p className="mt-2 max-w-2xl text-white/70">
            Первый урок по каждому предмету, проверка домашнего задания по фото и больше 30 мини-курсов — без оплаты и без подписки.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/courses" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90">
              Начать бесплатно
            </Link>
            <Link to="/pricing" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10">
              Тарифы
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
