import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";

const SITE_URL = "https://учисьпро.рф";
const CANONICAL = `${SITE_URL}/kids/about`;

const SECTIONS = [
  {
    to: "/kids/reading",
    emoji: "📖",
    title: "Учусь читать с Ксюшей",
    color: "from-emerald-400 to-teal-500",
    text: "Десять весёлых ступенек от первой буквы до чтения предложений. Ксюша хвалит за каждый успех и дарит ЗНАЙКИ.",
  },
  {
    to: "/kids/poznavashka",
    emoji: "🧸",
    title: "Познавашка",
    color: "from-amber-400 to-orange-500",
    text: "Окружающий мир, логика и внимание в форме игры. Почему идёт дождь, кто живёт в лесу, что больше — слон или мышка.",
  },
  {
    to: "/kids/games",
    emoji: "♟️",
    title: "Игротека",
    color: "from-cyan-400 to-blue-500",
    text: "Шахматы, шашки, пятнашки, морской бой и другие умные игры. Ксюша объясняет правила и играет вместе с ребёнком.",
  },
  {
    to: "/kids/songs",
    emoji: "🎵",
    title: "Песни и стихи",
    color: "from-amber-400 to-orange-400",
    text: "Потешки, пальчиковые игры, песенки и колыбельные с подсветкой строк и тёплой озвучкой голосом.",
  },
  {
    to: "/kids/library",
    emoji: "📚",
    title: "Библиотека · 30 произведений",
    color: "from-pink-400 to-rose-400",
    text: "Народные сказки, Пушкин, Толстой, Крылов, Ушинский, Жуковский, Аксаков. Для малышей от 2 лет и школьников 6+. Голос Лисы прочтёт каждый фрагмент.",
  },
  {
    to: "/kids/my-russia",
    emoji: "🪆",
    title: "Моя Россия",
    color: "from-rose-400 via-amber-400 to-emerald-500",
    text: "Народная культура простым языком: фольклор, малоизвестные сказки, песни и история родной страны.",
  },
];

const AGES = [
  { emoji: "🐣", label: "1–2 года", note: "Первые слова и шаги" },
  { emoji: "🧸", label: "2–3 года", note: "«Я сам! Я знаю!»" },
  { emoji: "🦊", label: "3–4 года", note: "Почему? Почему? Почему?" },
  { emoji: "🐯", label: "4–5 лет", note: "Учусь думать и фантазировать" },
  { emoji: "🦁", label: "5–6 лет", note: "Готовлюсь к школе" },
];

const SKILLS = [
  { emoji: "💬", label: "Речь и язык" },
  { emoji: "🧠", label: "Логика и счёт" },
  { emoji: "🌍", label: "Окружающий мир" },
  { emoji: "✋", label: "Моторика" },
  { emoji: "🎨", label: "Творчество" },
  { emoji: "❤️", label: "Эмоции и общение" },
];

const PRINCIPLES = [
  {
    icon: "Heart",
    title: "Через игру, а не через «надо»",
    text: "Малыши не учатся по принуждению. Поэтому каждое занятие — это игра, сказка или весёлый диалог с Ксюшей. Ребёнок думает, что играет, — а на самом деле развивается.",
  },
  {
    icon: "Mic",
    title: "Говорим и слушаем вслух",
    text: "В этом возрасте ребёнок ещё не читает сам. Поэтому всё озвучено живым тёплым голосом: сказки, песни, задания. Можно слушать вместе с мамой или самостоятельно.",
  },
  {
    icon: "Shield",
    title: "Безопасно и спокойно",
    text: "Никакой агрессивной рекламы и чужих ссылок. Есть контроль экранного времени и PIN-код для родителя. Только бережный, добрый контент.",
  },
  {
    icon: "Sparkles",
    title: "Радость от успеха",
    text: "За старание ребёнок получает ЗНАЙКИ, бейджи и похвалу. Маленькие победы рождают большую любовь к учёбе на всю жизнь.",
  },
];

