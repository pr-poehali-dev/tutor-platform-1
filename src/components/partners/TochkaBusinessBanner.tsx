import Icon from "@/components/ui/icon";

const TOCHKA_PARTNER_URL = "https://partner.tochka.com?referer1=6312223437";
const TOCHKA_BANNER_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/b24cb067-0b25-4354-928a-7822e68e7d78.png";

interface Props {
  /** Заголовок над рекомендацией (под контекст страницы/курса). */
  title?: string;
  /** Пояснительный текст. */
  text?: string;
  className?: string;
}

/**
 * Рекламно-партнёрский блок банка «Точка» (согласованный креатив).
 * Акцент — на предпринимателей и взрослую аудиторию: открыть счёт,
 * зарегистрировать бизнес. Рекламный материал АО «Точка».
 */
export default function TochkaBusinessBanner({
  title = "Запускаешь своё дело? Открой счёт в банке Точка",
  text = "Регистрация ИП или ООО без визита в налоговую и расчётный счёт для бизнеса — бесплатно. Наш партнёр банк Точка поможет легально начать и вести дело.",
  className = "",
}: Props) {
  return (
    <section
      className={`rounded-3xl border border-[#7c4dff]/30 bg-gradient-to-r from-[#7c4dff]/12 to-transparent overflow-hidden ${className}`}
      aria-label="Партнёр — банк Точка"
    >
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Креатив Точки */}
        <a
          href={TOCHKA_PARTNER_URL}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="sm:w-44 md:w-52 flex-shrink-0"
          aria-label="Всё для старта бизнеса бесплатно — банк Точка"
        >
          <img
            src={TOCHKA_BANNER_IMG}
            alt="Всё для старта бизнеса бесплатно — банк Точка"
            loading="lazy"
            className="w-full h-44 sm:h-full object-cover"
          />
        </a>

        {/* Текст + CTA */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#7c4dff] text-white text-[11px] font-black leading-none">т</span>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#b39dff]">Партнёр · банк Точка</span>
          </div>
          <h3 className="font-montserrat font-black text-lg md:text-xl text-white leading-tight mb-1.5">
            {title}
          </h3>
          <p className="text-white/65 text-sm leading-relaxed mb-4">{text}</p>
          <a
            href={TOCHKA_PARTNER_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 self-start bg-[#7c4dff] hover:bg-[#6a3df0] text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition-colors"
          >
            <Icon name="Landmark" size={15} aria-hidden="true" />
            Открыть счёт бесплатно
            <Icon name="ArrowRight" size={15} aria-hidden="true" />
          </a>
          <p className="text-white/30 text-[10px] mt-3">
            АО «Точка», ООО «Банк Точка». Лиц. № 3545 от 03.02.2023. Реклама 18+
          </p>
        </div>
      </div>
    </section>
  );
}
