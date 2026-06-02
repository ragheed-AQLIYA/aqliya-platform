// @ts-nocheck
// ─── Pure pattern detectors for institutional commercial signals ───

import type { RuntimeSignal } from "@/lib/platform/signals/types";
import type {
  CrossProductCommercialSignal,
  InstitutionalCommercialKind,
} from "./types";

function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .slice(0, 80);
}

const MARKET_CONCERN_ACTIONS = new Set([
  "source.unverified",
  "evidence.missing",
  "evidence.rejected",
  "evidence.stale",
  "finding.open",
]);

const CUSTOMER_REQUEST_ACTIONS = new Set([
  "customer.request",
  "commercial.request",
  "project.datacollection",
  "opportunity.need",
  "signal.need",
  "signal.buying",
]);

export function detectRepeatedAuditFindings(
  findings: RuntimeSignal[],
  organizationId: string,
): CrossProductCommercialSignal[] {
  const open = findings.filter(
    (f) =>
      f.productSlug === "audit" &&
      f.action === "finding.open" &&
      f.organizationId === organizationId,
  );

  const buckets = new Map<string, RuntimeSignal[]>();
  for (const f of open) {
    const title =
      (f.metadata?.title as string | undefined) ??
      f.summaryEn?.replace(/^Open finding:\s*/i, "") ??
      f.resourceId;
    const key = normalizeKey(String(title));
    const list = buckets.get(key) ?? [];
    list.push(f);
    buckets.set(key, list);
  }

  const out: CrossProductCommercialSignal[] = [];
  for (const [key, group] of buckets) {
    if (group.length < 2) continue;
    const criticalCount = group.filter(
      (g) => g.severity === "critical" || g.metadata?.severity === "critical",
    ).length;
    const lead = group[0];
    out.push({
      id: `inst-audit-repeat-${key.slice(0, 24)}`,
      organizationId,
      sourceProduct: "audit",
      targetEntityType: "engagement",
      targetEntityId: (lead.metadata?.engagementId as string) ?? lead.resourceId,
      signalType: "repeated_audit_finding",
      titleAr: `ملاحظات تدقيق متكررة: ${key}`,
      titleEn: `Repeated audit findings: ${key}`,
      severity: criticalCount > 0 ? "critical" : "warning",
      payload: {
        occurrenceCount: group.length,
        findingIds: group.map((g) => g.resourceId),
        engagementIds: [
          ...new Set(
            group
              .map((g) => g.metadata?.engagementId as string | undefined)
              .filter(Boolean),
          ),
        ],
      },
      evidenceRefs: group.map((g) => g.id),
      outputStatus: "recommendation",
      createdAt: new Date().toISOString(),
      sourceSignalIds: group.map((g) => g.id),
    });
  }
  return out;
}

export function detectMarketConcerns(
  signals: RuntimeSignal[],
  organizationId: string,
): CrossProductCommercialSignal[] {
  const out: CrossProductCommercialSignal[] = [];

  for (const s of signals) {
    if (s.organizationId !== organizationId) continue;
    if (!MARKET_CONCERN_ACTIONS.has(s.action)) continue;
    if (s.productSlug !== "audit" && s.productSlug !== "local_content") continue;

    const isAuditFinding =
      s.productSlug === "audit" && s.action === "finding.open";
    if (
      isAuditFinding &&
      s.severity !== "critical" &&
      s.severity !== "warning" &&
      s.metadata?.severity !== "high" &&
      s.metadata?.severity !== "critical"
    ) {
      continue;
    }

    out.push({
      id: `inst-market-${s.productSlug}-${s.id}`,
      organizationId,
      sourceProduct: s.productSlug,
      targetEntityType:
        s.productSlug === "audit" ? "engagement" : "project",
      targetEntityId:
        (s.metadata?.engagementId as string | undefined) ??
        (s.metadata?.projectId as string | undefined) ??
        s.resourceId,
      signalType: "market_concern",
      titleAr: s.summaryAr ?? "قلق سوقي / امتثال",
      titleEn: s.summaryEn ?? "Market or compliance concern",
      severity: s.severity ?? "warning",
      payload: {
        action: s.action,
        resourceType: s.resourceType,
        resourceId: s.resourceId,
        metadata: s.metadata,
      },
      evidenceRefs: [s.id],
      outputStatus: "recommendation",
      createdAt: s.timestamp,
      sourceSignalIds: [s.id],
    });
  }
  return out;
}

