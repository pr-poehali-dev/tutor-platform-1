import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

function makeSolved(size: number): number[] {
  const n = size * size;
  return [...Array(n - 1)].map((_, i) => i + 1).concat(0);
}

function isSolved(b: number[], solved: number[]) {
  return b.every((v, i) => v === solved[i]);
}

function neighbors(i: number, size: number): number[] {
  const r = Math.floor(i / size);
  const c = i % size;
  const res: number[] = [];
  if (r > 0) res.push(i - size);
  if (r < size - 1) res.push(i + size);
  if (c > 0) res.push(i - 1);
  if (c < size - 1) res.push(i + 1);
  return res;
}

// Перемешиваем валидными ходами от решённого состояния — пазл всегда решаемый
function shuffle(size: number): number[] {
  const solved = makeSolved(size);
  const b = [...solved];
  let empty = b.length - 1;
  for (let n = 0; n < 200; n++) {
    const moves = neighbors(empty, size);
    const pick = moves[Math.floor(Math.random() * moves.length)];
    [b[empty], b[pick]] = [b[pick], b[empty]];
    empty = pick;
  }
  if (isSolved(b, solved)) return shuffle(size);
  return b;
}

export default function Fifteen({
  onSay,
  onWin,
  size = 4,
}: {
  onSay: (text: string) => void;
  onWin: () => void;
  size?: number;
}) {
  const solved = makeSolved(size);
  const [board, setBoard] = useState<number[]>(solved);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  const start = useCallback(() => {
    setBoard(shuffle(size));
    setMoves(0);
    setDone(false);
  }, [size]);

  useEffect(() => { start(); }, [start]);

  const click = (i: number) => {
    if (done) return;
    const empty = board.indexOf(0);
    if (!neighbors(empty, size).includes(i)) return;
    const next = [...board];
    [next[empty], next[i]] = [next[i], next[empty]];
    setBoard(next);
    setMoves((m) => m + 1);
    if (isSolved(next, solved)) {
      setDone(true);
      onSay("Ура! Ты собрал все числа по порядку! Это было непросто. Лови ЗНАЙКИ за смекалку!");
      onWin();
    }
  };

  const cell = size === 3 ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16 md:w-20 md:h-20";

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid gap-2 bg-white/5 p-2 rounded-3xl"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((v, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={v === 0 || done}
            className={`${cell} rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black transition-all ${
              v === 0
                ? "bg-transparent cursor-default"
                : "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg hover:scale-105"
            }`}
          >
            {v !== 0 && v}
          </button>
        ))}
      </div>

      <p className="text-white/50 text-sm mt-4">Ходов: {moves}</p>

      <button
        onClick={start}
        className="mt-3 inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-white/12 transition-colors"
      >
        <Icon name="Shuffle" size={16} />
        Перемешать заново
      </button>
    </div>
  );
}
