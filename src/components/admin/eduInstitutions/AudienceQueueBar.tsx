import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { KidsOverview, kidsOverview, kidsSettings } from "./api";

export type AudienceTab = "" | "school" | "kindergarten" | "care";

export const AUDIENCE_TABS: { id: AudienceTab; label: string; icon: string }[] = [
  { id: "", label: "Все", icon: "Database" },
  { id: "school", label: "Школы", icon: "School" },
  { id: "kindergarten", label: "Детские сады", icon: "Baby" },
  { id: "care", label: "Детские дома и интернаты", icon: "HeartHandshake" },
];

export const AUDIENCE_LABEL: Record<string, string> = {
  school: "Школа",
  kindergarten: "Детский сад",
  care: "Детский дом / интернат",
};

interface Props {
  tab: AudienceTab;
  onTab: (t: AudienceTab) => void;
  counts: Record<string, { total: number; with_email: number; mailed: number }>;
}

/** Вкладки по типу учреждения и очередь писем для детских садов и детских домов. */
export default function AudienceQueueBar({ tab, onTab, counts }: Props) {
  const [kids, setKids] = useState<KidsOverview | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await kidsOverview();
    if (r.ok) setKids(r.data!);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async () => {
    if (!kids) return;
    setBusy(true);
    const r = await kidsSettings(!kids.enabled);
    setBusy(false);
    setMsg(r.ok
      ? r.data!.enabled
        ? "Детские сады и детские дома поставлены в очередь. Письма уходят автоматически вместе со школами — в пределах дневного лимита почты."
        : "Очередь садов и детских домов на паузе."
      : r.error || "Ошибка");
    load();
  };

  const total = (id: AudienceTab) =>
    id === "" ? Object.values(counts).reduce((a, c) => a + c.total, 0) : counts[id]?.total || 0;

  const kidsQueue = kids ? kids.kindergarten.pending + kids.care.pending : 0;
  const kidsToEnrich = kids ? kids.kindergarten.to_enrich + kids.care.to_enrich : 0;

  return (
    <div className="mb-5">
      <div className="flex gap-2 flex-wrap mb-3">
        {AUDIENCE_TABS.map((t) => (
          <button
            key={t.id || "all"}
            onClick={() => onTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              tab === t.id ? "bg-violet-500/25 border-violet-400/50 text-white" : "bg-white/[0.04] border-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Icon name={t.icon} size={15} /> {t.label}
            <span className="text-xs text-white/50">{total(t.id)}</span>
          </button>
        ))}
      </div>

      {kids && (
        <div className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
          kids.enabled ? "border-emerald-400/30 bg-emerald-500/[0.07]" : "border-pink-400/30 bg-pink-500/[0.07]"
        }`}>
          <div className="min-w-0">
            <p className="font-bold flex items-center gap-2">
              <Icon name={kids.enabled ? "CheckCircle2" : "Clock"} size={17} className={kids.enabled ? "text-emerald-300" : "text-pink-300"} />
              Очередь писем: детские сады и детские дома {kids.enabled ? "— отправляются" : "— не запущена"}
            </p>
            <p className="text-white/60 text-sm mt-1">
              В очереди {kidsQueue} писем (сады — {kids.kindergarten.pending}, детские дома — {kids.care.pending}).
              Отправлено: {kids.kindergarten.sent + kids.care.sent}.
              {kidsToEnrich > 0 && <> Ещё у {kidsToEnrich} учреждений ищем почту — найденные встают в очередь сами.</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/pilot-outreach" className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1">
              <Icon name="Settings" size={14} /> Письма и лимиты
            </Link>
            <Button
              onClick={toggle}
              disabled={busy}
              className={kids.enabled ? "bg-white/10 hover:bg-white/15" : "bg-pink-600 hover:bg-pink-700"}
            >
              {busy ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name={kids.enabled ? "Pause" : "Send"} size={16} />}
              <span className="ml-1.5">{kids.enabled ? "Поставить на паузу" : "Поставить в очередь на отправку"}</span>
            </Button>
          </div>
        </div>
      )}
      {msg && <p className="text-sm text-white/75 mt-2">{msg}</p>}
    </div>
  );
}
