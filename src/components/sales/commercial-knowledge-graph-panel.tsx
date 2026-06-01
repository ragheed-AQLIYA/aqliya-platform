import type { CommercialKnowledgeGraphSnapshot } from "@/lib/sales/services/commercial-knowledge-graph-service";
import { KnowledgeGraphExplorer } from "./knowledge-graph-explorer";

export function CommercialKnowledgeGraphPanel({
  snapshot,
}: {
  snapshot: CommercialKnowledgeGraphSnapshot;
}) {
  return <KnowledgeGraphExplorer snapshot={snapshot} />;
}
