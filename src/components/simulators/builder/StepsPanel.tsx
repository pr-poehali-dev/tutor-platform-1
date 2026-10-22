import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { KIND_STATES } from "../library";
import { Simulator, Step } from "../types";

interface Props {
  sim: Simulator;
  onChange: (patch: Partial<Simulator>) => void;
  pickMode: { step: number; field: "target" | "trap" } | null;
  setPickMode: (m: { step: number; field: "target" | "trap" } | null) => void;
}

const sel = "w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white";

/** Сценарий из блоков: каждый шаг — задание, правильный объект, ловушки, результат. */
export default function StepsPanel({ sim, onChange, pickMode, setPickMode }: Props) {
  const [open, setOpen] = useState<number>(0);
  const objs = sim.objects.filter((o) => o.kind !== "table");
  const label = (id?: string) => sim.objects.find((o) => o.id === id)?.label || "— не выбран —";

  const setSteps = (steps: Step[]) => onChange({ steps: steps.map((s, i) => ({ ...s, id: `s${i + 1}` })) });
  const upd = (i: number, patch: Partial<Step>) => setSteps(sim.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const addStep = () => {
    const n = sim.steps.length;
    setSteps([...sim.steps, { id: `s${n + 1}`, title: `Шаг ${n + 1}`, instruction: "", target: objs[0]?.id || "", hint: "", traps: [] }]);
    setOpen(n);
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= sim.steps.length) return;
    const arr = [...sim.steps];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSteps(arr);
    setOpen(j);
  };
  const del = (i: number) => {
    setSteps(sim.steps.filter((_, j) => j !== i));
    setOpen(Math.max(0, i - 1));
  };

  return (
    <div className="space-y-2">
      {sim.steps.map((s, i) => {
        const isOpen = open === i;
        const problems = [!s.instruction.trim() && "нет задания", !sim.objects.some((o) => o.id === s.target) && "не выбран объект"].filter(Boolean);
        const effObj = sim.objects.find((o) => o.id === s.effect?.object);
        return (
          <div key={i} className={`rounded-xl border ${isOpen ? "border-cyan-400/40 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
            <div className="flex items-center gap-2 p-2.5">
              <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-200">{i + 1}</span>
                <span className="truncate text-sm font-semibold">{s.title || "Без названия"}</span>
                {problems.length > 0 && <Icon name="CircleAlert" size={14} className="shrink-0 text-amber-300" />}
                {(s.traps || []).some((t) => t.critical) && <Icon name="ShieldAlert" size={14} className="shrink-0 text-rose-300" />}
              </button>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-white/40 hover:text-white disabled:opacity-20" aria-label="Выше">
                <Icon name="ChevronUp" size={16} />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === sim.steps.length - 1} className="text-white/40 hover:text-white disabled:opacity-20" aria-label="Ниже">
                <Icon name="ChevronDown" size={16} />
              </button>
              <button onClick={() => del(i)} className="text-white/40 hover:text-rose-300" aria-label="Удалить шаг">
                <Icon name="Trash2" size={15} />
              </button>
            </div>

            {isOpen && (
              <div className="space-y-3 border-t border-white/10 p-3">
                <Input value={s.title} onChange={(e) => upd(i, { title: e.target.value })} placeholder="Название шага" className="bg-white/5" />
                <Textarea
                  value={s.instruction}
                  onChange={(e) => upd(i, { instruction: e.target.value })}
                  rows={2}
                  placeholder="Задание ученику: что нужно сделать"
                  className="bg-white/5"
                />

                <div className="rounded-lg bg-emerald-500/10 p-2.5">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
                    <Icon name="MousePointerClick" size={13} /> Правильное действие — нажать на
                  </p>
                  <div className="flex gap-1.5">
                    <select value={s.target} onChange={(e) => upd(i, { target: e.target.value })} className={sel}>
                      {!s.target && <option value="">— выберите объект —</option>}
                      {objs.map((o) => (
                        <option key={o.id} value={o.id} className="bg-slate-900">
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setPickMode(pickMode?.step === i && pickMode.field === "target" ? null : { step: i, field: "target" })}
                      className={`shrink-0 rounded-md px-2 text-xs ${pickMode?.step === i && pickMode.field === "target" ? "bg-emerald-500 text-white" : "bg-white/10 hover:bg-white/20"}`}
                      title="Выбрать кликом в сцене"
                    >
                      <Icon name="Crosshair" size={14} />
                    </button>
                  </div>
                  <Input
                    value={s.hint}
                    onChange={(e) => upd(i, { hint: e.target.value })}
                    placeholder="Подсказка: как найти объект"
                    className="mt-1.5 bg-white/5 text-sm"
                  />
                  <Textarea
                    value={s.explain || ""}
                    onChange={(e) => upd(i, { explain: e.target.value })}
                    rows={2}
                    placeholder="Почему так (покажется после верного действия)"
                    className="mt-1.5 bg-white/5 text-sm"
                  />
                </div>

                <div className="rounded-lg bg-white/5 p-2.5">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                    <Icon name="Sparkle" size={13} /> Результат шага (что изменится в сцене)
                  </p>
                  <div className="flex gap-1.5">
                    <select
                      value={s.effect?.object || ""}
                      onChange={(e) => {
                        const ob = sim.objects.find((o) => o.id === e.target.value);
                        const st = ob ? KIND_STATES[ob.kind]?.[0]?.id : undefined;
                        upd(i, { effect: ob && st ? { object: ob.id, state: st } : undefined });
                      }}
                      className={sel}
                    >
                      <option value="" className="bg-slate-900">
                        Ничего не меняется
                      </option>
                      {sim.objects
                        .filter((o) => KIND_STATES[o.kind])
                        .map((o) => (
                          <option key={o.id} value={o.id} className="bg-slate-900">
                            {o.label}
                          </option>
                        ))}
                    </select>
                    {effObj && KIND_STATES[effObj.kind] && (
                      <select
                        value={s.effect?.state}
                        onChange={(e) => upd(i, { effect: { object: effObj.id, state: e.target.value } })}
                        className={sel}
                      >
                        {KIND_STATES[effObj.kind].map((st) => (
                          <option key={st.id} value={st.id} className="bg-slate-900">
                            {st.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-amber-500/10 p-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
                      <Icon name="TriangleAlert" size={13} /> Типичные ошибки (ловушки)
                    </p>
                    <button
                      onClick={() => upd(i, { traps: [...(s.traps || []), { object: objs.find((o) => o.id !== s.target)?.id || "", feedback: "" }] })}
                      className="flex items-center gap-1 text-xs text-amber-200 hover:text-white"
                    >
                      <Icon name="Plus" size={12} /> добавить
                    </button>
                  </div>
                  {(s.traps || []).length === 0 && <p className="text-xs text-white/45">Нажатие на любой другой объект — обычная ошибка с подсказкой.</p>}
                  <div className="space-y-2">
                    {(s.traps || []).map((t, k) => {
                      const setTrap = (p: Partial<typeof t>) =>
                        upd(i, { traps: (s.traps || []).map((x, n) => (n === k ? { ...x, ...p } : x)) });
                      return (
                        <div key={k} className="space-y-1.5 rounded-md bg-black/20 p-2">
                          <div className="flex gap-1.5">
                            <select value={t.object} onChange={(e) => setTrap({ object: e.target.value })} className={sel}>
                              {objs
                                .filter((o) => o.id !== s.target)
                                .map((o) => (
                                  <option key={o.id} value={o.id} className="bg-slate-900">
                                    Нажал «{o.label}»
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => upd(i, { traps: (s.traps || []).filter((_, n) => n !== k) })}
                              className="shrink-0 text-white/40 hover:text-rose-300"
                              aria-label="Убрать ловушку"
                            >
                              <Icon name="X" size={15} />
                            </button>
                          </div>
                          <Input
                            value={t.feedback}
                            onChange={(e) => setTrap({ feedback: e.target.value })}
                            placeholder="Что сказать ученику: почему так нельзя"
                            className="bg-white/5 text-sm"
                          />
                          <label className="flex items-center gap-2 text-xs text-white/70">
                            <Switch checked={!!t.critical} onCheckedChange={(v) => setTrap({ critical: v })} />
                            Опасно для жизни — сразу «не сдано»
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-white/60">
                  <Icon name="Timer" size={13} />
                  Лимит времени, сек
                  <Input
                    type="number"
                    min={0}
                    value={s.timeLimit || ""}
                    onChange={(e) => upd(i, { timeLimit: Number(e.target.value) || undefined })}
                    placeholder="нет"
                    className="h-7 w-20 bg-white/5 text-xs"
                  />
                </label>
                {problems.length > 0 && <p className="text-xs text-amber-300">Нужно доделать: {problems.join(", ")}</p>}
                <p className="text-[11px] text-white/35">Правильный объект сейчас: «{label(s.target)}»</p>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={addStep}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/15 py-2.5 text-sm text-white/60 hover:border-cyan-400/50 hover:text-white"
      >
        <Icon name="Plus" size={15} /> Добавить шаг
      </button>
    </div>
  );
}
