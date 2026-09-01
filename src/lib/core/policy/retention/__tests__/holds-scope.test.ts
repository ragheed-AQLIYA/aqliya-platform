import { addHold, listHolds, removeHold } from "@/lib/core/policy/retention/holds";

describe("retention hold tenant scope", () => {
  it("lists only holds for the requested organization", async () => {
    const a = await addHold({
      recordType: "Decision",
      recordId: "d-a",
      reason: "legal hold a",
      organizationId: "org-a",
    });
    await addHold({
      recordType: "Decision",
      recordId: "d-b",
      reason: "legal hold b",
      organizationId: "org-b",
    });

    const listed = await listHolds("org-a");
    expect(listed.map((h) => h.id)).toEqual([a.id]);
  });

  it("refuses to remove another organization's hold", async () => {
    const hold = await addHold({
      recordType: "AuditEngagement",
      recordId: "e-1",
      reason: "hold",
      organizationId: "org-a",
    });

    await expect(removeHold(hold.id, "org-b")).resolves.toBe(false);
    const stillThere = await listHolds("org-a");
    expect(stillThere.some((h) => h.id === hold.id)).toBe(true);

    await expect(removeHold(hold.id, "org-a")).resolves.toBe(true);
  });
});
