import { useState } from "react";
import Icon from "@/components/ui/icon";
import { updateSchool, type School } from "./api";

interface Props {
  school: School;
  onUpdated: (s: School) => void;
}

const PERSONA_PRESETS = [
  { label: "Дружелюбный наставник", text: "Ты — доброжелательный и терпеливый наставник. Объясняешь простыми словами, подбадриваешь ученика и приводишь жизненные примеры." },
  { label: "Строгий эксперт", text: "Ты — требовательный эксперт-практик. Отвечаешь чётко и по делу, указываешь на ошибки и даёшь конкретные рекомендации без воды." },
  { label: "Вдохновляющий коуч", text: "Ты — энергичный коуч. Мотивируешь, помогаешь поверить в себя, разбиваешь сложное на простые шаги и празднуешь маленькие победы ученика." },
];

export default function SchoolTeacher({ school, onUpdated }: Props) {
  const [enabled, setEnabled] = useState(school.ai_teacher_enabled);
  const [persona, setPersona] = useState(school.ai_teacher_persona || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    const res = await updateSchool({ ai_teacher_enabled: next });
    if (res.ok && res.data) onUpdated(res.data.school);
  };

  const savePersona = async () => {
    setSaving(true);
    setMsg(null);
    const res = await updateSchool({ ai_teacher_persona: persona });
    setSaving(false);
    if (res.ok && res.data) {
      onUpdated(res.data.school);
      setMsg("Настройки сохранены");
    } else {
      setMsg(res.error || "Не удалось сохранить");
    }
  };

  return (
    <div className="space-y-5">
      {/* Включение */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-montserrat font-bold text-white mb-1 flex items-center gap-2">
              <Icon name="Sparkles" size={17} className="text-violet-300" /> ИИ-преподаватель
            </h3>
            <p className="text-white/55 text-sm max-w-lg">
              Ученики смогут задавать вопросы по вашему курсу ИИ-наставнику 24/7. Он отвечает
              строго в контексте программы курса и с заданным вами характером.
            </p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
              enabled ? "bg-violet-500" : "bg-white/15"
            }`}
            aria-label="Включить ИИ-преподавателя"
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Персона */}
      <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-opacity ${enabled ? "" : "opacity-50 pointer-events-none"}`}>
        <h3 className="font-montserrat font-bold text-white mb-1">Характер наставника</h3>
        <p className="text-white/55 text-sm mb-3">Опишите, как ИИ должен общаться с учениками. Можно выбрать пресет.</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {PERSONA_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPersona(p.text)}
              className="text-xs text-violet-200 border border-violet-500/30 hover:bg-violet-500/10 rounded-lg px-3 py-1.5 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <textarea
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          rows={4}
          placeholder="Например: Ты — доброжелательный наставник, объясняешь простыми словами и приводишь примеры…"
          className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 resize-y"
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={savePersona}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Check" size={15} />}
            Сохранить
          </button>
          {msg && <span className="text-sm text-emerald-300">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
