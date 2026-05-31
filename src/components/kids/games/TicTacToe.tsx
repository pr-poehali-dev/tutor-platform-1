import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Cell = "X" | "O" | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(b: Cell[]): Cell {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

function findBest(b: Cell[], me: "O", you: "X"): number | null {
  const empty = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  // 1. Победить
  for (const i of empty) {
    const t = [...b]; t[i] = me;
    if (winner(t) === me) return i;
  }
  // 2. Заблокировать игрока
  for (const i of empty) {
    const t = [...b]; t[i] = you;
    if (winner(t) === you) return i;
  }
  // 3. Центр
  if (b[4] === null) return 4;
  // 4. Угол
  const corners = [0, 2, 6, 8].filter((i) => b[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // 5. Любая
  if (empty.length) return empty[Math.floor(Math.random() * empty.length)];
  return null;
}

export default function TicTacToe({
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
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [over, setOver] = useState<null | "X" | "O" | "draw">(null);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setOver(null);
  };

  const ksushaMove = useCallback(() => {
    setBoard((b) => {
      // защита: ходим только если ещё есть пустые клетки и нет победителя
      if (winner(b) || b.every((c) => c)) return b;
      // На низком уровне Ксюша иногда ходит наугад (даёт малышу шанс),
      // с ростом уровня играет всё точнее и почти не ошибается.
      const randomChance = Math.max(0, 0.6 - (level - 1) * 0.2);
      const empty = b.map((v, idx) => (v ? -1 : idx)).filter((idx) => idx >= 0);
      let i: number | null;
      if (Math.random() < randomChance && empty.length) {
        i = empty[Math.floor(Math.random() * empty.length)];
      } else {
        i = findBest(b, "O", "X");
      }
      if (i === null) return b;
      const next = [...b];
      next[i] = "O";
      const w = winner(next);
      if (w === "O") {
        setOver("O");
        onSay("Я собрала три нолика в ряд! В этот раз повезло мне. Сыграем ещё?");
        onLoss?.();
      } else if (next.every((c) => c)) {
        setOver("draw");
        onSay("Ничья! Никто не выиграл. Хочешь сыграть ещё разок?");
        onThinking?.(false);
      } else {
        onThinking?.(false);
        setTurn("X");
      }
      return next;
    });
  }, [onSay, onLoss, onThinking, level]);

  // Ход Ксюши запускается ТОЛЬКО при смене хода на «O», а не на каждое
  // изменение доски — иначе плодятся таймеры и реплики накладываются.
  useEffect(() => {
    if (turn === "O" && !over) {
      onThinking?.(true);
      const t = setTimeout(() => ksushaMove(), 1700);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, over]);

  const click = (i: number) => {
    if (board[i] || over || turn !== "X") return;
    const next = [...board];
    next[i] = "X";
    setBoard(next);
    const w = winner(next);
    if (w === "X") {
      setOver("X");
      onSay("Ура! Ты собрал три крестика в ряд и победил! Молодец! Лови ЗНАЙКИ!");
      onWin();
    } else if (next.every((c) => c)) {
      setOver("draw");
      onSay("Ничья! Никто не выиграл. Хочешь сыграть ещё разок?");
    } else {
      setTurn("O");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 gap-2 bg-white/5 p-2 rounded-3xl">
        {board.map((c, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={!!c || !!over || turn !== "X"}
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-card border border-white/10 flex items-center justify-center text-4xl md:text-5xl font-black hover:bg-white/10 disabled:cursor-default transition-colors"
          >
            {c === "X" && <span className="text-pink-400">✕</span>}
            {c === "O" && <span className="text-cyan-400">◯</span>}
          </button>
        ))}
      </div>

      {over && (
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="RotateCcw" size={18} />
          Играть ещё раз
        </button>
      )}
    </div>
  );
}