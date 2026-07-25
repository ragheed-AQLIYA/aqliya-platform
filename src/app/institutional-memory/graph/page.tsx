"use client";

import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGraphPage } from "./components/use-graph-page";
import { GraphCanvas } from "./components/graph-canvas";
import { GraphToolbar } from "./components/graph-toolbar";
import { GraphLoadingState } from "./components/graph-loading-state";
import { GraphErrorState } from "./components/graph-error-state";
import { GraphEmptyState } from "./components/graph-empty-state";
import { GraphSidePanel } from "./components/graph-side-panel";

export default function GraphPage() {
  const {
    simNodes, loading, error, selectedNodeId, showList,
    containerRef, selectedEdges, selectedNode, graphNodes, graphEdges,
    loadGraph, handleNodeDrag, handleResetLayout,
    setSelectedNodeId, setShowList,
  } = useGraphPage();

  return (
    <div className="space-y-4" dir="ltr">
      <GraphToolbar
        loading={loading}
        showList={showList}
        onToggleList={() => setShowList((v) => !v)}
        onRefresh={loadGraph}
      />

      {loading && <GraphLoadingState />}
      {error && <GraphErrorState error={error} />}
      {!loading && !error && graphNodes.length === 0 && <GraphEmptyState />}

      {!loading && graphNodes.length > 0 && (
        <div className="flex gap-4" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
          <div ref={containerRef} className={`${showList ? "flex-1" : "w-full"} relative`}>
            <GraphCanvas
              simNodes={simNodes}
              edges={graphEdges}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
              onNodeDrag={handleNodeDrag}
            />
            <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-muted-foreground border pointer-events-none">
              {graphNodes.length} عقدة · {graphEdges.length} رابط
            </div>
            <div className="absolute bottom-3 right-3 flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleResetLayout}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>إعادة توزيع العقد</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {showList && (
            <GraphSidePanel
              simNodes={simNodes}
              selectedNode={selectedNode}
              selectedEdges={selectedEdges}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
            />
          )}
        </div>
      )}
    </div>
  );
}
