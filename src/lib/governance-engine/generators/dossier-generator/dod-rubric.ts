import { type Product, type Claim, type Evidence, type LLevel } from '../../types/entities';
import { LLEVEL_ORDER, DOD_REQS_MAP, levelAtIndex } from './common';

export function buildDoDRubric(
  product: Product,
  claims: Claim[],
  evidence: Evidence[],
): string {
  const lines: string[] = [];
  lines.push('## DoD Rubric');
  lines.push('');

  const currentLevelIndex = LLEVEL_ORDER.indexOf(product.currentLLevel as LLevel);
  const baseLevelIndex = Math.max(0, currentLevelIndex);

  lines.push('| Requirement | Required For | Met | Evidence |');
  lines.push('|-------------|-------------|-----|----------|');

  for (let i = 0; i <= baseLevelIndex; i++) {
    const level = levelAtIndex(i);
    const reqs = DOD_REQS_MAP.get(level) ?? [];
    for (const req of reqs) {
      const met = isRequirementMet(req, product, claims, evidence);
      const evRef = met ? getRequirementEvidence(req, product, claims, evidence) : '—';
      lines.push(`| ${req} | ${level} | ${met ? 'Yes' : 'No'} | ${evRef} |`);
    }
  }

  return lines.join('\n');
}

export function isRequirementMet(
  requirement: string,
  product: Product,
  claims: Claim[],
  evidence: Evidence[],
): boolean {
  const reqLower = requirement.toLowerCase();

  if (reqLower.includes('concept') || reqLower.includes('marketing') || reqLower.includes('copy')) {
    return product.evidenceStatus !== 'Not Started';
  }

  if (reqLower.includes('route') || reqLower.includes('workspace') || reqLower.includes('scaffold')) {
    return product.currentLLevel !== 'L0' && product.currentLLevel !== 'L1';
  }

  if (reqLower.includes('mock') || reqLower.includes('ui with')) {
    return claims.length > 0;
  }

  if (reqLower.includes('persistence') || reqLower.includes('real workflow')) {
    return evidence.length > 0;
  }

  if (reqLower.includes('governance') || reqLower.includes('review') || reqLower.includes('approval') || reqLower.includes('audit')) {
    return evidence.some((e) => e.tier === 'T5' || e.tier === 'T6');
  }

  if (reqLower.includes('evidence') || reqLower.includes('seed')) {
    return evidence.some((e) => e.tier === 'T1' || e.tier === 'T2');
  }

  if (reqLower.includes('export')) {
    return evidence.some((e) => e.tier === 'T6' || e.tier === 'T7');
  }

  if (reqLower.includes('security') || reqLower.includes('monitoring') || reqLower.includes('backup') || reqLower.includes('deployment') || reqLower.includes('operational')) {
    return evidence.some((e) => e.tier === 'T6' || e.tier === 'T7');
  }

  return false;
}

export function getRequirementEvidence(
  requirement: string,
  _product: Product,
  _claims: Claim[],
  evidence: Evidence[],
): string {
  const reqLower = requirement.toLowerCase();

  if (reqLower.includes('governance') || reqLower.includes('review') || reqLower.includes('approval')) {
    const matches = evidence.filter((e) => e.tier === 'T5').map((e) => e.id);
    return matches.length > 0 ? matches.join(', ') : '—';
  }

  if (reqLower.includes('security') || reqLower.includes('operational') || reqLower.includes('deployment')) {
    const matches = evidence.filter((e) => e.tier === 'T6' || e.tier === 'T7').map((e) => e.id);
    return matches.length > 0 ? matches.join(', ') : '—';
  }

  const matches = evidence.map((e) => e.id);
  return matches.length > 0 ? matches.slice(0, 3).join(', ') : '—';
}
