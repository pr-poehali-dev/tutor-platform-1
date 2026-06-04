import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { fetchLeaderboard, LeaderboardEntry } from "./api";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function OlympiadLeaderboard({ onBack }: { onBack?: () => void }) {
  const [list, setList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then((l) => { setList(l); setLoading(false); });
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-montserrat font-black text-2xl text-white flex items-center gap-2">
          <Icon name="Trophy" size={24} className="text-amber-400" /> Таблица лидеров
        </h2>
        {onBack && (
          <button onClick={onBack} className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-1.5">
            <Icon name="ArrowLeft" size={16} /> Назад
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mx-auto" />
        </div>
      ) : list.length === 0 ? (
        <div className="bg-card/50 border border-white/10 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🏁</div>
          <p className="text-white/75 font-bold mb-1">Пока никто не прошёл олимпиаду</p>
          <p className="text-white/45 text-sm">Стань первым в таблице лидеров!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((e) => (
            <div
              key={e.rank}
              className={`flex items-center gap-3 rounded-2xl p-3.5 border ${
                e.rank <= 3 ? "bg-amber-500/10 border-amber-400/30" : "bg-white/5 border-white/10"
              }`}
            >
              <div className="w-9 text-center font-black text-lg flex-shrink-0">
                {e.rank <= 3 ? MEDALS[e.rank - 1] : <span className="text-white/50 text-sm">{e.rank}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate flex items-center gap-1.5">
                  {e.name}
                  {e.perfect && <Icon name="BadgeCheck" size={14} className="text-amber-400 flex-shrink-0" />}
                </p>
                <p className="text-white/45 text-xs truncate">{e.subject} · {e.correct}/{e.total} верных</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-cyan-300 font-black tabular-nums">{e.score}</p>
                <p className="text-white/40 text-[10px]">очков</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
