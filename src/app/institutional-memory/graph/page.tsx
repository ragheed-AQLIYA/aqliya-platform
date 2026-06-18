"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getGraphData } from "@/actions/institutional-memory-actions";
import type { GraphNodeData, GraphEdgeData } from "@/actions/institutional-memory-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ZoomIn, ZoomOut, Move, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Node type styling ──

const NODE_FILL: Record<string, string> = {
  entity: "#3b82f6",
  concept: "#8b5cf6",
  insight: "#f59e0b",
  document: "#10b981",
  topic: "#f43f5e",
  decision: "#6366f1",
  workflow: "#14b8a6",
  contact: "#f97316",
};

const NODE_TYPE_COLORS: Record<string, string> = {
  entity: "bg-blue-100 text-blue-800 border-blue-300",
  concept: "bg-purple-100 text-purple-800 border-purple-300",
  insight: "bg-amber-100 text-amber-800 border-amber-300",
  document: "bg-green-100 text-green-800 border-green-300",
  topic: "bg-rose-100 text-rose-800 border-rose-300",
  decision: "bg-indigo-100 text-indigo-800 border-indigo-300",
  workflow: "bg-teal-100 text-teal-800 border-teal-300",
  contact: "bg-orange-100 text-orange-800 border-orange-300",
};

const EDGE_COLORS: Record<string, string> = {
  references: "#3b82f6",
  derives_from: "#8b5cf6",
  evidence_for: "#10b981",
  contradicts: "#ef4444",
  supports: "#14b8a6",
  linked: "#6366f1",
  generated_by: "#f59e0b",
  approved_by: "#10b981",
  related_to: "#6b7280",
};

function edgeColor(relationType: string): string {
  return EDGE_COLORS[relationType] ?? "#6b7280";
}

function nodeFill(type: string): string {
  return NODE_FILL[type] ?? "#6b7280";
}

function nodeBadge(type: string) {
  const color = NODE_TYPE_COLORS[type] ?? "bg-gray-100 text-gray-800 border-gray-300";
  return (
    <Badge variant="outline" className={color}>{type}</Badge>
  );
}

// ── Force simulation ──

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  data: GraphNodeData;
  pinned: boolean;
}

function runForceSimulation(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
  width: number,
  height: number,
  tickCount = 120,
): SimNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const area = width * height;
  const baseRepel = Math.sqrt(area) * 0.18;
  const baseAttract = 0.008;

  const simNodes: SimNode[] = nodes.map((n) => ({
    id: n.id,
    x: cx + (Math.random() - 0.5) * width * 0.6,
    y: cy + (Math.random() - 0.5) * height * 0.6,
    vx: 0,
    vy: 0,
    radius: 28,
    data: n,
    pinned: false,
  }));

  const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

  for (let tick = 0; tick < tickCount; tick++) {
    const alpha = 1 - tick / tickCount;
    const repelForce = baseRepel * alpha;
    const attractForce = baseAttract * alpha;
    const damping = 0.85;

    // Reset forces (accumulate in vx/vy)
    for (const a of simNodes) {
      if (a.pinned) continue;
      // Centering force
      a.vx += (cx - a.x) * 0.002 * alpha;
      a.vy += (cy - a.y) * 0.002 * alpha;
    }

    // Repulsion (Coulomb's law)
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const a = simNodes[i];
        const b = simNodes[j];
        if (a.pinned && b.pinned) continue;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) { dist = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
        const force = repelForce / (dist * dist + 1);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
        if (!b.pinned) { b.vx += fx; b.vy += fy; }
      }
    }

    // Attraction (edges)
    for (const edge of edges) {
      const a = nodeMap.get(edge.sourceId);
      const b = nodeMap.get(edge.targetId);
      if (!a || !b) continue;
      if (a.pinned && b.pinned) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 120) * attractForce;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (!a.pinned) { a.vx += fx; a.vy += fy; }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
    }

    // Apply velocities with damping
    for (const n of simNodes) {
      if (n.pinned) continue;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      // Clamp to bounds with padding
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    }
  }

  return simNodes;
}

// ── Graph canvas component ──

