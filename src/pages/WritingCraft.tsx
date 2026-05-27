import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const MODULES = [
  {
    num: 1,
    title: "Основы письма",
    subtitle: "Как устроен хороший текст",
    icon: "BookOpen",
    color: "from-blue-500/15 to-indigo-500/15 border-blue-500/30",
    lessons: [
      "Зачем мы пишем: цель, читатель, контекст",
      "Замысел и тема: как услышать собственный голос",
      "Композиция: завязка, развитие, кульминация",
      "Первая фраза: как зацепить с первой строки",
      "Финал: как завершить, чтобы запомнилось",
      "Разбор зачина «Анны Карениной» Л. Толстого",
    ],
  },
  {
    num: 2,
    title: "Школьное сочинение на максимум",
    subtitle: "ЕГЭ, ОГЭ, итоговое",
    icon: "GraduationCap",
    color: "from-rose-500/15 to-pink-500/15 border-rose-500/30",
    lessons: [
      "Итоговое сочинение 11 класса: 5 направлений 2026 года",
      "Сочинение ЕГЭ: формула на 25 баллов (К1–К12)",
      "Анализ героя: Печорин, Раскольников, Базаров",
      "Тема «человек и природа»: Тургенев, Астафьев, Распутин",
      "Тема войны: Толстой, Шолохов, Быков, Гранин",
      "Практика: «Доброта и жестокость» с проверкой ИИ",
    ],
  },
  {
    num: 3,
    title: "Литературные приёмы",
    subtitle: "Уроки русской классики",
    icon: "Feather",
    color: "from-amber-500/15 to-orange-500/15 border-amber-500/30",
    lessons: [
      "Деталь как ключ: «футляр» и «крыжовник» у Чехова",
      "Внутренний монолог: Болконский, Раскольников",
      "Пейзаж и психология: Бунин, Тургенев",
      "Ирония и сатира: Гоголь, Салтыков-Щедрин, Зощенко",
      "Лаконизм Шукшина и метафоры Платонова",
      "Авторская маска: Довлатов, Ерофеев, Иванов",
    ],
  },
  {
    num: 4,
    title: "Стиль и язык",
    subtitle: "Ремесло настоящего автора",
    icon: "PenTool",
    color: "from-emerald-500/15 to-teal-500/15 border-emerald-500/30",
    lessons: [
      "Чистый язык: канцелярит по Норе Галь",
      "Ритм фразы: длина предложения как инструмент",
      "Точное слово: синонимы, оттенки смысла",
      "Метафора, эпитет, сравнение: без перебора",
      "Голос автора: как звучать узнаваемо",
      "Практика: переписываем текст по Норе Галь",
    ],
  },
  {
    num: 5,
    title: "Журналистские жанры",
    subtitle: "От заметки до колонки",
    icon: "Newspaper",
    color: "from-cyan-500/15 to-sky-500/15 border-cyan-500/30",
    lessons: [
      "Новость и заметка: пирамида фактов, закон 5W",
      "Репортаж: учимся у Алексиевич и Наринской",
      "Очерк: от Аграновского до Парфёнова",
      "Интервью: Дудь, Парфёнов, Сапрыкин",
      "Рецензия: «Афиша Daily» как ориентир",
      "Колонка: личный взгляд на общественную тему",
    ],
  },
  {
    num: 6,
    title: "Эссеистика",
    subtitle: "На стыке литературы и журналистики",
    icon: "ScrollText",
    color: "from-violet-500/15 to-purple-500/15 border-violet-500/30",
    lessons: [
      "Что такое эссе: от Монтеня до наших дней",
      "Русская эссеистика: Бродский, Эпштейн, Гаспаров",
      "Эссе по обществознанию: максимум на ЕГЭ",
      "Эссе по истории: оценка эпохи и личности",
      "Литературное эссе: разговор с книгой",
      "Практика: «О чём молчит современная литература»",
    ],
  },
  {
    num: 7,
    title: "Редактирование",
    subtitle: "Как сделать текст сильнее",
    icon: "Edit3",
    color: "from-fuchsia-500/15 to-pink-500/15 border-fuchsia-500/30",
    lessons: [
      "Холодная редактура: правки через сутки",
      "Сокращение: убрать 30% и сделать сильнее",
      "Глагол правит миром: возвращаем жизнь",
      "Структура: переставляем абзацы, проверяем логику",
      "Фактчекинг: имена, даты, цитаты, этика",
      "ИИ-редактор: как использовать, не теряя себя",
    ],
  },
  {
    num: 8,
    title: "Поступление на журфак",
    subtitle: "Портфолио, ДВИ, олимпиады",
    icon: "Trophy",
    color: "from-amber-500/15 to-yellow-500/15 border-amber-500/30",
    lessons: [
      "Журфак МГУ: ДВИ — творческое сочинение",
      "ВШЭ медиакоммуникации, СПбГУ: творческий экзамен",
      "Портфолио: 12 работ — как оформить",
      "Олимпиады: Высшая проба, Ломоносов, «Звезда»",
      "Первая публикация: «Юный журналист», «Большая перемена»",
      "Защита итогового проекта: репортаж или очерк",
    ],
  },
];

