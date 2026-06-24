// Конфигурация акции «Малыш»: первые 3 месяца за 1 ₽, далее 399 ₽/мес.
// Акция действует до 01.09.2026.

export const KIDS_PROMO_END_ISO = "2026-09-01T23:59:59+03:00";
export const KIDS_PROMO_INTRO_PRICE = 1;
export const KIDS_PROMO_MONTHLY_PRICE = 399;
export const KIDS_PROMO_INTRO_MONTHS = 3;

export function isKidsPromoActive(): boolean {
  return Date.now() <= new Date(KIDS_PROMO_END_ISO).getTime();
}

export interface KidsTimeLeft {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function kidsPromoTimeLeft(): KidsTimeLeft {
  const diff = new Date(KIDS_PROMO_END_ISO).getTime() - Date.now();
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { expired: false, days, hours, minutes, seconds };
}

/** Дата окончания акции в формате «1 сентября 2026». */
export function kidsPromoEndLabel(): string {
  return new Date(KIDS_PROMO_END_ISO).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
