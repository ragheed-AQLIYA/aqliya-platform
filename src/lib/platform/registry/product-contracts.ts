export type V1ProductKey = "audit" | "local_content" | "sales";

export type CoreServiceId =
  | "access"
  | "audit"
  | "evidence"
  | "workflow"
  | "export"
  | "governedAI"
  | "traceability"
  | "files";

export interface CoreServiceBinding {
  service: CoreServiceId;
  required: boolean;
  adopted: boolean;
}

export interface ProductContract {
  slug: V1ProductKey;
  name: string;
  nameAr: string;
  routePrefix: string;
  marketingRoute: string;
  maturity: string;
  v1Target: string;
  workflowTemplateId: string;
  evidenceTypes: string[];
  exportTypes: string[];
  aiTaskTypes: string[];
  tenantKey: string;
  coreServices: CoreServiceBinding[];
  readinessBlockers: string[];
}

export function isV1ProductKey(slug: string): slug is V1ProductKey {
  return ["audit", "local_content", "sales"].includes(slug);
}
