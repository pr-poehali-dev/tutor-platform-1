import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { createInstitution, EduKind, KIND_LABELS } from "./api";

/** Типовые зацепки: одним нажатием попадают в заметку.
 *  Без зацепки письмо получается общим — поэтому подсказываем прямо в форме. */
const HOOKS = [
  "оплата на карту",
  "нет личного кабинета",
  "только соцсети",
  "жалобы в отзывах",
  "набирают преподавателей",
  "есть онлайн-занятия",
];

interface Props {
  /** Город подставляется автоматически — менеджер не вводит его руками */
  city: string;
  /** Ниша идёт в заметку: потом видно, откуда пришёл контакт */
  nicheLabel: string;
  /** Сообщаем наверх, что контакт добавлен — счётчик обновится */
  onAdded: () => void;
}

interface FormState {
  org_name: string;
  phone: string;
  email: string;
  website: string;
  contact_name: string;
  kind: EduKind;
  note: string;
}

const EMPTY: FormState = {
  org_name: "",
  phone: "",
  email: "",
  website: "",
  contact_name: "",
  kind: "online_school",
  note: "",
};

/** Быстрое добавление организации прямо со страницы города.
 *  Собирая контакты в 2ГИС, менеджер не переключается между разделами:
 *  вбил название и телефон — сохранил — поле снова пустое для следующего. */
export default function QuickAddContact({ city, nicheLabel, onAdded }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Что добавили в этот заход — видно, что работа идёт */
  const [justAdded, setJustAdded] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  // При смене города сбрасываем список добавленного: он относится к конкретному городу.
  useEffect(() => {
    setJustAdded([]);
    setForm(EMPTY);
    setError(null);
  }, [city]);

  const set = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError(null);
  };

  const toggleHook = (h: string) => {
    setForm((f) => {
      const parts = f.note.split(",").map((s) => s.trim()).filter(Boolean);
      const has = parts.includes(h);
      const next = has ? parts.filter((p) => p !== h) : [...parts, h];
      return { ...f, note: next.join(", ") };
    });
  };

  const activeHooks = form.note.split(",").map((s) => s.trim());

  const canSave = form.org_name.trim().length > 1 && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    // К заметке добавляем нишу — позже видно, по какому запросу нашли контакт.
    const noteParts = [form.note.trim(), `ниша: ${nicheLabel}`].filter(Boolean);

    const res = await createInstitution({
      org_name: form.org_name.trim(),
      kind: form.kind,
      contact_name: form.contact_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city,
      website: form.website.trim(),
      status: "new",
      note: noteParts.join(" · "),
    });

    setSaving(false);

    if (!res.ok) {
      setError(res.error || "Не удалось сохранить");
      return;
    }

    setJustAdded((p) => [form.org_name.trim(), ...p].slice(0, 12));
    // Ниша и тип организации сохраняются: подряд обычно добавляют однотипные.
    setForm((f) => ({ ...EMPTY, kind: f.kind, note: f.note }));
    onAdded();
    nameRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Enter сохраняет — руки не уходят с клавиатуры при массовом вводе.
    if (e.key === "Enter" && canSave) {
      e.preventDefault();
      save();
    }
  };

  const inputCls =
    "w-full bg-white/[0.04] border border-white/12 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50 transition-colors";

  return (
    <div className="rounded-xl border border-purple-500/25 bg-purple-500/[0.06] p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200/80 flex items-center gap-1.5">
          <Icon name="Plus" size={13} aria-hidden="true" />
          Добавить контакт в базу
        </p>
        <span className="text-white/35 text-xs">
          город {city} · {nicheLabel}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mb-2">
        <input
          ref={nameRef}
          value={form.org_name}
          onChange={(e) => set("org_name", e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Название организации *"
          aria-label="Название организации"
          className={`${inputCls} sm:col-span-2`}
        />
        <input
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Телефон"
          aria-label="Телефон"
          inputMode="tel"
          className={inputCls}
        />
        <input
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Email"
          aria-label="Email"
          inputMode="email"
          className={inputCls}
        />
        <input
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Сайт или страница в соцсети"
          aria-label="Сайт"
          className={inputCls}
        />
        <input
          value={form.contact_name}
          onChange={(e) => set("contact_name", e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Имя руководителя"
          aria-label="Имя руководителя"
          className={inputCls}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {(Object.keys(KIND_LABELS) as EduKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => set("kind", k)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              form.kind === k
                ? "bg-purple-500/25 border-purple-400/40 text-white"
                : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80"
            }`}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-white/40 mb-1.5">
        Зацепка для письма — почему написали именно им:
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {HOOKS.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => toggleHook(h)}
            className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
              activeHooks.includes(h)
                ? "bg-amber-500/20 border-amber-400/40 text-amber-100"
                : "bg-white/[0.03] border-white/10 text-white/45 hover:text-white/75"
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      <input
        value={form.note}
        onChange={(e) => set("note", e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Заметка: что заметили на их сайте или в отзывах"
        aria-label="Заметка"
        className={`${inputCls} mb-2.5`}
      />

      {error && (
        <p className="text-rose-300 text-xs mb-2 flex items-center gap-1.5">
          <Icon name="TriangleAlert" size={13} aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {saving ? (
            <Icon name="Loader2" size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <Icon name="Check" size={15} aria-hidden="true" />
          )}
          {saving ? "Сохраняю…" : "Сохранить и следующий"}
        </button>
        <span className="text-white/30 text-xs">Enter — сохранить</span>
      </div>

      {justAdded.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/70 mb-1.5">
            Добавлено в этот заход: {justAdded.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {justAdded.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="text-xs text-white/55 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
