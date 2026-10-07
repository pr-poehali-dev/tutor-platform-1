import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { TOCHKA_PARTNER_URL } from "@/components/partners/tochkaLinks";

const TOCHKA_CERT_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/27eb9e3b-2e0c-484b-9b80-4a129f46befa.png";

/**
 * Знак доверия на главной: сертификат партнёра Точка Банк.
 * Неброская полоса, без рекламного креатива — главная общая для всей семьи,
 * поэтому здесь только факт партнёрства, а предложения банка живут
 * во взрослых и бизнес-разделах.
 */
export default function TochkaTrustStrip() {
  const [open, setOpen] = useState(false);

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8" aria-label="Партнёр проекта — Точка Банк">
      <div className="rounded-2xl border border-[#7c4dff]/25 bg-gradient-to-r from-[#7c4dff]/10 to-transparent p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Открыть сертификат партнёра Точка Банк"
          className="shrink-0 w-24 sm:w-28 cursor-zoom-in rotate-[-3deg] hover:rotate-0 transition-transform"
        >
          <img
            src={TOCHKA_CERT_IMG}
            alt="Сертификат партнёра — УЧИСЬПРО является партнёром и другом Точка Банк"
            loading="lazy"
            className="w-full rounded-xl border border-white/20 shadow-lg shadow-purple-900/30"
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#7c4dff] text-white text-[11px] font-black leading-none" aria-hidden="true">т</span>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#b39dff]">Партнёр проекта</span>
          </div>
          <h2 className="font-montserrat font-black text-lg md:text-xl text-white leading-tight mb-1">
            УЧИСЬПРО — официальный партнёр Точка Банк
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Платформе доверяет банк для предпринимателей. Тем, кто учится запускать своё дело, — бесплатная регистрация бизнеса и счёт у партнёра.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end shrink-0">
          <Link
            to="/feed/partnyorskie-programmy-s-bankom-tochka"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9b8ff] hover:text-white transition-colors"
          >
            О партнёрстве <Icon name="ArrowRight" size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            <Icon name="Award" size={14} /> Сертификат
          </button>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Сертификат партнёра банка Точка"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Icon name="X" size={22} />
          </button>
          <img
            src={TOCHKA_CERT_IMG}
            alt="Сертификат партнёра — УЧИСЬПРО является партнёром и другом банка Точка"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[75vh] w-auto rounded-2xl border border-white/20 shadow-2xl"
          />
          <a
            href={TOCHKA_PARTNER_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 bg-[#7c4dff] hover:bg-[#6a3df0] text-white text-sm font-bold px-6 py-3 rounded-2xl transition-colors"
          >
            <Icon name="Landmark" size={16} aria-hidden="true" />
            Открыть счёт в банке Точка
          </a>
        </div>
      )}
    </section>
  );
}
