/**
 * DTO Mapper — SPEC-01b §5
 *
 * Translates Domain types → API response DTOs.
 * ViewModel-compatible shapes for frontend consumption.
 * Value Objects are flattened to primitives.
 */

import type { Deal } from "../domain/deal";

// ─── Response DTOs (SPEC-01b §2.8) ───

export interface DealResponse {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  ownerId: string;
  reviewStatus: string;
  evidenceCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface DealDetailResponse extends DealResponse {
  accountName: string;
  accountIndustry?: string;
  evidenceLinks: unknown[];         // resolved via Platform Evidence Network
  reviewDecisions: unknown[];       // extracted from deal metadata
  auditEvents: unknown[];           // fetched from Platform Audit service
}

// ─── DTO Mappers ───

export function toDealResponse(deal: Deal): DealResponse {
  return {
    id: deal.id,
    accountId: deal.accountId,
    name: deal.name,
    amount: deal.amount.value,
    currency: deal.currency.code,
    stage: deal.stage.name,
    probability: deal.probability.value,
    expectedCloseDate: deal.expectedCloseDate,
    ownerId: deal.ownerId,
    reviewStatus: deal.reviewStatus,
    evidenceCount: deal.evidenceCount,
    version: deal.version,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
    createdById: deal.createdById,
  };
}

export function toDealDetailResponse(deal: Deal): DealDetailResponse {
  return {
    ...toDealResponse(deal),
    accountName: "",  // populated by joined query in production
    accountIndustry: undefined,
    evidenceLinks: [],
    reviewDecisions: deal.reviewDecisions ?? [],
    auditEvents: [],
  };
}
