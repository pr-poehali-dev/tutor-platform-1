import Icon from "@/components/ui/icon";

const STEPS = [
  {
    icon: "MousePointerClick",
    title: "Выбери курс",
    description: "Первый урок открыт бесплатно — без карты и регистрации. Просто зайди и попробуй.",
    accent: "from-purple-500 to-pink-500",
    glow: "border-purple-500/25",
  },
  {
    icon: "Bot",
    title: "Учись с ИИ-репетитором",
    description: "Объясняет простыми словами, проверяет решения и ведёт по программе 24/7.",
    accent: "from-cyan-500 to-blue-500",
    glow: "border-cyan-500/25",
  },
  {
    icon: "Unlock",
    title: "Открой весь курс",
    description: "Разовая оплата картой или через СБП — и доступ к курсу остаётся навсегда.",
    accent: "from-emerald-500 to-teal-500",
    glow: "border-emerald-500/25",
  },
  {
    icon: "Trophy",
    title: "Получи результат",
    description: "Отслеживай прогресс, закрывай темы и получай именной сертификат по итогу.",
    accent: "from-amber-500 to-orange-500",
    glow: "border-amber-500/25",
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="how-it-works-title">
      <div className="text-center mb-10">
        <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
          Всё просто
        </p>
        <h2
          id="how-it-works-title"
          className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight"
        >
          Как это <span className="gradient-text-purple">работает</span>
        </h2>
        <p className="text-white/60 text-sm md:text-base mt-3 max-w-2xl mx-auto">
          От первого бесплатного урока до результата — четыре понятных шага без лишних усилий.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className={`relative rounded-3xl border ${step.glow} bg-white/[0.03] p-6 hover:bg-white/[0.05] hover:translate-y-[-2px] transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center flex-shrink-0`}
              >
                <Icon name={step.icon} size={22} className="text-white" />
              </div>
              <span
                className={`font-montserrat font-black text-4xl bg-gradient-to-br ${step.accent} bg-clip-text text-transparent leading-none`}
              >
                {i + 1}
              </span>
            </div>
            <h3 className="font-montserrat font-black text-lg text-white mb-2 leading-snug">
              {step.title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
