import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schemas - metadata only
export const createDecisionPatternSchema = z.object({
  decisionId: z.string().cuid(),
  patternScope: z.enum(["DECISION", "SECTOR", "CROSS_SECTOR"]).default("DECISION"),
  confidence: z.number().min(0).max(1).default(0.5),
})

// Create metadata only
export async function createDecisionPattern(data: z.infer<typeof createDecisionPatternSchema>) {
  const validated = createDecisionPatternSchema.parse(data)
  const decision = await prisma.decision.findUnique({
    where: { id: validated.decisionId },
    select: { organizationId: true },
  })

  if (!decision) {
    throw new Error("Decision not found")
  }

  return await prisma.decisionPattern.create({
    data: {
      decisionId: validated.decisionId,
      organizationId: decision.organizationId,
      patternScope: validated.patternScope,
      confidence: validated.confidence,
    },
  })
}

// Read metadata
export async function getDecisionPattern(decisionId: string) {
  return await prisma.decisionPattern.findUnique({
    where: { decisionId },
  })
}

// Check if patterns already extracted
export async function decisionPatternExists(decisionId: string) {
  const existing = await prisma.decisionPattern.findUnique({
    where: { decisionId },
  })
  return !!existing
}
