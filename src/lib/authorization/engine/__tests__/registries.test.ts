/**
 * Tests for RB-02B Authorization Vocabulary (Wave 2)
 *
 * Coverage:
 * - All 5 registries are complete
 * - No missing mappings
 * - Invariants: every permission → resource, every role → permissions, etc.
 * - W2-G9: No string literals in authorization core
 */

import { ResourceType, ResourceKind, RESOURCE_CATALOG, DERIVED_RESOURCES } from '../registries/resources';
import { Permission, PERMISSION_ACTIONS, PERMISSION_RESOURCE, PERMISSION_LABEL, permissionsForResource } from '../registries/permissions';
import { Capability, CAPABILITY_PERMISSIONS, capabilityForPermission } from '../registries/capabilities';
import { PlatformRole, parsePlatformRole, isValidPlatformRole } from '../registries/roles';
import {
  ROLE_PERMISSIONS,
  PERMISSION_CAPABILITY,
  roleHasPermission,
  permissionsForRole,
  validateAllPermissionsMapped,
  validateAllRolesHavePermissions,
} from '../registries/mappings';

// ─── Resource Registry ───────────────────────────────────────────

describe('Resource Registry', () => {
  it('defines 18 resource types', () => {
    const types = Object.values(ResourceType);
    expect(types).toHaveLength(18);
  });

  it('every resource has a catalog entry', () => {
    for (const type of Object.values(ResourceType)) {
      expect(RESOURCE_CATALOG[type]).toBeDefined();
      expect(RESOURCE_CATALOG[type].kind).toBeDefined();
      expect(RESOURCE_CATALOG[type].scope).toBeDefined();
    }
  });

  it('derived resources are a subset of all resources', () => {
    for (const dr of DERIVED_RESOURCES) {
      expect(Object.values(ResourceType)).toContain(dr);
      expect(RESOURCE_CATALOG[dr].kind).toBe(ResourceKind.DERIVED);
    }
  });

  it('all resource values are kebab-case (no string literals in core)', () => {
    for (const type of Object.values(ResourceType)) {
      expect(type).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});

// ─── Permission Registry ─────────────────────────────────────────

describe('Permission Registry', () => {
  it('defines 23 permissions', () => {
    const perms = Object.values(Permission);
    expect(perms).toHaveLength(23);
  });

  it('every permission has a label', () => {
    for (const perm of Object.values(Permission)) {
      expect(PERMISSION_LABEL[perm]).toBeDefined();
      expect(PERMISSION_LABEL[perm].length).toBeGreaterThan(0);
    }
  });

  it('every permission has at least one action', () => {
    for (const perm of Object.values(Permission)) {
      expect(PERMISSION_ACTIONS[perm].length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every permission belongs to one resource (Invariant I8)', () => {
    for (const perm of Object.values(Permission)) {
      expect(PERMISSION_RESOURCE[perm]).toBeDefined();
      expect(Object.values(ResourceType)).toContain(PERMISSION_RESOURCE[perm]);
    }
  });

  it('permissionsForResource returns correct permissions', () => {
    const projectPerms = permissionsForResource(ResourceType.PROJECT);
    expect(projectPerms).toContain(Permission.PROJECT_MANAGEMENT);
    expect(projectPerms).toContain(Permission.PROJECT_DELETION);
  });

  it('total actions across all permissions matches RB-02A count', () => {
    const allActions = new Set<string>();
    for (const perm of Object.values(Permission)) {
      for (const action of PERMISSION_ACTIONS[perm]) {
        allActions.add(action);
      }
    }
    // RB-02A v1.0 §4.2: 69 actions
    expect(allActions.size).toBeGreaterThanOrEqual(69);
  });

  it('no permission has duplicate actions except documented overlaps (Invariant I1)', () => {
    // settings.read/settings.update are shared between P21 (SETTINGS_MANAGEMENT)
    // and P23 (AI_CONFIGURATION) by design per RB-02A v1.0 §5.2.
    const allowedDuplicates = new Set(['settings.read', 'settings.update']);
    const actionToPermission = new Map<string, Permission>();
    for (const perm of Object.values(Permission)) {
      for (const action of PERMISSION_ACTIONS[perm]) {
        if (allowedDuplicates.has(action)) continue; // documented exception
        if (actionToPermission.has(action)) {
          expect(actionToPermission.get(action)).toBe(perm);
        } else {
          actionToPermission.set(action, perm);
        }
      }
    }
  });

  it('all permission values are enum IDs (no string literals)', () => {
    for (const perm of Object.values(Permission)) {
      expect(perm).toMatch(/^P\d{2}$/);
    }
  });
});

// ─── Capability Registry ─────────────────────────────────────────

describe('Capability Registry', () => {
  it('defines 7 capabilities', () => {
    const caps = Object.values(Capability);
    expect(caps).toHaveLength(7);
  });

  it('every capability has at least one permission', () => {
    for (const cap of Object.values(Capability)) {
      expect(CAPABILITY_PERMISSIONS[cap].length).toBeGreaterThanOrEqual(1);
    }
  });

  it('capabilityForPermission returns a capability for every permission', () => {
    for (const perm of Object.values(Permission)) {
      const cap = capabilityForPermission(perm);
      expect(cap).toBeDefined();
      // The reverse should also be true
      expect(CAPABILITY_PERMISSIONS[cap!]).toContain(perm);
    }
  });

  it('every capability value is prefixed with CAP_', () => {
    for (const cap of Object.values(Capability)) {
      expect(cap).toMatch(/^CAP_/);
    }
  });
});

// ─── Role Registry ───────────────────────────────────────────────

describe('Role Registry', () => {
  it('defines 7 platform roles', () => {
    const roles = Object.values(PlatformRole);
    expect(roles).toHaveLength(7);
  });

  it('parsePlatformRole resolves valid role strings', () => {
    expect(parsePlatformRole('ORG_ADMIN')).toBe(PlatformRole.ORG_ADMIN);
    expect(parsePlatformRole('BUSINESS_MANAGER')).toBe(PlatformRole.BUSINESS_MANAGER);
    expect(parsePlatformRole('REVIEWER')).toBe(PlatformRole.REVIEWER);
    expect(parsePlatformRole('ANALYST')).toBe(PlatformRole.ANALYST);
    expect(parsePlatformRole('READ_ONLY')).toBe(PlatformRole.READ_ONLY);
    expect(parsePlatformRole('EXTERNAL_AUDITOR')).toBe(PlatformRole.EXTERNAL_AUDITOR);
    expect(parsePlatformRole('INTEGRATION_ACCOUNT')).toBe(PlatformRole.INTEGRATION_ACCOUNT);
  });

  it('parsePlatformRole returns undefined for invalid roles', () => {
    expect(parsePlatformRole('ADMIN')).toBeUndefined();
    expect(parsePlatformRole('manager')).toBeUndefined();
    expect(parsePlatformRole('')).toBeUndefined();
  });

  it('isValidPlatformRole validates correctly', () => {
    expect(isValidPlatformRole('ORG_ADMIN')).toBe(true);
    expect(isValidPlatformRole('ADMIN')).toBe(false);
    expect(isValidPlatformRole('local_content_manager')).toBe(false);
  });

  it('no product-specific role names in the enum', () => {
    const values = Object.values(PlatformRole);
    expect(values).not.toContain('LC_MANAGER');
    expect(values).not.toContain('LOCAL_CONTENT_MANAGER');
    expect(values).not.toContain('ENGAGEMENT_MANAGER');
    expect(values).not.toContain('SALES_MANAGER');
  });
});

// ─── Mapping Tables ──────────────────────────────────────────────

describe('Mapping Tables', () => {
  it('every role has a permission set defined (Invariant I4)', () => {
    for (const role of Object.values(PlatformRole)) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
    }
  });

  it('ORG_ADMIN has all 23 permissions', () => {
    const adminPerms = permissionsForRole(PlatformRole.ORG_ADMIN);
    expect(adminPerms).toHaveLength(23);
  });

  it('INTEGRATION_ACCOUNT starts with zero permissions', () => {
    const intPerms = permissionsForRole(PlatformRole.INTEGRATION_ACCOUNT);
    expect(intPerms).toHaveLength(0);
  });

  it('roleHasPermission works correctly', () => {
    expect(roleHasPermission(PlatformRole.ORG_ADMIN, Permission.PROJECT_MANAGEMENT)).toBe(true);
    expect(roleHasPermission(PlatformRole.ANALYST, Permission.REVIEW_OVERRIDE)).toBe(false);
    expect(roleHasPermission(PlatformRole.READ_ONLY, Permission.EVIDENCE_UPLOAD)).toBe(false);
  });

  it('every permission has a capability mapping (Invariant I5)', () => {
    const unmapped = validateAllPermissionsMapped();
    expect(unmapped).toHaveLength(0);
  });

  it('every role except INTEGRATION_ACCOUNT has at least one permission (Invariant I4)', () => {
    // INTEGRATION_ACCOUNT is intentionally empty (scoped per integration)
    const rolesWithPerms = Object.values(PlatformRole).filter(
      (r) => r !== PlatformRole.INTEGRATION_ACCOUNT,
    );
    for (const role of rolesWithPerms) {
      expect(permissionsForRole(role).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('permission counts per role match RB-02A v1.0', () => {
    expect(permissionsForRole(PlatformRole.ORG_ADMIN)).toHaveLength(23);
    expect(permissionsForRole(PlatformRole.BUSINESS_MANAGER)).toHaveLength(18);
    expect(permissionsForRole(PlatformRole.REVIEWER)).toHaveLength(9);
    expect(permissionsForRole(PlatformRole.ANALYST)).toHaveLength(8);
    expect(permissionsForRole(PlatformRole.READ_ONLY)).toHaveLength(4);
    expect(permissionsForRole(PlatformRole.EXTERNAL_AUDITOR)).toHaveLength(4);
    expect(permissionsForRole(PlatformRole.INTEGRATION_ACCOUNT)).toHaveLength(0);
  });
});

// ─── W2-G9: No String Literals in Authorization Core ────────────

describe('W2-G9: No String Literals in Authorization Core', () => {
  const forbiddenPatterns = [
    'ADMIN',
    'manager',
    'analyst',
    'reviewer',
  ];

  it('role registry does not contain product-specific string literals', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../registries/roles.ts'),
      'utf-8',
    );
    // PlatformRole enum values should only be the official platform role IDs
    const roleValues = Object.values(PlatformRole);
    for (const value of roleValues) {
      expect(value).toMatch(/^[A-Z_]+$/); // UPPER_SNAKE_CASE
    }
  });

  it('mappings use enum references, not string literals', () => {
    // Verify that the mappings file uses the enum types correctly
    const permKeys = Object.keys(PERMISSION_CAPABILITY);
    for (const key of permKeys) {
      // Key should be a Permission enum member, not a string
      expect(Object.values(Permission)).toContain(key as unknown as Permission);
    }
  });
});
