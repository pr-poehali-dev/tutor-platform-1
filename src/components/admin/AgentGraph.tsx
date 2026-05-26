import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const AUTOPILOT_URL = (func2url as Record<string, string>)["ai-autopilot"];

interface Node {
  agent_key: string;
  role_name: string;
  version: number;
  health_score: number | string;
  total_interactions: number;
  avg_rating: number | string;
}

interface Edge {
  parent_agent: string;
  child_agent: string;
  influence_type: string;
  weight: number | string;
}

interface PositionedNode extends Node {
  x: number;
  y: number;
}

const EDGE_COLORS: Record<string, string> = {
  evolves: "#8b5cf6",
  quality_gate: "#ec4899",
  feedback_loop: "#06d6a0",
  updates: "#ffd60a",
};

/** Визуализация графа ИИ-агентов: круговая раскладка + цветные связи. */
export default function AgentGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${AUTOPILOT_URL}?action=graph`);
        const data = await res.json();
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
      } catch { /* noop */ }
      setLoading(false);
    })();
  }, []);

  const W = 620;
  const H = 540;
  const cx = W / 2;
  const cy = H / 2;
  const radius = 200;

  const positioned: PositionedNode[] = nodes.map((n, i) => {
    const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  });

  const nodeMap = new Map(positioned.map((n) => [n.agent_key, n]));

  const healthColor = (score: number) => {
    if (score >= 80) return "#06d6a0";
    if (score >= 60) return "#ffd60a";
    return "#f87171";
  };

  return (
    <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="GitBranch" size={14} className="text-cyan-300" />
          <h4 className="font-montserrat font-black text-white text-sm">Граф связей агентов</h4>
        </div>
        <div className="flex items-center gap-2.5 text-[10px]">
          {Object.entries(EDGE_COLORS).map(([k, color]) => (
            <span key={k} className="inline-flex items-center gap-1 text-white/55">
              <span className="w-3 h-0.5 rounded" style={{ background: color }} />
              {k}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center text-white/45 text-sm">
          <Icon name="Loader2" size={20} className="animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 540 }}>
            <defs>
              {Object.entries(EDGE_COLORS).map(([k, color]) => (
                <marker
                  key={k}
                  id={`arrow-${k}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                </marker>
              ))}
            </defs>

            {/* Edges */}
            {edges.map((e, i) => {
              const from = nodeMap.get(e.parent_agent);
              const to = nodeMap.get(e.child_agent);
              if (!from || !to) return null;
              const color = EDGE_COLORS[e.influence_type] || "#9ca3af";
              const isHovered = hoveredAgent === e.parent_agent || hoveredAgent === e.child_agent;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const nodeR = 38;
              const ux = dx / len;
              const uy = dy / len;
              const x1 = from.x + ux * nodeR;
              const y1 = from.y + uy * nodeR;
              const x2 = to.x - ux * nodeR;
              const y2 = to.y - uy * nodeR;
              const mx = (x1 + x2) / 2 + (-uy) * 30;
              const my = (y1 + y2) / 2 + ux * 30;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeOpacity={hoveredAgent && !isHovered ? 0.15 : 0.7}
                  markerEnd={`url(#arrow-${e.influence_type})`}
                />
              );
            })}

            {/* Nodes */}
            {positioned.map((n) => {
              const health = Number(n.health_score || 0);
              const isHovered = hoveredAgent === n.agent_key;
              return (
                <g
                  key={n.agent_key}
                  transform={`translate(${n.x}, ${n.y})`}
                  onMouseEnter={() => setHoveredAgent(n.agent_key)}
                  onMouseLeave={() => setHoveredAgent(null)}
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                >
                  <circle
                    r={isHovered ? 42 : 36}
                    fill="rgba(20,20,30,0.95)"
                    stroke={healthColor(health)}
                    strokeWidth={isHovered ? 3 : 2}
                    style={{ filter: isHovered ? `drop-shadow(0 0 12px ${healthColor(health)})` : "none" }}
                  />
                  <text
                    textAnchor="middle"
                    dy={-3}
                    fill="white"
                    fontSize={10}
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.role_name.length > 14 ? n.role_name.slice(0, 12) + "…" : n.role_name}
                  </text>
                  <text
                    textAnchor="middle"
                    dy={10}
                    fill={healthColor(health)}
                    fontSize={9}
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    v{n.version} · {Math.round(health)}
                  </text>
                  <text
                    textAnchor="middle"
                    dy={22}
                    fill="rgba(255,255,255,0.5)"
                    fontSize={8}
                    style={{ pointerEvents: "none" }}
                  >
                    {n.total_interactions} вз.
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <p className="text-white/40 text-[10px] mt-3 text-center">
        Цвет рамки = здоровье агента · Цвет связи = тип влияния · Наведи на узел чтобы выделить связи
      </p>
    </div>
  );
}
