import {
  BASE_SEVERITY_POLICY,
  SEVERITY_ORDER,
  classifyChange,
  describeSeverityPolicy,
  highestSeverity,
  maxSeverity,
} from "../change-classification";
import { REGULATORY_CHANGE_TYPES } from "../types";

const DETECTED = new Date("2026-08-21T00:00:00.000Z");

describe("LCGPA regulatory :: severity policy (§17)", () => {
  it("documents a policy entry for EVERY change type", () => {
    for (const type of REGULATORY_CHANGE_TYPES) {
      const entry = BASE_SEVERITY_POLICY[type];
      expect(entry).toBeDefined();
      expect(entry.policyId).toMatch(/^POL-/);
      expect(entry.rationale.length).toBeGreaterThan(20);
    }
  });

  it("exposes the policy table for the runbook", () => {
    const table = describeSeverityPolicy();
    expect(table).toHaveLength(REGULATORY_CHANGE_TYPES.length);
    expect(table.map((t) => t.changeType)).toEqual(
      [...REGULATORY_CHANGE_TYPES].sort(),
    );
  });

  it("orders severities and reduces to the highest", () => {
    expect(SEVERITY_ORDER.CRITICAL).toBeGreaterThan(SEVERITY_ORDER.HIGH);
    expect(maxSeverity("LOW", "HIGH")).toBe("HIGH");
    expect(highestSeverity(["LOW", "MEDIUM", "CRITICAL", "HIGH"])).toBe("CRITICAL");
    expect(highestSeverity([])).toBe("LOW");
  });
});

describe("LCGPA regulatory :: base classification", () => {
  it("treats a rename as LOW", () => {
    const result = classifyChange("PRODUCT_RENAMED", {
      oldValue: "أ",
      newValue: "ب",
      effectiveFrom: null,
      detectedAt: DETECTED,
    });
    expect(result.severity).toBe("LOW");
  });

  it("treats classification moves as MEDIUM", () => {
    for (const type of ["CATEGORY_CHANGED", "SECTOR_CHANGED", "HS_CODE_CHANGED"] as const) {
      expect(
        classifyChange(type, {
          oldValue: "a",
          newValue: "b",
          effectiveFrom: null,
          detectedAt: DETECTED,
        }).severity,
      ).toBe("MEDIUM");
    }
  });

  it("treats scope and requirement changes as at least HIGH", () => {
    for (const type of [
      "PRODUCT_ADDED",
      "PRODUCT_REMOVED",
      "REQUIREMENT_ADDED",
      "REQUIREMENT_REMOVED",
      "APPLICABILITY_CHANGED",
    ] as const) {
      const result = classifyChange(type, {
        oldValue: "a",
        newValue: "b",
        effectiveFrom: null,
        detectedAt: DETECTED,
      });
      expect(SEVERITY_ORDER[result.severity]).toBeGreaterThanOrEqual(
        SEVERITY_ORDER.HIGH,
      );
    }
  });

  it("treats a regulatory status change as CRITICAL", () => {
    expect(
      classifyChange("REGULATORY_STATUS_CHANGED", {
        oldValue: "ACTIVE",
        newValue: "SUSPENDED",
        effectiveFrom: null,
        detectedAt: DETECTED,
      }).severity,
    ).toBe("CRITICAL");
  });
});

describe("LCGPA regulatory :: escalation rules", () => {
  it("escalates a minimum-LC INCREASE to CRITICAL", () => {
    const result = classifyChange("MINIMUM_LC_CHANGED", {
      oldValue: "40",
      newValue: "50",
      effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
      detectedAt: DETECTED,
    });
    expect(result.severity).toBe("CRITICAL");
    expect(result.policyId).toBe("POL-CRIT-LC-INCREASE");
    expect(result.rationale).toMatch(/40% to 50%/);
  });

  it("escalates a NEWLY INTRODUCED minimum LC to CRITICAL", () => {
    const result = classifyChange("MINIMUM_LC_CHANGED", {
      oldValue: null,
      newValue: "35",
      effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
      detectedAt: DETECTED,
    });
    expect(result.policyId).toBe("POL-CRIT-LC-INTRODUCED");
  });

  it("keeps a minimum-LC DECREASE at HIGH", () => {
    const result = classifyChange("MINIMUM_LC_CHANGED", {
      oldValue: "50",
      newValue: "40",
      effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
      detectedAt: DETECTED,
    });
    expect(result.severity).toBe("HIGH");
  });

  it("treats a WITHDRAWN percentage as UNKNOWN, not zero", () => {
    const result = classifyChange("MINIMUM_LC_CHANGED", {
      oldValue: "50",
      newValue: null,
      effectiveFrom: null,
      detectedAt: DETECTED,
    });
    expect(result.policyId).toBe("POL-HIGH-LC-WITHDRAWN");
    expect(result.rationale).toMatch(/UNKNOWN, not as zero/);
  });

  it("escalates a RETROACTIVE change to CRITICAL", () => {
    const result = classifyChange("SECTOR_CHANGED", {
      oldValue: "S01",
      newValue: "S02",
      effectiveFrom: new Date("2026-06-01T00:00:00.000Z"),
      detectedAt: DETECTED,
    });
    expect(result.severity).toBe("CRITICAL");
    expect(result.policyId).toBe("POL-CRIT-RETROACTIVE");
  });

  it("does NOT escalate a retroactive LOW change", () => {
    const result = classifyChange("PRODUCT_RENAMED", {
      oldValue: "أ",
      newValue: "ب",
      effectiveFrom: new Date("2026-06-01T00:00:00.000Z"),
      detectedAt: DETECTED,
    });
    expect(result.severity).toBe("LOW");
  });

  it("escalates an effective date pulled EARLIER to CRITICAL", () => {
    const result = classifyChange("EFFECTIVE_DATE_CHANGED", {
      oldValue: "2027-01-01T00:00:00.000Z",
      newValue: "2026-12-01T00:00:00.000Z",
      effectiveFrom: new Date("2026-12-01T00:00:00.000Z"),
      detectedAt: DETECTED,
    });
    expect(result.policyId).toBe("POL-CRIT-DATE-ADVANCED");
  });

  it("keeps an effective date pushed LATER at HIGH", () => {
    const result = classifyChange("EFFECTIVE_DATE_CHANGED", {
      oldValue: "2026-10-01T00:00:00.000Z",
      newValue: "2027-01-01T00:00:00.000Z",
      effectiveFrom: new Date("2027-01-01T00:00:00.000Z"),
      detectedAt: DETECTED,
    });
    expect(result.severity).toBe("HIGH");
  });

  it("a reviewer-confirmed METHODOLOGY change is always CRITICAL (§42, §51)", () => {
    const result = classifyChange("PRODUCT_RENAMED", {
      oldValue: "أ",
      newValue: "ب",
      effectiveFrom: null,
      detectedAt: DETECTED,
      methodologyChangeConfirmed: true,
    });
    expect(result.severity).toBe("CRITICAL");
    expect(result.policyId).toBe("POL-CRIT-METHODOLOGY");
    expect(result.rationale).toMatch(/new rule version/);
  });
});
