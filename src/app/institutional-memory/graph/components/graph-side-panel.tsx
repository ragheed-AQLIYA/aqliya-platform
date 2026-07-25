"use client";

import { useMemo } from "react";
import type { GraphEdgeData } from "@/actions/institutional-memory-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Move } from "lucide-react";
import { SimNode, NODE_TYPE_COLORS, EDGE_COLORS, edgeColor, nodeFill } from "./graph-shared";

function NodeBadge({ type }: { type: string }) {
  const color = NODE_TYPE_COLORS[type] ?? "bg-gray-100 text-gray-800 border-gray-300";
  return <Badge variant="outline" className={color}>{type}</Badge>;
}

export function GraphSidePanel({
  simNodes,
  selectedNode,
  selectedEdges,
  selectedNodeId,
  onNodeSelect,
}: {
  simNodes: SimNode[];
  selectedNode: SimNode | undefined;
  selectedEdges: GraphEdgeData[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
}) {
  return (
    <div className="w-80 shrink-0 space-y-3 overflow-y-auto">
      {selectedNode ? (
        <SelectedNodeDetail
          simNodes={simNodes}
          node={selectedNode}
          edges={selectedEdges}
          nodeId={selectedNodeId!}
          onNodeSelect={onNodeSelect}
        />
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
            اختر عقدة من الرسم البياني لعرض تفاصيلها
          </CardContent>
        </Card>
      )}

      <NodeLegend />
      <EdgeLegend />
    </div>
  );
}

function SelectedNodeDetail({
  simNodes,
  node,
  edges,
  nodeId,
  onNodeSelect,
}: {
  simNodes: SimNode[];
  node: SimNode;
  edges: GraphEdgeData[];
  nodeId: string;
  onNodeSelect: (id: string | null) => void;
}) {
  const nodeMap = useMemo(() => new Map(simNodes.map((n) => [n.id, n])), [simNodes]);

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-2 mb-2">
          <NodeBadge type={node.data.type} />
        </div>
        <p className="font-bold text-sm mb-2">{node.data.name}</p>
        <p className="text-xs text-muted-foreground mb-2">
          <span className="font-bold">{edges.length}</span> رابط
        </p>
        {edges.length > 0 && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {edges.map((edge) => {
              const isSource = edge.sourceId === nodeId;
              const other = nodeMap.get(isSource ? edge.targetId : edge.sourceId);
              return (
                <div
                  key={edge.id}
                  className="flex items-center gap-2 text-xs p-1.5 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => onNodeSelect(other?.id ?? null)}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: edgeColor(edge.relationType) }}
                  />
                  <span className="text-muted-foreground">{edge.relationType}</span>
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
  );
}

function NodeLegend() {
  return (
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
  );
}

function EdgeLegend() {
  return (
    <Card>
      <CardContent className="py-3">
        <p className="text-xs font-bold mb-2 text-muted-foreground">أنواع العلاقات</p>
        <div className="space-y-1">
          {Object.entries(EDGE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <span className="w-4 h-0.5 shrink-0" style={{ backgroundColor: color }} />
              {type}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
