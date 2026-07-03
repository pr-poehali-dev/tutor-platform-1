import Icon from "@/components/ui/icon";
import {
  TOCHKA_LICENSE_URL,
  TOCHKA_LICENSE_IMG,
  TOCHKA_LEGAL,
} from "@/components/partners/tochkaLinks";

/**
 * Партнёрский блок «Точка Банк» — лицензирование школы под ключ (масштабирование).
 * Рекламный материал АО «Точка». Реферальная ссылка привязана в tochkaLinks.
 */

const PERKS: { icon: string; title: string; desc: string }[] = [
  {
    icon: "CreditCard",
    title: "Эквайринг 1,5%",
    desc: "ОКВЭД «Образование» и приём платежей по специальной ставке.",
  },
  {
    icon: "GraduationCap",
    title: "Документ ученикам",
    desc: "Выдавайте документ об освоении профессии и возвращайте 13% НДФЛ клиентам.",
  },
  {
    icon: "FileCheck2",
    title: "Лицензия под ключ",
    desc: "От 66 000 ₽: программа, документы, подача заявки и сопровождение.",
  },
  {
    icon: "ShieldCheck",
    title: "Работа без рисков",
    desc: "Никаких штрафов за отсутствие лицензии и сомнений в репутации школы.",
  },
];

export default function ForBusinessLicense() {
  return (
    <section id="license" className="mb-16 scroll-mt-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#7c4dff]/15 border border-[#7c4dff]/30 rounded-full px-4 py-1.5 mb-4">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#7c4dff] text-white text-[10px] font-black leading-none">т</span>
          <span className="text-[#b39dff] text-xs font-bold uppercase tracking-wider">Партнёр · Точка Банк</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2">
          Масштабируйте школу с{" "}
          <span className="bg-gradient-to-r from-[#9d7bff] to-cyan-400 bg-clip-text text-transparent">официальной лицензией</span>
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto">
          Лицензия — это преимущество перед конкурентами: клиенты не сомневаются в репутации, а вы работаете без рисков и штрафов.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-center">
        {/* Картинка-презентация от партнёра */}
        <a
          href={TOCHKA_LICENSE_URL}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block group rounded-3xl overflow-hidden border border-[#7c4dff]/25"
          aria-label="Лицензия для онлайн-школы под ключ — Точка Банк"
        >
          <img
            src={TOCHKA_LICENSE_IMG}
            alt="Лицензия для онлайн-школы под ключ от Точка Банк: эквайринг 1,5%, документы ученикам, лицензия от 66 000 ₽"
            loading="lazy"
            className="w-full object-cover group-hover:opacity-95 transition-opacity"
          />
        </a>

        {/* Преимущества + CTA */}
        <div>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {PERKS.map((p) => (
              <div key={p.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-[#7c4dff]/15 border border-[#7c4dff]/25 flex items-center justify-center mb-2.5">
                  <Icon name={p.icon} size={18} className="text-[#b39dff]" fallback="Check" />
                </div>
                <h3 className="font-montserrat font-black text-white text-sm mb-1">{p.title}</h3>
                <p className="text-white/55 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <a
            href={TOCHKA_LICENSE_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 bg-[#7c4dff] hover:bg-[#6a3df0] text-white font-bold px-6 py-3.5 rounded-2xl transition-colors w-full sm:w-auto justify-center"
          >
            <Icon name="Landmark" size={18} aria-hidden="true" />
            Получить лицензию с Точкой
            <Icon name="ArrowRight" size={16} aria-hidden="true" />
          </a>

          <p className="text-white/35 text-[11px] mt-4 leading-relaxed">
            Реклама. {TOCHKA_LEGAL}
          </p>
        </div>
      </div>
    </section>
  );
}
