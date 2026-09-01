import { describe, expect, it, jest } from "@jest/globals";

const getCurrentUser = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

jest.mock("@/lib/skill-runtime/runtime", () => ({
  loadManifest: jest.fn(),
}));

describe("GET /api/skills/evaluate", () => {
  const previousIds = process.env.PLATFORM_ADMIN_USER_IDS;
  const previousEmails = process.env.PLATFORM_ADMIN_EMAILS;

  beforeEach(() => {
    getCurrentUser.mockReset();
    delete process.env.PLATFORM_ADMIN_USER_IDS;
    delete process.env.PLATFORM_ADMIN_EMAILS;
  });

  afterEach(() => {
    process.env.PLATFORM_ADMIN_USER_IDS = previousIds;
    process.env.PLATFORM_ADMIN_EMAILS = previousEmails;
  });

  it("returns 401 when unauthenticated", async () => {
    getCurrentUser.mockRejectedValue(new Error("Unauthenticated"));

    const { GET } = await import("../route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when caller is tenant ADMIN but not platform admin", async () => {
    getCurrentUser.mockResolvedValue({
      id: "tenant-admin",
      email: "admin@org.com",
      role: "ADMIN",
    });

    const { GET } = await import("../route");
    const res = await GET();
    expect(res.status).toBe(403);
  });
});
