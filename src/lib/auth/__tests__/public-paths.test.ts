import { isPublicPath } from "@/lib/auth/public-paths";

describe("default-deny public path allowlist", () => {
  it("allows documented public marketing and auth surfaces", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/api/auth/session")).toBe(true);
    expect(isPublicPath("/api/health")).toBe(true);
    expect(isPublicPath("/api/pow/challenge")).toBe(true);
    expect(isPublicPath("/api/crm/webhook")).toBe(true);
    expect(isPublicPath("/api/scim/v2/Users")).toBe(true);
    expect(isPublicPath("/auditos/demo")).toBe(true);
  });

  it("denies workspace and unmatched operator paths", () => {
    expect(isPublicPath("/admin")).toBe(false);
    expect(isPublicPath("/feedback")).toBe(false);
    expect(isPublicPath("/monitoring")).toBe(false);
    expect(isPublicPath("/api/metrics")).toBe(false);
    expect(isPublicPath("/api/knowledge/rag/search")).toBe(false);
  });
});
