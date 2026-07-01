import { addHold, removeHold, listHolds, checkHold, isRecordOnHold } from "../holds";

describe("Retention Holds", () => {
  beforeEach(async () => {
    const holds = await listHolds();
    for (const hold of holds) {
      await removeHold(hold.id);
    }
  });

  it("adds a retention hold", async () => {
    const hold = await addHold({
      recordType: "PlatformAuditLog",
      recordId: "log-1",
      reason: "Legal hold - pending investigation",
      userId: "user-1",
    });

    expect(hold.recordType).toBe("PlatformAuditLog");
    expect(hold.recordId).toBe("log-1");
    expect(hold.reason).toBe("Legal hold - pending investigation");
    expect(hold.createdById).toBe("user-1");
    expect(hold.id).toBeDefined();
    expect(hold.createdAt).toBeInstanceOf(Date);
  });

  it("prevents duplicate holds for same record", async () => {
    const hold1 = await addHold({
      recordType: "PlatformAuditLog",
      recordId: "log-dup",
      reason: "First hold",
    });

    const hold2 = await addHold({
      recordType: "PlatformAuditLog",
      recordId: "log-dup",
      reason: "Second hold attempt",
    });

    expect(hold2.id).toBe(hold1.id);
  });

  it("removes a hold", async () => {
    const hold = await addHold({
      recordType: "PlatformAuditLog",
      recordId: "log-remove",
      reason: "Temporary hold",
    });

    const removed = await removeHold(hold.id);
    expect(removed).toBe(true);

    const found = await checkHold("PlatformAuditLog", "log-remove");
    expect(found).toBeUndefined();
  });

  it("removing non-existent hold returns false", async () => {
    const removed = await removeHold("non-existent-id");
    expect(removed).toBe(false);
  });

  it("lists holds scoped to organization", async () => {
    await addHold({
      recordType: "Decision",
      recordId: "dec-1",
      reason: "Org1 hold",
      organizationId: "org-1",
    });

    await addHold({
      recordType: "AuditEngagement",
      recordId: "eng-1",
      reason: "Org2 hold",
      organizationId: "org-2",
    });

    const org1Holds = await listHolds("org-1");
    expect(org1Holds.length).toBe(1);
    expect(org1Holds[0].organizationId).toBe("org-1");

    const org2Holds = await listHolds("org-2");
    expect(org2Holds.length).toBe(1);
    expect(org2Holds[0].organizationId).toBe("org-2");

    const allHolds = await listHolds();
    expect(allHolds.length).toBe(2);
  });

  it("checks if a record is on hold", async () => {
    await addHold({
      recordType: "Session",
      recordId: "session-legal",
      reason: "Compliance hold",
    });

    const onHold = await isRecordOnHold("Session", "session-legal");
    expect(onHold).toBe(true);

    const notOnHold = await isRecordOnHold("Session", "session-normal");
    expect(notOnHold).toBe(false);
  });

  it("returns hold details via checkHold", async () => {
    await addHold({
      recordType: "PlatformAuditLog",
      recordId: "log-check",
      reason: "Audit hold",
    });

    const hold = await checkHold("PlatformAuditLog", "log-check");
    expect(hold).toBeDefined();
    expect(hold!.reason).toBe("Audit hold");
  });
});
