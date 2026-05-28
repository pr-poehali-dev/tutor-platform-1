import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerDetail, rub, num } from "./types";

interface Props {
  detail: CustomerDetail;
  onClose: () => void;
}

export default function CustomerDetailModal({ detail, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <Card className="border border-white/15 bg-card max-w-2xl w-full my-8 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="text-white/40 text-xs">Клиент #{detail.user.id}</div>
            <h2 className="font-montserrat text-2xl font-bold">{detail.user.name || "Без имени"}</h2>
            <div className="text-white/65 text-sm">{detail.user.email}</div>
            <div className="text-white/45 text-xs">{detail.user.phone || ""}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <MiniStat label="LTV" value={rub(detail.lifetime_value)} accent="text-emerald-300" />
          <MiniStat label="Заказов" value={String(detail.paid_orders)} accent="text-purple-300" />
          <MiniStat label="С нами" value={`${Math.floor((Date.now() - new Date(detail.user.created_at).getTime()) / 86400000)} дн.`} accent="text-cyan-300" />
        </div>

        {detail.znaika && (
          <Card className="border border-amber-400/25 bg-amber-500/[0.06] p-3 mb-5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-amber-200 font-semibold">
                <Icon name="Coins" size={14} /> ЗНАЙКИ
              </div>
              <div className="text-white">
                Баланс: <b className="text-amber-200">{num(detail.znaika.balance)}</b> · Уровень {detail.znaika.level} · Стрик {detail.znaika.streak} дн.
              </div>
            </div>
          </Card>
        )}

        <div className="mb-5">
          <h4 className="text-white/65 text-xs uppercase tracking-wider font-bold mb-2">Покупки курсов</h4>
          {detail.purchases.length === 0 ? (
            <div className="text-white/40 text-sm">Покупок не было</div>
          ) : (
            <div className="space-y-1.5">
              {detail.purchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.025] border border-white/8 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">Курс #{p.course_id}</div>
                    <div className="text-white/40 text-xs">{new Date(p.created_at).toLocaleString("ru-RU")} · {p.provider || "—"}</div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${
                    p.status === "paid" ? "border-emerald-400/30 text-emerald-200 bg-emerald-500/10" : "border-amber-400/30 text-amber-200 bg-amber-500/10"
                  }`}>{p.status}</Badge>
                  <div className="text-emerald-300 font-bold w-20 text-right">{rub(p.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {detail.subscriptions.length > 0 && (
          <div>
            <h4 className="text-white/65 text-xs uppercase tracking-wider font-bold mb-2">Подписки</h4>
            <div className="space-y-1.5">
              {detail.subscriptions.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.025] border border-white/8 text-sm">
                  <div className="text-white">{s.plan_id}</div>
                  <Badge variant="outline" className="text-[10px] border-white/15 text-white/70">{s.status}</Badge>
                  <div className="text-emerald-300 font-bold w-20 text-right">{rub(s.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
      <div className="text-white/50 text-xs">{label}</div>
      <div className={`font-montserrat font-bold text-lg ${accent}`}>{value}</div>
    </div>
  );
}
