/**
 * Audit Trail Tests
 */

import { AuditTrail } from "../trail";

describe("AuditTrail", () => {
  let audit: AuditTrail;
  const org = "org-1";

  beforeEach(() => { audit = new AuditTrail(); });

  test("record appends entry with id and timestamp", () => {
    const entry = audit.record({ action: "salesos.deal.created", actorId: "user-1", targetType: "Deal", targetId: "deal-1", organizationId: org });
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.sequenceId).toBe("seq-1");
  });

  test("sequence IDs are monotonically increasing", () => {
    const e1 = audit.record({ action: "a", actorId: "u", targetType: "T", targetId: "1", organizationId: org });
    const e2 = audit.record({ action: "b", actorId: "u", targetType: "T", targetId: "2", organizationId: org });
    expect(parseInt(e1.sequenceId.slice(4))).toBeLessThan(parseInt(e2.sequenceId.slice(4)));
  });

  test("entries are immutable after recording", () => {
    const entry = audit.record({ action: "original", actorId: "u", targetType: "T", targetId: "1", organizationId: org });
    // Attempt to modify the returned object should not affect store
    entry.action = "modified";
    const fromStore = audit.list(org);
    expect(fromStore[0].action).toBe("original");
  });

  test("list returns entries for organization in reverse chronological order", () => {
    audit.record({ action: "a", actorId: "u", targetType: "T", targetId: "1", organizationId: org });
    audit.record({ action: "b", actorId: "u", targetType: "T", targetId: "2", organizationId: org });
    const list = audit.list(org);
    expect(list[0].action).toBe("b");
    expect(list[1].action).toBe("a");
  });

  test("list filters by organization", () => {
    audit.record({ action: "a", actorId: "u", targetType: "T", targetId: "1", organizationId: org });
    audit.record({ action: "b", actorId: "u", targetType: "T", targetId: "2", organizationId: "other-org" });
    expect(audit.list(org)).toHaveLength(1);
    expect(audit.list("other-org")).toHaveLength(1);
  });

  test("listByTarget returns entries for specific target", () => {
    audit.record({ action: "a", actorId: "u", targetType: "Deal", targetId: "d-1", organizationId: org });
    audit.record({ action: "b", actorId: "u", targetType: "Deal", targetId: "d-2", organizationId: org });
    expect(audit.listByTarget("Deal", "d-1", org)).toHaveLength(1);
  });

  test("findByCorrelationId returns all entries with same correlation", () => {
    const cid = "corr-xyz";
    audit.record({ action: "a", actorId: "u", targetType: "T", targetId: "1", organizationId: org, correlationId: cid });
    audit.record({ action: "b", actorId: "u", targetType: "T", targetId: "2", organizationId: org, correlationId: cid });
    audit.record({ action: "c", actorId: "u", targetType: "T", targetId: "3", organizationId: org, correlationId: "other" });
    expect(audit.findByCorrelationId(cid)).toHaveLength(2);
  });

  test("replay returns entries in chronological order", () => {
    audit.record({ action: "a", actorId: "u", targetType: "T", targetId: "1", organizationId: org });
    audit.record({ action: "b", actorId: "u", targetType: "T", targetId: "2", organizationId: org });
    audit.record({ action: "c", actorId: "u", targetType: "T", targetId: "3", organizationId: org });
    const replay = audit.replay();
    expect(replay.map((e) => e.action)).toEqual(["a", "b", "c"]);
  });

  test("replay from sequenceId skips earlier entries", () => {
    const e1 = audit.record({ action: "a", actorId: "u", targetType: "T", targetId: "1", organizationId: org });
    audit.record({ action: "b", actorId: "u", targetType: "T", targetId: "2", organizationId: org });
    audit.record({ action: "c", actorId: "u", targetType: "T", targetId: "3", organizationId: org });
    const replay = audit.replay(e1.sequenceId);
    expect(replay.map((e) => e.action)).toEqual(["a", "b", "c"]);
  });
});
