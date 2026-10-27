import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "@/lib/helmet";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PilotOverview,
  pilotOverview,
  pilotPreview,
  pilotSend,
  pilotSettings,
  pilotTest,
} from "@/components/admin/eduInstitutions/api";
import { findPilotCity } from "@/data/pilotCities";
import KidsPilotPanel from "@/components/admin/eduInstitutions/KidsPilotPanel";

const PIN_KEY = "uchispro_admin_pin_v1";

function Stat({ label, value, tone = "text-white" }: { label: string; value: number | string; tone?: string }) {
  return (
    <Card className="p-4 bg-white/[0.04] border-white/10">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className={`font-montserrat font-black text-2xl ${tone}`}>{value}</p>
    </Card>
  );
}

/** Пилот по городам: статистика, письмо, тест, ручная отправка и авторассылка с дневным лимитом. */
export default function PilotOutreach() {
  const [pin, setPin] = useState(() => sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [data, setData] = useState<PilotOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState("200");

  const load = useCallback(async () => {
    const r = await pilotOverview();
    if (!r.ok) {
      if (r.error === "Нет доступа") {
        sessionStorage.removeItem(PIN_KEY);
        localStorage.removeItem(PIN_KEY);
        setPin("");
        setPinError("Неверный PIN. Введите PIN администратора ещё раз.");
        return;
      }
      setError(r.error || "Ошибка");
      return;
    }
    setError(null);
    setData(r.data!);
    setLimitInput(String(r.data!.auto.daily_limit));
    setTestEmail((t) => t || r.data!.sender || "");
    setCity((c) => c || r.data!.cities.find((x) => x.pending > 0)?.slug || r.data!.cities[0]?.slug || "");
  }, []);

  useEffect(() => {
    if (pin) load();
  }, [pin, load]);

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
            <Button type="submit" className="w-full">Войти</Button>
          </form>
        </Card>
      </div>
    );
  }

  const cur = data?.cities.find((c) => c.slug === city);
  // Регион пользуется страницей, листовкой и презентацией своего областного центра.
  const pc = findPilotCity(cur?.page_slug || city);
  const totals = data?.cities.reduce(
    (a, c) => ({ schools: a.schools + c.total, pending: a.pending + c.pending, sent: a.sent + c.sent, act: a.act + c.activations }),
    { schools: 0, pending: 0, sent: 0, act: 0 },
  );
  const leftToday = data ? Math.max(0, data.effective_limit - data.sent_today) : 0;
  const daysLeft = data && totals ? Math.ceil(totals.pending / Math.max(1, data.effective_limit)) : 0;
  const tickAgoMin = data?.auto.last_tick_at ? Math.round((Date.now() - new Date(data.auto.last_tick_at).getTime()) / 60000) : null;
  const schedulerOk = tickAgoMin !== null && tickAgoMin <= 15;

  const toggleAuto = async () => {
    if (!data) return;
    const next = !data.auto.enabled;
    if (next && !window.confirm(`Включить авторассылку? Письма будут уходить сами круглосуточно, равномерно — не больше ${data.effective_limit} за 24 часа, по городам по очереди. Всего осталось ${totals?.pending}.`)) return;
    const r = await pilotSettings({ enabled: next });
    if (r.ok) load();
  };

  const saveLimit = async () => {
    const r = await pilotSettings({ daily_limit: Number(limitInput) || 250 });
    if (r.ok) {
      setMsg(`Лимит: ${r.data!.daily_limit} писем за 24 часа (у Яндекса — 300, запас оставлен для писем сайта)`);
      load();
    }
  };

  return (
    <div className="min-h-screen bg-mesh text-white font-golos">
      <Helmet>
        <title>Пилот по городам: рассылка директорам — Админка</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <Link to="/admin" className="text-white/50 text-sm hover:text-white inline-flex items-center gap-1">
              <Icon name="ArrowLeft" size={14} /> Админка
            </Link>
            <h1 className="font-montserrat font-black text-2xl md:text-3xl mt-1">Пилот по городам: рассылка директорам</h1>
            <p className="text-white/55 text-sm">База — реестр аккредитации Рособрнадзора и реестр РЦМО (Самара). Промокод в письме — название города.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/edu-institutions"><Button variant="outline" className="border-white/15 bg-white/5 text-white">Вся база</Button></Link>
            <Link to="/pilot" target="_blank"><Button variant="outline" className="border-white/15 bg-white/5 text-white">Страница городов</Button></Link>
          </div>
        </div>

        {error && <Card className="p-4 mb-4 bg-rose-500/10 border-rose-400/30 text-rose-100 text-sm">{error}</Card>}
        {!data && !error && <p className="text-white/50">Загружаю…</p>}

        {data && totals && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Stat label={`Школ в базе`} value={totals.schools} />
              <Stat label="Отправлено писем" value={totals.sent} tone="text-emerald-300" />
              <Stat label="Осталось отправить" value={totals.pending} tone="text-cyan-300" />
              <Stat label="Активаций промокодов" value={totals.act} tone="text-amber-300" />
            </div>

            <Card className={`p-5 mb-5 border ${data.auto.enabled ? "bg-emerald-500/[0.07] border-emerald-400/30" : "bg-white/[0.04] border-white/10"}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold flex items-center gap-2">
                    <Icon name={data.auto.enabled ? "PlayCircle" : "PauseCircle"} size={18} className={data.auto.enabled ? "text-emerald-300" : "text-white/50"} />
                    Авторассылка {data.auto.enabled ? "включена" : "выключена"}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    Круглосуточно, без выходных: по 4 письма раз в {data.interval_min} мин., города по очереди. За последние 24 часа ушло {data.sent_today} из {data.effective_limit}
                    {data.auto.enabled && totals.pending > 0 && <> · вся база — примерно за {daysLeft} дн.</>}
                  </p>
                  {data.effective_limit < data.auto.daily_limit && (
                    <p className="text-amber-300 text-sm mt-1">После отказа Яндекса лимит на сутки снижен вдвое — до {data.effective_limit}, чтобы восстановилась репутация ящика.</p>
                  )}
                  {data.auto.enabled && (
                    <p className={`text-sm mt-1 ${schedulerOk ? "text-white/50" : "text-amber-300"}`}>
                      {schedulerOk
                        ? `Планировщик работает: последняя проверка ${tickAgoMin} мин. назад.`
                        : tickAgoMin === null
                          ? "Планировщик ещё не запускался — письма пойдут после публикации сайта."
                          : `Планировщик не отвечал ${tickAgoMin} мин. — письма уходят только при посещениях сайта.`}
                    </p>
                  )}
                  {!data.smtp_configured && <p className="text-rose-300 text-sm mt-1">Почта не подключена — заполните секреты SMTP_USER и SMTP_PASSWORD.</p>}
                  {data.cooldown_min > 0 && (
                    <p className="text-amber-300 text-sm mt-1">
                      Яндекс ограничил отправку — пауза ещё {data.cooldown_min} мин., потом продолжится сама.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">Лимит за 24 ч</span>
                  <Input value={limitInput} onChange={(e) => setLimitInput(e.target.value.replace(/\D/g, ""))} className="w-20" />
                  <Button variant="outline" className="border-white/15 bg-white/5 text-white" onClick={saveLimit}>Сохранить</Button>
                  <Button
                    disabled={!data.smtp_configured}
                    onClick={toggleAuto}
                    className={data.auto.enabled ? "bg-white/10 text-white hover:bg-white/20" : "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"}
                  >
                    {data.auto.enabled ? "Выключить" : "Включить"}
                  </Button>
                </div>
              </div>
              <p className="text-white/40 text-xs mt-3">
                Единственное ограничение — правила Яндекса: не больше 300 писем за 24 часа через почтовую программу, иначе отправка блокируется на сутки. Рассылке отдано до 270, остальное — письмам сайта. Письма идут маленькими партиями круглые сутки, с паузой между письмами. Если Яндекс заподозрит спам — пауза 1 час, при повторе за сутки 6 часов, затем 24 часа, а лимит на сутки снижается вдвое. Школа, письмо которой не прошло 3 раза, убирается из очереди.
              </p>
            </Card>

            {data.joined && (
              <Card className="p-5 mb-5 bg-emerald-500/[0.06] border-emerald-400/30">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold flex items-center gap-2">
                      <Icon name="School" size={18} className="text-emerald-300" /> Школы подключились сами
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      {data.joined.schools} школ (+{data.joined.week} за неделю) · {data.joined.students} учеников пришли по ссылкам школ. Форма:{" "}
                      <a href="/podklyuchit-shkolu" target="_blank" rel="noreferrer" className="text-emerald-200 underline">/podklyuchit-shkolu</a>
                    </p>
                  </div>
                  {data.reminder && (
                    <div className="text-right">
                      <p className="text-sm">
                        Напоминание «Подключить за 1 минуту»: отправлено <b>{data.reminder.sent}</b>, в очереди <b>{data.reminder.pending}</b>
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1 border-white/15 bg-white/5 text-white"
                        onClick={async () => {
                          const r = await pilotSettings({ reminder_enabled: !data.reminder!.enabled });
                          if (r.ok) load();
                        }}
                      >
                        {data.reminder.enabled ? "Выключить напоминание" : "Включить напоминание"}
                      </Button>
                    </div>
                  )}
                </div>
                {data.joined.list.length === 0 ? (
                  <p className="text-sm text-white/50">Пока нет. Как только школа заполнит форму, она появится здесь и придёт уведомление в MAX.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-white/50 text-xs">
                          <th className="p-2">Школа</th>
                          <th className="p-2">Город</th>
                          <th className="p-2">Контакт</th>
                          <th className="p-2">Откуда</th>
                          <th className="p-2 text-right">Учеников</th>
                          <th className="p-2">Дата</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.joined.list.map((j) => (
                          <tr key={j.code} className="border-t border-white/5">
                            <td className="p-2 font-bold">
                              <a href={`/s/${j.code}`} target="_blank" rel="noreferrer" className="hover:underline">{j.school}</a>
                            </td>
                            <td className="p-2 text-white/70">{j.city}</td>
                            <td className="p-2 text-white/70">{j.contact}, {j.reach}</td>
                            <td className="p-2 text-white/50 text-xs">{j.source || "сайт"}</td>
                            <td className="p-2 text-right text-emerald-300 font-bold">{j.students}</td>
                            <td className="p-2 text-white/50 text-xs">{new Date(j.at).toLocaleDateString("ru-RU")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            <Card className="p-0 mb-5 bg-white/[0.03] border-white/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/50 text-xs">
                    <th className="p-3">Город</th>
                    <th className="p-3">Промокод</th>
                    <th className="p-3 text-right">Школ</th>
                    <th className="p-3 text-right">С почтой</th>
                    <th className="p-3 text-right">Отправлено</th>
                    <th className="p-3 text-right">Осталось</th>
                    <th className="p-3 text-right">Ошибки / отписки</th>
                    <th className="p-3 text-right">Активаций</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cities.map((c) => (
                    <tr
                      key={c.slug}
                      onClick={() => setCity(c.slug)}
                      className={`border-t border-white/5 cursor-pointer ${c.slug === city ? "bg-violet-500/15" : "hover:bg-white/[0.04]"}`}
                    >
                      <td className="p-3 font-bold">{c.name}</td>
                      <td className="p-3 font-mono text-xs text-white/70">{c.promo_code}</td>
                      <td className="p-3 text-right">{c.total}</td>
                      <td className="p-3 text-right">{c.with_email}</td>
                      <td className="p-3 text-right text-emerald-300">{c.sent}</td>
                      <td className="p-3 text-right text-cyan-300">{c.pending}</td>
                      <td className="p-3 text-right text-white/60">{c.failed} / {c.unsubscribed}</td>
                      <td className="p-3 text-right text-amber-300">{c.activations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {cur && (
              <div className="grid md:grid-cols-3 gap-4 mb-5">
                <Card className="p-5 bg-white/[0.04] border-white/10">
                  <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-2">{cur.name} · Письмо</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full border-white/15 bg-white/5 text-white"
                      onClick={async () => {
                        const r = await pilotPreview(cur.slug);
                        if (r.ok) setPreview(r.data!.html);
                        else setMsg(`Ошибка: ${r.error}`);
                      }}
                    >
                      <Icon name="Eye" size={16} className="mr-2" /> Посмотреть письмо
                    </Button>
                    {pc && (
                      <div className="flex gap-2">
                        <a href={pc.path} target="_blank" rel="noreferrer" className="flex-1">
                          <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white text-xs px-2">Страница</Button>
                        </a>
                        <a href={`${pc.path}/leaflet`} target="_blank" rel="noreferrer" className="flex-1">
                          <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white text-xs px-2">Листовка</Button>
                        </a>
                        <a href={pc.slug === "samara" ? "/for-schools/presentation" : `/for-schools/presentation/${pc.slug}`} target="_blank" rel="noreferrer" className="flex-1">
                          <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white text-xs px-2">Презентация</Button>
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
                <Card className="p-5 bg-white/[0.04] border-white/10">
                  <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-2">Тест себе</p>
                  <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="ваш@email" className="mb-2" />
                  <Button
                    variant="outline"
                    disabled={busy || !testEmail}
                    className="w-full border-white/15 bg-white/5 text-white"
                    onClick={async () => {
                      setBusy(true);
                      const r = await pilotTest(cur.slug, testEmail);
                      setBusy(false);
                      setMsg(r.ok && r.data!.ok ? `Тест (${cur.name}) отправлен на ${testEmail}. Проверьте «Входящие» и «Спам».` : `Тест не ушёл: ${r.error || r.data?.error}`);
                      load();
                    }}
                  >
                    <Icon name="Send" size={16} className="mr-2" /> Отправить тест
                  </Button>
                </Card>
                <Card className="p-5 bg-white/[0.04] border-violet-400/30">
                  <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-2">Отправить вручную</p>
                  <p className="text-sm text-white/70 mb-3">Партия {Math.min(data.batch_max, cur.pending, leftToday)} писем школам: {cur.name}. За 24 часа можно ещё {leftToday}.</p>
                  <Button
                    disabled={busy || !data.smtp_configured || cur.pending === 0 || leftToday === 0 || data.cooldown_min > 0}
                    className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                    onClick={async () => {
                      const n = Math.min(data.batch_max, cur.pending, leftToday);
                      if (!window.confirm(`Отправить письмо ${n} школам (${cur.name})?`)) return;
                      setBusy(true);
                      setMsg(null);
                      const r = await pilotSend(cur.slug, n);
                      setBusy(false);
                      setMsg(r.ok ? `${cur.name}: отправлено ${r.data!.sent}, ошибок ${r.data!.failed}, осталось ${r.data!.left}.${r.data!.errors?.length ? " Первая ошибка: " + r.data!.errors[0].error : ""}` : `Ошибка: ${r.error}`);
                      load();
                    }}
                  >
                    {busy ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Отправить партию"}
                  </Button>
                </Card>
              </div>
            )}

            {msg && <Card className="p-3 mb-5 bg-white/[0.06] border-white/10 text-sm">{msg}</Card>}

            <KidsPilotPanel defaultEmail={data.sender || ""} onPreview={setPreview} />

            <Card className="p-4 bg-white/[0.03] border-white/10">
              <p className="font-bold mb-3">Журнал отправок</p>
              {data.last.length === 0 && <p className="text-white/45 text-sm">Пока ничего не отправлялось.</p>}
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 max-h-[420px] overflow-y-auto">
                {data.last.map((l, i) => (
                  <div key={i} className="text-xs border-b border-white/5 pb-2">
                    <div className="flex justify-between gap-2">
                      <span className={l.status === "sent" ? "text-emerald-300" : "text-rose-300"}>
                        {l.status === "sent" ? "Отправлено" : "Ошибка"} {l.is_test && "· тест"} {l.city && `· ${l.city}`}
                      </span>
                      <span className="text-white/40">{new Date(l.at).toLocaleString("ru-RU")}</span>
                    </div>
                    <p className="text-white/75">{l.org || l.to}</p>
                    {l.error && <p className="text-rose-200/80">{l.error}</p>}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <span className="text-sm text-gray-700 font-bold">Так письмо увидит руководитель</span>
              <button onClick={() => setPreview(null)} className="text-gray-500 hover:text-gray-900"><Icon name="X" size={18} /></button>
            </div>
            <iframe title="preview" srcDoc={preview} className="w-full h-full" sandbox="" />
          </div>
        </div>
      )}
    </div>
  );
}
