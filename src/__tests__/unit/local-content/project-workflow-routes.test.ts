import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.join(
  process.cwd(),
  "src",
  "app",
  "local-content",
  "projects",
  "[projectId]",
);

const PROJECT_TABS = [
  "page.tsx",
  "suppliers/page.tsx",
  "spend/page.tsx",
  "classification/page.tsx",
  "evidence/page.tsx",
  "findings/page.tsx",
  "reports/page.tsx",
  "review/page.tsx",
  "approval/page.tsx",
  "audit-trail/page.tsx",
  "verification/page.tsx",
  "tender-match/page.tsx",
];

const WORKSPACE_ROUTES = [
  "src/app/local-content/page.tsx",
  "src/app/local-content/projects/page.tsx",
  "src/app/local-content/pilot-readiness/page.tsx",
  "src/app/local-content/settings/integrations/page.tsx",
  "src/lib/local-content/workflow-gating.ts",
  "src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts",
  "src/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts",
];

describe("LocalContentOS project workflow routes (Phase 2-B)", () => {
  it.each(PROJECT_TABS)("project tab exists: %s", (rel) => {
    expect(fs.existsSync(path.join(PROJECT_ROOT, rel))).toBe(true);
  });

  it.each(WORKSPACE_ROUTES)("%s exists", (rel) => {
    expect(fs.existsSync(path.join(process.cwd(), rel))).toBe(true);
  });

  it("report download route requires project access", () => {
    const content = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts",
      ),
      "utf8",
    );
    expect(content).toMatch(/assertProjectAccess/);
    expect(content).toMatch(/auditLogger/);
  });

  it("pilot-readiness page is wired", () => {
    const content = fs.readFileSync(
      path.join(process.cwd(), "src/app/local-content/pilot-readiness/page.tsx"),
      "utf8",
    );
    expect(content).toMatch(/getPilotReadiness/);
  });
});
