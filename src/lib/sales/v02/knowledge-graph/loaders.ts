import type { KnowledgeGraph } from "./types";
import { buildKnowledgeGraphFromSnapshot } from "./builder";
import { readKnowledgeGraphStoreSnapshot } from "./store-reader";

export function buildOrgKnowledgeGraph(organizationId: string): KnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(
    readKnowledgeGraphStoreSnapshot(organizationId),
  );
}

export function loadKnowledgeGraph(organizationId: string): KnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(
    readKnowledgeGraphStoreSnapshot(organizationId),
  );
}
