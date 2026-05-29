import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import func2url from "../../../../backend/func2url.json";

const REF_URL = (func2url as Record<string, string>)["referrals"];

interface Stats {
  total_shares: number;
  total_visits: number;
  shares_by_channel: Record<string, number>;
  visits_by_channel: Record<string, number>;
}

const CHANNEL_LABEL: Record<string, string> = {
  vk: "ВКонтакте",
  tg: "Telegram",
  wa: "WhatsApp",
  copy: "Скопировали",
  direct: "Прямые",
};

const CHANNEL_ICON: Record<string, string> = {
  vk: "Share2",
  tg: "Send",
  wa: "MessageCircle",
  copy: "Link",
  direct: "Globe",
};

export default function PromoStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!REF_URL) return;
    setLoading(true);
    fetch(`${REF_URL}?action=promo_stats&promo=dobro`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const channels = ["vk", "tg", "wa", "copy", "direct"];

  return (
    <Card className="border border-rose-400/25 bg-gradient-to-br from-rose-500/[0.06] to-orange-500/[0.04] p-5 mb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-montserrat text-base font-bold text-white flex items-center gap-2">
          <span className="text-xl">❤️</span> Эффективность акции ДОБРО
        </h2>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-white/55 hover:text-white">
          <Icon name="RefreshCw" size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-white/55 text-xs flex items-center gap-1.5 mb-1">
            <Icon name="Share2" size={14} className="text-rose-300" /> Поделились
          </div>
          <div className="font-montserrat font-black text-2xl text-rose-300">{stats?.total_shares ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-white/55 text-xs flex items-center gap-1.5 mb-1">
            <Icon name="MousePointerClick" size={14} className="text-emerald-300" /> Перешли по ссылке
          </div>
          <div className="font-montserrat font-black text-2xl text-emerald-300">{stats?.total_visits ?? "—"}</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1">По каналам (поделились / перешли)</div>
        {channels.map((ch) => {
          const sh = stats?.shares_by_channel?.[ch] || 0;
          const vis = stats?.visits_by_channel?.[ch] || 0;
          if (sh === 0 && vis === 0) return null;
          return (
            <div key={ch} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/[0.025] border border-white/8 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Icon name={CHANNEL_ICON[ch] || "Globe"} size={14} className="text-white/50" />
                {CHANNEL_LABEL[ch] || ch}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-rose-300 font-semibold">{sh} <span className="text-white/35">репост.</span></span>
                <span className="text-emerald-300 font-semibold">{vis} <span className="text-white/35">переход.</span></span>
              </div>
            </div>
          );
        })}
        {!loading && stats && stats.total_shares === 0 && stats.total_visits === 0 && (
          <div className="text-white/40 text-sm text-center py-4">Пока никто не делился акцией. Запусти рассылку по базе.</div>
        )}
      </div>
    </Card>
  );
}
