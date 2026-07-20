import Icon from "@/components/ui/icon";

interface Row {
  school: string;
  focus: string;
  rating: string;
  highlight?: boolean;
}

// Данные по открытым рейтингам Хабр Карьеры (направление «Программирование и IT»
// и «Аналитика/Data Science»). Приведены как ориентир рынка.
const ROWS: Row[] = [
  { school: "Нетология", focus: "IT, аналитика, маркетинг, дизайн", rating: "4.66" },
  { school: "CORS Academy", focus: "Аналитика и Data Science", rating: "4.64" },
  { school: "Яндекс Практикум", focus: "Разработка, аналитика, ИИ", rating: "4.52" },
  { school: "Skillbox", focus: "IT, дизайн, маркетинг", rating: "4.44" },
  { school: "Школа Больших Данных", focus: "Data Science, инженерия данных", rating: "4.44" },
  { school: "Skillfactory", focus: "Разработка, Data Science", rating: "3.92" },
  {
    school: "УЧИСЬПРО",
    focus: "ИИ-преподаватель 24/7, конструктор курсов, оплаты",
    rating: "новый формат",
    highlight: true,
  },
];

export default function CompetitorsTable() {
  return (
    <section className="mb-16" aria-label="Сравнение образовательных платформ">
      <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">
        Рынок онлайн-школ 2026
      </h2>
      <p className="text-white/65 text-sm md:text-base text-center max-w-2xl mx-auto mb-8">
        Крупные игроки конкурируют рейтингами и добавляют блоки с ИИ. Мы даём школам
        готовую платформу, где ИИ уже в основе обучения.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left border-collapse min-w-[520px]">
          <thead>
            <tr className="text-white/55 text-xs uppercase tracking-wider">
              <th className="px-4 md:px-5 py-3 font-bold">Платформа</th>
              <th className="px-4 md:px-5 py-3 font-bold">Направления</th>
              <th className="px-4 md:px-5 py-3 font-bold text-right">Рейтинг</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr
                key={r.school}
                className={`border-t border-white/8 ${
                  r.highlight ? "bg-gradient-to-r from-violet-500/15 to-cyan-500/10" : ""
                }`}
              >
                <td className="px-4 md:px-5 py-3.5 font-bold text-white whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    {r.highlight && <Icon name="Sparkles" size={15} className="text-violet-300" />}
                    {r.school}
                  </span>
                </td>
                <td className="px-4 md:px-5 py-3.5 text-white/70 text-sm">{r.focus}</td>
                <td className="px-4 md:px-5 py-3.5 text-right whitespace-nowrap">
                  {r.highlight ? (
                    <span className="text-violet-200 text-sm font-bold">{r.rating}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-200 font-bold">
                      <Icon name="Star" size={13} className="fill-amber-300 text-amber-300" />
                      {r.rating}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-white/40 text-xs mt-3 text-center">
        Рейтинги — по открытым данным Хабр Карьеры на 2026 год. Приведены как ориентир рынка.
      </p>
    </section>
  );
}
