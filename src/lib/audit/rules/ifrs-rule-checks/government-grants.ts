import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const GRANT_HINTS = [
  "government grant",
  "grant",
  "subsidy",
  "government assistance",
  "منحة حكومية",
  "إعانة حكومية",
  "دعم حكومي",
  "منحة",
];

const GRANT_INCOME_HINTS = [
  "grant income",
  "grant recognised",
  "other income grant",
  "grant received",
  "إيراد منحة",
  "إعانة مالية",
];

const DEFERRED_INCOME_HINTS = [
  "deferred income",
  "deferred grant",
  "deferred revenue grant",
  "إيراد مؤجل",
  "منحة مؤجلة",
];

const ASSET_DEDUCTION_HINTS = [
  "asset deduction",
  "net carrying amount",
  "grant deducted",
  "خصم من الأصل",
  "مخصوم من القيمة الدفترية",
];

const EQUITY_DIRECT_HINTS = [
  "equity grant",
  "direct equity",
  "capital reserve grant",
  "حقوق ملكية",
  "احتياطي رأس المال",
];

const GRANT_DISCLOSURE_HINTS = [
  "grant disclosure",
  "grant policy",
  "grant conditions",
  "grant contingencies",
  "إفصاح عن المنح",
  "شروط المنحة",
];

/**
 * IAS 20.12 — Grants recognised in P&L, not credited directly to equity.
 */
export function handleGrantRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasGrant = hasMappingHint(ctx, GRANT_HINTS);
  if (!hasGrant) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود منح حكومية — القاعدة غير قابلة للتطبيق.",
      "No government grant accounts — rule not applicable.",
    );
  }

  const hasEquityDirect = hasMappingHint(ctx, EQUITY_DIRECT_HINTS);
  const hasGrantIncome = hasMappingHint(ctx, GRANT_INCOME_HINTS);

  if (hasEquityDirect && !hasGrantIncome) {
    return baseEval(
      rule,
      "warning",
      "منحة حكومية معيّنة قد تكون مُرحّلة مباشرة إلى حقوق الملكية. تأكد من الاعتراف بها في الأرباح أو الخسائر (IAS 20.12).",
      "Government grant may be credited directly to equity. Ensure it is recognised in profit or loss (IAS 20.12).",
      ["income_statement"],
    );
  }

  if (!hasGrantIncome && !hasEquityDirect) {
    return baseEval(
      rule,
      "advisory",
      "بنود منح حكومية موجودة. تأكد من الاعتراف بالمنح في الأرباح أو الخسائر على مدى الفترات اللازمة لمطابقة التكاليف ذات الصلة (IAS 20.12).",
      "Government grant accounts present. Ensure grants are recognised in P&L over periods necessary to match related costs (IAS 20.12).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "إيراد المنح الحكومية معترف به في قائمة الدخل.",
    "Government grant income recognised in profit or loss.",
    ["income_statement"],
  );
}

/**
 * IAS 20.24 — Compensation grants for expenses already incurred recognised immediately.
 */
export function handleGrantCompensation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasGrant = hasMappingHint(ctx, GRANT_HINTS);
  if (!hasGrant) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود منح حكومية.",
      "No government grant accounts — skipped.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من الاعتراف بمنح التعويض عن مصاريف أو خسائر سابقة في الفترة التي تصبح فيها مستحقة (IAS 20.24).",
    "Ensure compensation grants for expenses already incurred are recognised in the period they become receivable (IAS 20.24).",
  );
}

/**
 * IAS 20.26 — Grants related to assets presented as deferred income or deducted from asset.
 */
export function handleGrantPresentation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasGrant = hasMappingHint(ctx, GRANT_HINTS);
  if (!hasGrant) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود منح حكومية.",
      "No government grant accounts — skipped.",
    );
  }

  const hasDeferredIncome = hasMappingHint(ctx, DEFERRED_INCOME_HINTS);
  const hasAssetDeduction = hasMappingHint(ctx, ASSET_DEDUCTION_HINTS);

  if (!hasDeferredIncome && !hasAssetDeduction) {
    return baseEval(
      rule,
      "warning",
      "منح حكومية للأصول موجودة بدون إيراد مؤجل أو خصم من الأصل (IAS 20.26). تأكد من العرض الصحيح.",
      "Asset-related government grants present without deferred income or asset deduction (IAS 20.26). Ensure proper presentation.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "عرض المنح الحكومية للأصول محدد (إيراد مؤجل أو خصم من الأصل).",
    "Government grant presentation for assets identified (deferred income or asset deduction).",
    ["balance_sheet"],
  );
}

/**
 * IAS 20.39 — Disclose accounting policy, nature and extent of grants, conditions and contingencies.
 */
export function handleGrantDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasGrant = hasMappingHint(ctx, GRANT_HINTS);
  if (!hasGrant) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود منح حكومية.",
      "No government grant accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, GRANT_DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "منح حكومية موجودة بدون إفصاح عن السياسة المحاسبية والشروط والظروف المعلقة (IAS 20.39).",
      "Government grants present without disclosure of accounting policy, conditions and contingencies (IAS 20.39).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات المنح الحكومية موجودة.",
    "Government grant disclosures present.",
  );
}
