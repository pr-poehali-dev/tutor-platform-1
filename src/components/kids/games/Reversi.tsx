import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const N = 8;
type Cell = "" | "w" | "b"; // w — ребёнок (светлые), b — Ксюша (тёмные)
const DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function initBoard(): Cell[] {
  const b: Cell[] = Array(N * N).fill("");
  b[27] = "w";
  b[28] = "b";
  b[35] = "b";
  b[36] = "w";
  return b;
}

function opp(p: Cell): Cell {
  return p === "w" ? "b" : "w";
}

// Возвращает перевёрнутые клетки если ход в idx допустим для who
function flipsFor(b: Cell[], idx: number, who: Cell): number[] {
  if (b[idx]) return [];
  const r = Math.floor(idx / N);
  const c = idx % N;
  const flips: number[] = [];
  for (const [dr, dc] of DIRS) {
    const line: number[] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr * N + nc] === opp(who)) {
      line.push(nr * N + nc);
      nr += dr;
      nc += dc;
    }
    if (line.length && nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr * N + nc] === who) {
      flips.push(...line);
    }
  }
  return flips;
}

function legalMoves(b: Cell[], who: Cell): Map<number, number[]> {
  const m = new Map<number, number[]>();
  for (let i = 0; i < N * N; i++) {
    const f = flipsFor(b, i, who);
    if (f.length) m.set(i, f);
  }
  return m;
}

function applyMove(b: Cell[], idx: number, who: Cell, flips: number[]): Cell[] {
  const next = [...b];
  next[idx] = who;
  flips.forEach((f) => (next[f] = who));
  return next;
}

function countCells(b: Cell[]) {
  let w = 0;
  let bl = 0;
  b.forEach((c) => {
    if (c === "w") w++;
    else if (c === "b") bl++;
  });
  return { w, b: bl };
}

const CORNERS = new Set([0, 7, 56, 63]);

export default function Reversi({
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
  const [board, setBoard] = useState<Cell[]>(initBoard);
  const [turn, setTurn] = useState<Cell>("w");
  const [over, setOver] = useState(false);

  const reset = () => {
    setBoard(initBoard());
    setTurn("w");
    setOver(false);
  };

  const finish = useCallback(
    (b: Cell[]) => {
      const { w, b: bl } = countCells(b);
      setOver(true);
      if (w > bl) {
        onSay(`Ты победил! У тебя ${w} фишек, у меня ${bl}. Здорово играешь! Лови ЗНАЙКИ!`);
        onWin();
      } else if (bl > w) {
        onSay(`У меня получилось больше фишек — ${bl} против ${w}. В этот раз моя взяла. Реванш?`);
        onLoss?.();
      } else {
        onSay("Ничья! Поровну фишек. Вот это битва! Сыграем ещё?");
      }
    },
    [onSay, onWin, onLoss]
  );

  const ksushaMove = useCallback(
    (b: Cell[]) => {
      const moves = legalMoves(b, "b");
      if (moves.size === 0) {
        onThinking?.(false);
        if (legalMoves(b, "w").size === 0) finish(b);
        else setTurn("w");
        return;
      }
      const entries = [...moves.entries()];
      let pick = entries[0];
      const randomChance = Math.max(0, 0.5 - (level - 1) * 0.2);
      if (Math.random() < randomChance) {
        pick = entries[Math.floor(Math.random() * entries.length)];
      } else {
        let bestScore = -Infinity;
        for (const e of entries) {
          let sc = e[1].length;
          if (CORNERS.has(e[0])) sc += 10;
          if (sc > bestScore) {
            bestScore = sc;
            pick = e;
          }
        }
      }
      const next = applyMove(b, pick[0], "b", pick[1]);
      onThinking?.(false);
      if (legalMoves(next, "w").size === 0 && legalMoves(next, "b").size === 0) {
        setBoard(next);
        finish(next);
      } else {
        setBoard(next);
        if (legalMoves(next, "w").size === 0) {
          onSay("У тебя нет хода — мой ход снова!");
          setTurn("b");
        } else {
          setTurn("w");
        }
      }
    },
    [onSay, onThinking, finish, level]
  );

  useEffect(() => {
    if (turn === "b" && !over) {
      onThinking?.(true);
      const t = setTimeout(() => ksushaMove(board), 1700);
      return () => clearTimeout(t);
    }
  }, [turn, over, board, ksushaMove, onThinking]);

  const myMoves = turn === "w" && !over ? legalMoves(board, "w") : new Map<number, number[]>();
  const { w, b: bl } = countCells(board);

  const click = (i: number) => {
    if (over || turn !== "w") return;
    const flips = myMoves.get(i);
    if (!flips) return;
    const next = applyMove(board, i, "w", flips);
    if (legalMoves(next, "b").size === 0 && legalMoves(next, "w").size === 0) {
      setBoard(next);
      finish(next);
    } else if (legalMoves(next, "b").size === 0) {
      setBoard(next);
      onSay("У меня нет хода — твой ход снова!");
      setTurn("w");
    } else {
      setBoard(next);
      setTurn("b");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-3 text-sm font-bold">
        <span className="text-white">Ты: {w}</span>
        <span className="text-white/60">Ксюша: {bl}</span>
      </div>
      <div
        className="grid gap-0.5 bg-emerald-700/40 p-2 rounded-3xl"
        style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
      >
        {board.map((c, i) => {
          const canPlay = myMoves.has(i);
          return (
            <button
              key={i}
              onClick={() => click(i)}
              disabled={over || turn !== "w" || !canPlay}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-md bg-emerald-600/40 flex items-center justify-center transition-all ${
                canPlay ? "ring-2 ring-emerald-300 hover:bg-emerald-500/50" : ""
              }`}
            >
              {c === "w" && <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white shadow" />}
              {c === "b" && <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-900 border border-white/20 shadow" />}
            </button>
          );
        })}
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
