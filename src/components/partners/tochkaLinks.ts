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

/** Лицензирование школы под ключ (масштабирование) — партнёрское предложение. */
export const TOCHKA_LICENSE_URL = `https://partner.tochka.com?${REF}`;

/** Горизонтальный баннер 16:9 — содержит заголовок и юр-инфо прямо на изображении. */
export const TOCHKA_BANNER_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/ff05088c-c375-4cb2-b1ae-0da73642d99f.png";

/** Вертикальный баннер-презентация «Лицензия — преимущество перед конкурентами». */
export const TOCHKA_LICENSE_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/68210527-fd01-4598-80b8-5de0ffc33238.png";

export const TOCHKA_LEGAL =
  "АО «Точка», ООО «Банк Точка». Лиц. № 3545 от 03.02.2023. Реклама 18+";