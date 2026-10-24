import { LibItem, M } from "./shared";

export const BIOLOGY_COMMON_ITEMS: Record<string, LibItem> = {
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
