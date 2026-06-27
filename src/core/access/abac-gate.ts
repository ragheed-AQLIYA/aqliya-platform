/**
 * ABAC Gate — re-export from Intelligence Core.
 *
 * Path migration: @/core/access/* → @/lib/core/policy/access/*
 * Canonical implementation lives at @/lib/core/policy/access/abac-gate.
 */
export {
  buildAbacContext,
  listAbacEnforceOrgIds,
  isAbacEnforceEnabledForOrg,
  getAbacEnforceDenialReason,
  type AbacGateOptions,
} from "@/lib/core/policy/access/abac-gate";
