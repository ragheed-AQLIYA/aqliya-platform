import { CoreAccessControl } from "@/core/access/access-control";
import type { AccessRequest } from "@/core/access/types";

const baseRequest: AccessRequest = {
  userId: "user-1",
  organizationId: "org-1",
  resource: "audit",
  action: "read",
};

describe("CoreAccessControl", () => {
  it("denies by default when role is missing", async () => {
    const ctrl = new CoreAccessControl();
    const result = await ctrl.check({ ...baseRequest, role: null });
    expect(result.decision).toBe("denied");
    expect(result.reason).toContain("VIEWER");
  });

  it("denies VIEWER from create mutations", async () => {
    const ctrl = new CoreAccessControl();
    const result = await ctrl.check({
      ...baseRequest,
      role: "VIEWER",
      action: "create",
    });
    expect(result.decision).toBe("denied");
    expect(result.reason).toContain("OPERATOR");
  });

  it("denies OPERATOR from approve actions", async () => {
    const ctrl = new CoreAccessControl();
    const result = await ctrl.check({
      ...baseRequest,
      role: "OPERATOR",
      action: "approve",
    });
    expect(result.decision).toBe("denied");
    expect(result.reason).toContain("ADMIN");
  });

  it("grants when role satisfies the action minimum", async () => {
    const ctrl = new CoreAccessControl();
    const result = await ctrl.check({
      ...baseRequest,
      role: "VIEWER",
      action: "read",
    });
    expect(result).toEqual({ decision: "granted" });
  });

  it("honors requiredRole override", async () => {
    const ctrl = new CoreAccessControl();
    const result = await ctrl.check({
      ...baseRequest,
      role: "OPERATOR",
      action: "read",
      requiredRole: "ADMIN",
    });
    expect(result.decision).toBe("denied");
    expect(result.reason).toContain("ADMIN");
  });

  it("audits denials to the ledger but not grants", async () => {
    const write = jest.fn().mockResolvedValue(undefined);
    const ctrl = new CoreAccessControl({ write });

    await ctrl.check({ ...baseRequest, role: "VIEWER", action: "create" });
    await ctrl.check({ ...baseRequest, role: "VIEWER", action: "read" });

    expect(write).toHaveBeenCalledTimes(1);
    expect(write.mock.calls[0][0]).toMatchObject({
      action: "core.access.denied",
      actorId: "user-1",
    });
  });

  it("a ledger failure never flips a denial into a grant", async () => {
    const write = jest.fn().mockRejectedValue(new Error("ledger down"));
    const ctrl = new CoreAccessControl({ write });

    const result = await ctrl.check({ ...baseRequest, role: null });
    expect(result.decision).toBe("denied");
  });
});
