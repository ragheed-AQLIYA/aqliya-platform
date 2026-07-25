import type { GraphNodeData, GraphEdgeData } from "@/actions/institutional-memory-actions";

export const NODE_FILL: Record<string, string> = {
  entity: "#3b82f6",
  concept: "#8b5cf6",
  insight: "#f59e0b",
  document: "#10b981",
  topic: "#f43f5e",
  decision: "#6366f1",
  workflow: "#14b8a6",
  contact: "#f97316",
};

export const NODE_TYPE_COLORS: Record<string, string> = {
  entity: "bg-blue-100 text-blue-800 border-blue-300",
  concept: "bg-purple-100 text-purple-800 border-purple-300",
  insight: "bg-amber-100 text-amber-800 border-amber-300",
  document: "bg-green-100 text-green-800 border-green-300",
  topic: "bg-rose-100 text-rose-800 border-rose-300",
  decision: "bg-indigo-100 text-indigo-800 border-indigo-300",
  workflow: "bg-teal-100 text-teal-800 border-teal-300",
  contact: "bg-orange-100 text-orange-800 border-orange-300",
};

export const EDGE_COLORS: Record<string, string> = {
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

export function edgeColor(relationType: string): string {
  return EDGE_COLORS[relationType] ?? "#6b7280";
}

export function nodeFill(type: string): string {
  return NODE_FILL[type] ?? "#6b7280";
}

export interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  data: GraphNodeData;
  pinned: boolean;
}

export function runForceSimulation(
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

    for (const a of simNodes) {
      if (a.pinned) continue;
      a.vx += (cx - a.x) * 0.002 * alpha;
      a.vy += (cy - a.y) * 0.002 * alpha;
    }

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

    for (const n of simNodes) {
      if (n.pinned) continue;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    }
  }

  return simNodes;
}
