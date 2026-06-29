/**
 * Единый источник партнёрских ссылок банка «Точка».
 * Реферальный код привязан ко всем ссылкам — менять только здесь.
 */
const REF = "referer1=6312223437";

export const TOCHKA_REF = REF;

/** Главная партнёрская страница (счёт, регистрация бизнеса). */
export const TOCHKA_PARTNER_URL = `https://partner.tochka.com?${REF}`;

/** Продукт «Точка 24 AI» — ИИ-ассистент для бизнеса. */
export const TOCHKA_AI_URL = `https://partner.tochka.com/24ai?${REF}`;

export const TOCHKA_BANNER_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/b24cb067-0b25-4354-928a-7822e68e7d78.png";

export const TOCHKA_LEGAL =
  "АО «Точка», ООО «Банк Точка». Лиц. № 3545 от 03.02.2023. Реклама 18+";
