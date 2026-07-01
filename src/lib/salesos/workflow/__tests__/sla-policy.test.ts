/**
 * SLA Policy Tests — SPEC-01e §4.4
 * Covers: segment-aware policies, timer accuracy, escalation, monitoring
 */

import { SLATracker } from "../sla";
import { SLAMonitor } from "../sla-monitor";
import { resolvePolicy, DEFAULT_SLA_POLICY, type SLAPolicy } from "../sla-policy";

describe("SLA Policy Resolution", () => {
  test("default policy when no segment specified", () => {
    const policy = resolvePolicy();
    expect(policy.policyId).toBe("salesos-sla-v1");
  });

  test("enterprise policy has stricter In Review (48h vs 72h)", () => {
    const policy = resolvePolicy("enterprise");
    const rule = policy.rules.find((r) => r.stageName === "In Review");
    expect(rule!.maxDurationHours).toBe(48);
  });

  test("SMB policy has relaxed Draft (336h vs 168h)", () => {
    const policy = resolvePolicy("smb");
    const rule = policy.rules.find((r) => r.stageName === "Draft");
    expect(rule!.maxDurationHours).toBe(336);
  });

  test("government policy has longer cycles (720h Draft, 240h In Review)", () => {
    const policy = resolvePolicy("government");
    const draft = policy.rules.find((r) => r.stageName === "Draft");
    const review = policy.rules.find((r) => r.stageName === "In Review");
    expect(draft!.maxDurationHours).toBe(720);
    expect(review!.maxDurationHours).toBe(240);
  });

  test("government policy escalates earlier (80% vs 100%)", () => {
    const policy = resolvePolicy("government");
    const rule = policy.rules.find((r) => r.stageName === "Draft");
    expect(rule!.escalateThresholdPercent).toBe(80);
  });
});

describe("SLA Timer Accuracy", () => {
  let sla: SLATracker;

  beforeEach(() => { sla = new SLATracker(); });

  test("fresh SLA shows on_track", () => {
    sla.startTimer("d-1", "Draft");
    const status = sla.getStatus("d-1");
    expect(status!.status).toBe("on_track");
    expect(status!.elapsedHours).toBeCloseTo(0, 0);
  });

  test("breached at exactly 100% (168h for Draft)", () => {
    const past = new Date(Date.now() - 168 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past.toISOString());
    const status = sla.getStatus("d-1");
    expect(status!.status).toBe("breached");
  });

  test("extreme at exactly 200% (336h for Draft)", () => {
    const past = new Date(Date.now() - 336 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past.toISOString());
    const status = sla.getStatus("d-1");
    expect(status!.status).toBe("extreme");
  });

  test("one second before breach still shows approaching", () => {
    const msIn168h = 168 * 60 * 60 * 1000;
    const past = new Date(Date.now() - (msIn168h - 1000)); // 1 second before breach
    sla.startTimer("d-1", "Draft", past.toISOString());
    const status = sla.getStatus("d-1");
    expect(["on_track", "approaching"]).toContain(status!.status);
  });

  test("remaining hours is non-negative", () => {
    const past = new Date(Date.now() - 200 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past.toISOString());
    const status = sla.getStatus("d-1");
    expect(status!.remainingHours).toBeGreaterThanOrEqual(0);
  });

  test("getStatus returns null for untracked deal", () => {
    expect(sla.getStatus("nonexistent")).toBeNull();
  });

  test("getStatus returns null after timer stopped", () => {
    sla.startTimer("d-1", "Draft");
    sla.stopTimer("d-1");
    expect(sla.getStatus("d-1")).toBeNull();
  });
});

describe("SLA Monitoring", () => {
  let sla: SLATracker;
  let monitor: SLAMonitor;

  beforeEach(() => {
    sla = new SLATracker();
    monitor = new SLAMonitor(sla, {
      checkIntervalMs: 1000,
      consecutiveWarningBeforeEscalation: 2,
      consecutiveBreachBeforeLevel2: 2,
    });
  });

  test("on_track deals produce no events", () => {
    sla.startTimer("d-1", "Draft");
    const events = monitor.checkAll(DEFAULT_SLA_POLICY);
    expect(events).toHaveLength(0);
  });

  test("breached deal produces level 1 escalation", () => {
    const past = new Date(Date.now() - 200 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past.toISOString());
    const events = monitor.checkAll(DEFAULT_SLA_POLICY);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("escalation_level1");
  });

  test("two consecutive breaches produce level 2 escalation", () => {
    const past = new Date(Date.now() - 200 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past.toISOString());
    monitor.checkAll(DEFAULT_SLA_POLICY); // breach #1 → level 1
    const events = monitor.checkAll(DEFAULT_SLA_POLICY); // breach #2 → level 2
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("escalation_level2");
  });

  test("extreme breach produces extreme_breach event", () => {
    const past = new Date(Date.now() - 400 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past.toISOString());
    const events = monitor.checkAll(DEFAULT_SLA_POLICY);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("extreme_breach");
  });

  test("resolution clears warning counter", () => {
    // Start approaching
    const past1 = new Date(Date.now() - 130 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past1.toISOString());
    monitor.checkAll(DEFAULT_SLA_POLICY); // warning #1

    // Resolve by stopping timer
    sla.stopTimer("d-1");
    sla.startTimer("d-1", "Draft"); // fresh start
    const events = monitor.checkAll(DEFAULT_SLA_POLICY);
    expect(events).toHaveLength(0); // Counter reset
  });

  test("policy and segment appear in monitoring event", () => {
    const past = new Date(Date.now() - 200 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past.toISOString());
    const policy = resolvePolicy("enterprise");
    const events = monitor.checkAll(policy, "enterprise");
    expect(events[0].policy).toBe("salesos-sla-enterprise");
    expect(events[0].segment).toBe("enterprise");
  });
});
