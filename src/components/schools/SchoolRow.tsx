import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { KIND_LABEL, SchoolCard } from "./api";

interface Props {
  school: SchoolCard;
  place?: number;
  showCity?: boolean;
}

function Move({ school: s }: { school: SchoolCard }) {
  if (s.is_new) return <span className="text-[10px] font-semibold text-cyan-300">новая</span>;
  if (!s.prev_place || !s.place || s.prev_place === s.place) return null;
  const up = s.prev_place > s.place;
  return (
    <span className={`flex items-center text-[10px] font-semibold ${up ? "text-emerald-300" : "text-rose-300"}`} title={`В прошлом месяце: ${s.prev_place}`}>
      <Icon name={up ? "ArrowUp" : "ArrowDown"} size={10} />
      {Math.abs(s.prev_place - s.place)}
    </span>
  );
}

function shortAddress(address: string, city: string): string {
  const parts = address
    .replace(/^\d{6},\s*/, "")
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !/област|край|республик|район|округ/i.test(p) && !p.toLowerCase().includes(city.toLowerCase()) && !/^(г|город)\.?\s/i.test(p));
  return parts.join(", ").slice(0, 60);
}

export default function SchoolRow({ school: s, place, showCity }: Props) {
  const best = s.ratings?.[0];
  return (
    <Link
      to={`/shkoly/${s.slug}`}
      className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-primary/40 hover:bg-white/[0.07]"
    >
      {place !== undefined && (
        <span className="flex shrink-0 flex-col items-center gap-0.5">
          <span className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold ${place <= 3 ? "bg-amber-400/20 text-amber-200" : "bg-white/10"}`}>
            {place}
          </span>
          <Move school={s} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug group-hover:text-primary">{s.name}</p>
        <p className="mt-0.5 text-sm text-white/50">
          {KIND_LABEL[s.kind]}
          {showCity && <> · {s.city}</>}
          {s.address && !showCity && <> · {shortAddress(s.address, s.city)}</>}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {s.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
              <Icon name="BadgeCheck" size={12} />
              Сведения от школы
            </span>
          )}
          {best && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${best.federal ? "bg-amber-400/15 text-amber-200" : "bg-primary/15 text-primary"}`}>
              <Icon name="Award" size={12} />
              {best.place}-е место · {best.federal ? "топ России" : "топ региона"} RAEX
            </span>
          )}
          {(s.ratings?.length || 0) > 1 && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">+{(s.ratings?.length || 0) - 1} рейтинг</span>
          )}
        </div>
      </div>
      <Icon name="ChevronRight" size={18} className="mt-1 shrink-0 text-white/30 group-hover:text-primary" />
    </Link>
  );
}
