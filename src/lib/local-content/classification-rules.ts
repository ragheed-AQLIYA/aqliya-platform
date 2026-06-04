/**
 * LC-04 — classification rule registry (deterministic, metadata overrides).
 */

import {
  VALID_CLASSIFICATION_BASES,
  VALID_CONFIDENCE_LEVELS,
  type ClassificationBasis,
  type ConfidenceLevel,
} from "./types";

export type ClassificationRule = {
  id: string;
  category: string;
  labelAr: string;
  minLocalPct: number;
  allowedBases: ClassificationBasis[];
  minConfidence: ConfidenceLevel;
  active: boolean;
};

export const DEFAULT_CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    id: "services",
    category: "services",
    labelAr: "خدمات",
    minLocalPct: 30,
    allowedBases: ["certificate", "contract_term", "self_declaration"],
    minConfidence: "medium",
    active: true,
  },
  {
    id: "equipment",
    category: "equipment",
    labelAr: "معدات",
    minLocalPct: 25,
    allowedBases: ["certificate", "contract_term"],
    minConfidence: "medium",
    active: true,
  },
  {
    id: "consulting",
    category: "consulting",
    labelAr: "استشارات",
    minLocalPct: 40,
    allowedBases: ["certificate", "analyst_estimate", "contract_term"],
    minConfidence: "high",
    active: true,
  },
  {
    id: "construction",
    category: "construction",
    labelAr: "إنشاءات",
    minLocalPct: 35,
    allowedBases: ["certificate", "contract_term"],
    minConfidence: "high",
    active: true,
  },
];

const BASIS_LABELS: Record<ClassificationBasis, string> = {
  certificate: "شهادة",
  self_declaration: "إقرار ذاتي",
  contract_term: "بند عقد",
  analyst_estimate: "تقدير محلل",
};

export function getClassificationBasisLabel(basis: string): string {
  return BASIS_LABELS[basis as ClassificationBasis] ?? basis;
}

export function parseClassificationRulesFromMetadata(
  metadata: unknown,
): ClassificationRule[] | null {
  if (!metadata || typeof metadata !== "object") return null;
  const rules = (metadata as { classificationRules?: unknown })
    .classificationRules;
  if (!Array.isArray(rules)) return null;
  const parsed: ClassificationRule[] = [];
  for (const raw of rules) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const category = typeof r.category === "string" ? r.category : null;
    const minLocalPct = Number(r.minLocalPct);
    if (!category || !Number.isFinite(minLocalPct)) continue;
    parsed.push({
      id: typeof r.id === "string" ? r.id : category,
      category,
      labelAr: typeof r.labelAr === "string" ? r.labelAr : category,
      minLocalPct,
      allowedBases: Array.isArray(r.allowedBases)
        ? r.allowedBases.filter((b): b is ClassificationBasis =>
            (VALID_CLASSIFICATION_BASES as readonly string[]).includes(
              String(b),
            ),
          )
        : ["certificate"],
      minConfidence: (VALID_CONFIDENCE_LEVELS as readonly string[]).includes(
        String(r.minConfidence),
      )
        ? (r.minConfidence as ConfidenceLevel)
        : "medium",
      active: r.active !== false,
    });
  }
  return parsed.length > 0 ? parsed : null;
}

export function resolveClassificationRules(metadata?: unknown): ClassificationRule[] {
  return (
    parseClassificationRulesFromMetadata(metadata) ?? DEFAULT_CLASSIFICATION_RULES
  );
}

export function validateClassificationAgainstRules(
  rules: ClassificationRule[],
  input: {
    category: string;
    localPercentage: number;
    classificationBasis: string;
    confidence?: string | null;
  },
): { ok: boolean; violations: string[] } {
  const rule =
    rules.find(
      (r) => r.active && r.category.toLowerCase() === input.category.toLowerCase(),
    ) ?? null;
  if (!rule) {
    return { ok: true, violations: [] };
  }

  const violations: string[] = [];
  if (input.localPercentage < rule.minLocalPct) {
    violations.push(
      `نسبة محلية ${input.localPercentage}% أقل من الحد ${rule.minLocalPct}% لفئة ${rule.labelAr}`,
    );
  }
  if (
    !(rule.allowedBases as readonly string[]).includes(input.classificationBasis)
  ) {
    violations.push(
      `أساس التصنيف غير مسموح — المسموح: ${rule.allowedBases.map(getClassificationBasisLabel).join("، ")}`,
    );
  }
  const conf = input.confidence ?? "unverified";
  const order = ["unverified", "low", "medium", "high"];
  if (
    order.indexOf(conf) < order.indexOf(rule.minConfidence)
  ) {
    violations.push(`الثقة ${conf} أقل من المطلوب ${rule.minConfidence}`);
  }

  return { ok: violations.length === 0, violations };
}
