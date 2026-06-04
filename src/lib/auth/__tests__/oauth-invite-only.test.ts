import { describe, expect, it, jest } from "@jest/globals";
import { isOAuthInviteAllowed } from "../oauth-invite-only";

describe("isOAuthInviteAllowed", () => {
  it("denies when email is missing", async () => {
    const find = jest.fn();
    expect(await isOAuthInviteAllowed(undefined, find)).toBe(false);
    expect(find).not.toHaveBeenCalled();
  });

  it("denies unknown email", async () => {
    const find = jest.fn().mockResolvedValue(null);
    expect(await isOAuthInviteAllowed("new@corp.com", find)).toBe(false);
  });

  it("allows existing user email", async () => {
    const find = jest.fn().mockResolvedValue({ id: "u1" });
    expect(await isOAuthInviteAllowed("Admin@Aqliya.com", find)).toBe(true);
    expect(find).toHaveBeenCalledWith("admin@aqliya.com");
  });
});
