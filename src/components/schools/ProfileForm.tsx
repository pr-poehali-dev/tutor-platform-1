import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { dirApi, ProfileFields } from "./api";

const EMPTY: ProfileFields = {
  website: "", about: "", achievements: "", methods: "", profiles: "", olympiad_winners: "", avg_ege: "",
  contact_name: "", contact_role: "", contact_email: "", publish_consent: false,
};

interface Props {
  mode: "token" | "claim";
  token?: string;
  slug?: string;
  initial?: Partial<ProfileFields>;
}

export default function ProfileForm({ mode, token, slug, initial }: Props) {
  const [f, setF] = useState<ProfileFields>({ ...EMPTY, ...Object.fromEntries(Object.entries(initial || {}).map(([k, v]) => [k, v ?? (k === "publish_consent" ? false : "")])) });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const set = (k: keyof ProfileFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.achievements.trim() && !f.methods.trim() && !f.about.trim()) {
      setError("Расскажите хотя бы о достижениях или методиках школы");
      return;
    }
    if (mode === "claim" && (!f.contact_name.trim() || !f.contact_email.trim())) {
      setError("Укажите имя и почту для связи");
      return;
    }
    if (!f.publish_consent) {
      setError("Отметьте согласие на публикацию");
      return;
    }
    setSending(true);
    const r = mode === "token" ? await dirApi.submit(token || "", f) : await dirApi.claim(slug || "", f);
    setSending(false);
    if (r.ok) setDone(r.data.message);
    else setError(r.error);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
        <p className="flex items-center gap-2 font-semibold text-emerald-300">
          <Icon name="CircleCheck" size={18} />
          Анкета отправлена
        </p>
        <p className="mt-2 text-sm text-white/75">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Достижения школы" hint="Олимпиады, конкурсы, поступления в вузы, гранты, победы команд — с цифрами и годами">
        <Textarea value={f.achievements} onChange={set("achievements")} rows={5} maxLength={3000}
          placeholder="Например: 12 призёров регионального этапа ВсОШ в 2025/26; команда — победитель «Инженерных кадров Сибири»…" />
      </Field>
      <Field label="Методики и авторские программы" hint="Что вы делаете иначе, чем другие школы. Лучшие практики расскажем коллегам с указанием авторов">
        <Textarea value={f.methods} onChange={set("methods")} rows={5} maxLength={3000}
          placeholder="Например: проектная неделя каждую четверть; авторский курс финансовой грамотности для 7–9 классов…" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Профильные классы и направления">
          <Input value={f.profiles} onChange={set("profiles")} maxLength={600} placeholder="Физмат, инженерный, медицинский…" />
        </Field>
        <Field label="Сайт школы">
          <Input value={f.website} onChange={set("website")} maxLength={300} placeholder="school.ru" />
        </Field>
        <Field label="Призёров и победителей олимпиад за год">
          <Input value={f.olympiad_winners} onChange={set("olympiad_winners")} inputMode="numeric" placeholder="Например, 25" />
        </Field>
        <Field label="Средний балл ЕГЭ">
          <Input value={f.avg_ege} onChange={set("avg_ege")} inputMode="decimal" placeholder="Например, 72,4" />
        </Field>
      </div>
      <Field label="Коротко о школе">
        <Textarea value={f.about} onChange={set("about")} rows={3} maxLength={1500} placeholder="Пара предложений для родителей: чем школа особенная" />
      </Field>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-sm font-semibold">Контакт для уточнений {mode === "token" && <span className="font-normal text-white/50">(не публикуем)</span>}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input value={f.contact_name} onChange={set("contact_name")} maxLength={200} placeholder="Имя" />
          <Input value={f.contact_role} onChange={set("contact_role")} maxLength={200} placeholder="Должность" />
          <Input value={f.contact_email} onChange={set("contact_email")} maxLength={200} type="email" placeholder="Почта" />
        </div>
        {mode === "claim" && <p className="mt-2 text-xs text-white/50">Не публикуем. Почта на домене школы ускорит проверку.</p>}
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-white/75">
        <input
          type="checkbox"
          checked={f.publish_consent}
          onChange={(e) => setF((x) => ({ ...x, publish_consent: e.target.checked }))}
          className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
        />
        Согласен на публикацию этих сведений на странице школы в справочнике УЧИСЬПРО. Контактные данные не публикуются.
      </label>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      <Button type="submit" disabled={sending} className="w-full bg-primary text-primary-foreground sm:w-auto">
        {sending ? "Отправляем…" : "Отправить анкету"}
      </Button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {hint && <span className="mb-2 block text-xs text-white/50">{hint}</span>}
      {children}
    </label>
  );
}
