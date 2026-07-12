import { prisma } from "@/lib/prisma";
import type { Finding, Recommendation } from "@/types/audit";
import type { PaginatedResult } from "@/lib/audit/pagination";
import {
  paginate,
  offsetFromPage,
  DEFAULT_PAGE_SIZE,
} from "@/lib/audit/pagination";
import {
  toFinding,
  toRecommendation,
  protectedAuditReadUnavailable,
} from "./types";

export async function getFindings(engagementId: string): Promise<Finding[]> {
  try {
    const findings = await prisma.auditFinding.findMany({
      where: { engagementId },
    });
    if (findings.length === 0) return [];
    return findings.map(toFinding);
  } catch (error) {
    protectedAuditReadUnavailable(`getFindings(${engagementId})`, error);
  }
}

export async function getFindingsPaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Finding>> {
  try {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(
      1,
      Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const skip = offsetFromPage(page, pageSize);
    const [findings, total] = await Promise.all([
      prisma.auditFinding.findMany({
        where: { engagementId },
        skip,
        take: pageSize,
      }),
      prisma.auditFinding.count({ where: { engagementId } }),
    ]);
    return paginate(findings.map(toFinding), total, { page, pageSize });
  } catch (error) {
    protectedAuditReadUnavailable(
      `getFindingsPaginated(${engagementId})`,
      error,
    );
  }
}

export async function getFinding(
  engagementId: string,
  findingId: string,
): Promise<Finding | null> {
  try {
    const finding = await prisma.auditFinding.findUnique({
      where: { id: findingId },
    });
    if (!finding || finding.engagementId !== engagementId) return null;
    return toFinding(finding);
  } catch (error) {
    protectedAuditReadUnavailable(`getFinding(${findingId})`, error);
  }
}

export async function createFinding(data: {
  engagementId: string;
  title: string;
  findingType: string;
  severity: string;
  materiality?: string;
  description: string;
  rootCause?: string;
  impact?: string;
  aiSuggested?: boolean;
}): Promise<Finding> {
  const finding = await prisma.auditFinding.create({
    data: {
      engagementId: data.engagementId,
      title: data.title,
      findingType: data.findingType,
      severity: data.severity,
      materiality: data.materiality ?? "immaterial",
      description: data.description,
      rootCause: data.rootCause ?? null,
      impact: data.impact ?? null,
      status: "draft",
      aiSuggested: data.aiSuggested ?? false,
    },
  });
  return toFinding(finding);
}

export async function updateFindingStatus(
  id: string,
  status: string,
): Promise<Finding> {
  const finding = await prisma.auditFinding.update({
    where: { id },
    data: { status },
  });
  return toFinding(finding);
}

export async function getRecommendations(
  engagementId: string,
): Promise<Recommendation[]> {
  try {
    const recs = await prisma.auditRecommendation.findMany({
      where: { engagementId },
      include: { finding: true },
    });
    if (recs.length === 0) return [];
    return recs.map(toRecommendation);
  } catch (error) {
    protectedAuditReadUnavailable(`getRecommendations(${engagementId})`, error);
  }
}

export async function getRecommendationsPaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Recommendation>> {
  try {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(
      1,
      Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const skip = offsetFromPage(page, pageSize);
    const [recs, total] = await Promise.all([
      prisma.auditRecommendation.findMany({
        where: { engagementId },
        include: { finding: true },
        skip,
        take: pageSize,
      }),
      prisma.auditRecommendation.count({ where: { engagementId } }),
    ]);
    return paginate(recs.map(toRecommendation), total, { page, pageSize });
  } catch (error) {
    protectedAuditReadUnavailable(
      `getRecommendationsPaginated(${engagementId})`,
      error,
    );
  }
}

export async function getRecommendation(
  engagementId: string,
  recId: string,
): Promise<Recommendation | null> {
  try {
    const rec = await prisma.auditRecommendation.findUnique({
      where: { id: recId },
    });
    if (!rec || rec.engagementId !== engagementId) return null;
    return toRecommendation(rec);
  } catch (error) {
    protectedAuditReadUnavailable(`getRecommendation(${recId})`, error);
  }
}

export async function createRecommendation(data: {
  engagementId: string;
  findingId: string;
  title: string;
  description: string;
  recommendedAction: string;
  riskLevel?: string;
  aiContributed?: boolean;
}): Promise<Recommendation> {
  const rec = await prisma.auditRecommendation.create({
    data: {
      engagementId: data.engagementId,
      findingId: data.findingId,
      title: data.title,
      description: data.description,
      recommendedAction: data.recommendedAction,
      riskLevel: data.riskLevel ?? "medium",
      status: "suggested",
      aiContributed: data.aiContributed ?? false,
    },
  });
  return toRecommendation(rec);
}

export async function updateRecommendationStatus(
  id: string,
  status: string,
  reviewerDecision?: string,
): Promise<Recommendation> {
  const rec = await prisma.auditRecommendation.update({
    where: { id },
    data: { status, reviewerDecision: reviewerDecision ?? undefined },
  });
  return toRecommendation(rec);
}
