/**
 * Signal Engine facade — cross-product runtime signals.
 */
export type {
  ProductMetricSignals,
  RuntimeSignal,
  RuntimeSignalSeverity,
} from "@/lib/platform/signals";

export {
  collectAuditActivitySignals,
  collectAuditApprovalSignals,
  collectAuditEvidenceSignals,
  collectAuditMetricSignals,
  collectAuditReviewSignals,
  collectAuditTaskSignals,
  collectLocalContentActivitySignals,
  collectLocalContentApprovalSignals,
  collectLocalContentReviewSignals,
  collectLocalContentTaskSignals,
  collectSalesActivitySignals,
  collectSalesApprovalSignals,
  collectSalesReviewSignals,
  collectSalesTaskSignals,
} from "@/lib/platform/signals";
