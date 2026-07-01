// Governance Engine — Identifier Patterns
// M2 Baseline v1.2 (Frozen)
// All ID patterns must match these regexes

export const ID_PATTERNS = {
  PRODUCT: /^PROD-[A-Z][A-Z0-9-]+$/,
  CLAIM: /^CLM-[A-Z]+-\d{4}$/,
  EVIDENCE: /^EV-\d{4}$/,
  SOURCE: /^SRC-(CODE|SCHEMA|TEST|DOC|OPERATION|CONFIG|COMMAND)-\d{4}$/,
  AUTHORITY: /^AUTH-[A-Z][A-Z0-9-]+$/,
  DECISION: /^DEC-\d{4}-\d{4}$/,
  REVIEW: /^REV-\d{4}-\d{4}$/,
  FINDING: /^FND-[A-Z0-9]+-\d{2}$/,
  CAPABILITY: /^CAP-\d{3}$/,
  KNOWLEDGE_AREA: /^KA-\d{2}$/,
  HISTORICAL_REF: /^HC-[A-Z]+-\d{3}$/,
};

export function validateId(id: string, pattern: RegExp): boolean {
  return pattern.test(id);
}

export function assertId(id: string, pattern: RegExp, label: string): void {
  if (!pattern.test(id)) {
    throw new Error(`Invalid ${label} identifier: "${id}". Expected pattern: ${pattern}`);
  }
}
