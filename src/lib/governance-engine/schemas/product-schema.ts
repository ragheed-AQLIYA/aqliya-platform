import { z } from 'zod';

const prodIdPattern = /^PROD-[A-Z][A-Z0-9-]+$/;

export const entityTypeEnum = z.enum([
  'Platform',
  'Product',
  'Workspace',
  'Engine',
  'Foundation',
  'Runtime',
  'Service',
  'Library',
]);
export type EntityType = z.infer<typeof entityTypeEnum>;

export const lLevelStatusEnum = z.enum(['Verified', 'Disputed', 'Frozen']);
export type LLevelStatus = z.infer<typeof lLevelStatusEnum>;

export const strategicIntentEnum = z.enum([
  'Approved',
  'Deferred',
  'Frozen',
  'Experimental',
]);
export type StrategicIntent = z.infer<typeof strategicIntentEnum>;

export const evidenceStatusEnum = z.enum(['Not Started', 'Partial', 'Complete']);
export type EvidenceStatus = z.infer<typeof evidenceStatusEnum>;

export const manifestStatusEnum = z.enum(['Missing', 'Generated']);
export type ManifestStatus = z.infer<typeof manifestStatusEnum>;

export const dossierStatusEnum = z.enum(['Missing', 'Generated']);
export type DossierStatus = z.infer<typeof dossierStatusEnum>;

export const ProductSchema = z.object({
  id: z.string().regex(prodIdPattern, 'ID must match PROD-{NAME}'),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  entityType: entityTypeEnum,
  knowledgeArea: z.string(),
  authority: z.string(),
  currentLLevel: z.string(),
  lLevelStatus: lLevelStatusEnum,
  strategicIntent: strategicIntentEnum,
  parentSystem: z.string().optional(),
  evidenceStatus: evidenceStatusEnum,
  manifestStatus: manifestStatusEnum,
  dossierStatus: dossierStatusEnum,
  lastVerification: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
