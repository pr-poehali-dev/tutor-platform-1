import Icon from "@/components/ui/icon";

interface Story {
  emoji: string;
  name: string;
  from: string;
  to: string;
  quote: string;
  color: string;
}

// Истории-примеры для финансового консультанта: разные ситуации по деньгам.
const STORIES: Story[] = [
  {
    emoji: "☕",
    name: "Кофейня, оборот 900к/мес",
    from: "хотели брать кредит на выживание",
    to: "вышли в плюс без займа",
    quote: "«Анализ показал: мы в убытке, а новый кредит только утопил бы нас. Финансист отговорил и показал, где резать расходы. За 2 месяца вышли в плюс — без единого рубля долга».",
    color: "from-rose-500/15 to-orange-500/10 border-rose-500/25",
  },
  {
    emoji: "🛠️",
    name: "Производство мебели",
    from: "оборот рос, а денег не было",
    to: "нашли утечку 400к/мес",
    quote: "«Крутились как белки, а прибыли ноль. Разбор по цифрам вскрыл дыру в дебиторке и заниженные цены. Подняли маржу — впервые увидели реальную прибыль».",
    color: "from-cyan-500/15 to-blue-500/10 border-cyan-500/25",
  },
  {
    emoji: "💻",
    name: "IT-студия",
    from: "искали инвестора на любых условиях",
    to: "выросли на реинвесте прибыли",
    quote: "«Готовы были отдать долю за копейки. Финансист показал, что у нас здоровая маржа и инвестор не нужен — хватит реинвеста. Сэкономили половину бизнеса».",
    color: "from-emerald-500/15 to-teal-500/10 border-emerald-500/25",
  },
  {
    emoji: "🌱",
    name: "Эко-ферма",
    from: "не знали про поддержку МСП",
    to: "получили грант на развитие",
    quote: "«Думали, гранты — это не для нас. Анализ подсказал подходящую программу под нашу нишу. Собрали заявку и получили деньги на оборудование».",
    color: "from-lime-500/15 to-emerald-500/10 border-lime-500/25",
  },
  {
    emoji: "🏬",
    name: "Розничный магазин",
    from: "кассовые разрывы каждый месяц",
    to: "стабильный денежный поток",
    quote: "«Постоянно не хватало денег к 20-му числу. Финансист помог выстроить платёжный календарь и подушку. Разрывы ушли, сплю спокойно».",
    color: "from-purple-500/15 to-fuchsia-500/10 border-purple-500/25",
  },
  {
    emoji: "🚚",
    name: "Логистика",
    from: "хотели купить фуры в кредит",
    to: "выбрали лизинг и сэкономили",
    quote: "«Собирались брать технику в кредит. Финансист посчитал и показал: лизинг выгоднее по налогам и не съедает подушку. Разница — сотни тысяч в год».",
    color: "from-amber-500/15 to-orange-500/10 border-amber-500/25",
  },
];

export default function StoriesBlock() {
  return (
    <section className="mb-10" aria-label="Истории бизнесов, которым помог финансовый анализ">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-500/15 border border-emerald-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="Users" size={13} /> Реальные истории
        </span>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">
          Цифры не врут — и это спасает бизнесы
        </h2>
        <p className="text-white/55 text-sm mt-2 max-w-lg mx-auto">
          Иногда честный анализ уберегает от дорогой ошибки. Иногда — открывает деньги, которые лежали рядом.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {STORIES.map((s, i) => (
          <div
            key={i}
            className={`rounded-2xl border bg-gradient-to-br p-5 ${s.color}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                {s.emoji}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-[15px]">{s.name}</div>
                <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5 flex-wrap">
                  <span>{s.from}</span>
                  <Icon name="ArrowRight" size={12} className="text-emerald-300 flex-shrink-0" />
                  <span className="text-emerald-200 font-semibold">{s.to}</span>
                </div>
              </div>
            </div>
            <p className="text-white/75 text-sm leading-snug">{s.quote}</p>
          </div>
        ))}
      </div>

      <p className="text-white/35 text-[11px] text-center mt-4">
        Истории собирательные — показывают, как работает анализ. Результат зависит от ваших данных и решений.
      </p>
    </section>
  );
}
