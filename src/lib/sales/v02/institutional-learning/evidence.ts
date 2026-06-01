import type {
  InstitutionalEvidenceSource,
  InstitutionalLearningEvidence,
} from "./types";

export function learningEvidence(
  source: InstitutionalEvidenceSource,
  refId: string,
  summary: string,
  summaryAr: string,
): InstitutionalLearningEvidence {
  return { source, refId, summary, summaryAr };
}
