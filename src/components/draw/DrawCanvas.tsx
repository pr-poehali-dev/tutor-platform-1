import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { TemplateShape, TEMPLATE_VIEW_W, TEMPLATE_VIEW_H } from "@/components/draw/drawData";

export interface DrawCanvasRef {
  clear: () => void;
  undo: () => void;
  exportPng: () => string | null;
}

interface Props {
  /** Внешнее управление кистью */
  color: string;
  size: number;
  tool: "pencil" | "brush" | "marker" | "eraser";
  /** Колбэк при изменении (например — отметить, что рисунок не пустой) */
  onChange?: () => void;
  /**
   * Трафарет «делай как я»: фигуры, которые будут полупрозрачно показаны поверх холста.
   * Координаты — в виртуальной системе 600×450, масштабируются автоматически.
   */
  template?: TemplateShape[];
  /** Видимость трафарета (можно скрыть/показать кнопкой) */
  templateVisible?: boolean;
  /** Цвет трафарета (по умолчанию синий) */
  templateColor?: string;
}

interface Stroke {
  color: string;
  size: number;
  tool: Props["tool"];
  points: { x: number; y: number }[];
}

const DrawCanvas = forwardRef<DrawCanvasRef, Props>(function DrawCanvas(
  { color, size, tool, onChange, template, templateVisible = true, templateColor = "#0ea5e9" },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const drawingRef = useRef(false);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 450 });

  // Resize observer — холст всегда занимает контейнер
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.floor(e.contentRect.width);
        const h = Math.max(300, Math.floor(e.contentRect.width * 0.7));
        setCanvasSize({ w, h });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Перерисовка при изменении размера или импертивных операциях
  const redraw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    // Заполняем белым фоном (а не прозрачным — чтобы экспорт был не «дырявый»)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    for (const s of strokesRef.current) {
      drawStroke(ctx, s);
    }
  }, []);

  useEffect(() => {
    redraw();
  }, [canvasSize, redraw]);

  function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
    if (s.points.length === 0) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (s.tool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = s.size * 2;
    } else {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      if (s.tool === "marker") {
        ctx.globalAlpha = 0.55;
      } else if (s.tool === "brush") {
        ctx.globalAlpha = 0.9;
      }
    }
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) {
      ctx.lineTo(s.points[i].x, s.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function getPoint(e: PointerEvent | React.PointerEvent): { x: number; y: number } {
    const cvs = canvasRef.current!;
    const rect = cvs.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * cvs.width,
      y: ((e.clientY - rect.top) / rect.height) * cvs.height,
    };
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    drawingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const pt = getPoint(e);
    currentRef.current = { color, size, tool, points: [pt] };
    strokesRef.current.push(currentRef.current);
    redraw();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || !currentRef.current) return;
    const pt = getPoint(e);
    currentRef.current.points.push(pt);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && currentRef.current.points.length >= 2) {
      const pts = currentRef.current.points;
      // рисуем только последний отрезок — оптимизация
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (currentRef.current.tool === "eraser") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = currentRef.current.size * 2;
      } else {
        ctx.strokeStyle = currentRef.current.color;
        ctx.lineWidth = currentRef.current.size;
        if (currentRef.current.tool === "marker") ctx.globalAlpha = 0.55;
        if (currentRef.current.tool === "brush") ctx.globalAlpha = 0.9;
      }
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    currentRef.current = null;
    onChange?.();
  };

  useImperativeHandle(
    ref,
    () => ({
      clear: () => {
        strokesRef.current = [];
        redraw();
        onChange?.();
      },
      undo: () => {
        strokesRef.current.pop();
        redraw();
        onChange?.();
      },
      exportPng: () => {
        const cvs = canvasRef.current;
        if (!cvs) return null;
        return cvs.toDataURL("image/png");
      },
    }),
    [redraw, onChange],
  );

  const showTemplate = template && template.length > 0 && templateVisible;

  return (
    <div ref={containerRef} className="relative w-full" style={{ touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full bg-white rounded-2xl cursor-crosshair shadow-inner"
        style={{ aspectRatio: `${canvasSize.w} / ${canvasSize.h}` }}
      />

      {/* Трафарет «делай как я» — полупрозрачный поверх холста */}
      {showTemplate && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl"
          viewBox={`0 0 ${TEMPLATE_VIEW_W} ${TEMPLATE_VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <g
            stroke={templateColor}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 5"
            fill="none"
            opacity={0.55}
            style={{ filter: "drop-shadow(0 0 1px rgba(14,165,233,0.4))" }}
          >
            {template!.map((shape, i) => {
              switch (shape.kind) {
                case "circle":
                  return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} />;
                case "ellipse":
                  return <ellipse key={i} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />;
                case "rect":
                  return <rect key={i} x={shape.x} y={shape.y} width={shape.w} height={shape.h} />;
                case "line":
                  return <line key={i} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} />;
                case "polyline":
                  return <polyline key={i} points={shape.points.map((p) => p.join(",")).join(" ")} />;
                case "polygon":
                  return <polygon key={i} points={shape.points.map((p) => p.join(",")).join(" ")} />;
                case "path":
                  return <path key={i} d={shape.d} />;
                case "arc": {
                  const { cx, cy, r, start, end } = shape;
                  const x1 = cx + r * Math.cos(start);
                  const y1 = cy + r * Math.sin(start);
                  const x2 = cx + r * Math.cos(end);
                  const y2 = cy + r * Math.sin(end);
                  const large = end - start > Math.PI ? 1 : 0;
                  return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} />;
                }
                default:
                  return null;
              }
            })}
          </g>
        </svg>
      )}

      {strokesRef.current.length === 0 && !showTemplate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-300 text-sm font-medium flex items-center gap-2">
            <Icon name="Brush" size={16} />
            Рисуй здесь пальцем или мышью
          </p>
        </div>
      )}

      {/* Подсказка для режима «обводки» */}
      {showTemplate && strokesRef.current.length === 0 && (
        <div className="absolute top-2 right-2 inline-flex items-center gap-1.5 bg-cyan-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg pointer-events-none animate-fadeIn">
          <Icon name="Sparkles" size={11} />
          Обводи пунктир!
        </div>
      )}
    </div>
  );
});

export default DrawCanvas;