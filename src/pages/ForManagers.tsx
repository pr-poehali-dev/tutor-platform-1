import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import ArticleCard from "@/components/feed/ArticleCard";
import { fetchArticle } from "@/components/feed/api";
import { FeedArticle } from "@/components/feed/types";
import { MINI_COURSES } from "@/components/minicourse/registry";

const SITE_URL = "https://учисьпро.рф";

/** Разборы для руководителей. Порядок задаёт логику чтения:
 *  сначала диагностика проблем, потом методология, потом деньги. */
const ARTICLE_SLUGS = [
  "ya-dumal-eto-delaet-petrov-pochemu-zadachi-provisayut",
  "razgovor-kotoryy-otkladyvayut-polgoda-i-nayem-po-oshchushcheniyu",
  "kak-my-delaem-kursy-metodologiya-uchispro",
  "ot-idei-do-prezentacii-razbor-biznes-proekta-na-realnyh-cifrah",
];

/** Курсы линейки — те же, что на /instrumenty-rukovoditelya. */
const COURSE_SLUGS = [
  "matrica-otvetstvennosti",
  "postanovka-zadach",
  "razgovor-o-rezultatah",
  "reglament-nayma",
];

/** Инструменты, которые считают, а не учат. */
const TOOLS = [
  {
    to: "/bizlab",
    icon: "Calculator",
    title: "Тренажёр «Бизнес 2026»",
    text: "Восемь этапов планирования на ваших цифрах: юнит-экономика, точка безубыточности и стресс-тест на падение продаж на 40%.",
    badge: "Бесплатно",
  },
  {
    to: "/business-coach",
    icon: "Compass",
    title: "Бизнес-тренер и коуч",
    text: "Чек-лист собирает индивидуальную программу развития и пятилетнюю стратегию под вашу стадию бизнеса. Программу видно бесплатно.",
    badge: "Программа бесплатно",
  },
  {
    to: "/orchestrator",
    icon: "Network",
    title: "Оркестратор команд",
    text: "Трек адаптации исполнителя: матрица навыков, входной контроль, онбординг по дням и микрозадачи с критериями «готово».",
    badge: "Генерация бесплатно",
  },
  {
    to: "/business-2026",
    icon: "Map",
    title: "Бизнес 2026 по городам",
    text: "Аналитические записки по 16 городам-миллионникам: где рынок растёт, где сжимается и какие ниши свободны.",
    badge: "16 городов",
  },
];

