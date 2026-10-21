import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Helper, HelperTemplate, PlanLimits, helperApi } from "./api";

const COLORS = ["#7c3aed", "#0891b2", "#059669", "#ea580c", "#db2777", "#2563eb"];
const TONES: { id: Helper["tone"]; label: string }[] = [
  { id: "friendly", label: "Дружелюбный" },
  { id: "business", label: "Деловой" },
  { id: "simple", label: "Простой" },
];

interface Props {
  initial: Partial<Helper>;
  templates: HelperTemplate[];
  limits: PlanLimits;
  onSaved: (h: Helper) => void;
  onCancel?: () => void;
}

/** Три шага: роль → база знаний → внешний вид. */
export default function HelperEditor({ initial, templates, limits, onSaved, onCancel }: Props) {
  const [h, setH] = useState<Partial<Helper>>({ tone: "friendly", color: COLORS[0], is_active: true, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !h.id;
  const set = (patch: Partial<Helper>) => setH((p) => ({ ...p, ...patch }));

  const applyTemplate = (t: HelperTemplate) =>
    set({ template: t.id, role: t.role, greeting: t.greeting, instructions: t.instructions, knowledge: h.knowledge?.trim() ? h.knowledge : t.knowledge });

  const save = async () => {
    setBusy(true);
    setError(null);
    const r = await helperApi.save(h);
    setBusy(false);
    if (r.ok && r.data) onSaved(r.data.item);
    else setError(r.error || "Не удалось сохранить");
  };

  const kLen = (h.knowledge || "").length;
  const over = kLen > limits.knowledge;

  return (
    <div className="space-y-6">
      {isNew && (
        <section>
          <StepTitle n={1} title="Что будет делать помощник?" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className={`text-left rounded-xl border p-3.5 transition-colors ${
                  h.template === t.id ? "border-violet-400 bg-violet-500/15" : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
              >
                <p className="font-semibold text-sm">{t.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{t.role}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <StepTitle n={isNew ? 2 : 1} title="Кто он и как отвечает" />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Имя помощника">
            <input className={inputCls} value={h.name || ""} maxLength={120} onChange={(e) => set({ name: e.target.value })} placeholder="Например: Ася из студии «Лотос»" />
          </Field>
          <Field label="Роль">
            <input className={inputCls} value={h.role || ""} maxLength={200} onChange={(e) => set({ role: e.target.value })} placeholder="Администратор студии йоги" />
          </Field>
        </div>
        <Field label="Приветствие — первое сообщение клиенту">
          <input className={inputCls} value={h.greeting || ""} maxLength={500} onChange={(e) => set({ greeting: e.target.value })} />
        </Field>
        <Field label="Как себя вести (ваши правила)">
          <textarea className={`${inputCls} h-20 py-2`} value={h.instructions || ""} maxLength={2000} onChange={(e) => set({ instructions: e.target.value })} />
        </Field>
        <div className="flex gap-2 flex-wrap">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => set({ tone: t.id })}
              className={`px-3 py-1.5 rounded-lg text-sm border ${h.tone === t.id ? "border-violet-400 bg-violet-500/20" : "border-white/10 text-white/60"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <StepTitle n={isNew ? 3 : 2} title="База знаний — всё, что он должен знать" />
        <p className="text-sm text-white/55">
          Вставьте прайс, условия, адрес, часы работы, частые вопросы и ответы, выдержки из регламентов. Помощник отвечает
          только по этому тексту и не выдумывает — если ответа нет, предложит связаться с вами.
        </p>
        <textarea
          className={`${inputCls} h-64 py-2 font-mono text-[13px] ${over ? "border-red-400/60" : ""}`}
          value={h.knowledge || ""}
          onChange={(e) => set({ knowledge: e.target.value })}
          placeholder="Скопируйте сюда текст с сайта, из прайса или документов"
        />
        <p className={`text-xs ${over ? "text-red-300" : "text-white/45"}`}>
          {kLen.toLocaleString("ru-RU")} из {limits.knowledge.toLocaleString("ru-RU")} символов
          {over && " — сократите текст или подключите PRO"}
        </p>
        <Field label="Контакт для сложных вопросов (телефон, мессенджер или почта)">
          <input className={inputCls} value={h.contact || ""} maxLength={300} onChange={(e) => set({ contact: e.target.value })} placeholder="+7 900 000-00-00, WhatsApp" />
        </Field>
      </section>

      <section className="space-y-2">
        <StepTitle n={isNew ? 4 : 3} title="Цвет" />
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => set({ color: c })}
              className={`w-9 h-9 rounded-full border-2 ${h.color === c ? "border-white" : "border-transparent"}`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={save} disabled={busy || !(h.name || "").trim()} className="bg-violet-600 hover:bg-violet-700">
          {busy ? <Icon name="Loader2" size={16} className="animate-spin mr-1.5" /> : <Icon name="Sparkles" size={16} className="mr-1.5" />}
          {isNew ? "Создать помощника" : "Сохранить"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-3 text-sm outline-none focus:border-white/30";

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <h3 className="font-montserrat font-bold text-lg flex items-center gap-2 mb-2">
      <span className="w-7 h-7 rounded-full bg-violet-500/25 text-violet-200 text-sm flex items-center justify-center">{n}</span>
      {title}
    </h3>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-white/55 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
