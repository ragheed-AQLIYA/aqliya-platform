// ─── Model Governance Service ───
// Registry, review, approval, and deployment lifecycle for AI models.

import { prisma } from "@/lib/prisma";
import { auditLogger, Product } from "../audit-logger";

// ─── Types ───

export interface RegisterModelInput {
  organizationId?: string;
  name: string;
  provider: string;
  version: string;
  modelType: string;
  description?: string;
  useCase?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiresReview?: boolean;
  requiresApproval?: boolean;
  documentationUrl?: string;
  ownerId?: string;
  createdBy?: string;
}

export interface ReviewInput {
  reviewType: string;
  reviewerId: string;
  reviewerName?: string;
  status: "PENDING" | "PASSED" | "FAILED" | "WAIVED";
  findings?: string;
  notes?: string;
}

export interface ApproveInput {
  approvedById: string;
  approvalNotes?: string;
}

export interface RejectInput {
  rejectedById: string;
  rejectionReason: string;
}

export interface DeployInput {
  environment: string;
  endpointUrl?: string;
  config?: string;
  deployedById?: string;
}

export interface GovernanceStats {
  total: number;
  byStatus: Record<string, number>;
  byRiskLevel: Record<string, number>;
  byProvider: Record<string, number>;
  pendingReview: number;
  pendingApproval: number;
  activeDeployments: number;
}

// ─── Helpers ───

function log(model: string, action: string, targetId: string, actorId?: string, extra?: Record<string, unknown>) {
  return auditLogger({
    productKey: Product.PLATFORM,
    actor: actorId ? { id: actorId } : undefined,
  }).record(action, { type: model, id: targetId }, extra ? { metadata: extra } : undefined);
}

// ─── CRUD ───

export async function registerModel(input: RegisterModelInput): Promise<{ id: string }> {
  const model = await prisma.aiModelRegistry.create({
    data: {
      organizationId: input.organizationId ?? null,
      name: input.name,
      provider: input.provider,
      version: input.version,
      modelType: input.modelType,
      description: input.description ?? null,
      useCase: input.useCase ?? null,
      riskLevel: input.riskLevel ?? "MEDIUM",
      requiresReview: input.requiresReview ?? true,
      requiresApproval: input.requiresApproval ?? true,
      documentationUrl: input.documentationUrl ?? null,
      ownerId: input.ownerId ?? null,
      createdBy: input.createdBy ?? null,
    },
  });

  await log("ai_model_registry", "model.registered", model.id, input.createdBy, {
    name: input.name,
    provider: input.provider,
    version: input.version,
    riskLevel: input.riskLevel ?? "MEDIUM",
  });

  return { id: model.id };
}

