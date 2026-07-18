/**
 * Architectural Budgets — Policy Logic Tests
 *
 * Tests the three budget policy types with mock data.
 * Does NOT import from architectural-budgets.mjs to avoid
 * the ESM → CJS transform chain issues with fs-utils.
 *
 * Run: npx jest --config jest.config.engineering.js engineering/__tests__/architectural-budgets
 */

// ─── Policy Logic (extracted from architectural-budgets.mjs) ────────

type BudgetPolicy = "fixed" | "decrease_only" | "no_regression";

interface BudgetDef {
  id: string;
  label: string;
  policy: BudgetPolicy;
  max: number;
  extract: (data: Record<string, unknown>) => number;
}

interface BudgetResult {
  id: string;
  label: string;
  policy: BudgetPolicy;
  max: number;
  current: number | null;
  baseline: number | null;
  status: "PASS" | "FAIL" | "WARN" | "SKIP";
  reason: string;
}

function evaluatePolicy(
  policy: BudgetPolicy,
  current: number,
  max: number,
  baseValue: number | null
): { status: BudgetResult["status"]; reason: string } {
  switch (policy) {
    case "fixed": {
      if (current !== max) {
        return { status: "FAIL", reason: `Expected exactly ${max}, found ${current}` };
      }
      return { status: "PASS", reason: `At target: ${current} = ${max}` };
    }
    case "decrease_only": {
      if (baseValue != null && current > baseValue) {
        return {
          status: "FAIL",
          reason: `Increased from ${baseValue} → ${current} (must decrease or hold)`,
        };
      }
      if (current > max) {
        return {
          status: "WARN",
          reason: `Above target max ${max} (current: ${current})`,
        };
      }
      return {
        status: "PASS",
        reason: baseValue != null
          ? `${baseValue} → ${current} (decreased or held)`
          : `At ${current}, max ${max}`,
      };
    }
    case "no_regression": {
      if (baseValue != null && current > baseValue) {
        return {
          status: "FAIL",
          reason: `Regressed from ${baseValue} → ${current}`,
        };
      }
      if (current > max) {
        return {
          status: "WARN",
          reason: `Above max ${max} (current: ${current})`,
        };
      }
      return {
        status: "PASS",
        reason: baseValue != null
          ? `${baseValue} → ${current} (no regression)`
          : `At ${current}, max ${max}`,
      };
    }
  }
}

// ─── Test Data ──────────────────────────────────────────────────────

const MOCK_REPORTS: Record<string, { findings: Record<string, string>[] }> = {
  "code-health": {
    findings: [
      { category: "god-object", severity: "high" },
      { category: "god-object", severity: "high" },
      { category: "god-object", severity: "medium" },
      { category: "long-function", severity: "medium" },
      { category: "long-function", severity: "medium" },
      { category: "circular-dependency", severity: "medium" },
      { category: "solid-srp", severity: "low" },
    ],
  },
  security: {
    findings: [
      { severity: "high" },
      { severity: "medium" },
      { severity: "critical" },
    ],
  },
  performance: {
    findings: [
      { category: "n-plus-one", severity: "high" },
      { category: "unbounded-query", severity: "medium" },
    ],
  },
};

const TEST_BUDGETS: BudgetDef[] = [
  {
    id: "god_objects",
    label: "God Objects",
    policy: "no_regression",
    max: 6,
    extract: (d) => (d.findings as any[]).filter((f) => f.category === "god-object").length,
  },
  {
    id: "circular_deps",
    label: "Circular Dependencies",
    policy: "fixed",
    max: 0,
    extract: (d) =>
      (d.findings as any[]).filter((f) => f.category === "circular-dependency").length,
  },
  {
    id: "security_high",
    label: "Security High",
    policy: "decrease_only",
    max: 5,
    extract: (d) => (d.findings as any[]).filter((f) => f.severity === "high").length,
  },
  {
    id: "n_plus_one",
    label: "N+1 Queries",
    policy: "no_regression",
    max: 10,
    extract: (d) =>
      (d.findings as any[]).filter((f) => f.category === "n-plus-one" && f.severity === "high")
        .length,
  },
];

// ─── Tests ──────────────────────────────────────────────────────────

