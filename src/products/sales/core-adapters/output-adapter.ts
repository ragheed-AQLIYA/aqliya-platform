import "server-only"
import crypto from "node:crypto"
import {
  InMemoryOutputService,
  type OutputCategory,
  type OutputDocument,
  type OutputFormat,
} from "@/core/output"
import { getOutputsByProduct, getRequiredApprovalForOutput } from "@/lib/platform/output/engine"
import { registerOutputQueueEntry } from "@/lib/platform/operations/unified-output-queue"
import { writeCoreSalesAuditEvent } from "./audit-adapter"

const OUTPUT_CORE_PRODUCT_KEY = "salesos"
const GLOBAL_SALES_OUTPUT_SERVICE_KEY =
  "__aqliyaSalesOutputService" as const

export type SalesOutputTypeId =
  | "account_brief"
  | "opportunity_brief"
  | "commercial_intelligence_report"
  | "revenue_intelligence_report"
  | "icp_learning_report"
  | "proof_effectiveness_report"
  | "executive_commercial_report"
  | "knowledge_graph_snapshot"

type SalesOutputSpec = {
  id: SalesOutputTypeId
  category: OutputCategory
  format: OutputFormat
  markExported: boolean
}

const OUTPUT_SPECS: Record<SalesOutputTypeId, SalesOutputSpec> = {
  account_brief: {
    id: "account_brief",
    category: "memo",
    format: "json",
    markExported: true,
  },
  opportunity_brief: {
    id: "opportunity_brief",
    category: "memo",
    format: "json",
    markExported: true,
  },
  commercial_intelligence_report: {
    id: "commercial_intelligence_report",
    category: "report",
    format: "json",
    markExported: false,
  },
  revenue_intelligence_report: {
    id: "revenue_intelligence_report",
    category: "report",
    format: "json",
    markExported: false,
  },
  icp_learning_report: {
    id: "icp_learning_report",
    category: "report",
    format: "json",
    markExported: false,
  },
  proof_effectiveness_report: {
    id: "proof_effectiveness_report",
    category: "report",
    format: "json",
    markExported: false,
  },
  executive_commercial_report: {
    id: "executive_commercial_report",
    category: "report",
    format: "json",
    markExported: false,
  },
  knowledge_graph_snapshot: {
    id: "knowledge_graph_snapshot",
    category: "report",
    format: "json",
    markExported: false,
  },
}

type SalesOutputGlobal = typeof globalThis & {
  [GLOBAL_SALES_OUTPUT_SERVICE_KEY]?: InMemoryOutputService
}

function resolveOutputService(): InMemoryOutputService {
  const globalScope = globalThis as SalesOutputGlobal
  if (!globalScope[GLOBAL_SALES_OUTPUT_SERVICE_KEY]) {
    globalScope[GLOBAL_SALES_OUTPUT_SERVICE_KEY] = new InMemoryOutputService()
  }
  return globalScope[GLOBAL_SALES_OUTPUT_SERVICE_KEY]
}

function getSalesOutputDefinition(outputTypeId: SalesOutputTypeId) {
  return getOutputsByProduct("sales").find((output: { id: string }) => output.id === outputTypeId)
}

function isApprovedStatus(status?: string | null): boolean {
  const normalized = status?.trim().toUpperCase()
  return normalized === "APPROVED"
}

function queueStatus(params: {
  outputTypeId: SalesOutputTypeId
  approvalStatus?: string | null
  exported: boolean
}): "pending" | "generated" | "awaiting_approval" {
  if (params.exported) return "generated"
  const requiresApproval = getRequiredApprovalForOutput("sales", params.outputTypeId)
  if (requiresApproval && !isApprovedStatus(params.approvalStatus)) {
    return "awaiting_approval"
  }
  return params.approvalStatus ? "generated" : "pending"
}

function buildFileUrl(
  opportunityId: string,
  outputTypeId: SalesOutputTypeId,
): string {
  return `memory://sales-output/${opportunityId}/${outputTypeId}`
}

export function getSalesOutputService(): InMemoryOutputService {
  return resolveOutputService()
}

