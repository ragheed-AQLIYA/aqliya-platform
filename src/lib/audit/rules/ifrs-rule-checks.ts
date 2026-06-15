import type { FinancialStatementLine } from "@/types/audit";
import { classifyBalanceMateriality } from "@/lib/audit/materiality";
import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "./types";

export interface IfrsEvaluationContext {
  engagementId: string;
  engagementStatus: string;
  reportingFramework: string;
  currencyCode: string;
  statementTypes: string[];
  statements: Array<{ statementType: string; lines: FinancialStatementLine[] }>;
  mappings: Array<{
    sourceAccountCode: string;
    sourceAccountName: string;
    status: string;
    statementClassification: string | null;
    canonicalName?: string | null;
    canonicalCategory?: string | null;
  }>;
  tbLines: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
  }>;
  disclosureNoteCount: number;
  performanceMateriality?: number;
}

function baseEval(
  rule: IfrsKnowledgeRule,
  status: IfrsRuleEvaluation["status"],
  messageAr: string,
  messageEn: string,
  linkedStatementTypes?: string[],
): IfrsRuleEvaluation {
  return {
    ruleId: rule.ruleId,
    standardCode: rule.standardCode,
    paragraphReference: rule.paragraphReference,
    topic: rule.topic,
    status,
    messageAr,
    messageEn,
    linkedStatementTypes,
  };
}

function confirmedMappings(ctx: IfrsEvaluationContext) {
  return ctx.mappings.filter((m) => m.status === "confirmed");
}

function hasMappingHint(
  ctx: IfrsEvaluationContext,
  hints: string[],
): boolean {
  return confirmedMappings(ctx).some((m) => {
    const blob = `${m.sourceAccountName} ${m.canonicalName ?? ""} ${m.canonicalCategory ?? ""} ${m.statementClassification ?? ""}`.toLowerCase();
    return hints.some((h) => blob.includes(h));
  });
}

function bsLines(ctx: IfrsEvaluationContext): FinancialStatementLine[] {
  return (
    ctx.statements.find((s) => s.statementType === "balance_sheet")?.lines ??
    []
  );
}

function cfLines(ctx: IfrsEvaluationContext): FinancialStatementLine[] {
  return (
    ctx.statements.find((s) => s.statementType === "cash_flow")?.lines ?? []
  );
}

