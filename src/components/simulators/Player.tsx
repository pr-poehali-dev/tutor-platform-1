import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import Scene3D, { enterVR, vrSupported } from "./Scene3D";
import { Mistake, RunResult, Simulator, scoreRun } from "./types";

interface Props {
  sim: Simulator;
  onFinish?: (r: RunResult) => void;
  compact?: boolean;
}

type Feedback = { kind: "ok" | "bad" | "critical" | "info"; text: string } | null;

/** Прохождение тренажёра: шаги, реакция на ошибки, подсказки, итоговая оценка. */
export default function Player({ sim, onFinish, compact }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [states, setStates] = useState<Record<string, string>>({});
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [vrOk, setVrOk] = useState(false);
  const started = useRef(Date.now());
  const stepStarted = useRef(Date.now());
  const stepTimes = useRef<Record<string, number>>({});
  const overtime = useRef(0);

  const step = sim.steps[stepIdx];
  const total = sim.steps.length;

  useEffect(() => {
    vrSupported().then(setVrOk);
  }, []);

  const restart = () => {
    setStepIdx(0);
    setStates({});
    setMistakes([]);
    setHints(0);
    setShowHint(false);
    setFeedback(null);
    setResult(null);
    started.current = Date.now();
    stepStarted.current = Date.now();
    stepTimes.current = {};
    overtime.current = 0;
  };

  const finish = (allMistakes: Mistake[]) => {
    const durationSec = Math.round((Date.now() - started.current) / 1000);
    const { score, passed } = scoreRun(total, allMistakes, hints, overtime.current, sim.passScore);
    const r: RunResult = { score, passed, durationSec, mistakes: allMistakes, hints, stepTimes: stepTimes.current };
    setResult(r);
    onFinish?.(r);
  };

  const pick = (id: string) => {
    if (!step || result) return;
    if (id === step.target) {
      const spent = Math.round((Date.now() - stepStarted.current) / 1000);
      stepTimes.current[step.id] = spent;
      if (step.timeLimit && spent > step.timeLimit) overtime.current += 1;
      setFlash({ id, ok: true });
      const eff = step.effect;
      setStates((s) => ({ ...s, ...(eff ? { [eff.object]: eff.state } : { [id]: s[id] || "done" }) }));
      setFeedback({ kind: "ok", text: step.explain || "Верно!" });
      setShowHint(false);
      stepStarted.current = Date.now();
      if (stepIdx + 1 >= total) {
        setTimeout(() => finish(mistakes), 900);
      } else setStepIdx(stepIdx + 1);
    } else {
      const trap = step.traps?.find((t) => t.object === id);
      const m: Mistake = { step: step.id, object: id, critical: !!trap?.critical };
      setMistakes((prev) => [...prev, m]);
      setFlash({ id, ok: false });
      setFeedback({
        kind: trap?.critical ? "critical" : "bad",
        text: trap?.feedback || `Не то. ${step.hint}`,
      });
    }
    setTimeout(() => setFlash(null), 700);
  };

  const askHint = () => {
    setHints((h) => h + 1);
    setShowHint(true);
  };

  const fbColor = useMemo(
    () =>
      ({
        ok: "bg-emerald-500/90 text-white",
        bad: "bg-amber-500/90 text-black",
        critical: "bg-rose-600/95 text-white",
        info: "bg-white/90 text-black",
      }) as const,
    [],
  );

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black ${compact ? "h-[420px]" : "h-[70vh] min-h-[480px]"}`}>
      <Scene3D
        location={sim.location}
        objects={sim.objects}
        states={states}
        highlight={showHint ? step?.target : null}
        flash={flash}
        onPick={pick}
      />

      {/* Верхняя панель: шаг и задание */}
      {!result && step && (
        <div className="pointer-events-none absolute inset-x-0 top-0 p-3">
          <div className="pointer-events-auto mx-auto max-w-2xl rounded-xl bg-black/70 p-3 text-white backdrop-blur">
            <div className="mb-1 flex items-center gap-2 text-xs text-white/60">
              <span>
                Шаг {stepIdx + 1} из {total}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded bg-white/10">
                <div className="h-full bg-sky-400 transition-all" style={{ width: `${(stepIdx / total) * 100}%` }} />
              </div>
              <span>Ошибок: {mistakes.length}</span>
            </div>
            <p className="font-semibold">{step.title}</p>
            <p className="text-sm text-white/85">{step.instruction}</p>
          </div>
        </div>
      )}

      {/* Реакция тренажёра */}
      {feedback && !result && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-3">
          <div className={`max-w-xl rounded-xl px-4 py-2 text-sm shadow-lg ${fbColor[feedback.kind]}`}>
            {feedback.kind === "critical" && <b>Критическая ошибка. </b>}
            {feedback.text}
          </div>
        </div>
      )}

      {/* Нижние кнопки */}
      {!result && (
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-2 p-3">
          <Button size="sm" onClick={askHint} className="bg-white/15 text-white backdrop-blur hover:bg-white/25">
            <Icon name="Lightbulb" size={14} className="mr-1" />
            Подсказка
          </Button>
          <Button size="sm" onClick={restart} className="bg-white/15 text-white backdrop-blur hover:bg-white/25">
            <Icon name="RotateCcw" size={14} className="mr-1" />
            Заново
          </Button>
          {vrOk && (
            <Button size="sm" onClick={() => enterVR()} className="bg-violet-600 text-white hover:bg-violet-700">
              <Icon name="Glasses" size={14} className="mr-1" />
              Войти в VR
            </Button>
          )}
          <span className="hidden text-xs text-white/50 md:inline">Крутите сцену мышью или пальцем · нажмите на объект</span>
        </div>
      )}

      {/* Итог */}
      {result && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0f172a] p-6 text-white">
            <div className="mb-3 flex items-center gap-3">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black ${
                  result.passed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {result.score}
              </div>
              <div>
                <p className="text-lg font-bold">{result.passed ? "Навык освоен" : "Нужно повторить"}</p>
                <p className="text-sm text-white/60">
                  {Math.floor(result.durationSec / 60)}:{String(result.durationSec % 60).padStart(2, "0")} · ошибок {result.mistakes.length} · подсказок{" "}
                  {result.hints}
                </p>
              </div>
            </div>
            {result.mistakes.length > 0 && (
              <div className="mb-4 space-y-1 text-sm">
                <p className="text-white/60">Где ошиблись:</p>
                {result.mistakes.slice(0, 5).map((m, i) => {
                  const st = sim.steps.find((s) => s.id === m.step);
                  const obj = sim.objects.find((o) => o.id === m.object);
                  return (
                    <p key={i} className={m.critical ? "text-rose-300" : "text-amber-200"}>
                      • {st?.title}: выбран «{obj?.label}»{m.critical ? " — критично" : ""}
                    </p>
                  );
                })}
              </div>
            )}
            <Button onClick={restart} className="w-full bg-primary text-primary-foreground">
              <Icon name="RotateCcw" size={16} className="mr-1" />
              Пройти ещё раз
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
