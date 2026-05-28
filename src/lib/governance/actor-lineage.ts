/**
 * Shared actor lineage helpers.
 *
 * Provides lightweight checks for creator-based access control and
 * audit actor identity normalization. Reused across products to avoid
 * duplicating admin override and createdById checks.
 *
 * Not a replacement for full RBAC. Complements existing guards.
 */

/**
 * Determines whether the actor can mutate a record based on creator lineage.
 *
 * - ADMIN users may mutate any record.
 * - OPERATOR users may mutate records they created.
 * - Other roles are denied.
 *
 * @param actorId – current user's id
 * @param actorRole – current user's role (ADMIN/OPERATOR/VIEWER)
 * @param recordCreatedById – the record's createdById field (nullable)
 * @returns true if the actor is authorized by lineage
 */
export function canMutateByLineage(
  actorId: string,
  actorRole: string,
  recordCreatedById: string | null | undefined,
): boolean {
  if (actorRole === "ADMIN") return true;
  if (actorRole !== "OPERATOR") return false;
  return recordCreatedById === actorId;
}

/**
 * Builds a descriptive actor label for audit event recording.
 * Prefers name, falls back to email, then id.
 */
export function actorDisplayName(
  id: string,
  name?: string | null,
  email?: string | null,
): string {
  return name || email || id;
}
