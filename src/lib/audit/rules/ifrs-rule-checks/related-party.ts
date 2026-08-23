import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const RP_HINTS = [
  "related party",
  "related parties",
  "associate",
  "subsidiary",
  "joint venture",
  "joint controller",
  "significant influence",
  "control",
  "أطراف ذات علاقة",
  "ذوي العلاقة",
  "شركة شقيقة",
  "شركة تابعة",
  "سيطرة",
];

const KMP_HINTS = [
  "key management",
  "kmp",
  "director",
  "officer",
  "board",
  "executive",
  "remuneration",
  "compensation",
  "إدارة العليا",
  "مدير",
  "مجلس الإدارة",
  "تنفيذي",
  "تعويضات",
];

const RP_TRANSACTION_HINTS = [
  "related party transaction",
  "intercompany",
  "inter-company",
  "due from related",
  "due to related",
  "advance to related",
  "advance from related",
  "معاملات أطراف ذات علاقة",
  "معاملات بين الأطراف",
  "ذمم أطراف ذات علاقة",
];

const ARM_LENGTH_HINTS = [
  "arm's length",
  "arm length",
  "comparable terms",
  "market terms",
  "تنافسي",
  "شروط السوق",
  "طول الذراع",
];

/**
 * IAS 24.13 — Disclose related party relationships, transactions and balances.
 */
export function handleRpDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRp = hasMappingHint(ctx, RP_HINTS);
  if (!hasRp) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أطراف ذات علاقة — القاعدة غير قابلة للتطبيق.",
      "No related party accounts — rule not applicable.",
    );
  }

  if (ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "بنود أطراف ذات علاقة موجودة بدون إفصاحات (IAS 24.13). تأكد من الإفصاح عن العلاقات والمعاملات والأرصدة.",
      "Related party accounts present without disclosures (IAS 24.13). Ensure disclosure of relationships, transactions and balances.",
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود أطراف ذات علاقة وإفصاحات موجودة.",
    "Related party accounts and disclosures present.",
  );
}

/**
 * IAS 24.18 — Disclose key management personnel compensation by category.
 */
export function handleKmpCompensation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasKmp = hasMappingHint(ctx, KMP_HINTS);
  if (!hasKmp) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تعويضات الإدارة العليا.",
      "No key management personnel accounts — skipped.",
    );
  }

  if (ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "بنود تعويضات الإدارة العليا موجودة بدون إفصاح (IAS 24.18). تأكد من الإفصاح عن التعويضات حسب الفئة.",
      "KMP compensation accounts present without disclosure (IAS 24.18). Ensure compensation is disclosed by category.",
    );
  }

  return baseEval(
    rule,
    "pass",
    "تعويضات الإدارة العليا والإفصاحات موجودة.",
    "KMP compensation and disclosures present.",
  );
}

/**
 * IAS 24.21 — Disclose amounts of transactions, balances, commitments.
 */
export function handleRpTransactions(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRpTx = hasMappingHint(ctx, RP_TRANSACTION_HINTS);
  const hasRp = hasMappingHint(ctx, RP_HINTS);

  if (!hasRpTx && !hasRp) {
    return baseEval(
      rule,
      "skipped",
      "لا معاملات أطراف ذات علاقة.",
      "No related party transactions — skipped.",
    );
  }

  if (!hasRpTx && hasRp) {
    return baseEval(
      rule,
      "advisory",
      "علاقات أطراف ذات علاقة موجودة. تأكد من الإفصاح عن المعاملات والأرصدة (IAS 24.21).",
      "Related party relationships present. Ensure disclosure of transactions and balances (IAS 24.21).",
    );
  }

  if (ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "معاملات أطراف ذات علاقة موجودة بدون إفصاح (IAS 24.21).",
      "Related party transactions present without disclosure (IAS 24.21).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "معاملات الأطراف ذات علاقة والإفصاحات موجودة.",
    "Related party transactions and disclosures present.",
  );
}

/**
 * IAS 24.24 — Disclose if transactions were made on arm's length terms.
 */
export function handleArmLength(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRp = hasMappingHint(ctx, RP_HINTS) || hasMappingHint(ctx, RP_TRANSACTION_HINTS);
  if (!hasRp) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أطراف ذات علاقة.",
      "No related party accounts — skipped.",
    );
  }

  const hasArmLength = hasMappingHint(ctx, ARM_LENGTH_HINTS);
  if (!hasArmLength) {
    return baseEval(
      rule,
      "advisory",
      "معاملات أطراف ذات علاقة موجودة. تأكد من الإفصاح عما إذا كانت بأسعار تنافسية (IAS 24.24).",
      "Related party transactions present. Ensure disclosure of whether terms are arm's length (IAS 24.24).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "الإفصاح عن الأسعار التنافسية موجود.",
    "Arm's length terms disclosure present.",
  );
}
