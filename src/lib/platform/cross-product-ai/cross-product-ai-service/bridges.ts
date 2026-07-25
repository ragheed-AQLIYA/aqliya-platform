import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { productModelName } from "./common"
import type { BridgeInput } from "./types"

async function resolveSourceRecord(sourceProduct: string, sourceRecordId: string): Promise<Record<string, unknown> | null> {
  const modelName = productModelName(sourceProduct)
  const model = (prisma as unknown as Record<string, Record<string, unknown>>)[modelName]
  if (!model || typeof model.findUnique !== "function") return null

  try {
    const record = await model.findUnique({ where: { id: sourceRecordId } })
    return record || null
  } catch {
    return null
  }
}

function applyFieldMapping(
  sourceRecord: Record<string, any>,
  mappingConfig: Record<string, any>,
): Record<string, any> {
  const fieldMappings: Array<{ sourceField: string; targetField: string; default?: any }> =
    mappingConfig.fieldMappings ?? []

  const transformed: Record<string, any> = {}

  for (const mapping of fieldMappings) {
    const value = sourceRecord[mapping.sourceField]
    transformed[mapping.targetField] = value !== undefined ? value : (mapping.default ?? null)
  }

  if (mappingConfig.enrichment?.includeSourceMetadata) {
    transformed._source = {
      id: sourceRecord.id,
      type: sourceRecord.constructor?.name ?? "unknown",
      createdAt: sourceRecord.createdAt,
    }
  }

  return transformed
}

export async function buildCrossProductContext(
  sourceProduct: string,
  sourceRecordId: string,
  targetProduct: string,
): Promise<any> {
  const bridges = await prisma.aiContextBridge.findMany({
    take: 100,
    where: {
      sourceProduct,
      targetProduct,
      isActive: true,
    },
  })

  if (bridges.length === 0) {
    throw new Error(
      `No active context bridge from "${sourceProduct}" to "${targetProduct}"`,
    )
  }

  const sourceRecord = await resolveSourceRecord(sourceProduct, sourceRecordId)
  if (!sourceRecord) {
    throw new Error(
      `Source record not found: ${sourceProduct}/${sourceRecordId}`,
    )
  }

  const contexts: Record<string, any>[] = []

  for (const bridge of bridges) {
    let mappingConfig: Record<string, any>
    try {
      mappingConfig = JSON.parse(bridge.mappingConfig ?? '{}')
    } catch {
      mappingConfig = {}
    }

    const transformed = applyFieldMapping(sourceRecord, mappingConfig)

    contexts.push({
      bridgeId: bridge.id,
      mappingName: bridge.mappingName,
      sourceProduct: bridge.sourceProduct,
      targetProduct: bridge.targetProduct,
      sourceRecordId,
      transformed,
    })
  }

  return {
    sourceProduct,
    targetProduct,
    sourceRecordId,
    bridgeCount: contexts.length,
    contexts,
  }
}

export async function registerContextBridge(input: BridgeInput): Promise<{ id: string }> {
  const bridge = await prisma.aiContextBridge.create({
    data: {
      organizationId: input.organizationId ?? null,
      sourceProduct: input.sourceProduct,
      targetProduct: input.targetProduct,
      mappingName: input.mappingName,
      mappingConfig: JSON.stringify(input.mappingConfig),
      description: input.description ?? null,
      isActive: true,
      createdBy: input.createdBy ?? null,
    },
  })

  try {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "ai_context_bridge_registered",
      actorId: input.createdBy,
      targetType: "ai_context_bridge",
      targetId: bridge.id,
      severity: "info",
      status: "recorded",
      sourceSystem: "cross_product_ai",
      metadata: {
        sourceProduct: input.sourceProduct,
        targetProduct: input.targetProduct,
        mappingName: input.mappingName,
      } as Record<string, unknown>,
    })
  } catch {
    /* non-blocking */
  }

  return { id: bridge.id }
}

export async function getContextBridges(sourceProduct?: string): Promise<any[]> {
  const where: Record<string, any> = {}
  if (sourceProduct) where.sourceProduct = sourceProduct

  const bridges = await prisma.aiContextBridge.findMany({
    take: 100,
    where,
    orderBy: { createdAt: "desc" },
  })

  return bridges.map((b: any) => ({
    ...b,
    mappingConfig: typeof b.mappingConfig === "string" ? JSON.parse(b.mappingConfig) : b.mappingConfig,
  }))
}
