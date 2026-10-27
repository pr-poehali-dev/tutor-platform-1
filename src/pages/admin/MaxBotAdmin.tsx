import { useCallback, useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const URL = (func2url as Record<string, string>)["max-bot"];
const PIN_KEY = "uchispro_admin_pin_v1";
const MINIAPP = "https://xn--h1amcedk2a6b.xn--p1ai/max";

interface Status {
  settings: { daily_enabled: boolean; welcome_text: string };
  subscribers: { total: number; daily: number; blocked: number; unsubscribed: number; new_7d: number };
  app_users: number;
  log: { date: string; task_id: string; sent: number; failed: number }[];
  today_task: { id: string; preview: string };
  send_hour_msk: number;
}

const pin = () => sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";

async function call<T>(action: string, body?: unknown): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const r = await fetch(`${URL}?action=${action}`, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", "X-Admin-Pin": pin() },
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    return r.ok ? { ok: true, data: d } : { ok: false, error: d.error || `Ошибка ${r.status}` };
  } catch {
    return { ok: false, error: "Нет связи с сервером" };
  }
}

/** Админка бота MAX: подписчики, выключатель задания дня, текст приветствия. */
export default function MaxBotAdmin() {
  const [hasPin, setHasPin] = useState(!!pin());
  const [pinInput, setPinInput] = useState("");
  const [st, setSt] = useState<Status | null>(null);
  const [welcome, setWelcome] = useState("");
  const [testId, setTestId] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const r = await call<Status>("admin_status");
    if (!r.ok) {
      if (r.error === "Нет доступа") {
        sessionStorage.removeItem(PIN_KEY);
        localStorage.removeItem(PIN_KEY);
        setHasPin(false);
      }
      setError(r.error || "");
      return;
    }
    setError("");
    setSt(r.data!);
    setWelcome(r.data!.settings.welcome_text);
  }, []);

  useEffect(() => {
    if (hasPin) load();
  }, [hasPin, load]);

  if (!hasPin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh p-6 font-golos">
        <Card className="w-full max-w-sm border-white/10 bg-white/[0.04] p-6">
          <p className="mb-3 font-bold text-white">Введите PIN администратора</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!pinInput.trim()) return;
              sessionStorage.setItem(PIN_KEY, pinInput.trim());
              setHasPin(true);
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

  const toggle = async (v: boolean) => {
    const r = await call("admin_save", { daily_enabled: v });
    setMsg(r.ok ? (v ? "Рассылка задания дня включена" : "Рассылка задания дня выключена") : r.error || "");
    load();
  };

  const saveWelcome = async () => {
    const r = await call("admin_save", { welcome_text: welcome });
    setMsg(r.ok ? "Приветствие сохранено — новые пользователи увидят его после /start" : r.error || "");
    load();
  };

  const test = async (kind: "welcome" | "daily") => {
    const r = await call<{ ok: boolean; result: string }>("admin_test", { max_user_id: Number(testId), kind });
    setMsg(r.ok && r.data!.ok ? "Отправлено — проверьте чат с ботом" : `Не отправилось: ${r.data?.result || r.error}`);
  };

  const s = st?.subscribers;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="MAX-бот — админка" description="Подписчики и рассылки бота MAX" noindex />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
          <Icon name="ArrowLeft" size={15} />
          Админка
        </Link>
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">MAX-бот</h1>
        {error && <p className="mb-4 text-rose-300">{error}</p>}
        {msg && <p className="mb-4 rounded-xl bg-white/10 px-4 py-2 text-sm">{msg}</p>}

        {st && (
          <>
            <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Подписаны на задание дня" value={s!.daily} tone="text-emerald-300" />
              <Stat label="Всего запускали бота" value={s!.total} />
              <Stat label="Новых за 7 дней" value={s!.new_7d} tone="text-primary" />
              <Stat label="Открывали приложение" value={st.app_users} tone="text-cyan-300" />
            </section>
            <p className="-mt-3 mb-6 text-xs text-white/45">
              Отписались: {s!.unsubscribed} · остановили бота: {s!.blocked}
            </p>

            <Card className={`mb-6 border p-5 ${st.settings.daily_enabled ? "border-emerald-400/30 bg-emerald-500/[0.07]" : "border-white/10 bg-white/[0.04]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">Задание дня в {st.send_hour_msk}:00 по Москве</p>
                  <p className="mt-1 text-sm text-white/60">
                    Одно задание ОГЭ на всех — то же, что в мини-приложении. В каждом сообщении — кнопки «Решить в приложении» и «Отписаться».
                  </p>
                </div>
                <Switch checked={st.settings.daily_enabled} onCheckedChange={toggle} aria-label="Рассылка задания дня" />
              </div>
              <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-black/30 p-3 font-golos text-sm text-white/80">{st.today_task.preview}</pre>
              {st.log.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold">Последние рассылки</p>
                  <div className="space-y-1 text-sm text-white/70">
                    {st.log.map((l) => (
                      <p key={l.date + l.task_id}>
                        {new Date(l.date).toLocaleDateString("ru-RU")} — отправлено {l.sent}
                        {l.failed > 0 && <span className="text-rose-300">, не доставлено {l.failed}</span>}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="mb-6 border-white/10 bg-white/[0.04] p-5">
              <p className="font-bold">Приветствие по /start</p>
              <p className="mb-3 mt-1 text-sm text-white/60">Под текстом всегда кнопка «Открыть УЧИСЬПРО» — она запускает мини-приложение.</p>
              <Textarea value={welcome} onChange={(e) => setWelcome(e.target.value)} rows={8} maxLength={3500} />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-white/40">{welcome.length} / 3500</span>
                <Button onClick={saveWelcome} disabled={welcome === st.settings.welcome_text} className="bg-primary text-primary-foreground">
                  Сохранить
                </Button>
              </div>
            </Card>

            <Card className="mb-6 border-white/10 bg-white/[0.04] p-5">
              <p className="font-bold">Проверить на себе</p>
              <p className="mb-3 mt-1 text-sm text-white/60">
                Напишите боту /start — вы появитесь в подписчиках. Чтобы прислать себе тест, укажите свой ID в MAX (его покажет бот по команде /id).
              </p>
              <div className="flex flex-wrap gap-2">
                <Input value={testId} onChange={(e) => setTestId(e.target.value.replace(/\D/g, ""))} placeholder="ID в MAX" className="w-44" autoComplete="current-password" />
                <Button variant="outline" disabled={!testId} onClick={() => test("welcome")} className="border-white/15 bg-white/5 text-white">
                  Приветствие
                </Button>
                <Button variant="outline" disabled={!testId} onClick={() => test("daily")} className="border-white/15 bg-white/5 text-white">
                  Задание дня
                </Button>
              </div>
            </Card>

            <p className="text-xs text-white/40">
              Адрес мини-приложения для настроек бота в MAX: <span className="select-all text-white/70">{MINIAPP}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "text-white" }: { label: string; value: number; tone?: string }) {
  return (
    <Card className="border-white/10 bg-white/[0.04] p-4">
      <p className={`text-2xl font-black ${tone}`}>{value}</p>
      <p className="mt-1 text-xs text-white/50">{label}</p>
    </Card>
  );
}
