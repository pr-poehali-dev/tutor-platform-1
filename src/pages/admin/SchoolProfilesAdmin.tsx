import { useCallback, useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminProfile, dirApi } from "@/components/schools/api";
import { wave2Preview, wave2Settings, wave2Status, wave2Test, Wave2Status } from "@/components/admin/eduInstitutions/api";

const PIN_KEY = "uchispro_admin_pin_v1";
const TABS = [
  { v: "pending", label: "На проверке" },
  { v: "approved", label: "Опубликованы" },
  { v: "rejected", label: "Отклонены" },
];

/** Справочник школ: модерация анкет и вторая волна писем «Расскажите о школе». */
export default function SchoolProfilesAdmin() {
  const [pin, setPin] = useState(() => sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "");
  const [pinInput, setPinInput] = useState("");
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState<AdminProfile[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [w2, setW2] = useState<Wave2Status | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const r = await dirApi.adminProfiles(tab);
    if (!r.ok) {
      if (r.error === "Нет доступа") {
        sessionStorage.removeItem(PIN_KEY);
        localStorage.removeItem(PIN_KEY);
        setPin("");
      }
      setError(r.error);
      return;
    }
    setError("");
    setItems(r.data.items);
    setCounts(r.data.counts);
  }, [tab]);

  const loadW2 = useCallback(async () => {
    const r = await wave2Status();
    if (r.ok) setW2(r.data!);
  }, []);

  useEffect(() => {
    if (pin) {
      load();
      loadW2();
    }
  }, [pin, load, loadW2]);

  if (!pin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh p-6 font-golos">
        <Card className="w-full max-w-sm border-white/10 bg-white/[0.04] p-6">
          <p className="mb-3 font-bold text-white">Введите PIN администратора</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = pinInput.trim();
              if (!v) return;
              sessionStorage.setItem(PIN_KEY, v);
              setPin(v);
            }}
            className="flex gap-2"
          >
            <Input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="PIN" />
            <Button type="submit" className="bg-primary text-primary-foreground">Войти</Button>
          </form>
          {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
        </Card>
      </div>
    );
  }

  const review = async (id: number, decision: "approve" | "reject") => {
    const note = decision === "reject" ? window.prompt("Причина (для себя, школе не отправляется):") || undefined : undefined;
    const r = await dirApi.adminReview(id, decision, note);
    setMsg(r.ok ? (decision === "approve" ? "Анкета опубликована" : "Анкета отклонена") : r.error);
    load();
  };

  const toggleW2 = async () => {
    if (!w2) return;
    const r = await wave2Settings(!w2.enabled);
    if (r.ok) loadW2();
  };

  const showPreview = async () => {
    const r = await wave2Preview();
    if (r.ok) setPreview(r.data!.html);
    else setMsg(r.error || "Ошибка");
  };

  const sendTest = async () => {
    const r = await wave2Test(testEmail);
    setMsg(r.ok && r.data!.ok ? `Тестовое письмо отправлено на ${r.data!.to}` : r.data?.error || r.error || "Не удалось отправить");
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Справочник школ — админка" description="Модерация анкет школ" noindex />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
          <Icon name="ArrowLeft" size={15} />
          Админка
        </Link>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">Справочник школ</h1>
          <div className="flex gap-3 text-sm">
            <Link to="/shkoly" className="text-primary hover:underline">Справочник</Link>
            <Link to="/shkoly/reyting" className="text-primary hover:underline">Рейтинг</Link>
          </div>
        </div>

        {w2 && (
          <Card className={`mb-6 border p-5 ${w2.enabled ? "border-emerald-400/30 bg-emerald-500/[0.07]" : "border-white/10 bg-white/[0.04]"}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-bold">
                  <Icon name="Mail" size={18} className={w2.enabled ? "text-emerald-300" : "text-white/50"} />
                  Вторая волна «Расскажите о школе» — {w2.enabled ? "включена" : "выключена"}
                </p>
                <p className="mt-1 text-sm text-white/65">
                  {w2.first_wave_pending > 0
                    ? `Ждёт первую волну: осталось ${w2.first_wave_pending} писем. Начнётся сама, когда очередь первой волны опустеет — лимит Яндекса не делится.`
                    : `Идёт: в очереди ${w2.pending} школ.`}{" "}
                  Письмо уходит не раньше чем через {w2.wait_days} дней после первого. Отправлено: {w2.sent}
                  {w2.failed > 0 && `, не доставлено: ${w2.failed}`}.
                </p>
              </div>
              <Button onClick={toggleW2} className={w2.enabled ? "bg-white/10 text-white hover:bg-white/20" : "bg-primary text-primary-foreground"}>
                {w2.enabled ? "Выключить" : "Включить"}
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={showPreview} className="border-white/15 bg-white/5 text-white">
                <Icon name="Eye" size={15} className="mr-1" />
                Посмотреть письмо
              </Button>
              <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Почта для теста" className="w-56" />
              <Button variant="outline" onClick={sendTest} disabled={!testEmail.includes("@")} className="border-white/15 bg-white/5 text-white">
                Отправить тест
              </Button>
            </div>
          </Card>
        )}

        {preview && (
          <Card className="mb-6 overflow-hidden border-white/10 bg-white p-0">
            <div className="flex items-center justify-between bg-white/90 px-4 py-2 text-sm text-slate-700">
              Так видит письмо директор
              <button onClick={() => setPreview(null)} className="text-slate-500 hover:text-slate-800">
                <Icon name="X" size={16} />
              </button>
            </div>
            <iframe title="Письмо" srcDoc={preview} className="h-[640px] w-full" sandbox="" />
          </Card>
        )}

        {msg && <p className="mb-4 rounded-xl bg-white/10 px-4 py-2 text-sm">{msg}</p>}

        <div className="mb-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={`rounded-full border px-3 py-1.5 text-sm ${tab === t.v ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/5 text-white/70"}`}
            >
              {t.label} {counts[t.v] ? `(${counts[t.v]})` : ""}
            </button>
          ))}
        </div>

        {error && <p className="text-rose-300">{error}</p>}
        {!items.length && !error && <p className="text-white/50">Анкет пока нет. Они появятся, когда школы получат письмо второй волны или заполнят форму на странице школы.</p>}

        <div className="space-y-4">
          {items.map((p) => (
            <Card key={p.id} className="border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/shkoly/${p.slug}`} className="font-bold hover:text-primary">{p.school_name}</Link>
                  <p className="text-sm text-white/50">{p.city} · {new Date(p.created_at).toLocaleString("ru-RU")}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {p.via_letter ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">По ссылке из письма — надёжно</span>
                  ) : (
                    <span className="rounded-full bg-amber-400/15 px-2 py-1 text-amber-200">С сайта — проверьте отправителя</span>
                  )}
                  {!p.via_letter && p.email_matches_school && <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">Почта на домене школы</span>}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <Field label="Достижения" text={p.achievements} />
                <Field label="Методики" text={p.methods} />
                <Field label="О школе" text={p.about} />
                <Field label="Профили" text={p.profiles} />
                {(p.olympiad_winners || p.avg_ege) && (
                  <Field label="Цифры" text={[p.olympiad_winners && `олимпиады: ${p.olympiad_winners}`, p.avg_ege && `ЕГЭ: ${p.avg_ege}`].filter(Boolean).join(" · ")} />
                )}
                <Field label="Сайт" text={p.website} />
              </div>
              <p className="mt-3 text-xs text-white/50">
                Прислал: {p.contact_name || "—"} {p.contact_role && `(${p.contact_role})`} {p.contact_email && `· ${p.contact_email}`} · Почта школы в базе: {p.school_email || "—"}
              </p>
              {p.moderator_note && <p className="mt-1 text-xs text-white/50">Заметка: {p.moderator_note}</p>}

              {p.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => review(p.id, "approve")} className="bg-emerald-500 text-white hover:bg-emerald-600">
                    <Icon name="Check" size={15} className="mr-1" />
                    Опубликовать
                  </Button>
                  <Button variant="outline" onClick={() => review(p.id, "reject")} className="border-white/15 bg-white/5 text-white">
                    Отклонить
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, text }: { label: string; text: string | null | undefined }) {
  if (!text) return null;
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <p className="mb-1 text-xs text-white/50">{label}</p>
      <p className="whitespace-pre-line text-white/85">{text}</p>
    </div>
  );
}
