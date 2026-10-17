import { useRef, useState } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import { haptic } from "./maxBridge";

const HW_URL = (func2url as Record<string, string>)["homework"];

const MODES = [
  { v: "explain", label: "Объясни ход", hint: "План и первый шаг, ответ — за тобой" },
  { v: "review", label: "Проверь моё", hint: "Найдёт ошибки в твоём решении" },
  { v: "solve", label: "Реши по шагам", hint: "Полное решение с объяснением" },
] as const;

const SUBJECTS = [
  { v: "math", label: "Математика" },
  { v: "russian", label: "Русский" },
  { v: "physics", label: "Физика" },
  { v: "chemistry", label: "Химия" },
  { v: "biology", label: "Биология" },
  { v: "english", label: "Английский" },
  { v: "history", label: "История" },
  { v: "society", label: "Обществознание" },
  { v: "geography", label: "География" },
  { v: "literature", label: "Литература" },
  { v: "cs", label: "Информатика" },
];

function gradeBand(grade?: string | null): string {
  const g = Number(grade);
  return !g ? "5-9" : g <= 4 ? "1-4" : g <= 9 ? "5-9" : "10-11";
}

/** Сжимаем фото на телефоне: большие снимки камеры долго грузятся по мобильной сети. */
function compress(file: File): Promise<{ b64: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1600;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const data = c.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(url);
      resolve({ b64: data.split(",")[1], preview: data });
    };
    img.onerror = () => reject(new Error("Не удалось открыть фото"));
    img.src = url;
  });
}

export default function HomeworkTab({ token, grade }: { token: string | null; grade?: string | null }) {
  const [mode, setMode] = useState<(typeof MODES)[number]["v"]>("explain");
  const [subject, setSubject] = useState("math");
  const [photo, setPhoto] = useState<{ b64: string; preview: string } | null>(null);
  const [result, setResult] = useState("");
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (f?: File) => {
    if (!f) return;
    setError("");
    setResult("");
    try {
      setPhoto(await compress(f));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось открыть фото");
    }
  };

  const check = async () => {
    if (!photo || busy) return;
    haptic("medium");
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${HW_URL}?action=check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        body: JSON.stringify({ image_base64: photo.b64, content_type: "image/jpeg", mode, subject, grade: gradeBand(grade) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Не удалось разобрать фото");
      setResult(d.result || "");
      setVerdict(typeof d.is_correct === "boolean" ? d.is_correct : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Нет связи. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setPhoto(null);
    setResult("");
    setVerdict(null);
  };

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <div>
        <h1 className="text-xl font-bold">Домашка по фото</h1>
        <p className="text-xs text-white/50">Сфотографируй задание — разберём вместе</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button
            key={m.v}
            onClick={() => setMode(m.v)}
            className={`rounded-2xl border px-2 py-3 text-center text-sm font-semibold ${
              mode === m.v ? "border-primary bg-primary/20 text-white" : "border-white/10 bg-white/[0.04] text-white/70"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="-mt-2 text-xs text-white/50">{MODES.find((m) => m.v === mode)!.hint}</p>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {SUBJECTS.map((s) => (
          <button
            key={s.v}
            onClick={() => setSubject(s.v)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm ${subject === s.v ? "bg-white text-background" : "bg-white/10 text-white/75"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />

      {!photo ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/10 active:bg-primary/20"
        >
          <Icon name="Camera" size={40} className="text-primary" />
          <span className="text-base font-semibold">Сфотографировать задание</span>
          <span className="text-xs text-white/50">или выбрать из галереи</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <img src={photo.preview} alt="Задание" className="max-h-72 w-full object-contain bg-black/40" />
            <button onClick={reset} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/60" aria-label="Убрать фото">
              <Icon name="X" size={18} />
            </button>
          </div>
          {!result && (
            <button
              onClick={check}
              disabled={busy}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Icon name="Loader2" size={20} className="animate-spin" /> : <Icon name="Sparkles" size={20} />}
              {busy ? "Разбираю… до 30 секунд" : "Разобрать"}
            </button>
          )}
        </div>
      )}

      {error && <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p>}

      {result && (
        <div className="space-y-3">
          {verdict !== null && (
            <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${verdict ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-400/15 text-amber-200"}`}>
              {verdict ? "Решение верное!" : "Есть ошибки — смотри разбор"}
            </p>
          )}
          <div className="whitespace-pre-wrap rounded-3xl bg-white/[0.06] p-4 text-[15px] leading-relaxed">{result}</div>
          <button onClick={reset} className="h-12 w-full rounded-2xl bg-white/10 font-semibold">
            Следующее задание
          </button>
        </div>
      )}
    </div>
  );
}