function GraphCanvas({
  simNodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  onNodeDrag,
}: {
  simNodes: SimNode[];
  edges: GraphEdgeData[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
  onNodeDrag: (id: string, x: number, y: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState<string | null>(null);
  const [draggingOffset, setDraggingOffset] = useState({ x: 0, y: 0 });

  const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

  // Helper to get SVG coordinates from mouse event
  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId?: string) => {
    if (nodeId) {
      const pt = svgPoint(e.clientX, e.clientY);
      setDragging(nodeId);
      setDraggingOffset({ x: pt.x - (nodeMap.get(nodeId)?.x ?? 0), y: pt.y - (nodeMap.get(nodeId)?.y ?? 0) });
    } else {
      onNodeSelect(null);
    }
  }, [svgPoint, onNodeSelect, nodeMap]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const pt = svgPoint(e.clientX, e.clientY);
      onNodeDrag(dragging, pt.x - draggingOffset.x, pt.y - draggingOffset.y);
    }
  }, [dragging, draggingOffset, svgPoint, onNodeDrag]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.2, Math.min(5, z * delta)));
  }, []);

  // Edge paths with arrow
  const edgePaths = edges.map((edge) => {
    const a = nodeMap.get(edge.sourceId);
    const b = nodeMap.get(edge.targetId);
    if (!a || !b) return null;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // Offset from node center (accounting for radius)
    const offset = (a.radius + 6) / dist;
    const x1 = a.x + dx * offset;
    const y1 = a.y + dy * offset;
    const x2 = b.x - dx * offset;
    const y2 = b.y - dy * offset;
    return { ...edge, x1, y1, x2, y2 };
  }).filter(Boolean);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full rounded-lg border bg-card cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <defs>
        {Object.entries(EDGE_COLORS).concat([["default", "#6b7280"]]).map(([key, color]) => (
          <marker
            key={key}
            id={`arrow-${key}`}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill={color} />
          </marker>
        ))}
      </defs>

      <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
        {/* Edges */}
        {edgePaths.map((e) => {
          if (!e) return null;
          const color = edgeColor(e.relationType);
          const isHighlighted = selectedNodeId
            && (e.sourceId === selectedNodeId || e.targetId === selectedNodeId);
          return (
            <line
              key={e.id}
              x1={e.x1} y1={e.y1}
              x2={e.x2} y2={e.y2}
              stroke={color}
              strokeWidth={isHighlighted ? 2.5 : 1}
              strokeOpacity={isHighlighted ? 0.9 : 0.35}
              markerEnd={`url(#arrow-${EDGE_COLORS[e.relationType] ? e.relationType : "default"})`}
              className="transition-opacity"
            />
          );
        })}

        {/* Nodes */}
        {simNodes.map((n) => {
          const isSelected = n.id === selectedNodeId;
          const isHighlighted = selectedNodeId
            && edges.some((e) =>
              (e.sourceId === selectedNodeId && e.targetId === n.id)
              || (e.targetId === selectedNodeId && e.sourceId === n.id)
            );
          const opacity = selectedNodeId && !isSelected && !isHighlighted ? 0.25 : 1;
          const r = isSelected ? n.radius + 6 : n.radius;
          const fill = nodeFill(n.data.type);

          return (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y})`}
              opacity={opacity}
              style={{ cursor: "pointer" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, n.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect(n.id === selectedNodeId ? null : n.id);
              }}
            >
              {/* Glow when selected */}
              {isSelected && (
                <circle r={r + 4} fill="none" stroke={fill} strokeWidth={2} strokeOpacity={0.4}>
                  <animate attributeName="r" values={`${r + 2};${r + 8};${r + 2}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="strokeOpacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Shadow */}
              <circle r={r + 1} fill="rgba(0,0,0,0.12)" />
              {/* Node circle */}
              <circle r={r} fill={fill} stroke="#fff" strokeWidth={2} />
              {/* Type letter */}
              <text
                textAnchor="middle"
                dy="0.35em"
                fill="#fff"
                fontSize={14}
                fontWeight="bold"
              >
                {n.data.type.charAt(0).toUpperCase()}
              </text>
              {/* Label */}
              <text
                textAnchor="middle"
                dy={r + 16}
                fill="currentColor"
                fontSize={11}
                className="pointer-events-none"
              >
                {n.data.name.length > 18
                  ? n.data.name.slice(0, 16) + "…"
                  : n.data.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ── Main page component ──

export default function GraphPage() {
  const [graphNodes, setGraphNodes] = useState<GraphNodeData[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdgeData[]>([]);
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  async function loadGraph() {
    setLoading(true);
    setSelectedNodeId(null);
    const res = await getGraphData();
    setLoading(false);
    if (res.success && res.data) {
      setGraphNodes(res.data.nodes);
      setGraphEdges(res.data.edges);
    } else {
      setError(res.error ?? "فشل في تحميل الرسم البياني");
    }
  }

  // Run force simulation when graph data changes
  useEffect(() => {
    if (graphNodes.length === 0) return;
    const container = containerRef.current;
    const w = container?.clientWidth ?? 900;
    const h = container?.clientHeight ?? 500;
    const simulated = runForceSimulation(graphNodes, graphEdges, w, h);
    setSimNodes(simulated);
  }, [graphNodes, graphEdges]);

  // Handle node drag
  const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
    setSimNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y, pinned: true } : n)),
    );
  }, []);

  const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
  const selectedEdges = selectedNodeId
    ? graphEdges.filter(
        (e) => e.sourceId === selectedNodeId || e.targetId === selectedNodeId,
      )
    : [];

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  return (
    <div className="space-y-4" dir="ltr">
      {/* Toolbar */}
      <div className="flex items-center justify-between" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold">الرسم البياني للمعرفة</h1>
          <p className="text-sm text-muted-foreground">
            Knowledge Graph — تصور العلاقات بين الكيانات عبر المنصة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowList(!showList)}
          >
            <Move className="h-4 w-4 ml-1" />
            {showList ? "إخفاء اللوحة" : "إظهار اللوحة"}
          </Button>
          <Button variant="outline" size="sm" onClick={loadGraph} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && graphNodes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl mb-2">🕸️</p>
            <p className="font-bold text-muted-foreground">لا توجد عقد في الرسم البياني</p>
            <p className="text-sm text-muted-foreground">
              ستظهر العقد هنا عند إنشاء روابط بين الكيانات عبر المنتجات
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && graphNodes.length > 0 && (
        <div className="flex gap-4" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
          {/* Graph visualization */}
          <div ref={containerRef} className={`${showList ? "flex-1" : "w-full"} relative`}>
            <GraphCanvas
              simNodes={simNodes}
              edges={graphEdges}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
              onNodeDrag={handleNodeDrag}
            />
            {/* Graph stats overlay */}
            <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-muted-foreground border pointer-events-none">
              {graphNodes.length} عقدة · {graphEdges.length} رابط
            </div>
            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        // Reset simulation
                        const container = containerRef.current;
                        const w = container?.clientWidth ?? 900;
                        const h = container?.clientHeight ?? 500;
                        const simulated = runForceSimulation(graphNodes, graphEdges, w, h);
                        setSimNodes(simulated);
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>إعادة توزيع العقد</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Side panel */}
          {showList && (
            <div className="w-80 shrink-0 space-y-3 overflow-y-auto">
              {/* Selected node detail */}
              {selectedNode ? (
                <Card>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 mb-2">
                      {nodeBadge(selectedNode.data.type)}
                    </div>
                    <p className="font-bold text-sm mb-2">{selectedNode.data.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      <span className="font-bold">{selectedEdges.length}</span> رابط
                    </p>
                    {selectedEdges.length > 0 && (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {selectedEdges.map((edge) => {
                          const isSource = edge.sourceId === selectedNodeId;
                          const other = nodeMap.get(
                            isSource ? edge.targetId : edge.sourceId,
                          );
                          return (
                            <div
                              key={edge.id}
                              className="flex items-center gap-2 text-xs p-1.5 rounded-md hover:bg-muted cursor-pointer"
                              onClick={() => setSelectedNodeId(
                                other?.id ?? null,
                              )}
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: edgeColor(edge.relationType) }}
                              />
                              <span className="text-muted-foreground">
                                {edge.relationType}
                              </span>
                              <span className="text-xs">→</span>
                              <span className="font-medium truncate">
                                {other?.data.name ?? "?"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    اختر عقدة من الرسم البياني لعرض تفاصيلها
                  </CardContent>
                </Card>
              )}

              {/* Node legend */}
              <Card>
                <CardContent className="py-3">
                  <p className="text-xs font-bold mb-2 text-muted-foreground">أنواع العقد</p>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(NODE_TYPE_COLORS).map(([type]) => (
                      <div key={type} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: nodeFill(type) }}
                        />
                        {type}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Edge legend */}
              <Card>
                <CardContent className="py-3">
                  <p className="text-xs font-bold mb-2 text-muted-foreground">أنواع العلاقات</p>
                  <div className="space-y-1">
                    {Object.entries(EDGE_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-4 h-0.5 shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        {type}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
