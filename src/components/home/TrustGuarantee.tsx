import Icon from "@/components/ui/icon";

const ITEMS = [
  {
    icon: "ShieldCheck",
    title: "Гарантия возврата 7 дней",
    description: "Не подошло — вернём деньги",
    color: "text-emerald-300",
    bg: "bg-emerald-500/15 border-emerald-500/25",
  },
  {
    icon: "CreditCard",
    title: "Оплата картой и СБП",
    description: "Безопасно через ЮKassa",
    color: "text-cyan-300",
    bg: "bg-cyan-500/15 border-cyan-500/25",
  },
  {
    icon: "Server",
    title: "Данные на серверах в РФ",
    description: "По 152-ФЗ, под защитой",
    color: "text-purple-300",
    bg: "bg-purple-500/15 border-purple-500/25",
  },
  {
    icon: "Gift",
    title: "Первый урок бесплатно",
    description: "Без карты и обязательств",
    color: "text-amber-300",
    bg: "bg-amber-500/15 border-amber-500/25",
  },
];

export default function TrustGuarantee() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8" aria-label="Гарантии и безопасность">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl border ${item.bg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon name={item.icon} size={20} className={item.color} />
              </div>
              <div className="min-w-0">
                <p className="font-montserrat font-bold text-sm text-white leading-snug">
                  {item.title}
                </p>
                <p className="text-xs text-white/55 mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
