import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// 0 пусто, 1 игрок (светлые), 2 Ксюша (тёмные)
type Piece = 0 | 1 | 2;
const N = 8;

// Стартовый «уголок» из 6 шашек: треугольник 3-2-1 от угла
// Игрок (1) — левый нижний угол; Ксюша (2) — правый верхний угол
function startCells(player: 1 | 2): number[] {
  // относительные смещения треугольника от угла
  const tri = [
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1],
    [2, 0],
  ];
  const cells: number[] = [];
  for (const [dr, dc] of tri) {
    if (player === 1) {
      // левый нижний: строки снизу (N-1, N-2, N-3), столбцы слева
      const r = N - 1 - dr;
      const c = dc;
      cells.push(r * N + c);
    } else {
      // правый верхний: строки сверху, столбцы справа
      const r = dr;
      const c = N - 1 - dc;
      cells.push(r * N + c);
    }
  }
  return cells;
}

const HOME_1 = startCells(1); // стартовые = цель для Ксюши(2)
const HOME_2 = startCells(2); // стартовые = цель для игрока(1)
const TARGET_1 = HOME_2; // куда должен прийти игрок
const TARGET_2 = HOME_1; // куда должна прийти Ксюша

function initBoard(): Piece[] {
  const b: Piece[] = Array(N * N).fill(0);
  HOME_1.forEach((i) => (b[i] = 1));
  HOME_2.forEach((i) => (b[i] = 2));
  return b;
}

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function rc(i: number): [number, number] {
  return [Math.floor(i / N), i % N];
}

// Простые шаги на соседнюю пустую клетку
function stepMoves(b: Piece[], from: number): number[] {
  const [r, c] = rc(from);
  const res: number[] = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr * N + nc] === 0) {
      res.push(nr * N + nc);
    }
  }
  return res;
}

// Все клетки, достижимые серией прыжков через соседние шашки
function jumpMoves(b: Piece[], from: number): number[] {
  const reached = new Set<number>();
  const stack = [from];
  while (stack.length) {
    const cur = stack.pop()!;
    const [r, c] = rc(cur);
    for (const [dr, dc] of DIRS) {
      const mr = r + dr;
      const mc = c + dc;
      const lr = r + dr * 2;
      const lc = c + dc * 2;
      if (lr < 0 || lr >= N || lc < 0 || lc >= N) continue;
      const mid = mr * N + mc;
      const land = lr * N + lc;
      if (b[mid] !== 0 && b[land] === 0 && !reached.has(land) && land !== from) {
        reached.add(land);
        stack.push(land);
      }
    }
  }
  return [...reached];
}

function allMovesFrom(b: Piece[], from: number): number[] {
  return [...stepMoves(b, from), ...jumpMoves(b, from)];
}

function piecesOf(b: Piece[], player: Piece): number[] {
  const res: number[] = [];
  b.forEach((v, i) => {
    if (v === player) res.push(i);
  });
  return res;
}

function isWin(b: Piece[], player: 1 | 2): boolean {
  const target = player === 1 ? TARGET_1 : TARGET_2;
  return target.every((i) => b[i] === player);
}

// Насколько шашка близка к цели (для простого ИИ): сумма манхэттенских
// расстояний всех шашек до угла-цели; чем меньше — тем лучше для игрока.
function cornerOf(player: 1 | 2): [number, number] {
  // целевой угол игрока
  return player === 1 ? [0, N - 1] : [N - 1, 0];
}

function distanceScore(b: Piece[], player: 1 | 2): number {
  const [tr, tc] = cornerOf(player);
  let sum = 0;
  for (const i of piecesOf(b, player)) {
    const [r, c] = rc(i);
    sum += Math.abs(r - tr) + Math.abs(c - tc);
  }
  return sum;
}

