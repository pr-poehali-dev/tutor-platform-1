import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import func2url from "../../../../backend/func2url.json";

const REF_URL = (func2url as Record<string, string>)["referrals"];

interface RefStats {
  active: boolean;
  start_date: string;
  invite_znaika: number;
  invite_count: number;
  purchase_znaika: number;
  purchase_count: number;
  total_znaika: number;
  reward_invite: number;
  reward_purchase: number;
}

export default function ReferralPromoStats() {
  const [stats, setStats] = useState<RefStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!REF_URL) return;
    setLoading(true);
    fetch(`${REF_URL}?action=referral_promo_stats`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const fmt = (n?: number) => (n ?? 0).toLocaleString("ru-RU");

  return (
    <Card className="border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.07] to-purple-500/[0.04] p-5 mb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-montserrat text-base font-bold text-white flex items-center gap-2">
          <span className="text-xl">🎁</span> Акция «Приведи друга» · ЗНАЙКИ
        </h2>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-white/55 hover:text-white">
          <Icon name="RefreshCw" size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {stats?.active ? (
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Акция активна
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/60 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Стартует {stats?.start_date}
          </span>
        )}
      </div>

      {/* Главная цифра */}
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/[0.06] p-4 mb-3">
        <div className="text-white/55 text-xs mb-1">Всего начислено ЗНАЕК по акции</div>
        <div className="font-montserrat font-black text-3xl text-amber-300">{fmt(stats?.total_znaika)}</div>
        <div className="text-white/40 text-[11px] mt-1">1 ЗНАЙКА = 1 ₽ · можно оплатить до 30% курса</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-white/55 text-xs flex items-center gap-1.5 mb-1">
            <Icon name="UserPlus" size={14} className="text-purple-300" /> За приглашения
          </div>
          <div className="font-montserrat font-black text-2xl text-purple-300">{fmt(stats?.invite_znaika)}</div>
          <div className="text-white/40 text-[11px] mt-0.5">
            {fmt(stats?.invite_count)} друзей · по +{fmt(stats?.reward_invite)} знаек
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-white/55 text-xs flex items-center gap-1.5 mb-1">
            <Icon name="ShoppingCart" size={14} className="text-emerald-300" /> За покупки друзей
          </div>
          <div className="font-montserrat font-black text-2xl text-emerald-300">{fmt(stats?.purchase_znaika)}</div>
          <div className="text-white/40 text-[11px] mt-0.5">
            {fmt(stats?.purchase_count)} покупок · по +{fmt(stats?.reward_purchase)} знаек
          </div>
        </div>
      </div>

      {!loading && stats && stats.total_znaika === 0 && (
        <div className="text-white/40 text-sm text-center py-4 mt-1">
          Пока знайки по акции не начислялись. Поделись постом про реферальную программу.
        </div>
      )}
    </Card>
  );
}
