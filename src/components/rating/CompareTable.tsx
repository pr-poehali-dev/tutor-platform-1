import { Fragment, useState } from "react";
import Icon from "@/components/ui/icon";
import { FEATURE_LABELS, KIDS_SCHOOLS, PRICE_LABEL, KidsSchool } from "./kidsSchools";

type FeatureKey = keyof KidsSchool["features"];

export default function CompareTable() {
  const [need, setNeed] = useState<FeatureKey[]>([]);

  const toggle = (k: FeatureKey) =>
    setNeed((n) => (n.includes(k) ? n.filter((x) => x !== k) : [...n, k]));

  const rows = KIDS_SCHOOLS.map((s) => ({ s, ok: need.every((k) => s.features[k]) }));
  const matches = rows.filter((r) => r.ok).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/60">Мне важно:</span>
        {FEATURE_LABELS.map((f) => {
          const on = need.includes(f.key);
          return (
            <button
              key={f.key}
              onClick={() => toggle(f.key)}
              title={f.hint}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                on ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          );
        })}
        {need.length > 0 && (
          <span className="text-xs text-white/50">
            Подходит: {matches} из {rows.length}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-xs text-white/50">
              <th className="sticky left-0 z-10 bg-[#1a1530] p-3">Школа</th>
              {FEATURE_LABELS.map((f) => (
                <th key={f.key} className={`p-3 text-center ${need.includes(f.key) ? "text-primary" : ""}`} title={f.hint}>
                  {f.label}
                </th>
              ))}
              <th className="p-3 text-center">Цена</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, ok }) => (
              <Fragment key={s.slug}>
                <tr className={`border-t border-white/5 transition ${ok ? "" : "opacity-30"} ${s.own ? "bg-primary/10" : ""}`}>
                  <td className={`sticky left-0 z-10 p-3 font-semibold ${s.own ? "bg-[#2a1f4a]" : "bg-[#1a1530]"}`}>
                    <a href={`#${s.slug}`} className="hover:text-primary">{s.name}</a>
                  </td>
                  {FEATURE_LABELS.map((f) => (
                    <td key={f.key} className="p-3 text-center">
                      {s.features[f.key] ? (
                        <Icon name="Check" size={17} className="mx-auto text-emerald-300" />
                      ) : (
                        <Icon name="Minus" size={17} className="mx-auto text-white/25" />
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-center font-semibold text-amber-200">{PRICE_LABEL[s.priceLevel]}</td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-white/40">
        Цена — относительный ориентир: ₽ — недорого, ₽₽ — средне, ₽₽₽ — дороже всего (обычно индивидуальные занятия).
        Точные цены зависят от программы и скидок — проверяйте на сайте школы.
      </p>
    </div>
  );
}