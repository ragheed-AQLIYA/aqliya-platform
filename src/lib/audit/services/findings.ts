/**
 * Audit Services — Findings domain
 *
 * Findings and recommendations CRUD, status management.
 */

import type { Finding, Recommendation } from "@/types/audit";
import type { PaginatedResult } from "@/lib/audit/pagination";
import * as mock from "../mock-data";
import { getDb, tryDb } from "./common";

export async function getFindings(engagementId: string): Promise<Finding[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockFindings)
        : Promise.resolve([]),
    (db) => db.getFindings(engagementId),
  );
}

export async function getFindingsPaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Finding>> {
  return tryDb(
    () => {
      if (engagementId !== mock.mockEngagement.id)
        return Promise.resolve({
          items: [] as Finding[],
          total: 0,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          hasMore: false,
        });
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, params.pageSize ?? 20);
      const skip = (page - 1) * pageSize;
      const items = mock.mockFindings.slice(skip, skip + pageSize);
      return Promise.resolve({
        items,
        total: mock.mockFindings.length,
        page,
        pageSize,
        hasMore: page * pageSize < mock.mockFindings.length,
      });
    },
    (db) => db.getFindingsPaginated(engagementId, params),
  );
}

export async function getFinding(
  engagementId: string,
  findingId: string,
): Promise<Finding | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(
            mock.mockFindings.find((f) => f.id === findingId) ?? null,
          )
        : Promise.resolve(null),
    (db) => db.getFinding(engagementId, findingId),
  );
}

export async function getRecommendations(
  engagementId: string,
): Promise<Recommendation[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockRecommendations)
        : Promise.resolve([]),
    (db) => db.getRecommendations(engagementId),
  );
}

export async function getRecommendationsPaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Recommendation>> {
  return tryDb(
    () => {
      if (engagementId !== mock.mockEngagement.id)
        return Promise.resolve({
          items: [] as Recommendation[],
          total: 0,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          hasMore: false,
        });
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, params.pageSize ?? 20);
      const skip = (page - 1) * pageSize;
      const items = mock.mockRecommendations.slice(skip, skip + pageSize);
      return Promise.resolve({
        items,
        total: mock.mockRecommendations.length,
        page,
        pageSize,
        hasMore: page * pageSize < mock.mockRecommendations.length,
      });
    },
    (db) => db.getRecommendationsPaginated(engagementId, params),
  );
}

export async function getRecommendation(
  engagementId: string,
  recId: string,
): Promise<Recommendation | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(
            mock.mockRecommendations.find((r) => r.id === recId) ?? null,
          )
        : Promise.resolve(null),
    (db) => db.getRecommendation(engagementId, recId),
  );
}

// ─── Findings Mutations ───

export async function createFinding(params: {
  engagementId: string;
  title: string;
  findingType: string;
  severity: string;
  description: string;
  rootCause?: string;
  impact?: string;
  materiality?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ finding: Finding }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const finding = await db.createFinding({
    engagementId: params.engagementId,
    title: params.title,
    findingType: params.findingType,
    severity: params.severity,
    description: params.description,
    rootCause: params.rootCause,
    impact: params.impact,
    materiality: params.materiality,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "finding.created",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "reviewer",
    targetType: "finding",
    targetId: finding.id,
    newState: finding.status,
    description: `Finding created: ${params.title}`,
  });
  return { finding };
}

export async function updateFindingStatus(
  id: string,
  status: string,
  engagementId: string,
  actorId?: string,
): Promise<{ finding: Finding }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const finding = await db.updateFindingStatus(id, status);
  await db.recordAuditEvent({
    engagementId,
    eventType: "finding.state_changed",
    actorId: actorId ?? "system",
    actorName: "System",
    actorRole: "reviewer",
    targetType: "finding",
    targetId: id,
    newState: status,
    description: `Finding status changed to ${status}`,
  });
  return { finding };
}

// ─── Recommendations Mutations ───

export async function createRecommendation(params: {
  engagementId: string;
  findingId: string;
  title: string;
  description: string;
  recommendedAction: string;
  riskLevel?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ recommendation: Recommendation }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const rec = await db.createRecommendation({
    engagementId: params.engagementId,
    findingId: params.findingId,
    title: params.title,
    description: params.description,
    recommendedAction: params.recommendedAction,
    riskLevel: params.riskLevel,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "recommendation.created",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "reviewer",
    targetType: "recommendation",
    targetId: rec.id,
    newState: rec.status,
    description: `Recommendation created: ${params.title}`,
  });
  return { recommendation: rec };
}

export async function updateRecommendationStatus(
  id: string,
  status: string,
  engagementId: string,
  reviewerDecision?: string,
): Promise<{ recommendation: Recommendation }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const rec = await db.updateRecommendationStatus(id, status, reviewerDecision);
  await db.recordAuditEvent({
    engagementId,
    eventType: "recommendation.state_changed",
    actorId: "system",
    actorName: "Reviewer",
    actorRole: "reviewer",
    targetType: "recommendation",
    targetId: id,
    newState: status,
    description: `Recommendation status changed to ${status}${reviewerDecision ? ": " + reviewerDecision : ""}`,
  });
  return { recommendation: rec };
}
