import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { LIBRARY, LOCATIONS } from "./library";
import { SceneObject } from "./types";

export const xrStore = createXRStore({ emulate: false });

interface Props {
  location: string;
  objects: SceneObject[];
  states: Record<string, string>;
  highlight?: string | null;
  flash?: { id: string; ok: boolean } | null;
  showLabels?: boolean;
  onPick?: (id: string) => void;
  selected?: string | null;
}

function Obj({
  o,
  state,
  glow,
  flash,
  showLabel,
  onPick,
  selected,
}: {
  o: SceneObject;
  state: string;
  glow: boolean;
  flash?: boolean | null;
  showLabel: boolean;
  onPick?: (id: string) => void;
  selected: boolean;
}) {
  const [hover, setHover] = useState(false);
  const item = LIBRARY[o.kind];
  if (!item) return null;
  const ring = flash === true ? "#22c55e" : flash === false ? "#ef4444" : glow ? "#38bdf8" : selected ? "#a78bfa" : hover ? "#ffffff" : null;
  return (
    <group
      position={o.pos}
      rotation={[0, o.rot || 0, 0]}
      scale={o.scale || 1}
      onClick={(e) => {
        e.stopPropagation();
        onPick?.(o.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
    >
      {item.render(state, o.color)}
      {ring && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.38, 40]} />
          <meshBasicMaterial color={ring} transparent opacity={0.9} />
        </mesh>
      )}
      {(showLabel || hover || glow) && o.kind !== "table" && (
        <Html position={[0, 0.75, 0]} center distanceFactor={6} zIndexRange={[10, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">{o.label}</div>
        </Html>
      )}
    </group>
  );
}

function Room({ location }: { location: string }) {
  const loc = LOCATIONS[location] || LOCATIONS.lab;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={loc.floor} roughness={0.9} />
      </mesh>
      {location !== "outdoor" && (
        <>
          <mesh position={[0, 1.6, -2]} receiveShadow>
            <planeGeometry args={[8, 3.2]} />
            <meshStandardMaterial color={loc.wall} />
          </mesh>
          <mesh position={[-4, 1.6, 2]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[8, 3.2]} />
            <meshStandardMaterial color={loc.wall} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** 3D-сцена тренажёра: работает мышью, пальцем и в VR-шлеме (контроллером). */
export default function Scene3D({ location, objects, states, highlight, flash, showLabels = false, onPick, selected }: Props) {
  const loc = LOCATIONS[location] || LOCATIONS.lab;
  return (
    <Canvas shadows camera={{ position: [0, 2.4, 3.6], fov: 50 }} dpr={[1, 1.75]}>
      <XR store={xrStore}>
        <color attach="background" args={[loc.sky]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <hemisphereLight args={["#ffffff", "#334155", 0.4]} />
        <Suspense fallback={null}>
          <Room location={location} />
          {objects.map((o) => (
            <Obj
              key={o.id}
              o={o}
              state={states[o.id] || ""}
              glow={highlight === o.id}
              flash={flash && flash.id === o.id ? flash.ok : null}
              showLabel={showLabels}
              onPick={onPick}
              selected={selected === o.id}
            />
          ))}
          <ContactShadows position={[0, 0.001, 0]} opacity={0.35} scale={8} blur={2} far={3} />
        </Suspense>
        <OrbitControls target={[0, 0.7, 0]} maxPolarAngle={Math.PI / 2.1} minDistance={1.5} maxDistance={7} enablePan={false} />
      </XR>
    </Canvas>
  );
}
