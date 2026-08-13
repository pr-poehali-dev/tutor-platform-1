import { Link, Navigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { KIDS_TOPICS, getKidsTopic } from "@/components/kids/kidsTopicData";
import { AGES } from "@/components/kids/kidsData";

const SITE_URL = "https://учисьпро.рф";

/**
 * Страница-ответ на конкретный родительский запрос («ребёнок не говорит в 2 года»).
 *
 * Сначала даёт пользу — нормы, шаги, признаки тревоги, — и лишь затем
 * предлагает занятия. Такой порядок удерживает человека на странице,
 * а поиск это учитывает при ранжировании.
 */
export default function KidsTopic() {
  const { topic = "" } = useParams();
  const data = getKidsTopic(topic);

  if (!data) return <Navigate to="/kids" replace />;

  const canonical = `${SITE_URL}/kids/vopros/${data.slug}`;
  const age = AGES.find((a) => a.slug === data.ageSlug);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.h1,
      description: data.description,
      url: canonical,
      inLanguage: "ru-RU",
      articleSection: "Развитие детей",
      author: {
        "@type": "Organization",
        name: "УЧИСЬПРО Малыш",
        url: `${SITE_URL}/kids`,
      },
      publisher: {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: "УЧИСЬПРО",
        url: SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: data.h1,
      description: data.lead,
      step: data.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.text,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={data.title}
        description={data.description}
        canonical={canonical}
        keywords={data.keywords}
        jsonLd={jsonLd}
      />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Малыш", href: "/kids" },
            { label: data.h1 },
          ]}
        />
      </div>

      <article className="max-w-4xl mx-auto px-4 pt-6 pb-12">
        <span className="inline-flex items-center gap-2 bg-pink-500/15 border border-pink-400/30 rounded-full px-4 py-1.5 text-pink-200 text-xs font-bold uppercase tracking-wider">
          <span>{data.emoji}</span>
          {data.ageLabel}
        </span>

        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.08] mt-5">
          {data.h1}
        </h1>

        <p className="text-white/75 text-lg leading-relaxed mt-5">{data.lead}</p>
      </article>

      <section className="max-w-4xl mx-auto px-4 pb-14">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Что считается нормой</h2>
        <div className="space-y-3">
          {data.norms.map((n) => (
            <div
              key={n.label}
              className="bg-card border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5"
            >
              <span className="font-montserrat font-black text-pink-300 text-base whitespace-nowrap sm:w-28 flex-shrink-0">
                {n.label}
              </span>
              <span className="text-white/70 text-sm leading-relaxed">{n.text}</span>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs mt-4 leading-relaxed">
          Нормы усреднённые: дети развиваются в своём темпе, отклонение в пару месяцев —
          не повод для тревоги.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-14">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Что делать дома</h2>
        <div className="space-y-3">
          {data.steps.map((s, i) => (
            <div key={s.title} className="bg-card border border-white/10 rounded-3xl p-5 flex gap-4">
              <div className="w-11 h-11 rounded-2xl bg-pink-500/15 border border-pink-400/25 flex items-center justify-center flex-shrink-0">
                <Icon name={s.icon} size={20} className="text-pink-300" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white mb-1.5">
                  <span className="text-white/35 mr-2">{i + 1}.</span>
                  {s.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {data.warning && (
        <section className="max-w-4xl mx-auto px-4 pb-14">
          <div className="bg-amber-500/8 border border-amber-500/30 rounded-3xl p-6">
            <h2 className="font-montserrat font-black text-xl text-amber-200 flex items-center gap-2.5 mb-4">
              <Icon name="TriangleAlert" size={20} className="text-amber-400 flex-shrink-0" />
              {data.warning.title}
            </h2>
            <ul className="space-y-2.5">
              {data.warning.items.map((w) => (
                <li key={w} className="flex items-start gap-2.5 text-white/75 text-sm leading-relaxed">
                  <Icon name="Dot" size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
            <p className="text-white/50 text-xs mt-4 leading-relaxed">
              Это не диагноз, а повод показать ребёнка специалисту. Материал носит
              справочный характер и не заменяет консультацию врача или логопеда.
            </p>
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="bg-gradient-to-br from-pink-500/12 to-fuchsia-500/12 border border-pink-400/25 rounded-3xl p-6 md:p-8">
          <h2 className="font-montserrat font-black text-2xl text-white mb-3">
            Занятия для возраста {data.ageLabel}
          </h2>
          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
            {age?.description ||
              "Короткие занятия голосом: речь, логика, моторика и окружающий мир. Без рекламы, с контролем экранного времени."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/kids/${data.ageSlug}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:opacity-90 transition-opacity rounded-2xl px-6 py-3.5 font-bold text-white"
            >
              <Icon name="Play" size={18} />
              Открыть занятия
            </Link>
            <Link
              to="/kids/test"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 transition-colors rounded-2xl px-6 py-3.5 font-bold text-white"
            >
              <Icon name="Stethoscope" size={18} />
              Бесплатная диагностика
            </Link>
          </div>
          <p className="text-white/45 text-sm mt-4">
            Бесплатно · 2 минуты · персональный план занятий
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-14">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Частые вопросы</h2>
        <div className="space-y-3">
          {data.faq.map((f) => (
            <details key={f.q} className="bg-card border border-white/10 rounded-2xl p-5 group">
              <summary className="font-bold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                {f.q}
                <Icon
                  name="ChevronDown"
                  size={18}
                  className="text-white/40 flex-shrink-0 mt-0.5 group-open:rotate-180 transition-transform"
                />
              </summary>
              <p className="text-white/65 text-sm leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16 space-y-6">
        {KIDS_TOPICS.length > 1 && (
          <div>
            <h2 className="font-montserrat font-black text-xl mb-4">Другие вопросы родителей</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {KIDS_TOPICS.filter((t) => t.slug !== data.slug).map((t) => (
                <Link
                  key={t.slug}
                  to={`/kids/vopros/${t.slug}`}
                  className="bg-card border border-white/10 hover:border-pink-400/40 transition-colors rounded-2xl p-4 flex items-center gap-3"
                >
                  <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                  <span className="font-semibold text-white text-sm leading-snug">{t.h1}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-montserrat font-black text-xl mb-4">Занятия по возрастам</h2>
          <div className="flex flex-wrap gap-2.5">
            {AGES.map((a) => (
              <Link
                key={a.slug}
                to={`/kids/${a.slug}`}
                className="bg-white/8 hover:bg-white/12 border border-white/12 transition-colors rounded-2xl px-4 py-2 text-white/85 text-sm font-semibold"
              >
                {a.emoji} {a.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
