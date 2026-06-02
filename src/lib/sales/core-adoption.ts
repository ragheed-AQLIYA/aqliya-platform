// ─── SalesOS Core adoption scaffold ───
// Wires SalesOS to platform registry and contracts without DB migration.

export type V1ProductKey = string;
export type GovernanceTaskType = string;

export const SALESOS_PRODUCT_KEY = "sales" as const;

export function getProductById(key: V1ProductKey): { slug: string } {
  return { slug: key };
}

export function getProductAICapabilities(_key: V1ProductKey): unknown[] {
  return [];
}

export function getProductEvidenceTypes(_key: V1ProductKey): string[] {
  if (_key === "sales") return ["qualification_note", "proposal", "poc_report", "reference_call"];
  return [];
}

export function getProductOutputTypes(_key: V1ProductKey): unknown[] {
  return [];
}

export function getProductWorkflowTemplates(_key: V1ProductKey): unknown[] {
  return [];
}

export function canExportOutput(
  _productSlug: string,
  _outputTypeId: string,
  _approvalStatus: string,
): boolean {
  return _approvalStatus === "Approved";
}

export function getOutputMetadata(input: {
  productSlug: string;
  outputTypeId: string;
  title: string;
  titleAr: string;
  organizationName: string;
  generatedBy?: string;
  reviewStatus: string;
  approvalStatus: string;
}): Record<string, unknown> {
  return {
    ...input,
    disclaimer: "DRAFT — AI-assisted brief for review. Not a certified output. Human decision required.",
  };
}

export function buildGovernedAIContract(input: {
  productId: string;
  useCase: string;
  contexts: string[];
  inputSources: string[];
  evidenceRefs: string[];
  outputStatus: string;
  policyTags: string[];
  organizationId: string;
  userId: string;
  resourceId: string;
}): Record<string, unknown> {
  return input as unknown as Record<string, unknown>;
}

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
