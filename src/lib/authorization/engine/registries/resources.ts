/**
 * RB-02B Resource Registry
 *
 * Defines all resource types in the AQLIYA Authorization Model.
 * Every resource in the system must be registered here.
 *
 * @see RB-02A v1.0 §3.3 — Resource Catalog
 */

/**
 * All resource types in the platform authorization model.
 * Values are kebab-case for consistency with action naming.
 */
export enum ResourceType {
  ORGANIZATION = 'organization',
  PROJECT = 'project',
  WORKBOOK = 'workbook',
  SUPPLIER = 'supplier',
  SPEND_RECORD = 'spend-record',
  EVIDENCE = 'evidence',
  FINDING = 'finding',
  REVIEW = 'review',
  MATCH_REVIEW = 'match-review',
  CLASSIFICATION_RULE = 'classification-rule',
  IMPORT_BATCH = 'import',
  EXPORT = 'export',
  REPORT = 'report',
  AUDIT_LOG = 'audit-log',
  SETTINGS = 'settings',
  ORGANIZATION_MEMBERSHIP = 'membership',
  PATTERN_SUGGESTION = 'pattern-suggestion',
  RECOMMENDATION = 'recommendation',
}

/**
 * Describes whether a resource is Primary or Derived.
 * @see RB-02A v1.0 §3.1 — Resource Classification
 */
export enum ResourceKind {
  PRIMARY = 'primary',
  DERIVED = 'derived',
}

/**
 * Metadata for each resource type.
 */
export interface ResourceDefinition {
  type: ResourceType;
  kind: ResourceKind;
  scope: 'organization' | 'project' | 'global' | 'platform';
  description: string;
}

/**
 * The complete resource catalog.
 */
export const RESOURCE_CATALOG: Record<ResourceType, ResourceDefinition> = {
  [ResourceType.ORGANIZATION]: {
    type: ResourceType.ORGANIZATION,
    kind: ResourceKind.PRIMARY,
    scope: 'global',
    description: 'Organization entity — single instance across all organizations',
  },
  [ResourceType.PROJECT]: {
    type: ResourceType.PROJECT,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'A LocalContentOS project',
  },
  [ResourceType.WORKBOOK]: {
    type: ResourceType.WORKBOOK,
    kind: ResourceKind.PRIMARY,
    scope: 'project',
    description: 'A workbook within a project',
  },
  [ResourceType.SUPPLIER]: {
    type: ResourceType.SUPPLIER,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'Supplier/vendor record',
  },
  [ResourceType.SPEND_RECORD]: {
    type: ResourceType.SPEND_RECORD,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'Financial spend record',
  },
  [ResourceType.EVIDENCE]: {
    type: ResourceType.EVIDENCE,
    kind: ResourceKind.PRIMARY,
    scope: 'project',
    description: 'Evidence file or document',
  },
  [ResourceType.FINDING]: {
    type: ResourceType.FINDING,
    kind: ResourceKind.PRIMARY,
    scope: 'project',
    description: 'An audit finding or observation',
  },
  [ResourceType.REVIEW]: {
    type: ResourceType.REVIEW,
    kind: ResourceKind.PRIMARY,
    scope: 'project',
    description: 'A review decision on a finding or evidence',
  },
  [ResourceType.MATCH_REVIEW]: {
    type: ResourceType.MATCH_REVIEW,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'AI match review record',
  },
  [ResourceType.CLASSIFICATION_RULE]: {
    type: ResourceType.CLASSIFICATION_RULE,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'Classification rules for scoring',
  },
  [ResourceType.IMPORT_BATCH]: {
    type: ResourceType.IMPORT_BATCH,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'Data import batch',
  },
  [ResourceType.EXPORT]: {
    type: ResourceType.EXPORT,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'Data export record',
  },
  [ResourceType.REPORT]: {
    type: ResourceType.REPORT,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'Generated report',
  },
  [ResourceType.AUDIT_LOG]: {
    type: ResourceType.AUDIT_LOG,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'Audit log entry',
  },
  [ResourceType.SETTINGS]: {
    type: ResourceType.SETTINGS,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'System settings configuration',
  },
  [ResourceType.ORGANIZATION_MEMBERSHIP]: {
    type: ResourceType.ORGANIZATION_MEMBERSHIP,
    kind: ResourceKind.PRIMARY,
    scope: 'organization',
    description: 'Organization membership (user-org-role binding)',
  },
  [ResourceType.PATTERN_SUGGESTION]: {
    type: ResourceType.PATTERN_SUGGESTION,
    kind: ResourceKind.DERIVED,
    scope: 'organization',
    description: 'AI-generated pattern suggestion (Derived Resource)',
  },
  [ResourceType.RECOMMENDATION]: {
    type: ResourceType.RECOMMENDATION,
    kind: ResourceKind.DERIVED,
    scope: 'organization',
    description: 'AI-generated recommendation (Derived Resource)',
  },
};

/**
 * List of all Derived Resource types.
 * Invariant I10: No Derived Resource can exist without its Primary Resource.
 */
export const DERIVED_RESOURCES: ResourceType[] = [
  ResourceType.PATTERN_SUGGESTION,
  ResourceType.RECOMMENDATION,
];

/**
 * Check if a resource type is a Derived Resource.
 */
export function isDerivedResource(type: ResourceType): boolean {
  return DERIVED_RESOURCES.includes(type);
}
