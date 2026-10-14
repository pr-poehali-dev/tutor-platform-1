import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import ReadingTest from "@/components/marathon/ReadingTest";
import { NORMS } from "@/components/marathon/readingTexts";
import { TEACHER_PROGRAM } from "@/components/marathon/teacherProgram";
import { PARENT_PROGRAM } from "@/components/marathon/parentProgram";

const URL = "https://учисьпро.рф/test-skorosti-chteniya";

const FAQ = [
  { q: "Как проверить скорость чтения ребёнка?", a: "Дайте незнакомый текст по возрасту, засеките одну минуту и посчитайте прочитанные слова. Затем задайте 2–3 вопроса по содержанию, чтобы проверить понимание. Наш тест делает это автоматически." },
  { q: "Какая норма скорости чтения во 2 классе?", a: "Распространённый ориентир для чтения вслух к концу 2 класса — 55–65 слов в минуту. Нормы различаются в разных методиках, поэтому важнее следить за динамикой ребёнка." },
  { q: "Что важнее — скорость или понимание?", a: "Понимание. Быстрое чтение без понимания бесполезно. Хороший результат — когда ребёнок читает в своём темпе и правильно отвечает хотя бы на 70% вопросов." },
  { q: "Как увеличить скорость чтения?", a: "Короткими ежедневными занятиями по 10–15 минут: таблицы Шульте, упражнения на поле зрения, чтение по очереди со взрослым и книги по интересам. Всё это есть в бесплатном марафоне." },
];

export default function ReadingSpeedTest() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Тест скорости чтения онлайн",
      url: URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Тест скорости чтения онлайн для детей и взрослых"
        description="Бесплатный тест скорости чтения: слова в минуту, понимание текста и сравнение с нормой для 1–4 класса. Тексты для детей и взрослых, результат за 2 минуты."
        keywords="тест скорости чтения, проверить скорость чтения онлайн, техника чтения норма, скорость чтения 2 класс, сколько слов в минуту читает ребенок"
        canonical={URL}
        jsonLd={jsonLd}
      />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs className="mb-6" items={[{ label: "Главная", href: "/" }, { label: "Тест скорости чтения" }]} />

        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
          Тест скорости <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">чтения онлайн</span>
        </h1>
        <p className="text-white/70 text-base md:text-lg mb-8 max-w-2xl">
          Узнайте, сколько слов в минуту читает ребёнок или вы сами, и насколько хорошо понят текст. Бесплатно, без регистрации, за 2 минуты.
        </p>

        <ReadingTest />

        <section className="mt-12">
          <h2 className="font-montserrat font-black text-2xl mb-4">Ориентиры скорости чтения</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.05] text-white/60">
                <tr><th className="text-left px-4 py-3 font-semibold">Кто читает</th><th className="text-left px-4 py-3 font-semibold">Слов в минуту</th></tr>
              </thead>
              <tbody>
                {Object.values(NORMS).map((n) => (
                  <tr key={n.label} className="border-t border-white/5">
                    <td className="px-4 py-3 text-white/85">{n.label}</td>
                    <td className="px-4 py-3 text-white font-bold">{n.min}–{n.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-white/45 text-xs mt-2">Для детей — ориентиры чтения вслух на конец учебного года по распространённым методическим нормам. Они различаются в разных программах.</p>
        </section>

        <section className="mt-12 grid md:grid-cols-2 gap-4">
          {[PARENT_PROGRAM, TEACHER_PROGRAM].map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="group rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/15 to-cyan-600/10 p-6 hover:border-violet-400/50 transition-colors">
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">{p.badge}</span>
              <h3 className="font-montserrat font-black text-white text-xl mt-2 mb-2">{p.track === "parent" ? "Для родителей" : "Для педагогов"}: {p.title}</h3>
              <p className="text-white/60 text-sm mb-4">{p.seo.description}</p>
              <span className="inline-flex items-center gap-1.5 text-cyan-300 font-bold text-sm group-hover:gap-2.5 transition-all">
                Участвовать бесплатно <Icon name="ArrowRight" size={15} />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-montserrat font-black text-2xl mb-4">Частые вопросы</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-bold text-white">
                  {f.q}
                  <Icon name="ChevronDown" size={18} className="text-white/50 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-white/65 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
