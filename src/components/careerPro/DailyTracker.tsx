import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  getToday,
  toggleDayTask,
  sendReflection,
  TodayResult,
  DayTask,
} from "./api";
import DayHistory from "./DayHistory";

const MOODS = [
  { key: "great", emoji: "🔥", label: "Отличный" },
  { key: "ok", emoji: "🙂", label: "Нормальный" },
  { key: "hard", emoji: "😮‍💨", label: "Тяжёлый" },
  { key: "bad", emoji: "😔", label: "Провальный" },
];

export default function DailyTracker() {
  const [data, setData] = useState<TodayResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const [sending, setSending] = useState(false);
  const [coachNote, setCoachNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getToday().then((r) => {
      setData(r);
      setDone(r.day?.done || []);
      setCoachNote(r.day?.coach_note || "");
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
        <Icon name="Loader" className="animate-spin mx-auto mb-2" size={22} />
        Собираю твой день…
      </div>
    );
  }

  if (!data?.ok || !data.has_plan) {
    return null;
  }

  const day = data.day!;
  const closed = day.status === "closed";
  const tasks: DayTask[] = day.tasks || [];
  const pct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  const onToggle = async (i: number) => {
    if (closed) return;
    const next = done.includes(i);
    setDone((prev) => (next ? prev.filter((x) => x !== i) : [...prev, i]));
    await toggleDayTask(i, !next);
  };

  const onSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const r = await sendReflection(text.trim(), mood);
    setSending(false);
    if (r.ok) {
      setCoachNote(r.coach_note || "");
      setData((d) =>
        d ? { ...d, day: { ...d.day!, status: "closed" }, streak: r.streak ?? d.streak } : d,
      );
      setText("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Шапка: день, серия */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary font-bold">
            День {data.day_index} · Год {data.year_index} · Месяц {data.month_index}
          </div>
          <h3 className="font-montserrat font-black text-white text-xl md:text-2xl mt-1">
            {day.focus || "Сегодняшний шаг"}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {!!data.streak && (
            <div className="rounded-xl bg-orange-500/15 border border-orange-500/25 px-3 py-2 text-center">
              <div className="text-orange-400 font-black text-lg leading-none">{data.streak}</div>
              <div className="text-[10px] text-orange-300/80 uppercase">дней подряд</div>
            </div>
          )}
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-2 text-white/80 text-xs font-bold transition-colors"
          >
            <Icon name="History" size={14} className="inline mr-1" />
            Дневник
          </button>
        </div>
      </div>

      {/* Задачи дня */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/70 text-sm font-bold">Задачи на сегодня</span>
          <span className="text-white/50 text-xs">
            {done.length} из {tasks.length}
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ul className="space-y-2">
          {tasks.map((t, i) => {
            const isDone = done.includes(i);
            return (
              <li key={i}>
                <button
                  onClick={() => onToggle(i)}
                  disabled={closed}
                  className={`w-full text-left flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                    isDone
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  } ${closed ? "cursor-default opacity-80" : ""}`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      isDone ? "border-green-400 bg-green-500/30" : "border-white/25"
                    }`}
                  >
                    {isDone && <Icon name="Check" size={13} className="text-green-300" />}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${
                        isDone ? "text-white/60 line-through" : "text-white"
                      }`}
                    >
                      {t.title}
                    </span>
                    <span className="block text-xs text-white/45 mt-0.5">
                      ~{t.minutes} мин{t.why ? ` · ${t.why}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Вечерняя рефлексия */}
      {!closed ? (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 md:p-5">
          <h4 className="font-montserrat font-bold text-white mb-1">Как прошёл день?</h4>
          <p className="text-white/55 text-xs mb-3">
            Напиши пару строк — что получилось, что нет. По этому наставник соберёт завтрашний день.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMood(mood === m.key ? "" : m.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mood === m.key
                    ? "border-primary bg-primary/20 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={3000}
            placeholder="Например: сделал первые две задачи, на третью не хватило сил — сел поздно…"
            className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none resize-none"
          />

          <button
            onClick={onSend}
            disabled={!text.trim() || sending}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 font-bold text-white disabled:opacity-40 transition-opacity"
          >
            {sending ? "Отправляю…" : "Записать итог дня"}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-green-500/25 bg-green-500/10 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CircleCheck" size={16} className="text-green-400" />
            <span className="text-green-300 font-bold text-sm">День закрыт</span>
          </div>
          {!!coachNote && <p className="text-white/80 text-sm leading-relaxed">{coachNote}</p>}
          <p className="text-white/45 text-xs mt-3">
            Завтрашний день откроется утром — он уже учтёт сегодняшний итог.
          </p>
        </div>
      )}

      {/* План месяца и года — видны заранее */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-wider text-secondary font-bold mb-1">
            План месяца
          </div>
          <div className="text-white font-bold text-sm mb-1">{data.month_plan?.title}</div>
          <p className="text-white/55 text-xs mb-2">{data.month_plan?.focus}</p>
          <ul className="space-y-1">
            {(data.month_plan?.goals || []).map((g, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/70">
                <span className="text-secondary">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
          {!!data.month_plan?.metric && (
            <div className="mt-2 text-[11px] text-white/45">Результат: {data.month_plan.metric}</div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1">
            Год {data.year_index} из 5
          </div>
          <div className="text-white font-bold text-sm mb-1">{data.year_plan?.title}</div>
          <p className="text-white/55 text-xs mb-2">{data.year_plan?.focus}</p>
          <ul className="space-y-1">
            {(data.year_plan?.milestones || []).slice(0, 4).map((m, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/70">
                <span className="text-primary">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
          {!!data.year_plan?.metric && (
            <div className="mt-2 text-[11px] text-white/45">Метрика: {data.year_plan.metric}</div>
          )}
        </div>
      </div>

      {showHistory && <DayHistory />}
    </div>
  );
}