export default function KidsAbout() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Модуль «Малыш»: развивающие занятия для детей от 1 до 6 лет",
      description:
        "Что такое модуль «Малыш» в УЧИСЬПРО: чтение, логика, игры, песни, библиотека из 30 озвученных произведений и народная культура. Развитие ребёнка через игру с няней-Лисой и Ксюшей.",
      inLanguage: "ru",
      url: CANONICAL,
      author: { "@type": "Organization", name: "УЧИСЬПРО" },
      publisher: { "@type": "Organization", name: "УЧИСЬПРО" },
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Модуль «Малыш» — развивающие занятия для детей от 1 до 6 лет | УЧИСЬПРО"
        description="«Малыш» — это чтение, логика, игры, песни, библиотека из 30 озвученных сказок и народная культура. Развитие ребёнка от 2 лет и школьников 6+ через игру. Безопасно, тепло, бесплатно."
        canonical={CANONICAL}
        type="article"
        keywords="развитие детей от 2 лет, занятия для малышей, подготовка к школе, аудиосказки для детей, учим читать дошкольника, развивающие игры для детей, модуль малыш учисьпро"
        jsonLd={jsonLd}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 137.5) % 100) + "%",
              top: ((i * 97.3) % 100) + "%",
              opacity: 0.1 + (i % 4) * 0.06,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Малыш", href: "/kids" }, { label: "О модуле" }]} />
          </div>
          <Link to="/kids" className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Icon name="ArrowLeft" size={14} />
            К Малышу
          </Link>
        </div>
      </div>

      <article className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16">
        {/* Hero */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-amber-500/20 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
          <span className="text-base">🦊</span>
          <span className="text-sm text-pink-200 font-bold uppercase tracking-wider">Модуль «Малыш»</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4 leading-tight">
          Где малыши{" "}
          <span className="bg-gradient-to-r from-pink-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">учатся, играя</span>
        </h1>
        <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-6">
          «Малыш» — это тёплый детский мир внутри УЧИСЬПРО для детей от 1 до 6 лет. Здесь ребёнка встречают
          добрая Лиса-няня и умная Ксюша. Они читают сказки, поют песенки, играют в умные игры и потихоньку,
          без скуки и принуждения, готовят малыша к школе и к жизни.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            to="/kids"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
          >
            Открыть Малыша
            <Icon name="ArrowRight" size={16} />
          </Link>
          <Link
            to="/kids/test"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
          >
            <Icon name="Sparkles" size={16} className="text-amber-300" />
            Бесплатный тест развития
          </Link>
        </div>

        {/* Что это */}
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-4">
          Не мультики, а настоящее развитие
        </h2>
        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Главная разница между «Малышом» и обычными детскими приложениями — в подходе. Здесь ребёнок не просто
          смотрит на экран. Он отвечает на вопросы, повторяет слова, складывает слоги, делает выбор в игре —
          то есть <span className="text-white font-semibold">активно думает и действует</span>.
        </p>
        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-12">
          Всё построено вокруг возраста: для двухлетки — простые потешки-повторялки и яркие картинки, для
          будущего первоклассника — буквы, счёт и логика. Малыш растёт — и занятия растут вместе с ним.
        </p>

        {/* Принципы */}
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-6">
          Четыре принципа, на которых всё держится
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="bg-card border border-white/10 rounded-3xl p-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/30 to-amber-500/30 border border-white/10 flex items-center justify-center mb-3">
                <Icon name={p.icon} size={20} className="text-pink-200" />
              </div>
              <p className="font-montserrat font-black text-white text-base mb-1.5">{p.title}</p>
              <p className="text-white/65 text-sm leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        {/* Разделы */}
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
          Что внутри: шесть миров для ребёнка
        </h2>
        <p className="text-white/60 text-base mb-6">Каждый раздел — отдельное приключение. Заходите в любой.</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {SECTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group bg-card border border-white/10 rounded-3xl p-5 hover:border-white/25 hover:translate-y-[-2px] transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl mb-3`}>
                {s.emoji}
              </div>
              <p className="font-montserrat font-black text-white text-lg mb-1.5 flex items-center gap-1.5">
                {s.title}
                <Icon name="ArrowRight" size={14} className="text-white/40 group-hover:translate-x-0.5 transition-transform" />
              </p>
              <p className="text-white/65 text-sm leading-relaxed">{s.text}</p>
            </Link>
          ))}
        </div>

        {/* Возраста */}
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-6">
          Свой маршрут для каждого возраста
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-12">
          {AGES.map((a) => (
            <div key={a.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">{a.emoji}</div>
              <p className="font-montserrat font-black text-white text-sm">{a.label}</p>
              <p className="text-white/50 text-[11px] mt-1 leading-snug">{a.note}</p>
            </div>
          ))}
        </div>

        {/* Области развития */}
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-6">
          Развиваем ребёнка целиком
        </h2>
        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-5">
          «Малыш» не натаскивает на один навык. Он бережно развивает все стороны личности ребёнка сразу —
          так, как это происходит в живой жизни:
        </p>
        <div className="flex flex-wrap gap-3 mb-12">
          {SKILLS.map((s) => (
            <div key={s.label} className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5">
              <span className="text-xl">{s.emoji}</span>
              <span className="text-white/80 text-sm font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Библиотека-акцент */}
        <div className="bg-gradient-to-br from-pink-500/12 to-rose-500/8 border border-pink-500/25 rounded-3xl p-6 md:p-8 mb-12">
          <div className="text-4xl mb-3">📚</div>
          <h2 className="font-montserrat font-black text-2xl text-white mb-3">
            Библиотека из 30 озвученных произведений
          </h2>
          <p className="text-white/75 text-base leading-relaxed mb-5">
            Сердце модуля — большая библиотека лучшей детской классики. От «Колобка» и «Репки» для самых
            маленьких до «Сказки о рыбаке и рыбке» и «Аленького цветочка» для школьников 6+. Народные сказки,
            стихи Пушкина и Жуковского, добрые рассказы Толстого и Ушинского — всё прочтёт тёплый голос Лисы.
            Только произведения из общественного достояния: честно и легально.
          </p>
          <Link
            to="/kids/library"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
          >
            Перейти в библиотеку
            <Icon name="ArrowRight" size={16} />
          </Link>
        </div>

        {/* Для родителей */}
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-4">
          Спокойно за ширмой родителя
        </h2>
        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-12">
          Мы понимаем тревогу родителей за экранное время. Поэтому в «Малыше» есть встроенный таймер занятий и
          PIN-код для входа в родительский раздел. Никакой сторонней рекламы и непредсказуемых ссылок — только
          добрый, проверенный контент, который не стыдно включить ребёнку.
        </p>

        {/* Финальный CTA */}
        <div className="bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border border-purple-500/25 rounded-3xl p-7 md:p-9 text-center">
          <div className="text-5xl mb-3">🦊</div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-3">
            Лиса уже ждёт вашего малыша
          </h2>
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6 max-w-xl mx-auto">
            Откройте «Малыш» прямо сейчас — первое занятие начнётся за полминуты, без карты и без обязательств.
          </p>
          <Link
            to="/kids"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-black px-8 py-4 rounded-2xl hover:scale-[1.02] transition-transform"
          >
            Войти в Малыша
            <Icon name="ArrowRight" size={18} />
          </Link>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
