/**
 * RB-02B Authorization Vocabulary — Registry Exports
 *
 * All registries in one place. Import from here, not from individual files.
 *
 * Usage:
 *   import { PlatformRole, Permission, ResourceType, ... } from '@/lib/authorization/engine/registries'
 */

export { ResourceType, ResourceKind, RESOURCE_CATALOG, DERIVED_RESOURCES, isDerivedResource } from './resources';
export type { ResourceDefinition } from './resources';

export { Permission, PERMISSION_LABEL, PERMISSION_ACTIONS, PERMISSION_RESOURCE, permissionsForResource } from './permissions';

export { Capability, CAPABILITY_LABEL, CAPABILITY_PERMISSIONS, capabilityForPermission, parseCapability } from './capabilities';

export {
  PlatformRole,
  ROLE_DESCRIPTION,
  PRODUCT_LABELS,
  parsePlatformRole,
  isValidPlatformRole,
} from './roles';

export {
  ROLE_PERMISSIONS,
  PERMISSION_CAPABILITY,
  roleHasPermission,
  permissionsForRole,
  rolesWithPermission,
  permissionsForCapability,
  validateAllPermissionsMapped,
  validateAllRolesHavePermissions,
} from './mappings';
