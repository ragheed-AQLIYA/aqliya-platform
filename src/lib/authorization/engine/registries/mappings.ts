/**
 * RB-02B Role × Permission Matrix & Permission → Capability Mappings
 *
 * This file contains the canonical mappings tables:
 *   1. Role → Permissions (the Role × Permission Matrix from RB-02A Ch. 7)
 *   2. Permission → Capability (from RB-02A Ch. 9)
 *
 * Every authorization decision traces through these mappings.
 *
 * @see RB-02A v1.0 §7.1 — Role × Permission Matrix
 * @see RB-02A v1.0 §9.2 — Capability-Based SoD
 */

import { Permission } from './permissions';
import { PlatformRole } from './roles';
import { Capability } from './capabilities';

// ─── Role → Permission Mapping ──────────────────────────────────

/**
 * The Role × Permission Matrix.
 * Maps each Platform Role to the set of Permissions it grants.
 *
 * This is the canonical reference. Every cell is explicit — no inheritance.
 * @see RB-02A v1.0 §7.1
 */
export const ROLE_PERMISSIONS: Record<PlatformRole, Permission[]> = {
  [PlatformRole.ORG_ADMIN]: [
    Permission.PROJECT_MANAGEMENT,
    Permission.PROJECT_DELETION,
    Permission.WORKBOOK_MANAGEMENT,
    Permission.WORKBOOK_EXPORT,
    Permission.SUPPLIER_MANAGEMENT,
    Permission.SPEND_DATA_ENTRY,
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.EVIDENCE_DELETION,
    Permission.FINDING_MANAGEMENT,
    Permission.FINDING_CLOSE,
    Permission.REVIEW_MANAGEMENT,
    Permission.REVIEW_APPROVAL,
    Permission.REVIEW_OVERRIDE,
    Permission.AI_REVIEW,
    Permission.CLASSIFICATION_MANAGEMENT,
    Permission.IMPORT,
    Permission.EXPORT_MANAGEMENT,
    Permission.REPORT_MANAGEMENT,
    Permission.AUDIT_LOG_ACCESS,
    Permission.SETTINGS_MANAGEMENT,
    Permission.ORGANIZATION_MEMBERSHIP,
    Permission.AI_CONFIGURATION,
  ],

  [PlatformRole.BUSINESS_MANAGER]: [
    Permission.PROJECT_MANAGEMENT,
    Permission.WORKBOOK_MANAGEMENT,
    Permission.WORKBOOK_EXPORT,
    Permission.SUPPLIER_MANAGEMENT,
    Permission.SPEND_DATA_ENTRY,
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.EVIDENCE_DELETION,
    Permission.FINDING_MANAGEMENT,
    Permission.FINDING_CLOSE,
    Permission.REVIEW_MANAGEMENT,
    Permission.REVIEW_APPROVAL,
    Permission.AI_REVIEW,
    Permission.CLASSIFICATION_MANAGEMENT,
    Permission.IMPORT,
    Permission.EXPORT_MANAGEMENT,
    Permission.REPORT_MANAGEMENT,
    Permission.AUDIT_LOG_ACCESS, // project-scoped only
  ],

  [PlatformRole.REVIEWER]: [
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.EVIDENCE_DELETION,
    Permission.FINDING_MANAGEMENT,
    Permission.FINDING_CLOSE,
    Permission.REVIEW_MANAGEMENT,
    Permission.REVIEW_APPROVAL,
    Permission.AI_REVIEW,
    Permission.REPORT_MANAGEMENT,
  ],

  [PlatformRole.ANALYST]: [
    Permission.WORKBOOK_MANAGEMENT,
    Permission.SUPPLIER_MANAGEMENT,
    Permission.SPEND_DATA_ENTRY,
    Permission.EVIDENCE_UPLOAD,
    Permission.EVIDENCE_READ,
    Permission.IMPORT,
    Permission.EXPORT_MANAGEMENT,
    Permission.REPORT_MANAGEMENT,
  ],

  [PlatformRole.READ_ONLY]: [
    Permission.EVIDENCE_READ,
    Permission.AI_REVIEW,
    Permission.REPORT_MANAGEMENT,
    Permission.REPORT_MANAGEMENT,
  ],

  [PlatformRole.EXTERNAL_AUDITOR]: [
    Permission.EVIDENCE_READ,
    Permission.AI_REVIEW,
    Permission.REPORT_MANAGEMENT,
    Permission.AUDIT_LOG_ACCESS,
  ],

  [PlatformRole.INTEGRATION_ACCOUNT]: [],
};

