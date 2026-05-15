import type { EvidenceStatus, EscalationLevel } from '../runtime-types';

export interface VisibilityContext {
  evidenceStatus?: EvidenceStatus;
  escalationLevel?: EscalationLevel;
  materiality?: 'low' | 'medium' | 'high';
  hasUnresolvedIssues?: boolean;
  isReviewerActionRequired?: boolean;
  isWorkflowStageDraft?: boolean;
  hasRealData?: boolean;
}

export function shouldShowEvidenceBadge(ctx: VisibilityContext): boolean {
  if (!ctx.hasRealData) return false;
  if (!ctx.evidenceStatus) return false;
  const actionable: EvidenceStatus[] = ['missing', 'conflicting', 'weak'];
  return actionable.includes(ctx.evidenceStatus);
}

export function shouldShowEscalationBadge(ctx: VisibilityContext): boolean {
  if (!ctx.escalationLevel) return false;
  if (ctx.escalationLevel === 'none' || ctx.escalationLevel === 'notice') return false;
  return true;
}

export function shouldShowProvenance(ctx: VisibilityContext): boolean {
  if (!ctx.hasRealData) return false;
  return shouldShowEvidenceBadge(ctx) || shouldShowEscalationBadge(ctx) || ctx.materiality === 'high';
}

export function shouldShowGovernancePanel(ctx: VisibilityContext): boolean {
  if (!ctx.hasRealData) return false;
  return shouldShowEscalationBadge(ctx) || ctx.materiality === 'high' || ctx.isReviewerActionRequired === true;
}
