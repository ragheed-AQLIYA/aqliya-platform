"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import type { GraphEdgeData } from "@/actions/institutional-memory-actions";
import { SimNode, EDGE_COLORS, edgeColor, nodeFill } from "./graph-shared";

export function GraphCanvas({
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
  const [pan, _setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState<string | null>(null);
  const [draggingOffset, setDraggingOffset] = useState({ x: 0, y: 0 });

  const nodeMap = useMemo(() => new Map(simNodes.map((n) => [n.id, n])), [simNodes]);

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

  const edgePaths = edges.map((edge) => {
    const a = nodeMap.get(edge.sourceId);
    const b = nodeMap.get(edge.targetId);
    if (!a || !b) return null;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
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
              {isSelected && (
                <circle r={r + 4} fill="none" stroke={fill} strokeWidth={2} strokeOpacity={0.4}>
                  <animate attributeName="r" values={`${r + 2};${r + 8};${r + 2}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="strokeOpacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle r={r + 1} fill="rgba(0,0,0,0.12)" />
              <circle r={r} fill={fill} stroke="#fff" strokeWidth={2} />
              <text
                textAnchor="middle"
                dy="0.35em"
                fill="#fff"
                fontSize={14}
                fontWeight="bold"
              >
                {n.data.type.charAt(0).toUpperCase()}
              </text>
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
