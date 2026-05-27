import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { SubjectCode, SUBJECTS } from "@/components/graduate/graduateData";
import { EGE_2026_SCHEDULE, getNearestExam } from "./examDates";

interface Props {
  subjects: SubjectCode[];
  compact?: boolean;
}

interface CountdownParts {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function partsTo(targetIso: string, from = new Date()): CountdownParts {
  const target = new Date(targetIso + "T09:00:00").getTime();
  const total = Math.max(0, target - from.getTime());
  const sec = Math.floor(total / 1000);
  return {
    total,
    days: Math.floor(sec / 86400),
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
  };
}

/** Динамический обратный отсчёт до ближайшего ЕГЭ. */
export default function ExamCountdown({ subjects, compact = false }: Props) {
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Если предметы ещё не выбраны — берём общий старт основного этапа ЕГЭ
  const target = subjects.length > 0
    ? getNearestExam(subjects, new Date(nowTick))
    : EGE_2026_SCHEDULE[0]; // 22 мая 2026 — русский

  if (!target) {
    return (
      <div className="bg-emerald-500/15 border border-emerald-500/35 rounded-3xl p-5 text-center">
        <p className="text-emerald-200 font-bold">Все твои ЕГЭ уже сданы! Удачи в поступлении 🎉</p>
      </div>
    );
  }

  const parts = partsTo(target.date, new Date(nowTick));
  const subj = SUBJECTS[target.subject];
  const targetDate = new Date(target.date + "T09:00:00").toLocaleDateString("ru-RU", {
    day: "2-digit", month: "long", year: "numeric",
  });

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-rose-500/12 to-amber-500/12 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3">
        <div className="text-3xl">{subj?.emoji ?? "📚"}</div>
        <div className="min-w-0 flex-1">
          <p className="text-white/55 text-[10px] uppercase tracking-wider font-bold">До ближайшего ЕГЭ</p>
          <p className="font-montserrat font-black text-white text-base truncate">{subj?.label ?? target.subject}</p>
        </div>
        <div className="text-right">
          <p className="font-montserrat font-black text-rose-300 text-2xl leading-none tabular-nums">{parts.days}</p>
          <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold">дней</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-900/30 via-amber-900/20 to-orange-900/25 p-5 md:p-7">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/35 text-rose-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            <Icon name="AlarmClock" size={10} />
            До ближайшего ЕГЭ
          </span>
          <span className="text-3xl">{subj?.emoji ?? "📚"}</span>
          <span className="font-montserrat font-black text-white text-lg md:text-xl">{subj?.label ?? target.subject}</span>
        </div>

        <p className="text-white/55 text-xs md:text-sm mb-4">
          Экзамен: {targetDate} · продолжительность {Math.floor(target.durationMin / 60)} ч {target.durationMin % 60} мин
        </p>

        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {[
            { label: "дней", value: parts.days },
            { label: "часов", value: parts.hours },
            { label: "минут", value: parts.minutes },
            { label: "секунд", value: parts.seconds },
          ].map((p) => (
            <div key={p.label} className="bg-white/[0.06] border border-white/15 rounded-2xl p-3 md:p-4 text-center">
              <p className="font-montserrat font-black text-white text-2xl md:text-4xl tabular-nums leading-none">
                {String(p.value).padStart(2, "0")}
              </p>
              <p className="text-white/55 text-[10px] uppercase tracking-wider font-bold mt-1">{p.label}</p>
            </div>
          ))}
        </div>

        {target.notes && (
          <p className="text-white/55 text-xs mt-3 flex items-center gap-1">
            <Icon name="Info" size={11} />
            {target.notes}
          </p>
        )}
      </div>
    </div>
  );
}
