import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";

const COVER =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/bc72c4b6-c4e6-46e9-bd86-5a5c11f9b18b.jpg";
const CANONICAL = "https://учисьпро.рф/feed/razbor-revizor-gogol";

interface Section {
  id: string;
  label: string;
  icon: string;
}

const SECTIONS: Section[] = [
  { id: "about", label: "О произведении", icon: "BookOpen" },
  { id: "history", label: "История создания", icon: "ScrollText" },
  { id: "plot", label: "Сюжет по действиям", icon: "ListOrdered" },
  { id: "heroes", label: "Система образов", icon: "Users" },
  { id: "themes", label: "Темы и проблемы", icon: "Lightbulb" },
  { id: "composition", label: "Композиция и приёмы", icon: "Layers" },
  { id: "quotes", label: "Цитаты с разбором", icon: "Quote" },
  { id: "meaning", label: "Смысл и финал", icon: "Sparkles" },
  { id: "exam", label: "Подготовка к экзамену", icon: "GraduationCap" },
  { id: "test", label: "Проверь себя", icon: "CircleCheck" },
];

const HEROES: { name: string; role: string; trait: string; color: string }[] = [
  { name: "Хлестаков", role: "Мнимый ревизор", trait: "Пустота, принятая за значительность; врёт, сам себе веря", color: "text-rose-300 border-rose-400/30 bg-rose-500/10" },
  { name: "Городничий", role: "Глава города", trait: "Опытный плут, перехитривший многих — и обманутый пустышкой", color: "text-amber-300 border-amber-400/30 bg-amber-500/10" },
  { name: "Осип", role: "Слуга Хлестакова", trait: "Народный ум: видит правду яснее господ", color: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10" },
  { name: "Земляника", role: "Попечитель приютов", trait: "Доносчик в маске радушия", color: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10" },
  { name: "Ляпкин-Тяпкин", role: "Судья", trait: "Берёт взятки «борзыми щенками», мнит себя умником", color: "text-violet-300 border-violet-400/30 bg-violet-500/10" },
  { name: "Бобчинский и Добчинский", role: "Городские помещики", trait: "Сплетники, запустившие всю интригу", color: "text-sky-300 border-sky-400/30 bg-sky-500/10" },
];

const ACTS: { act: string; title: string; text: string }[] = [
  { act: "I", title: "Тревожное известие", text: "Городничий собирает чиновников и сообщает «пренеприятное известие»: едет ревизор, да ещё инкогнито. Каждый бросается прятать свои грехи. Бобчинский и Добчинский приносят весть о подозрительном приезжем из Петербурга — и принимают за ревизора мелкого чиновника Хлестакова." },
  { act: "II", title: "Недоразумение завязывается", text: "Хлестаков сидит в гостинице без денег и боится, что его посадят за долги. Городничий приходит к нему «с проверкой» — и оба разговаривают, не понимая друг друга: один заискивает, другой думает, что его арестуют. Городничий принимает страх Хлестакова за хитрость." },
  { act: "III", title: "Триумф вранья", text: "Хлестакова поселяют в доме городничего. Захмелев, он завирается до небес: будто он и с Пушкиным на дружеской ноге, и департаментом управляет, и его «тридцать пять тысяч одних курьеров» ищут. Чиновники в ужасе и восторге верят каждому слову." },
  { act: "IV", title: "Взятки и сватовство", text: "Чиновники по очереди несут Хлестакову деньги «взаймы». Он берёт у всех, попутно ухаживая и за женой, и за дочерью городничего, и сватается к дочери. Осип уговаривает господина бежать, пока обман не раскрылся. Хлестаков уезжает «на день» к дяде." },
  { act: "V", title: "Немая сцена", text: "Городничий торжествует, мечтая о генеральстве в Петербурге. Но почтмейстер вскрывает письмо Хлестакова, где тот высмеивает всех чиновников. Прозрение. И тут жандарм объявляет о приезде НАСТОЯЩЕГО ревизора — следует знаменитая немая сцена всеобщего оцепенения." },
];

const QUOTES: { text: string; who: string; note: string }[] = [
  {
    text: "«К нам едет ревизор».",
    who: "Городничий",
    note: "Завязка всей комедии. Одна фраза запускает панику — потому что каждому есть что скрывать. Страх перед проверкой обнажает нечистую совесть целого города.",
  },
  {
    text: "«Над кем смеётесь? Над собою смеётесь!»",
    who: "Городничий (в финале)",
    note: "Реплика, обращённая будто в зрительный зал. Гоголь разрушает «четвёртую стену»: пороки города — это пороки общества, и смех зрителя оборачивается смехом над самим собой.",
  },
  {
    text: "«Я везде, везде… Меня сам государственный совет боится».",
    who: "Хлестаков",
    note: "Кульминация «хлестаковщины» — вдохновенного вранья без цели и меры. Пустой человек раздувается до фантастических размеров, и все верят, потому что хотят верить.",
  },
  {
    text: "«Чему смеётесь? — Сами над собою смеётесь!.. Эх вы!»",
    who: "Авторская идея",
    note: "Главный нравственный посыл: сатира направлена не на «них», а на всех. Зеркало комедии показывает читателю его собственное отражение.",
  },
];

const THEMES: { title: string; text: string; icon: string }[] = [
  { title: "Чиновничество и взяточничество", text: "Город — модель всей бюрократической России. Каждый чиновник ворует и берёт взятки, считая это нормой. Гоголь показывает систему, где честность — исключение.", icon: "Scale" },
  { title: "«Хлестаковщина»", text: "Особое явление: пустота, выдающая себя за значительность. Хлестаков врёт не ради выгоды, а по вдохновению. Это вечный тип — бахвальство без содержания.", icon: "Wind" },
  { title: "Страх и совесть", text: "Движущая сила сюжета — страх. Чиновники боятся не закона, а разоблачения. Их совесть нечиста, и потому ничтожный Хлестаков кажется им грозным ревизором.", icon: "Eye" },
  { title: "Смех как оружие", text: "«Единственное честное лицо в комедии — смех», — говорил Гоголь. Смех здесь лечит: он обнажает пороки, чтобы человек устыдился и захотел стать лучше.", icon: "Drama" },
];

export default function PremiumRevizor() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("about");
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = Math.min(1, Math.max(0, window.scrollY / (total || 1)));
      setProgress(scrolled * 100);

      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const node = document.getElementById(s.id);
        if (node && node.getBoundingClientRect().top <= 140) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setTocOpen(false);
    const node = document.getElementById(id);
    if (node) {
      const y = node.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "«Ревизор» Н. В. Гоголя — полный разбор произведения",
      description:
        "Эталонный разбор комедии «Ревизор» Гоголя: история создания, сюжет по действиям, система образов, темы, цитаты с пояснениями, смысл финала и подготовка к ЕГЭ и ОГЭ.",
      datePublished: "2026-06-21",
      author: { "@type": "Organization", name: "УЧИСЬПРО" },
      publisher: {
        "@type": "Organization",
        name: "УЧИСЬПРО",
        logo: {
          "@type": "ImageObject",
          url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg",
        },
      },
      image: COVER,
      mainEntityOfPage: CANONICAL,
      inLanguage: "ru",
      articleSection: "Разборы произведений",
    },
  ];

  return (
    <div ref={contentRef} className="min-h-screen bg-[#0b1020] font-golos text-white selection:bg-amber-400/30">
      <Seo
        title="«Ревизор» Гоголя — полный разбор произведения | УЧИСЬПРО"
        description="Глубокий разбор «Ревизора» Гоголя: сюжет по действиям, система образов, темы, цитаты с пояснениями, смысл, подготовка к ЕГЭ и ОГЭ. Эталонный материал."
        canonical={CANONICAL}
        image={COVER}
        type="article"
        jsonLd={jsonLd}
      />

      {/* Прогресс чтения */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-rose-500 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0b1020]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-lg">📖</div>
            <span className="font-montserrat font-black text-base group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            <Icon name="ArrowLeft" size={12} />
            В ленту
          </Link>
        </div>
      </div>

      {/* HERO */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <img src={COVER} alt="Ревизор. Гоголь" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020]/60 via-[#0b1020]/85 to-[#0b1020]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-12 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            <Icon name="Crown" size={14} />
            Эталонный разбор
          </div>
          <p className="text-amber-300/90 font-montserrat font-bold tracking-wider uppercase text-sm mb-3">Н. В. Гоголь</p>
          <h1 className="font-montserrat font-black text-5xl md:text-7xl leading-[0.95] mb-5">
            <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-rose-300 bg-clip-text text-transparent">Ревизор</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Комедия в пяти действиях, в которой целый город сошёл с ума от страха. Полный разбор: от первой реплики до знаменитой немой сцены.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {[
              { icon: "Clock", label: "18 мин чтения" },
              { icon: "Layers", label: "10 разделов" },
              { icon: "GraduationCap", label: "Готовит к ЕГЭ и ОГЭ" },
            ].map((b) => (
              <span key={b.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/75">
                <Icon name={b.icon} size={15} className="text-amber-300" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Мобильное оглавление */}
      <div className="lg:hidden sticky top-[57px] z-30 bg-[#0b1020]/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => setTocOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-white/80"
        >
          <span className="flex items-center gap-2">
            <Icon name="List" size={16} className="text-amber-300" />
            Содержание
          </span>
          <Icon name={tocOpen ? "ChevronUp" : "ChevronDown"} size={16} />
        </button>
        {tocOpen && (
          <div className="px-3 pb-3 grid grid-cols-1 gap-1">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm text-white/70 hover:bg-white/5"
              >
                <span className="text-amber-300/70 font-mono text-xs w-5">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 lg:py-14 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Боковое оглавление */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 px-3">Содержание</div>
            <nav className="space-y-1">
              {SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    active === s.id
                      ? "bg-amber-400/10 text-amber-200 border-l-2 border-amber-400"
                      : "text-white/55 hover:text-white/90 hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-60 w-5">{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Контент */}
        <article className="min-w-0 space-y-14">
          {/* О произведении */}
          <Section id="about" icon="BookOpen" title="О произведении">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { k: "Автор", v: "Николай Васильевич Гоголь" },
                { k: "Жанр", v: "Комедия (социальная сатира)" },
                { k: "Написано", v: "1835–1836, окончательная редакция 1842" },
                { k: "Род литературы", v: "Драма" },
              ].map((row) => (
                <div key={row.k} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">{row.k}</div>
                  <div className="text-white/90 font-medium">{row.v}</div>
                </div>
              ))}
            </div>
            <P>
              «Ревизор» — вершина гоголевской сатиры и одна из самых едких комедий русской литературы. В основе пьесы — анекдотическая, но страшная по сути ситуация: мелкого петербургского чиновника по ошибке принимают за грозного столичного ревизора. И весь уездный город, погрязший во взятках и беззаконии, начинает заискивать перед пустым человеком.
            </P>
            <P>
              Гоголь не выдумывает злодеев — он показывает обычных людей, для которых воровство стало привычкой. Именно поэтому комедия так больно бьёт: зритель узнаёт в героях не «их», а самого себя.
            </P>
          </Section>

          {/* История создания */}
          <Section id="history" icon="ScrollText" title="История создания">
            <P>
              Сюжет «Ревизора» Гоголю подсказал Александр Пушкин. Он рассказал писателю историю о том, как одного человека в провинции приняли за важного столичного чиновника. Пушкин и сам однажды попадал в похожую ситуацию во время поездки по России.
            </P>
            <Callout icon="Quote" tone="amber" title="Замысел Гоголя">
              «Я решился собрать в одну кучу всё дурное в России, какое я тогда знал… и за одним разом посмеяться над всем», — так Гоголь объяснял свой замысел.
            </Callout>
            <P>
              Премьера состоялась в 1836 году в Александринском театре. Комедия вызвала скандал: чиновники узнали себя и были возмущены. Сам Николай I, по преданию, заметил: «Всем досталось, а мне — более всех». Резкая реакция так подействовала на Гоголя, что он на время уехал за границу.
            </P>
          </Section>

          {/* Сюжет */}
          <Section id="plot" icon="ListOrdered" title="Сюжет по действиям">
            <P className="mb-6">
              Действие происходит в уездном городе, «от которого хоть три года скачи, ни до какого государства не доедешь». Вся пьеса построена на одном грандиозном недоразумении.
            </P>
            <div className="space-y-4">
              {ACTS.map((a) => (
                <div key={a.act} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 pl-16">
                  <div className="absolute left-4 top-5 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-rose-500/20 border border-amber-400/30 flex items-center justify-center font-montserrat font-black text-amber-300">
                    {a.act}
                  </div>
                  <h4 className="font-montserrat font-bold text-white text-lg mb-1.5">{a.title}</h4>
                  <p className="text-white/65 leading-relaxed text-[15px]">{a.text}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Герои */}
          <Section id="heroes" icon="Users" title="Система образов">
            <P className="mb-6">
              У Гоголя нет ни одного положительного героя среди чиновников. Каждый — отдельный порок, а все вместе — портрет целого сословия.
            </P>
            <div className="grid sm:grid-cols-2 gap-3">
              {HEROES.map((h) => (
                <div key={h.name} className={`rounded-2xl border p-4 ${h.color}`}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-montserrat font-black text-base">{h.name}</span>
                    <span className="text-[11px] uppercase tracking-wider opacity-70">{h.role}</span>
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed">{h.trait}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Темы */}
          <Section id="themes" icon="Lightbulb" title="Темы и проблемы">
            <div className="grid sm:grid-cols-2 gap-4">
              {THEMES.map((th) => (
                <div key={th.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mb-3">
                    <Icon name={th.icon} size={18} className="text-amber-300" />
                  </div>
                  <h4 className="font-montserrat font-bold text-white mb-1.5">{th.title}</h4>
                  <p className="text-white/65 text-sm leading-relaxed">{th.text}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Композиция */}
          <Section id="composition" icon="Layers" title="Композиция и приёмы">
            <P>
              Гоголь применил новаторскую драматургию. Комедия начинается сразу с завязки — знаменитой фразы городничего, и это «фраза-выстрел», запускающая всё действие.
            </P>
            <div className="grid sm:grid-cols-2 gap-4 my-6">
              {[
                { t: "«Миражная интрига»", d: "Интрига строится вокруг пустоты: ревизора нет, но страх перед ним реален. Двигатель сюжета — не действие героя, а всеобщее заблуждение." },
                { t: "Говорящие фамилии", d: "Ляпкин-Тяпкин (делает «тяп-ляп»), Земляника, Гибнер, Держиморда — характер заложен уже в имени." },
                { t: "Немая сцена", d: "Уникальный финал: вместо развязки — оцепенение. Гоголь буквально «замораживает» героев, чтобы зритель вгляделся в их пороки." },
                { t: "Внесценический ревизор", d: "Настоящий ревизор так и не появляется. Он — символ неотвратимого возмездия, высшего суда совести." },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h4 className="font-montserrat font-bold text-amber-200 mb-1.5">{c.t}</h4>
                  <p className="text-white/65 text-sm leading-relaxed">{c.d}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Цитаты */}
          <Section id="quotes" icon="Quote" title="Цитаты с разбором">
            <div className="space-y-4">
              {QUOTES.map((q, i) => (
                <figure key={i} className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.06] to-transparent p-6">
                  <Icon name="Quote" size={22} className="text-amber-400/60 mb-3" />
                  <blockquote className="font-montserrat font-bold text-white text-lg md:text-xl leading-snug mb-2">
                    {q.text}
                  </blockquote>
                  <figcaption className="text-amber-300/80 text-sm font-medium mb-3">— {q.who}</figcaption>
                  <p className="text-white/65 text-sm leading-relaxed border-t border-white/10 pt-3">{q.note}</p>
                </figure>
              ))}
            </div>
          </Section>

          {/* Смысл */}
          <Section id="meaning" icon="Sparkles" title="Смысл произведения и финал">
            <P>
              «Ревизор» — это не просто сатира на чиновников. Это притча о человеческой совести. Город живёт спокойно, пока чувствует себя безнаказанным. Но стоит появиться угрозе разоблачения — и всё рушится, потому что внутри у каждого нечисто.
            </P>
            <P>
              Немая сцена в финале — главный нравственный аккорд. Известие о настоящем ревизоре звучит как гром среди ясного неба. Это символ Страшного суда, перед которым однажды предстанет каждый. Гоголь напоминает: настоящий «ревизор» — это совесть, и от неё не откупиться взятками.
            </P>
            <Callout icon="Heart" tone="rose" title="Вывод">
              Гоголь смеётся не для того, чтобы обидеть, а чтобы исцелить. Его смех зовёт человека стать чище. Именно поэтому «Ревизор» жив почти два века — пороки, над которыми он смеётся, не исчезли.
            </Callout>
          </Section>

          {/* Экзамен */}
          <Section id="exam" icon="GraduationCap" title="Подготовка к экзамену">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 mb-5">
              <h4 className="font-montserrat font-bold text-emerald-200 mb-3 flex items-center gap-2">
                <Icon name="PenLine" size={18} /> Аргументы для сочинения
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Проблема нравственного выбора и совести — страх героев рождён нечистой совестью, а не законом.",
                  "Тема обличения пороков общества — город как зеркало всей бюрократической России.",
                  "Роль смеха в литературе — «единственное честное лицо в комедии — смех».",
                  "Проблема истинного и ложного — пустой Хлестаков кажется значительным, потому что все хотят в это верить.",
                ].map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-white/75 text-[15px]">
                    <Icon name="Check" size={16} className="text-emerald-400 mt-1 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h4 className="font-montserrat font-bold text-white mb-3 flex items-center gap-2">
                <Icon name="HelpCircle" size={18} className="text-amber-300" /> Частые темы сочинений
              </h4>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {[
                  "В чём смысл немой сцены?",
                  "Что такое «хлестаковщина»?",
                  "Почему городничего обманул именно Хлестаков?",
                  "Над кем и над чем смеётся Гоголь?",
                ].map((t) => (
                  <div key={t} className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/75 text-sm">{t}</div>
                ))}
              </div>
            </div>
          </Section>

          {/* Тест */}
          <Section id="test" icon="CircleCheck" title="Проверь себя">
            <Quiz />
          </Section>

          {/* CTA — продукт */}
          <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.08] via-rose-500/[0.05] to-transparent p-7 md:p-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 text-xs font-bold uppercase tracking-wider mb-5">
              <Icon name="Sparkles" size={14} />
              Учись глубже
            </div>
            <h3 className="font-montserrat font-black text-2xl md:text-3xl mb-3">
              Понравился разбор? Это лишь начало.
            </h3>
            <p className="text-white/70 max-w-xl mx-auto mb-7">
              На УЧИСЬПРО — разборы всей школьной классики, подготовка к ЕГЭ и ОГЭ, личный ИИ-наставник и тренажёры. Учись легко и поступай уверенно.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-[#0b1020] font-black text-sm hover:opacity-90 transition-opacity"
              >
                <Icon name="Rocket" size={16} />
                Открыть платформу
              </Link>
              <Link
                to="/feed"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/8 hover:bg-white/15 text-white font-bold text-sm transition-colors"
              >
                <Icon name="BookOpen" size={16} />
                Другие разборы
              </Link>
            </div>
          </div>
        </article>
      </div>

      <SiteFooter />
    </div>
  );
}

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-rose-500/20 border border-amber-400/30 flex items-center justify-center">
          <Icon name={icon} size={18} className="text-amber-300" />
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-white/75 text-[16px] md:text-[17px] leading-[1.75] mb-4 ${className}`}>{children}</p>;
}

function Callout({
  icon,
  tone,
  title,
  children,
}: {
  icon: string;
  tone: "amber" | "rose";
  title: string;
  children: React.ReactNode;
}) {
  const tones = {
    amber: "border-amber-400/25 bg-amber-400/[0.06] text-amber-200",
    rose: "border-rose-400/25 bg-rose-400/[0.06] text-rose-200",
  };
  return (
    <div className={`rounded-2xl border p-5 my-5 ${tones[tone]}`}>
      <div className="flex items-center gap-2 font-montserrat font-bold mb-2">
        <Icon name={icon} size={17} />
        {title}
      </div>
      <p className="text-white/75 text-[15px] leading-relaxed">{children}</p>
    </div>
  );
}

const QUIZ: { q: string; options: string[]; correct: number }[] = [
  {
    q: "Кто подсказал Гоголю сюжет «Ревизора»?",
    options: ["В. Белинский", "А. Пушкин", "Сам Гоголь придумал", "Н. Карамзин"],
    correct: 1,
  },
  {
    q: "Кем на самом деле был Хлестаков?",
    options: ["Настоящим ревизором", "Богатым помещиком", "Мелким петербургским чиновником", "Шпионом"],
    correct: 2,
  },
  {
    q: "Чем заканчивается комедия?",
    options: ["Свадьбой", "Немой сценой", "Арестом городничего", "Отъездом всех в Петербург"],
    correct: 1,
  },
];

function Quiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  return (
    <div className="space-y-4">
      {QUIZ.map((item, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="font-montserrat font-bold text-white mb-3">
              {qi + 1}. {item.q}
            </p>
            <div className="grid gap-2">
              {item.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === item.correct;
                const show = chosen !== undefined;
                let cls = "border-white/10 bg-white/[0.02] text-white/75 hover:bg-white/[0.06]";
                if (show && isCorrect) cls = "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
                else if (show && isChosen && !isCorrect) cls = "border-rose-400/40 bg-rose-500/15 text-rose-200";
                return (
                  <button
                    key={oi}
                    onClick={() => chosen === undefined && setAnswers((a) => ({ ...a, [qi]: oi }))}
                    disabled={chosen !== undefined}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-sm transition-colors ${cls}`}
                  >
                    {show && isCorrect && <Icon name="Check" size={15} className="text-emerald-400 shrink-0" />}
                    {show && isChosen && !isCorrect && <Icon name="X" size={15} className="text-rose-400 shrink-0" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
