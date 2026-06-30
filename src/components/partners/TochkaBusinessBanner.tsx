import Icon from "@/components/ui/icon";
import {
  TOCHKA_PARTNER_URL,
  TOCHKA_AI_URL,
  TOCHKA_BANNER_IMG,
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
 * Рекламно-партнёрский блок Точка Банк (согласованный креатив).
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
      : "Запускаешь своё дело? Открой счёт в Точка Банк");
  const finalText =
    text ??
    (isAI
      ? "Точка 24 AI — встроенный ИИ-ассистент в банке: подсказывает по финансам, помогает с документами и задачами бизнеса 24/7. От нашего партнёра, Точка Банк."
      : "Регистрация ИП или ООО без визита в налоговую и расчётный счёт для бизнеса — бесплатно. Наш партнёр Точка Банк поможет легально начать и вести дело.");
  const imgAlt = isAI
    ? "Точка 24 AI — ИИ-ассистент для бизнеса от Точка Банк"
    : "Всё для старта бизнеса бесплатно — Точка Банк";
  const ctaLabel = isAI ? "Попробовать Точка 24 AI" : "Открыть счёт бесплатно";
  const ctaIcon = isAI ? "Sparkles" : "Landmark";

  return (
    <section
      className={`rounded-3xl border border-[#7c4dff]/30 bg-gradient-to-br from-[#7c4dff]/12 to-transparent overflow-hidden ${className}`}
      aria-label="Партнёр — Точка Банк"
    >
      {/* Креатив Точки 16:9 — заголовок и юр-инфо уже на самом изображении */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block group"
        aria-label={imgAlt}
      >
        <img
          src={TOCHKA_BANNER_IMG}
          alt={imgAlt}
          loading="lazy"
          className="w-full aspect-[16/9] object-cover group-hover:opacity-95 transition-opacity"
        />
      </a>

      {/* Контекстная полоса: метка + заголовок + CTA */}
      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#7c4dff] text-white text-[11px] font-black leading-none">т</span>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#b39dff]">
              {isAI ? "Партнёр · Точка 24 AI" : "Партнёр · Точка Банк"}
            </span>
          </div>
          <h3 className="font-montserrat font-black text-lg md:text-xl text-white leading-tight mb-1">
            {finalTitle}
          </h3>
          <p className="text-white/65 text-sm leading-relaxed">{finalText}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-2 self-start sm:self-center flex-shrink-0 bg-[#7c4dff] hover:bg-[#6a3df0] text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition-colors"
        >
          <Icon name={ctaIcon} size={15} aria-hidden="true" />
          {ctaLabel}
          <Icon name="ArrowRight" size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}