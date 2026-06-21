import "server-only"
import {
  type RAGGovernanceMetadata,
  type RAGSensitivity,
  parseGovernanceFromChunkMetadata,
} from "./governed-rag-metrics"

export type { RAGGovernanceMetadata, RAGSensitivity }
export { parseGovernanceFromChunkMetadata }

const DEFAULT_SENSITIVITY: RAGSensitivity = "internal"

export function buildChunkGovernanceMetadata(
  documentId: string,
  organizationId: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  const governance: RAGGovernanceMetadata = {
    productKey: typeof extra.productKey === "string" ? extra.productKey : "ai_core",
    sourceDocumentId: documentId,
    sourceType: typeof extra.sourceType === "string" ? extra.sourceType : "document",
    sensitivity: parseSensitivity(extra.sensitivity),
    retentionDays: typeof extra.retentionDays === "number" ? extra.retentionDays : 365,
    ingestedAt: new Date().toISOString(),
  }

  return {
    ...extra,
    organizationId,
    governance,
  }
}

function parseSensitivity(value: unknown): RAGSensitivity {
  if (
    value === "public" ||
    value === "internal" ||
    value === "confidential" ||
    value === "restricted"
  ) {
    return value
  }
  return DEFAULT_SENSITIVITY
}
