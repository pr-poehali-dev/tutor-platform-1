import Icon from "@/components/ui/icon";

/**
 * Блок экспертности и доверия — продаёт компетенцию платформы ДО расчётов.
 * Три пласта: измеримые достижения, гарантии/юр. чистота, зона ответственности.
 * Цель — снять сомнения предпринимателя и показать, что за платформой стоит опыт.
 */

const METRICS: { value: string; label: string; icon: string }[] = [
  { value: "7 лет", label: "в EdTech и онлайн-образовании", icon: "CalendarCheck" },
  { value: "2 800+", label: "готовых уроков в базе платформы", icon: "BookOpen" },
  { value: "24/7", label: "ИИ-преподаватель на связи с учениками", icon: "Bot" },
  { value: "99,9%", label: "аптайм — школа работает без сбоев", icon: "Activity" },
];

const GUARANTEES: { icon: string; title: string; desc: string; accent: string }[] = [
  {
    icon: "ScrollText",
    title: "Работаем по договору",
    desc: "Прозрачные условия на бумаге. Никакой абонплаты — платите только процент с реальных продаж.",
    accent: "text-violet-300",
  },
  {
    icon: "ReceiptText",
    title: "Чеки и налоги по 54-ФЗ",
    desc: "Каждая оплата — с фискальным чеком. Отчёты для налоговой формируются автоматически.",
    accent: "text-emerald-300",
  },
  {
    icon: "Users",
    title: "Самозанятые, ИП и юрлица",
    desc: "Легальные выплаты авторам и кураторам. Работаем с любой формой — без серых схем.",
    accent: "text-cyan-300",
  },
  {
    icon: "ShieldCheck",
    title: "Данные под защитой",
    desc: "Персональные данные учеников и платежи защищены. Хранение по 152-ФЗ на серверах в РФ.",
    accent: "text-amber-300",
  },
];

const RESPONSIBILITY: { icon: string; text: string }[] = [
  { icon: "Wallet", text: "Приём оплат, рассрочка и выплаты — берём на себя" },
  { icon: "Headset", text: "Техподдержка и сопровождение запуска школы" },
  { icon: "RefreshCw", text: "Обновления платформы и ИИ-движка без доплат" },
  { icon: "LineChart", text: "Аналитика и рекомендации по росту продаж" },
];

export default function ForBusinessExpertise() {
  return (
    <section id="expertise" className="mb-16 scroll-mt-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
          <Icon name="BadgeCheck" size={13} className="text-emerald-300" />
          <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">Экспертность и ответственность</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
          Почему вам можно{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">доверить свою школу</span>
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto">
          Мы не просто даём инструмент — мы берём на себя техническую, финансовую и юридическую сторону.
          Вы отвечаете за экспертизу, мы — за всё остальное.
        </p>
      </div>

      {/* Метрики-достижения */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 flex items-center justify-center mx-auto mb-3">
              <Icon name={m.icon} size={19} className="text-white" fallback="Circle" />
            </div>
            <p className="font-montserrat font-black text-white text-2xl mb-1">{m.value}</p>
            <p className="text-white/50 text-xs leading-snug">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Гарантии и юр. чистота */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {GUARANTEES.map((g) => (
          <div key={g.title} className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-3xl p-5 hover:border-white/20 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0">
              <Icon name={g.icon} size={20} className={g.accent} fallback="ShieldCheck" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-white text-base mb-1">{g.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Зона ответственности платформы */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-700/20 via-fuchsia-600/10 to-cyan-700/15 p-6 md:p-8">
        <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-violet-500/15 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="HandHeart" size={18} className="text-cyan-300" fallback="Heart" />
            <h3 className="font-montserrat font-black text-white text-lg md:text-xl">Что мы берём на себя</h3>
          </div>
          <p className="text-white/60 text-sm mb-6 max-w-xl">
            Вы фокусируетесь на своём продукте и учениках. Рутину, деньги и технологии закрываем мы.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {RESPONSIBILITY.map((r) => (
              <div key={r.text} className="flex items-center gap-3 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3">
                <Icon name={r.icon} size={17} className="text-emerald-300 flex-shrink-0" fallback="Check" />
                <span className="text-white/80 text-sm leading-snug">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
