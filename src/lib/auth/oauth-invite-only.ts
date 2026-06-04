import "server-only";

/**
 * OAuth sign-in is allowed only for users already provisioned in the database.
 * Does not auto-create accounts. Aligns with docs/operations/sso-enterprise-decision.md.
 */
export async function isOAuthInviteAllowed(
  email: string | null | undefined,
  findUserByEmail: (email: string) => Promise<{ id: string } | null>,
): Promise<boolean> {
  if (!email?.trim()) return false;
  const existing = await findUserByEmail(email.trim().toLowerCase());
  return existing !== null;
}
