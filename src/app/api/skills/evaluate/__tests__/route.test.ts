import { describe, expect, it, jest } from "@jest/globals";

const requireUserContext = jest.fn();

jest.mock("@/lib/auth", () => ({
  requireUserContext: (...args: unknown[]) => requireUserContext(...args),
}));

jest.mock("@/lib/skill-runtime/runtime", () => ({
  loadManifest: jest.fn(),
}));

describe("GET /api/skills/evaluate", () => {
  beforeEach(() => {
    requireUserContext.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    requireUserContext.mockRejectedValue(new Error("Unauthenticated"));

    const { GET } = await import("../route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when caller is not ADMIN", async () => {
    requireUserContext.mockRejectedValue(
      new Error("Access denied: ADMIN role required"),
    );

    const { GET } = await import("../route");
    const res = await GET();
    expect(res.status).toBe(403);
  });
});