export default function ForManagers() {
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const courses = COURSE_SLUGS.map((s) =>
    MINI_COURSES.find((c) => c.slug === s),
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

  const totalMinutes = courses.reduce((sum, c) => sum + c.minutes, 0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await Promise.all(
        ARTICLE_SLUGS.map((s) => fetchArticle(s).catch(() => null)),
      );
      if (!alive) return;
      const found = res
        .map((r) => r?.item)
        .filter((a): a is FeedArticle => Boolean(a));
      setArticles(found);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const canonical = `${SITE_URL}/for-managers`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Руководителю — разборы, курсы и инструменты",
      description:
        "Подборка материалов для руководителей и собственников: разборы управленческих ошибок, бесплатные мини-курсы с шаблонами и инструменты расчёта бизнес-модели.",
      url: canonical,
      inLanguage: "ru-RU",
      isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Разборы для руководителей",
      itemListElement: ARTICLE_SLUGS.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/feed/${s}`,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title="Руководителю: разборы, бесплатные курсы и инструменты расчёта"
        description="Подборка для руководителей и собственников: разборы управленческих ошибок, четыре бесплатных мини-курса с готовыми шаблонами и тренажёр для расчёта бизнес-модели."
        canonical={canonical}
        keywords="материалы для руководителей, управление командой, делегирование, обратная связь сотруднику, найм, бизнес-план расчёт, курсы для руководителей бесплатно"
        image="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/e1a973e8-5786-4f2a-b47a-78a24f9853bf.jpg"
        jsonLd={jsonLd}
      />

      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6">
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Руководителю" }]}
        />
      </div>

      {/* Первый экран */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-12">
        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/12 border border-cyan-500/25 px-3 py-1.5 rounded-full mb-5">
          <Icon name="Briefcase" size={13} />
          Для руководителей и собственников
        </span>

        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-5 max-w-4xl">
          Управление без{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            общих слов
          </span>
        </h1>

        <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
          Разборы реальных управленческих ошибок, курсы, с которых вы уносите
          заполненный шаблон, и инструменты, которые считают вашу модель на ваших
          цифрах. Ничего мотивационного.
        </p>

        <div className="flex flex-wrap gap-3">
          {[
            { icon: "FileText", label: `${ARTICLE_SLUGS.length} подробных разбора` },
            { icon: "GraduationCap", label: `${courses.length} курса за ${totalMinutes} минут` },
            { icon: "Download", label: "12 готовых шаблонов" },
            { icon: "Gift", label: "Всё бесплатно" },
          ].map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-2 text-sm text-white/70 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl"
            >
              <Icon name={s.icon} size={15} className="text-cyan-400" />
              {s.label}
            </span>
          ))}
        </div>
      </section>

      {/* Разборы */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-14">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
          Разборы
        </h2>
        <p className="text-white/60 mb-7 max-w-2xl">
          Читаются по порядку: сначала про то, что ломается в управлении, потом
          про то, как мы строим обучение, и в конце — полный расчёт бизнес-проекта.
        </p>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : articles.length ? (
          <div className="grid md:grid-cols-2 gap-5">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <p className="text-white/60 mb-3">
              Разборы сейчас недоступны — откройте их в Ленте.
            </p>
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 text-cyan-400 font-bold"
            >
              Перейти в Ленту
              <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* Курсы */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-14">
        <div className="rounded-3xl bg-gradient-to-br from-violet-600/15 to-cyan-500/10 border border-white/10 p-6 md:p-9">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
            Курсы с готовыми шаблонами
          </h2>
          <p className="text-white/65 mb-7 max-w-2xl">
            Четыре мини-курса по 7–9 минут на урок. С каждого вы уносите не
            конспект, а заполненный документ: матрицу ответственности, сценарий
            разговора, профиль должности.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-7">
            {courses.map((c) => (
              <Link
                key={c.slug}
                to={`/mini-course/${c.slug}`}
                className="group rounded-2xl bg-black/25 border border-white/10 hover:border-cyan-400/40 p-5 transition-colors"
              >
                <h3 className="font-montserrat font-black text-lg leading-snug mb-1.5 group-hover:text-cyan-300 transition-colors">
                  {c.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-3">
                  {c.subtitle}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
                  <Icon name="Clock" size={13} />
                  {c.minutes} минут · {c.lessons.length} урока
                </span>
              </Link>
            ))}
          </div>

          <Link
            to="/instrumenty-rukovoditelya"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white font-black px-6 py-3 rounded-2xl transition-opacity"
          >
            Вся линейка курсов
            <Icon name="ArrowRight" size={17} />
          </Link>
        </div>
      </section>

      {/* Инструменты */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-16">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
          Инструменты
        </h2>
        <p className="text-white/60 mb-7 max-w-2xl">
          Не обучение, а расчёт: вы вводите свои цифры и получаете ответ по своей
          ситуации.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 p-6 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                  <Icon name={t.icon} size={20} className="text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h3 className="font-montserrat font-black text-lg leading-snug group-hover:text-cyan-300 transition-colors">
                      {t.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/12 border border-cyan-500/25 px-2 py-0.5 rounded-full">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{t.text}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Для компаний */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-20">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 md:p-9">
          <h2 className="font-montserrat font-black text-xl md:text-2xl mb-3">
            Нужно обучить команду?
          </h2>
          <p className="text-white/65 mb-6 max-w-2xl leading-relaxed">
            Мы собираем корпоративные программы под вашу продуктовую линейку и
            процессы, а также запускаем онлайн-школу под вашим брендом.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/corporate"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Icon name="Users" size={16} />
              Корпоративное обучение
            </Link>
            <Link
              to="/for-business"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Icon name="Building2" size={16} />
              Своя онлайн-школа
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}