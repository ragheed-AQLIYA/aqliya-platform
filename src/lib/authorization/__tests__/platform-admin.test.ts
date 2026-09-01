import { assertPlatformAdmin, isPlatformAdmin } from "@/lib/authorization/platform-admin";

describe("platform admin allow-list", () => {
  const previousIds = process.env.PLATFORM_ADMIN_USER_IDS;
  const previousEmails = process.env.PLATFORM_ADMIN_EMAILS;

  afterEach(() => {
    process.env.PLATFORM_ADMIN_USER_IDS = previousIds;
    process.env.PLATFORM_ADMIN_EMAILS = previousEmails;
  });

  it("fails closed when allow-lists are empty", () => {
    delete process.env.PLATFORM_ADMIN_USER_IDS;
    delete process.env.PLATFORM_ADMIN_EMAILS;
    expect(
      isPlatformAdmin({ id: "anyone", email: "admin@tenant.com" }),
    ).toBe(false);
  });

  it("does not treat tenant ADMIN identity as platform admin", () => {
    delete process.env.PLATFORM_ADMIN_USER_IDS;
    delete process.env.PLATFORM_ADMIN_EMAILS;
    expect(
      isPlatformAdmin({ id: "tenant-admin", email: "admin@org-a.com" }),
    ).toBe(false);
  });

  it("matches allow-listed email case-insensitively", () => {
    process.env.PLATFORM_ADMIN_EMAILS = "ops@aqliya.com";
    delete process.env.PLATFORM_ADMIN_USER_IDS;
    expect(
      isPlatformAdmin({ id: "u-1", email: "OPS@AQLIYA.COM" }),
    ).toBe(true);
    expect(
      isPlatformAdmin({ id: "u-2", email: "other@aqliya.com" }),
    ).toBe(false);
  });

  it("assertPlatformAdmin denies tenant users", () => {
    delete process.env.PLATFORM_ADMIN_USER_IDS;
    delete process.env.PLATFORM_ADMIN_EMAILS;
    expect(() =>
      assertPlatformAdmin({ id: "tenant-admin", email: "admin@org-a.com" }),
    ).toThrow("platform administrator required");
  });
});
