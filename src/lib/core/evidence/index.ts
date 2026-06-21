/**
 * Evidence Engine facade (Tier 1 registry + future graph linkage).
 */
export type {
  EvidenceProductSlug,
  EvidenceRegistryRecord,
  EvidenceSensitivity,
  LookupEvidenceInput,
  RegisterEvidenceInput,
} from "@/lib/platform/evidence/evidence-service";

export {
  assertEvidenceDownloadAccess,
  lookupEvidence,
  registerEvidence,
} from "@/lib/platform/evidence/evidence-service";

export {
  EvidenceGraph,
  createEdge,
  ensureResourceGraphNode,
  linkEvidenceToGraph,
} from "./graph";

export {
  linkAuditEvidenceAfterUpload,
  linkLocalContentEvidenceAfterUpload,
} from "./link-after-upload";
