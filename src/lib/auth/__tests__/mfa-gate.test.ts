import { resetMFARequiredRolesCache } from "@/lib/auth/mfa-roles";
import { resolveMfaGateState } from "@/lib/auth/mfa-gate";

describe("resolveMfaGateState", () => {
  afterEach(() => {
    resetMFARequiredRolesCache();
    delete process.env.MFA_REQUIRED_ROLES;
  });

  it("allows exempt paths regardless of MFA state", () => {
    expect(
      resolveMfaGateState({
        role: "ADMIN",
        mfaEnabled: false,
        mfaVerified: false,
        isExempt: true,
      }),
    ).toBe("allow");
  });

  it("allows roles outside the MFA-required set", () => {
    expect(
      resolveMfaGateState({
        role: "VIEWER",
        mfaEnabled: false,
        mfaVerified: false,
        isExempt: false,
      }),
    ).toBe("allow");
  });

  it("requires enrollment when MFA is mandatory but not enabled", () => {
    expect(
      resolveMfaGateState({
        role: "OPERATOR",
        mfaEnabled: false,
        mfaVerified: false,
        isExempt: false,
      }),
    ).toBe("enroll");
  });

  it("requires challenge when MFA is enabled but not verified this session", () => {
    expect(
      resolveMfaGateState({
        role: "ADMIN",
        mfaEnabled: true,
        mfaVerified: false,
        isExempt: false,
      }),
    ).toBe("challenge");
  });

  it("allows verified MFA sessions", () => {
    expect(
      resolveMfaGateState({
        role: "ADMIN",
        mfaEnabled: true,
        mfaVerified: true,
        isExempt: false,
      }),
    ).toBe("allow");
  });

  it("respects MFA_REQUIRED_ROLES override when enforcement is disabled", () => {
    process.env.MFA_REQUIRED_ROLES = "";
    resetMFARequiredRolesCache();

    expect(
      resolveMfaGateState({
        role: "ADMIN",
        mfaEnabled: false,
        mfaVerified: false,
        isExempt: false,
      }),
    ).toBe("allow");
  });
});
