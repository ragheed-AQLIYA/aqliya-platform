import {
  createTerritory,
  listTerritories,
  deleteTerritory,
} from "../sales-territory-store";

describe("sales-territory-store (S7-08)", () => {
  it("seeds default territories per org", () => {
    const rows = listTerritories("org-test-1");
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it("creates and deletes a territory", () => {
    const org = "org-test-2";
    const created = createTerritory({
      organizationId: org,
      code: "TEST-01",
      nameAr: "اختبار",
      regionLabel: "منطقة اختبار",
    });
    expect(created.code).toBe("TEST-01");
    expect(deleteTerritory(org, created.id)).toBe(true);
  });
});
