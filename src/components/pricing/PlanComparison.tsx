import Icon from "@/components/ui/icon";

interface Row {
  feature: string;
  trial: string | boolean;
  base: string | boolean;
  pro: string | boolean;
  family: string | boolean;
}

const ROWS: Row[] = [
  { feature: "Доступ к курсам", trial: "3 курса", base: "Все 36+", pro: "Все 36+", family: "Все 36+" },
  { feature: "Сообщений ИИ-методисту в день", trial: "20", base: "200", pro: "Безлимит", family: "Безлимит" },
  { feature: "Голосовые ответы преподавателей", trial: false, base: true, pro: true, family: true },
  { feature: "Адаптивная программа", trial: false, base: true, pro: true, family: true },
  { feature: "Подготовка к ЕГЭ и ОГЭ", trial: false, base: false, pro: true, family: true },
  { feature: "Разбор сочинений и эссе", trial: false, base: false, pro: true, family: true },
  { feature: "Пробные экзамены с проверкой", trial: false, base: false, pro: true, family: true },
  { feature: "Приоритетная скорость ответов", trial: false, base: false, pro: true, family: true },
  { feature: "Число учеников", trial: "1", base: "1", pro: "1", family: "до 3" },
  { feature: "Родительский кабинет с отчётами", trial: false, base: false, pro: false, family: true },
  { feature: "Цена в месяц", trial: "0 ₽", base: "590 ₽", pro: "1290 ₽", family: "1990 ₽" },
];

const COLS = [
  { key: "trial" as const, name: "Пробный", highlight: false },
  { key: "base" as const, name: "Базовый", highlight: false },
  { key: "pro" as const, name: "Профи", highlight: true },
  { key: "family" as const, name: "Семейный", highlight: false },
];

function Cell({ value, highlight }: { value: string | boolean; highlight: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlight ? "bg-purple-500/30" : "bg-green-500/20"}`}>
          <Icon name="Check" size={12} className={highlight ? "text-purple-300" : "text-green-400"} />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <Icon name="Minus" size={14} className="text-white/20" />
      </div>
    );
  }
  return <div className={`text-center text-sm font-semibold ${highlight ? "text-purple-200" : "text-white/85"}`}>{value}</div>;
}

export default function PlanComparison() {
  return (
    <div className="mb-16">
      <h2 className="font-montserrat font-black text-xl md:text-2xl text-white mb-6 text-center">
        Сравнение тарифов
      </h2>
      <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <div className="min-w-[640px] bg-card/50 border border-white/8 rounded-3xl overflow-hidden">
          {/* Заголовок колонок */}
          <div className="grid grid-cols-[1.6fr_repeat(4,1fr)] bg-white/[0.04] border-b border-white/8">
            <div className="p-4 text-white/55 text-sm font-medium">Возможности</div>
            {COLS.map((c) => (
              <div
                key={c.key}
                className={`p-4 text-center font-montserrat font-bold text-sm ${
                  c.highlight ? "text-purple-200 bg-purple-500/10" : "text-white"
                }`}
              >
                {c.name}
                {c.highlight && <div className="text-[10px] text-purple-300/80 font-medium mt-0.5">Рекомендуем</div>}
              </div>
            ))}
          </div>
          {/* Строки */}
          {ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1.6fr_repeat(4,1fr)] items-center ${
                i % 2 === 1 ? "bg-white/[0.015]" : ""
              } ${row.feature === "Цена в месяц" ? "border-t border-white/10 bg-white/[0.03]" : ""}`}
            >
              <div className="p-3.5 text-white/70 text-sm">{row.feature}</div>
              {COLS.map((c) => (
                <div key={c.key} className={`p-3.5 ${c.highlight ? "bg-purple-500/[0.06]" : ""}`}>
                  <Cell value={row[c.key]} highlight={c.highlight} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
