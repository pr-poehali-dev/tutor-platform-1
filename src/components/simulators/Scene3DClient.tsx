import { Component, useEffect, useState, type ComponentProps, type ComponentType, type ReactNode } from "react";
import type Scene3DType from "./Scene3D";

/**
 * 3D-сцена грузится только в браузере: библиотека 3D (react-three-fiber)
 * обращается к внутренностям React при импорте и роняет серверную отрисовку.
 */
type Props = ComponentProps<typeof Scene3DType>;

function Fallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-950 p-6 text-center text-white">
      <span className="text-4xl">🖥️</span>
      <p className="font-bold">Браузер не смог включить 3D-графику</p>
      <p className="max-w-sm text-sm text-white/60">
        Откройте тренажёр в Chrome, Яндекс Браузере или Safari последней версии.
        Если не помогло — включите аппаратное ускорение в настройках браузера.
      </p>
    </div>
  );
}

class LoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: Error) {
    console.warn("[Scene3D] 3D недоступно:", e.message);
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

export default function Scene3D(props: Props) {
  const [Comp, setComp] = useState<ComponentType<Props> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    import("./Scene3D")
      .then((m) => {
        if (alive) setComp(() => m.default);
      })
      .catch((e: unknown) => {
        console.warn("[Scene3D] 3D недоступно:", e instanceof Error ? e.message : e);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (failed) return <Fallback />;
  if (!Comp) return <div className="h-full w-full bg-slate-950" />;
  return (
    <LoadBoundary>
      <Comp {...props} />
    </LoadBoundary>
  );
}

export async function vrSupported(): Promise<boolean> {
  try {
    const m = await import("./Scene3D");
    return await m.vrSupported();
  } catch {
    return false;
  }
}

export async function enterVR(): Promise<boolean> {
  try {
    const m = await import("./Scene3D");
    return await m.enterVR();
  } catch {
    return false;
  }
}