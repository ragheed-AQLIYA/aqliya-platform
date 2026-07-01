import { z } from 'zod';

const decIdPattern = /^DEC-\d{4}-\d{4}$/;

export const DecisionTypeEnum = z.enum([
  'MAT',
  'STR',
  'COM',
  'FRZ',
  'MOD',
  'EVI',
  'GRC',
]);
export type DecisionType = z.infer<typeof DecisionTypeEnum>;

export const DecisionStatusEnum = z.enum([
  'Draft',
  'Under Review',
  'Approved',
  'Rejected',
  'Active',
  'Superseded',
  'Archived',
]);
export type DecisionStatus = z.infer<typeof DecisionStatusEnum>;

export const DecisionSchema = z.object({
  id: z.string().regex(decIdPattern, 'ID must match DEC-{YYYY}-{NNNN}'),
  version: z.string(),
  type: DecisionTypeEnum,
  title: z.string().min(1),
  authority: z.string(),
  decisionDate: z.string(),
  effectiveDate: z.string(),
  reviewDate: z.string(),
  affectedClaims: z.array(z.string()),
  evidenceReviewed: z.array(z.string()),
  manifestRef: z.string().optional(),
  dossierRef: z.string().optional(),
  accepted: z.array(z.string()),
  rejected: z.array(z.string()),
  conditions: z.array(z.string()),
  rationale: z.string().min(1),
  governingRule: z.string(),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
  status: DecisionStatusEnum,
});

export type Decision = z.infer<typeof DecisionSchema>;
