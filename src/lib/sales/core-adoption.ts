// ─── SalesOS Core adoption scaffold ───
// Wires SalesOS to platform registry and contracts without DB migration.

import {
  getProductById,
  getProductAICapabilities,
  getProductEvidenceTypes,
  getProductOutputTypes,
  getProductWorkflowTemplates,
} from "@/lib/platform/registry/runtime";
import type { V1ProductKey } from "@/lib/platform/registry/product-contracts";
import {
  canExportOutput,
  getOutputMetadata,
} from "@/lib/platform/output/engine";
import { buildGovernedAIContract } from "@/lib/ai/governed-ai-metadata";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";

export const SALESOS_PRODUCT_KEY: V1ProductKey = "sales";

export function salesosRegistryContract() {
  return getProductById(SALESOS_PRODUCT_KEY);
}

export function salesosWorkflowTemplate() {
  return getProductWorkflowTemplates(SALESOS_PRODUCT_KEY);
}

export function salesosEvidenceCatalog() {
  return getProductEvidenceTypes(SALESOS_PRODUCT_KEY);
}

export function salesosOutputCatalog() {
  return getProductOutputTypes(SALESOS_PRODUCT_KEY);
}

export function salesosAICapabilities() {
  return getProductAICapabilities(SALESOS_PRODUCT_KEY);
}

export function salesosGovernedAIContext(input: {
  useCase: GovernanceTaskType;
  organizationId: string;
  userId: string;
  opportunityId: string;
  evidenceRefs?: string[];
}) {
  return buildGovernedAIContract({
    productId: SALESOS_PRODUCT_KEY,
    useCase: input.useCase,
    contexts: ["opportunity", "account"],
    inputSources: [`opportunity:${input.opportunityId}`],
    evidenceRefs: input.evidenceRefs ?? [],
    outputStatus: "pending_review",
    policyTags: ["commercial_claim", "human_review_required"],
    organizationId: input.organizationId,
    userId: input.userId,
    resourceId: input.opportunityId,
  });
}

export function salesosCanExportBrief(approvalStatus: string) {
  return canExportOutput(SALESOS_PRODUCT_KEY, "account_brief_pdf", approvalStatus);
}

export function salesosBriefMetadata(input: {
  accountName: string;
  organizationName: string;
  reviewStatus: string;
  approvalStatus: string;
  generatedBy?: string;
}) {
  return getOutputMetadata({
    productSlug: SALESOS_PRODUCT_KEY,
    outputTypeId: "account_brief_pdf",
    title: `Account Brief — ${input.accountName}`,
    titleAr: `ملخص الحساب — ${input.accountName}`,
    organizationName: input.organizationName,
    generatedBy: input.generatedBy,
    reviewStatus: input.reviewStatus,
    approvalStatus: input.approvalStatus,
  });
}