export function detectCustomerRequests(
  signals: RuntimeSignal[],
  organizationId: string,
): CrossProductCommercialSignal[] {
  const out: CrossProductCommercialSignal[] = [];

  for (const s of signals) {
    if (s.organizationId !== organizationId) continue;

    const matchesKnown = CUSTOMER_REQUEST_ACTIONS.has(s.action);
    const matchesActivity =
      s.kind === "activity" &&
      /request|customer|need|datacollection/i.test(s.action);

    if (!matchesKnown && !matchesActivity) continue;

    const sourceProduct =
      s.productSlug === "audit" ||
      s.productSlug === "local_content" ||
      s.productSlug === "sales"
        ? s.productSlug
        : null;
    if (!sourceProduct) continue;

    out.push({
      id: `inst-request-${sourceProduct}-${s.id}`,
      organizationId,
      sourceProduct,
      targetEntityType:
        sourceProduct === "sales"
          ? "opportunity"
          : sourceProduct === "audit"
            ? "engagement"
            : "project",
      targetEntityId:
        (s.metadata?.opportunityId as string | undefined) ??
        (s.metadata?.engagementId as string | undefined) ??
        (s.metadata?.projectId as string | undefined) ??
        s.resourceId,
      signalType: "customer_request",
      titleAr: s.summaryAr ?? "طلب عميل",
      titleEn: s.summaryEn ?? "Customer request",
      severity: s.severity ?? "info",
      payload: { action: s.action, metadata: s.metadata },
      evidenceRefs: [s.id],
      outputStatus: "draft",
      createdAt: s.timestamp,
      sourceSignalIds: [s.id],
    });
  }
  return out;
}

export function detectEvidenceGaps(
  evidence: RuntimeSignal[],
  organizationId: string,
): CrossProductCommercialSignal[] {
  return evidence
    .filter(
      (e) =>
        e.organizationId === organizationId &&
        (e.action === "evidence.missing" ||
          e.action === "evidence.unlinked" ||
          e.action === "evidence.rejected"),
    )
    .map((e) => ({
      id: `inst-ev-gap-${e.productSlug}-${e.id}`,
      organizationId,
      sourceProduct: e.productSlug as CrossProductCommercialSignal["sourceProduct"],
      targetEntityType:
        e.productSlug === "sales"
          ? ("opportunity" as const)
          : e.productSlug === "audit"
            ? ("engagement" as const)
            : ("project" as const),
      targetEntityId:
        (e.metadata?.opportunityId as string | undefined) ??
        (e.metadata?.engagementId as string | undefined) ??
        (e.metadata?.projectId as string | undefined) ??
        e.resourceId,
      signalType: "evidence_gap" as InstitutionalCommercialKind,
      titleAr: e.summaryAr ?? "فجوة دليل",
      titleEn: e.summaryEn ?? "Evidence gap",
      severity: e.severity ?? "warning",
      payload: { action: e.action, metadata: e.metadata },
      evidenceRefs: [e.id],
      outputStatus: "recommendation" as const,
      createdAt: e.timestamp,
      sourceSignalIds: [e.id],
    }));
}

export function detectGovernancePressure(
  reviews: RuntimeSignal[],
  approvals: RuntimeSignal[],
  organizationId: string,
  threshold = 3,
): CrossProductCommercialSignal[] {
  const pending = [...reviews, ...approvals].filter(
    (s) => s.organizationId === organizationId,
  );
  if (pending.length < threshold) return [];

  const byProduct = pending.reduce(
    (acc, s) => {
      acc[s.productSlug] = (acc[s.productSlug] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return [
    {
      id: `inst-gov-pressure-${organizationId}`,
      organizationId,
      sourceProduct: "audit",
      targetEntityType: "engagement",
      signalType: "governance_pressure",
      titleAr: `ضغط حوكمة عبر المنتجات (${pending.length} عناصر معلقة)`,
      titleEn: `Cross-product governance pressure (${pending.length} pending items)`,
      severity: pending.some((p) => p.severity === "critical")
        ? "critical"
        : "warning",
      payload: { pendingCount: pending.length, byProduct },
      evidenceRefs: pending.slice(0, 20).map((p) => p.id),
      outputStatus: "recommendation",
      createdAt: new Date().toISOString(),
      sourceSignalIds: pending.map((p) => p.id),
    },
  ];
}

export function mergeInstitutionalSignals(
  groups: CrossProductCommercialSignal[],
): CrossProductCommercialSignal[] {
  const seen = new Set<string>();
  const merged: CrossProductCommercialSignal[] = [];
  for (const s of groups) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    merged.push(s);
  }
  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
