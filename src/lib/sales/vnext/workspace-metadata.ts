// ─── SalesOS workspace metadata ───

import { SALESOS_PRODUCT_KEY } from "../core-adoption";

// SALESOS_VNEXT_PLACEHOLDER: inline stub — replace when @/lib/platform/workflow/product-templates exists
function getWorkflowTemplateForProduct(productSlug: string): { id: string; gates: { id: string; name: string; required: boolean }[] } | null {
  throw new Error("TODO: SalesOS vnext placeholder — implement when @/lib/platform/workflow/product-templates exists");
}

export interface SalesWorkspaceMetadata {
  organizationId: string;
  workspaceVersion: string;
  productKey: typeof SALESOS_PRODUCT_KEY;
  workflowTemplateId: string;
  persistenceMode: "in_memory" | "prisma";
  governanceLabels: { ar: string; en: string };
}

export function buildSalesWorkspaceMetadata(input: {
  organizationId: string;
  prismaEnabled?: boolean;
}): SalesWorkspaceMetadata {
  const template = getWorkflowTemplateForProduct(SALESOS_PRODUCT_KEY);
  return {
    organizationId: input.organizationId,
    workspaceVersion: "vnext-scaffold-0.1",
    productKey: SALESOS_PRODUCT_KEY,
    workflowTemplateId: template?.id ?? "sales-opportunity-lifecycle",
    persistenceMode:
      input.prismaEnabled || process.env.SALESOS_PRISMA_PERSISTENCE === "1"
        ? "prisma"
        : "in_memory",
    governanceLabels: {
      ar: "ذكاء تجاري محكوم — ليس CRM عاماً",
      en: "Governed commercial intelligence — not a generic CRM",
    },
  };
}