/**
 * Check if a role has a specific permission.
 * Use this instead of `role === "ADMIN"` comparisons.
 */
export function roleHasPermission(
  role: PlatformRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role.
 */
export function permissionsForRole(role: PlatformRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Get all roles that have a specific permission.
 */
export function rolesWithPermission(permission: Permission): PlatformRole[] {
  return Object.entries(ROLE_PERMISSIONS)
    .filter(([_, perms]) => perms.includes(permission))
    .map(([role]) => role as PlatformRole);
}

// ─── Permission → Capability Mapping ────────────────────────────

/**
 * Maps each Permission to the Capability it belongs to.
 * This is the canonical reference for Capability-Based SoD.
 *
 * @see RB-02A v1.0 §9.2
 */
export const PERMISSION_CAPABILITY: Record<Permission, Capability> = {
  [Permission.PROJECT_MANAGEMENT]: Capability.CREATE,
  [Permission.PROJECT_DELETION]: Capability.ADMIN,
  [Permission.WORKBOOK_MANAGEMENT]: Capability.CREATE,
  [Permission.WORKBOOK_EXPORT]: Capability.CREATE,
  [Permission.SUPPLIER_MANAGEMENT]: Capability.CREATE,
  [Permission.SPEND_DATA_ENTRY]: Capability.CREATE,
  [Permission.EVIDENCE_UPLOAD]: Capability.CREATE,
  [Permission.EVIDENCE_READ]: Capability.REVIEW,
  [Permission.EVIDENCE_DELETION]: Capability.ADMIN,
  [Permission.FINDING_MANAGEMENT]: Capability.CREATE,
  [Permission.FINDING_CLOSE]: Capability.CLOSE,
  [Permission.REVIEW_MANAGEMENT]: Capability.CREATE,
  [Permission.REVIEW_APPROVAL]: Capability.REVIEW,
  [Permission.REVIEW_OVERRIDE]: Capability.CLOSE,
  [Permission.AI_REVIEW]: Capability.REVIEW,
  [Permission.CLASSIFICATION_MANAGEMENT]: Capability.CONFIGURE,
  [Permission.IMPORT]: Capability.IMPORT,
  [Permission.EXPORT_MANAGEMENT]: Capability.EXPORT,
  [Permission.REPORT_MANAGEMENT]: Capability.CREATE,
  [Permission.AUDIT_LOG_ACCESS]: Capability.ADMIN,
  [Permission.SETTINGS_MANAGEMENT]: Capability.CONFIGURE,
  [Permission.ORGANIZATION_MEMBERSHIP]: Capability.ADMIN,
  [Permission.AI_CONFIGURATION]: Capability.CONFIGURE,
};

/**
 * Get the capability for a given permission.
 * Returns undefined if the permission has no capability mapping.
 */
export function capabilityForPermission(
  permission: Permission,
): Capability | undefined {
  return PERMISSION_CAPABILITY[permission];
}

/**
 * Get all permissions for a given capability.
 */
export function permissionsForCapability(
  capability: Capability,
): Permission[] {
  return Object.entries(PERMISSION_CAPABILITY)
    .filter(([_, cap]) => cap === capability)
    .map(([perm]) => perm as Permission);
}

// ─── Validation Helpers ─────────────────────────────────────────

/**
 * Verify that every permission has a capability mapping.
 * Invariant: Every Permission belongs to exactly one Capability.
 */
export function validateAllPermissionsMapped(): Permission[] {
  const unmapped: Permission[] = [];
  for (const permission of Object.values(Permission)) {
    if (!PERMISSION_CAPABILITY[permission]) {
      unmapped.push(permission);
    }
  }
  return unmapped;
}

/**
 * Verify that every role has at least one permission.
 * Invariant: Every Role grants at least one Permission.
 */
export function validateAllRolesHavePermissions(): PlatformRole[] {
  const empty: PlatformRole[] = [];
  for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
    if (perms.length === 0) {
      empty.push(role as PlatformRole);
    }
  }
  return empty;
}
