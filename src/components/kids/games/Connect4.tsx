import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const COLS = 7;
const ROWS = 6;

type Cell = "" | "y" | "r";

function idx(r: number, c: number) {
  return r * COLS + c;
}

function dropRow(b: Cell[], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!b[idx(r, col)]) return r;
  }
  return -1;
}

function checkWin(b: Cell[], who: Cell): boolean {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (b[idx(r, c)] !== who) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let s = 1; s < 4; s++) {
          const nr = r + dr * s;
          const nc = c + dc * s;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || b[idx(nr, nc)] !== who) break;
          count++;
        }
        if (count >= 4) return true;
      }
    }
  return false;
}

function validCols(b: Cell[]): number[] {
  const res: number[] = [];
  for (let c = 0; c < COLS; c++) if (dropRow(b, c) >= 0) res.push(c);
  return res;
}

function place(b: Cell[], col: number, who: Cell): Cell[] {
  const r = dropRow(b, col);
  if (r < 0) return b;
  const next = [...b];
  next[idx(r, col)] = who;
  return next;
}

export default function Connect4({
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
  const [board, setBoard] = useState<Cell[]>(Array(COLS * ROWS).fill(""));
  const [turn, setTurn] = useState<"y" | "r">("y");
  const [over, setOver] = useState<null | "y" | "r" | "draw">(null);

  const reset = () => {
    setBoard(Array(COLS * ROWS).fill(""));
    setTurn("y");
    setOver(null);
  };

  const ksushaMove = useCallback(() => {
    setBoard((b) => {
      const cols = validCols(b);
      if (cols.length === 0) {
        setOver("draw");
        onSay("Ничья! Все клеточки заняты. Сыграем ещё разок?");
        onThinking?.(false);
        return b;
      }

      // Выигрышный ход
      let choice = cols.find((c) => checkWin(place(b, c, "r"), "r"));
      // Блок победы ребёнка
      if (choice === undefined) {
        const randomChance = Math.max(0, 0.6 - (level - 1) * 0.25);
        if (Math.random() >= randomChance) {
          choice = cols.find((c) => checkWin(place(b, c, "y"), "y"));
        }
      }
      // Предпочесть центр
      if (choice === undefined) {
        const center = [3, 2, 4, 1, 5, 0, 6].filter((c) => cols.includes(c));
        choice =
          Math.random() < 0.7 && center.length
            ? center[0]
            : cols[Math.floor(Math.random() * cols.length)];
      }

      const next = place(b, choice, "r");
      if (checkWin(next, "r")) {
        setOver("r");
        onSay("Я собрала четыре красные фишки в ряд! Здорово вышло. Хочешь реванш?");
        onLoss?.();
      } else if (validCols(next).length === 0) {
        setOver("draw");
        onSay("Ничья! Поле заполнилось. Сыграем ещё?");
        onThinking?.(false);
      } else {
        onThinking?.(false);
        setTurn("y");
      }
      return next;
    });
  }, [onSay, onLoss, onThinking, level]);

  useEffect(() => {
    if (turn === "r" && !over) {
      onThinking?.(true);
      const t = setTimeout(() => ksushaMove(), 1700);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, over]);

  const clickCol = (col: number) => {
    if (over || turn !== "y" || dropRow(board, col) < 0) return;
    const next = place(board, col, "y");
    setBoard(next);
    if (checkWin(next, "y")) {
      setOver("y");
      onSay("Ура! Ты собрал четыре фишки в ряд и победил! Молодчина! Лови ЗНАЙКИ!");
      onWin();
    } else if (validCols(next).length === 0) {
      setOver("draw");
      onSay("Ничья! Поле заполнилось. Сыграем ещё?");
    } else {
      setTurn("r");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-blue-600/30 border border-blue-400/30 p-2 rounded-3xl">
        <div className="flex gap-1 mb-1">
          {[...Array(COLS)].map((_, c) => (
            <button
              key={c}
              onClick={() => clickCol(c)}
              disabled={!!over || turn !== "y" || dropRow(board, c) < 0}
              className="w-9 h-7 md:w-12 md:h-8 rounded-lg bg-white/10 hover:bg-white/25 disabled:opacity-30 flex items-center justify-center text-white/70 transition-colors"
            >
              <Icon name="ChevronDown" size={16} />
            </button>
          ))}
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {board.map((c, i) => (
            <div
              key={i}
              className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-blue-900/50 flex items-center justify-center"
            >
              {c === "y" && <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-yellow-400 shadow" />}
              {c === "r" && <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-red-500 shadow" />}
            </div>
          ))}
        </div>
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