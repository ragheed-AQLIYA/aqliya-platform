/**
 * Evidence Engine — cross-product evidence registry + graph.
 * Phase 5B: CoreEvidence platform capability.
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
  registerCoreEvidence,
  getCoreEvidenceByProductRef,
  getCoreEvidenceById,
  transitionEvidenceLifecycle,
  createPlatformEvidenceLink,
  createEvidenceRelation,
  getEvidenceLifecycleHistory,
  getRelatedEvidence,
  listEvidenceForResource,
  type CoreEvidenceRecord,
  type RegisterCoreEvidenceInput,
} from "./core-evidence-service";

export {
  EVIDENCE_LIFECYCLE_STATUSES,
  EVIDENCE_RELATION_TYPES,
  EVIDENCE_LINK_TYPES,
  mapProductStateToLifecycle,
  isValidLifecycleTransition,
  type EvidenceLifecycleStatus,
  type EvidenceRelationType,
  type EvidenceLinkType,
} from "./lifecycle";

export {
  syncAuditEvidenceToCore,
  syncAuditEvidenceStateToCore,
  syncAuditEvidenceLinkToCore,
} from "./adapters/audit-adapter";

export {
  syncLocalContentEvidenceToCore,
  syncLocalContentEvidenceStateToCore,
} from "./adapters/local-content-adapter";

export {
  mapWorkflowActionToEvidenceLifecycle,
  inferWorkflowActionFromAuditState,
  inferWorkflowActionFromLocalContentStatus,
  applyWorkflowEvidenceTransition,
  syncEvidenceLifecycleFromProductState,
} from "./workflow-bridge";

export { getEvidenceHealthSnapshot, type EvidenceHealthSnapshot } from "./health";

export {
  linkLocalContentEvidenceAfterUpload,
  linkAuditEvidenceAfterUpload,
} from "./link-after-upload";

export {
  EvidenceGraph,
  ensureResourceGraphNode,
  createEdge,
  linkEvidenceToGraph,
  linkEvidenceToEntityInGraph,
  linkEvidenceLineageInGraph,
  getEvidenceLineageFromGraph,
} from "./graph";
