import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const SIZE = 4;
const SOLVED = [...Array(15)].map((_, i) => i + 1).concat(0);

function isSolved(b: number[]) {
  return b.every((v, i) => v === SOLVED[i]);
}

// Перемешиваем валидными ходами от решённого состояния — пазл всегда решаемый
function shuffle(): number[] {
  const b = [...SOLVED];
  let empty = 15;
  for (let n = 0; n < 200; n++) {
    const moves = neighbors(empty);
    const pick = moves[Math.floor(Math.random() * moves.length)];
    [b[empty], b[pick]] = [b[pick], b[empty]];
    empty = pick;
  }
  if (isSolved(b)) return shuffle();
  return b;
}

function neighbors(i: number): number[] {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  const res: number[] = [];
  if (r > 0) res.push(i - SIZE);
  if (r < SIZE - 1) res.push(i + SIZE);
  if (c > 0) res.push(i - 1);
  if (c < SIZE - 1) res.push(i + 1);
  return res;
}

export default function Fifteen({
  onSay,
  onWin,
}: {
  onSay: (text: string) => void;
  onWin: () => void;
}) {
  const [board, setBoard] = useState<number[]>(SOLVED);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  const start = useCallback(() => {
    setBoard(shuffle());
    setMoves(0);
    setDone(false);
  }, []);

  useEffect(() => { start(); }, [start]);

  const click = (i: number) => {
    if (done) return;
    const empty = board.indexOf(0);
    if (!neighbors(empty).includes(i)) return;
    const next = [...board];
    [next[empty], next[i]] = [next[i], next[empty]];
    setBoard(next);
    setMoves((m) => m + 1);
    if (isSolved(next)) {
      setDone(true);
      onSay("Ура! Ты собрал все числа по порядку! Это было непросто. Лови ЗНАЙКИ за смекалку!");
      onWin();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-3xl">
        {board.map((v, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={v === 0 || done}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black transition-all ${
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
