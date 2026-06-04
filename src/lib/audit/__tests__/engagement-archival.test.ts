import { evaluateEngagementArchival } from "../engagement-archival";

describe("engagement-archival (A1-10)", () => {
  it("allows archive when published or approved", () => {
    expect(evaluateEngagementArchival("published").canArchive).toBe(true);
    expect(evaluateEngagementArchival("approved").canArchive).toBe(true);
  });

  it("allows restore only when archived", () => {
    expect(evaluateEngagementArchival("archived").canRestore).toBe(true);
    expect(evaluateEngagementArchival("draft").canRestore).toBe(false);
  });
});