export function evaluateIfrsRule(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  switch (rule.topic) {
    case "complete-set": {
      const required = ["balance_sheet", "income_statement", "equity"];
      const missing = required.filter((t) => !ctx.statementTypes.includes(t));
      if (missing.length > 0) {
        return baseEval(
          rule,
          "fail",
          `قوائم مالية ناقصة: ${missing.join(", ")}`,
          `Missing core statements: ${missing.join(", ")}`,
          missing,
        );
      }
      if (!ctx.statementTypes.includes("cash_flow")) {
        return baseEval(
          rule,
          "warning",
          "مجموعة القوائم الأساسية موجودة — قائمة التدفقات النقدية غير مُولّدة (فعّل FS v2).",
          "Core set present; cash flow statement not generated (enable FS v2).",
          ["cash_flow"],
        );
      }
      return baseEval(
        rule,
        "pass",
        "مجموعة القوائم المالية الكاملة متوفرة.",
        "Complete set of financial statements present.",
      );
    }

    case "going-concern": {
      if (ctx.engagementStatus === "liquidation") {
        return baseEval(
          rule,
          "warning",
          "التكليف في حالة تصفية — راجع افتراض الاستمرارية.",
          "Engagement in liquidation — going concern assumption requires review.",
        );
      }
      return baseEval(
        rule,
        "advisory",
        "افتراض الاستمرارية — لا مؤشرات تصفية في حالة التكليف.",
        "Going concern — no liquidation indicators on engagement status.",
      );
    }

    case "no-offsetting": {
      const negativeAssets = bsLines(ctx).filter(
        (l) =>
          !l.isTotal &&
          l.amount < 0 &&
          (l.label.toLowerCase().includes("asset") ||
            l.label.includes("أصول")),
      );
      if (negativeAssets.length > 0) {
        return baseEval(
          rule,
          "warning",
          `${negativeAssets.length} بند(اً) بأرصدة سالبة — راجع عدم المقاصة.`,
          `${negativeAssets.length} line(s) with negative asset presentation.`,
          ["balance_sheet"],
        );
      }
      return baseEval(
        rule,
        "pass",
        "لا توجد أرصدة سالبة ظاهرة في عرض الأصول.",
        "No apparent asset offsetting in balance sheet lines.",
      );
    }

    case "materiality-presentation": {
      const threshold = ctx.performanceMateriality ?? 0;
      if (threshold <= 0) {
        return baseEval(
          rule,
          "advisory",
          "مادية الأداء غير محسوبة — فحص العرض المادي استشاري.",
          "Performance materiality not computed — presentation check advisory.",
        );
      }
      const immaterialLines = bsLines(ctx).filter(
        (l) =>
          !l.isTotal &&
          l.amount !== 0 &&
          classifyBalanceMateriality(l.amount, threshold) === "immaterial",
      );
      if (immaterialLines.length > 5) {
        return baseEval(
          rule,
          "warning",
          `${immaterialLines.length} بند(اً) غير مادي — راجع تجميع العرض.`,
          `${immaterialLines.length} immaterial lines — review aggregation.`,
        );
      }
      return baseEval(
        rule,
        "pass",
        "عرض البنود المادية مقبول ضمن العتبة.",
        "Material line presentation within threshold.",
      );
    }

    case "note-disclosure": {
      if (ctx.disclosureNoteCount === 0) {
        return baseEval(
          rule,
          "warning",
          "لا توجد إيضاحات — مطلوب إيضاحات IFRS لتحقيق العرض العادل.",
          "No disclosure notes — IFRS notes required for fair presentation.",
        );
      }
      return baseEval(
        rule,
        "pass",
        `${ctx.disclosureNoteCount} إيضاح(ات) مسجّلة.`,
        `${ctx.disclosureNoteCount} disclosure note(s) on file.`,
      );
    }

    case "oci-presentation":
      return baseEval(
        rule,
        "skipped",
        "لا يوجد OCI منفصل في محرك v1 — متخطى.",
        "Separate OCI not modeled in v1 engine — skipped.",
      );

    case "five-step-model":
    case "contract-identification": {
      const hasRevenue = hasMappingHint(ctx, ["revenue", "sales", "إيراد"]);
      if (!hasRevenue) {
        return baseEval(
          rule,
          "skipped",
          "لا حسابات إيرادات مؤكدة — القاعدة غير قابلة للتطبيق.",
          "No confirmed revenue accounts — rule not applicable.",
          ["income_statement"],
        );
      }
      return baseEval(
        rule,
        "pass",
        "حسابات الإيرادات موجودة — راجع IFRS 15 يدوياً.",
        "Revenue accounts mapped — apply IFRS 15 five-step model in review.",
        ["income_statement"],
      );
    }

    case "definition":
    case "initial-measurement": {
      const hasPpe = hasMappingHint(ctx, [
        "property",
        "plant",
        "equipment",
        "ppe",
        "fixed",
        "ممتلكات",
        "معدات",
      ]);
      if (!hasPpe) {
        return baseEval(
          rule,
          "skipped",
          "لا بنود PPE — القاعدة غير قابلة للتطبيق.",
          "No PPE accounts — rule not applicable.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "بنود PPE موجودة — راجع IAS 16.",
        "PPE accounts present — review IAS 16.",
        ["balance_sheet"],
      );
    }

    case "depreciation": {
      const hasPpe = hasMappingHint(ctx, ["property", "plant", "equipment", "ppe"]);
      const hasDepr = hasMappingHint(ctx, [
        "depreciation",
        "accumulated",
        "dep",
        "إهلاك",
      ]);
      if (hasPpe && !hasDepr) {
        return baseEval(
          rule,
          "warning",
          "أصول ثابتة بدون إهلاك متراكم مُعيّن.",
          "PPE mapped without accumulated depreciation.",
          ["balance_sheet"],
        );
      }
      if (!hasPpe) {
        return baseEval(rule, "skipped", "لا PPE.", "No PPE — skipped.");
      }
      return baseEval(
        rule,
        "pass",
        "إهلاك/أصول ثابتة معيّنة.",
        "PPE and depreciation mapping present.",
      );
    }

    case "initial-recognition":
    case "lease-liability-measurement":
    case "rou-asset-measurement":
    case "lease-definition": {
      const hasLease = hasMappingHint(ctx, [
        "lease",
        "right-of-use",
        "rou",
        "إيجار",
      ]);
      if (!hasLease) {
        return baseEval(
          rule,
          "skipped",
          "لا عقود إيجار — IFRS 16 غير قابل للتطبيق.",
          "No lease accounts — IFRS 16 not applicable.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "بنود إيجار موجودة — راجع IFRS 16.",
        "Lease-related accounts mapped — review IFRS 16.",
        ["balance_sheet"],
      );
    }

    case "classification":
    case "operating-method": {
      if (!ctx.statementTypes.includes("cash_flow")) {
        return baseEval(
          rule,
          "warning",
          "لا قائمة تدفقات نقدية — IAS 7 غير مُحقق.",
          "No cash flow statement — IAS 7 not satisfied.",
          ["cash_flow"],
        );
      }
      const hasSections = cfLines(ctx).some((l) =>
        l.label.toUpperCase().includes("OPERATING"),
      );
      if (!hasSections) {
        return baseEval(
          rule,
          "warning",
          "قائمة التدفقات بدون أقسام تشغيل/استثمار/تمويل.",
          "Cash flow missing operating/investing/financing sections.",
          ["cash_flow"],
        );
      }
      return baseEval(
        rule,
        "pass",
        "قائمة التدفقات النقدية مصنّفة.",
        "Cash flow statement classified per IAS 7.",
        ["cash_flow"],
      );
    }

    default:
      return baseEval(
        rule,
        "skipped",
        "موضوع غير مُنفّذ في Phase 6.",
        "Topic not executable in Phase 6.",
      );
  }
}