export function resetSalesOutputServiceForTests(): void {
  ;(globalThis as SalesOutputGlobal)[GLOBAL_SALES_OUTPUT_SERVICE_KEY] =
    new InMemoryOutputService()
}

export function buildSalesOutputSnapshotContent(params: {
  outputTypeId: SalesOutputTypeId
  organizationId: string
  opportunityId: string
  opportunityName: string
  accountId?: string | null
  accountName?: string | null
  stage?: string | null
  reviewStatus?: string | null
  approvalStatus?: string | null
  valueEstimate?: number | null
  evidenceCount?: number
}): string {
  return JSON.stringify(
    {
      product: "sales",
      outputTypeId: params.outputTypeId,
      generatedAt: new Date().toISOString(),
      organizationId: params.organizationId,
      opportunity: {
        id: params.opportunityId,
        name: params.opportunityName,
        stage: params.stage ?? null,
        reviewStatus: params.reviewStatus ?? null,
        approvalStatus: params.approvalStatus ?? null,
        valueEstimate: params.valueEstimate ?? null,
      },
      account: params.accountId
        ? {
            id: params.accountId,
            name: params.accountName ?? null,
          }
        : null,
      evidenceCount: params.evidenceCount ?? 0,
    },
    null,
    2,
  )
}

export async function syncSalesOutputToCore(params: {
  organizationId: string
  platformOrganizationId?: string | null
  opportunityId: string
  opportunityName: string
  accountId?: string | null
  accountName?: string | null
  actorId: string
  actorRole: string
  actorName?: string | null
  entityType: string
  entityId: string
  outputTypeId: SalesOutputTypeId
  content: string
  reviewStatus?: string | null
  approvalStatus?: string | null
  approvedById?: string | null
  evidenceIds?: string[]
  href: string
  metadata?: Record<string, unknown>
  strict?: boolean
}): Promise<OutputDocument | null> {
  const spec = OUTPUT_SPECS[params.outputTypeId]
  if (!spec) {
    throw new Error(`Unsupported SalesOS output type: ${params.outputTypeId}`)
  }

  try {
    const checksum = crypto
      .createHash("sha256")
      .update(params.content)
      .digest("hex")
    const contentBytes = Buffer.byteLength(params.content, "utf8")
    const definition = getSalesOutputDefinition(params.outputTypeId)
    const requiresApproval = getRequiredApprovalForOutput(
      "sales",
      params.outputTypeId,
    )
    const outputService = resolveOutputService()
    const output = await outputService.create({
      tenantId: params.organizationId,
      productKey: OUTPUT_CORE_PRODUCT_KEY,
      category: spec.category,
      title: `${definition?.labelEn ?? params.outputTypeId} — ${params.opportunityName}`,
      description: `SalesOS output for ${params.entityType} ${params.entityId}`,
      format: spec.format,
      evidenceIds: params.evidenceIds ?? [],
      createdById: params.actorId,
      approvedById:
        isApprovedStatus(params.approvalStatus) && params.approvedById
          ? params.approvedById
          : undefined,
      fileSizeBytes: contentBytes,
      checksum,
      disclaimer:
        "Draft for internal review — not a final professional opinion or certification.",
      metadata: {
        entityType: params.entityType,
        entityId: params.entityId,
        opportunityId: params.opportunityId,
        accountId: params.accountId ?? null,
        reviewStatus: params.reviewStatus ?? null,
        approvalStatus: params.approvalStatus ?? null,
        outputTypeId: params.outputTypeId,
        registryProductSlug: "sales",
        organizationId: params.organizationId,
        platformOrganizationId: params.platformOrganizationId ?? null,
        href: params.href,
        ...params.metadata,
      },
    })

    await writeCoreSalesAuditEvent({
      tenantId: params.organizationId,
      eventType: "output.generated",
      actorId: params.actorId,
      actorRole: params.actorRole,
      resourceType: "OutputDocument",
      resourceId: output.id,
      opportunityId: params.opportunityId,
      accountId: params.accountId ?? undefined,
      summary: `Sales output generated: ${params.outputTypeId}`,
      metadata: {
        outputTypeId: params.outputTypeId,
        entityType: params.entityType,
        entityId: params.entityId,
        reviewStatus: params.reviewStatus ?? null,
        approvalStatus: params.approvalStatus ?? null,
      },
    })

    let finalOutput = output
    if (requiresApproval) {
      finalOutput = await outputService.submitForReview(output.id)
    }
    if (isApprovedStatus(params.approvalStatus)) {
      finalOutput = await outputService.approve(
        output.id,
        params.approvedById ?? params.actorId,
      )
    }
    if (spec.markExported) {
      finalOutput = await outputService.markExported(
        output.id,
        buildFileUrl(params.opportunityId, params.outputTypeId),
        checksum,
      )
      await writeCoreSalesAuditEvent({
        tenantId: params.organizationId,
        eventType: "output.exported",
        actorId: params.actorId,
        actorRole: params.actorRole,
        resourceType: "OutputDocument",
        resourceId: output.id,
        opportunityId: params.opportunityId,
        accountId: params.accountId ?? undefined,
        summary: `Sales output exported: ${params.outputTypeId}`,
        metadata: {
          outputTypeId: params.outputTypeId,
          entityType: params.entityType,
          entityId: params.entityId,
          checksum,
        },
      })
    }

    registerOutputQueueEntry({
      id: `sales-out-${params.entityId}-${params.outputTypeId}`,
      organizationId: params.organizationId,
      productSlug: "sales",
      outputTypeId: params.outputTypeId,
      labelAr: `${definition?.labelAr ?? params.outputTypeId} — ${params.opportunityName}`,
      labelEn: `${definition?.labelEn ?? params.outputTypeId} — ${params.opportunityName}`,
      resourceType: params.entityType,
      resourceId: params.entityId,
      status: queueStatus({
        outputTypeId: params.outputTypeId,
        approvalStatus: params.approvalStatus,
        exported: spec.markExported,
      }),
      requiresApproval,
      href: params.href,
    })

    return finalOutput
  } catch (error) {
    if (params.strict) {
      throw error
    }
    return null
  }
}

