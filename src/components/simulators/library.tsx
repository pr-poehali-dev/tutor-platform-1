import { LibItem } from "./library/shared";
import { PHYSICS_SAFETY_ITEMS } from "./library/physicsSafety";
import { PROFESSIONS_ITEMS } from "./library/professions";
import { BIOLOGY_COMMON_ITEMS } from "./library/biologyCommon";

export const LIBRARY: Record<string, LibItem> = {
  ...PHYSICS_SAFETY_ITEMS,
  ...PROFESSIONS_ITEMS,
  ...BIOLOGY_COMMON_ITEMS,
};

export const LOCATIONS: Record<string, { label: string; floor: string; wall: string; sky: string }> = {
  lab: { label: "Учебная лаборатория", floor: "#d6d3d1", wall: "#e0f2fe", sky: "#0f172a" },
  classroom: { label: "Класс", floor: "#c4a484", wall: "#fef3c7", sky: "#0f172a" },
  workshop: { label: "Мастерская / цех", floor: "#52525b", wall: "#a1a1aa", sky: "#18181b" },
  office: { label: "Офис / коридор", floor: "#9ca3af", wall: "#f1f5f9", sky: "#0f172a" },
  outdoor: { label: "Улица", floor: "#4d7c0f", wall: "#bae6fd", sky: "#7dd3fc" },
};

/** Во что может превратиться объект после действия — для блока «Результат шага». */
export const KIND_STATES: Record<string, { id: string; label: string }[]> = {
  switch: [{ id: "on", label: "замкнут" }],
  bulb: [{ id: "on", label: "горит" }],
  ammeter: [{ id: "on", label: "показывает ток" }],
  wire: [{ id: "on", label: "под током" }],
  extinguisher: [{ id: "pinned", label: "чека снята" }],
  fire: [{ id: "out", label: "потушен" }],
  alarm: [{ id: "on", label: "тревога включена" }],
  door: [{ id: "open", label: "открыта" }],
  phone: [{ id: "on", label: "идёт звонок" }],
  victim: [{ id: "bandaged", label: "наложена повязка" }],
  gloves: [{ id: "worn", label: "надеты" }],
  welder: [{ id: "on", label: "включён" }],
  mask: [{ id: "worn", label: "надета" }],
  metal: [{ id: "welded", label: "сварены" }],
  panel: [{ id: "off", label: "отключён" }],
  tester: [{ id: "on", label: "индикатор горит" }],
  lock: [{ id: "placed", label: "повешен" }],
  console: [{ id: "on", label: "включён" }],
  machine: [
    { id: "on", label: "работает" },
    { id: "stopped", label: "аварийно остановлен" },
  ],
  helmet: [{ id: "worn", label: "надета" }],
  microscope: [{ id: "on", label: "подсветка включена" }],
  slide: [{ id: "placed", label: "на столике" }],
  knob: [{ id: "turned", label: "повёрнут" }],
  cell: [{ id: "visible", label: "видна" }],
};

export const LIBRARY_GROUPS = Array.from(new Set(Object.values(LIBRARY).map((i) => i.group)));
