// ─── SalesOS domain service (in-memory, Core-adopted) ───

import type { CurrentUser } from "@/lib/auth";
import type {
  SalesAccount,
  SalesOpportunity,
  SalesOpportunityStage,
} from "./types";
import { SALESOS_PRODUCT_KEY, salesosCanExportBrief } from "./core-adoption";
import {
  appendAuditEntry,
  createAccount,
  ensureSalesSeed,
  getAccount,
  getOpportunity,
  linkEvidence,
  listAccounts,
  listAuditEntries,
  listEvidenceForOpportunity,
  listInteractionsForOpportunity,
  listOpportunities,
  listOpportunitiesForAccount,
  listContactsForAccount,
  updateOpportunity,
} from "./store";

// Local stubs until platform modules are created
interface ReviewState {
  productSlug: string;
  resourceType: string;
  resourceId: string;
  organizationId: string;
  ownerId: string;
  evidenceComplete: boolean;
  status: string;
}

function createReviewState(input: {
  productSlug: string;
  resourceType: string;
  resourceId: string;
  organizationId: string;
  ownerId: string;
  evidenceComplete?: boolean;
}): ReviewState {
  return { ...input, evidenceComplete: input.evidenceComplete ?? false, status: "Draft" };
}

function transitionReviewState(
  pkg: ReviewState,
  _action: string,
  _actor: { id: string; role: string },
): { package: ReviewState; auditMetadata: Record<string, unknown> } {
  const nextStatus = _action === "submit_for_review" ? "InReview" : _action === "approve" ? "Approved" : pkg.status;
  return {
    package: { ...pkg, status: nextStatus },
    auditMetadata: { action: _action, actorId: _actor.id, previousStatus: pkg.status, newStatus: nextStatus },
  };
}

function mapMutationToAuditEvent(input: {
  productSlug: string;
  mutation: string;
  resourceType: string;
  resourceId: string;
  actorId: string;
  organizationId: string;
  details?: Record<string, unknown>;
}): { category: string; action: string } {
  return { category: `${input.productSlug}.${input.mutation}`, action: `${input.productSlug}.${input.mutation}` };
}

function recordAuditEventSafe(_input: {
  category: string;
  productSlug: string;
  action: string;
  actorId: string;
  organizationId: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  persist?: boolean;
}): void {
  // no-op until platform audit module is available
}

function validateProductEvidenceType(_productSlug: string, _typeId: string): boolean {
  return true;
}

export function initSalesWorkspace(user: CurrentUser): void {
  ensureSalesSeed(user.organizationId, user.id);
}

export function getSalesDashboard(user: CurrentUser) {
  initSalesWorkspace(user);
  const accounts = listAccounts(user.organizationId);
  const opportunities = listOpportunities(user.organizationId);
  const pipelineValue = opportunities.reduce(
    (sum, o) => sum + (o.valueEstimate ?? 0),
    0,
  );
  const byStage = opportunities.reduce<Record<string, number>>((acc, o) => {
    acc[o.stage] = (acc[o.stage] ?? 0) + 1;
    return acc;
  }, {});
  return {
    accounts,
    opportunities,
    pipelineValue,
    byStage,
    auditEntries: listAuditEntries(user.organizationId).slice(0, 20),
  };
}

export function getSalesAccountDetail(user: CurrentUser, accountId: string) {
  initSalesWorkspace(user);
  const account = getAccount(user.organizationId, accountId);
  if (!account) return null;
  return {
    account,
    contacts: listContactsForAccount(user.organizationId, accountId),
    opportunities: listOpportunitiesForAccount(user.organizationId, accountId),
  };
}

