import { FaceMap } from "./personaTypes";

interface Props {
  face: FaceMap;
  onChange: (f: FaceMap) => void;
}

const ROWS: { key: keyof FaceMap; label: string; min: number; max: number; hint: string }[] = [
  { key: "eyesY", label: "Глаза — высота", min: 10, max: 70, hint: "Опустите линию точно на глаза" },
  { key: "eyeLeftX", label: "Левый глаз", min: 10, max: 60, hint: "Сдвиньте на зрачок левого глаза" },
  { key: "eyeRightX", label: "Правый глаз", min: 40, max: 90, hint: "Сдвиньте на зрачок правого глаза" },
  { key: "eyeW", label: "Ширина глаза", min: 4, max: 26, hint: "Чуть шире самого глаза" },
  { key: "eyeH", label: "Высота глаза", min: 2, max: 16, hint: "Высота века при моргании" },
  { key: "mouthY", label: "Рот — высота", min: 30, max: 90, hint: "Точно на линию губ" },
  { key: "mouthX", label: "Рот — центр", min: 20, max: 80, hint: "Обычно ровно посередине" },
  { key: "mouthW", label: "Ширина рта", min: 6, max: 40, hint: "По ширине губ" },
];

/**
 * Настройка положения глаз и рта под конкретный портрет.
 *
 * Каждое фото уникально: лицо смещено, повёрнуто, снято крупнее или мельче.
 * Ползунки позволяют совместить анимацию с чертами лица за минуту,
 * а рамки в превью показывают, куда именно попадут губы и веки.
 */
export default function PersonaFaceTuner({ face, onChange }: Props) {
  return (
    <div className="space-y-3">
      {ROWS.map((r) => (
        <div key={r.key}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/75 font-medium">{r.label}</span>
            <span className="text-white/40 tabular-nums">{face[r.key].toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={r.min}
            max={r.max}
            step={0.5}
            value={face[r.key]}
            onChange={(e) => onChange({ ...face, [r.key]: Number(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="text-[10px] text-white/35 mt-0.5">{r.hint}</div>
        </div>
      ))}
    </div>
  );
}
