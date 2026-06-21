/**
 * Backward-compatible re-exports. Signals moved to @/lib/core/signals/.
 * New code should import from @/lib/core/signals/ instead.
 */
export type {
  ProductMetricSignals,
  RuntimeSignal,
  RuntimeSignalSeverity,
} from "@/lib/core/signals/types";

export {
  collectAuditActivitySignals,
  collectAuditApprovalSignals,
  collectAuditEvidenceSignals,
  collectAuditMetricSignals,
  collectAuditReviewSignals,
  collectAuditTaskSignals,
} from "@/lib/core/signals/producers/audit-signal-producer";

export {
  collectLocalContentActivitySignals,
  collectLocalContentApprovalSignals,
  collectLocalContentReviewSignals,
  collectLocalContentTaskSignals,
} from "@/lib/core/signals/producers/localcontent-signal-producer";

export {
  collectSalesActivitySignals,
  collectSalesApprovalSignals,
  collectSalesReviewSignals,
  collectSalesTaskSignals,
} from "@/lib/core/signals/producers/sales-signal-producer";
