// @ts-nocheck
// Map SalesOS domain + runtime signals to institutional commercial signals

import type { RuntimeSignal } from "@/lib/platform/signals/types";
import type { CrossProductCommercialSignal } from "./types";

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
        severity: s.severity ?? "warning",
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
        severity: s.severity ?? "info",
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
