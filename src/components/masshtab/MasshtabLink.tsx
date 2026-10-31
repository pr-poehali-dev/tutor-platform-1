import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const MASSHTAB_URL = "https://mat-labs.ru/masshtab";

function masshtabHref(place: string) {
  return `${MASSHTAB_URL}?utm_source=uchispro&utm_medium=referral&utm_campaign=masshtab&utm_content=${place}`;
}

interface Props {
  variant?: "footer" | "card";
  /** Место на сайте — уходит в UTM и цель Метрики */
  place?: string;
}

/**
 * Ссылка на деловой листок «Масштаб» (mat-labs.ru/masshtab).
 * Открывается в новой вкладке, чтобы посетитель оставался на УЧИСЬПРО,
 * и размечена UTM-метками — видно, сколько читателей мы приводим.
 */
export default function MasshtabLink({ variant = "card", place = "site" }: Props) {
  const onClick = () => trackGoal("masshtab_click", { place });

  if (variant === "footer") {
    return (
      <a
        href={masshtabHref(place)}
        target="_blank"
        rel="noopener"
        onClick={onClick}
        className="group mt-5 flex items-center gap-3 rounded-xl border border-amber-400/25 bg-gradient-to-r from-amber-500/10 to-transparent px-3 py-2.5 hover:border-amber-400/50 transition-colors"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#0b0d16] border border-amber-400/40 font-montserrat font-black text-amber-300 text-base">
          М
        </span>
        <span className="min-w-0">
          <span className="block font-montserrat font-black tracking-[0.18em] text-[13px] text-white">МАСШТАБ</span>
          <span className="block text-[11px] text-white/55 leading-tight">Деловой журнал МАТ-Лабс</span>
        </span>
        <Icon name="ArrowUpRight" size={14} className="ml-auto text-amber-300/70 group-hover:text-amber-200 transition-colors" />
      </a>
    );
  }

  return (
    <aside
      aria-label="Деловой журнал «Масштаб»"
      className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#0b0d16] border border-amber-400/40 font-montserrat font-black text-amber-300 text-xl">
          М
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-white/45 mb-0.5">Деловой журнал МАТ-Лабс</p>
          <p className="font-montserrat font-black tracking-[0.18em] text-white text-base">МАСШТАБ</p>
          <p className="text-sm text-white/65 leading-snug">
            Бизнес, деньги и люди — проверено цифрами. Рейтинг «Масштаб-500», индикаторы рынка, разборы сделок.
          </p>
        </div>
      </div>
      <a
        href={masshtabHref(place)}
        target="_blank"
        rel="noopener"
        onClick={onClick}
        className="sm:ml-auto inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 px-4 py-2.5 text-sm font-bold text-amber-200 hover:bg-amber-400/10 transition-colors"
      >
        Читать журнал
        <Icon name="ArrowUpRight" size={14} />
      </a>
    </aside>
  );
}