import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { MonitorStatus, monitorAdmin } from "./api";

const TONE: Record<string, string> = {
  ok: "bg-emerald-400", degraded: "bg-amber-400", fail: "bg-rose-500", unknown: "bg-white/30",
};

/** Состояние сайта: главная страница и все функции, последние проверки и сбои. */
export default function MonitorPanel() {
  const [data, setData] = useState<MonitorStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [all, setAll] = useState(false);

  useEffect(() => {
    monitorAdmin.status().then((r) => r.ok && r.data && setData(r.data));
  }, []);

  const runNow = async () => {
    setBusy(true);
    const r = await monitorAdmin.run();
    setBusy(false);
    if (r.ok && r.data) setData(r.data);
  };

  const items = data?.items || [];
  const bad = items.filter((i) => i.status !== "ok");
  const okCount = items.length - bad.length;
  const ageMin = data?.last_run_at ? Math.round((Date.now() - new Date(data.last_run_at).getTime()) / 60000) : null;
  const stale = ageMin === null || ageMin > 60;
  const shown = all ? items : bad;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Icon name="Activity" size={18} /> Работа сайта
          {data && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${bad.some((b) => b.status === "fail") ? "bg-rose-500/20 text-rose-200" : bad.length ? "bg-amber-400/20 text-amber-200" : "bg-emerald-400/20 text-emerald-200"}`}>
              {bad.some((b) => b.status === "fail") ? "есть сбой" : bad.length ? "есть замечания" : "всё работает"}
            </span>
          )}
        </h2>
        <Button size="sm" variant="outline" onClick={runNow} disabled={busy}>
          {busy ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Play" size={15} />} <span className="ml-1.5">Проверить сейчас</span>
        </Button>
      </div>
      {data && (
        <p className="text-sm text-white/60 mb-3">
          Работают {okCount} из {items.length} частей сайта. Последняя проверка: {ageMin === null ? "ещё не было" : ageMin < 1 ? "только что" : `${ageMin} мин назад`}.
          Проверка идёт автоматически каждые {data.interval_min} минут, пока на сайте есть посетители. О сбое — сообщение в MAX и на почту.
        </p>
      )}
      {stale && data && (
        <p className="text-xs text-amber-200 mb-3">Давно не было проверок — значит, на сайте не было посетителей. Нажмите «Проверить сейчас».</p>
      )}
      <div className="space-y-1.5">
        {shown.map((i) => (
          <div key={i.name} className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${TONE[i.status] || TONE.unknown}`} />
            <span className="flex-1 min-w-0 truncate">{i.label}</span>
            {i.error && <span className="text-xs text-rose-200 truncate max-w-[45%]">{i.error}</span>}
            {i.ms != null && <span className={`text-xs shrink-0 ${i.ms > 2500 ? "text-amber-300" : "text-white/40"}`}>{i.ms} мс</span>}
          </div>
        ))}
        {!all && !bad.length && data && <p className="text-sm text-emerald-200/80">Все проверки прошли успешно.</p>}
      </div>
      {items.length > 0 && (
        <button onClick={() => setAll(!all)} className="mt-3 text-xs text-violet-300 hover:underline">
          {all ? "Показать только проблемы" : `Показать все ${items.length}`}
        </button>
      )}
    </section>
  );
}
