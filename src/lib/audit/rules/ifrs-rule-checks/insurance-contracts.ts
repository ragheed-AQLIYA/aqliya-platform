import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const INSURANCE_HINTS = [
  "insurance contract",
  "insurance liability",
  "insurance reserve",
  "claim",
  "policy",
  "reinsurance",
  "عقد تأمين",
  "التزامات تأمين",
  "مطالبات",
  "بوليصة",
  "إعادة تأمين",
];

const ADEQUACY_HINTS = [
  "liability adequacy test",
  "adequacy test",
  "deficiency",
  "اختبار كفاية الالتزامات",
  "عجز",
];

const DERECOGNITION_HINTS = [
  "discharge",
  "cancelled",
  "expired",
  "derecognition",
  "تخليص",
  "إلغاء",
  "انتهاء",
  "إنهاء الاعتراف",
];

const DISCLOSURE_HINTS = [
  "insurance disclosure",
  "insurance accounting policy",
  "risk disclosure",
  "إفصاح عن التأمين",
  "سياسة محاسبية للتأمين",
];

/**
 * IFRS 4.12 — Do not recognise liability for possible future claims not in existence at reporting date.
 */
export function handleInsuranceLiabilityRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInsurance = hasMappingHint(ctx, INSURANCE_HINTS);
  if (!hasInsurance) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عقود تأمين — القاعدة غير قابلة للتطبيق.",
      "No insurance contract accounts — rule not applicable.",
    );
  }

  const hasFutureClaims = hasMappingHint(ctx, ["future claims", "possible future", "مطالبات مستقبلية"]);
  if (hasFutureClaims) {
    return baseEval(
      rule,
      "warning",
      "التزام معترف به لمطالبات مستقبلية محتملة غير موجودة في تاريخ التقرير — مخالف لـ IFRS 4.12.",
      "Liability recognised for possible future claims not in existence at reporting date — violates IFRS 4.12.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "لا التزامات لمطالبات مستقبلية غير موجودة — متوافق مع IFRS 4.12.",
    "No liabilities for non-existent future claims — compliant with IFRS 4.12.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 4.15 — Perform liability adequacy test for insurance liabilities at each reporting date.
 */
export function handleInsuranceLiabilityAdequacyTest(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInsurance = hasMappingHint(ctx, INSURANCE_HINTS);
  if (!hasInsurance) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عقود تأمين.",
      "No insurance contract accounts — skipped.",
    );
  }

  const hasAdequacy = hasMappingHint(ctx, ADEQUACY_HINTS);
  if (!hasAdequacy) {
    return baseEval(
      rule,
      "warning",
      "التزامات تأمين موجودة بدون اختبار كفاية الالتزامات (IFRS 4.15).",
      "Insurance liabilities present without liability adequacy test (IFRS 4.15).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "اختبار كفاية التزامات التأمين موثق.",
    "Insurance liability adequacy test documented.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 4.16 — Remove insurance liability when obligation is discharged, cancelled, or expires.
 */
export function handleInsuranceLiabilityDerecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInsurance = hasMappingHint(ctx, INSURANCE_HINTS);
  if (!hasInsurance) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عقود تأمين.",
      "No insurance contract accounts — skipped.",
    );
  }

  const hasDerecognition = hasMappingHint(ctx, DERECOGNITION_HINTS);
  if (hasDerecognition) {
    return baseEval(
      rule,
      "pass",
      "إنهاء الاعتراف بالتزامات التأمين عند التخليص/الإلغاء/الانتهاء موثق.",
      "Insurance liability derecognition on discharge/cancellation/expiry documented.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من إنهاء الاعتراف بالتزامات التأمين فقط عند التخليص أو الإلغاء أو الانتهاء (IFRS 4.16).",
    "Ensure insurance liabilities are derecognised only on discharge, cancellation, or expiry (IFRS 4.16).",
    ["balance_sheet"],
  );
}

/**
 * IFRS 4.20 — Disclose amounts recognised in financial statements arising from insurance contracts.
 */
export function handleInsuranceDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInsurance = hasMappingHint(ctx, INSURANCE_HINTS);
  if (!hasInsurance) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عقود تأمين.",
      "No insurance contract accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "عقود تأمين بدون إفصاح عن المبالغ المعترف بها والسياسات المحاسبية (IFRS 4.20).",
      "Insurance contracts without disclosure of recognised amounts and accounting policies (IFRS 4.20).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات عقود التأمين موجودة.",
    "Insurance contract disclosures present.",
  );
}
