import { TenantAccessError, assertOrganizationAccess } from "@/lib/audit/tenant-guard"
import { readFileSync } from "fs"
import { join } from "path"

const makeActor = (orgId: string) => ({
  actorId: "test-actor",
  actorName: "Test User",
  actorRole: "operator",
  organizationId: orgId,
})

describe("Tenant Isolation Audit", () => {
  describe("assertOrganizationAccess", () => {
    it("allows access when org matches", async () => {
      const actor = makeActor("org-alpha")
      await expect(
        assertOrganizationAccess("org-alpha", actor),
      ).resolves.toBeUndefined()
    })

    it("rejects access when org mismatches", async () => {
      const actor = makeActor("org-alpha")
      await expect(
        assertOrganizationAccess("org-beta", actor),
      ).rejects.toThrow(TenantAccessError)
    })

    it("rejects access with meaningful error message", async () => {
      const actor = makeActor("org-alpha")
      await expect(
        assertOrganizationAccess("org-beta", actor),
      ).rejects.toThrow("Access denied: organization mismatch")
    })
  })

  describe("requireRole", () => {
    it("allows access when role matches", () => {
      const { requireRole } = jest.requireActual("@/lib/audit/actor-context")
      expect(() =>
        requireRole(makeActor("org-a"), ["admin", "operator"]),
      ).not.toThrow()
    })

    it("rejects access when role does not match", () => {
      const { requireRole } = jest.requireActual("@/lib/audit/actor-context")
      expect(() =>
        requireRole(
          { ...makeActor("org-a"), actorRole: "viewer" },
          ["admin", "operator"],
        ),
      ).toThrow("Access denied")
    })
  })

  describe("schema isolation fields", () => {
    const schema = readFileSync(
      join(__dirname, "../../prisma/schema.prisma"),
      "utf-8",
    )

    it("platformOrganizationId exists on ClientWorkspace model", () => {
      const block = schema.match(/model ClientWorkspace \{[\s\S]*?\n\}/)?.[0]
      expect(block).toContain("platformOrganizationId")
    })

    it("platformOrganizationId exists on Organization model", () => {
      const block = schema.match(/model Organization \{[\s\S]*?\n\}/)?.[0]
      expect(block).toContain("platformOrganizationId")
    })

    it("platformOrganizationId exists on AuditOrganization model", () => {
      const block = schema.match(/model AuditOrganization \{[\s\S]*?\n\}/)?.[0]
      expect(block).toContain("platformOrganizationId")
    })

    it("platformOrganizationId exists on SunbulClient model", () => {
      const block = schema.match(/model SunbulClient \{[\s\S]*?\n\}/)?.[0]
      expect(block).toContain("platformOrganizationId")
    })
  })

  describe("tenant action gates", () => {
    it("tenant-actions.ts imports requireUserContext with ADMIN role", () => {
      const actions = readFileSync(
        join(__dirname, "../actions/tenant-actions.ts"),
        "utf-8",
      )
      const adminGates = actions.match(/requireUserContext\("ADMIN"\)/g)
      expect(adminGates).not.toBeNull()
      expect(adminGates!.length).toBeGreaterThanOrEqual(4)
    })

    it("tenant-actions.ts scopes platform org access to actor tenant", () => {
      const actions = readFileSync(
        join(__dirname, "../actions/tenant-actions.ts"),
        "utf-8",
      )
      expect(actions).toContain("assertPlatformOrgAccess")
      expect(actions).toContain("resolveActorPlatformOrgId")
      expect(actions).toMatch(
        /listTenantsAction[\s\S]*?where:\s*\{\s*id:\s*platformOrgId/,
      )
    })
  })
})
