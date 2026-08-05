import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { getHistory, HistoryDay } from "./api";

const MOOD_EMOJI: Record<string, string> = {
  great: "🔥",
  ok: "🙂",
  hard: "😮‍💨",
  bad: "😔",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  } catch {
    return iso;
  }
}

export default function DayHistory() {
  const [items, setItems] = useState<HistoryDay[]>([]);
  const [stats, setStats] = useState({ days: 0, avg: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState<string | null>(null);

  useEffect(() => {
    getHistory().then((r) => {
      if (r.ok) {
        setItems(r.items || []);
        setStats({
          days: r.days_closed || 0,
          avg: r.avg_score || 0,
          streak: r.streak || 0,
        });
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-white/50 text-sm">
        <Icon name="Loader" className="animate-spin mx-auto mb-2" size={18} />
        Открываю дневник…
      </div>
    );
  }

  const closed = items.filter((i) => i.status === "closed");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
      <h4 className="font-montserrat font-bold text-white mb-3">Мой дневник</h4>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-white font-black text-lg">{stats.days}</div>
          <div className="text-[10px] text-white/45 uppercase">дней пройдено</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-white font-black text-lg">{stats.avg}%</div>
          <div className="text-[10px] text-white/45 uppercase">средний результат</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-orange-400 font-black text-lg">{stats.streak}</div>
          <div className="text-[10px] text-white/45 uppercase">серия</div>
        </div>
      </div>

      {closed.length === 0 ? (
        <p className="text-white/45 text-sm text-center py-4">
          Пока пусто. Запиши первый итог дня — и здесь появится история.
        </p>
      ) : (
        <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {closed.map((d) => {
            const isOpen = openDate === d.date;
            return (
              <li key={d.date} className="rounded-xl border border-white/10 bg-white/5">
                <button
                  onClick={() => setOpenDate(isOpen ? null : d.date)}
                  className="w-full flex items-center justify-between gap-3 p-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-white text-sm font-semibold truncate">
                      {MOOD_EMOJI[d.mood] || "📌"} {formatDate(d.date)} · день {d.day_index}
                    </span>
                    <span className="block text-white/45 text-xs truncate">{d.focus}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold ${
                        d.score >= 70 ? "text-green-400" : d.score >= 40 ? "text-yellow-400" : "text-white/40"
                      }`}
                    >
                      {d.score}%
                    </span>
                    <Icon
                      name={isOpen ? "ChevronUp" : "ChevronDown"}
                      size={14}
                      className="text-white/40"
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 p-3 space-y-2">
                    <div>
                      <div className="text-[11px] uppercase text-white/40 mb-1">Задачи</div>
                      <ul className="space-y-1">
                        {d.tasks.map((t, i) => (
                          <li key={i} className="flex gap-2 text-xs">
                            <span className={d.done.includes(i) ? "text-green-400" : "text-white/30"}>
                              {d.done.includes(i) ? "✓" : "○"}
                            </span>
                            <span className={d.done.includes(i) ? "text-white/50 line-through" : "text-white/70"}>
                              {t.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {!!d.reflection && (
                      <div>
                        <div className="text-[11px] uppercase text-white/40 mb-1">Мой итог</div>
                        <p className="text-white/70 text-xs leading-relaxed">{d.reflection}</p>
                      </div>
                    )}
                    {!!d.coach_note && (
                      <div className="rounded-lg bg-primary/10 border border-primary/20 p-2">
                        <div className="text-[11px] uppercase text-primary/80 mb-1">Наставник</div>
                        <p className="text-white/80 text-xs leading-relaxed">{d.coach_note}</p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
