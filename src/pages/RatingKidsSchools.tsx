import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import SchoolCard from "@/components/rating/SchoolCard";
import SchoolPicker from "@/components/rating/SchoolPicker";
import CompareTable from "@/components/rating/CompareTable";
import { KIDS_FAQ, KIDS_SCHOOLS } from "@/components/rating/kidsSchools";
import { RATING_SOURCE, RATING_UPDATED } from "@/components/rating/schools";

const SITE_URL = "https://учисьпро.рф";
const PATH = "/reyting-onlayn-shkol-dlya-shkolnikov";
const TITLE = "Лучшие онлайн-школы для школьников 2026: рейтинг и подбор за 1 минуту";

const QUICK = [
  { icon: "FileCheck", title: "ОГЭ и ЕГЭ", names: "Умскул, 100балльный репетитор, Вебиум" },
  { icon: "Trophy", title: "Олимпиады", names: "Фоксфорд" },
  { icon: "House", title: "Домашнее обучение", names: "Фоксфорд, ИнтернетУрок" },
  { icon: "User", title: "Репетитор один на один", names: "Тетрика, Skysmart" },
  { icon: "Gamepad2", title: "Младшие классы", names: "Учи.ру, ЯКласс" },
  { icon: "Wallet", title: "Все предметы недорого", names: "УЧИСЬПРО, ЯКласс" },
];

export default function RatingKidsSchools() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: TITLE,
      numberOfItems: KIDS_SCHOOLS.length,
      itemListElement: KIDS_SCHOOLS.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `${SITE_URL}${PATH}#${s.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: KIDS_FAQ.map((f) => ({
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
        description="Топ-10 онлайн-школ для детей 1–11 класса и подготовки к ОГЭ и ЕГЭ: Фоксфорд, Учи.ру, Умскул, Skysmart, Тетрика и другие. Сравнение, плюсы и минусы, подбор школы под класс, цель и бюджет."
        canonical={`${SITE_URL}${PATH}`}
        keywords="лучшие онлайн школы для детей, рейтинг онлайн школ для школьников, онлайн школа для подготовки к егэ, какую онлайн школу выбрать ребенку, онлайн школа огэ, онлайн школа отзывы, фоксфорд или умскул"
        jsonLd={jsonLd}
      />

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-bold">У</span>
            <span className="text-lg font-bold tracking-tight">УЧИСЬПРО</span>
          </Link>
          <Link to="/reyting-onlayn-shkol" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
            Общий рейтинг
            <Icon name="ArrowRight" size={15} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Рейтинг онлайн-школ", href: "/reyting-onlayn-shkol" },
            { label: "Для школьников" },
          ]}
        />

        <section className="mb-8 mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Icon name="Trophy" size={13} />
            Обновлено: {RATING_UPDATED}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
            Лучшие онлайн-школы <span className="gradient-text-purple">для школьников</span> 2026
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/70 sm:text-lg">
            10 школ для 1–11 класса и подготовки к ОГЭ и ЕГЭ: честные плюсы и минусы, сравнение по главным параметрам и подбор
            под вашего ребёнка за 4 вопроса.
          </p>
        </section>

        <section className="mb-10">
          <SchoolPicker />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold">Коротко: что выбрать</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK.map((q) => (
              <div key={q.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="flex items-center gap-2 font-semibold">
                  <Icon name={q.icon} size={18} className="text-primary" />
                  {q.title}
                </p>
                <p className="mt-1 text-sm text-white/65">{q.names}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-1 text-2xl font-bold">Сравнение школ</h2>
          <p className="mb-4 text-sm text-white/60">Отметьте, что важно, — неподходящие школы станут бледными.</p>
          <CompareTable />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Рейтинг: плюсы и минусы</h2>
          <div className="space-y-5">
            {KIDS_SCHOOLS.map((s, i) => (
              <SchoolCard key={s.slug} school={s} place={i + 1} />
            ))}
          </div>
        </section>

        <p className="mt-6 text-xs text-white/40">
          Порядок: сначала школы из топ-10 EdTech-компаний по выручке за 2025 год (
          <a href={RATING_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">
            данные Smart Ranking
          </a>
          ) — от крупной к меньшей, затем известные школы без публичных данных о выручке, УЧИСЬПРО — последней. Плюсы и минусы —
          обобщение открытой информации, а не реклама. Перед оплатой проверяйте цены и условия на сайте школы.
        </p>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Частые вопросы родителей</h2>
          <div className="space-y-3">
            {KIDS_FAQ.map((f) => (
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
            Первый урок по каждому предмету, проверка домашки по фото и больше 30 мини-курсов — без оплаты. Можно совмещать с любой
            школой из рейтинга: ИИ-наставник поможет с домашкой в 11 вечера, когда репетитора уже не позвать.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/tutor" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90">
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
