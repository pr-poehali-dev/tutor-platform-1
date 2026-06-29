import Icon from "@/components/ui/icon";
import {
  TOCHKA_PARTNER_URL,
  TOCHKA_AI_URL,
  TOCHKA_BANNER_IMG,
  TOCHKA_LEGAL,
} from "@/components/partners/tochkaLinks";

interface Props {
  /** Заголовок над рекомендацией (под контекст страницы/курса). */
  title?: string;
  /** Пояснительный текст. */
  text?: string;
  /**
   * Вариант продукта:
   * - "account" — счёт и регистрация бизнеса (по умолчанию)
   * - "ai" — продукт «Точка 24 AI», ИИ-ассистент для бизнеса
   */
  variant?: "account" | "ai";
  className?: string;
}

/**
 * Рекламно-партнёрский блок банка «Точка» (согласованный креатив).
 * Акцент — на предпринимателей и взрослую аудиторию. Рекламный материал АО «Точка».
 */
export default function TochkaBusinessBanner({
  title,
  text,
  variant = "account",
  className = "",
}: Props) {
  const isAI = variant === "ai";
  const url = isAI ? TOCHKA_AI_URL : TOCHKA_PARTNER_URL;

  const finalTitle =
    title ??
    (isAI
      ? "Применяй ИИ в деле — Точка 24 AI для бизнеса"
      : "Запускаешь своё дело? Открой счёт в банке Точка");
  const finalText =
    text ??
    (isAI
      ? "Точка 24 AI — встроенный ИИ-ассистент в банке: подсказывает по финансам, помогает с документами и задачами бизнеса 24/7. От нашего партнёра, банка Точка."
      : "Регистрация ИП или ООО без визита в налоговую и расчётный счёт для бизнеса — бесплатно. Наш партнёр банк Точка поможет легально начать и вести дело.");
  const imgAlt = isAI
    ? "Точка 24 AI — ИИ-ассистент для бизнеса от банка Точка"
    : "Всё для старта бизнеса бесплатно — банк Точка";
  const ctaLabel = isAI ? "Попробовать Точка 24 AI" : "Открыть счёт бесплатно";
  const ctaIcon = isAI ? "Sparkles" : "Landmark";

  return (
    <section
      className={`rounded-3xl border border-[#7c4dff]/30 bg-gradient-to-r from-[#7c4dff]/12 to-transparent overflow-hidden ${className}`}
      aria-label="Партнёр — банк Точка"
    >
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Креатив Точки */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="sm:w-44 md:w-52 flex-shrink-0"
          aria-label={imgAlt}
        >
          <img
            src={TOCHKA_BANNER_IMG}
            alt={imgAlt}
            loading="lazy"
            className="w-full h-44 sm:h-full object-cover"
          />
        </a>

        {/* Текст + CTA */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#7c4dff] text-white text-[11px] font-black leading-none">т</span>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#b39dff]">
              {isAI ? "Партнёр · Точка 24 AI" : "Партнёр · банк Точка"}
            </span>
          </div>
          <h3 className="font-montserrat font-black text-lg md:text-xl text-white leading-tight mb-1.5">
            {finalTitle}
          </h3>
          <p className="text-white/65 text-sm leading-relaxed mb-4">{finalText}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 self-start bg-[#7c4dff] hover:bg-[#6a3df0] text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition-colors"
          >
            <Icon name={ctaIcon} size={15} aria-hidden="true" />
            {ctaLabel}
            <Icon name="ArrowRight" size={15} aria-hidden="true" />
          </a>
          <p className="text-white/30 text-[10px] mt-3">{TOCHKA_LEGAL}</p>
        </div>
      </div>
    </section>
  );
}
