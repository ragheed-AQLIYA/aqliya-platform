import type { ClaimType, ClaimStatus, Confidence, Dimension } from '../../types/entities';

export const VALID_DIMENSIONS: Dimension[] = [
  'Implementation Reality',
  'Product Maturity',
  'Commercial Claim',
  'Strategic Intent',
];

export const VALID_CLAIM_TYPES: ClaimType[] = [
  'CR-ST',
  'CR-TC',
  'CR-OP',
  'CR-MK',
  'CR-MT',
  'CR-AR',
];

export const VALID_CONFIDENCE: Confidence[] = ['High', 'Medium', 'Low'];

export const VALID_STATUSES: ClaimStatus[] = [
  'Verified',
  'Contradicted',
  'Unverified',
  'Requires Decision',
  'Stale',
  'Superseded',
];

export function parseCompleteness(raw: string): number {
  const cleaned = raw.replace(/\*\*/g, '').replace('%', '').trim();
  const val = parseInt(cleaned, 10);
  return Number.isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
}

export function parseArrayField(raw: string): string[] {
  if (!raw || raw.trim() === '—' || raw.trim() === '') {
    return [];
  }
  return raw
    .replace(/^\[|\]$/g, '')
    .split(/[,;]\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function parseDimension(raw: string): Dimension {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.includes('implementation') || trimmed === 'impl. reality') {
    return 'Implementation Reality';
  }
  if (trimmed.includes('product maturity')) {
    return 'Product Maturity';
  }
  if (trimmed.includes('commercial claim') || trimmed.includes('commercial')) {
    return 'Commercial Claim';
  }
  if (trimmed.includes('strategic intent') || trimmed.includes('strategic')) {
    return 'Strategic Intent';
  }
  return 'Implementation Reality';
}

export function parseClaimType(raw: string): ClaimType {
  const trimmed = raw.trim().toUpperCase();
  for (const t of VALID_CLAIM_TYPES) {
    if (t === trimmed) {
      return t;
    }
  }
  if (trimmed === 'IMPLEMENTATION' || trimmed === 'CODE INSPECTION') {
    return 'CR-TC';
  }
  if (trimmed === 'PRODUCT' || trimmed === 'OBSERVATION') {
    return 'CR-OP';
  }
  if (trimmed === 'STRATEGIC' || trimmed === 'GOVERNANCE DECISION') {
    return 'CR-ST';
  }
  if (trimmed === 'COMMERCIAL' || trimmed === 'DOCUMENT') {
    return 'CR-MK';
  }
  if (trimmed === 'ARCHITECTURE') {
    return 'CR-AR';
  }
  if (trimmed === 'CONSUMER' || trimmed === 'NATIVE' || trimmed === 'COMPOSITION' || trimmed === 'DERIVED') {
    return 'CR-TC';
  }
  return 'CR-TC';
}

export function parseOrigin(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed && trimmed !== '—') {
    return trimmed;
  }
  return 'Document';
}

export function parseConfidence(raw: string): Confidence {
  const trimmed = raw.trim();
  for (const c of VALID_CONFIDENCE) {
    if (c.toLowerCase() === trimmed.toLowerCase()) {
      return c;
    }
  }
  return 'Medium';
}
