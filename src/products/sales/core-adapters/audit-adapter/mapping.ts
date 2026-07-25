import "server-only";
import type {
  AuditEventCategory,
  AuditEventSeverity,
} from "@/lib/core/audit/types";
import { normalizeSalesEventType } from "./common";
import type { PlatformAuditCategory } from "./types";

export function mapSalesAuditCategory(eventType: string): AuditEventCategory {
  if (eventType.startsWith("sales.account.")) return "mutation";
  if (eventType.startsWith("sales.opportunity.")) return "mutation";
  if (eventType.startsWith("sales.intelligence.")) return "ai";
  if (eventType.startsWith("sales.proof.")) return "evidence";
  if (eventType.startsWith("sales.output.")) return "export";
  if (eventType.startsWith("sales.recommendation.")) return "governance";
  if (eventType.startsWith("sales.review.")) return "review";
  if (eventType.startsWith("sales.approval.")) return "approval";
  if (eventType === "sales.opportunity.submitted_for_review") return "review";
  if (eventType === "sales.opportunity.approved") return "approval";
  if (eventType.startsWith("sales.evidence.")) return "evidence";
  return "system";
}

export function mapSalesAuditCategoryToPlatform(
  eventType: string,
): PlatformAuditCategory {
  const normalized = normalizeSalesEventType(eventType);
  if (normalized.startsWith("sales.intelligence.")) return "ai_execution";
  if (normalized.startsWith("sales.proof.")) return "evidence";
  if (normalized.startsWith("sales.output.")) return "output";
  if (normalized.startsWith("sales.review.")) return "review";
  if (normalized.startsWith("sales.approval.")) return "approval";
  if (normalized.startsWith("sales.recommendation.")) return "workflow_transition";
  if (
    normalized.startsWith("sales.account.") ||
    normalized.startsWith("sales.opportunity.")
  ) {
    return "workflow_transition";
  }
  return "workflow_transition";
}

export const mapSalesToContractCategory = mapSalesAuditCategoryToPlatform;

function mapSeverity(eventType: string): AuditEventSeverity {
  if (eventType.includes("reject") || eventType.includes("blocked"))
    return "warning";
  if (eventType.includes("approve") || eventType.includes("approved"))
    return "info";
  if (eventType.includes("error") || eventType.includes("fail")) return "error";
  return "info";
}

export { mapSeverity };

export function resolveSalesEventType(input: {
  mutation: "create" | "update" | "transition" | "export" | "ai";
  resourceType: string;
  explicitAction?: string;
  details?: Record<string, unknown>;
}): string {
  if (input.explicitAction)
    return normalizeSalesEventType(input.explicitAction);
  const { mutation, resourceType, details } = input;
  switch (resourceType) {
    case "SalesAccount":
      return mutation === "create"
        ? "sales.account.created"
        : "sales.account.updated";
    case "SalesOpportunity":
      if (mutation === "create") return "sales.opportunity.created";
      if (mutation === "transition") {
        if (details?.approvalStatus === "Approved")
          return "sales.approval.approved";
        if (details?.reviewStatus && details.reviewStatus !== "Draft") {
          return "sales.review.submitted";
        }
        return "sales.opportunity.stage_changed";
      }
      return "sales.opportunity.updated";
    case "SalesInteractionLog":
      return "sales.intelligence.interaction_logged";
    case "SalesEvidenceRef":
      return "sales.proof.linked";
    case "SalesOutput":
      return mutation === "export"
        ? "sales.output.exported"
        : "sales.output.queued";
    case "SalesRecommendation":
      return "sales.recommendation.persisted";
    default:
      return (
        "sales." +
        resourceType.replace(/^Sales/, "").toLowerCase() +
        "." +
        mutation
      );
  }
}
