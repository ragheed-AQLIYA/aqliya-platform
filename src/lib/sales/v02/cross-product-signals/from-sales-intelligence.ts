// Map SalesOS domain + runtime signals to institutional commercial signals

// NOTE: Inline RuntimeSignal type pending @/lib/platform/signals/types stabilization (see docs/strategy/AQLIYA_STRATEGIC_ROADMAP.md)
interface RuntimeSignal {
  id: string;
  organizationId: string;
  productSlug: string;
  action: string;
  severity: string;
  summaryEn?: string;
  summaryAr?: string;
  resourceId: string;
  resourceType?: string;
  kind?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
import type { CrossProductCommercialSignal, RuntimeSignalSeverity } from "./types";

export function mapSalesIntelligenceToInstitutional(
  signals: RuntimeSignal[],
  organizationId: string,
): CrossProductCommercialSignal[] {
  const out: CrossProductCommercialSignal[] = [];

  for (const s of signals) {
    if (s.organizationId !== organizationId || s.productSlug !== "sales")
      continue;

    if (
      s.action === "objection.unresolved" ||
      s.action === "objection.repeated"
    ) {
      out.push({
        id: `inst-objection-${s.id}`,
        organizationId,
        sourceProduct: "sales",
        targetEntityType: "opportunity",
        targetEntityId:
          (s.metadata?.opportunityId as string | undefined) ?? s.resourceId,
        signalType: "sales_objection",
        titleAr: s.summaryAr ?? "اعتراض تجاري",
        titleEn: s.summaryEn ?? "Sales objection",
        severity: (s.severity ?? "warning") as RuntimeSignalSeverity,
        payload: s.metadata ?? {},
        evidenceRefs: [s.id],
        outputStatus: "recommendation",
        createdAt: s.timestamp,
        sourceSignalIds: [s.id],
      });
      continue;
    }

    if (s.action === "signal.buying" || s.action === "signal.need") {
      out.push({
        id: `inst-buying-${s.id}`,
        organizationId,
        sourceProduct: "sales",
        targetEntityType: "opportunity",
        targetEntityId:
          (s.metadata?.opportunityId as string | undefined) ??
          (s.metadata?.accountId as string | undefined) ??
          s.resourceId,
        signalType: "buying_signal",
        titleAr: s.summaryAr ?? "إشارة شراء",
        titleEn: s.summaryEn ?? "Buying signal",
        severity: (s.severity ?? "info") as RuntimeSignalSeverity,
        payload: s.metadata ?? {},
        evidenceRefs: [s.id],
        outputStatus: "draft",
        createdAt: s.timestamp,
        sourceSignalIds: [s.id],
      });
    }
  }

  return out;
}
