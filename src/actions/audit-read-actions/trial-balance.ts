"use server"

import {
  getTrialBalance,
  getMappings,
  getFinancialStatements,
  getDisclosureNotes,
} from "@/lib/audit/services"
import type {
  TrialBalance, AccountMapping, FinancialStatement,
  DisclosureNote,
} from "@/types/audit"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import { confirmMappingAction as _confirmMapping } from "../audit-actions"
import { runValidationAction as _runValidation } from "../audit-actions"

export async function getTrialBalanceAction(engagementId: string): Promise<TrialBalance | null> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getTrialBalance(engagementId)
}

export async function getMappingsAction(engagementId: string): Promise<AccountMapping[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getMappings(engagementId)
}

export async function getFinancialStatementsAction(engagementId: string): Promise<FinancialStatement[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getFinancialStatements(engagementId)
}

export async function getDisclosureNotesAction(engagementId: string): Promise<DisclosureNote[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getDisclosureNotes(engagementId)
}

// Delegated to audit-actions.ts — imported statically
export async function confirmMappingAction(engagementId: string, mappingId: string) {
  return _confirmMapping(engagementId, mappingId)
}

export async function runValidationAction(engagementId: string) {
  return _runValidation(engagementId)
}
