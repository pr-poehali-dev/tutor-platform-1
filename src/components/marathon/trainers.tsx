import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Таблица Шульте: найти числа по порядку. */
export function SchulteTable() {
  const [size, setSize] = useState(5);
  const total = size * size;
  const [nums, setNums] = useState(() => shuffle(Array.from({ length: 25 }, (_, i) => i + 1)));
  const [next, setNext] = useState(1);
  const [start, setStart] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [miss, setMiss] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(() => {
    const v = Number(localStorage.getItem(`schulte_best_${5}`) || 0);
    return v || null;
  });

  const reset = (s = size) => {
    setSize(s);
    setNums(shuffle(Array.from({ length: s * s }, (_, i) => i + 1)));
    setNext(1);
    setStart(null);
    setResult(null);
    const v = Number(localStorage.getItem(`schulte_best_${s}`) || 0);
    setBest(v || null);
  };

  const click = (n: number) => {
    if (result) return;
    if (n !== next) {
      setMiss(n);
      setTimeout(() => setMiss(null), 250);
      return;
    }
    const now = performance.now();
    if (n === 1) setStart(now);
    if (n === total) {
      const sec = Math.round(((now - (start ?? now)) / 1000) * 10) / 10;
      setResult(sec);
      if (!best || sec < best) {
        setBest(sec);
        try { localStorage.setItem(`schulte_best_${size}`, String(sec)); } catch { /* noop */ }
      }
    }
    setNext(n + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {[3, 4, 5].map((s) => (
            <button key={s} onClick={() => reset(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${size === s ? "bg-violet-500/30 border-violet-400/60 text-white" : "border-white/10 text-white/60"}`}>
              {s}×{s}
            </button>
          ))}
        </div>
        <p className="text-white/70 text-sm">
          Найдите: <b className="text-white text-lg">{Math.min(next, total)}</b>
          {best && <span className="text-white/45 ml-3">рекорд {best} с</span>}
        </p>
      </div>
      <div className="grid gap-1.5 mx-auto max-w-sm" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {nums.map((n) => (
          <button
            key={n}
            onClick={() => click(n)}
            className={`aspect-square rounded-lg font-montserrat font-black text-lg md:text-xl transition-colors ${
              n < next ? "bg-emerald-500/20 text-emerald-200/60" : miss === n ? "bg-rose-500/40 text-white" : "bg-white/[0.07] text-white hover:bg-white/[0.12]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {result && (
        <div className="mt-4 text-center">
          <p className="text-white font-bold">Время: {result} с {best === result && "— новый рекорд!"}</p>
          <button onClick={() => reset()} className="mt-2 inline-flex items-center gap-1.5 text-cyan-300 text-sm font-bold"><Icon name="RotateCcw" size={14} />Ещё раз</button>
        </div>
      )}
    </div>
  );
}

const WEDGE = ["кот", "кот спит", "рыжий кот спит", "рыжий кот спит на окне", "рыжий кот сладко спит на окне", "рыжий кот сладко спит на тёплом окне"];

/** Клин: читаем строку целиком, глядя в центр. */
export function Wedge() {
  const [shown, setShown] = useState(1);
  return (
    <div className="text-center">
      <div className="relative py-4 space-y-2.5">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/30" aria-hidden="true" />
        {WEDGE.slice(0, shown).map((line) => (
          <p key={line} className="relative text-white text-lg md:text-xl">
            <span className="bg-[#120c25] px-1">{line}</span>
          </p>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-2">
        {shown < WEDGE.length ? (
          <button onClick={() => setShown((s) => s + 1)} className="inline-flex items-center gap-1.5 bg-violet-500/25 border border-violet-400/40 text-white text-sm font-bold px-4 py-2 rounded-xl">
            Следующая строка <Icon name="ChevronDown" size={14} />
          </button>
        ) : (
          <button onClick={() => setShown(1)} className="inline-flex items-center gap-1.5 text-cyan-300 text-sm font-bold"><Icon name="RotateCcw" size={14} />Сначала</button>
        )}
      </div>
    </div>
  );
}

const FLASH_WORDS = ["кошка", "ложка", "мышка", "книга", "школа", "шишка", "лампа", "лапка", "сосна", "весна", "ракета", "конфета", "пенал", "пенёк", "облако", "яблоко"];

/** Флеш-слова: слово показывается на мгновение, нужно выбрать увиденное. */
export function FlashWords() {
  const [ms, setMs] = useState(500);
  const [word, setWord] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState({ ok: 0, all: 0 });
  const [answer, setAnswer] = useState<string | null>(null);
  const timeout = useRef<number | null>(null);

  useEffect(() => () => { if (timeout.current) window.clearTimeout(timeout.current); }, []);

  const round = () => {
    const w = FLASH_WORDS[Math.floor(Math.random() * FLASH_WORDS.length)];
    setWord(w);
    setAnswer(null);
    setOptions(shuffle([w, ...shuffle(FLASH_WORDS.filter((x) => x !== w)).slice(0, 3)]));
    setVisible(true);
    timeout.current = window.setTimeout(() => setVisible(false), ms);
  };

  const pick = (o: string) => {
    if (answer || visible) return;
    setAnswer(o);
    const ok = o === word;
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), all: s.all + 1 }));
    if (ok && ms > 150) setMs((m) => m - 50);
  };

  const label = useMemo(() => `${(ms / 1000).toFixed(2).replace(".", ",")} с`, [ms]);

  return (
    <div className="text-center">
      <p className="text-white/50 text-xs mb-2">Время показа: {label} · верно {score.ok} из {score.all}</p>
      <div className="h-20 flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 mb-4">
        {visible ? <span className="font-montserrat font-black text-white text-3xl">{word}</span> : <span className="text-white/25 text-2xl">•</span>}
      </div>
      {word && !visible && (
        <div className="grid grid-cols-2 gap-2 mb-4 max-w-sm mx-auto">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => pick(o)}
              className={`py-2.5 rounded-xl text-sm font-bold border ${
                answer ? (o === word ? "bg-emerald-500/25 border-emerald-400/50 text-white" : o === answer ? "bg-rose-500/25 border-rose-400/50 text-white" : "border-white/10 text-white/50") : "border-white/15 text-white hover:border-white/30"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {(!word || answer) && (
        <button onClick={round} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl">
          <Icon name="Zap" size={15} /> {word ? "Следующее слово" : "Показать слово"}
        </button>
      )}
    </div>
  );
}
