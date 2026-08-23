import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const SERVICE_CONCESSION_HINTS = [
  "service concession",
  "service concession arrangement",
  "public-to-private",
  "public-private partnership",
  "bot",
  "boot",
  "امتياز خدمي",
  "شراكة عامة خاصة",
];

const FINANCIAL_INTANGIBLE_HINTS = [
  "financial asset",
  "intangible asset",
  "construction revenue",
  "operation revenue",
  "أصل مالي",
  "أصل غير ملموس",
  "إيراد إنشاء",
  "إيراد تشغيل",
];

const OPERATION_HINTS = [
  "operation services",
  "maintenance service",
  "operating",
  "خدمات تشغيل",
  "خدمات صيانة",
  "تشغيل",
];

const MAINTENANCE_HINTS = [
  "maintenance obligation",
  "maintenance provision",
  "renewal obligation",
  "التزام صيانة",
  "مخصص صيانة",
  "التزام تجديد",
];

/**
 * IFRIC 12.2 — Scope: service concession arrangements between public and private entities.
 */
export function handleServiceConcessionScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasConcession = hasMappingHint(ctx, SERVICE_CONCESSION_HINTS);
  if (!hasConcession) {
    return baseEval(
      rule, "skipped",
      "لا بنود امتيازات خدمية — القاعدة غير قابلة للتطبيق.",
      "No service concession accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "نطاق IFRIC 12 محدد للامتيازات الخدمية.",
    "IFRIC 12 scope identified for service concessions.",
  );
}

/**
 * IFRIC 12.16 — Classify concession operator's right as financial asset or intangible asset.
 */
export function handleFinancialVsIntangible(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasConcession = hasMappingHint(ctx, SERVICE_CONCESSION_HINTS);
  if (!hasConcession) {
    return baseEval(
      rule, "skipped",
      "لا بنود امتيازات خدمية.",
      "No service concession accounts — skipped.",
    );
  }
  const hasClassification = hasMappingHint(ctx, FINANCIAL_INTANGIBLE_HINTS);
  if (!hasClassification) {
    return baseEval(
      rule, "warning",
      "امتياز خدمي بدون تصنيف حق المشغّل كأصل مالي أو أصل غير ملموس (IFRIC 12.16).",
      "Service concession without operator right classification as financial or intangible asset (IFRIC 12.16).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "تصنيف حق المشغّل موثق.",
    "Operator right classification documented.",
    ["balance_sheet"],
  );
}

/**
 * IFRIC 12.17 — Recognise revenue for operation and maintenance services.
 */
export function handleOperationServices(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasConcession = hasMappingHint(ctx, SERVICE_CONCESSION_HINTS);
  if (!hasConcession) {
    return baseEval(
      rule, "skipped",
      "لا بنود امتيازات خدمية.",
      "No service concession accounts — skipped.",
    );
  }
  const hasOperation = hasMappingHint(ctx, OPERATION_HINTS);
  if (!hasOperation) {
    return baseEval(
      rule, "advisory",
      "تأكد من الاعتراف بإيراد خدمات التشغيل والصيانة (IFRIC 12.17).",
      "Ensure revenue for operation and maintenance services is recognised (IFRIC 12.17).",
      ["income_statement"],
    );
  }
  return baseEval(
    rule, "pass",
    "إيراد خدمات التشغيل معترف به.",
    "Operation services revenue recognised.",
    ["income_statement"],
  );
}

/**
 * IFRIC 12.23 — Recognise provision for maintenance and renewal obligations.
 */
export function handleMaintenanceObligation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasConcession = hasMappingHint(ctx, SERVICE_CONCESSION_HINTS);
  if (!hasConcession) {
    return baseEval(
      rule, "skipped",
      "لا بنود امتيازات خدمية.",
      "No service concession accounts — skipped.",
    );
  }
  const hasMaintenance = hasMappingHint(ctx, MAINTENANCE_HINTS);
  if (!hasMaintenance) {
    return baseEval(
      rule, "advisory",
      "تأكد من الاعتراف بمخصص التزامات الصيانة والتجديد (IFRIC 12.23).",
      "Ensure provision for maintenance and renewal obligations is recognised (IFRIC 12.23).",
    );
  }
  return baseEval(
    rule, "pass",
    "مخصص التزامات الصيانة معترف به.",
    "Maintenance obligation provision recognised.",
  );
}
