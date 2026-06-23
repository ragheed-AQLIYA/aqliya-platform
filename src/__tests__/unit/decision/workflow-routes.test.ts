import fs from "node:fs";
import path from "node:path";

const DECISION_ROOT = path.join(
  process.cwd(),
  "src",
  "app",
  "(dashboard)",
  "decisions",
);

const DECISION_ROUTES = [
  "page.tsx",
  "new/page.tsx",
  "pilot-readiness/page.tsx",
  "gov/page.tsx",
  "gov/escalation-rules/page.tsx",
  "[id]/page.tsx",
  "[id]/overview/page.tsx",
  "[id]/intake/page.tsx",
  "[id]/risks/page.tsx",
  "[id]/recommendation/page.tsx",
  "[id]/governance/page.tsx",
  "[id]/report/page.tsx",
  "[id]/outcome/page.tsx",
];

const GOVERNANCE_MODULES = [
  "src/lib/decision/decision-engine.ts",
  "src/lib/decision/framework.ts",
  "src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts",
];

describe("DecisionOS workflow routes (Phase 2-C entry)", () => {
  it.each(DECISION_ROUTES)("route exists: %s", (rel) => {
    expect(fs.existsSync(path.join(DECISION_ROOT, rel))).toBe(true);
  });

  it.each(GOVERNANCE_MODULES)("%s exists", (rel) => {
    expect(fs.existsSync(path.join(process.cwd(), rel))).toBe(true);
  });

  it("decision evidence download enforces access", () => {
    const content = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts",
      ),
      "utf8",
    );
    expect(content).toMatch(/requireDecisionAccess|getCurrentUser/);
    expect(content).toMatch(/auditLogger|logAudit/);
  });
});
