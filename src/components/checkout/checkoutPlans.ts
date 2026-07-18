// Подписки платформы: «Малыш» (детский раздел) и «Репетитор» (учёба школьников).
// Курсы (школьные и для взрослых) также можно покупать поштучно, без тарифа.
export type PlanId = "kids" | "tutor";

export interface PlanDef {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  gradient: string;
  /** Фиксированная цена за год, ₽. Если не задана — считается по YEAR_DISCOUNT. */
  yearPrice?: number;
}

export const PLANS: Record<PlanId, PlanDef> = {
  kids: {
    id: "kids",
    name: "Малыш",
    price: 399,
    period: "месяц",
    description: "Полный доступ к развивающим занятиям для детей 1–6 лет",
    features: ["Все занятия и сказки", "Игры, песни и обучение чтению", "Контроль экранного времени", "Советы родителям"],
    gradient: "from-pink-500/25 to-amber-500/15",
  },
  tutor: {
    id: "tutor",
    name: "Репетитор",
    price: 1490,
    period: "месяц",
    description: "Безлимитный доступ к личному ИИ-репетитору по всем предметам",
    features: [
      "Все супер-курсы: физика, математика, информатика",
      "Безлимит голосовых уроков с наставником",
      "Безлимитная проверка домашки по фото",
      "Все задачники и подготовка к ЕГЭ",
    ],
    gradient: "from-purple-500/25 to-cyan-500/15",
    yearPrice: 9990,
  },
};

// Акция «Малыш»: первые 3 месяца за 1 ₽.
export const KIDS_INTRO_PRICE = 1;

export const YEAR_DISCOUNT = 0.4;
export function yearPrice(monthly: number, plan?: PlanDef): number {
  if (plan?.yearPrice) return plan.yearPrice;
  return Math.round(monthly * 12 * (1 - YEAR_DISCOUNT));
}