import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const PADS = [
  { id: 0, base: "bg-green-600", lit: "bg-green-300" },
  { id: 1, base: "bg-red-600", lit: "bg-red-300" },
  { id: 2, base: "bg-yellow-500", lit: "bg-yellow-200" },
  { id: 3, base: "bg-blue-600", lit: "bg-blue-300" },
];

const WIN_ROUND = 5;

export default function Simon({
  onSay,
  onWin,
}: {
  onSay: (text: string) => void;
  onWin: () => void;
}) {
  const [seq, setSeq] = useState<number[]>([]);
  const [step, setStep] = useState(0); // позиция игрока в повторе
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false); // показ последовательности
  const [started, setStarted] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const timers = useRef<number[]>([]);

  const round = seq.length;

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const playSeq = useCallback((s: number[]) => {
    setPlaying(true);
    setStep(0);
    clearTimers();
    s.forEach((pad, i) => {
      timers.current.push(
        window.setTimeout(() => setActive(pad), 600 * i + 300)
      );
      timers.current.push(
        window.setTimeout(() => setActive(null), 600 * i + 700)
      );
    });
    timers.current.push(
      window.setTimeout(() => setPlaying(false), 600 * s.length + 300)
    );
  }, []);

  const nextRound = useCallback(
    (prev: number[]) => {
      const s = [...prev, Math.floor(Math.random() * 4)];
      setSeq(s);
      playSeq(s);
    },
    [playSeq]
  );

  const start = () => {
    setStarted(true);
    setRewarded(false);
    nextRound([]);
  };

  const click = (pad: number) => {
    if (playing || !started) return;
    setActive(pad);
    setTimeout(() => setActive(null), 200);

    if (seq[step] !== pad) {
      onSay(`Ой, не та кнопочка! Ты дошёл до ${round} шагов — это здорово! Попробуем ещё разок?`);
      setStarted(false);
      setSeq([]);
      setStep(0);
      return;
    }

    const ns = step + 1;
    if (ns === seq.length) {
      if (seq.length >= WIN_ROUND && !rewarded) {
        setRewarded(true);
        onSay(`Невероятно! Ты повторил ${seq.length} кнопочек! Какая память! Лови ЗНАЙКИ!`);
        onWin();
      }
      setTimeout(() => nextRound(seq), 700);
    } else {
      setStep(ns);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-white/60 text-sm mb-3">Раунд: {round}</p>
      <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-3xl">
        {PADS.map((p) => (
          <button
            key={p.id}
            onClick={() => click(p.id)}
            disabled={playing || !started}
            className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl transition-all ${
              active === p.id ? p.lit + " scale-95" : p.base
            } ${!playing && started ? "hover:brightness-110" : ""} disabled:cursor-default`}
          />
        ))}
      </div>

      <p className="text-white/50 text-sm mt-4 h-5">
        {playing ? "Смотри внимательно…" : started ? "Повтори последовательность!" : ""}
      </p>

      {!started && (
        <button
          onClick={start}
          className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="Play" size={18} />
          {seq.length ? "Начать заново" : "Начать игру"}
        </button>
      )}
    </div>
  );
}
