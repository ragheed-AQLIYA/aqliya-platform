import { describe, expect, it, beforeEach } from "@jest/globals";
import { resetSalesStoreForTests } from "@/lib/sales/store";
import { aggregateCrossProductSignalsForSales } from "../aggregator";

const ORG = "org-test";
const OWNER = "user-1";

describe("SalesOS v0.2 cross-product signal aggregator", () => {
  beforeEach(() => {
    resetSalesStoreForTests();
  });

  it("returns aggregation with sales objections from seed intelligence", async () => {
    const agg = await aggregateCrossProductSignalsForSales(ORG, OWNER);

    expect(agg.organizationId).toBe(ORG);
    expect(agg.signals.length).toBeGreaterThan(0);
    expect(agg.byKind.sales_objection).toBeGreaterThan(0);
    expect(
      agg.signals.some((s) => s.signalType === "sales_objection"),
    ).toBe(true);
  });

  it("includes buying_signal from need/buying runtime actions", async () => {
    const agg = await aggregateCrossProductSignalsForSales(ORG, OWNER);

    expect(
      agg.signals.some(
        (s) =>
          s.signalType === "buying_signal" && s.sourceProduct === "sales",
      ),
    ).toBe(true);
  });

  it("marks institutional outputs as draft or recommendation only", async () => {
    const agg = await aggregateCrossProductSignalsForSales(ORG, OWNER);

    for (const signal of agg.signals) {
      expect(["draft", "recommendation"]).toContain(signal.outputStatus);
    }
  });

  it("indexes signals by source product", async () => {
    const agg = await aggregateCrossProductSignalsForSales(ORG, OWNER);

    expect(agg.bySource.sales).toBeGreaterThan(0);
  });
});
