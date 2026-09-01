import {
  isScimAdminRoleAllowed,
  resolveScimProvisionedRole,
  roleFromScimRolesValue,
  ScimRoleDeniedError,
} from "@/lib/auth/scim-role";

describe("SCIM provisioned role cap", () => {
  const previous = process.env.SCIM_ALLOW_ADMIN_ROLE;

  afterEach(() => {
    process.env.SCIM_ALLOW_ADMIN_ROLE = previous;
  });

  it("defaults missing role to OPERATOR", () => {
    delete process.env.SCIM_ALLOW_ADMIN_ROLE;
    expect(resolveScimProvisionedRole(undefined)).toBe("OPERATOR");
    expect(resolveScimProvisionedRole("")).toBe("OPERATOR");
  });

  it("allows VIEWER and OPERATOR without a flag", () => {
    delete process.env.SCIM_ALLOW_ADMIN_ROLE;
    expect(resolveScimProvisionedRole("viewer")).toBe("VIEWER");
    expect(resolveScimProvisionedRole("OPERATOR")).toBe("OPERATOR");
  });

  it("denies ADMIN unless SCIM_ALLOW_ADMIN_ROLE=true", () => {
    delete process.env.SCIM_ALLOW_ADMIN_ROLE;
    expect(() => resolveScimProvisionedRole("ADMIN")).toThrow(ScimRoleDeniedError);
    expect(() => resolveScimProvisionedRole("ADMIN")).toThrow(/cannot assign ADMIN/);
  });

  it("does not treat SCIM_ALLOW_ADMIN_ROLE=false as allow", () => {
    process.env.SCIM_ALLOW_ADMIN_ROLE = "false";
    expect(isScimAdminRoleAllowed()).toBe(false);
    expect(() => resolveScimProvisionedRole("ADMIN")).toThrow(ScimRoleDeniedError);
  });

  it("allows ADMIN only when SCIM_ALLOW_ADMIN_ROLE=true", () => {
    process.env.SCIM_ALLOW_ADMIN_ROLE = "true";
    expect(isScimAdminRoleAllowed()).toBe(true);
    expect(resolveScimProvisionedRole("ADMIN")).toBe("ADMIN");
  });

  it("rejects unknown roles", () => {
    expect(() => resolveScimProvisionedRole("SUPER_ADMIN")).toThrow(ScimRoleDeniedError);
    expect(() => resolveScimProvisionedRole("PlatformAdmin")).toThrow(ScimRoleDeniedError);
  });

  it("reads roles[0].value shaped payloads", () => {
    expect(roleFromScimRolesValue("OPERATOR")).toBe("OPERATOR");
    expect(roleFromScimRolesValue([{ value: "VIEWER" }])).toBe("VIEWER");
  });
});
