import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  useZnaika,
  formatZnaika,
  ZnaikaShopItem,
  ZnaikaRedemption,
} from "@/context/ZnaikaContext";

const TIER_RING: Record<string, string> = {
  common: "border-white/12",
  rare: "border-cyan-400/30",
  epic: "border-purple-400/35",
  legendary: "border-amber-400/40",
};

const KIND_LABEL: Record<string, string> = {
  discount_coupon: "Скидка",
  bonus_days: "Бонус",
  cosmetic: "Профиль",
};

export default function ZnaikaShop() {
  const { fetchShop, redeem } = useZnaika();
  const [items, setItems] = useState<ZnaikaShopItem[]>([]);
  const [inventory, setInventory] = useState<ZnaikaRedemption[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchShop();
    if (data) {
      setItems(data.items);
      setInventory(data.inventory);
      setBalance(data.balance);
    }
    setLoading(false);
  }, [fetchShop]);

  useEffect(() => {
    load();
  }, [load]);

  const ownedCosmetics = new Set(
    inventory.filter((r) => r.kind === "cosmetic").map((r) => r.item_code)
  );

  const handleBuy = async (item: ZnaikaShopItem) => {
    setBusy(item.code);
    const res = await redeem(item.code);
    setBusy(null);
    if (res.ok) {
      if (res.couponCode) {
        setToast({ msg: `Готово! Твой промокод: ${res.couponCode}`, type: "ok" });
      } else {
        setToast({ msg: "Покупка совершена! Загляни в инвентарь.", type: "ok" });
      }
      load();
    } else {
      setToast({ msg: res.message || "Не удалось купить", type: "err" });
    }
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-white/50">
        <Icon name="Loader2" size={22} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl text-sm font-semibold ${
            toast.type === "ok"
              ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-100"
              : "bg-rose-500/15 border-rose-400/40 text-rose-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name={toast.type === "ok" ? "CheckCircle2" : "AlertCircle"} size={16} />
            {toast.msg}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        <Icon name="ShoppingBag" size={20} className="text-amber-300" />
        <h2 className="font-montserrat font-black text-xl text-white">Магазин ЗНАЕК</h2>
      </div>
      <p className="text-white/55 text-sm mb-5">
        Трать накопленные ЗНАЙКИ на скидки к подписке, бонусные дни и украшения профиля.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const owned = item.kind === "cosmetic" && ownedCosmetics.has(item.code);
          const affordable = balance >= item.price;
          return (
            <div
              key={item.code}
              className={`rounded-2xl border ${TIER_RING[item.tier] || "border-white/12"} bg-white/[0.04] p-4 flex flex-col`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/25 to-orange-500/15 flex items-center justify-center">
                  <Icon name={item.icon} size={20} className="text-amber-300" fallback="Gift" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-white/40 bg-white/5 rounded-full px-2 py-0.5">
                  {KIND_LABEL[item.kind] || item.kind}
                </span>
              </div>
              <h3 className="font-montserrat font-bold text-white text-sm mb-1">{item.title}</h3>
              <p className="text-white/55 text-xs leading-relaxed flex-1 mb-3">{item.description}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 font-montserrat font-black text-amber-300">
                  <Icon name="Coins" size={14} />
                  {formatZnaika(item.price)}
                </span>
                {owned ? (
                  <span className="text-emerald-300 text-xs font-bold inline-flex items-center gap-1">
                    <Icon name="Check" size={14} />
                    Куплено
                  </span>
                ) : (
                  <Button
                    size="sm"
                    disabled={!affordable || busy === item.code}
                    onClick={() => handleBuy(item)}
                    className={
                      affordable
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:opacity-90 h-8 font-bold"
                        : "bg-white/8 text-white/40 h-8"
                    }
                  >
                    {busy === item.code ? (
                      <Icon name="Loader2" size={14} className="animate-spin" />
                    ) : affordable ? (
                      "Купить"
                    ) : (
                      "Мало ЗНАЕК"
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Инвентарь — купоны и бонусы */}
      {inventory.some((r) => r.coupon_code) && (
        <div className="mt-6">
          <h3 className="font-montserrat font-bold text-white text-sm mb-3 flex items-center gap-2">
            <Icon name="Ticket" size={16} className="text-cyan-300" />
            Мои промокоды
          </h3>
          <div className="space-y-2">
            {inventory
              .filter((r) => r.coupon_code)
              .map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm tracking-wider">
                      {r.coupon_code}
                    </span>
                    <span className="text-white/40 text-xs">
                      {typeof r.payload?.percent === "number"
                        ? `−${r.payload.percent}% на подписку`
                        : typeof r.payload?.days === "number"
                        ? `+${r.payload.days} дней`
                        : ""}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      r.status === "active" ? "text-emerald-300" : "text-white/40"
                    }`}
                  >
                    {r.status === "active" ? "Активен" : "Использован"}
                  </span>
                </div>
              ))}
          </div>
          <p className="text-white/40 text-xs mt-3">
            Назови промокод в поддержке при оплате — применим скидку к подписке.
          </p>
        </div>
      )}
    </div>
  );
}
