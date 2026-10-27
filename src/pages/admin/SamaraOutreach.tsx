import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "@/lib/helmet";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EduInstitution,
  OutreachStatus,
  listInstitutions,
  outreachPreview,
  outreachSend,
  outreachStatus,
  outreachTest,
} from "@/components/admin/eduInstitutions/api";

const PIN_KEY = "uchispro_admin_pin_v1";
const SEGMENT: Record<string, string> = { school: "Школа", special_school: "Спец./интернат", private_school: "Частная" };

export default function SamaraOutreach() {
  const [pin, setPin] = useState(() => sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "");
  const [pinInput, setPinInput] = useState("");
  const [st, setSt] = useState<OutreachStatus | null>(null);
  const [items, setItems] = useState<EduInstitution[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [batch, setBatch] = useState(10);
  const [autoRun, setAutoRun] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, l] = await Promise.all([outreachStatus(), listInstitutions({ city: "Самара", q })]);
    if (!s.ok) {
      if (s.error === "Нет доступа") {
        sessionStorage.removeItem(PIN_KEY);
        localStorage.removeItem(PIN_KEY);
        setPin("");
        setPinError("Неверный PIN. Введите PIN администратора ещё раз.");
        return;
      }
      setError(s.error || "Ошибка");
      return;
    }
    setError(null);
    setSt(s.data!);
    if (l.ok) setItems(l.data!.items);
    setTestEmail((t) => t || s.data!.sender || "");
  }, [q]);

  useEffect(() => {
    if (pin) load();
  }, [pin, load]);

  const sendBatch = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    const r = await outreachSend(batch);
    setBusy(false);
    if (!r.ok) {
      setMsg(`Ошибка: ${r.error}`);
      setAutoRun(false);
      return false;
    }
    const d = r.data!;
    setMsg(`Отправлено: ${d.sent}${d.failed ? `, не доставлено: ${d.failed}` : ""}. Осталось: ${d.left}.`);
    await load();
    if (d.done || d.failed > 0 || d.sent === 0) {
      setAutoRun(false);
      return false;
    }
    return true;
  }, [batch, load]);

  useEffect(() => {
    if (!autoRun || busy) return;
    const t = setTimeout(async () => {
      await sendBatch();
    }, 120000);
    return () => clearTimeout(t);
  }, [autoRun, busy, sendBatch, st?.pending]);

  if (!pin) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-6 font-golos">
        <Card className="p-6 bg-white/[0.04] border-white/10 w-full max-w-sm">
          <p className="text-white font-bold mb-3">Введите PIN администратора</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = pinInput.trim();
              if (!v) return;
              setPinError(null);
              sessionStorage.setItem(PIN_KEY, v);
              setPin(v);
            }}
          >
            <Input type="password" autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="mb-3" />
            {pinError && <p className="text-rose-300 text-sm mb-3">{pinError}</p>}
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const sent = st?.sends.filter((s) => !s.is_test && s.status === "sent").reduce((a, b) => a + b.count, 0) || 0;
  const failed = st?.sends.filter((s) => !s.is_test && s.status === "failed").reduce((a, b) => a + b.count, 0) || 0;
  const testsOk = st?.sends.some((s) => s.is_test && s.status === "sent");

  return (
    <div className="min-h-screen bg-mesh text-white font-golos">
      <Helmet>
        <title>Рассылка директорам школ Самары — Админка</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <Link to="/admin" className="text-white/50 text-sm hover:text-white inline-flex items-center gap-1">
              <Icon name="ArrowLeft" size={14} /> Админка
            </Link>
            <h1 className="font-montserrat font-black text-2xl md:text-3xl mt-1">Пилот Самары: рассылка директорам</h1>
            <p className="text-white/55 text-sm">База — официальный реестр школ Самарского управления Минобрнауки (РЦМО). Промокод в письме: САМАРА.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/edu-institutions"><Button variant="outline" className="border-white/15 bg-white/5 text-white">Вся база</Button></Link>
            <Link to="/for-schools/presentation" target="_blank"><Button variant="outline" className="border-white/15 bg-white/5 text-white">Презентация</Button></Link>
          </div>
        </div>

        {error && <Card className="p-4 mb-4 bg-rose-500/10 border-rose-400/30 text-rose-100 text-sm">{error}</Card>}

        {st && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              <Stat label="Школ в базе" value={st.total} />
              <Stat label="С почтой" value={st.with_email} />
              <Stat label="Отправлено" value={sent} tone="text-emerald-300" />
              <Stat label="Осталось" value={st.pending} tone="text-cyan-300" />
              <Stat label="Отписались / ошибки" value={`${st.unsubscribed} / ${failed}`} />
            </div>

            <Card className={`p-4 mb-5 border ${st.smtp_configured ? "bg-emerald-500/[0.07] border-emerald-400/25" : "bg-rose-500/10 border-rose-400/30"}`}>
              <div className="flex items-center gap-2 text-sm">
                <Icon name={st.smtp_configured ? "MailCheck" : "MailX"} size={18} className={st.smtp_configured ? "text-emerald-300" : "text-rose-300"} />
                {st.smtp_configured ? (
                  <span>Почта подключена. Письма уходят с адреса <b>{st.sender}</b>, ответы директоров придут туда же.</span>
                ) : (
                  <span>Почта не подключена — заполните секреты SMTP_USER и SMTP_PASSWORD.</span>
                )}
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="p-5 bg-white/[0.04] border-white/10">
                <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-2">Шаг 1 · Письмо</p>
                <p className="text-sm text-white/80 mb-3">Тема: «{st.subject}»</p>
                <Button
                  variant="outline"
                  className="w-full border-white/15 bg-white/5 text-white"
                  onClick={async () => {
                    const r = await outreachPreview();
                    if (r.ok) setPreview(r.data!.html);
                  }}
                >
                  <Icon name="Eye" size={16} className="mr-2" /> Посмотреть письмо
                </Button>
              </Card>
              <Card className="p-5 bg-white/[0.04] border-white/10">
                <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-2">Шаг 2 · Тест себе</p>
                <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="ваш@email" className="mb-2" />
                <Button
                  variant="outline"
                  disabled={busy || !testEmail}
                  className="w-full border-white/15 bg-white/5 text-white"
                  onClick={async () => {
                    setBusy(true);
                    const r = await outreachTest(testEmail);
                    setBusy(false);
                    setMsg(r.ok && r.data!.ok ? `Тест отправлен на ${testEmail}. Проверьте папки «Входящие» и «Спам».` : `Тест не ушёл: ${r.error || r.data?.error}`);
                    load();
                  }}
                >
                  <Icon name="Send" size={16} className="mr-2" /> Отправить тест
                </Button>
                {testsOk && <p className="text-emerald-300 text-xs mt-2">Тестовое письмо уже уходило успешно</p>}
              </Card>
              <Card className="p-5 bg-white/[0.04] border-violet-400/30">
                <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-2">Шаг 3 · Рассылка партиями</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-white/70">Писем в партии</span>
                  <Input
                    type="number"
                    min={1}
                    max={st.batch_max}
                    value={batch}
                    onChange={(e) => setBatch(Math.max(1, Math.min(st.batch_max, Number(e.target.value) || 1)))}
                    className="w-20"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={busy || !st.smtp_configured || st.pending === 0}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                    onClick={() => {
                      if (window.confirm(`Отправить письмо ${Math.min(batch, st.pending)} школам?`)) sendBatch();
                    }}
                  >
                    {busy ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Отправить партию"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!st.smtp_configured || st.pending === 0}
                    className="border-white/15 bg-white/5 text-white"
                    onClick={() => {
                      if (autoRun) setAutoRun(false);
                      else if (window.confirm(`Запустить авторассылку: по ${batch} писем каждые 2 минуты, пока страница открыта. Всего осталось ${st.pending}. Продолжить?`)) {
                        setAutoRun(true);
                        sendBatch();
                      }
                    }}
                  >
                    {autoRun ? "Стоп" : "Авто"}
                  </Button>
                </div>
                <p className="text-white/45 text-xs mt-2">Каждой школе письмо уходит один раз. Отписавшимся не отправляется.</p>
              </Card>
            </div>

            {msg && <Card className="p-3 mb-5 bg-white/[0.06] border-white/10 text-sm">{msg}</Card>}

            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
              <Card className="p-4 bg-white/[0.03] border-white/10">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <p className="font-bold">Школы Самары · {items.length}</p>
                  <Input placeholder="Поиск: номер, директор, улица" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
                </div>
                <div className="max-h-[560px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {items.map((r) => (
                        <tr key={r.id} className="border-t border-white/5 align-top">
                          <td className="py-2 pr-2">
                            <p className="text-white">{r.org_name}</p>
                            <p className="text-white/45 text-xs">{r.contact_name} · {r.address}</p>
                          </td>
                          <td className="py-2 pr-2 text-xs text-white/60 whitespace-nowrap">{SEGMENT[r.segment || ""] || ""}</td>
                          <td className="py-2 text-xs whitespace-nowrap">
                            {r.unsubscribed ? (
                              <span className="text-rose-300">Отписалась</span>
                            ) : r.last_mailed_at ? (
                              <span className="text-emerald-300">Отправлено {new Date(r.last_mailed_at).toLocaleDateString("ru-RU")}</span>
                            ) : r.email ? (
                              <span className="text-white/45">{r.email}</span>
                            ) : (
                              <span className="text-amber-300">Нет почты</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card className="p-4 bg-white/[0.03] border-white/10">
                <p className="font-bold mb-3">Журнал отправок</p>
                {st.last.length === 0 && <p className="text-white/45 text-sm">Пока ничего не отправлялось.</p>}
                <div className="space-y-2 max-h-[560px] overflow-y-auto">
                  {st.last.map((l, i) => (
                    <div key={i} className="text-xs border-b border-white/5 pb-2">
                      <div className="flex justify-between gap-2">
                        <span className={l.status === "sent" ? "text-emerald-300" : "text-rose-300"}>
                          {l.status === "sent" ? "Доставлено на сервер" : "Ошибка"} {l.is_test && "· тест"}
                        </span>
                        <span className="text-white/40">{new Date(l.at).toLocaleString("ru-RU")}</span>
                      </div>
                      <p className="text-white/75">{l.org || l.to}</p>
                      {l.error && <p className="text-rose-200/80">{l.error}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <span className="text-sm text-gray-700 font-bold">Так письмо увидит директор</span>
              <button onClick={() => setPreview(null)} className="text-gray-500 hover:text-gray-900"><Icon name="X" size={18} /></button>
            </div>
            <iframe title="preview" srcDoc={preview} className="w-full h-full" sandbox="" />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "text-white" }: { label: string; value: number | string; tone?: string }) {
  return (
    <Card className="p-4 bg-white/[0.04] border-white/10">
      <p className="text-white/50 text-xs">{label}</p>
      <p className={`font-montserrat font-black text-2xl ${tone}`}>{value}</p>
    </Card>
  );
}
