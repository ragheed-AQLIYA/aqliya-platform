import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schemas - update incremental fields only
export const upsertSectorPatternSchema = z.object({
  sectorId: z.string().cuid(),
  patternType: z.string().min(1),
  patternKey: z.string().min(1),
  confidenceScore: z.number().min(0).max(1),
  sourceDecisionId: z.string().cuid().optional(),
})

// Query - no extraction logic
export async function getSectorPatterns(sectorId: string) {
  return await prisma.sectorPattern.findMany({
    where: { sectorId },
    orderBy: { lastObservedAt: "desc" },
  })
}

// Incremental update only - NO analysis logic here
export async function upsertSectorPattern(data: z.infer<typeof upsertSectorPatternSchema>) {
  const validated = upsertSectorPatternSchema.parse(data)
  
  return await prisma.sectorPattern.upsert({
    where: {
      sectorId_patternType_patternKey: {
        sectorId: validated.sectorId,
        patternType: validated.patternType,
        patternKey: validated.patternKey,
      },
    },
    update: {
      occurrenceCount: { increment: 1 },
      lastObservedAt: new Date(),
      confidenceScore: validated.confidenceScore,
      ...(validated.sourceDecisionId && { sourceDecisionId: validated.sourceDecisionId }),
    },
    create: {
      sectorId: validated.sectorId,
      patternType: validated.patternType,
      patternKey: validated.patternKey,
      confidenceScore: validated.confidenceScore,
      ...(validated.sourceDecisionId && { sourceDecisionId: validated.sourceDecisionId }),
    },
  })
}
