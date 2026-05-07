import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schemas
export const createSectorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
})

export const updateSectorSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  code: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export const assignSectorSchema = z.object({
  decisionId: z.string().cuid(),
  sectorId: z.string().cuid(),
})

// CRUD
export async function getSectors() {
  return await prisma.sector.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { decisions: true, benchmarks: true },
      },
    },
  })
}

export async function getSectorById(sectorId: string) {
  return await prisma.sector.findUnique({
    where: { id: sectorId },
    include: {
      benchmarks: true,
      patterns: true,
      playbooks: true,
      rules: true,
    },
  })
}

export async function createSector(data: z.infer<typeof createSectorSchema>) {
  const validated = createSectorSchema.parse(data)
  return await prisma.sector.create({
    data: {
      name: validated.name,
      code: validated.code,
      description: validated.description || "",
    },
  })
}

export async function updateSector(data: z.infer<typeof updateSectorSchema>) {
  const validated = updateSectorSchema.parse(data)
  const { id, ...updateData } = validated
  return await prisma.sector.update({
    where: { id },
    data: updateData,
  })
}

// Decision assignment
export async function assignSectorToDecision(
  decisionId: string,
  sectorId: string
) {
  const validated = assignSectorSchema.parse({ decisionId, sectorId })
  return await prisma.decision.update({
    where: { id: validated.decisionId },
    data: { sectorId: validated.sectorId },
  })
}

export async function getDecisionSector(decisionId: string) {
  return await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { sectorId: true, sector: true },
  })
}
