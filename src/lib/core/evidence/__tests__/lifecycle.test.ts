/** @jest-environment node */

import {
  mapProductStateToLifecycle,
  isValidLifecycleTransition,
  EVIDENCE_LIFECYCLE_STATUSES,
} from "@/lib/core/evidence/lifecycle";

describe("Evidence lifecycle", () => {
  it("defines five platform lifecycle states", () => {
    expect(EVIDENCE_LIFECYCLE_STATUSES).toEqual([
      "created",
      "reviewed",
      "approved",
      "rejected",
      "archived",
    ]);
  });

  it("maps audit states to platform lifecycle", () => {
    expect(mapProductStateToLifecycle("audit", "missing")).toBe("created");
    expect(mapProductStateToLifecycle("audit", "uploaded")).toBe("created");
    expect(mapProductStateToLifecycle("audit", "reviewed")).toBe("reviewed");
    expect(mapProductStateToLifecycle("audit", "accepted")).toBe("approved");
    expect(mapProductStateToLifecycle("audit", "rejected")).toBe("rejected");
  });

  it("maps local content statuses to platform lifecycle", () => {
    expect(mapProductStateToLifecycle("local_content", "uploaded")).toBe(
      "created",
    );
    expect(mapProductStateToLifecycle("local_content", "verified")).toBe(
      "approved",
    );
    expect(mapProductStateToLifecycle("local_content", "rejected")).toBe(
      "rejected",
    );
  });

  it("enforces valid lifecycle transitions", () => {
    expect(isValidLifecycleTransition("created", "reviewed")).toBe(true);
    expect(isValidLifecycleTransition("created", "approved")).toBe(true);
    expect(isValidLifecycleTransition("approved", "created")).toBe(false);
    expect(isValidLifecycleTransition("archived", "created")).toBe(false);
    expect(isValidLifecycleTransition("reviewed", "reviewed")).toBe(true);
  });
});