export function getSalesOpportunityDetail(
  user: CurrentUser,
  opportunityId: string,
) {
  initSalesWorkspace(user);
  const opportunity = getOpportunity(user.organizationId, opportunityId);
  if (!opportunity) return null;
  const account = getAccount(user.organizationId, opportunity.accountId);
  const evidence = listEvidenceForOpportunity(
    user.organizationId,
    opportunityId,
  );
  const interactions = listInteractionsForOpportunity(
    user.organizationId,
    opportunityId,
  );
  const reviewPackage = createReviewState({
    productSlug: SALESOS_PRODUCT_KEY,
    resourceType: "SalesOpportunity",
    resourceId: opportunityId,
    organizationId: user.organizationId,
    ownerId: opportunity.ownerId,
    evidenceComplete: evidence.some((e) => e.typeId === "qualification_note"),
  });
  reviewPackage.status =
    (opportunity.reviewStatus as typeof reviewPackage.status) ?? "Draft";
  reviewPackage.evidenceComplete = evidence.length > 0;

  const exportGate = salesosCanExportBrief(
    opportunity.approvalStatus ?? "Draft",
  );

  return {
    opportunity,
    account,
    evidence,
    interactions,
    reviewPackage,
    exportGate,
    auditEntries: listAuditEntries(user.organizationId)
      .filter((e) => e.targetId === opportunityId)
      .slice(0, 10),
  };
}

export function createSalesAccount(
  user: CurrentUser,
  input: { name: string; nameAr?: string; industry?: string },
): SalesAccount {
  initSalesWorkspace(user);
  const account = createAccount({
    organizationId: user.organizationId,
    name: input.name,
    nameAr: input.nameAr,
    industry: input.industry,
    status: "prospect",
    ownerId: user.id,
    createdById: user.id,
  });
  recordSalesMutation(user, "create", "SalesAccount", account.id);
  return account;
}

export function submitOpportunityForReview(
  user: CurrentUser,
  opportunityId: string,
): SalesOpportunity {
  initSalesWorkspace(user);
  const opp = getOpportunity(user.organizationId, opportunityId);
  if (!opp) throw new Error("Opportunity not found");

  const evidence = listEvidenceForOpportunity(
    user.organizationId,
    opportunityId,
  );
  const pkg = createReviewState({
    productSlug: SALESOS_PRODUCT_KEY,
    resourceType: "SalesOpportunity",
    resourceId: opportunityId,
    organizationId: user.organizationId,
    ownerId: opp.ownerId,
    evidenceComplete: evidence.length > 0,
  });
  pkg.status = (opp.reviewStatus as typeof pkg.status) ?? "Draft";

  const result = transitionReviewState(
    pkg,
    "submit_for_review",
    { id: user.id, role: "owner" },
  );

  const updated = updateOpportunity(user.organizationId, opportunityId, {
    stage: "InReview" as SalesOpportunityStage,
    reviewStatus: result.package.status,
  });
  if (!updated) throw new Error("Failed to update opportunity");

  recordSalesMutation(user, "transition", "SalesOpportunity", opportunityId, {
    reviewStatus: result.package.status,
  });
  appendAuditEntry({
    organizationId: user.organizationId,
    action: "sales.opportunity.submitted_for_review",
    actorId: user.id,
    targetType: "SalesOpportunity",
    targetId: opportunityId,
    metadata: { auditMetadata: result.auditMetadata },
  });
  return updated;
}

export function approveOpportunity(
  user: CurrentUser,
  opportunityId: string,
): SalesOpportunity {
  initSalesWorkspace(user);
  const opp = getOpportunity(user.organizationId, opportunityId);
  if (!opp) throw new Error("Opportunity not found");

  const evidence = listEvidenceForOpportunity(
    user.organizationId,
    opportunityId,
  );
  const pkg = createReviewState({
    productSlug: SALESOS_PRODUCT_KEY,
    resourceType: "SalesOpportunity",
    resourceId: opportunityId,
    organizationId: user.organizationId,
    ownerId: opp.ownerId,
    evidenceComplete: evidence.length > 0,
  });
  pkg.status = "InReview";

  const result = transitionReviewState(
    pkg,
    "approve",
    { id: user.id, role: "approver" },
  );

  const updated = updateOpportunity(user.organizationId, opportunityId, {
    stage: "Approved" as SalesOpportunityStage,
    reviewStatus: result.package.status,
    approvalStatus: result.package.status,
  });
  if (!updated) throw new Error("Failed to update opportunity");

  recordSalesMutation(user, "transition", "SalesOpportunity", opportunityId, {
    approvalStatus: "Approved",
  });
  appendAuditEntry({
    organizationId: user.organizationId,
    action: "sales.opportunity.approved",
    actorId: user.id,
    targetType: "SalesOpportunity",
    targetId: opportunityId,
  });
  return updated;
}