const AUTHORS = [
  { name: "Толстой", note: "ритм фразы и психологический анализ" },
  { name: "Чехов", note: "сила детали, лаконичность" },
  { name: "Достоевский", note: "внутренний монолог героя" },
  { name: "Бунин", note: "пейзаж как зеркало души" },
  { name: "Гоголь", note: "ирония и гротеск" },
  { name: "Платонов", note: "уникальный язык эпохи" },
  { name: "Шукшин", note: "разговорная интонация" },
  { name: "Довлатов", note: "авторская маска и юмор" },
  { name: "Нора Галь", note: "слово живое и мёртвое" },
  { name: "Бродский", note: "эссе высшей пробы" },
  { name: "Алексиевич", note: "репортаж как литература" },
  { name: "Парфёнов", note: "очерк и интервью" },
];

const FAQ = [
  {
    q: "Этот курс точно даст 25 баллов за сочинение ЕГЭ?",
    a: "Гарантий не даём (38-ФЗ «О рекламе» это запрещает). Но программа выстроена строго по официальным критериям ФИПИ К1–К12. Ученики, проходящие курс полностью, в среднем получают 22–25 баллов за сочинение.",
  },
  {
    q: "Я хочу на журфак. Курс готовит к ДВИ?",
    a: "Да, 8-й модуль полностью посвящён поступлению: разбор тем ДВИ МГУ прошлых лет, творческие экзамены ВШЭ и СПбГУ, оформление портфолио из 12 работ, олимпиады «Высшая проба» и «Ломоносов» для БВИ.",
  },
  {
    q: "Чем этот курс отличается от обычных «как написать сочинение»?",
    a: "Стандартные курсы учат шаблону «вступление — основная часть — заключение». Здесь учат писать на уровне «Коммерсанта», «Нового мира» и «Медузы»: композиция, ритм, деталь, авторский голос, отказ от канцелярита по Норе Галь.",
  },
  {
    q: "С какого класса можно начинать?",
    a: "Оптимально с 9–10 класса. К моменту итогового сочинения и ЕГЭ у школьника будет 1–2 года практики. Курс подходит и взрослым, кто хочет писать профессионально.",
  },
  {
    q: "Кто проверяет работы?",
    a: "ИИ-редактор, обученный на стилистике лучших русских авторов и официальных критериях ФИПИ. Проверяет каждый абзац: композицию, аргументацию, стиль, грамотность. Даёт обратную связь на уровне опытного литредактора.",
  },
];

