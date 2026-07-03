import Icon from "@/components/ui/icon";

/**
 * Визуальная схема экосистемы EduFlow AI — замкнутый цикл
 * от идеи до масштабирования. Показывает, что платформа закрывает
 * весь путь автора курса, а не отдельный кусок.
 */

const STAGES: { icon: string; step: string; title: string; desc: string; accent: string }[] = [
  {
    icon: "Sparkles",
    step: "01",
    title: "ИИ-старт и контент",
    desc: "Вводите тему и аудиторию — ИИ собирает структуру курса, уроки, тесты и маркетинг-план. Транскрибирует ваши видео в тесты.",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: "Blocks",
    step: "02",
    title: "Конструктор без кода",
    desc: "Собираете курс и воронку продаж мышкой. Автоворонки по статусам ученика: «зарегистрировался», «не сдал ДЗ» — без программиста.",
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: "Wallet",
    step: "03",
    title: "Встроенные финансы",
    desc: "Приём оплат, рассрочка, чеки и отчёты для налоговой, работа с самозанятыми и юрлицами. Партнёрство с банками для счёта и кредита.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: "Workflow",
    step: "04",
    title: "Автоматизация",
    desc: "Синхронизация с CRM и рассылками. После оплаты доступ открывается сам, при просрочке — блокируется. Сценарии на любой случай.",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    icon: "ChartLine",
    step: "05",
    title: "Аналитика и рост",
    desc: "Дашборды: воронка, доходимость, NPS. ИИ подсказывает: «этот модуль снижает конверсию» или «лучшее время рассылки — вторник 15:00».",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: "Building2",
    step: "06",
    title: "White-label и сети",
    desc: "Разверните школу под своим брендом и доменом. Стройте сети курсов, партнёрские программы и маркетплейс на общем ИИ-движке.",
    accent: "from-rose-500 to-red-500",
  },
];

export default function ForBusinessEcosystem() {
  return (
    <section id="ecosystem" className="mb-16 scroll-mt-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-4">
          <Icon name="Infinity" size={13} className="text-cyan-300" />
          <span className="text-cyan-200 text-xs font-bold uppercase tracking-wider">Экосистема EduFlow AI</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
          Замкнутый цикл:{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            от идеи до масштабирования
          </span>
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto">
          Не десяток разрозненных сервисов, а единая связка. ИИ и финсервисы снимают
          рутину — вы занимаетесь продуктом и учениками.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAGES.map((s, i) => (
          <div
            key={s.step}
            className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.accent} flex items-center justify-center`}>
                <Icon name={s.icon} size={22} className="text-white" fallback="Circle" />
              </div>
              <span className="font-montserrat font-black text-white/10 text-3xl">{s.step}</span>
            </div>
            <h3 className="font-montserrat font-black text-white text-lg mb-2">{s.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
            {i < STAGES.length - 1 && (
              <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-background border border-white/15 items-center justify-center">
                <Icon name="ChevronRight" size={11} className="text-white/40" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-4 py-2">
          <Icon name="Zap" size={14} className="text-violet-300" />
          <span className="text-white/70 text-xs">Быстрый запуск без интеграций</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-4 py-2">
          <Icon name="ShieldCheck" size={14} className="text-emerald-300" />
          <span className="text-white/70 text-xs">Данные и платежи под защитой</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-4 py-2">
          <Icon name="Users" size={14} className="text-cyan-300" />
          <span className="text-white/70 text-xs">Сообщество авторов внутри</span>
        </div>
      </div>
    </section>
  );
}
