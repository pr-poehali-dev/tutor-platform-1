import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { BADGES, BadgeStats, RARITY_COLORS } from "@/lib/badges";
import { UserStats } from "@/hooks/useUserData";

interface Props {
  earnedIds: string[];
  stats: UserStats | null;
  myCoursesCount: number;
  favoritesCount: number;
  uniqueSubjects: number;
  compact?: boolean;
}

export default function BadgesGrid({
  earnedIds, stats, myCoursesCount, favoritesCount, uniqueSubjects, compact,
}: Props) {
  const checkStats: BadgeStats = useMemo(() => ({
    lessons_completed: stats?.lessons_completed || 0,
    tasks_solved: stats?.tasks_solved || 0,
    streak_days: stats?.streak_days || 0,
    total_xp: stats?.total_xp || 0,
    favorites_count: favoritesCount,
    my_courses_count: myCoursesCount,
    unique_subjects: uniqueSubjects,
  }), [stats, favoritesCount, myCoursesCount, uniqueSubjects]);

  const earnedSet = new Set(earnedIds);
  // Сначала заработанные, потом — в процессе (близкие)
  const sorted = useMemo(() => {
    return [...BADGES].sort((a, b) => {
      const ae = earnedSet.has(a.id) ? 1 : 0;
      const be = earnedSet.has(b.id) ? 1 : 0;
      if (ae !== be) return be - ae;
      // Из неполученных — сначала те, что близки к выполнению
      const ac = a.check(checkStats) ? 1 : 0;
      const bc = b.check(checkStats) ? 1 : 0;
      return bc - ac;
    });
  }, [earnedSet, checkStats]);

  const list = compact ? sorted.slice(0, 6) : sorted;

  return (
    <div className="bg-card/50 border border-white/10 rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-montserrat font-black text-white flex items-center gap-2">
          <Icon name="Award" size={16} className="text-amber-400" />
          {compact ? "Достижения" : "Все бейджи"}
        </h3>
        <span className="text-white/55 text-xs">
          {earnedIds.length}/{BADGES.length}
        </span>
      </div>

      <div className={`grid ${compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"} gap-2`}>
        {list.map((b) => {
          const earned = earnedSet.has(b.id);
          const r = RARITY_COLORS[b.rarity];
          return (
            <div
              key={b.id}
              title={`${b.name} — ${b.description}${earned ? "" : " (заблокировано)"}`}
              className={`relative aspect-square rounded-xl border bg-gradient-to-br ${r.bg} flex flex-col items-center justify-center p-1.5 transition-all ${
                earned ? `ring-1 ${r.ring}` : "opacity-40 grayscale border-white/10"
              }`}
            >
              <div className="text-2xl mb-0.5 select-none">{b.emoji}</div>
              <p className={`text-[9px] font-bold text-center leading-tight line-clamp-2 ${earned ? "text-white" : "text-white/40"}`}>
                {b.name}
              </p>
              {!earned && (
                <Icon name="Lock" size={9} className="absolute top-1 right-1 text-white/35" />
              )}
            </div>
          );
        })}
      </div>

      {compact && BADGES.length > 6 && (
        <p className="text-white/45 text-xs text-center mt-3">
          и ещё {BADGES.length - 6} бейджей
        </p>
      )}
    </div>
  );
}
