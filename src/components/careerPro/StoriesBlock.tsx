import Icon from "@/components/ui/icon";

interface Story {
  emoji: string;
  name: string;
  from: string;
  to: string;
  quote: string;
  color: string;
}

// Истории-примеры для профориентации. Показывают весь диапазон 17–45 лет
// и разные ситуации, чтобы человек узнал в них себя.
const STORIES: Story[] = [
  {
    emoji: "👩‍💼",
    name: "Ирина, 38 лет",
    from: "была бухгалтером",
    to: "UX-дизайн",
    quote: "«12 лет в цифрах и полное выгорание. Наставник увидел, что мне важна забота о людях и внимание к деталям — предложил UX. Впервые за годы иду на работу с удовольствием».",
    color: "from-purple-500/15 to-fuchsia-500/10 border-purple-500/25",
  },
  {
    emoji: "🧑‍🎓",
    name: "Максим, 17 лет",
    from: "выпускник, не знал куда поступать",
    to: "аналитика данных",
    quote: "«Все давили: “выбери профессию”. Прошёл чек-лист — оказалось, мне заходят логика и цифры. Теперь готовлюсь на дата-аналитика, а не наугад».",
    color: "from-cyan-500/15 to-blue-500/10 border-cyan-500/25",
  },
  {
    emoji: "👨‍🔧",
    name: "Денис, 29 лет",
    from: "работал в найме, хотел своё",
    to: "мастер по ремонту + услуги",
    quote: "«Руки золотые, а куда приложить — не понимал. Наставник собрал план: от навыков до первых заказов. Через 2 месяца — первые клиенты».",
    color: "from-amber-500/15 to-orange-500/10 border-amber-500/25",
  },
  {
    emoji: "👩‍🍼",
    name: "Оля, 34 года",
    from: "в декрете, боялась не вернуться",
    to: "SMM и контент",
    quote: "«Думала, что “выпала” навсегда. ИИ учёл, что у меня 3 часа в день, и дал реалистичный план. Работаю из дома, пока малыш спит».",
    color: "from-rose-500/15 to-pink-500/10 border-rose-500/25",
  },
  {
    emoji: "🧑‍💻",
    name: "Артём, 24 года",
    from: "менеджер, скучал на работе",
    to: "тестировщик (QA)",
    quote: "«Хотел в IT, но “поздно и не технарь” — так думал. Оказалось, моя дотошность — идеальна для QA. Уже прохожу собеседования».",
    color: "from-emerald-500/15 to-teal-500/10 border-emerald-500/25",
  },
  {
    emoji: "👩‍🏫",
    name: "Светлана, 45 лет",
    from: "продавец, хотела к людям",
    to: "коучинг и наставничество",
    quote: "«Думала, в 45 уже поздно. Наставник сказал: ваш опыт — это сила, а не помеха. Собрал путь в коучинг. Тот самый “пинок”, которого не хватало».",
    color: "from-violet-500/15 to-indigo-500/10 border-violet-500/25",
  },
];

export default function StoriesBlock() {
  return (
    <section className="mb-10" aria-label="Истории людей, которые нашли себя">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200 bg-cyan-500/15 border border-cyan-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="Users" size={13} /> Реальные истории
        </span>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">
          Возможно, вы узнаете себя
        </h2>
        <p className="text-white/55 text-sm mt-2 max-w-lg mx-auto">
          Разные возрасты, разные ситуации — общий результат: ясность и первый шаг.
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
                  <Icon name="ArrowRight" size={12} className="text-cyan-300 flex-shrink-0" />
                  <span className="text-cyan-200 font-semibold">{s.to}</span>
                </div>
              </div>
            </div>
            <p className="text-white/75 text-sm leading-snug">{s.quote}</p>
          </div>
        ))}
      </div>

      <p className="text-white/35 text-[11px] text-center mt-4">
        Истории собирательные — показывают, как работает подбор. Результат зависит от ваших усилий.
      </p>
    </section>
  );
}
