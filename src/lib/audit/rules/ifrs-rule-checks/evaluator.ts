import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval } from "./common";
import { handleCompleteSet } from "./complete-set";
import { handleGoingConcern } from "./going-concern";
import { handleNoOffsetting } from "./no-offsetting";
import { handleMaterialityPresentation } from "./materiality";
import { handleNoteDisclosure } from "./note-disclosure";
import { handleOciPresentation } from "./oci-presentation";
import { handleRevenue } from "./revenue";
import { handlePpeRecognition, handleDepreciation } from "./ppe";
import { handleLeases } from "./leases";
import { handleCashFlow } from "./cash-flow";

export function evaluateIfrsRule(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  switch (rule.topic) {
    case "complete-set":
      return handleCompleteSet(rule, ctx);

    case "going-concern":
      return handleGoingConcern(rule, ctx);

    case "no-offsetting":
      return handleNoOffsetting(rule, ctx);

    case "materiality-presentation":
      return handleMaterialityPresentation(rule, ctx);

    case "note-disclosure":
      return handleNoteDisclosure(rule, ctx);

    case "oci-presentation":
      return handleOciPresentation(rule, ctx);

    case "five-step-model":
    case "contract-identification":
      return handleRevenue(rule, ctx);

    case "definition":
    case "initial-measurement":
      return handlePpeRecognition(rule, ctx);

    case "depreciation":
      return handleDepreciation(rule, ctx);

    case "initial-recognition":
    case "lease-liability-measurement":
    case "rou-asset-measurement":
    case "lease-definition":
      return handleLeases(rule, ctx);

    case "classification":
    case "operating-method":
      return handleCashFlow(rule, ctx);

    default:
      return baseEval(
        rule,
        "skipped",
        "موضوع غير مُنفّذ في Phase 6.",
        "Topic not executable in Phase 6.",
      );
  }
}
