"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getGraphData } from "@/actions/institutional-memory-actions";
import type { GraphNodeData, GraphEdgeData } from "@/actions/institutional-memory-actions";
import { SimNode, runForceSimulation } from "./graph-shared";

export function useGraphPage() {
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

  useEffect(() => {
    if (graphNodes.length === 0) return;
    const container = containerRef.current;
    const w = container?.clientWidth ?? 900;
    const h = container?.clientHeight ?? 500;
    const simulated = runForceSimulation(graphNodes, graphEdges, w, h);
    setSimNodes(simulated);
  }, [graphNodes, graphEdges]);

  const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
    setSimNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y, pinned: true } : n)),
    );
  }, []);

  const handleResetLayout = useCallback(() => {
    const container = containerRef.current;
    const w = container?.clientWidth ?? 900;
    const h = container?.clientHeight ?? 500;
    const simulated = runForceSimulation(graphNodes, graphEdges, w, h);
    setSimNodes(simulated);
  }, [graphNodes, graphEdges]);

  const nodeMap = useMemo(() => new Map(simNodes.map((n) => [n.id, n])), [simNodes]);

  const selectedEdges = useMemo(() => {
    if (!selectedNodeId) return [];
    return graphEdges.filter(
      (e) => e.sourceId === selectedNodeId || e.targetId === selectedNodeId,
    );
  }, [selectedNodeId, graphEdges]);

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodeMap.get(selectedNodeId) : undefined),
    [selectedNodeId, nodeMap],
  );

  return {
    simNodes,
    loading,
    error,
    selectedNodeId,
    showList,
    containerRef,
    selectedEdges,
    selectedNode,
    graphNodes,
    graphEdges,
    loadGraph,
    handleNodeDrag,
    handleResetLayout,
    setSelectedNodeId,
    setShowList,
  };
}
