"use client";

import { useEffect, useState } from "react";
import { getGraphData } from "@/actions/institutional-memory-actions";
import type { GraphNodeData, GraphEdgeData } from "@/actions/institutional-memory-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function nodeBadge(type: string) {
  const color = NODE_TYPE_COLORS[type] ?? "bg-gray-100 text-gray-800 border-gray-300";
  return (
    <Badge variant="outline" className={color}>
      {type}
    </Badge>
  );
}

function edgeColor(relationType: string) {
  switch (relationType) {
    case "references": return "text-blue-500";
    case "derives_from": return "text-purple-500";
    case "evidence_for": return "text-green-500";
    case "contradicts": return "text-red-500";
    case "supports": return "text-emerald-500";
    default: return "text-gray-400";
  }
}

export default function GraphPage() {
  const [nodes, setNodes] = useState<GraphNodeData[]>([]);
  const [edges, setEdges] = useState<GraphEdgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  async function loadGraph() {
    setLoading(true);
    const res = await getGraphData();
    setLoading(false);
    if (res.success && res.data) {
      setNodes(res.data.nodes);
      setEdges(res.data.edges);
    } else {
      setError(res.error ?? "فشل في تحميل الرسم البياني");
    }
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const selectedEdges = selectedNodeId
    ? edges.filter((e) => e.sourceId === selectedNodeId || e.targetId === selectedNodeId)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الرسم البياني للمعرفة</h1>
          <p className="text-sm text-muted-foreground">
            Knowledge Graph — تصور العلاقات بين الكيانات عبر المنصة
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadGraph} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
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

      {!loading && !error && nodes.length === 0 && (
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

      {!loading && nodes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nodes list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-bold">العقد ({nodes.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nodes.map((node) => (
                <Card
                  key={node.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedNodeId === node.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() =>
                    setSelectedNodeId(selectedNodeId === node.id ? null : node.id)
                  }
                >
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 mb-1">
                      {nodeBadge(node.type)}
                    </div>
                    <p className="font-medium text-sm truncate">{node.name}</p>
                    {node.metadata && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {JSON.stringify(node.metadata).slice(0, 60)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Edge detail panel */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">
              {selectedNodeId ? "الروابط" : "اختر عقدة"}
            </h2>
            {selectedNodeId ? (
              selectedEdges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  لا توجد روابط لهذه العقدة
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedEdges.map((edge) => {
                    const isSource = edge.sourceId === selectedNodeId;
                    const otherNode = nodeMap.get(
                      isSource ? edge.targetId : edge.sourceId,
                    );
                    return (
                      <Card key={edge.id}>
                        <CardContent className="py-3">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={edgeColor(edge.relationType)}>
                              {edge.relationType}
                            </span>
                            <span className="text-muted-foreground">
                              {isSource ? "→" : "←"}
                            </span>
                            <span className="font-medium truncate">
                              {otherNode?.name ?? "غير معروف"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            الوزن: {edge.weight}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                اختر عقدة من القائمة لعرض روابطها
              </p>
            )}

            {/* Summary */}
            <Card className="bg-muted/50">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold">{nodes.length}</span> عقدة ·{" "}
                  <span className="font-bold">{edges.length}</span> رابط
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
