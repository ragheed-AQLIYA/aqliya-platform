import type { CrmAccount, CrmContact, CrmOpportunity } from "./types";
import type { FieldMapping } from "./types";

export type MappingDirection = "crm_to_sales" | "sales_to_crm";

export interface MappedAccount {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  description?: string;
  [key: string]: unknown;
}

export interface MappedContact {
  name: string;
  email?: string;
  title?: string;
  phone?: string;
  accountId: string;
  [key: string]: unknown;
}

export interface MappedOpportunity {
  name: string;
  amount?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string;
  accountId: string;
  [key: string]: unknown;
}

// ─── Default mappings ───

export const DEFAULT_HUBSPOT_ACCOUNT_MAPPINGS: FieldMapping[] = [
  { salesField: "name", crmField: "name" },
  { salesField: "industry", crmField: "industry" },
  { salesField: "website", crmField: "website" },
  { salesField: "phone", crmField: "phone" },
  { salesField: "description", crmField: "description" },
];

export const DEFAULT_HUBSPOT_CONTACT_MAPPINGS: FieldMapping[] = [
  { salesField: "name", crmField: "firstName", transform: "concat_first_last" },
  { salesField: "email", crmField: "email" },
  { salesField: "title", crmField: "title" },
  { salesField: "phone", crmField: "phone" },
];

export const DEFAULT_HUBSPOT_OPPORTUNITY_MAPPINGS: FieldMapping[] = [
  { salesField: "name", crmField: "name" },
  { salesField: "amount", crmField: "amount" },
  { salesField: "currency", crmField: "currency" },
  { salesField: "stage", crmField: "stage" },
  { salesField: "probability", crmField: "probability" },
  { salesField: "expectedCloseDate", crmField: "closeDate" },
];

export const DEFAULT_SALESFORCE_ACCOUNT_MAPPINGS: FieldMapping[] = [
  { salesField: "name", crmField: "name" },
  { salesField: "industry", crmField: "industry" },
  { salesField: "website", crmField: "website" },
  { salesField: "phone", crmField: "phone" },
  { salesField: "description", crmField: "description" },
];

export const DEFAULT_SALESFORCE_CONTACT_MAPPINGS: FieldMapping[] = [
  { salesField: "name", crmField: "firstName", transform: "concat_first_last" },
  { salesField: "email", crmField: "email" },
  { salesField: "title", crmField: "title" },
  { salesField: "phone", crmField: "phone" },
];

export const DEFAULT_SALESFORCE_OPPORTUNITY_MAPPINGS: FieldMapping[] = [
  { salesField: "name", crmField: "name" },
  { salesField: "amount", crmField: "amount" },
  { salesField: "currency", crmField: "currency" },
  { salesField: "stage", crmField: "stage" },
  { salesField: "probability", crmField: "probability" },
  { salesField: "expectedCloseDate", crmField: "closeDate" },
];

export function getDefaultMappings(
  provider: string,
  resourceType: string,
): FieldMapping[] {
  switch (provider) {
    case "hubspot":
      switch (resourceType) {
        case "account":
          return DEFAULT_HUBSPOT_ACCOUNT_MAPPINGS;
        case "contact":
          return DEFAULT_HUBSPOT_CONTACT_MAPPINGS;
        case "opportunity":
          return DEFAULT_HUBSPOT_OPPORTUNITY_MAPPINGS;
        default:
          return [];
      }
    case "salesforce":
      switch (resourceType) {
        case "account":
          return DEFAULT_SALESFORCE_ACCOUNT_MAPPINGS;
        case "contact":
          return DEFAULT_SALESFORCE_CONTACT_MAPPINGS;
        case "opportunity":
          return DEFAULT_SALESFORCE_OPPORTUNITY_MAPPINGS;
        default:
          return [];
      }
    default:
      return [];
  }
}

// ─── Apply mapping ───

export function applyAccountMapping(
  crm: CrmAccount,
  mappings: FieldMapping[],
  direction: MappingDirection,
): MappedAccount {
  const result: Record<string, unknown> = {};

  for (const mapping of mappings) {
    const fromField = direction === "crm_to_sales" ? mapping.crmField : mapping.salesField;
    const toField = direction === "crm_to_sales" ? mapping.salesField : mapping.crmField;

    let value: unknown = (crm as unknown as Record<string, unknown>)[fromField];

    if (mapping.transform === "concat_first_last" && typeof value === "string") {
      value = value;
    }

    if (value !== undefined && value !== null) {
      result[toField] = value;
    }
  }

  return result as unknown as MappedAccount;
}

export function applyContactMapping(
  crm: CrmContact,
  mappings: FieldMapping[],
  direction: MappingDirection,
): MappedContact {
  const result: Record<string, unknown> = {};

  for (const mapping of mappings) {
    const fromField = direction === "crm_to_sales" ? mapping.crmField : mapping.salesField;
    const toField = direction === "crm_to_sales" ? mapping.salesField : mapping.crmField;

    let value: unknown;

    if (mapping.transform === "concat_first_last") {
      if (direction === "crm_to_sales") {
        value = `${crm.firstName} ${crm.lastName}`.trim();
      } else {
        value = crm.firstName;
      }
    } else {
      value = (crm as unknown as Record<string, unknown>)[fromField];
    }

    if (value !== undefined && value !== null && value !== "") {
      result[toField] = value;
    }
  }

  const resultTyped = result as unknown as MappedContact;
  resultTyped.accountId = crm.accountId;
  return resultTyped;
}

export function applyOpportunityMapping(
  crm: CrmOpportunity,
  mappings: FieldMapping[],
  direction: MappingDirection,
): MappedOpportunity {
  const result: Record<string, unknown> = {};

  for (const mapping of mappings) {
    const fromField = direction === "crm_to_sales" ? mapping.crmField : mapping.salesField;
    const toField = direction === "crm_to_sales" ? mapping.salesField : mapping.crmField;

    let value: unknown = (crm as unknown as Record<string, unknown>)[fromField];

    if (mapping.transform === "date_iso" && typeof value === "string") {
      try {
        value = new Date(value).toISOString();
      } catch {
        value = undefined;
      }
    }

    if (value !== undefined && value !== null) {
      result[toField] = value;
    }
  }

  const resultTyped = result as unknown as MappedOpportunity;
  resultTyped.accountId = crm.accountId;
  return resultTyped;
}
