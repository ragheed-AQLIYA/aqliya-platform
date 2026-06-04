// ─── SCIM v2 Types (RFC 7644) ───
// Types for SCIM (System for Cross-domain Identity Management) protocol v2.0

// ─── Standard SCIM schemas ───

export const SCIM_CORE_USER_SCHEMA = "urn:ietf:params:scim:schemas:core:2.0:User";
export const SCIM_CORE_GROUP_SCHEMA = "urn:ietf:params:scim:schemas:core:2.0:Group";
export const SCIM_API_MESSAGE = "urn:ietf:params:scim:api:messages:2.0:Error";
export const SCIM_LIST_RESPONSE = "urn:ietf:params:scim:api:messages:2.0:ListResponse";

// ─── SCIM Meta ───

export interface ScimMeta {
  resourceType: "User" | "Group";
  created: string;
  lastModified: string;
  location: string;
  version?: string;
}

// ─── SCIM Name ───

export interface ScimName {
  formatted?: string;
  familyName?: string;
  givenName?: string;
  middleName?: string;
  honorificPrefix?: string;
  honorificSuffix?: string;
}

// ─── SCIM Email ───

export interface ScimEmail {
  value: string;
  type?: "work" | "home" | "other";
  primary?: boolean;
}

// ─── SCIM Phone ───

export interface ScimPhoneNumber {
  value: string;
  type?: "work" | "mobile" | "home" | "other";
}

// ─── SCIM Address ───

export interface ScimAddress {
  formatted?: string;
  streetAddress?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  type?: "work" | "home" | "other";
}

// ─── SCIM Enterprise User Extension ───

export interface ScimEnterpriseUser {
  employeeNumber?: string;
  costCenter?: string;
  organization?: string;
  division?: string;
  department?: string;
  manager?: {
    value: string;
    $ref?: string;
    displayName?: string;
  };
}

// ─── SCIM User ───

export interface ScimUser {
  schemas: string[];
  id?: string;
  externalId?: string;
  meta?: ScimMeta;
  userName: string;
  name?: ScimName;
  displayName?: string;
  nickName?: string;
  profileUrl?: string;
  title?: string;
  userType?: string;
  preferredLanguage?: string;
  locale?: string;
  timezone?: string;
  active?: boolean;
  emails?: ScimEmail[];
  phoneNumbers?: ScimPhoneNumber[];
  addresses?: ScimAddress[];
  groups?: Array<{
    value: string;
    $ref?: string;
    display?: string;
    type?: "direct" | "indirect";
  }>;
  roles?: Array<{
    value: string;
    display?: string;
    type?: string;
  }>;
  "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"?: ScimEnterpriseUser;
  password?: string;
}

// ─── SCIM Group Member ───

export interface ScimGroupMember {
  value: string;
  $ref?: string;
  display?: string;
  type?: "User" | "Group";
}

// ─── SCIM Group ───

export interface ScimGroup {
  schemas: string[];
  id?: string;
  externalId?: string;
  meta?: ScimMeta;
  displayName: string;
  members?: ScimGroupMember[];
}

// ─── SCIM List Response ───

export interface ScimListResponse {
  schemas: string[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  Resources: unknown[];
}

// ─── SCIM Error Response ───

export interface ScimError {
  schemas: string[];
  detail?: string;
  status: number;
  scimType?: string;
}

// ─── SCIM Patch Operation ───

export interface ScimPatchOperation {
  op: "add" | "remove" | "replace";
  path?: string;
  value: unknown;
}

export interface ScimPatchRequest {
  schemas: string[];
  Operations: ScimPatchOperation[];
}

// ─── Validation Helpers ───

export interface ScimValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateScimEmail(email: string): ScimValidationResult {
  const errors: string[] = [];
  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else if (email.length > 320) {
    errors.push("Email exceeds maximum length of 320 characters");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }
  return { valid: errors.length === 0, errors };
}

export function validateScimUserName(userName: string): ScimValidationResult {
  const errors: string[] = [];
  if (!userName || typeof userName !== "string") {
    errors.push("userName is required");
  } else if (userName.length < 1 || userName.length > 256) {
    errors.push("userName must be between 1 and 256 characters");
  } else if (!/^[\w.@+-]+$/.test(userName)) {
    errors.push("userName contains invalid characters");
  }
  return { valid: errors.length === 0, errors };
}

export function validateScimUserPayload(payload: Record<string, unknown>): ScimValidationResult {
  const errors: string[] = [];

  if (!payload.schemas || !Array.isArray(payload.schemas)) {
    errors.push("schemas is required and must be an array");
  } else if (!payload.schemas.includes(SCIM_CORE_USER_SCHEMA)) {
    errors.push(`schemas must include ${SCIM_CORE_USER_SCHEMA}`);
  }

  if (!payload.userName) {
    errors.push("userName is required");
  }

  if (payload.emails && Array.isArray(payload.emails)) {
    for (const email of payload.emails) {
      if (email.value) {
        const result = validateScimEmail(email.value);
        if (!result.valid) {
          errors.push(`Invalid email ${email.value}: ${result.errors.join(", ")}`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateScimGroupPayload(payload: Record<string, unknown>): ScimValidationResult {
  const errors: string[] = [];

  if (!payload.schemas || !Array.isArray(payload.schemas)) {
    errors.push("schemas is required and must be an array");
  } else if (!payload.schemas.includes(SCIM_CORE_GROUP_SCHEMA)) {
    errors.push(`schemas must include ${SCIM_CORE_GROUP_SCHEMA}`);
  }

  if (!payload.displayName) {
    errors.push("displayName is required");
  }

  return { valid: errors.length === 0, errors };
}

// ─── Response builders ───

export function buildScimListResponse<T>(
  resources: T[],
  totalResults: number,
  startIndex: number,
  itemsPerPage: number,
): ScimListResponse {
  return {
    schemas: [SCIM_LIST_RESPONSE],
    totalResults,
    startIndex,
    itemsPerPage,
    Resources: resources,
  };
}

export function buildScimError(status: number, detail: string, scimType?: string): ScimError {
  return {
    schemas: [SCIM_API_MESSAGE],
    status,
    detail,
    scimType,
  };
}

// ─── Content-Type helpers ───

export const SCIM_CONTENT_TYPE = "application/scim+json";

export function isScimContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  return contentType.includes("application/scim+json") || contentType.includes("application/json");
}
