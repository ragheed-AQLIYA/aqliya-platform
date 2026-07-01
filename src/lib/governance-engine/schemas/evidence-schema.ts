import { z } from 'zod';

const evIdPattern = /^EV-\d{4}$/;

export const TierEnum = z.enum(['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']);
export type Tier = z.infer<typeof TierEnum>;

export const evidenceQualityEnum = z.enum(['Strong', 'Moderate', 'Weak']);
export type EvidenceQuality = z.infer<typeof evidenceQualityEnum>;

export const FreshnessSchema = z.object({
  evidenceDate: z.string(),
  commit: z.string(),
  verificationDate: z.string(),
  reviewer: z.string(),
  expires: z.string(),
});
export type FreshnessInfo = z.infer<typeof FreshnessSchema>;

export const EvidenceSchema = z.object({
  id: z.string().regex(evIdPattern, 'ID must match EV-{NNNN}'),
  version: z.string(),
  tier: TierEnum,
  strength: evidenceQualityEnum,
  reusable: z.boolean(),
  description: z.string().min(1),
  sourceRef: z.string(),
  score: z.number().int().min(0).max(3),
  supportsClaims: z.array(z.string()),
  freshness: FreshnessSchema,
});

export type Evidence = z.infer<typeof EvidenceSchema>;
