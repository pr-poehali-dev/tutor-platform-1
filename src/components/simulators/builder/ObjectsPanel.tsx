import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { LIBRARY, LIBRARY_GROUPS, LOCATIONS } from "../library";
import { SceneObject, Simulator } from "../types";

interface Props {
  sim: Simulator;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onChange: (patch: Partial<Simulator>) => void;
}

const uid = (kind: string, taken: Set<string>) => {
  let i = 1;
  while (taken.has(`${kind}${i}`)) i++;
  return `${kind}${i}`;
};

/** Сцена: локация, добавление объектов из библиотеки, перемещение выбранного объекта. */
export default function ObjectsPanel({ sim, selected, onSelect, onChange }: Props) {
  const sel = sim.objects.find((o) => o.id === selected) || null;
  const used = new Set(sim.steps.flatMap((s) => [s.target, ...(s.traps || []).map((t) => t.object), s.effect?.object || ""]));

  const add = (kind: string) => {
    const id = uid(kind, new Set(sim.objects.map((o) => o.id)));
    const n = sim.objects.length;
    const pos: [number, number, number] = [((n % 5) - 2) * 0.6, 0, -0.6 + Math.floor(n / 5) * 0.7];
    onChange({ objects: [...sim.objects, { id, kind, label: LIBRARY[kind].label, pos }] });
    onSelect(id);
  };

  const update = (patch: Partial<SceneObject>) =>
    sel && onChange({ objects: sim.objects.map((o) => (o.id === sel.id ? { ...o, ...patch } : o)) });

  const setPos = (i: number, v: number) => {
    if (!sel) return;
    const pos = [...sel.pos] as [number, number, number];
    pos[i] = Math.round(v * 100) / 100;
    update({ pos });
  };

  const remove = () => {
    if (!sel) return;
    onChange({ objects: sim.objects.filter((o) => o.id !== sel.id) });
    onSelect(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/50">Локация</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(LOCATIONS).map(([id, l]) => (
            <button
              key={id}
              onClick={() => onChange({ location: id })}
              className={`rounded-lg px-2.5 py-1 text-xs ${sim.location === id ? "bg-violet-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {sel ? (
        <div className="space-y-3 rounded-xl border border-violet-400/40 bg-violet-500/10 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Выбран объект</p>
            <button onClick={() => onSelect(null)} className="text-white/50 hover:text-white" aria-label="Снять выбор">
              <Icon name="X" size={16} />
            </button>
          </div>
          <Input value={sel.label} onChange={(e) => update({ label: e.target.value })} className="bg-white/5" />
          {(["X — влево/вправо", "Y — высота", "Z — ближе/дальше"] as const).map((lbl, i) => (
            <div key={lbl}>
              <div className="mb-1 flex justify-between text-xs text-white/55">
                <span>{lbl}</span>
                <span>{sel.pos[i].toFixed(2)} м</span>
              </div>
              <Slider
                value={[sel.pos[i]]}
                min={i === 1 ? 0 : -2.5}
                max={i === 1 ? 2.2 : 2.5}
                step={0.05}
                onValueChange={([v]) => setPos(i, v)}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => setPos(1, 0.78)}
              className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs hover:bg-white/20"
              title="Поставить на высоту столешницы"
            >
              На стол
            </button>
            <button onClick={() => setPos(1, 0)} className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs hover:bg-white/20">
              На пол
            </button>
            <button
              onClick={() => update({ rot: ((sel.rot || 0) + Math.PI / 2) % (Math.PI * 2) })}
              className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs hover:bg-white/20"
            >
              Повернуть
            </button>
          </div>
          <button
            onClick={remove}
            disabled={used.has(sel.id)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-500/15 px-2 py-1.5 text-xs text-rose-200 hover:bg-rose-500/25 disabled:opacity-40"
            title={used.has(sel.id) ? "Объект используется в шагах — сначала уберите его из сценария" : ""}
          >
            <Icon name="Trash2" size={13} />
            {used.has(sel.id) ? "Используется в шагах" : "Удалить объект"}
          </button>
        </div>
      ) : (
        <p className="rounded-xl bg-white/5 p-3 text-xs text-white/55">Нажмите на объект в сцене, чтобы передвинуть, переименовать или удалить его.</p>
      )}

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/50">В сцене ({sim.objects.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {sim.objects.map((o) => (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              className={`rounded-md px-2 py-0.5 text-xs ${selected === o.id ? "bg-violet-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/50">Библиотека — нажмите, чтобы добавить</p>
        <div className="space-y-2">
          {LIBRARY_GROUPS.map((g) => (
            <div key={g}>
              <p className="mb-1 text-[11px] text-white/40">{g}</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(LIBRARY)
                  .filter(([, v]) => v.group === g)
                  .map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => add(k)}
                      className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5 text-xs text-white/75 hover:border-cyan-400/50 hover:text-white"
                    >
                      <Icon name="Plus" size={11} />
                      {v.label}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
