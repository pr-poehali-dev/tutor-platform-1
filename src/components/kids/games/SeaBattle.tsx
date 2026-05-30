import { useState, useCallback, useEffect } from "react";
import Icon from "@/components/ui/icon";

const SIZE = 6;
const SHIPS = [3, 2, 2, 1, 1]; // длины кораблей

type CellState = "hidden" | "miss" | "hit";

function place(): boolean[] {
  // true = есть часть корабля
  const grid = Array(SIZE * SIZE).fill(false);
  for (const len of SHIPS) {
    let placed = false;
    let tries = 0;
    while (!placed && tries < 200) {
      tries++;
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      const cells: number[] = [];
      let ok = true;
      for (let k = 0; k < len; k++) {
        const rr = r + (horiz ? 0 : k);
        const cc = c + (horiz ? k : 0);
        if (rr >= SIZE || cc >= SIZE) { ok = false; break; }
        // проверка соседей (корабли не касаются)
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = rr + dr, nc = cc + dc;
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr * SIZE + nc]) {
              ok = false;
            }
          }
        }
        cells.push(rr * SIZE + cc);
      }
      if (ok) {
        cells.forEach((i) => (grid[i] = true));
        placed = true;
      }
    }
  }
  return grid;
}

const TOTAL_DECKS = SHIPS.reduce((a, b) => a + b, 0);

export default function SeaBattle({
  onSay,
  onWin,
}: {
  onSay: (text: string) => void;
  onWin: () => void;
}) {
  const [ships, setShips] = useState<boolean[]>(place);
  const [cells, setCells] = useState<CellState[]>(Array(SIZE * SIZE).fill("hidden"));
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setShips(place());
    setCells(Array(SIZE * SIZE).fill("hidden"));
    setHits(0);
    setShots(0);
    setDone(false);
  }, []);

  useEffect(() => {
    if (hits >= TOTAL_DECKS && hits > 0 && !done) {
      setDone(true);
      onSay("Ура! Ты потопил все мои корабли! Ты настоящий капитан! Лови ЗНАЙКИ!");
      onWin();
    }
  }, [hits, done, onSay, onWin]);

  const fire = (i: number) => {
    if (done || cells[i] !== "hidden") return;
    const next = [...cells];
    setShots((s) => s + 1);
    if (ships[i]) {
      next[i] = "hit";
      setHits((h) => h + 1);
      onSay("Попал! Отличный выстрел!");
    } else {
      next[i] = "miss";
      onSay("Мимо! Попробуй другую клеточку.");
    }
    setCells(next);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid gap-1.5 bg-cyan-500/10 p-3 rounded-3xl" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
        {cells.map((st, i) => (
          <button
            key={i}
            onClick={() => fire(i)}
            disabled={st !== "hidden" || done}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
              st === "hidden"
                ? "bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/30 hover:from-cyan-400/50 hover:to-blue-500/50"
                : st === "hit"
                ? "bg-rose-500/80 border border-rose-300"
                : "bg-blue-900/50 border border-blue-400/30"
            }`}
          >
            {st === "hit" && "🔥"}
            {st === "miss" && <span className="w-2 h-2 rounded-full bg-cyan-200/70" />}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm text-white/60">
        <span>🎯 Попаданий: {hits} / {TOTAL_DECKS}</span>
        <span>💥 Выстрелов: {shots}</span>
      </div>

      <button
        onClick={reset}
        className="mt-3 inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-white/12 transition-colors"
      >
        <Icon name="RotateCcw" size={16} />
        Новая игра
      </button>
    </div>
  );
}
