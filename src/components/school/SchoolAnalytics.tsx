import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { fetchSchoolStats, requestPayout, type SchoolStats } from "@/components/school/api";

function rub(kopecks: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(kopecks / 100) + " ₽";
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

const REQ_STATUS_LABEL: Record<string, string> = {
  new: "Заявка принята, ожидает обработки",
  processing: "Выплата в обработке",
};

export default function SchoolAnalytics() {
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requisites, setRequisites] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchSchoolStats();
    if (res.ok && res.data) setStats(res.data.stats);
    else setError(res.error || "Не удалось загрузить статистику");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitPayout = async () => {
    if (!requisites.trim()) {
      setError("Укажите реквизиты для перевода");
      return;
    }
    setSending(true);
    setError(null);
    const res = await requestPayout(requisites.trim(), comment.trim() || undefined);
    setSending(false);
    if (res.ok) {
      setSent(true);
      setRequisites("");
      setComment("");
      await load();
    } else {
      setError(res.error || "Не удалось отправить заявку");
    }
  };

  if (loading) {
    return <div className="text-white/50 text-sm py-10 text-center">Загружаем статистику…</div>;
  }
  if (error) {
    return <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">{error}</div>;
  }
  if (!stats) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <Icon name="BarChart3" size={30} className="text-white/40 mx-auto mb-3" />
        <p className="text-white/60 text-sm">Данных пока нет — они появятся после первых учеников и оплат.</p>
      </div>
    );
  }

  const cards = [
    { label: "Учеников всего", value: String(stats.students_total), hint: `${stats.students_from_purchase} по оплате · ${stats.students_invited} приглашено`, icon: "Users", color: "text-white" },
    { label: "Оплат курсов", value: String(stats.paid_count), hint: stats.pending_count > 0 ? `${stats.pending_count} в процессе` : "все завершены", icon: "CreditCard", color: "text-white" },
    { label: "Выручка", value: rub(stats.gross_kopecks), hint: `комиссия платформы ${stats.fee_percent}%`, icon: "TrendingUp", color: "text-white" },
    { label: "Ваш доход", value: rub(stats.school_share_kopecks), hint: `выплачено ${rub(stats.paid_out_kopecks)}`, icon: "Wallet", color: "text-emerald-300" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-white/45 text-xs mb-2">
              <Icon name={c.icon} size={14} /> {c.label}
            </div>
            <div className={`font-montserrat font-black text-xl ${c.color}`}>{c.value}</div>
            <div className="text-white/40 text-[11px] mt-1">{c.hint}</div>
          </div>
        ))}
      </div>

      {/* Итог по выплатам */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Banknote" size={17} className="text-violet-300" />
          <h3 className="font-montserrat font-bold text-white">Расчёт по деньгам</h3>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Выручка учеников</span>
            <span className="text-white font-medium">{rub(stats.gross_kopecks)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Комиссия платформы ({stats.fee_percent}%)</span>
            <span className="text-white/70">− {rub(stats.platform_fee_kopecks)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/8 pt-2.5">
            <span className="text-white/80 font-medium">Ваш доход</span>
            <span className="text-sky-300 font-bold">{rub(stats.school_share_kopecks)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Уже выплачено</span>
            <span className="text-white/70">{rub(stats.paid_out_kopecks)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/8 pt-2.5">
            <span className="text-white/80 font-medium">Осталось к выплате</span>
            <span className="text-amber-300 font-bold">{rub(stats.pending_payout_kopecks)}</span>
          </div>
        </div>
        <p className="text-white/40 text-[11px] mt-4">
          Приём платежей и комиссия уже включены. Выплаты вашей доли приходят от платформы.
        </p>
      </div>

      {/* Запрос выплаты */}
      <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.06] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Send" size={17} className="text-violet-300" />
          <h3 className="font-montserrat font-bold text-white">Вывод средств</h3>
        </div>

        {stats.open_request ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-medium mb-1">
              <Icon name="Clock" size={15} />
              {REQ_STATUS_LABEL[stats.open_request.status] || "Заявка в работе"}
            </div>
            <p className="text-white/70 text-sm">
              Сумма к выплате: <span className="font-bold">{rub(stats.open_request.amount_kopecks)}</span>
            </p>
            <p className="text-white/40 text-[11px] mt-1">
              Мы свяжемся с вами и переведём деньги по указанным реквизитам.
            </p>
          </div>
        ) : sent ? (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 flex items-center gap-2 text-emerald-300 text-sm font-medium">
            <Icon name="CircleCheck" size={16} /> Заявка отправлена! Мы переведём деньги в ближайшее время.
          </div>
        ) : stats.available_kopecks <= 0 ? (
          <p className="text-white/55 text-sm">
            Сейчас нет доступных к выводу средств. Как только ученики оплатят курсы — здесь появится сумма к выплате.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-white/60 text-sm">Доступно к выводу:</span>
              <span className="text-emerald-300 font-bold text-lg">{rub(stats.available_kopecks)}</span>
            </div>
            <input
              value={requisites}
              onChange={(e) => setRequisites(e.target.value)}
              placeholder="Реквизиты: номер карты или счёта для перевода"
              className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
            />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Комментарий (необязательно)"
              className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
            />
            <button
              onClick={submitPayout}
              disabled={sending || !requisites.trim()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Icon name={sending ? "Loader2" : "Send"} size={16} className={sending ? "animate-spin" : ""} />
              Запросить выплату {rub(stats.available_kopecks)}
            </button>
            <p className="text-white/40 text-[11px]">
              Будет создана заявка на всю доступную сумму. Платформа переведёт деньги по вашим реквизитам.
            </p>
          </div>
        )}
      </div>

      {/* Последние оплаты */}
      {stats.recent.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Receipt" size={17} className="text-violet-300" />
            <h3 className="font-montserrat font-bold text-white">Последние оплаты</h3>
          </div>
          <div className="space-y-2">
            {stats.recent.map((r, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="text-white/85 text-sm font-medium truncate">{r.course_title || "Курс"}</div>
                  <div className="text-white/40 text-xs truncate">{r.buyer_email || "ученик"}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-300 text-sm font-medium">+{rub(r.school_amount_kopecks)}</div>
                  <div className="text-white/40 text-[11px]">{fmtDate(r.paid_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}