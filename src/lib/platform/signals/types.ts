export type RuntimeSignalSeverity =
  | "critical"
  | "warning"
  | "info"
  | "high"
  | "low"
  | "medium";

export interface RuntimeSignal {
  id: string;
  organizationId: string;
  productSlug: string;
  action: string;
  severity?: RuntimeSignalSeverity;
  summaryEn?: string;
  summaryAr?: string;
  resourceId: string;
  resourceType: string;
  kind?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ProductMetricSignals {
  productSlug: string;
  organizationId: string;
  signals: RuntimeSignal[];
  generatedAt: string;
  engagements?: number;
  pendingReviews?: number;
  pendingApprovals?: number;
  evidenceAlerts?: number;
}
