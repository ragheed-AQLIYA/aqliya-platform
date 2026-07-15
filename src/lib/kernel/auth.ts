/**
 * Auth kernel bridge — re-exports core auth functions from the platform auth layer.
 * Consumers import from `@/lib/kernel` instead of `@/lib/auth` to keep
 * the kernel as the single import surface.
 */

export { getCurrentUser, hasRequiredRole, isExpectedAccessDeniedError, isAdmin } from "@/lib/auth";
export type { CurrentUser, RequiredRole } from "@/lib/auth";

export { encrypt, decrypt } from "@/lib/auth/encryption";
