/**
 * Акция «ДОБРО»: все платежи на паузе, полный доступ — бесплатно.
 *
 * Единый источник правды для фронта и бэка (даты должны совпадать).
 * Если нужно продлить — поменять PROMO_END_ISO в одном месте.
 */

export const PROMO_CODE = "DOBRO";
export const PROMO_TITLE = "Акция ДОБРО";
export const PROMO_SUBTITLE = "Все возможности УЧИСЬПРО — бесплатно";
export const PROMO_START_ISO = "2026-05-28T00:00:00+03:00";
export const PROMO_END_ISO = "2026-06-15T23:59:59+03:00";

/** Активна ли акция прямо сейчас. */
export function isPromoActive(now: Date = new Date()): boolean {
  const start = new Date(PROMO_START_ISO).getTime();
  const end = new Date(PROMO_END_ISO).getTime();
  const t = now.getTime();
  return t >= start && t <= end;
}

/** Сколько дней до конца акции (округляем вверх). */
export function daysLeft(now: Date = new Date()): number {
  const end = new Date(PROMO_END_ISO).getTime();
  const diff = end - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Время до конца акции в виде {days, hours, minutes, seconds}. */
export function timeLeft(now: Date = new Date()): {
  days: number; hours: number; minutes: number; seconds: number; expired: boolean;
} {
  const end = new Date(PROMO_END_ISO).getTime();
  let diff = end - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / 86_400_000); diff -= days * 86_400_000;
  const hours = Math.floor(diff / 3_600_000); diff -= hours * 3_600_000;
  const minutes = Math.floor(diff / 60_000);  diff -= minutes * 60_000;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

/** Дата окончания в формате «15 июня 2026». */
export function formatEndDate(): string {
  const d = new Date(PROMO_END_ISO);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