export async function syncApprovedSalesOutputsToCore(params: {
  organizationId: string
  platformOrganizationId?: string | null
  opportunityId: string
  opportunityName: string
  accountId?: string | null
  accountName?: string | null
  actorId: string
  actorRole: string
  actorName?: string | null
  reviewStatus?: string | null
  approvalStatus?: string | null
  approvedById?: string | null
  stage?: string | null
  valueEstimate?: number | null
  evidenceIds?: string[]
  evidenceCount?: number
  href: string
}): Promise<void> {
  const outputTypes = getOutputsByProduct("sales")
  const snapshotBase = {
    organizationId: params.organizationId,
    opportunityId: params.opportunityId,
    opportunityName: params.opportunityName,
    accountId: params.accountId,
    accountName: params.accountName,
    stage: params.stage,
    reviewStatus: params.reviewStatus,
    approvalStatus: params.approvalStatus,
    valueEstimate: params.valueEstimate,
    evidenceCount: params.evidenceCount,
  }

  await Promise.all(
    outputTypes.map(async (outputType: { id: string }) => {
      const outputTypeId = outputType.id as SalesOutputTypeId
      if (!OUTPUT_SPECS[outputTypeId]) return

      const content = buildSalesOutputSnapshotContent({
        ...snapshotBase,
        outputTypeId,
      })

      await syncSalesOutputToCore({
        organizationId: params.organizationId,
        platformOrganizationId: params.platformOrganizationId,
        opportunityId: params.opportunityId,
        opportunityName: params.opportunityName,
        accountId: params.accountId,
        accountName: params.accountName,
        actorId: params.actorId,
        actorRole: params.actorRole,
        actorName: params.actorName,
        entityType: "SalesOpportunity",
        entityId: params.opportunityId,
        outputTypeId,
        content,
        reviewStatus: params.reviewStatus,
        approvalStatus: params.approvalStatus,
        approvedById: params.approvedById,
        evidenceIds: params.evidenceIds,
        href: params.href,
        strict: false,
      })
    }),
  )
}
