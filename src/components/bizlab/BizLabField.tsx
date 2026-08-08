import { BizField } from "./types";

export default function Field({
  field,
  value,
  onSet,
}: {
  field: BizField;
  value: string;
  onSet: (k: string, v: string) => void;
}) {
  const base =
    "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-amber-500/50 transition-colors";

  return (
    <div>
      <label className="block text-white/85 text-sm font-semibold mb-1">
        {field.label}
        {field.optional && <span className="text-white/35 font-normal"> — необязательно</span>}
      </label>
      {field.hint && <p className="text-white/40 text-xs mb-2 leading-snug">{field.hint}</p>}

      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onSet(field.key, e.target.value)}
          className={`${base} appearance-none`}
        >
          <option value="" className="bg-[#140f28]">
            Выберите…
          </option>
          {field.options!.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#140f28]">
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onSet(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          className={`${base} resize-y`}
        />
      ) : field.type === "number" ? (
        <div className="relative">
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => onSet(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`${base} pr-16`}
          />
          {field.suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              {field.suffix}
            </span>
          )}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onSet(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      )}
    </div>
  );
}
