import Icon from "@/components/ui/icon";
import { UserStats } from "@/hooks/useUserData";
import { calcLevel, getLevelTitle } from "@/lib/badges";

interface Props {
  stats: UserStats | null;
  badgesEarned: number;
}

export default function UserStatsCard({ stats, badgesEarned }: Props) {
  const xp = stats?.total_xp || 0;
  const { level, xpInLevel, xpToNext, progress } = calcLevel(xp);
  const title = getLevelTitle(level);

  return (
    <div className="bg-gradient-to-br from-purple-500/15 via-card/60 to-cyan-500/10 border border-white/15 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
          {level}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/55 text-[10px] uppercase tracking-widest font-bold">Уровень</p>
          <p className="text-white font-montserrat font-black text-lg leading-tight">{title}</p>
        </div>
      </div>

      {/* XP bar */}
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/65">{xpInLevel} XP</span>
        <span className="text-white/45">до след. уровня: {xpToNext}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-orange-300 mb-0.5">
            <Icon name="Flame" size={12} />
            <span className="text-[10px] uppercase font-bold">Streak</span>
          </div>
          <p className="text-white font-black text-lg tabular-nums">{stats?.streak_days || 0}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-yellow-300 mb-0.5">
            <Icon name="Zap" size={12} />
            <span className="text-[10px] uppercase font-bold">XP</span>
          </div>
          <p className="text-white font-black text-lg tabular-nums">{xp}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-cyan-300 mb-0.5">
            <Icon name="BookOpen" size={12} />
            <span className="text-[10px] uppercase font-bold">Уроки</span>
          </div>
          <p className="text-white font-black text-lg tabular-nums">{stats?.lessons_completed || 0}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-pink-300 mb-0.5">
            <Icon name="Award" size={12} />
            <span className="text-[10px] uppercase font-bold">Бейджи</span>
          </div>
          <p className="text-white font-black text-lg tabular-nums">{badgesEarned}</p>
        </div>
      </div>
    </div>
  );
}