describe("Architectural Budgets — Policy Logic", () => {
  // ── Fixed Policy ──
  describe("fixed policy", () => {
    test("PASS when current equals max", () => {
      const result = evaluatePolicy("fixed", 0, 0, null);
      expect(result.status).toBe("PASS");
    });

    test("FAIL when current exceeds max", () => {
      const result = evaluatePolicy("fixed", 4, 0, null);
      expect(result.status).toBe("FAIL");
      expect(result.reason).toContain("Expected exactly 0, found 4");
    });

    test("FAIL when current is below max", () => {
      const result = evaluatePolicy("fixed", 2, 5, null);
      expect(result.status).toBe("FAIL");
    });
  });

  // ── Decrease Only Policy ──
  describe("decrease_only policy", () => {
    test("PASS when current equals baseline", () => {
      const result = evaluatePolicy("decrease_only", 3, 10, 3);
      expect(result.status).toBe("PASS");
    });

    test("PASS when current is below baseline", () => {
      const result = evaluatePolicy("decrease_only", 2, 10, 5);
      expect(result.status).toBe("PASS");
    });

    test("FAIL when current increases from baseline", () => {
      const result = evaluatePolicy("decrease_only", 5, 10, 3);
      expect(result.status).toBe("FAIL");
      expect(result.reason).toContain("Increased from 3 → 5");
    });

    test("WARN when above max but held vs baseline", () => {
      const result = evaluatePolicy("decrease_only", 15, 10, 15);
      expect(result.status).toBe("WARN");
    });

    test("PASS when no baseline and within max", () => {
      const result = evaluatePolicy("decrease_only", 3, 10, null);
      expect(result.status).toBe("PASS");
    });
  });

  // ── No Regression Policy ──
  describe("no_regression policy", () => {
    test("PASS when current equals baseline", () => {
      const result = evaluatePolicy("no_regression", 6, 6, 6);
      expect(result.status).toBe("PASS");
    });

    test("PASS when current is below baseline", () => {
      const result = evaluatePolicy("no_regression", 4, 6, 6);
      expect(result.status).toBe("PASS");
    });

    test("FAIL when current exceeds baseline", () => {
      const result = evaluatePolicy("no_regression", 8, 10, 6);
      expect(result.status).toBe("FAIL");
      expect(result.reason).toContain("Regressed from 6 → 8");
    });

    test("WARN when above max but no baseline", () => {
      const result = evaluatePolicy("no_regression", 12, 10, null);
      expect(result.status).toBe("WARN");
    });

    test("PASS when no baseline and within max", () => {
      const result = evaluatePolicy("no_regression", 3, 10, null);
      expect(result.status).toBe("PASS");
    });
  });
});

describe("Architectural Budgets — Metric Extraction", () => {
  test("extracts god-object count correctly", () => {
    const budget = TEST_BUDGETS.find((b) => b.id === "god_objects")!;
    expect(budget.extract(MOCK_REPORTS["code-health"])).toBe(3);
  });

  test("extracts circular-dependency count correctly", () => {
    const budget = TEST_BUDGETS.find((b) => b.id === "circular_deps")!;
    expect(budget.extract(MOCK_REPORTS["code-health"])).toBe(1);
  });

  test("extracts security high count correctly", () => {
    const budget = TEST_BUDGETS.find((b) => b.id === "security_high")!;
    expect(budget.extract(MOCK_REPORTS.security)).toBe(1);
  });

  test("extracts n-plus-one high count correctly", () => {
    const budget = TEST_BUDGETS.find((b) => b.id === "n_plus_one")!;
    expect(budget.extract(MOCK_REPORTS.performance)).toBe(1);
  });
});

describe("Architectural Budgets — Budget Config Sanity", () => {
  test("all budgets have required fields", () => {
    for (const b of TEST_BUDGETS) {
      expect(b.id).toBeTruthy();
      expect(b.label).toBeTruthy();
      expect(["fixed", "decrease_only", "no_regression"]).toContain(b.policy);
      expect(typeof b.max).toBe("number");
      expect(typeof b.extract).toBe("function");
    }
  });

  test("fixed budgets have max of 0", () => {
    const fixedBudgets = TEST_BUDGETS.filter((b) => b.policy === "fixed");
    for (const b of fixedBudgets) {
      expect(b.max).toBe(0);
    }
  });
});
