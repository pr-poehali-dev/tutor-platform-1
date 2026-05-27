import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SubjectCode, SUBJECTS } from "@/components/graduate/graduateData";

const PICKABLE: SubjectCode[] = [
  "russian", "math_prof", "math_base", "physics", "chemistry", "biology",
  "informatics", "history", "social", "literature", "geography", "english",
];

interface Props {
  value: SubjectCode[];
  onChange: (subjects: SubjectCode[]) => void;
  onSave: () => Promise<void>;
}

export default function SubjectsPicker({ value, onChange, onSave }: Props) {
  const [saving, setSaving] = useState(false);

  const toggle = (code: SubjectCode) => {
    if (value.includes(code)) {
      onChange(value.filter((s) => s !== code));
    } else {
      onChange([...value, code]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
  };

  const requiredOk = value.includes("russian") && (value.includes("math_prof") || value.includes("math_base"));

  return (
    <div className="bg-card border border-white/10 rounded-3xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="ListChecks" size={16} className="text-purple-300" />
        <span className="text-purple-300 text-[11px] uppercase tracking-wider font-bold">Шаг 1 · Профиль</span>
      </div>
      <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-1">
        Какие ЕГЭ ты сдаёшь?
      </h2>
      <p className="text-white/55 text-xs mb-4">
        Минимум: русский + математика (база или профиль). Остальные — по выбору, не больше 4 дополнительных.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
        {PICKABLE.map((code) => {
          const s = SUBJECTS[code];
          const active = value.includes(code);
          return (
            <button
              key={code}
              onClick={() => toggle(code)}
              className={`flex flex-col items-center gap-1.5 border-2 rounded-2xl p-3 transition-all ${
                active
                  ? "bg-purple-500/25 border-purple-400 text-white shadow-lg shadow-purple-500/25 scale-[1.03]"
                  : "bg-white/[0.03] border-white/12 text-white/70 hover:bg-white/[0.06]"
              }`}
              aria-pressed={active}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-xs font-bold text-center leading-tight">{s.label}</span>
              {active && (
                <Icon name="CheckCircle2" size={12} className="text-purple-300" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className={`text-xs ${requiredOk ? "text-emerald-300" : "text-rose-300"} flex items-center gap-1`}>
          <Icon name={requiredOk ? "CheckCircle2" : "AlertCircle"} size={12} />
          {requiredOk
            ? `Выбрано ${value.length} предметов`
            : "Нужны русский + математика (база или профиль)"}
        </p>
        <button
          onClick={handleSave}
          disabled={!requiredOk || saving}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Save" size={14} />}
          Сохранить
        </button>
      </div>
    </div>
  );
}
