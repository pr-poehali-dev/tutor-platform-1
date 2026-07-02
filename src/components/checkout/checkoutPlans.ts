export type PlanId = "trial" | "base" | "pro" | "family" | "kids";

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
  trial: {
    id: "trial",
    name: "Пробный",
    price: 0,
    period: "7 дней",
    description: "Знакомство с платформой без оплаты",
    features: ["3 курса на выбор", "20 сообщений ИИ в день", "Базовая аналитика"],
    gradient: "from-white/12 to-white/5",
  },
  base: {
    id: "base",
    name: "Базовый",
    price: 3999,
    period: "месяц",
    description: "Все курсы + ИИ-методист",
    features: ["Все 36+ курсов", "200 сообщений ИИ в день", "Голосовые ответы", "Полная аналитика"],
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  pro: {
    id: "pro",
    name: "Профи",
    price: 5990,
    period: "месяц",
    description: "Полная подготовка к ЕГЭ и ОГЭ",
    features: ["Всё из «Базового»", "Безлимитные сообщения ИИ", "Подготовка к ЕГЭ/ОГЭ", "Разбор сочинений", "Пробные экзамены"],
    gradient: "from-purple-500/25 to-pink-500/15",
  },
  family: {
    id: "family",
    name: "Семейный",
    price: 9990,
    period: "месяц",
    description: "До 3 учеников на одной подписке",
    features: ["Всё из «Профи»", "До 3 учеников", "Отдельный прогресс", "Родительский кабинет"],
    gradient: "from-emerald-500/20 to-green-500/10",
  },
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