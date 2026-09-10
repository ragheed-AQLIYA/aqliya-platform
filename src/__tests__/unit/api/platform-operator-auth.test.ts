import { readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

function readRoute(relative: string): string {
  return readFileSync(join(root, relative), "utf8");
}

describe("platform operator routes require isPlatformAdmin or tenant scope", () => {
  const platformAdminOnly = [
    "src/app/api/platform/enterprise-health/route.ts",
    "src/app/api/platform/evidence/health/route.ts",
    "src/app/api/platform/events/registry/route.ts",
    "src/app/api/platform/retention/history/route.ts",
    "src/app/api/platform/retention/route.ts",
    "src/app/api/monitoring/health/route.ts",
    "src/app/api/skills/evaluate/route.ts",
  ];

  it.each(platformAdminOnly)("%s calls assertPlatformAdmin", (file) => {
    const source = readRoute(file);
    expect(source).toContain("assertPlatformAdmin");
  });

  it("eval-gate GET/PUT require platform admin; POST stays tenant OPERATOR", () => {
    const source = readRoute("src/app/api/ai/eval-gate/route.ts");
    expect(source).toContain("assertPlatformAdmin");
    expect(source).toMatch(/hasRequiredRole\(user,\s*"OPERATOR"\)/);
  });

  it("AI spend and governance pass session organizationId for tenant ADMIN", () => {
    const spend = readRoute("src/app/api/ai/spend/route.ts");
    const gov = readRoute("src/app/api/ai/governance/route.ts");
    expect(spend).toContain("isPlatformAdmin");
    expect(spend).toContain("user.organizationId");
    expect(gov).toContain("isPlatformAdmin");
    expect(gov).toContain("user.organizationId");
  });

  it("retention policies and holds bind tenant ADMIN to organizationId not platformOrganizationId", () => {
    const policies = readRoute("src/app/api/platform/retention/policies/route.ts");
    const holds = readRoute("src/app/api/platform/retention/holds/route.ts");
    expect(policies).toContain("user.organizationId");
    expect(policies).not.toContain("platformOrganizationId");
    expect(holds).toContain("user.organizationId");
    expect(holds).not.toContain("platformOrganizationId");
  });

  it("middleware matcher is default-deny", () => {
    const source = readRoute("src/middleware.ts");
    expect(source).toContain("Default-deny matcher");
    expect(source).toContain("isPublicPath");
    expect(source).toContain("resolveSessionCookieName");
  });

  it("platform operator Server Actions require platform admin, not tenant ADMIN", () => {
    const source = readRoute("src/actions/platform-operator-actions.ts");
    expect(source).toContain("assertPlatformAdmin");
    expect(source).not.toContain("isAdmin(");
  });

  it("metrics and cache warm remain tenant-scoped ADMIN reads", () => {
    const metrics = readRoute("src/app/api/metrics/route.ts");
    const warm = readRoute("src/app/api/platform/cache/warm/route.ts");
    expect(metrics).toContain('hasRequiredRole(user, "ADMIN")');
    expect(metrics).toContain("organizationId: orgId");
    expect(warm).toContain("warmDashboardCaches(user.organizationId)");
  });

  it("SIEM export binds tenant ADMIN to session organizationId", () => {
    const source = readRoute("src/app/api/platform/siem/route.ts");
    expect(source).toContain("user.organizationId");
    expect(source).not.toContain("platformOrganizationId ??");
  });
});
