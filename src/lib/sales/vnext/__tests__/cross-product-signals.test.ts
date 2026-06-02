// @ts-nocheck
import { describe, expect, it, beforeEach } from "@jest/globals";
import { resetSalesStoreForTests } from "@/lib/sales/store";
import type { CrossProductCommercialSignal } from "@/lib/sales/v02/cross-product-signals/types";
import {
  isEvidenceBackedInstitutionalSignal,
  transformInstitutionalToWaveA,
} from "../cross-product-signals";
import {
  salesAggregateCrossProductSignals,
  salesTransformInstitutionalSignalsToWaveA,
} from "../../services/cross-product-signals-service";

jest.mock("@/lib/prisma", () => {
  const emptyList = { findMany: jest.fn().mockResolvedValue([]) };
  const emptyCount = { count: jest.fn().mockResolvedValue(0) };
  return {
    prisma: new Proxy(
      {},
      {
        get: () => ({
          ...emptyList,
          ...emptyCount,
          findUnique: jest.fn().mockResolvedValue(null),
        }),
      },
    ),
  };
});

const ORG = "org-test";
const OWNER = "user-1";

function institutionalFixture(
  partial: Partial<CrossProductCommercialSignal> &
    Pick<CrossProductCommercialSignal, "id" | "signalType">,
): CrossProductCommercialSignal {
  return {
    organizationId: ORG,
    sourceProduct: "sales",
    titleAr: partial.titleAr ?? "Title AR",
    titleEn: partial.titleEn ?? "Title",
    severity: partial.severity ?? "warning",
    payload: partial.payload ?? {},
    evidenceRefs: partial.evidenceRefs ?? [`ev-${partial.id}`],
    outputStatus: partial.outputStatus ?? "recommendation",
    createdAt: partial.createdAt ?? "2026-05-30T10:00:00.000Z",
    sourceSignalIds: partial.sourceSignalIds ?? [`src-${partial.id}`],
    ...partial,
  };
}

describe("cross-product-signals vnext aggregation rules", () => {
  beforeEach(() => {
    resetSalesStoreForTests();
  });

  it("requires evidence refs and source signal ids", () => {
    const backed = institutionalFixture({
      id: "a1",
      signalType: "repeated_audit_finding",
    });
    const missingEvidence = institutionalFixture({
      id: "a2",
      signalType: "repeated_audit_finding",
      evidenceRefs: [],
    });
    expect(isEvidenceBackedInstitutionalSignal(backed)).toBe(true);
    expect(isEvidenceBackedInstitutionalSignal(missingEvidence)).toBe(false);
  });

  it("maps repeated audit findings to repeated_audit_concern", () => {
    const waveA = transformInstitutionalToWaveA([
      institutionalFixture({
        id: "audit-repeat",
        signalType: "repeated_audit_finding",
        sourceProduct: "audit",
      }),
    ]);
    expect(waveA).toHaveLength(1);
    expect(waveA[0].waveAKind).toBe("repeated_audit_concern");
    expect(waveA[0].institutionalKind).toBe("repeated_audit_finding");
  });

  it("emits repeated_sales_objection only when frequency or severity indicates repetition", () => {
    const repeated = transformInstitutionalToWaveA([
      institutionalFixture({
        id: "obj-repeat",
        signalType: "sales_objection",
        payload: { frequency: 2, category: "budget" },
        severity: "critical",
      }),
      institutionalFixture({
        id: "obj-once",
        signalType: "sales_objection",
        payload: { frequency: 1, category: "timing" },
        severity: "info",
      }),
    ]);
    expect(repeated).toHaveLength(1);
    expect(repeated[0].waveAKind).toBe("repeated_sales_objection");
  });

  it("groups market concerns into repeated_market_concern when title repeats", () => {
    const waveA = transformInstitutionalToWaveA([
      institutionalFixture({
        id: "m1",
        signalType: "market_concern",
        sourceProduct: "audit",
        titleEn: "Market or compliance concern",
      }),
      institutionalFixture({
        id: "m2",
        signalType: "market_concern",
        sourceProduct: "sales",
        titleEn: "Market or compliance concern",
      }),
    ]);
    expect(waveA).toHaveLength(1);
    expect(waveA[0].waveAKind).toBe("repeated_market_concern");
    expect(waveA[0].payload.occurrenceCount).toBe(2);
  });

  it("maps local content market concerns to content_market_signal", () => {
    const waveA = transformInstitutionalToWaveA([
      institutionalFixture({
        id: "lc1",
        signalType: "market_concern",
        sourceProduct: "local_content",
        titleEn: "Unverified local content source",
      }),
    ]);
    expect(waveA).toHaveLength(1);
    expect(waveA[0].waveAKind).toBe("content_market_signal");
  });

  it("groups customer requests into recurring_customer_request", () => {
    const waveA = transformInstitutionalToWaveA([
      institutionalFixture({
        id: "r1",
        signalType: "customer_request",
        titleEn: "Customer request",
      }),
      institutionalFixture({
        id: "r2",
        signalType: "customer_request",
        titleEn: "Customer request",
      }),
    ]);
    expect(waveA).toHaveLength(1);
    expect(waveA[0].waveAKind).toBe("recurring_customer_request");
  });

  it("maps evidence gaps and buying signals to proof_demand_signal", () => {
    const waveA = transformInstitutionalToWaveA([
      institutionalFixture({
        id: "gap1",
        signalType: "evidence_gap",
        titleEn: "Evidence gap",
      }),
      institutionalFixture({
        id: "buy1",
        signalType: "buying_signal",
        titleEn: "Buying signal",
      }),
    ]);
    expect(waveA.map((s) => s.waveAKind)).toEqual([
      "proof_demand_signal",
      "proof_demand_signal",
    ]);
  });

  it("excludes governance_pressure from Wave A taxonomy", () => {
    const waveA = transformInstitutionalToWaveA([
      institutionalFixture({
        id: "gov1",
        signalType: "governance_pressure",
        titleEn: "Governance pressure (5 pending)",
      }),
    ]);
    expect(waveA).toHaveLength(0);
  });

  it("builds Wave A aggregation summary via service helper", () => {
    const agg = salesTransformInstitutionalSignalsToWaveA(ORG, [
      institutionalFixture({
        id: "obj-repeat",
        signalType: "sales_objection",
        payload: { frequency: 3 },
        severity: "critical",
      }),
    ]);
    expect(agg.organizationId).toBe(ORG);
    expect(agg.byKind.repeated_sales_objection).toBe(1);
    expect(agg.institutionalSignalCount).toBe(1);
  });

  it("integrates sales seed objections through async aggregator", async () => {
    const agg = await salesAggregateCrossProductSignals(ORG, OWNER);
    expect(agg.organizationId).toBe(ORG);
    expect(agg.signals.length).toBeGreaterThan(0);
    expect(
      agg.signals.some((s) => s.waveAKind === "repeated_sales_objection"),
    ).toBe(true);
    for (const signal of agg.signals) {
      expect(signal.evidenceRefs.length).toBeGreaterThan(0);
      expect(signal.sourceSignalIds.length).toBeGreaterThan(0);
      expect(["draft", "recommendation"]).toContain(signal.outputStatus);
    }
  });
});
