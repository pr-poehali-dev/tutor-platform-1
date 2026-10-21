import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  KidsAudience,
  KidsOverview,
  kidsEnrich,
  kidsImport,
  kidsOverview,
  kidsPreview,
  kidsSettings,
  kidsTest,
} from "./api";

const TITLES: Record<KidsAudience, { title: string; icon: string; deck: string; page: string; promo: string }> = {
  kindergarten: { title: "Детские сады", icon: "Baby", deck: "/for-kindergartens/presentation", page: "/malysh", promo: "МАЛЫШ · до 31.05.2027" },
  care: { title: "Детские дома и интернаты", icon: "HeartHandshake", deck: "/for-kindergartens/presentation/care", page: "/kazhdyj-rebenok", promo: "КАЖДЫЙ РЕБЁНОК · бессрочно" },
};

/** Пилот «Малыш»: база садов и детских домов, письма, тест и включение авторассылки. */
export default function KidsPilotPanel({ defaultEmail, onPreview }: { defaultEmail: string; onPreview: (html: string) => void }) {
  const [data, setData] = useState<KidsOverview | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState(defaultEmail);

  const load = useCallback(async () => {
    const r = await kidsOverview();
    if (r.ok) setData(r.data!);
    else setMsg(r.error || "Не удалось загрузить данные пилота «Малыш»");
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!testEmail && defaultEmail) setTestEmail(defaultEmail); }, [defaultEmail, testEmail]);

  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    setMsg(null);
    try {
      setMsg(await fn());
    } finally {
      setBusy(false);
      load();
    }
  };

  const total = data ? data.kindergarten.total + data.care.total : 0;

  return (
    <Card className="p-5 mb-6 bg-gradient-to-br from-pink-500/10 to-amber-500/5 border-pink-400/25">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-montserrat font-black text-xl flex items-center gap-2">
            <Icon name="Baby" size={20} className="text-pink-300" /> Пилот «Малыш»: сады и детские дома
          </p>
          <p className="text-white/55 text-sm mt-1">
            Письма уходят в общем дневном лимите почты вместе со школами — половина каждой партии. Детские дома — первыми.
          </p>
        </div>
        {data && (
          <Button
            disabled={busy || total === 0}
            onClick={() => run(async () => {
              const r = await kidsSettings(!data.enabled);
              return r.ok ? (r.data!.enabled ? "Авторассылка «Малыша» включена" : "Авторассылка «Малыша» выключена") : r.error || "Ошибка";
            })}
            className={data.enabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-pink-600 hover:bg-pink-700"}
          >
            <Icon name={data.enabled ? "Pause" : "Play"} size={16} />
            {data.enabled ? "Авторассылка включена" : "Включить авторассылку"}
          </Button>
        )}
      </div>

      {data && total === 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-amber-100">
            База ещё не загружена: в реестре {data.registry_rows} учреждений (детские сады 11 городов, детские дома и интернаты 11 регионов).
          </p>
          <Button
            disabled={busy}
            onClick={() => run(async () => {
              const r = await kidsImport();
              return r.ok ? `Загружено: ${r.data!.inserted} новых, обновлено ${r.data!.updated}` : r.error || "Ошибка";
            })}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {busy ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Download" size={16} />} Загрузить базу
          </Button>
        </div>
      )}

      {data && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {(["kindergarten", "care"] as KidsAudience[]).map((aud) => {
            const s = data[aud];
            const t = TITLES[aud];
            return (
              <div key={aud} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="font-bold flex items-center gap-2"><Icon name={t.icon} size={17} className="text-pink-300" />{t.title}</p>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-200 border border-pink-400/25">{t.promo}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  {[
                    ["В базе", s.total, "text-white"],
                    ["С почтой", s.with_email, "text-cyan-300"],
                    ["В очереди", s.pending, "text-amber-300"],
                    ["Отправлено", s.sent, "text-emerald-300"],
                    ["Ошибки", s.failed, "text-rose-300"],
                    ["Активаций", s.activations, "text-pink-300"],
                  ].map(([label, v, tone]) => (
                    <div key={label as string} className="rounded-lg bg-white/[0.04] py-2">
                      <p className={`font-montserrat font-black text-lg ${tone}`}>{v as number}</p>
                      <p className="text-[11px] text-white/45">{label as string}</p>
                    </div>
                  ))}
                </div>
                {s.to_enrich > 0 && (
                  <p className="text-xs text-white/50 mb-3">Почту ещё ищем у {s.to_enrich} учреждений — сайт дособирает её сам, понемногу.</p>
                )}
                <div className="max-h-36 overflow-y-auto text-xs mb-3">
                  {s.cities.map((c) => (
                    <div key={c.city} className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/75">{c.city}</span>
                      <span className="text-white/45">{c.with_email} с почтой из {c.total}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={busy} className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={() => run(async () => {
                      const r = await kidsPreview(aud);
                      if (r.ok) onPreview(r.data!.html);
                      return r.ok ? "" : r.error || "Ошибка";
                    })}>
                    <Icon name="Eye" size={14} /> Письмо
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy || !testEmail} className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={() => run(async () => {
                      const r = await kidsTest(aud, testEmail);
                      return r.ok && r.data!.ok ? `Тестовое письмо отправлено на ${r.data!.to}` : r.data?.error || r.error || "Ошибка";
                    })}>
                    <Icon name="Send" size={14} /> Тест себе
                  </Button>
                  <Link to={t.deck} target="_blank" className="inline-flex items-center gap-1 text-xs text-pink-200 hover:text-white px-2">
                    <Icon name="Presentation" size={14} /> Презентация
                  </Link>
                  <Link to={t.page} target="_blank" className="inline-flex items-center gap-1 text-xs text-pink-200 hover:text-white px-2">
                    <Icon name="Ticket" size={14} /> Активация
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Почта для теста" className="max-w-xs bg-background/60 border-white/15" />
        {data && data.kindergarten.to_enrich + data.care.to_enrich > 0 && (
          <Button size="sm" variant="outline" disabled={busy} className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => run(async () => {
              const r = await kidsEnrich();
              if (!r.ok) return r.error || "Ошибка";
              return r.data!.blocked
                ? `Реестр попросил паузу. Найдено почт: ${r.data!.found} — продолжим позже автоматически`
                : `Проверено ${r.data!.tried}, найдено почт: ${r.data!.found}`;
            })}>
            <Icon name="Search" size={14} /> Дособрать почту сейчас
          </Button>
        )}
        {busy && <Icon name="Loader2" size={16} className="animate-spin text-white/60" />}
      </div>
      {msg && <p className="mt-3 text-sm text-white/80">{msg}</p>}
    </Card>
  );
}
