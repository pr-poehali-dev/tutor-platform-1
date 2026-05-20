import { useState } from "react";
import Icon from "@/components/ui/icon";
import { User, SavedJourney } from "./useUserProgress";
import { SUBJECTS } from "./journeyData";

interface Props {
  user: User | null;
  savedJourneys: SavedJourney[];
  onLogin: (nickname: string, displayName?: string, avatar?: string) => Promise<void>;
  onLogout: () => void;
  onContinueJourney: (j: SavedJourney) => void;
  isLoading: boolean;
  error: string | null;
}

const AVATARS = ["🦁", "🦊", "🐺", "🐱", "🐸", "🐼", "🦄", "🐯", "🦉", "🐧"];

export default function UserLoginPanel({
  user,
  savedJourneys,
  onLogin,
  onLogout,
  onContinueJourney,
  isLoading,
  error,
}: Props) {
  const [nick, setNick] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("🦁");
  const [showForm, setShowForm] = useState(false);

  const submit = async () => {
    if (!nick.trim()) return;
    await onLogin(nick, displayName || undefined, avatar);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-8 animate-fade-in">
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🚀</div>
          <h3 className="font-montserrat font-black text-xl text-white mb-2">Сохрани свой прогресс</h3>
          <p className="text-white/55 text-sm">
            Введи ник — ИИ запомнит твой маршрут и темы для повторения через 1, 3, 7 дней
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={nick}
            onChange={e => setNick(e.target.value.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, "").slice(0, 32))}
            onKeyDown={e => e.key === "Enter" && nick.trim() && !showForm && submit()}
            placeholder="Твой ник (латиница или кириллица)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
          />

          {showForm && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value.slice(0, 64))}
                placeholder="Как тебя называть (необязательно)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <div>
                <p className="text-white/50 text-xs mb-2">Выбери аватар:</p>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        avatar === a
                          ? "bg-purple-500/30 border-2 border-purple-500"
                          : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex-shrink-0 px-3 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-xs transition-all"
            >
              {showForm ? "Свернуть" : "Доп. настройки"}
            </button>
            <button
              onClick={submit}
              disabled={!nick.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-5 py-3 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={14} className="animate-spin" />
                  Проверяю...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={14} />
                  Войти / Создать
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-white/30 text-xs text-center mt-4">
          Без паролей и email — просто запомним по нику. Можно зайти на любом устройстве.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mb-8 animate-fade-in">
      {/* User card */}
      <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/15 border border-purple-500/30 rounded-2xl p-4 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl flex-shrink-0">
          {user.avatar_emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-montserrat font-black text-white text-base truncate">
            Привет, {user.display_name || user.nickname}!
          </p>
          <div className="flex items-center gap-3 text-xs mt-0.5">
            <span className="text-yellow-400 font-bold">⚡ {user.total_xp} XP</span>
            {user.streak_days > 0 && (
              <span className="text-orange-400 font-bold">🔥 {user.streak_days} {user.streak_days === 1 ? "день" : "дн"}</span>
            )}
            <span className="text-white/40">@{user.nickname}</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-white/40 hover:text-white text-xs flex items-center gap-1 transition-colors"
          title="Выйти"
        >
          <Icon name="LogOut" size={14} />
        </button>
      </div>

      {/* Active journeys */}
      {savedJourneys.length > 0 && (
        <div className="bg-card/60 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Bookmark" size={16} className="text-cyan-400" />
            <h4 className="font-montserrat font-black text-white text-sm">Незавершённые маршруты</h4>
            <span className="ml-auto text-white/40 text-xs">{savedJourneys.filter(j => !j.is_complete).length} активных</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {savedJourneys.slice(0, 4).map(j => {
              const subj = SUBJECTS.find(s => s.id === j.subject);
              const total = j.program_data?.modules?.length || 0;
              const done = (j.completed_module_ids || []).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <button
                  key={j.id}
                  onClick={() => onContinueJourney(j)}
                  className="text-left bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/20 rounded-xl p-4 transition-all card-hover"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{subj?.emoji || "📚"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {j.program_data?.program_title || subj?.name || j.subject}
                      </p>
                      <p className="text-white/40 text-xs">{j.grade} · {j.level_assessment}</p>
                    </div>
                    {j.is_complete && (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">✓ готово</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: subj?.accent || "#a855f7" }}
                      />
                    </div>
                    <span className="text-xs text-white/60 font-bold whitespace-nowrap">
                      {done}/{total}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
