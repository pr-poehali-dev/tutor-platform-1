import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Customer, SEG_COLOR, SEG_LABEL, rub, num } from "./types";

type SegmentFilter = "all" | "paying" | "lead" | "cold";

interface Props {
  customers: Customer[] | null;
  total: number;
  q: string;
  setQ: (v: string) => void;
  segment: SegmentFilter;
  setSegment: (s: SegmentFilter) => void;
  offset: number;
  setOffset: (o: number) => void;
  limit: number;
  onOpenCustomer: (id: number) => void;
}

export default function CustomersTable({
  customers, total, q, setQ, segment, setSegment, offset, setOffset, limit, onOpenCustomer,
}: Props) {
  return (
    <Card className="border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-montserrat text-base font-bold text-white flex items-center gap-2">
          <Icon name="Users" size={18} className="text-cyan-300" />
          База клиентов
          <span className="text-white/40 text-sm font-normal">({num(total)})</span>
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={q}
            onChange={(e) => { setOffset(0); setQ(e.target.value); }}
            placeholder="Email, имя или телефон..."
            className="h-9 w-64 bg-white/[0.04] border-white/12"
          />
          <div className="flex bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
            {(["all", "paying", "lead", "cold"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setOffset(0); setSegment(s); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  segment === s ? "bg-white/10 text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {s === "all" ? "Все" : SEG_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/45 text-xs uppercase tracking-wider border-b border-white/8">
              <th className="text-left font-semibold px-5 py-2">Клиент</th>
              <th className="text-left font-semibold py-2">Контакт</th>
              <th className="text-left font-semibold py-2">Сегмент</th>
              <th className="text-right font-semibold py-2">Заказов</th>
              <th className="text-right font-semibold py-2">Потратил</th>
              <th className="text-left font-semibold py-2">Регистрация</th>
              <th className="text-right font-semibold px-5 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers?.length === 0 && (
              <tr><td colSpan={7} className="text-center text-white/40 py-10">Ничего не найдено</td></tr>
            )}
            {customers?.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.03]">
                <td className="px-5 py-2.5">
                  <div className="font-semibold text-white">{c.name || "Без имени"}</div>
                  <div className="text-white/35 text-xs">ID {c.id}</div>
                </td>
                <td className="py-2.5">
                  <div className="text-white/80">{c.email || "—"}</div>
                  <div className="text-white/35 text-xs">{c.phone || ""}</div>
                </td>
                <td className="py-2.5">
                  <Badge variant="outline" className={`text-[10px] ${SEG_COLOR[c.segment]}`}>
                    {SEG_LABEL[c.segment]}
                  </Badge>
                </td>
                <td className="text-right py-2.5 font-semibold">{c.orders}</td>
                <td className="text-right py-2.5 text-emerald-300 font-semibold">{rub(c.spent)}</td>
                <td className="py-2.5 text-white/55 text-xs">
                  {new Date(c.created_at).toLocaleDateString("ru-RU")}
                </td>
                <td className="text-right px-5 py-2.5">
                  <Button variant="ghost" size="sm" onClick={() => onOpenCustomer(c.id)} className="h-7 text-xs">
                    Карточка <Icon name="ChevronRight" size={12} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {total > limit && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-white/45">
            {offset + 1}–{Math.min(offset + limit, total)} из {num(total)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
              <Icon name="ChevronLeft" size={14} /> Назад
            </Button>
            <Button variant="outline" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>
              Вперёд <Icon name="ChevronRight" size={14} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
