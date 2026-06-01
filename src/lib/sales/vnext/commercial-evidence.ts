// ─── SalesOS commercial evidence tracking ───

import { validateProductEvidenceType } from "@/lib/platform/registry/runtime";
import { SALESOS_PRODUCT_KEY } from "../core-adoption";

export type CommercialEvidenceCategory =
  | "qualification_note"
  | "proposal_attachment"
  | "meeting_notes"
  | "reference_check"
  | "pricing_rationale";

export interface CommercialEvidenceRecord {
  id: string;
  organizationId: string;
  opportunityId: string;
  category: CommercialEvidenceCategory;
  typeId: string;
  summary: string;
  linkedAt: string;
  linkedById: string;
}

export function validateCommercialEvidence(typeId: string): boolean {
  return validateProductEvidenceType(SALESOS_PRODUCT_KEY, typeId);
}

export function computeEvidenceCoverage(
  records: CommercialEvidenceRecord[],
  requiredCategories: CommercialEvidenceCategory[],
): { coveragePct: number; missing: CommercialEvidenceCategory[] } {
  const present = new Set(records.map((r) => r.category));
  const missing = requiredCategories.filter((c) => !present.has(c));
  const coveragePct =
    requiredCategories.length === 0
      ? 100
      : Math.round(
          ((requiredCategories.length - missing.length) / requiredCategories.length) *
            100,
        );
  return { coveragePct, missing };
}

export const DEFAULT_COMMERCIAL_EVIDENCE_REQUIREMENTS: CommercialEvidenceCategory[] = [
  "qualification_note",
  "meeting_notes",
];
