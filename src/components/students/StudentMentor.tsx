import { useState } from "react";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import MentorAnswer from "./MentorAnswer";
import { EMPTY_FORM, MODES, MentorForm, MentorMode, WORK_TYPES, askMentor } from "./mentorData";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-violet-400/60 focus:outline-none";

export default function StudentMentor() {
  const [mode, setMode] = useState<MentorMode>("plan");
  const [form, setForm] = useState<MentorForm>(EMPTY_FORM);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = MODES.find((m) => m.id === mode)!;
  const set = (k: keyof MentorForm, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const showMeta = mode !== "gost";
  const textTooShort = form.text.trim().length < cfg.minText;
  const needTopic = mode === "plan" && form.topic.trim().length < 5;
  const disabled = loading || textTooShort || needTopic;

  const pickMode = (id: MentorMode) => {
    setMode(id);
    setAnswer("");
    setError("");
  };

  const fillExample = () => setForm({ ...EMPTY_FORM, ...cfg.example });

  const submit = async () => {
    setLoading(true);
    setError("");
    setAnswer("");
    trackGoal("student_mentor_ask", { mode });
    const r = await askMentor(mode, form);
    setLoading(false);
    if (r.answer) setAnswer(r.answer);
    else setError(r.error || "Не получилось получить ответ");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(answer).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] via-background/40 to-cyan-500/[0.06] p-4 md:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => pickMode(m.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-all ${
              mode === m.id
                ? "border-violet-400/60 bg-violet-500/20 text-white"
                : "border-white/10 bg-white/[0.03] text-white/65 hover:text-white hover:border-white/20"
            }`}
          >
            <Icon name={m.icon} size={16} className={mode === m.id ? "text-violet-200" : "text-white/45"} />
            <span className="leading-tight">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <p className="text-white/60 text-sm max-w-xl">{cfg.hint}</p>
        {Object.keys(cfg.example).length > 0 && (
          <button onClick={fillExample} className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1">
            <Icon name="Wand2" size={13} /> Заполнить пример
          </button>
        )}
      </div>

      {showMeta && (
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <select value={form.workType} onChange={(e) => set("workType", e.target.value)} className={field}>
            {WORK_TYPES.map((w) => (
              <option key={w} value={w} className="bg-slate-900">{w}</option>
            ))}
          </select>
          <input value={form.field} onChange={(e) => set("field", e.target.value)} placeholder="Направление, например «Экономика»" className={field} />
          <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Дисциплина, например «Маркетинг»" className={field} />
          <input value={form.deadline} onChange={(e) => set("deadline", e.target.value)} placeholder="Срок, например «через 6 недель»" className={field} />
          {mode !== "topic" && (
            <input
              value={form.topic}
              onChange={(e) => set("topic", e.target.value)}
              placeholder={mode === "plan" ? "Тема работы — обязательно" : "Тема работы"}
              className={`${field} sm:col-span-2`}
            />
          )}
        </div>
      )}

      <label className="block text-xs font-bold text-white/55 uppercase tracking-wider mb-1.5">{cfg.textLabel}</label>
      <textarea
        value={form.text}
        onChange={(e) => set("text", e.target.value.slice(0, 12000))}
        placeholder={cfg.placeholder}
        rows={mode === "review" ? 10 : 4}
        className={`${field} resize-y leading-relaxed`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <span className="text-xs text-white/40">
          {mode === "review" && textTooShort
            ? `Нужно хотя бы 300 символов — сейчас ${form.text.trim().length}`
            : needTopic
              ? "Укажите тему работы"
              : `${form.text.length} / 12 000 символов`}
        </span>
        <button
          onClick={submit}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Sparkles" size={16} />}
          {loading ? "Научрук думает…" : "Получить разбор"}
        </button>
      </div>

      {loading && (
        <p className="mt-4 text-sm text-white/50">Это займёт 10–25 секунд — научрук читает внимательно.</p>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
      )}

      {answer && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-background/60 p-5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-200">
              <Icon name="GraduationCap" size={14} /> Научрук · {cfg.label}
            </div>
            <button onClick={copy} className="text-xs font-bold text-white/55 hover:text-white flex items-center gap-1">
              <Icon name={copied ? "Check" : "Copy"} size={13} /> {copied ? "Скопировано" : "Скопировать"}
            </button>
          </div>
          <MentorAnswer text={answer} />
          <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/40">
            Научрук подсказывает и проверяет, но не пишет работу за вас. Сверяйтесь с методичкой кафедры — её требования важнее.
          </p>
        </div>
      )}
    </div>
  );
}
