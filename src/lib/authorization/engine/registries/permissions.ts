/**
 * RB-02B Permission Registry
 *
 * Defines all 23 permissions in the AQLIYA Authorization Model.
 * Each permission is a typed enum — no string literals in authorization core.
 *
 * @see RB-02A v1.0 §5.2 — Permission Catalog
 */

import { ResourceType } from './resources';

/**
 * All platform permissions.
 * Values are permission IDs from RB-02A v1.0 Chapter 5.
 * No product-specific naming — these are platform capabilities.
 */
export enum Permission {
  PROJECT_MANAGEMENT = 'P01',
  PROJECT_DELETION = 'P02',
  WORKBOOK_MANAGEMENT = 'P03',
  WORKBOOK_EXPORT = 'P04',
  SUPPLIER_MANAGEMENT = 'P05',
  SPEND_DATA_ENTRY = 'P06',
  EVIDENCE_UPLOAD = 'P07',
  EVIDENCE_READ = 'P08',
  EVIDENCE_DELETION = 'P09',
  FINDING_MANAGEMENT = 'P10',
  FINDING_CLOSE = 'P11',
  REVIEW_MANAGEMENT = 'P12',
  REVIEW_APPROVAL = 'P13',
  REVIEW_OVERRIDE = 'P14',
  AI_REVIEW = 'P15',
  CLASSIFICATION_MANAGEMENT = 'P16',
  IMPORT = 'P17',
  EXPORT_MANAGEMENT = 'P18',
  REPORT_MANAGEMENT = 'P19',
  AUDIT_LOG_ACCESS = 'P20',
  SETTINGS_MANAGEMENT = 'P21',
  ORGANIZATION_MEMBERSHIP = 'P22',
  AI_CONFIGURATION = 'P23',
}

/**
 * Human-readable labels for each permission.
 * These are product-label-neutral descriptions.
 */
export const PERMISSION_LABEL: Record<Permission, string> = {
  [Permission.PROJECT_MANAGEMENT]: 'Project Management',
  [Permission.PROJECT_DELETION]: 'Project Deletion',
  [Permission.WORKBOOK_MANAGEMENT]: 'Workbook Management',
  [Permission.WORKBOOK_EXPORT]: 'Workbook Export',
  [Permission.SUPPLIER_MANAGEMENT]: 'Supplier Management',
  [Permission.SPEND_DATA_ENTRY]: 'Spend Data Entry',
  [Permission.EVIDENCE_UPLOAD]: 'Evidence Upload',
  [Permission.EVIDENCE_READ]: 'Evidence Read',
  [Permission.EVIDENCE_DELETION]: 'Evidence Deletion',
  [Permission.FINDING_MANAGEMENT]: 'Finding Management',
  [Permission.FINDING_CLOSE]: 'Finding Close',
  [Permission.REVIEW_MANAGEMENT]: 'Review Management',
  [Permission.REVIEW_APPROVAL]: 'Review Approval',
  [Permission.REVIEW_OVERRIDE]: 'Review Override',
  [Permission.AI_REVIEW]: 'AI Review',
  [Permission.CLASSIFICATION_MANAGEMENT]: 'Classification Management',
  [Permission.IMPORT]: 'Import',
  [Permission.EXPORT_MANAGEMENT]: 'Export Management',
  [Permission.REPORT_MANAGEMENT]: 'Report Management',
  [Permission.AUDIT_LOG_ACCESS]: 'Audit Log Access',
  [Permission.SETTINGS_MANAGEMENT]: 'Settings Management',
  [Permission.ORGANIZATION_MEMBERSHIP]: 'Organization Membership',
  [Permission.AI_CONFIGURATION]: 'AI Configuration',
};

/**
 * The actions that each permission includes.
 * Format: `${resourceType}.${operation}`
 *
 * These are the canonical action strings as defined in RB-02A v1.0 §4.2.
 * Products use these action strings when calling the Authorization Engine.
 */
