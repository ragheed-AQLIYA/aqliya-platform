/**
 * Signal Engine — cross-product runtime signals.
 * IC-P2.2: Signal Engine Consolidation.
 */
export type {
  ProductMetricSignals,
  RuntimeSignal,
  RuntimeSignalSeverity,
} from "./types";

export {
  SignalEngine,
  type SignalEngineAckInput,
  type SignalEngineProduceInput,
  type SignalEngineResolveInput,
} from "./engine";

export {
  collectAuditActivitySignals,
  collectAuditApprovalSignals,
  collectAuditEvidenceSignals,
  collectAuditMetricSignals,
  collectAuditReviewSignals,
  collectAuditTaskSignals,
} from "./producers/audit-signal-producer";

export {
  collectLocalContentActivitySignals,
  collectLocalContentApprovalSignals,
  collectLocalContentReviewSignals,
  collectLocalContentTaskSignals,
} from "./producers/localcontent-signal-producer";

export {
  collectSalesActivitySignals,
  collectSalesApprovalSignals,
  collectSalesReviewSignals,
  collectSalesTaskSignals,
} from "./producers/sales-signal-producer";
