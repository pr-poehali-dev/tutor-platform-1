import Icon from "@/components/ui/icon";

interface Review {
  initials: string;
  name: string;
  city: string;
  plan: string;
  text: string;
  result: string;
  color: string;
}

const REVIEWS: Review[] = [
  {
    initials: "ДМ",
    name: "Дмитрий, 11 класс",
    city: "Казань",
    plan: "Профи",
    text: "Занимался по ЕГЭ-математике каждый день. ИИ объяснял разбор задач так, что наконец-то понял параметры.",
    result: "+27 баллов за 2 месяца",
    color: "from-purple-500 to-pink-500",
  },
  {
    initials: "АН",
    name: "Анна, мама ученицы",
    city: "Екатеринбург",
    plan: "Семейный",
    text: "Взяла семейный на двоих детей. Удобно, что вижу прогресс каждого в родительском кабинете. Дочь подтянула химию.",
    result: "Тройка → пятёрка по химии",
    color: "from-green-500 to-emerald-500",
  },
  {
    initials: "ИВ",
    name: "Иван, 9 класс",
    city: "Новосибирск",
    plan: "Базовый",
    text: "Готовился к ОГЭ по русскому. Голосовые ответы — топ, можно слушать в дороге. Сдал без стресса.",
    result: "ОГЭ на 5",
    color: "from-cyan-500 to-blue-500",
  },
];

const STATS = [
  { value: "4.9", label: "средняя оценка", icon: "Star" },
  { value: "92%", label: "продлевают подписку", icon: "Repeat" },
  { value: "7 дней", label: "гарантия возврата", icon: "ShieldCheck" },
];

export default function PricingTestimonials() {
  return (
    <div className="mb-16">
      <h2 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2 text-center">
        Результаты наших учеников
      </h2>
      <p className="text-white/45 text-sm text-center mb-7">Реальные истории тех, кто занимается на платформе</p>

      {/* Метрики доверия */}
      <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card/50 border border-white/8 rounded-2xl p-4 text-center">
            <Icon name={s.icon} size={18} className="text-purple-300 mx-auto mb-1.5" />
            <div className="font-montserrat font-black text-xl text-white">{s.value}</div>
            <div className="text-white/45 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Отзывы */}
      <div className="grid md:grid-cols-3 gap-4">
        {REVIEWS.map((r) => (
          <div key={r.initials} className="bg-card/50 border border-white/8 rounded-3xl p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${r.color} flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                {r.initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{r.name}</p>
                <p className="text-white/40 text-xs">{r.city} · тариф «{r.plan}»</p>
              </div>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Icon key={i} name="Star" size={13} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-white/70 text-sm leading-relaxed flex-1 mb-3">{r.text}</p>
            <div className="inline-flex items-center gap-1.5 self-start bg-green-500/15 border border-green-500/25 rounded-full px-3 py-1">
              <Icon name="TrendingUp" size={13} className="text-green-400" />
              <span className="text-green-300 text-xs font-bold">{r.result}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-white/30 text-[11px] text-center mt-4">
        Имена изменены по просьбе учеников. Результаты индивидуальны и не гарантируются.
      </p>
    </div>
  );
}