export default function Corners({
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
  const [board, setBoard] = useState<Piece[]>(initBoard);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [sel, setSel] = useState<number | null>(null);
  const [over, setOver] = useState<null | 1 | 2>(null);

  const reset = () => {
    setBoard(initBoard());
    setTurn(1);
    setSel(null);
    setOver(null);
  };

  const ksushaMove = useCallback(() => {
    setBoard((b) => {
      const mine = piecesOf(b, 2);
      // Перебираем ходы, выбираем тот, что максимально сокращает дистанцию до угла
      let bestFrom = -1;
      let bestTo = -1;
      let bestScore = Infinity;
      const randomChance = Math.max(0, 0.5 - (level - 1) * 0.2);

      const candidates: { from: number; to: number; score: number }[] = [];
      for (const from of mine) {
        for (const to of allMovesFrom(b, from)) {
          const nb = [...b];
          nb[to] = 2;
          nb[from] = 0;
          const score = distanceScore(nb, 2);
          candidates.push({ from, to, score });
          if (score < bestScore) {
            bestScore = score;
            bestFrom = from;
            bestTo = to;
          }
        }
      }

      if (candidates.length === 0) {
        onThinking?.(false);
        setTurn(1);
        return b;
      }

      let chosen = { from: bestFrom, to: bestTo };
      if (Math.random() < randomChance) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      }

      const next = [...b];
      next[chosen.to] = 2;
      next[chosen.from] = 0;
      onThinking?.(false);
      if (isWin(next, 2)) {
        setOver(2);
        onSay("Я первой перевела все шашки в свой уголок! В этот раз победила я. Сыграем ещё?");
        onLoss?.();
      } else {
        setTurn(1);
      }
      return next;
    });
  }, [onSay, onLoss, onThinking, level]);

  useEffect(() => {
    if (turn === 2 && !over) {
      onThinking?.(true);
      const t = setTimeout(() => ksushaMove(), 1700);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, over]);

  const myMoves = turn === 1 && !over && sel !== null ? allMovesFrom(board, sel) : [];

  const click = (i: number) => {
    if (turn !== 1 || over) return;
    const piece = board[i];

    // выбор своей шашки
    if (piece === 1) {
      setSel(i === sel ? null : i);
      return;
    }

    // ход выбранной шашкой
    if (sel !== null && myMoves.includes(i)) {
      const next = [...board];
      next[i] = 1;
      next[sel] = 0;
      setSel(null);
      setBoard(next);
      if (isWin(next, 1)) {
        setOver(1);
        onSay("Ура! Ты перевёл все шашки в уголок раньше меня и победил! Молодец! Лови ЗНАЙКИ!");
        onWin();
      } else {
        setTurn(2);
      }
      return;
    }

    setSel(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid bg-amber-900/30 p-2 rounded-3xl" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
        {board.map((p, i) => {
          const [r, c] = rc(i);
          const dark = (r + c) % 2 === 1;
          const isTarget = TARGET_1.includes(i);
          const canMove = myMoves.includes(i);
          const selected = sel === i;
          return (
            <button
              key={i}
              onClick={() => click(i)}
              disabled={turn !== 1 || !!over}
              className={`relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center transition-colors ${
                dark ? "bg-amber-800/40" : "bg-amber-200/15"
              } ${canMove ? "ring-2 ring-inset ring-emerald-400" : ""} ${
                selected ? "ring-2 ring-inset ring-sky-400" : ""
              }`}
            >
              {isTarget && p !== 1 && (
                <span className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-emerald-400/40" />
              )}
              {p === 1 && (
                <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-amber-200 to-yellow-400 shadow border border-amber-500/40" />
              )}
              {p === 2 && (
                <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow border border-white/20" />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-white/50 text-sm mt-4 h-5">
        {over ? "" : turn === 1 ? (sel === null ? "Выбери свою шашку" : "Выбери, куда пойти") : "Ходит Ксюша…"}
      </p>

      {over && (
        <button
          onClick={reset}
          className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="RotateCcw" size={18} />
          Играть ещё раз
        </button>
      )}
    </div>
  );
}
