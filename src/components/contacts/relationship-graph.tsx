"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GraphNode, GraphLink, GraphStats } from "@/lib/localcontactos/relationship-graph";

// ─── Props ───────────────────────────────────────────────────────────────────

interface RelationshipGraphProps {
  data: { graphData: { nodes: GraphNode[]; links: GraphLink[] }; stats: GraphStats } | null;
  loading: boolean;
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const SENSITIVITY_COLORS: Record<string, string> = {
  normal: "#22c55e",      // green
  sensitive: "#f59e0b",   // amber
  confidential: "#ef4444", // red
};

const RELATION_COLORS: Record<string, string> = {
  colleague: "#94a3b8",
  manager: "#3b82f6",
  subordinate: "#8b5cf6",
  partner: "#06b6d4",
  client: "#10b981",
  vendor: "#f97316",
  board_member: "#ec4899",
  investor: "#eab308",
  other: "#6b7280",
};

const NODE_RADIUS = 8;
const WIDTH = 800;
const HEIGHT = 550;

// ─── Simple Force Simulation (no D3 dependency) ──────────────────────────────

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed: boolean;
}

function runForceSimulation(
  nodes: GraphNode[],
  links: GraphLink[],
): Map<string, { x: number; y: number }> {
  const simNodes: SimNode[] = nodes.map((n) => ({
    id: n.id,
    x: WIDTH / 2 + (Math.random() - 0.5) * 200,
    y: HEIGHT / 2 + (Math.random() - 0.5) * 200,
    vx: 0,
    vy: 0,
    fixed: false,
  }));

  const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

  // Run 200 iterations
  for (let iter = 0; iter < 200; iter++) {
    const alpha = 0.5 * (1 - iter / 200);

    // Repulsion between all pairs
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const a = simNodes[i];
        const b = simNodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (200 * alpha) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along links
    for (const link of links) {
      const a = nodeMap.get(link.source);
      const b = nodeMap.get(link.target);
      if (!a || !b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 80) * 0.01 * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center gravity
    for (const n of simNodes) {
      n.vx += (WIDTH / 2 - n.x) * 0.001 * alpha;
      n.vy += (HEIGHT / 2 - n.y) * 0.001 * alpha;
    }

    // Apply velocity with damping
    for (const n of simNodes) {
      n.x += n.vx * 0.6;
      n.y += n.vy * 0.6;
      n.vx *= 0.5;
      n.vy *= 0.5;
    }
  }

  return new Map(simNodes.map((n) => [n.id, { x: Math.max(20, Math.min(WIDTH - 20, n.x)), y: Math.max(20, Math.min(HEIGHT - 20, n.y)) }]));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RelationshipGraph({ data, loading }: RelationshipGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [filterSensitivity, setFilterSensitivity] = useState<string>("all");
  const [filterRelation, setFilterRelation] = useState<string>("all");

  const runSimulation = useCallback(() => {
    if (!data) return;
    const { nodes, links } = data.graphData;

    const filteredNodes = filterSensitivity === "all"
      ? nodes
      : nodes.filter((n) => n.sensitivityLevel === filterSensitivity);

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = filterRelation === "all"
      ? links.filter((l) => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target))
      : links.filter(
          (l) =>
            filteredNodeIds.has(l.source) &&
            filteredNodeIds.has(l.target) &&
            l.relationType === filterRelation,
        );

    if (filteredNodes.length === 0) return;

    const pos = runForceSimulation(filteredNodes, filteredLinks);
    setPositions(pos);
  }, [data, filterSensitivity, filterRelation]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[550px] bg-muted/20 rounded-lg">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data || data.graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[550px] bg-muted/20 rounded-lg text-muted-foreground">
        <p className="text-lg">لا توجد جهات اتصال لعرضها</p>
        <p className="text-sm mt-2">No contacts to display</p>
      </div>
    );
  }

  const { nodes: allNodes, links: allLinks } = data.graphData;
  const { stats } = data;

  const filteredNodes = filterSensitivity === "all"
    ? allNodes
    : allNodes.filter((n) => n.sensitivityLevel === filterSensitivity);

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredLinks = filterRelation === "all"
    ? allLinks.filter((l) => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target))
    : allLinks.filter(
        (l) =>
          filteredNodeIds.has(l.source) &&
          filteredNodeIds.has(l.target) &&
          l.relationType === filterRelation,
      );

  const nodePositions = new Map(filteredNodes.map((n) => [n.id, positions.get(n.id) ?? { x: WIDTH / 2, y: HEIGHT / 2 }]));

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="text-sm border rounded px-3 py-1.5 bg-background"
          value={filterSensitivity}
          onChange={(e) => setFilterSensitivity(e.target.value)}
        >
          <option value="all">كل مستويات الحساسية</option>
          <option value="normal">عادي</option>
          <option value="sensitive">حساس</option>
          <option value="confidential">سري</option>
        </select>
        <select
          className="text-sm border rounded px-3 py-1.5 bg-background"
          value={filterRelation}
          onChange={(e) => setFilterRelation(e.target.value)}
        >
          <option value="all">كل أنواع العلاقات</option>
          <option value="client">عميل</option>
          <option value="partner">شريك</option>
          <option value="vendor">مورّد</option>
          <option value="colleague">زميل</option>
          <option value="manager">مدير</option>
        </select>
        <span className="text-xs text-muted-foreground">
          {filteredNodes.length} جهات · {filteredLinks.length} علاقات
        </span>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        <div className="bg-muted/40 rounded p-2">
          <div className="font-bold text-lg">{stats.totalContacts}</div>
          <div className="text-muted-foreground">جهات اتصال</div>
        </div>
        <div className="bg-muted/40 rounded p-2">
          <div className="font-bold text-lg">{stats.totalRelations}</div>
          <div className="text-muted-foreground">علاقات</div>
        </div>
        <div className="bg-muted/40 rounded p-2">
          <div className="font-bold text-lg">{stats.isolatedContacts}</div>
          <div className="text-muted-foreground">معزولة</div>
        </div>
        <div className="bg-muted/40 rounded p-2">
          <div className="font-bold text-lg">{stats.avgStrength}/10</div>
          <div className="text-muted-foreground">متوسط القوة</div>
        </div>
        <div className="bg-muted/40 rounded p-2">
          <div className="font-bold text-sm truncate">{stats.mostConnected?.name ?? "—"}</div>
          <div className="text-muted-foreground">الأكثر ارتباطاً</div>
        </div>
      </div>

      {/* SVG Graph */}
      <div className="relative bg-muted/10 rounded-lg border overflow-hidden" style={{ height: HEIGHT }}>
        <svg
          ref={svgRef}
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
        >
          {/* Links */}
          {filteredLinks.map((link, i) => {
            const src = nodePositions.get(link.source);
            const tgt = nodePositions.get(link.target);
            if (!src || !tgt) return null;

            const isHovered = hoveredLink === i;
            const isRelated = hoveredNode && (link.source === hoveredNode || link.target === hoveredNode);

            return (
              <g key={`link-${i}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={RELATION_COLORS[link.relationType] ?? "#94a3b8"}
                  strokeWidth={isHovered || isRelated ? 2.5 : 1}
                  opacity={hoveredNode ? (isRelated ? 0.9 : 0.15) : 0.5}
                  onMouseEnter={() => setHoveredLink(i)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                />
                {isHovered && (
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill={RELATION_COLORS[link.relationType] ?? "#94a3b8"}
                    fontWeight="bold"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const isHovered = hoveredNode === node.id;
            const color = SENSITIVITY_COLORS[node.sensitivityLevel] ?? "#94a3b8";
            const r = isHovered ? NODE_RADIUS + 4 : NODE_RADIUS;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => { setHoveredNode(null); setHoveredLink(null); }}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  opacity={hoveredNode && hoveredNode !== node.id ? 0.3 : 1}
                  style={{ transition: "opacity 0.2s, r 0.2s" }}
                />
                <text
                  x={pos.x}
                  y={pos.y + r + 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  opacity={hoveredNode && hoveredNode !== node.id ? 0.2 : 0.9}
                  style={{ transition: "opacity 0.2s" }}
                >
                  {node.name.length > 18 ? node.name.slice(0, 16) + "…" : node.name}
                </text>

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={pos.x - 90}
                      y={pos.y - 55}
                      width={180}
                      height={48}
                      rx={6}
                      fill="#1e293b"
                      opacity={0.95}
                    />
                    <text x={pos.x} y={pos.y - 36} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">
                      {node.name}
                    </text>
                    <text x={pos.x} y={pos.y - 22} textAnchor="middle" fontSize="10" fill="#cbd5e1">
                      {node.organizationName} · {node.position}
                    </text>
                    <text x={pos.x} y={pos.y - 10} textAnchor="middle" fontSize="9" fill="#94a3b8">
                      {node.interactionCount} تفاعلات
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 flex gap-3 text-xs bg-background/90 rounded-lg p-2 border shadow-sm">
          {Object.entries(SENSITIVITY_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span>
                {level === "normal" ? "عادي" : level === "sensitive" ? "حساس" : "سري"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
