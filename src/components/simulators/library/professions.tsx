import { LibItem, M } from "./shared";

export const PROFESSIONS_ITEMS: Record<string, LibItem> = {
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
};
