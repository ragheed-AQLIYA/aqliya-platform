import type { RuntimeSignal } from "./types";

export async function collectAuditTaskSignals(
  _organizationId: string,
): Promise<RuntimeSignal[]> {
  return [];
}

export async function collectAuditReviewSignals(
  _organizationId: string,
): Promise<RuntimeSignal[]> {
  return [];
}

export async function collectAuditApprovalSignals(
  _organizationId: string,
): Promise<RuntimeSignal[]> {
  return [];
}

export async function collectLocalContentTaskSignals(
  _organizationId: string,
): Promise<RuntimeSignal[]> {
  return [];
}

export async function collectLocalContentReviewSignals(
  _organizationId: string,
): Promise<RuntimeSignal[]> {
  return [];
}

export async function collectLocalContentApprovalSignals(
  _organizationId: string,
): Promise<RuntimeSignal[]> {
  return [];
}

export async function collectSalesTaskSignals(
  _organizationId: string,
  _ownerId?: string,
): Promise<RuntimeSignal[]> {
  return [];
}

export async function collectSalesReviewSignals(
  _organizationId: string,
  _ownerId?: string,
): Promise<RuntimeSignal[]> {
  return [];
}

export async function collectSalesApprovalSignals(
  _organizationId: string,
  _ownerId?: string,
): Promise<RuntimeSignal[]> {
  return [];
}
