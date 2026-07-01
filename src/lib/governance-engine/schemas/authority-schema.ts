import { z } from 'zod';

const authIdPattern = /^AUTH-[A-Z][A-Z0-9-]+$/;

export const authorityTypeEnum = z.enum(['Authority', 'Reference']);
export type AuthorityType = z.infer<typeof authorityTypeEnum>;

export const AuthoritySchema = z.object({
  id: z.string().regex(authIdPattern, 'ID must match AUTH-{AREA}'),
  version: z.string(),
  knowledgeArea: z.string(),
  document: z.string(),
  type: authorityTypeEnum,
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
  chainPosition: z.number().int().min(0).max(5),
});

export type Authority = z.infer<typeof AuthoritySchema>;
