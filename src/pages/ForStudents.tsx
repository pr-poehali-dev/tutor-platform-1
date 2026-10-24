import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import StudentMentor from "@/components/students/StudentMentor";

const SITE_URL = "https://учисьпро.рф";
const CANONICAL = `${SITE_URL}/studentam`;

const FEATURES = [
  { icon: "Lightbulb", title: "Выбор темы", text: "Пять тем от простой к сильной: объект, предмет, где взять данные и чем тема рискованна." },
  { icon: "ListTree", title: "План курсовой", text: "Цель, задачи, главы и параграфы с объёмами — и график работы по неделям до сдачи." },
  { icon: "FileSearch", title: "Проверка черновика", text: "Замечания как у строгого научрука: логика, доказательность, научный стиль, вопросы преподавателя." },
  { icon: "BookMarked", title: "Оформление по ГОСТу", text: "Список литературы по ГОСТ Р 7.0.100-2018 и чек-лист оформления текста по ГОСТ 7.32-2017." },
  { icon: "Presentation", title: "Подготовка к защите", text: "Речь по таймингу, план слайдов и вероятные вопросы комиссии с подсказками, как отвечать." },
  { icon: "CalendarCheck", title: "Подготовка к сессии", text: "План повторения по дням до экзамена, вопросы для самопроверки и типичные ловушки." },
];

const WHY = [
  {
    icon: "ShieldCheck",
    title: "Честно перед вузом",
    text: "Научрук не пишет работу за вас — он помогает её сделать. Такой ИИ-помощью можно открыто пользоваться и объяснить преподавателю, для чего она была нужна.",
  },
  {
    icon: "ScanSearch",
    title: "Не боится проверки",
    text: "Вузы проверяют работы на заимствования и признаки текста нейросетей. Текст, который вы написали сами по своему плану, такую проверку проходит спокойно.",
  },
  {
    icon: "Brain",
    title: "Знания остаются с вами",
    text: "Защита и экзамен — это вопросы по вашей же работе. Когда вы сами её сделали, отвечать легко.",
  },
];

const FAQ = [
  {
    q: "Научрук напишет курсовую за меня?",
    a: "Нет, и это принципиально. Он помогает выбрать тему, составить план, проверяет ваш черновик, оформляет список литературы и готовит к защите. Писать текст работы вы будете сами — так её не придётся бояться ни на проверке, ни на защите.",
  },
  {
    q: "Это бесплатно?",
    a: "Да. Регистрация не нужна. Чтобы научрук был доступен всем, действует ограничение — до 20 запросов в час.",
  },
  {
    q: "Можно ли пользоваться ИИ при написании работ?",
    a: "Правила устанавливает вуз: где-то нейросети разрешены для отдельных задач, где-то нет, а где-то нужно указать, как именно вы их использовали. Уточните требования в методичке или у научного руководителя. Помощь с планом, проверкой и оформлением обычно вопросов не вызывает.",
  },
  {
    q: "Научрук подберёт литературу?",
    a: "Он подскажет направления и ключевые слова для поиска в eLibrary, КиберЛенинке и Google Академии. Готовых названий книг и статей он не придумывает — ИИ может ошибиться, а в списке литературы ошибка недопустима. Каждый источник вы находите и проверяете сами.",
  },
  {
    q: "Подойдёт ли оформление моему вузу?",
    a: "Научрук опирается на ГОСТ, но у многих кафедр свои требования. Если методичка расходится с ГОСТом, действуют требования вуза — сверяйтесь с ней.",
  },
  {
    q: "Мой текст где-то сохраняется?",
    a: "Нет. Текст черновика нужен только для разбора и не публикуется. Мы сохраняем лишь служебную статистику — какой режим выбран и сколько символов в запросе.",
  },
];

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ИИ-научрук УЧИСЬПРО для студентов",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: CANONICAL,
    description:
      "Бесплатный ИИ-научрук для студентов: выбор темы, план курсовой, проверка черновика, оформление по ГОСТу, подготовка к защите и сессии.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

export default function ForStudents() {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Студентам: бесплатный ИИ-научрук для курсовой, диплома и сессии"
        description="ИИ-научрук поможет выбрать тему, составить план курсовой, проверит черновик, оформит список литературы по ГОСТу и подготовит к защите и сессии. Бесплатно, без регистрации."
        keywords="план курсовой, как выбрать тему курсовой, оформление по ГОСТу, список литературы по ГОСТу, подготовка к защите курсовой, ИИ для студентов, научный руководитель"
        canonical={CANONICAL}
        jsonLd={JSON_LD}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎓</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
            <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">студентам</span>
          </Link>
          <a href="#mentor" className="text-sm font-bold text-violet-200 hover:text-white transition-colors">Открыть научрука</a>
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-8 pb-16">
        <Breadcrumbs className="mb-6" items={[{ label: "Главная", href: "/" }, { label: "Студентам" }]} />

        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
            <Icon name="GraduationCap" size={13} className="text-violet-300" />
            <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">Студентам колледжей и вузов</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            ИИ-научрук, который{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">всегда на связи</span>
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto mb-7">
            Поможет выбрать тему, составить план курсовой, разберёт черновик, оформит литературу по ГОСТу
            и подготовит к защите и сессии. Работу вы пишете сами — а научрук не даёт сбиться с пути.
          </p>
          <a
            href="#mentor"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 px-7 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/20"
          >
            <Icon name="Sparkles" size={18} /> Задать вопрос научруку
          </a>
          <p className="text-white/40 text-sm mt-4">Бесплатно и без регистрации</p>
        </section>

        <section className="mb-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 flex items-center justify-center mb-3">
                  <Icon name={f.icon} size={20} className="text-violet-200" />
                </div>
                <h3 className="font-bold mb-1.5">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="mentor" className="mb-14 scroll-mt-20">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-3">Спросите научрука</h2>
          <p className="text-white/55 text-center text-sm mb-6 max-w-xl mx-auto">
            Выберите, с чем нужна помощь, заполните пару полей — разбор будет готов через 10–25 секунд
          </p>
          <StudentMentor />
        </section>

        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Почему помощник, а не «готовая работа»</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {WHY.map((w) => (
              <div key={w.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-3">
                  <Icon name={w.icon} size={20} className="text-emerald-200" />
                </div>
                <h3 className="font-bold mb-1.5">{w.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Частые вопросы</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <summary className="font-bold cursor-pointer list-none flex items-center justify-between gap-4">
                  {f.q}
                  <Icon name="ChevronDown" size={18} className="text-white/40 transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <p className="text-white/65 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
          <h2 className="font-montserrat font-black text-xl md:text-2xl mb-2">Нужен разбор задач по высшей математике или физике?</h2>
          <p className="text-white/60 text-sm mb-5 max-w-xl mx-auto">
            Сфотографируйте задачу — ИИ-репетитор разберёт решение по шагам и объяснит, где ошибка.
          </p>
          <Link
            to="/homework"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-100 hover:bg-cyan-500/15"
          >
            <Icon name="Camera" size={16} /> Разобрать задачу по фото
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