export async function getModel(id: string) {
  const model = await prisma.aiModelRegistry.findUnique({
    where: { id },
    include: {
      deployments: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!model) {
    throw new Error(`Model ${id} not found`);
  }
  return model;
}

export async function listModels(organizationId?: string, status?: string) {
  const where: Record<string, unknown> = {};
  if (organizationId) where.organizationId = organizationId;
  if (status) where.status = status;

  return prisma.aiModelRegistry.findMany({
    where: where as any,
    include: { deployments: { where: { isActive: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateModel(id: string, data: Partial<RegisterModelInput & { status?: string }>) {
  const existing = await prisma.aiModelRegistry.findUnique({ where: { id } });
  if (!existing) throw new Error(`Model ${id} not found`);

  await prisma.aiModelRegistry.update({ where: { id }, data: data as any });

  await log("ai_model_registry", "model.updated", id, data.createdBy, {
    fields: Object.keys(data).join(","),
  });
}

// ─── Workflow ───

export async function submitForReview(id: string, byUserId: string) {
  const model = await prisma.aiModelRegistry.findUnique({ where: { id } });
  if (!model) throw new Error(`Model ${id} not found`);
  if (model.status !== "DRAFT") {
    throw new Error(`Cannot submit model in status "${model.status}" for review; must be DRAFT`);
  }

  await prisma.aiModelRegistry.update({
    where: { id },
    data: { status: "PENDING_REVIEW", updatedBy: byUserId },
  });

  await log("ai_model_registry", "model.submitted_for_review", id, byUserId);
}

export async function reviewModel(id: string, input: ReviewInput) {
  const model = await prisma.aiModelRegistry.findUnique({ where: { id } });
  if (!model) throw new Error(`Model ${id} not found`);
  if (model.status !== "PENDING_REVIEW") {
    throw new Error(`Cannot review model in status "${model.status}"; must be PENDING_REVIEW`);
  }

  const review = await prisma.aiModelGovernanceReview.create({
    data: {
      modelId: id,
      reviewType: input.reviewType,
      reviewerId: input.reviewerId,
      reviewerName: input.reviewerName ?? null,
      status: input.status,
      findings: input.findings ?? null,
      notes: input.notes ?? null,
      reviewedAt: input.status !== "PENDING" ? new Date() : undefined,
      createdBy: input.reviewerId,
    },
  });

  // If this was a SECURITY review and FAILED, auto-set model status
  if (input.reviewType === "SECURITY" && input.status === "FAILED") {
    await prisma.aiModelRegistry.update({
      where: { id },
      data: { status: "REJECTED", reviewedById: input.reviewerId, reviewedAt: new Date(), reviewNotes: input.notes ?? null, updatedBy: input.reviewerId },
    });
  }

  await log("ai_model_governance_review", "model.reviewed", id, input.reviewerId, {
    reviewType: input.reviewType,
    status: input.status,
    reviewId: review.id,
  });
}

export async function approveModel(id: string, input: ApproveInput) {
  const model = await prisma.aiModelRegistry.findUnique({
    where: { id },
    include: {
      reviews: { where: { reviewType: "SECURITY", status: "PASSED" } },
    },
  });
  if (!model) throw new Error(`Model ${id} not found`);
  if (model.status !== "PENDING_REVIEW") {
    throw new Error(`Cannot approve model in status "${model.status}"; must be PENDING_REVIEW`);
  }

  // At least one SECURITY review must have PASSED
  const passedSecurityReviews = model.reviews ?? [];
  if (passedSecurityReviews.length === 0) {
    throw new Error(`Model ${id} cannot be approved: no SECURITY review has passed`);
  }

  await prisma.aiModelRegistry.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedById: input.approvedById,
      approvedAt: new Date(),
      approvalNotes: input.approvalNotes ?? null,
      updatedBy: input.approvedById,
    },
  });

  await log("ai_model_registry", "model.approved", id, input.approvedById, {
    notes: input.approvalNotes,
  });
}

export async function rejectModel(id: string, input: RejectInput) {
  const model = await prisma.aiModelRegistry.findUnique({ where: { id } });
  if (!model) throw new Error(`Model ${id} not found`);
  if (model.status !== "PENDING_REVIEW") {
    throw new Error(`Cannot reject model in status "${model.status}"; must be PENDING_REVIEW`);
  }

  await prisma.aiModelRegistry.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedById: input.rejectedById,
      reviewedAt: new Date(),
      reviewNotes: input.rejectionReason,
      updatedBy: input.rejectedById,
    },
  });

  await log("ai_model_registry", "model.rejected", id, input.rejectedById, {
    reason: input.rejectionReason,
  });
}

export async function deprecateModel(id: string, byUserId: string) {
  const model = await prisma.aiModelRegistry.findUnique({ where: { id } });
  if (!model) throw new Error(`Model ${id} not found`);
  if (model.status === "DEPRECATED") {
    throw new Error(`Model ${id} is already deprecated`);
  }

  await prisma.aiModelRegistry.update({
    where: { id },
    data: {
      status: "DEPRECATED",
      updatedBy: byUserId,
    },
  });

  // Deactivate all active deployments
  await prisma.aiModelDeployment.updateMany({
    where: { modelId: id, isActive: true },
    data: { isActive: false, decommissionedAt: new Date() },
  });

  await log("ai_model_registry", "model.deprecated", id, byUserId);
}

// ─── Deployment ───

export async function deployModel(modelId: string, input: DeployInput) {
  const model = await prisma.aiModelRegistry.findUnique({ where: { id: modelId } });
  if (!model) throw new Error(`Model ${modelId} not found`);
  if (model.status !== "APPROVED") {
    throw new Error(`Cannot deploy model in status "${model.status}"; must be APPROVED`);
  }

  await prisma.aiModelDeployment.create({
    data: {
      modelId,
      environment: input.environment,
      endpointUrl: input.endpointUrl ?? null,
      config: input.config ?? null,
      deployedById: input.deployedById ?? null,
      createdBy: input.deployedById ?? null,
    },
  });

  await log("ai_model_deployment", "model.deployed", modelId, input.deployedById, {
    environment: input.environment,
  });
}

export async function getActiveDeployments(modelId?: string) {
  const where: Record<string, unknown> = { isActive: true };
  if (modelId) where.modelId = modelId;

  return prisma.aiModelDeployment.findMany({
    where: where as any,
    include: { model: { select: { id: true, name: true, provider: true, version: true } } },
    orderBy: { deployedAt: "desc" },
  });
}

// ─── Dashboard ───

export async function getModelGovernanceStats(organizationId?: string): Promise<GovernanceStats> {
  const where: Record<string, unknown> = {};
  if (organizationId) where.organizationId = organizationId;

  const allModels = await prisma.aiModelRegistry.findMany({
    where: where as any,
  });

  const byStatus: Record<string, number> = {};
  const byRiskLevel: Record<string, number> = {};
  const byProvider: Record<string, number> = {};
  let pendingReview = 0;
  let pendingApproval = 0;

  for (const m of allModels) {
    byStatus[m.status] = (byStatus[m.status] ?? 0) + 1;
    byRiskLevel[m.riskLevel] = (byRiskLevel[m.riskLevel] ?? 0) + 1;
    byProvider[m.provider] = (byProvider[m.provider] ?? 0) + 1;
    if (m.status === "PENDING_REVIEW") pendingReview++;
    if (m.status === "PENDING_REVIEW") pendingApproval++;
  }

  const activeDeployments = await prisma.aiModelDeployment.count({
    where: { isActive: true },
  });

  return {
    total: allModels.length,
    byStatus,
    byRiskLevel,
    byProvider,
    pendingReview,
    pendingApproval,
    activeDeployments,
  };
}
