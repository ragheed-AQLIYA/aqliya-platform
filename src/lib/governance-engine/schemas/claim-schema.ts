import { z } from 'zod';

const clmIdPattern = /^CLM-[A-Z]+-\d{4}$/;

export const confidenceEnum = z.enum(['High', 'Medium', 'Low']);
export type Confidence = z.infer<typeof confidenceEnum>;

export const dimensionEnum = z.enum([
  'Implementation Reality',
  'Product Maturity',
  'Commercial Claim',
  'Strategic Intent',
]);
export type Dimension = z.infer<typeof dimensionEnum>;

export const ClaimSchema = z.object({
  id: z.string().regex(clmIdPattern, 'ID must match CLM-{AREA}-{NNNN}'),
  version: z.string(),
  hash: z.string(),
  type: z.enum(['CR-ST', 'CR-TC', 'CR-OP', 'CR-MK', 'CR-MT', 'CR-AR']),
  origin: z.string().min(1),
  dimension: dimensionEnum,
  capabilities: z.array(z.string()).optional(),
  claimText: z.string().min(1),
  knowledgeArea: z.string(),
  product: z.string(),
  authorities: z.array(z.string()),
  evidenceRefs: z.array(z.string()),
  currentDecision: z.string().optional(),
  confidence: confidenceEnum,
  completeness: z.number().int().min(0).max(100),
  historicalRefs: z.array(z.string()).optional(),
  decisionImpact: z.string().optional(),
  created: z.string(),
});

export type Claim = z.infer<typeof ClaimSchema>;
