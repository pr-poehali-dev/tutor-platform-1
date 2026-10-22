import { ReactNode } from "react";

/**
 * Библиотека 3D-объектов. Каждая модель собрана из простых фигур:
 * лёгкие, грузятся мгновенно и работают даже на слабых телефонах и в VR-шлеме.
 * state — состояние объекта после действия (вкл/выкл, горит/потушен и т.п.).
 */
type Render = (state: string, color?: string) => ReactNode;

interface LibItem {
  label: string;
  group: string;
  render: Render;
}

const M = ({ c, e, r = 0.5, m = 0.1 }: { c: string; e?: string; r?: number; m?: number }) => (
  <meshStandardMaterial color={c} emissive={e || "#000000"} emissiveIntensity={e ? 0.8 : 0} roughness={r} metalness={m} />
);

export const LIBRARY: Record<string, LibItem> = {
  // ---------- Физика ----------
  battery: {
    label: "Батарейка",
    group: "Физика",
    render: () => (
      <group>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 24]} />
          <M c="#1f2937" m={0.4} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.125, 0.125, 0.2, 24]} />
          <M c="#f59e0b" m={0.4} />
        </mesh>
        <mesh position={[0, 0.53, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
          <M c="#d1d5db" m={0.9} r={0.2} />
        </mesh>
      </group>
    ),
  },
  switch: {
    label: "Ключ (выключатель)",
    group: "Физика",
    render: (s) => (
      <group>
        <mesh position={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[0.4, 0.06, 0.2]} />
          <M c="#78350f" />
        </mesh>
        <mesh position={[0.02, 0.1, 0]} rotation={[0, 0, s === "on" ? -0.05 : -0.6]}>
          <boxGeometry args={[0.32, 0.03, 0.05]} />
          <M c="#d1d5db" m={0.9} r={0.2} />
        </mesh>
      </group>
    ),
  },
  bulb: {
    label: "Лампочка",
    group: "Физика",
    render: (s) => (
      <group>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
          <M c="#9ca3af" m={0.8} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial
            color={s === "on" ? "#fde68a" : "#e5e7eb"}
            emissive={s === "on" ? "#fbbf24" : "#000"}
            emissiveIntensity={s === "on" ? 2 : 0}
            transparent
            opacity={0.85}
          />
        </mesh>
        {s === "on" && <pointLight position={[0, 0.3, 0]} intensity={2} distance={3} color="#fde68a" />}
      </group>
    ),
  },
  resistor: {
    label: "Резистор",
    group: "Физика",
    render: () => (
      <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.08, 0]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 16]} />
          <M c="#d6b98c" />
        </mesh>
        {[-0.08, 0, 0.08].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.062, 0.062, 0.025, 16]} />
            <M c={["#7c2d12", "#111827", "#dc2626"][i]} />
          </mesh>
        ))}
      </group>
    ),
  },
  ammeter: {
    label: "Амперметр",
    group: "Физика",
    render: (s) => (
      <group>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.36, 0.3, 0.15]} />
          <M c="#e5e7eb" />
        </mesh>
        <mesh position={[0, 0.18, 0.076]}>
          <circleGeometry args={[0.11, 24]} />
          <M c="#fefce8" />
        </mesh>
        <mesh position={[0, 0.13, 0.08]} rotation={[0, 0, s === "on" ? -0.6 : 0.7]}>
          <boxGeometry args={[0.008, 0.11, 0.004]} />
          <M c="#dc2626" />
        </mesh>
      </group>
    ),
  },
  wire: {
    label: "Провод",
    group: "Физика",
    render: (s, c) => (
      <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
        <M c={c || "#dc2626"} e={s === "on" ? "#f87171" : undefined} />
      </mesh>
    ),
  },
  breadboard: {
    label: "Монтажная панель",
    group: "Физика",
    render: () => (
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.04, 1.2]} />
        <M c="#f3f4f6" />
      </mesh>
    ),
  },

  // ---------- ОБЖ ----------
  extinguisher: {
    label: "Огнетушитель",
    group: "ОБЖ",
    render: (s) => (
      <group>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 24]} />
          <M c="#dc2626" r={0.3} m={0.3} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.1, 12]} />
          <M c="#111827" m={0.6} />
        </mesh>
        <mesh position={[0.06, 0.72, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.14, 0.02, 0.04]} />
          <M c="#111827" />
        </mesh>
        {s !== "pinned" && s !== "used" && (
          <mesh position={[-0.03, 0.68, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.025, 0.006, 8, 16]} />
            <M c="#facc15" m={0.8} />
          </mesh>
        )}
        <mesh position={[-0.1, 0.5, 0]} rotation={[0, 0, 0.6]}>
          <cylinderGeometry args={[0.012, 0.012, 0.35, 8]} />
          <M c="#111827" />
        </mesh>
      </group>
    ),
  },
  fire: {
    label: "Очаг возгорания",
    group: "ОБЖ",
    render: (s) =>
      s === "out" ? (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.1, 16]} />
          <M c="#374151" />
        </mesh>
      ) : (
        <group>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.1, 16]} />
            <M c="#44403c" />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.sin(i * 1.3) * 0.12, 0.3 + (i % 2) * 0.1, Math.cos(i * 1.3) * 0.12]}>
              <coneGeometry args={[0.12 - i * 0.01, 0.5 - i * 0.04, 8]} />
              <meshStandardMaterial color={i % 2 ? "#f97316" : "#fbbf24"} emissive="#ea580c" emissiveIntensity={1.5} transparent opacity={0.85} />
            </mesh>
          ))}
          <pointLight position={[0, 0.5, 0]} intensity={3} distance={4} color="#fb923c" />
        </group>
      ),
  },
  alarm: {
    label: "Пожарный извещатель",
    group: "ОБЖ",
    render: (s) => (
      <group>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.08]} />
          <M c="#dc2626" />
        </mesh>
        <mesh position={[0, 0.1, 0.045]}>
          <circleGeometry args={[0.05, 16]} />
          <M c={s === "on" ? "#fef08a" : "#fecaca"} e={s === "on" ? "#facc15" : undefined} />
        </mesh>
      </group>
    ),
  },
  door: {
    label: "Дверь / выход",
    group: "ОБЖ",
    render: (s) => (
      <group>
        <mesh position={[0, 1, 0]} rotation={[0, s === "open" ? -1.2 : 0, 0]}>
          <boxGeometry args={[0.9, 2, 0.06]} />
          <M c="#a16207" />
        </mesh>
        <mesh position={[0, 2.15, 0]}>
          <boxGeometry args={[0.5, 0.18, 0.04]} />
          <M c="#16a34a" e="#22c55e" />
        </mesh>
      </group>
    ),
  },
  phone: {
    label: "Телефон 112",
    group: "ОБЖ",
    render: (s) => (
      <group>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.16, 0.3, 0.02]} />
          <M c="#111827" />
        </mesh>
        <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.14, 0.26]} />
          <M c={s === "on" ? "#22c55e" : "#1e3a8a"} e={s === "on" ? "#22c55e" : "#1d4ed8"} />
        </mesh>
      </group>
    ),
  },
  victim: {
    label: "Пострадавший (манекен)",
    group: "ОБЖ",
    render: (s) => (
      <group rotation={[0, 0, 0]}>
        <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.16, 0.7, 8, 16]} />
          <M c="#3b82f6" />
        </mesh>
        <mesh position={[0.62, 0.14, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <M c="#fcd5b5" />
        </mesh>
        <mesh position={[-0.65, 0.08, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.06, 0.5, 6, 10]} />
          <M c="#1e3a8a" />
        </mesh>
        <mesh position={[-0.65, 0.08, -0.08]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.06, 0.5, 6, 10]} />
          <M c="#1e3a8a" />
        </mesh>
        {s === "bandaged" && (
          <mesh position={[0.15, 0.12, 0.17]}>
            <boxGeometry args={[0.2, 0.08, 0.02]} />
            <M c="#ffffff" />
          </mesh>
        )}
      </group>
    ),
  },
  firstaid: {
    label: "Аптечка",
    group: "ОБЖ",
    render: () => (
      <group>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.4, 0.2, 0.25]} />
          <M c="#f8fafc" />
        </mesh>
        <mesh position={[0, 0.1, 0.126]}>
          <boxGeometry args={[0.12, 0.035, 0.005]} />
          <M c="#dc2626" />
        </mesh>
        <mesh position={[0, 0.1, 0.126]}>
          <boxGeometry args={[0.035, 0.12, 0.005]} />
          <M c="#dc2626" />
        </mesh>
      </group>
    ),
  },
  gloves: {
    label: "Перчатки",
    group: "ОБЖ",
    render: (s, c) => (
      <group visible={s !== "worn"}>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.04]} />
            <M c={c || "#60a5fa"} />
          </mesh>
        ))}
      </group>
    ),
  },

  // ---------- Профессии ----------
  welder: {
    label: "Сварочный аппарат",
    group: "Профессии",
    render: (s) => (
      <group>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.35]} />
          <M c="#1d4ed8" m={0.3} />
        </mesh>
        <mesh position={[0.1, 0.3, 0.18]}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
          <M c="#111827" />
        </mesh>
        <mesh position={[-0.12, 0.38, 0.18]}>
          <circleGeometry args={[0.03, 12]} />
          <M c={s === "on" ? "#22c55e" : "#7f1d1d"} e={s === "on" ? "#22c55e" : undefined} />
        </mesh>
      </group>
    ),
  },
  mask: {
    label: "Сварочная маска",
    group: "Профессии",
    render: (s) => (
      <group visible={s !== "worn"}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.12]} />
          <M c="#111827" r={0.7} />
        </mesh>
        <mesh position={[0, 0.18, 0.061]}>
          <planeGeometry args={[0.16, 0.06]} />
          <M c="#14532d" e="#166534" />
        </mesh>
      </group>
    ),
  },
  metal: {
    label: "Металлические пластины",
    group: "Профессии",
    render: (s) => (
      <group>
        <mesh position={[-0.21, 0.02, 0]} castShadow>
          <boxGeometry args={[0.4, 0.03, 0.3]} />
          <M c="#9ca3af" m={0.8} r={0.3} />
        </mesh>
        <mesh position={[0.21, 0.02, 0]} castShadow>
          <boxGeometry args={[0.4, 0.03, 0.3]} />
          <M c="#9ca3af" m={0.8} r={0.3} />
        </mesh>
        {s === "welded" && (
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.03, 0.02, 0.3]} />
            <M c="#78716c" e="#f97316" m={0.6} />
          </mesh>
        )}
      </group>
    ),
  },
  panel: {
    label: "Электрощит",
    group: "Профессии",
    render: (s) => (
      <group>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.7, 1, 0.2]} />
          <M c="#d1d5db" m={0.5} />
        </mesh>
        {[-0.2, 0, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.6, 0.11]}>
            <boxGeometry args={[0.12, 0.2, 0.04]} />
            <M c={s === "off" ? "#16a34a" : "#dc2626"} />
          </mesh>
        ))}
        <mesh position={[0, 0.25, 0.105]}>
          <planeGeometry args={[0.2, 0.15]} />
          <M c="#facc15" />
        </mesh>
      </group>
    ),
  },
  tester: {
    label: "Указатель напряжения",
    group: "Профессии",
    render: (s) => (
      <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.04, 0]}>
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
          <M c="#facc15" />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <coneGeometry args={[0.015, 0.06, 8]} />
          <M c="#d1d5db" m={0.9} />
        </mesh>
        <mesh position={[0, -0.05, 0.026]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <M c={s === "on" ? "#ef4444" : "#4b5563"} e={s === "on" ? "#ef4444" : undefined} />
        </mesh>
      </group>
    ),
  },
  lock: {
    label: "Замок и плакат «Не включать»",
    group: "Профессии",
    render: (s) => (
      <group visible={s !== "placed"}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.05]} />
          <M c="#dc2626" />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <torusGeometry args={[0.035, 0.01, 8, 16, Math.PI]} />
          <M c="#d1d5db" m={0.9} />
        </mesh>
        <mesh position={[0.2, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.25, 0.15]} />
          <M c="#fef08a" />
        </mesh>
      </group>
    ),
  },
  console: {
    label: "Пульт оператора",
    group: "Профессии",
    render: (s) => (
      <group>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.9, 0.8, 0.5]} />
          <M c="#334155" m={0.4} />
        </mesh>
        <mesh position={[0, 0.85, 0.05]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.85, 0.05, 0.4]} />
          <M c="#1e293b" />
        </mesh>
        {[
          [-0.25, "#22c55e"],
          [0, "#facc15"],
          [0.25, "#ef4444"],
        ].map(([x, c]) => (
          <mesh key={String(x)} position={[x as number, 0.9, 0.08]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
            <M c={c as string} e={s === "on" && c === "#22c55e" ? "#22c55e" : undefined} />
          </mesh>
        ))}
      </group>
    ),
  },
  machine: {
    label: "Станок",
    group: "Профессии",
    render: (s) => (
      <group>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[1.2, 0.9, 0.6]} />
          <M c="#0f766e" m={0.3} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[0, 0, s === "on" ? 0.3 : 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 24]} />
          <M c="#9ca3af" m={0.8} />
        </mesh>
        <mesh position={[0.5, 0.75, 0.31]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <M c="#dc2626" e={s === "stopped" ? "#ef4444" : undefined} />
        </mesh>
      </group>
    ),
  },
  helmet: {
    label: "Каска",
    group: "Профессии",
    render: (s) => (
      <mesh position={[0, 0.1, 0]} visible={s !== "worn"} castShadow>
        <sphereGeometry args={[0.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <M c="#facc15" />
      </mesh>
    ),
  },

  // ---------- Биология ----------
  microscope: {
    label: "Микроскоп",
    group: "Биология",
    render: (s) => (
      <group>
        <mesh position={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[0.35, 0.06, 0.28]} />
          <M c="#1f2937" />
        </mesh>
        <mesh position={[-0.1, 0.25, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.06, 0.45, 0.08]} />
          <M c="#e5e7eb" />
        </mesh>
        <mesh position={[0.02, 0.2, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.18]} />
          <M c="#111827" />
        </mesh>
        <mesh position={[0.02, 0.4, 0]} rotation={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.035, 0.035, 0.3, 16]} />
          <M c="#e5e7eb" m={0.3} />
        </mesh>
        <mesh position={[0.02, 0.1, 0]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <M c="#fef9c3" e={s === "on" || s === "focused" ? "#fde047" : undefined} />
        </mesh>
      </group>
    ),
  },
  slide: {
    label: "Предметное стекло",
    group: "Биология",
    render: (s) => (
      <group visible={s !== "placed"}>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.25, 0.01, 0.08]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.016, 0]}>
          <circleGeometry args={[0.02, 12]} />
          <M c="#a855f7" />
        </mesh>
      </group>
    ),
  },
  knob: {
    label: "Винт фокусировки",
    group: "Биология",
    render: (s) => (
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, s === "turned" ? 1.5 : 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
        <M c="#6b7280" m={0.6} />
      </mesh>
    ),
  },
  cell: {
    label: "Клетка (крупно)",
    group: "Биология",
    render: (s) => (
      <group visible={s === "visible"}>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color="#bbf7d0" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0.08, 0.52, 0.05]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <M c="#7c3aed" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.6) * 0.28, 0.45 + (i % 2) * 0.1, Math.sin(i * 1.6) * 0.25]}>
            <capsuleGeometry args={[0.03, 0.08, 4, 8]} />
            <M c="#f97316" />
          </mesh>
        ))}
      </group>
    ),
  },
  heart: {
    label: "Сердце (модель)",
    group: "Биология",
    render: () => (
      <group position={[0, 0.25, 0]}>
        <mesh position={[-0.07, 0.05, 0]}>
          <sphereGeometry args={[0.12, 20, 20]} />
          <M c="#be123c" />
        </mesh>
        <mesh position={[0.07, 0.05, 0]}>
          <sphereGeometry args={[0.12, 20, 20]} />
          <M c="#be123c" />
        </mesh>
        <mesh position={[0, -0.08, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.17, 0.25, 20]} />
          <M c="#be123c" />
        </mesh>
        <mesh position={[0.02, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 12]} />
          <M c="#1d4ed8" />
        </mesh>
      </group>
    ),
  },
  lungs: {
    label: "Лёгкие (модель)",
    group: "Биология",
    render: () => (
      <group position={[0, 0.3, 0]}>
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0, 0]} scale={[0.8, 1.3, 0.7]}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <M c="#f9a8d4" />
          </mesh>
        ))}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.15, 10]} />
          <M c="#e5e7eb" />
        </mesh>
      </group>
    ),
  },
  brain: {
    label: "Мозг (модель)",
    group: "Биология",
    render: () => (
      <mesh position={[0, 0.2, 0]} scale={[1.2, 0.9, 1]}>
        <icosahedronGeometry args={[0.16, 2]} />
        <M c="#fda4af" r={0.9} />
      </mesh>
    ),
  },

  // ---------- Общее ----------
  table: {
    label: "Стол",
    group: "Мебель",
    render: () => (
      <group>
        <mesh position={[0, 0.75, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.4, 0.06, 1.3]} />
          <M c="#a8a29e" />
        </mesh>
        {[
          [-1.1, -0.55],
          [1.1, -0.55],
          [-1.1, 0.55],
          [1.1, 0.55],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.37, z]}>
            <boxGeometry args={[0.06, 0.74, 0.06]} />
            <M c="#57534e" />
          </mesh>
        ))}
      </group>
    ),
  },
  sign: {
    label: "Табличка",
    group: "Мебель",
    render: (_s, c) => (
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.02]} />
        <M c={c || "#facc15"} />
      </mesh>
    ),
  },
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