import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const N = 9;
const DIRS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

type Cell = "" | "r" | "b";

function winnerAt(b: Cell[], idx: number): boolean {
  const who = b[idx];
  if (!who) return false;
  const r = Math.floor(idx / N);
  const c = idx % N;
  for (const [dr, dc] of DIRS) {
    let count = 1;
    for (let s = 1; s < 5; s++) {
      const nr = r + dr * s;
      const nc = c + dc * s;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N || b[nr * N + nc] !== who) break;
      count++;
    }
    for (let s = 1; s < 5; s++) {
      const nr = r - dr * s;
      const nc = c - dc * s;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N || b[nr * N + nc] !== who) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

// Оценка клетки для игрока who — сумма длин потенциальных линий
function scoreCell(b: Cell[], idx: number, who: Cell): number {
  const r = Math.floor(idx / N);
  const c = idx % N;
  let total = 0;
  for (const [dr, dc] of DIRS) {
    let line = 1;
    for (let s = 1; s < 5; s++) {
      const nr = r + dr * s;
      const nc = c + dc * s;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N || b[nr * N + nc] !== who) break;
      line++;
    }
    for (let s = 1; s < 5; s++) {
      const nr = r - dr * s;
      const nc = c - dc * s;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N || b[nr * N + nc] !== who) break;
      line++;
    }
    total += line * line;
  }
  return total;
}

function hasNeighbor(b: Cell[], idx: number): boolean {
  const r = Math.floor(idx / N);
  const c = idx % N;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr * N + nc]) return true;
    }
  return false;
}

export default function Gomoku({
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
  const [board, setBoard] = useState<Cell[]>(Array(N * N).fill(""));
  const [turn, setTurn] = useState<"r" | "b">("r");
  const [over, setOver] = useState<null | "r" | "b">(null);

  const reset = () => {
    setBoard(Array(N * N).fill(""));
    setTurn("r");
    setOver(null);
  };

  const ksushaMove = useCallback(
    (b: Cell[]) => {
      const empties: number[] = [];
      b.forEach((v, i) => {
        if (!v) empties.push(i);
      });
      if (empties.length === 0) return;

      const randomChance = Math.max(0, 0.5 - (level - 1) * 0.2);
      let pick: number;

      const candidates = empties.filter((i) => hasNeighbor(b, i));
      const pool = candidates.length ? candidates : [Math.floor((N * N) / 2)];

      if (Math.random() < randomChance) {
        pick = pool[Math.floor(Math.random() * pool.length)];
      } else {
        let best = pool[0];
        let bestScore = -1;
        for (const i of pool) {
          const my = scoreCell(b, i, "b");
          const block = scoreCell(b, i, "r");
          const sc = my * 1.1 + block;
          if (sc > bestScore) {
            bestScore = sc;
            best = i;
          }
        }
        pick = best;
      }

      const next = [...b];
      next[pick] = "b";
      setBoard(next);
      if (winnerAt(next, pick)) {
        setOver("b");
        onSay("Я собрала пять синих фишек в ряд! В этот раз повезло мне. Сыграем ещё?");
        onLoss?.();
      } else {
        onThinking?.(false);
        setTurn("r");
      }
    },
    [onSay, onLoss, onThinking, level]
  );

  useEffect(() => {
    if (turn === "b" && !over) {
      onThinking?.(true);
      const t = setTimeout(() => ksushaMove(board), 1700);
      return () => clearTimeout(t);
    }
  }, [turn, over, board, ksushaMove, onThinking]);

  const click = (i: number) => {
    if (board[i] || over || turn !== "r") return;
    const next = [...board];
    next[i] = "r";
    setBoard(next);
    if (winnerAt(next, i)) {
      setOver("r");
      onSay("Ура! Ты собрал пять фишек в ряд и победил! Вот это глаз! Лови ЗНАЙКИ!");
      onWin();
    } else {
      setTurn("b");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid gap-1 bg-white/5 p-2 rounded-3xl"
        style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
      >
        {board.map((c, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={!!c || !!over || turn !== "r"}
            className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-card border border-white/10 flex items-center justify-center text-lg md:text-xl hover:bg-white/10 disabled:cursor-default transition-colors"
          >
            {c === "r" && <span className="text-red-400">●</span>}
            {c === "b" && <span className="text-sky-400">●</span>}
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
