import type { FinancialStatementLine } from "@/types/audit";
import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "./types";

export interface SocpaEvaluationContext {
  engagementId: string;
  engagementStatus: string;
  reportingFramework: string;
  currencyCode: string;
  jurisdiction: string;
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
  disclosureNoteCount: number;
  disclosureNotes: Array<{ title: string; content: string; noteType: string }>;
}

export function isSocpaJurisdiction(ctx: SocpaEvaluationContext): boolean {
  if (ctx.jurisdiction === "saudi-arabia") return true;
  return ctx.currencyCode === "SAR";
}

function baseEval(
  rule: SocpaKnowledgeRule,
  status: SocpaRuleEvaluation["status"],
  messageAr: string,
  messageEn: string,
  linkedStatementTypes?: string[],
): SocpaRuleEvaluation {
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

function confirmedMappings(ctx: SocpaEvaluationContext) {
  return ctx.mappings.filter((m) => m.status === "confirmed");
}

function hasHint(ctx: SocpaEvaluationContext, hints: string[]): boolean {
  return confirmedMappings(ctx).some((m) => {
    const blob = `${m.sourceAccountName} ${m.canonicalName ?? ""} ${m.statementClassification ?? ""}`.toLowerCase();
    return hints.some((h) => blob.includes(h));
  });
}

function hasZakatTaxNote(ctx: SocpaEvaluationContext): boolean {
  return ctx.disclosureNotes.some((n) => {
    const blob = `${n.title} ${n.content} ${n.noteType}`.toLowerCase();
    return (
      blob.includes("zakat") ||
      blob.includes("زكاة") ||
      blob.includes("tax") ||
      blob.includes("ضريبة")
    );
  });
}

export function evaluateSocpaRule(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation {
  if (!isSocpaJurisdiction(ctx)) {
    if (rule.topic === "routing-gate") {
      return baseEval(
        rule,
        "skipped",
        "التكليف خارج نطاق SOCPA السعودي — متخطى.",
        "Engagement outside Saudi SOCPA scope — skipped.",
      );
    }
    return baseEval(
      rule,
      "skipped",
      "SOCPA لا ينطبق — العملة/الاختصاص غير سعودي.",
      "SOCPA not applicable — non-Saudi jurisdiction.",
    );
  }

  switch (rule.topic) {
    case "routing-gate":
      return baseEval(
        rule,
        "pass",
        "اختصاص سعودي — محرك SOCPA نشط.",
        "Saudi jurisdiction — SOCPA engine active.",
      );

    case "overlay-principle":
    case "lineage-required":
      return baseEval(
        rule,
        "advisory",
        "طبقة SOCPA تكمّل IFRS — راجع lineage في knowledge-foundation.",
        "SOCPA overlay supplements IFRS — review knowledge lineage.",
      );

    case "framework-scope": {
      const core = ["balance_sheet", "income_statement", "equity"];
      const missing = core.filter((t) => !ctx.statementTypes.includes(t));
      if (missing.length > 0) {
        return baseEval(
          rule,
          "fail",
          `نطاق SOCPA: قوائم ناقصة (${missing.join(", ")})`,
          `SOCPA framework scope: missing statements (${missing.join(", ")})`,
        );
      }
      return baseEval(
        rule,
        "pass",
        "نطاق القوائم ضمن إطار SOCPA مقبول.",
        "Statement scope within SOCPA framework.",
      );
    }

    case "fair-presentation":
      if (ctx.statementTypes.length === 0) {
        return baseEval(
          rule,
          "fail",
          "لا قوائم مالية — العرض العادل غير ممكن.",
          "No financial statements — fair presentation not possible.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "القوائم المالية موجودة لدعم العرض العادل.",
        "Financial statements present for fair presentation.",
      );

    case "framework-disclosure":
    case "supplementary-disclosure": {
      if (ctx.disclosureNoteCount === 0) {
        return baseEval(
          rule,
          "warning",
          "إيضاحات SOCPA/IFRS مكملة مطلوبة — لا إيضاحات مسجّلة.",
          "SOCPA supplementary disclosures required — no notes on file.",
        );
      }
      return baseEval(
        rule,
        "pass",
        `${ctx.disclosureNoteCount} إيضاح(ات) مسجّلة.`,
        `${ctx.disclosureNoteCount} disclosure note(s) on file.`,
      );
    }

    case "full-ifrs": {
      const fw = ctx.reportingFramework.toLowerCase();
      if (fw.includes("sme")) {
        return baseEval(
          rule,
          "warning",
          "إطار IFRS for SMEs — تحقق من أهلية SOCPA للشركات المدرجة.",
          "IFRS for SMEs framework — verify SOCPA full IFRS eligibility.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "إطار تقرير يتوافق مع تبني IFRS الكامل.",
        "Reporting framework aligned with full IFRS adoption.",
      );
    }

    case "ifrs-smes-eligibility": {
      const fw = ctx.reportingFramework.toLowerCase();
      if (fw.includes("sme")) {
        return baseEval(
          rule,
          "pass",
          "IFRS for SMEs مُعلَن — راجع معايير الأهلية SOCPA.",
          "IFRS for SMEs declared — review SOCPA eligibility criteria.",
        );
      }
      return baseEval(
        rule,
        "advisory",
        "ليس IFRS for SMEs — قاعدة الأهلية استشارية.",
        "Not IFRS for SMEs — eligibility rule advisory.",
      );
    }

    case "zakat-presentation":
    case "separate-disclosure": {
      const hasZakatTax = hasHint(ctx, [
        "zakat",
        "زكاة",
        "tax",
        "ضريبة",
        "income tax",
      ]);
      if (!hasZakatTax) {
        return baseEval(
          rule,
          "skipped",
          "لا حسابات زكاة/ضريبة — القاعدة غير قابلة للتطبيق.",
          "No zakat/tax accounts — rule not applicable.",
        );
      }
      if (!hasZakatTaxNote(ctx)) {
        return baseEval(
          rule,
          "warning",
          "حسابات زكاة/ضريبة بدون إيضاح منفصل.",
          "Zakat/tax accounts without separate disclosure note.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "عرض/إيضاح الزكاة والضريبة موثّق.",
        "Zakat/tax presentation/disclosure documented.",
      );
    }

    case "reconciliation":
    case "ias12-overlay": {
      const hasTax = hasHint(ctx, ["tax", "ضريبة", "deferred tax"]);
      const hasZakat = hasHint(ctx, ["zakat", "زكاة"]);
      if (hasTax && hasZakat && !hasZakatTaxNote(ctx)) {
        return baseEval(
          rule,
          "warning",
          "زكاة وضريبة معاً — مطلوب إيضاح مطابقة IAS 12/SOCPA.",
          "Both zakat and tax — IAS 12/SOCPA reconciliation disclosure required.",
        );
      }
      if (!hasTax && !hasZakat) {
        return baseEval(rule, "skipped", "لا زكاة/ضريبة.", "No zakat/tax — skipped.");
      }
      return baseEval(
        rule,
        "pass",
        "بنود الزكاة/الضريبة مع إيضاح أو بدون تعارض ظاهر.",
        "Zakat/tax items with disclosure or no apparent conflict.",
      );
    }

    default:
      return baseEval(
        rule,
        "skipped",
        "موضوع SOCPA غير مُنفّذ في Phase 7.",
        "SOCPA topic not executable in Phase 7.",
      );
  }
}
