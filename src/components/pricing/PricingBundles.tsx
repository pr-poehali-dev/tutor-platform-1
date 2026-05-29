import Icon from "@/components/ui/icon";

interface Bundle {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  oldPrice: number;
  price: number;
  saveLabel: string;
  highlight: boolean;
  badge?: string;
}

const BUNDLES: Bundle[] = [
  {
    id: "pro-quarter",
    emoji: "🚀",
    title: "Профи на 3 месяца",
    desc: "Полный доступ к подготовке к ЕГЭ/ОГЭ на весь учебный спринт. Платишь за 2 месяца — учишься 3.",
    oldPrice: 3870,
    price: 2580,
    saveLabel: "Выгода 1290 ₽",
    highlight: true,
    badge: "Хит",
  },
  {
    id: "pro-english",
    emoji: "🌍",
    title: "Профи + Английский",
    desc: "Подписка «Профи» и отдельный интенсив по английскому со скидкой 20%. Два направления сразу.",
    oldPrice: 2180,
    price: 1790,
    saveLabel: "Скидка 20%",
    highlight: false,
  },
  {
    id: "family-quarter",
    emoji: "👨‍👩‍👧",
    title: "Семейный на 3 месяца",
    desc: "До 3 учеников, родительский кабинет. Лучшая цена за ученика на платформе.",
    oldPrice: 5970,
    price: 4490,
    saveLabel: "Выгода 1480 ₽",
    highlight: false,
  },
];

interface Props {
  onSelect?: (id: string) => void;
}

export default function PricingBundles({ onSelect }: Props) {
  return (
    <div className="mb-16">
      <h2 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2 text-center">
        Выгодные комплекты
      </h2>
      <p className="text-white/45 text-sm text-center mb-7">Берёшь больше — платишь меньше за месяц</p>

      <div className="grid md:grid-cols-3 gap-4">
        {BUNDLES.map((b) => (
          <div
            key={b.id}
            className={`relative bg-card/60 border rounded-3xl p-6 flex flex-col ${
              b.highlight ? "border-purple-500/40 shadow-2xl shadow-purple-500/10" : "border-white/8"
            }`}
          >
            {b.badge && (
              <div className="absolute -top-3 left-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                🔥 {b.badge}
              </div>
            )}
            <div className="text-3xl mb-3">{b.emoji}</div>
            <h3 className="font-montserrat font-black text-lg text-white mb-2">{b.title}</h3>
            <p className="text-white/55 text-sm leading-relaxed flex-1 mb-4">{b.desc}</p>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-montserrat font-black text-2xl text-white">{b.price.toLocaleString("ru-RU")} ₽</span>
              <span className="text-white/35 text-sm line-through">{b.oldPrice.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="inline-flex items-center gap-1.5 self-start bg-green-500/15 border border-green-500/25 rounded-full px-2.5 py-0.5 mb-4">
              <Icon name="Tag" size={12} className="text-green-400" />
              <span className="text-green-300 text-xs font-bold">{b.saveLabel}</span>
            </div>

            <button
              onClick={() => onSelect?.(b.id)}
              className={`w-full font-bold text-sm py-3 rounded-2xl transition-all ${
                b.highlight
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                  : "bg-white text-background hover:bg-white/90"
              }`}
            >
              Выбрать комплект
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
