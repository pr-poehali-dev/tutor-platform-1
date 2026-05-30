import Icon from "@/components/ui/icon";
import KsushaSpeech, { SoundToggle } from "./KsushaSpeech";
import { GameInfo } from "./gamesData";
import { useGameLevel } from "./useGameLevel";
import TicTacToe from "./TicTacToe";
import Fifteen from "./Fifteen";
import Checkers from "./Checkers";
import SeaBattle from "./SeaBattle";
import Chess from "./Chess";

// Игры, где есть ИИ-соперник и работает адаптивная сложность
const ADAPTIVE: Record<string, boolean> = {
  tictactoe: true,
  checkers: true,
  chess: true,
};

export default function GamePlay({
  game,
  bubble,
  speaking,
  voiceEnabled,
  onToggleVoice,
  onSpeak,
  onSay,
  onBack,
  onReward,
  isAuthenticated,
  onLogin,
}: {
  game: GameInfo;
  bubble: string;
  speaking: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onSpeak: (text: string) => void;
  onSay: (text: string) => void;
  onBack: () => void;
  onReward: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}) {
  const { level, winsToNext, registerWin, registerLoss } = useGameLevel(game.slug);
  const adaptive = ADAPTIVE[game.slug];

  const handleWin = () => {
    onReward();
    if (!adaptive) return;
    const { leveledUp, level: newLevel } = registerWin();
    if (leveledUp) {
      // Озвучиваем повышение уровня чуть позже, после реплики о победе
      setTimeout(() => {
        onSay(
          `Ух ты! Ты выиграл уже две партии подряд! Теперь я буду играть посложнее — уровень ${newLevel}. Покажи, на что ты способен!`
        );
      }, 2600);
    }
  };

  const handleLoss = () => {
    if (adaptive) registerLoss();
  };

  return (
    <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 py-6">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors"
        >
          <Icon name="ChevronLeft" size={16} />
          Все игры
        </button>
        <div className="flex items-center gap-3">
          {adaptive && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-400/15 text-violet-200 px-3 py-1.5 text-sm font-bold">
              <Icon name="TrendingUp" size={14} />
              Уровень {level}
            </span>
          )}
          <SoundToggle enabled={voiceEnabled} onToggle={onToggleVoice} />
        </div>
      </div>

      <div className="mb-3">
        <KsushaSpeech
          text={bubble}
          speaking={speaking}
          onReplay={voiceEnabled ? () => onSpeak(bubble) : undefined}
        />
      </div>

      {adaptive && (
        <p className="text-center text-white/45 text-xs mb-5">
          {winsToNext === 1
            ? "Выиграй ещё разок — и сложность повысится!"
            : `Выиграй ${winsToNext} партии подряд — Ксюша станет играть сложнее.`}
        </p>
      )}

      {!isAuthenticated && (
        <div className="mb-5 text-center">
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-bold underline underline-offset-4"
          >
            <Icon name="LogIn" size={14} />
            Войди, чтобы получать ЗНАЙКИ за победы
          </button>
        </div>
      )}

      <div className="flex justify-center">
        {game.slug === "tictactoe" && (
          <TicTacToe onSay={onSay} onWin={handleWin} onLoss={handleLoss} level={level} />
        )}
        {game.slug === "fifteen" && <Fifteen onSay={onSay} onWin={handleWin} />}
        {game.slug === "checkers" && (
          <Checkers onSay={onSay} onWin={handleWin} onLoss={handleLoss} level={level} />
        )}
        {game.slug === "seabattle" && <SeaBattle onSay={onSay} onWin={handleWin} />}
        {game.slug === "chess" && (
          <Chess onSay={onSay} onWin={handleWin} onLoss={handleLoss} level={level} />
        )}
      </div>
    </section>
  );
}
