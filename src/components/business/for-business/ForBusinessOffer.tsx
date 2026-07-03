import Icon from "@/components/ui/icon";
import BusinessLeadForm from "@/components/business/BusinessLeadForm";
import { FOR_BUSINESS_FAQ as FAQ } from "./forBusinessData";

const PLANS: {
  id: "start" | "pro" | "scale";
  name: string;
  price: string;
  note: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    id: "start",
    name: "Старт",
    price: "8%",
    note: "для авторов и экспертов",
    features: ["1 школа, свой бренд", "ИИ-генерация курсов", "Приём оплат внутри", "До 300 учеников", "Без абонплаты"],
  },
  {
    id: "pro",
    name: "Про",
    price: "5%",
    note: "для растущих школ",
    features: ["Свой домен", "ИИ-преподаватель 24/7", "Промокоды и рассрочка", "Аналитика продаж", "До 3000 учеников", "Без абонплаты"],
    highlight: true,
  },
  {
    id: "scale",
    name: "Масштаб",
    price: "3%",
    note: "для сетей и команд",
    features: ["Несколько школ", "Роли и команда", "API и интеграции", "Приоритетная поддержка", "Без лимитов", "Без абонплаты"],
  },
];

export default function ForBusinessOffer() {
  return (
    <>
      {/* Тарифы */}
      <section className="mb-16">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">Платите, только когда зарабатываете</h2>
        <p className="text-white/55 text-center text-sm max-w-xl mx-auto mb-8">
          Никакой абонплаты. Только процент с ваших продаж — приём платежей уже входит. Нет продаж — нет платы.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`rounded-3xl border p-6 flex flex-col ${
                p.highlight
                  ? "border-violet-400/50 bg-gradient-to-br from-violet-500/12 to-cyan-500/8"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {p.highlight && (
                <span className="self-start text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/20 rounded-lg px-2 py-0.5 mb-3">
                  Популярный
                </span>
              )}
              <h3 className="font-montserrat font-black text-white text-xl mb-1">{p.name}</h3>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-montserrat font-black text-3xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{p.price}</span>
                <span className="text-white/45 text-xs">с продаж</span>
              </div>
              <p className="text-white/70 text-sm mb-4">{p.note}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                    <Icon name="Check" size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#lead"
                className={`inline-flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-transform hover:scale-[1.02] ${
                  p.highlight
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                    : "border border-white/15 text-white/85 hover:bg-white/[0.05]"
                }`}
              >
                Обсудить тариф
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Форма заявки */}
      <section id="lead" className="mb-16 scroll-mt-20">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">
              Соберём ваш первый курс на демо
            </h2>
            <p className="text-white/65 text-sm leading-relaxed mb-5">
              Оставьте заявку — назначим короткий созвон, покажем платформу и прямо при вас сгенерируем курс по вашей теме. Вы увидите результат за минуты и получите расчёт цены под вашу школу.
            </p>
            <ul className="space-y-3">
              {[
                "Демо платформы под вашу нишу",
                "Живая генерация курса на ИИ",
                "Расчёт тарифа и комиссии",
                "Помощь с переносом существующих курсов",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-white/80 text-sm">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={14} className="text-violet-300" />
                  </div>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <BusinessLeadForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Частые вопросы</h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQ.map((f) => (
            <div key={f.q} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm mb-2 flex items-start gap-2">
                <Icon name="HelpCircle" size={16} className="text-violet-300 mt-0.5 flex-shrink-0" />
                {f.q}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Финальный CTA */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/25 via-fuchsia-500/15 to-cyan-600/20 p-8 md:p-12 text-center">
          <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3 leading-tight">
              Запустите свою школу уже сегодня
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-7">
              Оставьте заявку — покажем платформу и прямо на демо соберём ваш первый курс на ИИ. Без абонплаты: платите только процент с продаж.
            </p>
            <a
              href="#lead"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-7 py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/25"
            >
              <Icon name="Rocket" size={18} /> Получить демо и цену
            </a>
          </div>
        </div>
      </section>
    </>
  );
}