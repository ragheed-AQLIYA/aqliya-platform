// @ts-nocheck
import type { KnowledgeGraphEdgeType, KnowledgeGraphNodeType } from "./types";

export function industryRefId(industryLabel: string): string {
  return industryLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function graphNodeId(
  kind: KnowledgeGraphNodeType,
  refId: string,
): string {
  return `${kind}:${refId}`;
}

export function contentRefId(key: string): string {
  return key.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 64);
}

export function graphEdgeId(
  kind: KnowledgeGraphEdgeType,
  sourceId: string,
  targetId: string,
  suffix?: string,
): string {
  const base = `${kind}:${sourceId}->${targetId}`;
  return suffix ? `${base}:${suffix}` : base;
}
