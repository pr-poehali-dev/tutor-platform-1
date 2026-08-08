/** Ответы пользователя: ключ поля → значение (строка из формы). */
export type BizAnswers = Record<string, string>;

export type FieldType = "number" | "text" | "select" | "textarea";

export interface BizField {
  key: string;
  label: string;
  hint?: string;
  type: FieldType;
  suffix?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  optional?: boolean;
  /** Поле показывается только при этом условии. */
  showIf?: { key: string; in: string[] };
}

export interface BizStage {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  emoji: string;
  /** Зачем этот шаг — объясняем до того, как человек начнёт заполнять. */
  why: string;
  /** Что здесь чаще всего губит бизнес. */
  trap?: string;
  fields: BizField[];
}

/** Итог расчёта — всё считается локально, без сервера. */
export interface BizMetrics {
  /** Маржа с одной продажи, ₽ */
  unitMargin: number;
  /** Маржинальность, % */
  marginPct: number;
  /** Стоимость привлечения клиента, ₽ */
  cac: number;
  /** Прибыль с клиента за всё время, ₽ */
  ltv: number;
  /** Отношение LTV к CAC */
  ltvCac: number;
  /** Прибыль с продажи после расходов на привлечение, ₽ */
  contribution: number;
  /** Постоянные расходы в месяц, ₽ */
  fixedMonthly: number;
  /** Продаж в месяц для выхода в ноль */
  breakEvenUnits: number;
  /** Выручка для выхода в ноль, ₽ */
  breakEvenRevenue: number;
  /** Планируемые продажи в месяц */
  plannedUnits: number;
  /** Плановая выручка, ₽ */
  plannedRevenue: number;
  /** Плановая прибыль в месяц, ₽ */
  plannedProfit: number;
  /** Запас прочности: на сколько % могут упасть продажи до убытка */
  safetyMarginPct: number;
  /** Стартовые вложения, ₽ */
  startCapital: number;
  /** Месяцев до окупаемости вложений */
  paybackMonths: number;
  /** Ежемесячный платёж по кредиту, ₽ */
  loanMonthly: number;
  /** Во сколько раз прибыль покрывает платёж по кредиту */
  debtCover: number;
  /** Денег на счету на старте (подушка), ₽ */
  cushion: number;
  /** Сколько месяцев проживёт бизнес при нулевой выручке */
  runwayMonths: number;
  /** Прибыль при падении продаж на 40% (пессимистичный сценарий), ₽ */
  stressProfit: number;
  /** Выдерживает ли пессимистичный сценарий */
  stressSurvives: boolean;
}

export interface RiskFlag {
  level: "critical" | "warning" | "ok";
  title: string;
  text: string;
  /** Что конкретно делать. */
  fix?: string;
}

export interface BizVerdict {
  /** 0-100 */
  score: number;
  zone: "red" | "amber" | "green";
  title: string;
  summary: string;
  flags: RiskFlag[];
}
