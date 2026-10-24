import { ReactNode } from "react";

/**
 * Библиотека 3D-объектов. Каждая модель собрана из простых фигур:
 * лёгкие, грузятся мгновенно и работают даже на слабых телефонах и в VR-шлеме.
 * state — состояние объекта после действия (вкл/выкл, горит/потушен и т.п.).
 */
export type Render = (state: string, color?: string) => ReactNode;

export interface LibItem {
  label: string;
  group: string;
  render: Render;
}

export const M = ({ c, e, r = 0.5, m = 0.1 }: { c: string; e?: string; r?: number; m?: number }) => (
  <meshStandardMaterial color={c} emissive={e || "#000000"} emissiveIntensity={e ? 0.8 : 0} roughness={r} metalness={m} />
);
