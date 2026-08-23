import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const FIRST_IFRS_HINTS = [
  "first ifrs",
  "first-time adoption",
  "transition to ifrs",
  "ifrs 1",
  "first adoption",
  "أول تطبيق",
  "الانتقال إلى المعايير",
  "تبني لأول مرة",
];

const FIRST_STATEMENTS_HINTS = [
  "first ifrs financial statements",
  "first ifrs statements",
  "opening ifrs balance sheet",
  "أول قوائم مالية",
  "ميزانية افتتاحية",
];

const OPENING_HINTS = [
  "opening statement of financial position",
  "opening balance sheet",
  "transition date",
  "ميزانية افتتاحية",
  "تاريخ الانتقال",
];

const RETROSPECTIVE_HINTS = [
  "retrospective application",
  "retrospectively",
  "exemptions",
  "exceptions",
  "أثر رجعي",
  "بأثر رجعي",
  "إعفاءات",
  "استثناءات",
];

/**
 * IFRS 1.2 — First-time adopters shall apply IFRS 1 for their first IFRS financial statements.
 */
export function handleFirstIfrsScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFirstIfrs = hasMappingHint(ctx, FIRST_IFRS_HINTS);
  if (!hasFirstIfrs) {
    return baseEval(
      rule, "skipped",
      "لا بنود أول تطبيق لـ IFRS — القاعدة غير قابلة للتطبيق.",
      "No first-time IFRS adoption accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "نطاق أول تطبيق لـ IFRS محدد.",
    "First-time IFRS adoption scope identified.",
  );
}

/**
 * IFRS 1.6 — Prepare first IFRS financial statements with explicit and unreserved statement of compliance.
 */
export function handleFirstIfrsStatements(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFirstIfrs = hasMappingHint(ctx, FIRST_IFRS_HINTS);
  if (!hasFirstIfrs) {
    return baseEval(
      rule, "skipped",
      "لا بنود أول تطبيق.",
      "No first-time IFRS adoption accounts — skipped.",
    );
  }
  const hasStatements = hasMappingHint(ctx, FIRST_STATEMENTS_HINTS);
  if (!hasStatements) {
    return baseEval(
      rule, "warning",
      "أول تطبيق بدون إعداد أول قوائم مالية ببيان امتثال صريح (IFRS 1.6).",
      "First-time adoption without first IFRS statements with explicit compliance statement (IFRS 1.6).",
    );
  }
  return baseEval(
    rule, "pass",
    "أول قوائم IFRS المالية موثقة.",
    "First IFRS financial statements documented.",
  );
}

/**
 * IFRS 1.6 — Prepare opening IFRS balance sheet at transition date.
 */
export function handleOpeningStatement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFirstIfrs = hasMappingHint(ctx, FIRST_IFRS_HINTS);
  if (!hasFirstIfrs) {
    return baseEval(
      rule, "skipped",
      "لا بنود أول تطبيق.",
      "No first-time IFRS adoption accounts — skipped.",
    );
  }
  const hasOpening = hasMappingHint(ctx, OPENING_HINTS);
  if (!hasOpening) {
    return baseEval(
      rule, "warning",
      "أول تطبيق بدون إعداد ميزانية افتتاحية بتاريخ الانتقال (IFRS 1.6).",
      "First-time adoption without opening balance sheet at transition date (IFRS 1.6).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "الميزانية الافتتاحية بتاريخ الانتقال موثقة.",
    "Opening balance sheet at transition date documented.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 1.7 — Apply IFRS accounting policies retrospectively with permitted exemptions and exceptions.
 */
export function handleRetrospectiveApplication(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFirstIfrs = hasMappingHint(ctx, FIRST_IFRS_HINTS);
  if (!hasFirstIfrs) {
    return baseEval(
      rule, "skipped",
      "لا بنود أول تطبيق.",
      "No first-time IFRS adoption accounts — skipped.",
    );
  }
  const hasRetrospective = hasMappingHint(ctx, RETROSPECTIVE_HINTS);
  if (!hasRetrospective) {
    return baseEval(
      rule, "warning",
      "أول تطبيق بدون توثيق التطبيق بأثر رجعي والإعفاءات المسموح بها (IFRS 1.7).",
      "First-time adoption without retrospective application and permitted exemptions (IFRS 1.7).",
    );
  }
  return baseEval(
    rule, "pass",
    "التطبيق بأثر رجعي والإعفاءات موثقة.",
    "Retrospective application and exemptions documented.",
  );
}
