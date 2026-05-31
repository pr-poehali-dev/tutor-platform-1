import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  Board,
  Move,
  initBoard,
  legalMovesFrom,
  applyMove,
  getStatus,
  inCheck,
  pickKsushaMove,
  PIECE_GLYPH,
  PIECE_NAME,
} from "./chessEngine";

export default function Chess({
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
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [over, setOver] = useState<null | "w" | "b" | "draw">(null);

  const reset = () => {
    setBoard(initBoard());
    setSel(null);
    setTurn("w");
    setOver(null);
  };

  const finish = useCallback((b: Board, justMoved: "w" | "b") => {
    const next = justMoved === "w" ? "b" : "w";
    const st = getStatus(b, next);
    if (st === "checkmate") {
      if (next === "b") {
        setOver("w");
        onSay("Мат! Ты поставил мне мат и выиграл партию! Ты настоящий шахматист! Лови ЗНАЙКИ!");
        onWin();
      } else {
        setOver("b");
        onSay("Мат! В этот раз победила я. Но ты здорово играл! Сыграем ещё?");
        onLoss?.();
      }
      return true;
    }
    if (st === "stalemate") {
      setOver("draw");
      onSay("Пат! Ходов больше нет — это ничья. Хорошая партия! Сыграем ещё разок?");
      return true;
    }
    if (inCheck(b, next)) {
      onSay(next === "b" ? "Шах моему королю! Мне надо защищаться." : "Шах! Твой король под боем — спаси его!");
    }
    return false;
  }, [onSay, onWin]);

  // Ход Ксюши — запускается только при смене хода, доску читаем функционально
  useEffect(() => {
    if (turn !== "b" || over) return;
    onThinking?.(true);
    const t = setTimeout(() => {
      setBoard((board) => {
        const m = pickKsushaMove(board, level);
        if (!m) {
          onThinking?.(false);
          finish(board, "w");
          return board;
        }
        const captured = board[m.tr][m.tc];
        const nb = applyMove(board, m);
        onThinking?.(false);
        if (captured) {
          onSay(`Я забираю твою фигуру — ${PIECE_NAME[captured.type]}. Будь внимательнее!`);
        }
        if (!finish(nb, "b")) setTurn("w");
        return nb;
      });
    }, 1700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, over]);

  const myMoves = turn === "w" && !over && sel
    ? legalMovesFrom(board, sel.r, sel.c)
    : [];

  const click = (r: number, c: number) => {
    if (turn !== "w" || over) return;
    const piece = board[r][c];

    // ход выбранной фигурой
    if (sel) {
      const mv: Move | undefined = myMoves.find((m) => m.tr === r && m.tc === c);
      if (mv) {
        const captured = board[r][c];
        const nb = applyMove(board, mv);
        setBoard(nb);
        setSel(null);
        if (captured) onSay(`Отлично! Ты забрал мою фигуру — ${PIECE_NAME[captured.type]}!`);
        if (!finish(nb, "w")) setTurn("b");
        return;
      }
    }

    // выбор своей фигуры
    if (piece && piece.color === "w") {
      setSel({ r, c });
      const moves = legalMovesFrom(board, r, c);
      if (moves.length === 0) {
        onSay(`Этой фигурой (${PIECE_NAME[piece.type]}) сейчас нельзя пойти. Выбери другую.`);
      }
    } else {
      setSel(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-8 rounded-2xl overflow-hidden border-4 border-amber-800/50 shadow-2xl">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const dark = (r + c) % 2 === 1;
            const isSel = sel?.r === r && sel?.c === c;
            const isTarget = myMoves.some((m) => m.tr === r && m.tc === c);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => click(r, c)}
                className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl leading-none ${
                  dark ? "bg-amber-700/80" : "bg-amber-100/90"
                } ${isSel ? "ring-4 ring-inset ring-emerald-400" : ""}`}
              >
                {cell && (
                  <span className={cell.color === "w" ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" : "text-slate-900"}>
                    {PIECE_GLYPH[cell.color + cell.type]}
                  </span>
                )}
                {isTarget && (
                  <span className={`absolute w-3 h-3 rounded-full ${board[r][c] ? "ring-2 ring-emerald-400 w-7 h-7 bg-transparent" : "bg-emerald-400/70"}`} />
                )}
              </button>
            );
          })
        )}
      </div>

      <p className="text-white/50 text-sm mt-4">
        {over
          ? over === "draw" ? "Ничья" : over === "w" ? "Ты победил!" : "Победила Ксюша"
          : turn === "w" ? "Твой ход (белые)" : "Ходит Ксюша…"}
      </p>

      {over && (
        <button
          onClick={reset}
          className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="RotateCcw" size={18} />
          Играть ещё раз
        </button>
      )}
    </div>
  );
}