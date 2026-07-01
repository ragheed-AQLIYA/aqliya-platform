/**
 * RB-02B Role Registry
 *
 * Platform Roles are the canonical role identifiers used by the Authorization Engine.
 * Product Labels are display names resolved by the UI layer.
 *
 * IMPORTANT: The Authorization Engine operates on Platform Roles only.
 * No product-specific role names (e.g., "Local Content Manager") appear in engine code.
 *
 * @see RB-02A v1.0 §6.2 — Platform Role vs Product Label
 */

/**
 * All platform roles in the authorization model.
 * These are the ONLY roles the Authorization Engine evaluates.
 * Product labels are mapped separately (see product-label mappings below).
 */
export enum PlatformRole {
  /** Full access within an organization. Can manage all resources and memberships. */
  ORG_ADMIN = 'ORG_ADMIN',
  /** Manages projects, workbooks, suppliers, and reports. Can approve reviews. */
  BUSINESS_MANAGER = 'BUSINESS_MANAGER',
  /** Reviews findings, evidence, and AI outputs. Can approve/reject. Cannot create projects. */
  REVIEWER = 'REVIEWER',
  /** Enters data, uploads evidence, creates reports. Cannot approve. */
  ANALYST = 'ANALYST',
  /** View-only access. Cannot create, update, or delete. */
  READ_ONLY = 'READ_ONLY',
  /** Read-only with enhanced audit trail. No export capability. */
  EXTERNAL_AUDITOR = 'EXTERNAL_AUDITOR',
  /** API-only access. Scoped permissions per integration configuration. */
  INTEGRATION_ACCOUNT = 'INTEGRATION_ACCOUNT',
}

/**
 * Human-readable descriptions for each platform role.
 */
export const ROLE_DESCRIPTION: Record<PlatformRole, string> = {
  [PlatformRole.ORG_ADMIN]:
    'Full access to all resources and operations within the organization.',
  [PlatformRole.BUSINESS_MANAGER]:
    'Manages projects, workbooks, suppliers, and reports. Can approve reviews.',
  [PlatformRole.REVIEWER]:
    'Reviews findings, evidence, and AI suggestions. Can approve or reject.',
  [PlatformRole.ANALYST]:
    'Enters data, uploads evidence, creates reports. Cannot approve.',
  [PlatformRole.READ_ONLY]:
    'View-only access. Cannot create, update, or delete.',
  [PlatformRole.EXTERNAL_AUDITOR]:
    'Read-only with enhanced audit trail. Cannot export data.',
  [PlatformRole.INTEGRATION_ACCOUNT]:
    'API-only access. Scoped permissions per integration.',
};

/**
 * Product Label mappings.
 * Maps each Platform Role to its display name in each product.
 * The Authorization Engine does NOT use these — this is for the UI layer.
 */
export const PRODUCT_LABELS: Record<
  string,
  Record<PlatformRole, string>
> = {
  localcontentos: {
    [PlatformRole.ORG_ADMIN]: 'Organization Administrator',
    [PlatformRole.BUSINESS_MANAGER]: 'Local Content Manager',
    [PlatformRole.REVIEWER]: 'Reviewer',
    [PlatformRole.ANALYST]: 'Analyst',
    [PlatformRole.READ_ONLY]: 'Read Only',
    [PlatformRole.EXTERNAL_AUDITOR]: 'External Auditor',
    [PlatformRole.INTEGRATION_ACCOUNT]: 'Integration Account',
  },
  auditos: {
    [PlatformRole.ORG_ADMIN]: 'Firm Administrator',
    [PlatformRole.BUSINESS_MANAGER]: 'Engagement Manager',
    [PlatformRole.REVIEWER]: 'Senior Auditor',
    [PlatformRole.ANALYST]: 'Junior Auditor',
    [PlatformRole.READ_ONLY]: 'Read Only',
    [PlatformRole.EXTERNAL_AUDITOR]: 'External Auditor',
    [PlatformRole.INTEGRATION_ACCOUNT]: 'Integration Account',
  },
  salesos: {
    [PlatformRole.ORG_ADMIN]: 'Account Executive',
    [PlatformRole.BUSINESS_MANAGER]: 'Sales Manager',
    [PlatformRole.REVIEWER]: 'Deal Reviewer',
    [PlatformRole.ANALYST]: 'Sales Analyst',
    [PlatformRole.READ_ONLY]: 'Read Only',
    [PlatformRole.EXTERNAL_AUDITOR]: 'N/A',
    [PlatformRole.INTEGRATION_ACCOUNT]: 'Integration Account',
  },
};

/**
 * Resolve a role string to a PlatformRole enum.
 * This is the ONLY way to convert user input to a role — no string literal comparisons.
 */
export function parsePlatformRole(value: string): PlatformRole | undefined {
  const key = Object.keys(PlatformRole).find(
    (k) => PlatformRole[k as keyof typeof PlatformRole] === value,
  );
  return key
    ? (PlatformRole[key as keyof typeof PlatformRole] as PlatformRole)
    : undefined;
}

/**
 * Check if a role string is a valid platform role.
 * Use this instead of direct string comparisons.
 */
export function isValidPlatformRole(value: string): boolean {
  return parsePlatformRole(value) !== undefined;
}
