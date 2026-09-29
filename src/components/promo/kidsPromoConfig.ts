// Условия модуля «Малыш»: первые 3 месяца бесплатно, далее 399 ₽/мес.
//
// Раньше здесь жила акция «3 месяца за 1 ₽» с датой окончания: после
// 30.09.2026 она гасла, и родитель упирался в полную цену без всякой пробы.
// Заменили на постоянный бесплатный период — он включается без карты
// и без платежа (backend/access, таблица kids_trials), поэтому «срока
// действия акции» у него нет.

/** Длительность бесплатного периода в месяцах. Сервер: KIDS_TRIAL_DAYS = 90. */
export const KIDS_TRIAL_MONTHS = 3;
/** Цена после бесплатного периода, ₽/мес. Сервер: SUBSCRIPTION_PLANS['kids']. */
export const KIDS_MONTHLY_PRICE = 399;

// ── Совместимость со старым кодом ────────────────────────────────────────────
// Эти имена ещё используются в баннерах и на странице тарифов.
/** @deprecated используйте KIDS_MONTHLY_PRICE */
export const KIDS_PROMO_MONTHLY_PRICE = KIDS_MONTHLY_PRICE;
/** @deprecated используйте KIDS_TRIAL_MONTHS */
export const KIDS_PROMO_INTRO_MONTHS = KIDS_TRIAL_MONTHS;
/** @deprecated бесплатный период больше не стоит 1 ₽ */
export const KIDS_PROMO_INTRO_PRICE = 0;

/**
 * Бесплатный период действует постоянно, поэтому всегда true.
 * Оставлено, чтобы не переписывать условия в существующих баннерах.
 */
export function isKidsPromoActive(): boolean {
  return true;
}

export interface KidsTimeLeft {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Сколько осталось до конца бесплатного периода КОНКРЕТНОГО родителя.
 * Дату берём из его подписки (kids.expiresAt), а не из общей акции.
 */
export function kidsTrialTimeLeft(expiresAtIso: string | null): KidsTimeLeft {
  if (!expiresAtIso) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = new Date(expiresAtIso).getTime() - Date.now();
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    expired: false,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
