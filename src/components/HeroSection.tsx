import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import TochkaPartnerBadge from "@/components/partners/TochkaPartnerBadge";
import { TOCHKA_PARTNER_URL } from "@/components/partners/tochkaLinks";

const HERO_IMAGE =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/e00d0075-d864-4a88-a93c-babf50ddbf13.jpg";

const TOCHKA_CERT_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/27eb9e3b-2e0c-484b-9b80-4a129f46befa.png";

const TRUST_POINTS = [
  { icon: "Zap", text: "Первый урок — за 30 секунд" },
  { icon: "CreditCard", text: "Без карты, без обязательств" },
  { icon: "ShieldCheck", text: "Данные на серверах в РФ" },
];

const AVATAR_COLORS = ["#a855f7", "#06b6d4", "#f59e0b", "#ec4899", "#10b981"];

export default function HeroSection() {
  const [certOpen, setCertOpen] = useState(false);
  return (
    <section
      id="hero"
      className="relative pt-10 md:pt-14 pb-12 px-4 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT */}
          <div className="lg:col-span-7">
            {/* Бейджи — социальное доказательство + партнёр-маркер доверия */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5 animate-fade-in-up">
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/12 rounded-full pl-1.5 pr-4 py-1.5 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  {AVATAR_COLORS.map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${c}, ${c}aa)` }}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-xs md:text-sm text-white/85 font-medium">
                  12 000+ школьников сейчас на платформе
                </span>
              </div>
              <TochkaPartnerBadge />
            </div>

            <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-5 animate-fade-in-up animate-delay-100">
              ИИ-репетитор,{" "}
              <span className="gradient-text-purple text-glow-purple">
                который доводит
              </span>
              <br />
              до{" "}
              <span className="gradient-text-pink text-glow-pink">
                90+ баллов
              </span>{" "}
              на экзамене
            </h1>

            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-7 max-w-xl animate-fade-in-up animate-delay-200">
              Голосовой репетитор находит твои пробелы за 5 минут диагностики и
              ведёт по персональному маршруту до результата. 24/7, без записи,
              без ожидания.
            </p>

            {/* CTA — одно главное действие */}
            <div className="mb-6 animate-fade-in-up animate-delay-300">
              <Link
                to="/courses"
                className="group inline-flex bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-2xl text-base items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/40 transition-all glow-purple"
              >
                <span>Начать учиться бесплатно</span>
                <Icon
                  name="ArrowRight"
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {/* Trust-маркеры */}
            <ul className="flex flex-wrap gap-x-5 gap-y-2 animate-fade-in-up animate-delay-400">
              {TRUST_POINTS.map((p) => (
                <li
                  key={p.text}
                  className="flex items-center gap-1.5 text-xs md:text-sm text-white/75"
                >
                  <Icon
                    name={p.icon}
                    size={14}
                    className="text-emerald-400 flex-shrink-0"
                  />
                  {p.text}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — фотография */}
          <div className="lg:col-span-5 relative animate-fade-in-up animate-delay-200">
            {/* Чистое фото целиком, без обрезки смысла */}
            <div className="relative mx-auto rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-purple-500/20 max-w-[55vw] sm:max-w-xs lg:max-w-none">
              <img
                src={HERO_IMAGE}
                alt="Счастливые выпускники с отличными результатами ЕГЭ"
                loading="eager"
                decoding="async"
                width={640}
                height={640}
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* Сертификат партнёра — знак доверия от банка Точка */}
            <button
              type="button"
              onClick={() => setCertOpen(true)}
              aria-label="Открыть сертификат партнёра банка Точка"
              title="УЧИСЬПРО — партнёр банка Точка"
              className="group absolute -bottom-4 -right-3 sm:-right-4 w-24 sm:w-28 lg:w-32 rotate-[-5deg] hover:rotate-0 transition-transform duration-300 cursor-zoom-in"
            >
              <img
                src={TOCHKA_CERT_IMG}
                alt="Сертификат партнёра — УЧИСЬПРО является партнёром и другом банка Точка"
                loading="lazy"
                className="w-full rounded-xl border border-white/20 shadow-xl shadow-purple-900/30"
              />
              <span className="mt-1.5 flex items-center justify-center gap-1 whitespace-nowrap text-[10px] font-semibold text-white/70 group-hover:text-white transition-colors">
                <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#7c4dff] text-white text-[8px] font-black leading-none" aria-hidden="true">т</span>
                Партнёр банка Точка
              </span>

              {/* Крупное превью сертификата при наведении (десктоп) */}
              <span
                className="hidden sm:block pointer-events-none absolute bottom-0 right-0 z-30 w-[78vw] max-w-md origin-bottom-right rotate-[5deg] scale-90 opacity-0 invisible translate-y-2 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:rotate-0"
                aria-hidden="true"
              >
                <img
                  src={TOCHKA_CERT_IMG}
                  alt=""
                  className="w-full rounded-2xl border border-white/25 shadow-2xl shadow-purple-900/50 ring-1 ring-black/20"
                />
              </span>
            </button>
          </div>
        </div>

        {/* Отзыв-полоса */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 md:p-6 backdrop-blur-sm animate-fade-in-up animate-delay-500">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex items-center gap-3 md:border-r md:border-white/10 md:pr-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-montserrat font-black text-white text-lg">
                А
              </div>
              <div>
                <p className="font-bold text-white text-sm">Аня, 11 класс</p>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" size={11} fill="currentColor" />
                  ))}
                  <span className="text-white/60 text-xs ml-1">5,0</span>
                </div>
              </div>
            </div>
            <p className="text-white/85 text-sm md:text-base leading-relaxed flex-1">
              «За 4 месяца с ИИ-репетитором по математике подняла с 62 до 89
              баллов. Главное — он всегда онлайн, можно спросить даже в 2 часа
              ночи перед пробником.»
            </p>
            <div className="flex items-center gap-2 text-xs text-white/60 md:flex-shrink-0">
              <Icon name="TrendingUp" size={14} className="text-emerald-400" />
              <span>
                <span className="font-bold text-emerald-400">+27 баллов</span>{" "}
                за 4 месяца
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Фоновые блики */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Полноэкранный просмотр сертификата (для мобильных) */}
      {certOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Сертификат партнёра банка Точка"
          onClick={() => setCertOpen(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setCertOpen(false)}
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