export const PERMISSION_ACTIONS: Record<Permission, string[]> = {
  [Permission.PROJECT_MANAGEMENT]: [
    'project.create',
    'project.read',
    'project.update',
    'project.archive',
  ],
  [Permission.PROJECT_DELETION]: [
    'project.delete',
  ],
  [Permission.WORKBOOK_MANAGEMENT]: [
    'workbook.create',
    'workbook.read',
    'workbook.update',
    'workbook.delete',
    'workbook.calibrate',
    'workbook.editContent',
    'workbook.editStructure',
    'workbook.approve',
  ],
  [Permission.WORKBOOK_EXPORT]: [
    'workbook.export',
  ],
  [Permission.SUPPLIER_MANAGEMENT]: [
    'supplier.create',
    'supplier.read',
    'supplier.update',
    'supplier.delete',
  ],
  [Permission.SPEND_DATA_ENTRY]: [
    'spend-record.create',
    'spend-record.read',
    'spend-record.update',
    'spend-record.delete',
  ],
  [Permission.EVIDENCE_UPLOAD]: [
    'evidence.upload',
  ],
  [Permission.EVIDENCE_READ]: [
    'evidence.read',
    'evidence.download',
  ],
  [Permission.EVIDENCE_DELETION]: [
    'evidence.delete',
  ],
  [Permission.FINDING_MANAGEMENT]: [
    'finding.create',
    'finding.read',
    'finding.update',
  ],
  [Permission.FINDING_CLOSE]: [
    'finding.close',
  ],
  [Permission.REVIEW_MANAGEMENT]: [
    'review.create',
    'review.read',
  ],
  [Permission.REVIEW_APPROVAL]: [
    'review.approve',
    'review.reject',
  ],
  [Permission.REVIEW_OVERRIDE]: [
    'review.override',
  ],
  [Permission.AI_REVIEW]: [
    'pattern-suggestion.read',
    'pattern-suggestion.accept',
    'pattern-suggestion.reject',
    'pattern-suggestion.archive',
    'match-review.read',
    'match-review.update',
    'match-review.flag',
    'recommendation.read',
    'recommendation.accept',
    'recommendation.dismiss',
    'recommendation.archive',
  ],
  [Permission.CLASSIFICATION_MANAGEMENT]: [
    'classification-rule.create',
    'classification-rule.read',
    'classification-rule.update',
    'classification-rule.delete',
  ],
  [Permission.IMPORT]: [
    'import.create',
    'import.read',
  ],
  [Permission.EXPORT_MANAGEMENT]: [
    'export.create',
    'export.read',
    'export.download',
  ],
  [Permission.REPORT_MANAGEMENT]: [
    'report.create',
    'report.read',
    'report.export',
    'report.delete',
  ],
  [Permission.AUDIT_LOG_ACCESS]: [
    'audit-log.read',
    'audit-log.export',
  ],
  [Permission.SETTINGS_MANAGEMENT]: [
    'settings.read',
    'settings.update',
  ],
  [Permission.ORGANIZATION_MEMBERSHIP]: [
    'membership.read',
    'membership.invite',
    'membership.activate',
    'membership.deactivate',
    'membership.assignRole',
    'membership.revokeRole',
  ],
  [Permission.AI_CONFIGURATION]: [
    'settings.read',
    'settings.update',
  ],
};

/**
 * The resource type that each permission primarily operates on.
 * Invariant I8: Every Permission belongs to one Resource.
 */
export const PERMISSION_RESOURCE: Record<Permission, ResourceType> = {
  [Permission.PROJECT_MANAGEMENT]: ResourceType.PROJECT,
  [Permission.PROJECT_DELETION]: ResourceType.PROJECT,
  [Permission.WORKBOOK_MANAGEMENT]: ResourceType.WORKBOOK,
  [Permission.WORKBOOK_EXPORT]: ResourceType.WORKBOOK,
  [Permission.SUPPLIER_MANAGEMENT]: ResourceType.SUPPLIER,
  [Permission.SPEND_DATA_ENTRY]: ResourceType.SPEND_RECORD,
  [Permission.EVIDENCE_UPLOAD]: ResourceType.EVIDENCE,
  [Permission.EVIDENCE_READ]: ResourceType.EVIDENCE,
  [Permission.EVIDENCE_DELETION]: ResourceType.EVIDENCE,
  [Permission.FINDING_MANAGEMENT]: ResourceType.FINDING,
  [Permission.FINDING_CLOSE]: ResourceType.FINDING,
  [Permission.REVIEW_MANAGEMENT]: ResourceType.REVIEW,
  [Permission.REVIEW_APPROVAL]: ResourceType.REVIEW,
  [Permission.REVIEW_OVERRIDE]: ResourceType.REVIEW,
  [Permission.AI_REVIEW]: ResourceType.PATTERN_SUGGESTION,
  [Permission.CLASSIFICATION_MANAGEMENT]: ResourceType.CLASSIFICATION_RULE,
  [Permission.IMPORT]: ResourceType.IMPORT_BATCH,
  [Permission.EXPORT_MANAGEMENT]: ResourceType.EXPORT,
  [Permission.REPORT_MANAGEMENT]: ResourceType.REPORT,
  [Permission.AUDIT_LOG_ACCESS]: ResourceType.AUDIT_LOG,
  [Permission.SETTINGS_MANAGEMENT]: ResourceType.SETTINGS,
  [Permission.ORGANIZATION_MEMBERSHIP]: ResourceType.ORGANIZATION_MEMBERSHIP,
  [Permission.AI_CONFIGURATION]: ResourceType.SETTINGS,
};

/**
 * Get all permissions for a given resource type.
 */
export function permissionsForResource(
  resourceType: ResourceType,
): Permission[] {
  return Object.entries(PERMISSION_RESOURCE)
    .filter(([_, resource]) => resource === resourceType)
    .map(([permission]) => permission as Permission);
}
