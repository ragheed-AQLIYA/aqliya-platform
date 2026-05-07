import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schemas
export const createBenchmarkSchema = z.object({
  sectorId: z.string().cuid(),
  metricName: z.string().min(1, "Metric name is required"),
  value: z.number(),
  unit: z.string().min(1, "Unit is required"),
  benchmarkType: z.string().min(1, "Benchmark type is required"),
  sourceType: z.enum(["manual", "derived", "assumption"]).default("manual"),
  confidence: z.number().min(0).max(1).default(1.0),
})

export const updateBenchmarkSchema = z.object({
  id: z.string().cuid(),
  metricName: z.string().min(1).optional(),
  value: z.number().optional(),
  unit: z.string().min(1).optional(),
  benchmarkType: z.string().min(1).optional(),
  sourceType: z.enum(["manual", "derived", "assumption"]).optional(),
  confidence: z.number().min(0).max(1).optional(),
})

// CRUD
export async function getBenchmarksBySector(sectorId: string) {
  return await prisma.sectorBenchmark.findMany({
    where: { sectorId },
    orderBy: { metricName: "asc" },
  })
}

export async function getBenchmarkById(benchmarkId: string) {
  return await prisma.sectorBenchmark.findUnique({
    where: { id: benchmarkId },
  })
}

export async function createBenchmark(data: z.infer<typeof createBenchmarkSchema>) {
  const validated = createBenchmarkSchema.parse(data)
  return await prisma.sectorBenchmark.create({
    data: validated,
  })
}

export async function updateBenchmark(data: z.infer<typeof updateBenchmarkSchema>) {
  const validated = updateBenchmarkSchema.parse(data)
  const { id, ...updateData } = validated
  return await prisma.sectorBenchmark.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteBenchmark(benchmarkId: string) {
  return await prisma.sectorBenchmark.delete({
    where: { id: benchmarkId },
  })
}