export function linkOpportunityEvidence(
  user: CurrentUser,
  opportunityId: string,
  typeId: string,
  label: string,
) {
  initSalesWorkspace(user);
  if (!validateProductEvidenceType(SALESOS_PRODUCT_KEY, typeId)) {
    throw new Error("Invalid evidence type for SalesOS");
  }
  const opp = getOpportunity(user.organizationId, opportunityId);
  if (!opp) throw new Error("Opportunity not found");

  const ref = linkEvidence({
    organizationId: user.organizationId,
    opportunityId,
    typeId,
    label,
    linkedById: user.id,
  });

  recordAuditEventSafe({
    category: "evidence",
    productSlug: SALESOS_PRODUCT_KEY,
    action: "evidence.linked",
    actorId: user.id,
    organizationId: user.organizationId,
    targetType: "SalesOpportunity",
    targetId: opportunityId,
    metadata: { evidenceId: ref.id, typeId },
    persist: true,
  });

  return ref;
}

function recordSalesMutation(
  user: CurrentUser,
  mutation: "create" | "update" | "transition" | "export" | "ai",
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>,
): void {
  const event = mapMutationToAuditEvent({
    productSlug: SALESOS_PRODUCT_KEY,
    mutation,
    resourceType,
    resourceId,
    actorId: user.id,
    organizationId: user.organizationId,
    details,
  });
  recordAuditEventSafe({
    category: event.category,
    productSlug: SALESOS_PRODUCT_KEY,
    action: event.action,
    actorId: user.id,
    organizationId: user.organizationId,
    targetType: resourceType,
    targetId: resourceId,
    metadata: details,
    persist: true,
  });
  appendAuditEntry({
    organizationId: user.organizationId,
    action: event.action,
    actorId: user.id,
    targetType: resourceType,
    targetId: resourceId,
    metadata: details,
  });
}

export async function getSalesIntelligenceMemory(user: CurrentUser) {
  initSalesWorkspace(user);
  const orgId = user.organizationId;
  const {
    listObjections,
    listCompetitorMentions,
    listSignals,
    listAuditEntries,
    listAllInteractions,
  } = await import("./store");
  const rawObjections = listObjections(orgId);
  return {
    objections: rawObjections.map((o) => ({
      id: o.id,
      labelAr: o.category || o.description.slice(0, 60),
      count: o.frequency ?? 1,
      source: "derived" as const,
    })),
    competitors: listCompetitorMentions(orgId),
    signals: listSignals(orgId).map((s) => ({
      id: s.id,
      dimension: "pipeline_quality" as const,
      level:
        s.strength === "strong"
          ? ("high" as const)
          : s.strength === "moderate"
            ? ("medium" as const)
            : ("low" as const),
      value: s.strength === "strong" ? 80 : s.strength === "moderate" ? 50 : 25,
      confidence: 0.7,
      label: s.description.slice(0, 80),
      module: "sales",
      timestamp: new Date(s.createdAt),
      source: "derived" as const,
    })),
    auditRecent: listAuditEntries(orgId).slice(0, 10),
    interactionCount: listAllInteractions(orgId).length,
    disclaimerAr: "مسودة — ذاكرة مؤسسية للعرض فقط. AI assists. Humans decide.",
    opportunityInsights: [] as Array<{
      opportunity: import("./types").SalesOpportunity;
      intelligence: import("./vnext/opportunity-intelligence").OpportunityIntelligenceSummary;
    }>,
  };
}
