import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  CityData,
  TREND_ICON,
  TREND_LABEL,
  TREND_STYLE,
} from "./cities";

interface Props {
  city: CityData;
}

export default function CityCard({ city }: Props) {
  return (
    <Link
      to={`/feed/${city.slug}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition
                 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.06]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-primary">
            {city.city}
          </h3>
          <p className="text-xs text-white/40">{city.region}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${TREND_STYLE[city.trend]}`}
        >
          <Icon
            name={TREND_ICON[city.trend]}
            size={11}
            className="mr-1 inline align-[-1px]"
          />
          {TREND_LABEL[city.trend]}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-white/70">
        {city.essence}
      </p>

      <div className="mb-4 flex gap-4 text-xs">
        <div>
          <div className="text-white/40">Населения</div>
          <div className="font-semibold text-white">{city.population} млн</div>
        </div>
        <div>
          <div className="text-white/40">Зарплата</div>
          <div className="font-semibold text-white">~{city.salary} тыс ₽</div>
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-primary/10 p-3">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-primary">
          Главный вывод
        </div>
        <p className="text-sm leading-snug text-white/85">{city.keyPoint}</p>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/40">
          Приоритетные ниши
        </div>
        <ul className="space-y-1.5">
          {city.niches.map((n) => (
            <li key={n} className="flex gap-2 text-sm text-white/75">
              <Icon
                name="Check"
                size={14}
                className="mt-0.5 shrink-0 text-emerald-400"
              />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
        Читать разбор
        <Icon
          name="ArrowRight"
          size={15}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
