import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// 0 пусто, 1 игрок (светлые, снизу, идут вверх), 2 Ксюша (тёмные, сверху, идут вниз)
type Piece = 0 | 1 | 2;
type Board = Piece[][];

const N = 8;

function initBoard(): Board {
  const b: Board = Array.from({ length: N }, () => Array(N).fill(0) as Piece[]);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) b[r][c] = 2;
        else if (r > 4) b[r][c] = 1;
      }
    }
  }
  return b;
}

interface Move {
  fr: number; fc: number; tr: number; tc: number;
  cap?: { r: number; c: number };
}

function clone(b: Board): Board {
  return b.map((row) => [...row]);
}

function pieceMoves(b: Board, r: number, c: number, player: Piece): Move[] {
  const moves: Move[] = [];
  const caps: Move[] = [];
  const dir = player === 1 ? -1 : 1; // светлые вверх, тёмные вниз
  const opp = player === 1 ? 2 : 1;
  // простые ходы
  for (const dc of [-1, 1]) {
    const nr = r + dir, nc = c + dc;
    if (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === 0) {
      moves.push({ fr: r, fc: c, tr: nr, tc: nc });
    }
  }
  // взятия (в обе стороны по вертикали — как в русских шашках)
  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const mr = r + dr, mc = c + dc;
      const nr = r + 2 * dr, nc = c + 2 * dc;
      if (
        nr >= 0 && nr < N && nc >= 0 && nc < N &&
        b[mr]?.[mc] === opp && b[nr][nc] === 0
      ) {
        caps.push({ fr: r, fc: c, tr: nr, tc: nc, cap: { r: mr, c: mc } });
      }
    }
  }
  return caps.length ? caps : moves;
}

function allMoves(b: Board, player: Piece): Move[] {
  const all: Move[] = [];
  const caps: Move[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (b[r][c] === player) {
        for (const m of pieceMoves(b, r, c, player)) {
          if (m.cap) caps.push(m);
          else all.push(m);
        }
      }
    }
  }
  return caps.length ? caps : all;
}

function applyMove(b: Board, m: Move): Board {
  const nb = clone(b);
  nb[m.tr][m.tc] = nb[m.fr][m.fc];
  nb[m.fr][m.fc] = 0;
  if (m.cap) nb[m.cap.r][m.cap.c] = 0;
  return nb;
}

function count(b: Board, p: Piece): number {
  let n = 0;
  for (const row of b) for (const v of row) if (v === p) n++;
  return n;
}

export default function Checkers({
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
  const [board, setBoard] = useState<Board>(initBoard);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
  const [turn, setTurn] = useState<Piece>(1);
  const [over, setOver] = useState<null | 1 | 2>(null);

  const reset = () => {
    setBoard(initBoard());
    setSel(null);
    setTurn(1);
    setOver(null);
  };

  const checkEnd = useCallback((b: Board, nextPlayer: Piece): boolean => {
    if (count(b, 1) === 0) {
      setOver(2);
      onSay("Я забрала все твои шашки. В этот раз победила я! Сыграем ещё?");
      onLoss?.();
      return true;
    }
    if (count(b, 2) === 0) {
      setOver(1);
      onSay("Ура! Ты забрал все мои шашки и победил! Ты настоящий чемпион! Лови ЗНАЙКИ!");
      onWin();
      return true;
    }
    if (allMoves(b, nextPlayer).length === 0) {
      const winner = nextPlayer === 1 ? 2 : 1;
      setOver(winner);
      if (winner === 1) {
        onSay("У меня не осталось ходов — ты победил! Молодец! Лови ЗНАЙКИ!");
        onWin();
      } else {
        onSay("У тебя не осталось ходов. В этот раз победила я! Попробуешь ещё?");
        onLoss?.();
      }
      return true;
    }
    return false;
  }, [onSay, onWin, onLoss]);

  // Ход Ксюши — запускается только при смене хода, доску читаем функционально
  useEffect(() => {
    if (turn !== 2 || over) return;
    onThinking?.(true);
    const t = setTimeout(() => {
      setBoard((board) => {
        const moves = allMoves(board, 2);
        if (moves.length === 0) {
          checkEnd(board, 2);
          onThinking?.(false);
          return board;
        }
        const caps = moves.filter((m) => m.cap);

        // На низком уровне Ксюша иногда «не замечает» взятие и ходит наугад —
        // так малышу легче выиграть. С ростом уровня всегда бьёт.
        const missChance = Math.max(0, 0.6 - (level - 1) * 0.2);
        const useCapture = caps.length > 0 && Math.random() > missChance;
        const pool = useCapture ? caps : moves;

        let pick = pool[Math.floor(Math.random() * pool.length)];

        // На уровне 3+ Ксюша избегает ходов, после которых её шашку сразу побьют
        if (level >= 3) {
          const safe = pool.filter((m) => {
            const after = applyMove(board, m);
            return allMoves(after, 1).every(
              (om) => !(om.cap && om.cap.r === m.tr && om.cap.c === m.tc)
            );
          });
          if (safe.length) pick = safe[Math.floor(Math.random() * safe.length)];
        }

        const nb = applyMove(board, pick);
        onThinking?.(false);
        if (!checkEnd(nb, 1)) setTurn(1);
        return nb;
      });
    }, 1700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, over]);

  const click = (r: number, c: number) => {
    if (turn !== 1 || over) return;
    const myMoves = allMoves(board, 1);
    // выбор шашки
    if (board[r][c] === 1) {
      setSel({ r, c });
      return;
    }
    // ход выбранной
    if (sel) {
      const mv = myMoves.find(
        (m) => m.fr === sel.r && m.fc === sel.c && m.tr === r && m.tc === c
      );
      if (mv) {
        const nb = applyMove(board, mv);
        setBoard(nb);
        setSel(null);
        if (!checkEnd(nb, 2)) setTurn(2);
      }
    }
  };

  const myMoves = turn === 1 && !over ? allMoves(board, 1) : [];
  const targets = sel
    ? myMoves.filter((m) => m.fr === sel.r && m.fc === sel.c)
    : [];

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-8 gap-0 rounded-2xl overflow-hidden border-4 border-amber-700/40">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const dark = (r + c) % 2 === 1;
            const isSel = sel?.r === r && sel?.c === c;
            const isTarget = targets.some((m) => m.tr === r && m.tc === c);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => click(r, c)}
                className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center ${
                  dark ? "bg-amber-800/70" : "bg-amber-100/90"
                } ${isTarget ? "ring-2 ring-inset ring-emerald-400" : ""}`}
              >
                {cell !== 0 && (
                  <span
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md ${
                      cell === 1
                        ? "bg-gradient-to-br from-white to-slate-200 border border-slate-300"
                        : "bg-gradient-to-br from-slate-700 to-slate-900 border border-black/40"
                    } ${isSel ? "ring-2 ring-emerald-400" : ""}`}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm text-white/60">
        <span>⚪ Ты: {count(board, 1)}</span>
        <span>⚫ Ксюша: {count(board, 2)}</span>
      </div>

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