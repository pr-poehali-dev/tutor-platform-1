import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { ActivityDay } from "@/hooks/useUserData";

interface Props {
  activity: ActivityDay[];
}

// 17 недель × 7 дней = ~120 дней
const WEEKS = 17;
const WEEKDAYS = ["Пн", "", "Ср", "", "Пт", "", ""];

function getColor(xp: number): string {
  if (xp === 0) return "bg-white/[0.04]";
  if (xp < 30) return "bg-purple-500/30";
  if (xp < 80) return "bg-purple-500/55";
  if (xp < 150) return "bg-purple-500/80";
  return "bg-gradient-to-br from-purple-400 to-cyan-400";
}

function getLevel(xp: number): number {
  if (xp === 0) return 0;
  if (xp < 30) return 1;
  if (xp < 80) return 2;
  if (xp < 150) return 3;
  return 4;
}

export default function ActivityHeatmap({ activity }: Props) {
  const { grid, totalDays, totalXp, totalLessons, monthLabels } = useMemo(() => {
    const map: Record<string, ActivityDay> = {};
    activity.forEach((a) => { map[a.date] = a; });

    // Сетка слева-направо: каждая колонка — неделя. Сегодня — правый нижний угол.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDaysShown = WEEKS * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (totalDaysShown - 1));

    // Сдвиг к понедельнику начала первой недели
    const dow = (startDate.getDay() + 6) % 7; // 0=Пн
    startDate.setDate(startDate.getDate() - dow);

    const cells: { date: string; data: ActivityDay | null; future: boolean }[] = [];
    const cursor = new Date(startDate);
    for (let i = 0; i < (WEEKS + 1) * 7; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      const isFuture = cursor > today;
      cells.push({ date: iso, data: map[iso] || null, future: isFuture });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Перегруппируем в недели (columns)
    const weeks: typeof cells[] = [];
    for (let w = 0; w < WEEKS + 1; w++) {
      weeks.push(cells.slice(w * 7, (w + 1) * 7));
    }

    // Подсчёт
    let days = 0, xp = 0, lessons = 0;
    activity.forEach((a) => {
      if (a.xp > 0 || a.lessons > 0 || a.tasks > 0) days++;
      xp += a.xp;
      lessons += a.lessons;
    });

    // Подписи месяцев
    const months: { week: number; label: string }[] = [];
    let lastMonth = -1;
    const monthsShort = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    weeks.forEach((wk, idx) => {
      const firstCell = wk[0];
      if (!firstCell) return;
      const m = new Date(firstCell.date).getMonth();
      if (m !== lastMonth) {
        months.push({ week: idx, label: monthsShort[m] });
        lastMonth = m;
      }
    });

    return { grid: weeks, totalDays: days, totalXp: xp, totalLessons: lessons, monthLabels: months };
  }, [activity]);

  return (
    <div className="bg-card/50 border border-white/10 rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-montserrat font-black text-white flex items-center gap-2">
          <Icon name="CalendarDays" size={16} className="text-cyan-400" />
          Активность за 4 месяца
        </h3>
        <div className="flex items-center gap-3 text-xs text-white/65">
          <span className="flex items-center gap-1">
            <Icon name="Flame" size={11} className="text-orange-400" /> {totalDays} дн.
          </span>
          <span className="flex items-center gap-1">
            <Icon name="BookOpen" size={11} className="text-cyan-300" /> {totalLessons}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Zap" size={11} className="text-yellow-300" /> {totalXp} XP
          </span>
        </div>
      </div>

      {/* Сетка */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="inline-block min-w-full">
          {/* Подписи месяцев */}
          <div className="flex gap-1 ml-7 mb-1 text-[10px] text-white/45 font-bold uppercase tracking-wider relative h-3">
            {monthLabels.map((m) => (
              <span
                key={`${m.week}-${m.label}`}
                className="absolute"
                style={{ left: `${m.week * 16}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            {/* Подписи дней недели */}
            <div className="flex flex-col gap-1 w-6">
              {WEEKDAYS.map((d, i) => (
                <div key={i} className="h-3 text-[9px] text-white/40 leading-3 text-right pr-1">{d}</div>
              ))}
            </div>
            {/* Колонки = недели */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell, ci) => {
                  if (cell.future) return <div key={ci} className="w-3 h-3 rounded-sm bg-transparent" />;
                  const lvl = getLevel(cell.data?.xp || 0);
                  const colorClass = getColor(cell.data?.xp || 0);
                  return (
                    <div
                      key={ci}
                      title={`${cell.date}${cell.data ? ` — ${cell.data.xp} XP, ${cell.data.lessons} ур.` : " — нет активности"}`}
                      className={`w-3 h-3 rounded-sm ${colorClass} hover:ring-1 hover:ring-white/40 transition-all`}
                      data-level={lvl}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-white/45">
        <span>меньше</span>
        <div className="w-3 h-3 rounded-sm bg-white/[0.04]" />
        <div className="w-3 h-3 rounded-sm bg-purple-500/30" />
        <div className="w-3 h-3 rounded-sm bg-purple-500/55" />
        <div className="w-3 h-3 rounded-sm bg-purple-500/80" />
        <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-purple-400 to-cyan-400" />
        <span>больше</span>
      </div>
    </div>
  );
}
