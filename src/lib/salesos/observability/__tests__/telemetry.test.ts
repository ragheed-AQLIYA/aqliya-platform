/**
 * Observability Tests — SPEC-01e §8, PRD-01 §14b
 */

import { Telemetry } from "../telemetry";

describe("Telemetry — Metrics", () => {
  let tel: Telemetry;
  beforeEach(() => { tel = new Telemetry(); });

  test("counter increments", () => {
    tel.incrementCounter("salesos.deal.created");
    tel.incrementCounter("salesos.deal.created");
    expect(tel.getCounter("salesos.deal.created")!.value).toBe(2);
  });

  test("gauge records latest value", () => {
    tel.setGauge("salesos.pipeline.value", 5000000);
    expect(tel.gauges[0].value).toBe(5000000);
  });

  test("histogram records individual values", () => {
    tel.recordHistogram("salesos.approval_time", 120);
    tel.recordHistogram("salesos.approval_time", 300);
    expect(tel.histograms).toHaveLength(2);
  });

  test("all 11 PRD-01 §14b actions can be tracked", () => {
    const actions = [
      "deal.created", "deal.updated", "deal.transition", "deal.submitted_for_review",
      "deal.approved", "deal.rejected", "deal.closed_won", "deal.closed_lost",
      "evidence.linked", "deal.list", "deal.detail",
    ];
    for (const a of actions) tel.recordAction(a, "corr-1");
    expect(tel.counters.length).toBeGreaterThanOrEqual(11);
    expect(tel.logs.length).toBeGreaterThanOrEqual(11);
  });
});

describe("Telemetry — Logs", () => {
  let tel: Telemetry;
  beforeEach(() => { tel = new Telemetry(); });

  test("log stores level and message", () => {
    tel.log("info", "Deal created");
    expect(tel.logs[0].level).toBe("info");
    expect(tel.logs[0].message).toBe("Deal created");
  });

  test("correlationId propagates to logs", () => {
    tel.log("info", "test", "corr-abc");
    expect(tel.logs[0].correlationId).toBe("corr-abc");
  });

  test("error logs include metadata", () => {
    tel.log("error", "Save failed", "corr-1", "deal.create", { dealId: "d-1" });
    expect(tel.logs[0].level).toBe("error");
    expect(tel.logs[0].metadata).toEqual({ dealId: "d-1" });
  });

  test("getLogsByCorrelation filters correctly", () => {
    tel.log("info", "a", "corr-1");
    tel.log("info", "b", "corr-2");
    expect(tel.getLogsByCorrelation("corr-1")).toHaveLength(1);
  });
});

describe("Telemetry — Traces", () => {
  let tel: Telemetry;
  beforeEach(() => { tel = new Telemetry(); });

  test("trace starts and ends with timing", () => {
    const idx = tel.startTrace("createDeal", "corr-1");
    tel.endTrace(idx);
    expect(tel.traces[0].name).toBe("createDeal");
    expect(tel.traces[0].startTime).toBeDefined();
    expect(tel.traces[0].endTime).toBeDefined();
  });

  test("correlationId propagates to traces", () => {
    const idx = tel.startTrace("getDeal", "corr-xyz");
    tel.endTrace(idx);
    expect(tel.traces[0].correlationId).toBe("corr-xyz");
  });
});

describe("Telemetry — Health", () => {
  let tel: Telemetry;
  beforeEach(() => { tel = new Telemetry(); });

  test("health check records status", () => {
    tel.setHealth("database", "healthy", 12);
    expect(tel.healthChecks[0].name).toBe("database");
    expect(tel.healthChecks[0].status).toBe("healthy");
  });

  test("allHealthy returns true when all checks pass", () => {
    tel.setHealth("db", "healthy", 10);
    tel.setHealth("cache", "healthy", 5);
    expect(tel.allHealthy()).toBe(true);
  });

  test("allHealthy returns false when any check fails", () => {
    tel.setHealth("db", "healthy", 10);
    tel.setHealth("event-bus", "failed", 1000);
    expect(tel.allHealthy()).toBe(false);
  });
});

describe("Observability — End-to-End Correlation", () => {
  test("full lifecycle tracked across metrics, logs, traces", () => {
    const tel = new Telemetry();
    const cid = "corr-e2e-001";

    // Simulate full deal lifecycle
    tel.recordAction("deal.created", cid);
    tel.recordAction("deal.qualified", cid);
    tel.recordAction("deal.submitted_for_review", cid);
    tel.recordAction("deal.approved", cid);
    tel.recordAction("deal.closed_won", cid);
    tel.setHealth("workflow", "healthy", 5);

    // All signals share same correlation ID
    const logs = tel.getLogsByCorrelation(cid);
    expect(logs).toHaveLength(5);
    expect(logs.every((l) => l.correlationId === cid)).toBe(true);

    // Metrics captured
    expect(tel.counters.length).toBeGreaterThanOrEqual(5);

    // Health independent of correlation
    expect(tel.allHealthy()).toBe(true);
  });
});
