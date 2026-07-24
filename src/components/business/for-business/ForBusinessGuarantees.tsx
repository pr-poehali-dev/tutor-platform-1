import Icon from "@/components/ui/icon";

interface Offer {
  icon: string;
  badge: string;
  title: string;
  text: string;
  accent: string;
}

// Сильные офферы-гарантии в духе лучших B2B-платформ: снимают все возражения.
const OFFERS: Offer[] = [
  {
    icon: "Video",
    badge: "25 минут",
    title: "Живое демо под вашу нишу",
    text: "Покажем платформу и прямо на созвоне соберём ваш первый курс на ИИ по вашей теме. Вы увидите результат за минуты, а не за недели.",
    accent: "from-violet-500/15 to-fuchsia-500/10 border-violet-400/30",
  },
  {
    icon: "Truck",
    badge: "Бесплатно",
    title: "Переезд под ключ",
    text: "Уходите с GetCourse, Skillspace или другой платформы? Перенесём ваши курсы, уроки, учеников и процессы — вам не нужно ничего делать руками.",
    accent: "from-cyan-500/15 to-blue-500/10 border-cyan-400/30",
  },
  {
    icon: "Gift",
    badge: "14 дней",
    title: "Максимум бесплатно",
    text: "Полный доступ ко всем возможностям на 14 дней — всей командой. Запустите школу, проверьте продажи и только потом решайте.",
    accent: "from-emerald-500/15 to-teal-500/10 border-emerald-400/30",
  },
  {
    icon: "ShieldCheck",
    badge: "0 ₽ абонплаты",
    title: "Платите только с продаж",
    text: "Никакой ежемесячной платы за «место». Нет продаж — нет платы. Мы зарабатываем, только когда зарабатываете вы.",
    accent: "from-amber-500/15 to-orange-500/10 border-amber-400/30",
  },
];

export default function ForBusinessGuarantees() {
  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-500/12 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
          <Icon name="BadgeCheck" size={12} className="text-emerald-300" />
          <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Никакого риска</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl mb-3 leading-tight">
          Запустить школу{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            проще, чем кажется
          </span>
        </h2>
        <p className="text-white/65 text-sm md:text-base max-w-2xl mx-auto">
          Мы убрали всё, что мешает начать: долгий запуск, страх переезда, абонплату и риск «не подойдёт».
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OFFERS.map((o) => (
          <div
            key={o.title}
            className={`rounded-3xl border bg-gradient-to-br p-6 flex flex-col ${o.accent}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <Icon name={o.icon} size={22} className="text-white" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-white bg-white/15 rounded-lg px-2.5 py-1">
                {o.badge}
              </span>
            </div>
            <h3 className="font-montserrat font-black text-white text-lg mb-2 leading-tight">{o.title}</h3>
            <p className="text-white/70 text-sm leading-snug">{o.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/55 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="Check" size={14} className="text-emerald-400" /> Без карты для старта
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="Check" size={14} className="text-emerald-400" /> Запуск за один вечер
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="Check" size={14} className="text-emerald-400" /> Свой бренд и домен
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="Check" size={14} className="text-emerald-400" /> Приём оплат из коробки
        </span>
      </div>
    </section>
  );
}
