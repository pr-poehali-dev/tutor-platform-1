import { LibItem, M } from "./shared";

export const PHYSICS_SAFETY_ITEMS: Record<string, LibItem> = {
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
};
