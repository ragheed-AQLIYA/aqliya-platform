import { describe, expect, it, jest } from "@jest/globals";

const getCurrentUser = jest.fn();
const hasRequiredRole = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
  hasRequiredRole: (...args: unknown[]) => hasRequiredRole(...args),
}));

jest.mock("@/lib/skill-runtime/runtime", () => ({
  loadManifest: jest.fn(),
}));

describe("GET /api/skills/evaluate", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    hasRequiredRole.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    getCurrentUser.mockRejectedValue(new Error("Unauthenticated"));

    const { GET } = await import("../route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when caller is not ADMIN", async () => {
    getCurrentUser.mockResolvedValue({ role: "VIEWER" });
    hasRequiredRole.mockReturnValue(false);

    const { GET } = await import("../route");
    const res = await GET();
    expect(res.status).toBe(403);
  });
});
