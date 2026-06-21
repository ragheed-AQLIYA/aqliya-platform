/**
 * Evidence Engine — cross-product evidence registry + graph.
 * IC-P4.1: Evidence Engine consolidation.
 */
export {
  lookupEvidence,
  assertEvidenceDownloadAccess,
  registerEvidence,
  type EvidenceProductSlug,
  type EvidenceRegistryRecord,
  type EvidenceSensitivity,
  type LookupEvidenceInput,
  type RegisterEvidenceInput,
} from "./evidence-service";

export {
  linkLocalContentEvidenceAfterUpload,
  linkAuditEvidenceAfterUpload,
} from "./link-after-upload";

export {
  EvidenceGraph,
  ensureResourceGraphNode,
  createEdge,
  linkEvidenceToGraph,
} from "./graph";
