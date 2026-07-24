// Поля ввода финансовых показателей бизнеса.
// Числовые поля идут в расчёт метрик на бэкенде, select/text — как контекст для ИИ.

export interface FinField {
  key: string;
  label: string;
  hint?: string;
  type: "number" | "select" | "text";
  suffix?: string; // ₽, чел. и т.п.
  placeholder?: string;
  optional?: boolean;
  options?: { value: string; label: string }[];
  group: "context" | "money" | "goal";
}

export const FIELDS: FinField[] = [
  // ── Контекст бизнеса ──
  {
    key: "business_type",
    label: "Чем занимается бизнес?",
    hint: "Ниша или сфера — например «кофейня», «веб-студия», «оптовая торговля».",
    type: "text",
    placeholder: "Например: кофейня в спальном районе",
    group: "context",
  },
  {
    key: "stage",
    label: "Стадия бизнеса",
    type: "select",
    group: "context",
    options: [
      { value: "idea", label: "Только запускаюсь" },
      { value: "start", label: "Работаю меньше года" },
      { value: "running", label: "Действующий бизнес" },
      { value: "scaling", label: "Расту и масштабируюсь" },
    ],
  },
  {
    key: "trend",
    label: "Динамика последних месяцев",
    type: "select",
    optional: true,
    group: "context",
    options: [
      { value: "growing", label: "Растём" },
      { value: "stable", label: "Стабильно" },
      { value: "falling", label: "Падаем" },
      { value: "unstable", label: "Скачет то вверх, то вниз" },
    ],
  },

  // ── Деньги (идут в расчёт метрик) ──
  {
    key: "revenue",
    label: "Выручка в месяц",
    hint: "Сколько денег заходит от продаж в среднем за месяц.",
    type: "number",
    suffix: "₽",
    placeholder: "1 200 000",
    group: "money",
  },
  {
    key: "cogs",
    label: "Себестоимость / переменные расходы в месяц",
    hint: "Расходы, которые растут вместе с продажами: закупка товара, сырьё, сдельная оплата.",
    type: "number",
    suffix: "₽",
    placeholder: "500 000",
    group: "money",
  },
  {
    key: "fixed",
    label: "Постоянные расходы в месяц",
    hint: "Аренда, оклады, подписки, реклама — то, что платите независимо от продаж.",
    type: "number",
    suffix: "₽",
    placeholder: "400 000",
    group: "money",
  },
  {
    key: "debt",
    label: "Общий долг (кредиты, займы)",
    hint: "Сколько всего должны банкам, инвесторам, поставщикам.",
    type: "number",
    suffix: "₽",
    placeholder: "0",
    optional: true,
    group: "money",
  },
  {
    key: "debt_payment",
    label: "Платёж по долгам в месяц",
    hint: "Сколько уходит на кредиты/займы каждый месяц.",
    type: "number",
    suffix: "₽",
    placeholder: "0",
    optional: true,
    group: "money",
  },
  {
    key: "cash",
    label: "Свободные деньги / подушка",
    hint: "Сколько денег есть в запасе прямо сейчас (счёт + касса).",
    type: "number",
    suffix: "₽",
    placeholder: "300 000",
    optional: true,
    group: "money",
  },
  {
    key: "receivables",
    label: "Дебиторка (сколько должны вам)",
    hint: "Деньги за уже отгруженные товары/услуги, которые ещё не пришли.",
    type: "number",
    suffix: "₽",
    placeholder: "0",
    optional: true,
    group: "money",
  },

  // ── Запрос ──
  {
    key: "goal",
    label: "Главный вопрос к финансисту",
    hint: "Что хотите понять? Чем конкретнее — тем точнее разбор.",
    type: "text",
    placeholder: "Например: выживет ли бизнес и стоит ли брать кредит на расширение",
    group: "goal",
  },
  {
    key: "main_pain",
    label: "Главная финансовая боль (необязательно)",
    type: "select",
    optional: true,
    group: "goal",
    options: [
      { value: "cash_gap", label: "Кассовые разрывы, не хватает денег" },
      { value: "low_profit", label: "Оборот есть, а прибыли нет" },
      { value: "debt", label: "Давят кредиты и долги" },
      { value: "no_clarity", label: "Не понимаю, куда уходят деньги" },
      { value: "invest", label: "Нужны деньги на рост" },
      { value: "growth", label: "Всё ок, ищу точки роста прибыли" },
    ],
  },
];

// Обязательные для генерации: нужна хотя бы выручка + один вид расходов.
export function canGenerate(answers: Record<string, string | string[]>): boolean {
  const has = (k: string) => {
    const v = answers[k];
    return typeof v === "string" && v.trim().length > 0;
  };
  return has("revenue") && (has("cogs") || has("fixed"));
}