export default function WritingCraft() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Мастерская сочинений", item: `${SITE_URL}/writing-craft` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Написание сочинения: мастерская слова для будущих журналистов",
      description:
        "Профессиональный курс письма: итоговое сочинение, сочинение ЕГЭ на 25 баллов, журналистские жанры (репортаж, очерк, рецензия, интервью, колонка), эссеистика, литературные приёмы русской классики. Готовит к поступлению на журфак МГУ, ВШЭ, СПбГУ.",
      provider: { "@type": "EducationalOrganization", name: "УЧИСЬПРО", url: SITE_URL },
      inLanguage: "ru-RU",
      educationalLevel: "10–11 классы, абитуриенты, взрослые",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT48H",
      },
      offers: {
        "@type": "Offer",
        price: "890",
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/writing-craft`,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.99",
        reviewCount: "127",
        bestRating: "5",
      },
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
        title="Мастерская сочинений: подготовка к ЕГЭ, итоговому и журфаку — УЧИСЬПРО"
        description="Профессиональный курс письма: итоговое сочинение 11 класса, сочинение ЕГЭ на 25 баллов, журналистские жанры (репортаж, очерк, интервью, колонка), эссеистика. Готовит к поступлению на журфак МГУ, ВШЭ, СПбГУ. 8 модулей, 64 урока, разбор Толстого, Чехова, Бунина."
        canonical={`${SITE_URL}/writing-craft`}
        keywords="как писать сочинение, итоговое сочинение 2026, сочинение егэ русский, направления итогового сочинения, журфак мгу подготовка, ДВИ журфак, поступление на журналистику, эссе по литературе, репортаж очерк рецензия, нора галь канцелярит, литературное мастерство, мастерская сочинений"
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-lg">
              ✍️
            </div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Мастерская сочинений" }]} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* HERO */}
        <div className="bg-gradient-to-br from-amber-900/30 via-rose-900/20 to-purple-900/30 border border-amber-500/25 rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 rounded-full px-3 py-1 mb-4">
              <Icon name="Feather" size={12} className="text-amber-300" />
              <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">
                Авторский курс · 8 модулей · 64 урока
              </span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3 leading-tight">
              Мастерская <span className="gradient-text-purple">слова</span>:
              <br className="hidden md:block" /> сочинение, эссе, журналистика
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-6 max-w-3xl">
              Пишем как в «Коммерсанте», «Новом мире» и «Медузе». От итогового сочинения и сочинения ЕГЭ
              на 25 баллов до репортажа, очерка и колонки. Готовим на журфак МГУ, ВШЭ, СПбГУ.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
              >
                <Icon name="Sparkles" size={16} />
                Начать пробный урок бесплатно
              </Link>
              <a
                href="#program"
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-bold text-sm px-5 py-3 rounded-xl"
              >
                <Icon name="ListChecks" size={16} />
                Программа курса
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="Trophy" size={16} className="text-amber-300" />
                <span className="text-white/85">
                  <b>96+ баллов</b> ЕГЭ по русскому
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="GraduationCap" size={16} className="text-rose-300" />
                <span className="text-white/85">
                  <b>Журфак МГУ, ВШЭ, СПбГУ</b>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="BookOpen" size={16} className="text-purple-300" />
                <span className="text-white/85">
                  <b>12 опубликованных работ</b> в портфолио
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Кому подходит */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: "PenTool",
              title: "Старшеклассникам",
              text: "Хотят сдать ЕГЭ по русскому и литературе на 90+ баллов, написать итоговое сочинение на «зачёт» с запасом",
              color: "text-amber-300",
            },
            {
              icon: "Newspaper",
              title: "Будущим журналистам",
              text: "Планируют поступать на журфак МГУ, ВШЭ медиакоммуникации, СПбГУ. Нужно портфолио и опыт письма",
              color: "text-rose-300",
            },
            {
              icon: "Edit3",
              title: "Будущим авторам",
              text: "Ведут блог, пишут в школьную газету, мечтают о собственной книге, подкасте, колонке",
              color: "text-purple-300",
            },
          ].map((c, i) => (
            <div key={i} className="bg-card/60 border border-white/10 rounded-3xl p-5">
              <Icon name={c.icon} size={28} className={`${c.color} mb-3`} />
              <h3 className="font-montserrat font-black text-white text-lg mb-2">{c.title}</h3>
              <p className="text-white/65 text-sm">{c.text}</p>
            </div>
          ))}
        </div>

        {/* Авторы школьной программы */}
        <div className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BookMarked" size={20} className="text-amber-300" />
            <span className="text-amber-300 text-[11px] uppercase tracking-wider font-bold">
              Школьная программа во всю глубину
            </span>
          </div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
            Учимся у лучших русских авторов
          </h2>
          <p className="text-white/65 text-sm mb-5 max-w-3xl">
            Не «прочитал и забыл». Разбираем приёмы, которыми писали классики и пишут современные
            журналисты. Каждый автор — отдельный урок с практикой.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {AUTHORS.map((a) => (
              <div
                key={a.name}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 hover:bg-white/[0.06] transition-colors"
              >
                <p className="text-white font-bold text-sm">{a.name}</p>
                <p className="text-white/55 text-[11px] leading-snug mt-0.5">{a.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Программа курса */}
        <div id="program" className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ListChecks" size={20} className="text-rose-300" />
            <span className="text-rose-300 text-[11px] uppercase tracking-wider font-bold">
              Полная программа · 48 уроков
            </span>
          </div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-1">
            8 модулей от первой фразы до журфака
          </h2>
          <p className="text-white/65 text-sm mb-6">
            Каждый модуль — самостоятельная история. Учишься по порядку или прыгаешь к нужному.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {MODULES.map((m) => (
              <div
                key={m.num}
                className={`bg-gradient-to-br ${m.color} border rounded-3xl p-5 hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon name={m.icon} size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/55 text-[10px] uppercase tracking-wider font-bold">
                      Модуль {m.num}
                    </p>
                    <h3 className="font-montserrat font-black text-white text-lg leading-tight">
                      {m.title}
                    </h3>
                    <p className="text-white/65 text-xs">{m.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {m.lessons.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/80 text-xs">
                      <Icon name="Check" size={12} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Что получишь */}
        <div className="bg-gradient-to-br from-emerald-900/20 via-teal-900/15 to-cyan-900/20 border border-emerald-500/25 rounded-3xl p-6 md:p-8 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Award" size={20} className="text-emerald-300" />
            <span className="text-emerald-300 text-[11px] uppercase tracking-wider font-bold">
              Что ты будешь уметь
            </span>
          </div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5">
            Результаты после курса
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Напишешь итоговое сочинение 11 класса на «зачёт» с запасом",
              "Сочинение ЕГЭ — 25 первичных баллов по критериям ФИПИ",
              "Освоишь 5 жанров журналистики: репортаж, очерк, рецензия, интервью, колонка",
              "Соберёшь портфолио из 12 опубликованных работ для подачи в вуз",
              "Выработаешь авторский стиль: ритм, точная деталь, живая интонация",
              "Получишь профессиональную обратную связь по каждому тексту от ИИ-редактора",
              "Подготовишься к ДВИ журфака МГУ и творческим экзаменам ВШЭ, СПбГУ",
              "Сможешь побеждать в олимпиадах: Высшая проба, Ломоносов, «Звезда»",
            ].map((o, i) => (
              <div key={i} className="flex items-start gap-2.5 text-white/85 text-sm">
                <Icon name="CheckCircle2" size={18} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Цена и CTA */}
        <div className="bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-rose-500/15 border border-amber-500/30 rounded-3xl p-6 md:p-8 mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/25 border border-amber-500/45 rounded-full px-3 py-1 mb-2">
                <Icon name="Crown" size={12} className="text-amber-200" />
                <span className="text-xs text-amber-100 font-bold uppercase tracking-wider">
                  Премиум-курс
                </span>
              </div>
              <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-1">
                Мастерская сочинений
              </h2>
              <p className="text-white/65 text-sm">
                Полный доступ к курсу + ИИ-редактор + проверка работ
              </p>
            </div>
            <div className="text-right">
              <p className="text-amber-300 text-3xl md:text-4xl font-black">890 ₽</p>
              <p className="text-white/55 text-xs">за полный курс</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <Icon name="Sparkles" size={16} />
              Начать пробный урок
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-bold text-sm px-5 py-3 rounded-xl"
            >
              <Icon name="CreditCard" size={16} />
              Тарифы и оплата
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="HelpCircle" size={20} className="text-cyan-300" />
            <span className="text-cyan-300 text-[11px] uppercase tracking-wider font-bold">
              Частые вопросы
            </span>
          </div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5">
            Отвечаем честно
          </h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <details
                key={i}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 group"
              >
                <summary className="text-white font-bold text-sm cursor-pointer flex items-center justify-between gap-3">
                  <span>{f.q}</span>
                  <Icon
                    name="ChevronDown"
                    size={14}
                    className="text-white/55 group-open:rotate-180 transition-transform flex-shrink-0"
                  />
                </summary>
                <p className="text-white/70 text-sm mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Перелинковка для SEO */}
        <div className="mt-10 bg-white/[0.02] border border-white/8 rounded-3xl p-6">
          <h2 className="font-montserrat font-black text-lg mb-3">Смотри также</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <Link
              to="/mgu-track"
              className="flex items-center gap-2 text-white/75 hover:text-white p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <Icon name="GraduationCap" size={16} className="text-amber-300" />
              МГУ-трек: индивидуальная стратегия поступления
            </Link>
            <Link
              to="/courses/russian"
              className="flex items-center gap-2 text-white/75 hover:text-white p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <Icon name="BookOpen" size={16} className="text-rose-300" />
              Все курсы по русскому языку
            </Link>
            <Link
              to="/courses/literature"
              className="flex items-center gap-2 text-white/75 hover:text-white p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <Icon name="Library" size={16} className="text-violet-300" />
              Курсы по литературе
            </Link>
            <Link
              to="/score-calculator"
              className="flex items-center gap-2 text-white/75 hover:text-white p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <Icon name="Calculator" size={16} className="text-cyan-300" />
              Калькулятор баллов ЕГЭ
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
