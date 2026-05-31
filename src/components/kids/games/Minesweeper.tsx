import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

const N = 8;
const TRAPS = 10;

interface Tile {
  trap: boolean;
  open: boolean;
  flag: boolean;
  around: number;
}

function neighbors(i: number): number[] {
  const r = Math.floor(i / N);
  const c = i % N;
  const res: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N) res.push(nr * N + nc);
    }
  return res;
}

function makeField(): Tile[] {
  const tiles: Tile[] = [...Array(N * N)].map(() => ({
    trap: false,
    open: false,
    flag: false,
    around: 0,
  }));
  let placed = 0;
  while (placed < TRAPS) {
    const i = Math.floor(Math.random() * N * N);
    if (!tiles[i].trap) {
      tiles[i].trap = true;
      placed++;
    }
  }
  tiles.forEach((t, i) => {
    if (!t.trap) t.around = neighbors(i).filter((n) => tiles[n].trap).length;
  });
  return tiles;
}

const NUM_COLORS = [
  "",
  "text-sky-400",
  "text-emerald-400",
  "text-amber-400",
  "text-rose-400",
  "text-purple-400",
  "text-pink-400",
  "text-red-500",
  "text-white",
];

export default function Minesweeper({
  onSay,
  onWin,
}: {
  onSay: (text: string) => void;
  onWin: () => void;
}) {
  const [tiles, setTiles] = useState<Tile[]>(makeField);
  const [mode, setMode] = useState<"dig" | "flag">("dig");
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setTiles(makeField());
    setDone(false);
    onSay("Новое поле готово! Ищи клад и считай ловушки. Удачи!");
  }, [onSay]);

  const checkWin = (ts: Tile[]) => ts.every((t) => t.trap || t.open);

  const openTile = (start: number, ts: Tile[]): Tile[] => {
    const next = ts.map((t) => ({ ...t }));
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      const t = next[i];
      if (t.open || t.flag) continue;
      t.open = true;
      if (t.around === 0 && !t.trap) {
        neighbors(i).forEach((n) => {
          if (!next[n].open) stack.push(n);
        });
      }
    }
    return next;
  };

  const handle = (i: number) => {
    if (done) return;
    const t = tiles[i];

    if (mode === "flag") {
      if (t.open) return;
      setTiles((ts) => ts.map((x, j) => (j === i ? { ...x, flag: !x.flag } : x)));
      return;
    }

    if (t.open || t.flag) return;
    if (t.trap) {
      setDone(true);
      setTiles((ts) => ts.map((x) => ({ ...x, open: x.open || x.trap })));
      onSay("Ой, тут была ловушка! Не страшно, бывает. Давай попробуем заново!");
      setTimeout(reset, 1500);
      return;
    }
    const opened = openTile(i, tiles);
    setTiles(opened);
    if (checkWin(opened)) {
      setDone(true);
      onSay("Ура! Ты обошёл все ловушки и нашёл клад! Какой ты внимательный! Лови ЗНАЙКИ!");
      onWin();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode("dig")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
            mode === "dig" ? "bg-amber-400/20 border border-amber-400/50 text-amber-200" : "bg-white/5 border border-white/10 text-white/60"
          }`}
        >
          <Icon name="Pickaxe" size={15} fallback="Hammer" />
          Копать
        </button>
        <button
          onClick={() => setMode("flag")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
            mode === "flag" ? "bg-rose-400/20 border border-rose-400/50 text-rose-200" : "bg-white/5 border border-white/10 text-white/60"
          }`}
        >
          <Icon name="Flag" size={15} />
          Флажок
        </button>
      </div>

      <div
        className="grid gap-1 bg-white/5 p-2 rounded-3xl"
        style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
      >
        {tiles.map((t, i) => (
          <button
            key={i}
            onClick={() => handle(i)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!t.open && !done) setTiles((ts) => ts.map((x, j) => (j === i ? { ...x, flag: !x.flag } : x)));
            }}
            disabled={done}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-sm md:text-base font-black transition-colors ${
              t.open
                ? t.trap
                  ? "bg-rose-500/40"
                  : "bg-white/10"
                : "bg-gradient-to-br from-rose-400 to-red-500 hover:brightness-110"
            }`}
          >
            {t.open ? (
              t.trap ? "💥" : t.around > 0 ? <span className={NUM_COLORS[t.around]}>{t.around}</span> : ""
            ) : t.flag ? (
              "🚩"
            ) : (
              ""
            )}
          </button>
        ))}
      </div>

      <button
        onClick={reset}
        className="mt-4 inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-white/12 transition-colors"
      >
        <Icon name="RotateCcw" size={16} />
        Новая игра
      </button>
    </div>
  );
}
