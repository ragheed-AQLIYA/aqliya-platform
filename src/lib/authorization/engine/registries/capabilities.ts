/**
 * RB-02B Capability Registry
 *
 * Capabilities are stable, product-independent functional areas used
 * for Separation of Duties (SoD) rules. They do NOT change across products.
 *
 * @see RB-02A v1.0 §9.2 — Capability-Based SoD
 */

import { Permission } from './permissions';

/**
 * All platform capabilities.
 * These are the atomic functional areas that SoD rules reference.
 * Capabilities are MORE stable than permissions — they define "what kind of work" not "what specific action."
 */
export enum Capability {
  /** Creating resources (projects, workbooks, evidence uploads) */
  CREATE = 'CAP_CREATE',
  /** Reviewing and making approval decisions */
  REVIEW = 'CAP_REVIEW',
  /** Closing or finalizing resources */
  CLOSE = 'CAP_CLOSE',
  /** Exporting data from the platform */
  EXPORT = 'CAP_EXPORT',
  /** Configuring rules and system settings */
  CONFIGURE = 'CAP_CONFIGURE',
  /** Managing organization membership and roles */
  ADMIN = 'CAP_ADMIN',
  /** Importing data into the platform */
  IMPORT = 'CAP_IMPORT',
}

/**
 * Human-readable labels.
 */
export const CAPABILITY_LABEL: Record<Capability, string> = {
  [Capability.CREATE]: 'Create Resources',
  [Capability.REVIEW]: 'Review and Approve',
  [Capability.CLOSE]: 'Close and Finalize',
  [Capability.EXPORT]: 'Export Data',
  [Capability.CONFIGURE]: 'Configure Rules',
  [Capability.ADMIN]: 'Administer Memberships',
  [Capability.IMPORT]: 'Import Data',
};

/**
 * The permissions that belong to each capability.
 * Invariant: Every Permission belongs to exactly one Capability.
 */
export const CAPABILITY_PERMISSIONS: Record<Capability, Permission[]> = {
  [Capability.CREATE]: [
    Permission.PROJECT_MANAGEMENT,
    Permission.WORKBOOK_MANAGEMENT,
    Permission.WORKBOOK_EXPORT,
    Permission.SUPPLIER_MANAGEMENT,
    Permission.SPEND_DATA_ENTRY,
    Permission.EVIDENCE_UPLOAD,
    Permission.FINDING_MANAGEMENT,
    Permission.REVIEW_MANAGEMENT,
    Permission.REPORT_MANAGEMENT,
  ],
  [Capability.REVIEW]: [
    Permission.REVIEW_APPROVAL,
    Permission.AI_REVIEW,
    Permission.EVIDENCE_READ,
  ],
  [Capability.CLOSE]: [
    Permission.FINDING_CLOSE,
    Permission.REVIEW_OVERRIDE,
  ],
  [Capability.EXPORT]: [
    Permission.EXPORT_MANAGEMENT,
    Permission.REPORT_MANAGEMENT, // report.export
  ],
  [Capability.CONFIGURE]: [
    Permission.CLASSIFICATION_MANAGEMENT,
    Permission.SETTINGS_MANAGEMENT,
    Permission.AI_CONFIGURATION,
  ],
  [Capability.ADMIN]: [
    Permission.ORGANIZATION_MEMBERSHIP,
    Permission.AUDIT_LOG_ACCESS,
    Permission.PROJECT_DELETION,
    Permission.EVIDENCE_DELETION,
  ],
  [Capability.IMPORT]: [
    Permission.IMPORT,
  ],
};

/**
 * Get the capability that a permission belongs to.
 */
export function capabilityForPermission(
  permission: Permission,
): Capability | undefined {
  for (const [capability, permissions] of Object.entries(CAPABILITY_PERMISSIONS)) {
    if (permissions.includes(permission)) {
      return capability as Capability;
    }
  }
  return undefined;
}

/**
 * Resolve a capability label to its enum value.
 * Invariant: No string literals — use this function or the enum directly.
 */
export function parseCapability(value: string): Capability | undefined {
  const key = Object.keys(Capability).find(
    (k) => Capability[k as keyof typeof Capability] === value,
  );
  return key ? (Capability[key as keyof typeof Capability] as Capability) : undefined;
}
