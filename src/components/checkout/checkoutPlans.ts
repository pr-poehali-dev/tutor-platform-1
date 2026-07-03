// Абонемент «Малыш» — единственная подписка на платформе.
// Курсы (школьные и для взрослых) покупаются поштучно, без тарифов.
export type PlanId = "kids";

export interface PlanDef {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  gradient: string;
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
};

// Акция «Малыш»: первые 3 месяца за 1 ₽.
export const KIDS_INTRO_PRICE = 1;

export const YEAR_DISCOUNT = 0.4;
export function yearPrice(monthly: number): number {
  return Math.round(monthly * 12 * (1 - YEAR_DISCOUNT));
}