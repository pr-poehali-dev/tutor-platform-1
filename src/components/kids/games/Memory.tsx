import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const EMOJIS = ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨"];

interface Card {
  id: number;
  emoji: string;
  open: boolean;
  matched: boolean;
}

function makeDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, id) => ({ id, emoji, open: false, matched: false }));
}

export default function Memory({
  onSay,
  onWin,
}: {
  onSay: (text: string) => void;
  onWin: () => void;
}) {
  const [cards, setCards] = useState<Card[]>(makeDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [won, setWon] = useState(false);

  const reset = useCallback(() => {
    setCards(makeDeck());
    setFlipped([]);
    setMoves(0);
    setBusy(false);
    setWon(false);
  }, []);

  useEffect(() => {
    if (!won && cards.length && cards.every((c) => c.matched)) {
      setWon(true);
      onSay("Ура! Ты нашёл все пары! Какая у тебя память! Лови ЗНАЙКИ за победу!");
      onWin();
    }
  }, [cards, won, onSay, onWin]);

  const click = (id: number) => {
    if (busy || won) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.open || card.matched) return;

    const nextFlipped = [...flipped, id];
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, open: true } : c)));
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setBusy(true);
      const [a, b] = nextFlipped;
      const ca = cards.find((c) => c.id === a);
      const cb = cards.find((c) => c.id === b);
      if (ca && cb && ca.emoji === cb.emoji) {
        setTimeout(() => {
          setCards((cs) =>
            cs.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c))
          );
          setFlipped([]);
          setBusy(false);
        }, 400);
      } else {
        setTimeout(() => {
          setCards((cs) =>
            cs.map((c) => (c.id === a || c.id === b ? { ...c, open: false } : c))
          );
          setFlipped([]);
          setBusy(false);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-3xl">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => click(c.id)}
            disabled={c.open || c.matched || busy || won}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl transition-all ${
              c.open || c.matched
                ? c.matched
                  ? "bg-emerald-500/20 border-2 border-emerald-400"
                  : "bg-white/10"
                : "bg-gradient-to-br from-fuchsia-500 to-purple-600 hover:scale-105 text-white/80"
            }`}
          >
            {c.open || c.matched ? c.emoji : "?"}
          </button>
        ))}
      </div>

      <p className="text-white/50 text-sm mt-4">Ходов: {moves}</p>

      <button
        onClick={reset}
        className="mt-3 inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-white/12 transition-colors"
      >
        <Icon name="RotateCcw" size={16} />
        Играть ещё раз
      </button>
    </div>
  );
}
