/**
 * Platform-admin identity — separate from tenant UserRole.ADMIN.
 *
 * Tenant ADMIN is scoped to user.organizationId.
 * Platform operations require an explicit allow-list (env), not a Prisma role.
 * An empty allow-list means nobody is a platform admin (fail closed).
 */

export type PlatformAdminIdentity = {
  id: string;
  email?: string | null;
};

function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformAdmin(user: PlatformAdminIdentity): boolean {
  const ids = parseList(process.env.PLATFORM_ADMIN_USER_IDS);
  const emails = parseList(process.env.PLATFORM_ADMIN_EMAILS);
  if (ids.length === 0 && emails.length === 0) return false;
  if (ids.includes(user.id.toLowerCase())) return true;
  const email = user.email?.trim().toLowerCase();
  if (email && emails.includes(email)) return true;
  return false;
}

export function assertPlatformAdmin(user: PlatformAdminIdentity): void {
  if (!isPlatformAdmin(user)) {
    throw new Error("Access denied: platform administrator required");
  }
}
