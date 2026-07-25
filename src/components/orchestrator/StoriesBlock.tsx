import Icon from "@/components/ui/icon";

const STORIES = [
  {
    emoji: "💻",
    name: "IT-студия, 8 фрилансеров",
    from: "ввод в проект 4 дня",
    to: "1 день",
    quote: "«Раньше каждого разработчика вводили вручную по 3–4 дня. Теперь трек готов за минуту, а входной контроль отсеивает слабых до старта».",
    color: "from-cyan-500/15 to-blue-500/10 border-cyan-500/25",
  },
  {
    emoji: "✍️",
    name: "Контент-агентство",
    from: "40% текстов на переделку",
    to: "−50% правок",
    quote: "«Чёткие критерии “готово” и tone of voice в задаче убрали половину правок. Копирайтеры сразу понимают, что от них хотят».",
    color: "from-violet-500/15 to-fuchsia-500/10 border-violet-500/25",
  },
  {
    emoji: "📞",
    name: "Удалённый отдел продаж",
    from: "хаос в статусах",
    to: "прозрачные метрики",
    quote: "«Дашборд показывает, кто на каком этапе и у кого проседает качество. Риски видно заранее — тушим до срыва, а не после».",
    color: "from-emerald-500/15 to-teal-500/10 border-emerald-500/25",
  },
  {
    emoji: "🎨",
    name: "Дизайн-команда",
    from: "теряли задачи",
    to: "−60% пропущенных дедлайнов",
    quote: "«Микрозадачи с дедлайнами и напоминаниями. Ничего не теряется, история по каждому исполнителю — как на ладони».",
    color: "from-amber-500/15 to-orange-500/10 border-amber-500/25",
  },
];

export default function StoriesBlock() {
  return (
    <section className="mb-10" aria-label="Истории команд, которым помог Оркестратор">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="Users" size={13} /> Реальные результаты
        </span>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Оркестр играет по нотам</h2>
        <p className="text-white/55 text-sm mt-2 max-w-lg mx-auto">
          Быстрый ввод, меньше правок, прозрачные метрики — вместо ручного тушения пожаров.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {STORIES.map((s, i) => (
          <div key={i} className={`rounded-2xl border bg-gradient-to-br p-5 ${s.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">{s.emoji}</div>
              <div className="min-w-0">
                <div className="font-bold text-white text-[15px]">{s.name}</div>
                <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5 flex-wrap">
                  <span>{s.from}</span>
                  <Icon name="ArrowRight" size={12} className="text-violet-300 flex-shrink-0" />
                  <span className="text-violet-200 font-semibold">{s.to}</span>
                </div>
              </div>
            </div>
            <p className="text-white/75 text-sm leading-snug">{s.quote}</p>
          </div>
        ))}
      </div>
      <p className="text-white/35 text-[11px] text-center mt-4">
        Истории собирательные. Результат зависит от вашего процесса и данных.
      </p>
    </section>
  );
}
