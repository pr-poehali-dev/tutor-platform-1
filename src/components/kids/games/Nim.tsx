import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const START = [3, 5, 7];

export default function Nim({
  onSay,
  onWin,
  onLoss,
  onThinking,
  level = 1,
}: {
  onSay: (text: string) => void;
  onWin: () => void;
  onLoss?: () => void;
  onThinking?: (active: boolean) => void;
  level?: number;
}) {
  const [piles, setPiles] = useState<number[]>([...START]);
  const [turn, setTurn] = useState<"you" | "ksusha">("you");
  const [over, setOver] = useState<null | "you" | "ksusha">(null);

  const reset = () => {
    setPiles([...START]);
    setTurn("you");
    setOver(null);
  };

  const total = (p: number[]) => p.reduce((a, b) => a + b, 0);

  const ksushaMove = useCallback(
    (p: number[]) => {
      const nimSum = p.reduce((a, b) => a ^ b, 0);
      const smart = Math.random() < Math.min(1, 0.3 + (level - 1) * 0.3);

      let pileIdx = -1;
      let take = 0;

      if (smart && nimSum !== 0) {
        // оптимальный ход: оставить nim-sum = 0
        for (let i = 0; i < p.length; i++) {
          const target = p[i] ^ nimSum;
          if (target < p[i]) {
            pileIdx = i;
            take = p[i] - target;
            break;
          }
        }
      }
      if (pileIdx === -1) {
        const nonEmpty = p.map((v, i) => (v > 0 ? i : -1)).filter((i) => i >= 0);
        pileIdx = nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
        take = 1 + Math.floor(Math.random() * p[pileIdx]);
      }

      const next = [...p];
      next[pileIdx] -= take;
      setPiles(next);
      onThinking?.(false);
      if (total(next) === 0) {
        setOver("ksusha");
        onSay("Я забрала последнюю звёздочку! Хитро получилось, да? Сыграем ещё разок?");
        onLoss?.();
      } else {
        setTurn("you");
      }
    },
    [onSay, onLoss, onThinking, level]
  );

  useEffect(() => {
    if (turn === "ksusha" && !over) {
      onThinking?.(true);
      const t = setTimeout(() => ksushaMove(piles), 1700);
      return () => clearTimeout(t);
    }
  }, [turn, over, piles, ksushaMove, onThinking]);

  // Клик по звезде: забрать её и все правее в этой кучке
  const takeFrom = (pileIdx: number, starIdx: number) => {
    if (over || turn !== "you") return;
    const take = piles[pileIdx] - starIdx;
    if (take <= 0) return;
    const next = [...piles];
    next[pileIdx] -= take;
    setPiles(next);
    if (total(next) === 0) {
      setOver("you");
      onSay("Ура! Ты забрал последнюю звёздочку и победил! Какой ты умный! Лови ЗНАЙКИ!");
      onWin();
    } else {
      setTurn("ksusha");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-white/60 text-sm mb-4 text-center max-w-xs">
        Нажми на звёздочку — заберёшь её и все звёзды правее в этой кучке.
      </p>
      <div className="flex flex-col gap-4 bg-white/5 p-5 rounded-3xl">
        {piles.map((count, pi) => (
          <div key={pi} className="flex items-center gap-1.5 justify-center min-h-[2.5rem]">
            {count === 0 ? (
              <span className="text-white/30 text-sm">пусто</span>
            ) : (
              [...Array(count)].map((_, si) => (
                <button
                  key={si}
                  onClick={() => takeFrom(pi, si)}
                  disabled={over !== null || turn !== "you"}
                  className="text-3xl md:text-4xl hover:scale-125 disabled:opacity-60 transition-transform"
                  title="Забрать отсюда до конца"
                >
                  ⭐
                </button>
              ))
            )}
          </div>
        ))}
      </div>

      <p className="text-white/50 text-sm mt-4">
        {over ? "" : turn === "you" ? "Твой ход" : "Ходит Ксюша…"}
      </p>

      {over && (
        <button
          onClick={reset}
          className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="RotateCcw" size={18} />
          Играть ещё раз
        </button>
      )}
    </div>
  );
}
