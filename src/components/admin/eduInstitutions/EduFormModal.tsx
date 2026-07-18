import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EduInstitution,
  EduInput,
  EduKind,
  EduStatus,
  KIND_LABELS,
  STATUS_LABELS,
  createInstitution,
  updateInstitution,
} from "./api";

interface Props {
  editing: EduInstitution | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: EduInput = {
  org_name: "",
  kind: "online_school",
  contact_name: "",
  phone: "",
  email: "",
  city: "",
  website: "",
  status: "new",
  note: "",
};

export default function EduFormModal({ editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<EduInput>(editing ? { ...editing } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof EduInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.org_name.trim() && !form.contact_name.trim() && !form.phone.trim() && !form.email.trim()) {
      setError("Заполните хотя бы название или контакт");
      return;
    }
    setSaving(true);
    setError(null);
    const res = editing
      ? await updateInstitution({ ...form, id: editing.id })
      : await createInstitution(form);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "Не удалось сохранить");
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-white/10 rounded-2xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-black text-lg">
            {editing ? "Редактировать" : "Новое учреждение"}
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Название организации">
            <Input value={form.org_name} onChange={(e) => set("org_name", e.target.value)} placeholder="Например, Онлайн-школа «Знание»" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Тип">
              <select
                value={form.kind}
                onChange={(e) => set("kind", e.target.value as EduKind)}
                className="w-full h-10 rounded-lg bg-background border border-white/10 px-3 text-sm"
              >
                {(Object.keys(KIND_LABELS) as EduKind[]).map((k) => (
                  <option key={k} value={k}>{KIND_LABELS[k]}</option>
                ))}
              </select>
            </Field>
            <Field label="Статус">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as EduStatus)}
                className="w-full h-10 rounded-lg bg-background border border-white/10 px-3 text-sm"
              >
                {(Object.keys(STATUS_LABELS) as EduStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="ФИО контактного лица">
            <Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="Иванова Мария Петровна" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Телефон">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+7 900 000-00-00" />
            </Field>
            <Field label="Email">
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@school.ru" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Город">
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Москва" />
            </Field>
            <Field label="Сайт">
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="school.ru" />
            </Field>
          </div>

          <Field label="Заметка">
            <textarea
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-background border border-white/10 px-3 py-2 text-sm resize-none"
              placeholder="Комментарий менеджера"
            />
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button onClick={save} disabled={saving} className="flex-1">
              {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : editing ? "Сохранить" : "Добавить"}
            </Button>
            <Button variant="outline" onClick={onClose}>Отмена</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/55 mb-1">{label}</span>
      {children}
    </label>
  );
}
