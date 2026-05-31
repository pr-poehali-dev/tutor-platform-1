import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

const MAX = 50;

export default function GuessNumber({
  onSay,
  onWin,
}: {
  onSay: (text: string) => void;
  onWin: () => void;
}) {
  const [target, setTarget] = useState(() => 1 + Math.floor(Math.random() * MAX));
  const [value, setValue] = useState("");
  const [tries, setTries] = useState<number[]>([]);
  const [won, setWon] = useState(false);

  const restart = useCallback(() => {
    setTarget(1 + Math.floor(Math.random() * MAX));
    setValue("");
    setTries([]);
    setWon(false);
    onSay("Я загадала новое число от одного до пятидесяти. Попробуй угадать!");
  }, [onSay]);

  const check = () => {
    if (won) return;
    const n = parseInt(value, 10);
    if (Number.isNaN(n) || n < 1 || n > MAX) {
      onSay("Назови число от одного до пятидесяти!");
      return;
    }
    const next = [...tries, n];
    setTries(next);
    setValue("");
    if (n === target) {
      setWon(true);
      onSay(`Точно! Я загадала ${target}! Ты угадал за ${next.length} попыток. Молодец! Лови ЗНАЙКИ!`);
      onWin();
    } else if (n < target) {
      onSay("Моё число больше! Попробуй ещё.");
    } else {
      onSay("Моё число меньше! Давай ещё разок.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-white/60 text-sm mb-4 text-center max-w-xs">
        Я загадала число от 1 до 50. Угадай его за меньшее число попыток!
      </p>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          min={1}
          max={MAX}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          disabled={won}
          placeholder="?"
          className="w-24 h-14 text-center text-2xl font-black rounded-2xl bg-card border border-white/15 text-white focus:outline-none focus:border-teal-400 disabled:opacity-60"
        />
        <button
          onClick={check}
          disabled={won || !value}
          className="h-14 inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold px-6 rounded-2xl hover:scale-[1.02] disabled:opacity-50 transition-transform"
        >
          <Icon name="Check" size={18} />
          Проверить
        </button>
      </div>

      {tries.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mt-5 max-w-xs">
          {tries.map((t, i) => (
            <span
              key={i}
              className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                t === target
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : t < target
                  ? "bg-sky-500/15 text-sky-300"
                  : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {t} {t === target ? "✓" : t < target ? "↑" : "↓"}
            </span>
          ))}
        </div>
      )}

      <p className="text-white/50 text-sm mt-4">Попыток: {tries.length}</p>

      <button
        onClick={restart}
        className="mt-2 inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-white/12 transition-colors"
      >
        <Icon name="RotateCcw" size={16} />
        Загадать заново
      </button>
    </div>
  );
}
