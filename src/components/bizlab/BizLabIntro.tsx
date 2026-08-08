import Icon from "@/components/ui/icon";
import { STAGES } from "./stages";

export default function Intro({ onStart, hasDraft }: { onStart: () => void; hasDraft: boolean }) {
  const blocks = [
    {
      icon: "Calculator",
      title: "Считает честно",
      text: "Юнит-экономика, точка безубыточности, запас прочности, окупаемость — по вашим цифрам, без округлений в приятную сторону.",
    },
    {
      icon: "ShieldAlert",
      title: "Проверяет на прочность",
      text: "Стресс-тест: что будет, если продажи упадут на 40%. И отдельно — выдержит ли бизнес платёж по кредиту.",
    },
    {
      icon: "Users",
      title: "Совет директоров",
      text: "Финансист, маркетолог, операционист, юрист и скептик разбирают план каждый со своей стороны — по вашим цифрам.",
    },
  ];

  const kills = [
    "Продукт, который никто не купил до вложений",
    "Кредит под модель, которая его не тянет",
    "Забытые налоги и взносы: минус 30% сверх зарплат",
    "Оптимистичный план продаж без обоснования",
    "Нулевая подушка: закрылись на третий месяц",
    "Своя зарплата не заложена — работа в минус",
  ];

  return (
    <div>
      <div className="text-center mb-9">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-amber-200 bg-amber-500/15 border border-amber-500/25 rounded-lg px-3 py-1 mb-4">
          <Icon name="Gift" size={14} /> Бесплатно · без регистрации
        </span>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.05] mb-4">
          БИЗНЕС 2026:{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            проверьте идею до того, как вложили деньги
          </span>
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
          Пройдите 8 этапов виртуального моделирования — и увидите, выживет ли ваш бизнес на бумаге.
          Здесь не продают мечту и не мотивируют. Задача одна: показать реальные цифры и уберечь от
          ошибок, которые стоят квартиры.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {blocks.map((b, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3">
              <Icon name={b.icon} size={20} className="text-amber-300" />
            </div>
            <h3 className="font-bold text-white mb-1">{b.title}</h3>
            <p className="text-white/55 text-sm">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-rose-500/25 bg-rose-500/8 p-6 mb-8">
        <h2 className="font-montserrat font-black text-xl text-white mb-1.5 flex items-center gap-2">
          <Icon name="TriangleAlert" size={20} className="text-rose-300" />
          Почему закрываются молодые бизнесы
        </h2>
        <p className="text-white/60 text-sm mb-4">
          Почти всегда — не из-за конкурентов, а из-за ошибок, которые видно на бумаге заранее:
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {kills.map((k, i) => (
            <div key={i} className="flex gap-2.5 text-white/75 text-sm">
              <Icon name="X" size={15} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{k}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8">
        <h2 className="font-montserrat font-black text-lg text-white mb-4">8 этапов моделирования</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {STAGES.map((s) => (
            <div key={s.id} className="flex gap-3">
              <span className="text-2xl shrink-0">{s.emoji}</span>
              <div className="min-w-0">
                <div className="font-bold text-white text-sm">
                  {s.index}. {s.title}
                </div>
                <div className="text-white/45 text-xs">{s.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-600/15 to-orange-500/10 p-6 md:p-8 text-center">
        <p className="text-white/80 mb-1">Полный расчёт и разбор экспертов</p>
        <div className="font-montserrat font-black text-3xl text-white mb-1">бесплатно</div>
        <p className="text-white/45 text-xs mb-5">
          Без регистрации и карты. Ответы сохраняются в браузере — можно вернуться и дозаполнить.
        </p>
        <button
          onClick={onStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="Rocket" size={18} />
          {hasDraft ? "Продолжить расчёт" : "Начать моделирование"}
        </button>
        <p className="text-white/35 text-xs mt-4">
          Займёт 15-20 минут. Приготовьте примерные цифры по ценам и расходам.
        </p>
      </div>
    </div>
  );
}
