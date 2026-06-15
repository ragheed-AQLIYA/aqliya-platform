"use client";

import { useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  ReportingGraph,
  ReportingGraphNode,
  ReportingGraphNodeType,
} from "@/lib/audit/reporting-graph/types";

const LAYER_LABELS: Record<number, { en: string; ar: string }> = {
  0: { en: "Pipeline", ar: "خط الإنتاج" },
  1: { en: "Trial Balance", ar: "ميزان المراجعة" },
  2: { en: "TB Accounts", ar: "حسابات الميزان" },
  3: { en: "Mapping", ar: "التعيين" },
  4: { en: "Statements", ar: "القوائم" },
  5: { en: "FS Lines", ar: "بنود القوائم" },
  6: { en: "Disclosures", ar: "الإيضاحات" },
};

const NODE_TYPE_COLORS: Record<ReportingGraphNodeType, string> = {
  engagement: "border-primary bg-primary/5",
  tb_root: "border-blue-300 bg-blue-50",
  tb_account: "border-sky-200 bg-sky-50",
  mapping: "border-amber-200 bg-amber-50",
  fs_statement: "border-emerald-200 bg-emerald-50",
  fs_line: "border-teal-200 bg-teal-50",
  disclosure_note: "border-violet-200 bg-violet-50",
};

interface FactoryMindMapProps {
  graph: ReportingGraph;
  className?: string;
}

function NodeCard({ node }: { node: ReportingGraphNode }) {
  const status = node.metadata?.status as string | undefined;
  const amount = node.metadata?.amount as number | undefined;

  return (
    <div
      className={cn(
        "rounded-md border px-2 py-1.5 text-xs shadow-sm",
        NODE_TYPE_COLORS[node.nodeType],
      )}
      title={node.label}
    >
      <p className="font-medium truncate max-w-[180px]">{node.label}</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {status && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {status}
          </Badge>
        )}
        {typeof amount === "number" && !Number.isNaN(amount) && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0">
            {amount.toLocaleString("ar-SA")}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function FactoryMindMap({ graph, className }: FactoryMindMapProps) {
  const layers = useMemo(() => {
    const byLayer = new Map<number, ReportingGraphNode[]>();
    for (const node of graph.nodes) {
      const list = byLayer.get(node.layer) ?? [];
      list.push(node);
      byLayer.set(node.layer, list);
    }
    return [...byLayer.entries()].sort(([a], [b]) => a - b);
  }, [graph.nodes]);

  const visibleLayers = layers.filter(([layer]) => layer >= 1 && layer <= 6);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{graph.stats.tbAccounts} TB</Badge>
        <Badge variant="outline">{graph.stats.mappings} mapping</Badge>
        <Badge variant="outline">{graph.stats.statements} FS</Badge>
        <Badge variant="outline">{graph.stats.fsLines} lines</Badge>
        <Badge variant="outline">{graph.stats.notes} notes</Badge>
        <Badge variant="outline">{graph.stats.edges} edges</Badge>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max items-start">
          {visibleLayers.map(([layer, nodes], idx) => {
            const label = LAYER_LABELS[layer] ?? {
              en: `Layer ${layer}`,
              ar: `طبقة ${layer}`,
            };
            return (
              <div key={layer} className="flex items-start gap-2">
                {idx > 0 && (
                  <div className="flex items-center self-center text-muted-foreground pt-8">
                    <ArrowLeft className="size-4 hidden rtl:block" />
                    <ArrowRight className="size-4 block rtl:hidden" />
                  </div>
                )}
                <Card className="w-[220px] shrink-0">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-xs font-semibold">
                      {label.ar}
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        {label.en}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-2 space-y-1.5 max-h-[420px] overflow-y-auto">
                    {nodes.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground px-1">
                        لا توجد عقد
                      </p>
                    ) : (
                      nodes.map((node) => <NodeCard key={node.id} node={node} />)
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        TB → Mapping → FS → Disclosure — قراءة فقط. اللقطة عند الاعتماد تُخزَّن في سجل
        التدقيق.
      </p>
    </div>
  );
}
