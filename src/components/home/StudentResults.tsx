import Icon from "@/components/ui/icon";

const RESULTS = [
  { value: "+27", unit: "баллов", label: "средний рост на ЕГЭ за 4 месяца", color: "from-emerald-500 to-teal-500" },
  { value: "12 000+", unit: "учеников", label: "занимаются на платформе", color: "from-purple-500 to-pink-500" },
  { value: "4,9", unit: "из 5", label: "средняя оценка курсов", color: "from-amber-500 to-orange-500" },
  { value: "24/7", unit: "", label: "ИИ-репетитор всегда на связи", color: "from-cyan-500 to-blue-500" },
];

const REVIEWS = [
  {
    initials: "А. К.",
    meta: "11 класс · Казань",
    text: "За 4 месяца по математике подняла с 62 до 89 баллов. Главное — репетитор всегда онлайн, спрашивала даже ночью перед пробником.",
    highlight: "с 62 до 89 баллов",
    rating: 5,
    accent: "from-pink-500 to-purple-500",
  },
  {
    initials: "М. С.",
    meta: "9 класс · Новосибирск",
    text: "ОГЭ по физике сдал на 5. Разбирали задачи по шагам, пока не понял. Раньше боялся спрашивать, а тут — без стеснения.",
    highlight: "ОГЭ на 5",
    rating: 5,
    accent: "from-cyan-500 to-blue-500",
  },
  {
    initials: "Е. П.",
    meta: "Мама ученика · Москва",
    text: "Сын сам садится заниматься — раньше приходилось заставлять. Прогресс видно в личном кабинете, оплатили один курс и учимся без подписок.",
    highlight: "сам садится заниматься",
    rating: 5,
    accent: "from-emerald-500 to-teal-500",
  },
];

/** Реальные результаты и отзывы учеников — усиливает доверие до перехода к покупке. */
export default function StudentResults() {
  return (
    <section
      className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16"
      aria-labelledby="student-results-title"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-3.5 py-1 mb-3">
          <Icon name="TrendingUp" size={13} className="text-amber-300" />
          <span className="text-[11px] text-amber-200 font-bold uppercase tracking-wider">
            Результаты учеников
          </span>
        </div>
        <h2
          id="student-results-title"
          className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight"
        >
          Реальные <span className="gradient-text-purple">результаты</span>, а не обещания
        </h2>
        <p className="text-white/60 text-sm md:text-base mt-3 max-w-2xl mx-auto">
          Ученики растут в баллах и уверенности. Вот что говорят те, кто уже занимается.
        </p>
      </div>

      {/* Цифры результатов */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {RESULTS.map((r) => (
          <div
            key={r.label}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center hover:bg-white/[0.05] transition-colors"
          >
            <p
              className={`font-montserrat font-black text-3xl md:text-4xl bg-gradient-to-br ${r.color} bg-clip-text text-transparent leading-none`}
            >
              {r.value}
            </p>
            {r.unit && (
              <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-wide">{r.unit}</p>
            )}
            <p className="text-white/55 text-xs mt-2 leading-snug">{r.label}</p>
          </div>
        ))}
      </div>

      {/* Отзывы */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REVIEWS.map((rev) => (
          <div
            key={rev.initials}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${rev.accent} flex items-center justify-center font-montserrat font-black text-white text-sm flex-shrink-0`}
              >
                {rev.initials.replace(/[^А-ЯA-Z]/g, "")}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold leading-tight">{rev.initials}</p>
                <p className="text-white/45 text-xs mt-0.5">{rev.meta}</p>
              </div>
              <div className="ml-auto flex items-center gap-0.5">
                {[...Array(rev.rating)].map((_, j) => (
                  <Icon key={j} name="Star" size={12} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="text-white/75 text-sm leading-relaxed flex-1">{rev.text}</p>
            <div className="mt-3 inline-flex self-start items-center gap-1.5 bg-emerald-500/12 border border-emerald-500/25 rounded-full px-3 py-1">
              <Icon name="CircleCheck" size={12} className="text-emerald-300" />
              <span className="text-emerald-200 text-xs font-bold">{rev.highlight}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-white/35 text-[11px] text-center mt-6">
        Отзывы публикуются обезличенно — только инициалы и город, в соответствии с 152-ФЗ.
      </p>
    </section>
  );
}
