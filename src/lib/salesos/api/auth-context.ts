/**
 * AuthContext Contract — SPEC-01b §1.4
 *
 * All Server Actions resolve AuthContext before executing domain logic.
 * Domain services receive AuthContext, never resolve it themselves.
 */

export interface AuthContext {
  user: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
  organizationId: string;
  platformOrganizationId?: string | null;
  permissions: string[];
  correlationId: string;
}

export type Permission =
  | "salesos:deal.create"
  | "salesos:deal.update"
  | "salesos:deal.review"
  | "salesos:deal.approve"
  | "salesos:evidence.link"
  | "salesos:deal.admin";

/**
 * Permission-to-Action Map (from SPEC-01b §1.5)
 */
export const PERMISSION_MAP: Record<string, Permission> = {
  create: "salesos:deal.create",
  update: "salesos:deal.update",
  review: "salesos:deal.review",
  approve: "salesos:deal.approve",
  link: "salesos:evidence.link",
  admin: "salesos:deal.admin",
};

/**
 * Stub for Platform Auth integration.
 * In production, delegates to platform.auth.AuthGuard.
 * For testing, provides a mock context.
 */
export function createAuthContext(overrides?: Partial<AuthContext>): AuthContext {
  const defaults: AuthContext = {
    user: {
      id: "user-test",
      name: "Test User",
      email: "test@aqliya.com",
      role: "ADMIN",
    },
    organizationId: "org-test",
    platformOrganizationId: null,
    permissions: Object.values(PERMISSION_MAP),
    correlationId: `corr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  if (!overrides) return defaults;
  return {
    ...defaults,
    ...overrides,
    user: { ...defaults.user, ...(overrides.user ?? {}) },
  };
}
