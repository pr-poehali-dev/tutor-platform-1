import Icon from "@/components/ui/icon";

const PROBLEMS: { emoji: string; text: string }[] = [
  { emoji: "😮‍💨", text: "Месяцы на запись уроков и написание программы вручную" },
  { emoji: "🧩", text: "Отдельно платформа, отдельно оплаты, отдельно рассылки — всё разрозненно" },
  { emoji: "💸", text: "Конкуренты берут абонплату и большой процент, а результат делаете вы сами" },
  { emoji: "🕐", text: "Ученики ждут ответа на вопрос сутками — падает доходимость" },
];

const PILLARS: { icon: string; title: string; desc: string; accent: string }[] = [
  {
    icon: "Sparkles",
    title: "ИИ-фабрика курсов",
    desc: "Вводите тему — искусственный интеллект за час собирает программу, уроки, тесты и даже видео с озвучкой. Вам остаётся отредактировать и запустить.",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: "Bot",
    title: "ИИ-преподаватель 24/7",
    desc: "У каждой школы — свой ИИ-наставник. Он отвечает ученикам круглосуточно, проверяет домашки и держит их в потоке, пока вы спите.",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    icon: "Palette",
    title: "Ваш бренд, ваш домен",
    desc: "White-label: свой логотип, цвета и адрес школы. Ученики видят ваш бренд — нас в кадре нет.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: "Wallet",
    title: "Готовые деньги",
    desc: "Приём оплат, тарифы, промокоды, рассрочка и выплаты автору — из коробки. Подключается за пару кликов.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const AUDIENCE: { emoji: string; title: string; desc: string }[] = [
  { emoji: "🎤", title: "Авторам и экспертам", desc: "Запустите свою мини-школу за вечер, без техников и подрядчиков." },
  { emoji: "🏫", title: "Онлайн-школам", desc: "Перенесите курсы на одну платформу и усильте их ИИ-преподавателем." },
  { emoji: "🏢", title: "Бизнесу", desc: "Онбординг и обучение сотрудников с автопроверкой знаний." },
  { emoji: "🎓", title: "Учебным центрам", desc: "Допобразование и подготовка с прогрессом и сертификатами." },
];

const STEPS: { n: string; title: string; desc: string }[] = [
  { n: "1", title: "Опишите тему", desc: "Скажите, чему хотите учить — одной фразой." },
  { n: "2", title: "ИИ соберёт курс", desc: "Программа, уроки, тесты и видео готовы за час." },
  { n: "3", title: "Настройте бренд", desc: "Логотип, цвета, домен, цены и тарифы." },
  { n: "4", title: "Запустите продажи", desc: "Приём оплат и ИИ-наставник для учеников включены." },
];

const COMPARE: { feature: string; us: boolean; others: string }[] = [
  { feature: "ИИ создаёт курс целиком за час", us: true, others: "Всё вручную" },
  { feature: "ИИ-преподаватель для учеников 24/7", us: true, others: "Нет или чат-бот сбоку" },
  { feature: "Автопроверка домашних заданий", us: true, others: "Вручную" },
  { feature: "White-label: свой бренд и домен", us: true, others: "Часто на верхних тарифах" },
  { feature: "Приём оплат и выплаты из коробки", us: true, others: "Интеграции и доплаты" },
  { feature: "Запуск школы за один вечер", us: true, others: "Недели настройки" },
];

const TESTIMONIALS: { name: string; role: string; emoji: string; text: string }[] = [
  {
    name: "Марина К.",
    role: "автор курсов по английскому",
    emoji: "🎤",
    text: "Запускала школу три месяца на другом конструкторе и бросила. Здесь ИИ собрал программу и уроки за вечер — я только отредактировала под себя. Первые продажи пошли на той же неделе.",
  },
  {
    name: "Онлайн-школа «Логос»",
    role: "подготовка к ЕГЭ",
    emoji: "🏫",
    text: "Перенесли 8 курсов на платформу. ИИ-преподаватель закрыл боль с ответами ученикам ночью — доходимость до конца курса выросла заметно, а нам не пришлось расширять штат кураторов.",
  },
  {
    name: "Дмитрий В.",
    role: "эксперт по маркетингу",
    emoji: "💼",
    text: "Модель без абонплаты — то, что нужно на старте. Плачу процент только с реальных продаж, а не за воздух. Свой домен и логотип: ученики даже не знают, что под капотом чужая платформа.",
  },
];

export default function ForBusinessValue() {
  return (
    <>
      {/* Боль */}
      <section className="mb-16">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">
          Запуск школы отнимает месяцы. Мы сжали это в вечер
        </h2>
        <p className="text-white/55 text-center text-sm max-w-xl mx-auto mb-8">
          Знакомые проблемы каждого, кто хоть раз запускал обучение:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {PROBLEMS.map((p) => (
            <div key={p.text} className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <span className="text-2xl flex-shrink-0">{p.emoji}</span>
              <p className="text-white/75 text-sm leading-snug">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 столпа */}
      <section className="mb-16">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">
          Не движок, а{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">готовый результат</span>
        </h2>
        <p className="text-white/55 text-center text-sm max-w-xl mx-auto mb-8">
          Четыре вещи, которых нет ни у одного конкурента из коробки
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-colors">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-4`}>
                <Icon name={p.icon} size={22} className="text-white" />
              </div>
              <h3 className="font-montserrat font-black text-white text-lg mb-2">{p.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Как работает */}
      <section id="how" className="mb-16 scroll-mt-20">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Как это работает</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-montserrat font-black text-white mx-auto mb-3">
                {s.n}
              </div>
              <p className="font-bold text-white text-sm mb-1">{s.title}</p>
              <p className="text-white/55 text-xs leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Для кого */}
      <section className="mb-16">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Кому подходит</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AUDIENCE.map((a) => (
            <div key={a.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <div className="text-3xl mb-2">{a.emoji}</div>
              <p className="font-bold text-white text-sm mb-1">{a.title}</p>
              <p className="text-white/55 text-xs leading-snug">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Сравнение */}
      <section className="mb-16">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Почему это эталон</h2>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-3 border-b border-white/10 text-xs font-bold text-white/50">
            <div>Возможность</div>
            <div className="w-24 text-center text-violet-300">УЧИСЬПРО</div>
            <div className="w-28 text-center hidden sm:block">Другие</div>
          </div>
          {COMPARE.map((c) => (
            <div key={c.feature} className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-3 border-b border-white/5 last:border-0 items-center">
              <div className="text-white/80 text-sm leading-snug">{c.feature}</div>
              <div className="w-24 flex justify-center">
                <Icon name="CircleCheck" size={20} className="text-emerald-400" />
              </div>
              <div className="w-28 text-center text-white/40 text-xs hidden sm:block">{c.others}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Отзывы */}
      <section className="mb-16">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Что говорят наши партнёры</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col">
              <div className="flex text-amber-400 mb-3" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="Star" size={15} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-white/75 text-sm leading-relaxed flex-1 mb-4">«{t.text}»</p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/8">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center text-lg flex-shrink-0">
                  {t.emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{t.name}</p>
                  <p className="text-white/45 text-xs truncate">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
