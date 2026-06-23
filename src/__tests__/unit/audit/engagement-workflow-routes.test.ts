import fs from "node:fs";
import path from "node:path";

const ENGAGEMENT_ROOT = path.join(
  process.cwd(),
  "src",
  "app",
  "audit",
  "engagements",
  "[engagementId]",
);

const WORKFLOW_TABS = [
  "page.tsx",
  "trial-balance/page.tsx",
  "mapping/page.tsx",
  "validation/page.tsx",
  "statements/page.tsx",
  "notes/page.tsx",
  "evidence/page.tsx",
  "findings/page.tsx",
  "recommendations/page.tsx",
  "review/page.tsx",
  "approval/page.tsx",
  "publication/page.tsx",
  "exports/page.tsx",
  "audit-trail/page.tsx",
  "pilot/page.tsx",
  "sampling/page.tsx",
  "materiality/page.tsx",
  "factory-map/page.tsx",
  "lead-schedules/page.tsx",
];

const GOVERNANCE_MODULES = [
  "src/lib/audit/governance/approval-gates.ts",
  "src/lib/audit/governance/governance-engine.ts",
  "src/actions/audit-export-actions.ts",
  "src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts",
  "src/components/audit/exports/export-download-button.tsx",
  "src/components/audit/layout/workflow-guard.tsx",
];

describe("AuditOS engagement workflow routes (Phase 2)", () => {
  it.each(WORKFLOW_TABS)("tab page exists: %s", (rel) => {
    expect(fs.existsSync(path.join(ENGAGEMENT_ROOT, rel))).toBe(true);
  });

  it.each(GOVERNANCE_MODULES)("%s exists", (rel) => {
    expect(fs.existsSync(path.join(process.cwd(), rel))).toBe(true);
  });

  it("exports page documents draft vs approved governance", () => {
    const content = fs.readFileSync(
      path.join(ENGAGEMENT_ROOT, "exports/page.tsx"),
      "utf8",
    );
    expect(content).toMatch(/مسودة/);
    expect(content).toMatch(/معتمد/);
    expect(content).toMatch(/isDraft/);
  });

  it("export action enforces factory approval gates when enabled", () => {
    const content = fs.readFileSync(
      path.join(process.cwd(), "src/actions/audit-export-actions.ts"),
      "utf8",
    );
    expect(content).toMatch(/assertFactoryApprovalGatesPass/);
    expect(content).toMatch(/enforceAuditRateLimit/);
  });
});
