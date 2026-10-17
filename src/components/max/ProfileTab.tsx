import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MaxSummary, saveGrade } from "./maxApi";
import { openExternal } from "./maxBridge";

const SITE = "https://учисьпро.рф";

export default function ProfileTab({
  token,
  name,
  grade,
  avatar,
  summary,
  onGrade,
}: {
  token: string | null;
  name?: string | null;
  grade?: string | null;
  avatar?: string | null;
  summary: MaxSummary | null;
  onGrade: (g: string) => void;
}) {
  const [editGrade, setEditGrade] = useState(!grade);
  const s = summary?.stats;
  const accuracy = s && s.tasks ? Math.round((s.correct / s.tasks) * 100) : null;

  const pickGrade = async (g: string) => {
    if (token && (await saveGrade(token, g))) {
      onGrade(g);
      setEditGrade(false);
    }
  };

  return (
    <div className="space-y-5 px-4 pb-6 pt-4">
      <div className="flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-bold">{(name || "У").slice(0, 1)}</span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{name || "Ученик"}</h1>
          <button onClick={() => setEditGrade((v) => !v)} className="mt-0.5 flex items-center gap-1 text-sm text-white/60">
            {grade ? `${grade} класс` : "Укажи класс"}
            <Icon name="Pencil" size={13} />
          </button>
        </div>
      </div>

      {editGrade && (
        <div className="rounded-3xl border border-primary/30 bg-primary/10 p-4">
          <p className="mb-3 text-sm font-semibold">В каком ты классе? Подберём задания и объяснения под уровень</p>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 11 }, (_, i) => String(i + 1)).map((g) => (
              <button
                key={g}
                onClick={() => pickGrade(g)}
                className={`h-12 rounded-xl text-base font-semibold ${grade === g ? "bg-primary text-primary-foreground" : "bg-white/10"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 gap-2">
        <Stat icon="Flame" value={s?.streak ?? 0} label="дней подряд" tone="text-amber-300" />
        <Stat icon="CalendarDays" value={s?.active_days_week ?? 0} label="дней занятий за неделю" tone="text-primary" />
        <Stat icon="ListChecks" value={s?.tasks ?? 0} label="заданий решено" tone="text-cyan-300" />
        <Stat icon="Target" value={accuracy === null ? "—" : `${accuracy}%`} label="верных ответов" tone="text-emerald-300" />
      </section>

      <button
        onClick={() => openExternal(`${SITE}/mini-course`)}
        className="flex w-full items-center gap-4 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-left active:bg-emerald-500/20"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/20">
          <Icon name="GraduationCap" size={24} className="text-emerald-300" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Бесплатные мини-курсы</span>
          <span className="block text-sm text-white/60">Больше 30 коротких курсов: учёба, экзамены, английский</span>
        </span>
        <Icon name="ChevronRight" size={20} className="text-white/40" />
      </button>

      <button
        onClick={() => openExternal(SITE)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.06] py-3 text-sm text-white/70"
      >
        <Icon name="Globe" size={16} />
        Полная версия на сайте учисьпро.рф
      </button>
    </div>
  );
}

function Stat({ icon, value, label, tone }: { icon: string; value: number | string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.05] p-4">
      <Icon name={icon} size={18} className={tone} />
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/55">{label}</p>
    </div>
  );
}
