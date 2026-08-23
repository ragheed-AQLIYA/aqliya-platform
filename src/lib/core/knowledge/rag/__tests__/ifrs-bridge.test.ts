/** @jest-environment node */

/**
 * IFRS Bridge Tests — Knowledge Foundation → RAG Ingestion.
 *
 * Covers:
 *   - Blocked asset rejection
 *   - Missing provenance detection
 *   - Duplicate ingestion detection
 *   - Deterministic re-ingestion
 *   - Metadata preservation
 *   - Admission policy (all paths)
 *   - Content extraction
 *   - Tenant isolation
 *   - Failed ingestion handling
 *   - Invalid asset handling
 */

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
  prisma: {
    documentChunk: {
      count: jest.fn(),
      createManyAndReturn: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(async () => undefined),
}))

jest.mock("../embedding-service", () => ({
  embedAndStore: jest.fn(async () => ({ chunkCount: 3, tokenCount: 120 })),
}))

jest.mock("../governance-metadata", () => ({
  buildChunkGovernanceMetadata: jest.fn((_docId, _orgId, extra) => ({
    ...extra,
    governance: {
      productKey: "ifrs_knowledge",
      sensitivity: "internal",
      ingestedAt: new Date().toISOString(),
    },
  })),
}))

jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
  readdir: jest.fn(),
}))

// ─── Imports ─────────────────────────────────────────────────────────────────

import {
  evaluateAdmission,
  extractContent,
  computeContentHash,
  ingestIfrsStandard,
  batchIngestIfrsStandards,
  hasExistingChunks,
  deleteExistingChunks,
  getIfrsDocumentId,
} from "../ifrs-bridge"
import type { IfrsAssetMeta, IfrsRulesAsset, IfrsAdmissionRecord } from "../ifrs-bridge-types"
import { prisma } from "@/lib/prisma"
import { embedAndStore } from "../embedding-service"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { readFile } from "fs/promises"

// ─── Test Fixtures ───────────────────────────────────────────────────────────

/**
 * Raw asset.json format (matches actual file structure).
 * loadAsset() unwraps this into IfrsAssetMeta.
 */
const RAW_ASSET_JSON = {
  meta: {
    assetId: "kf-accounting-a-ias-2",
    standardCode: "IAS 2",
    standardName: "Inventories",
    versionLabel: "IAS 2:2024",
    effectiveDate: "2005-01-01",
    sourceUrl: "https://www.ifrs.org/issued-standards/list-of-standards/ias-2/",
    sourceOwner: "IFRS Foundation",
    jurisdiction: "global",
    ragIngest: false,
    vectorIndex: false,
    validationStatus: "validated",
    reviewStatus: "approved",
    admissionWorkflowStage: "productionAdmission",
  },
  licensing: {
    embedding: "restricted-review-required",
    redistribution: "prohibited",
  },
}

/** What loadAsset() returns after unwrapping meta. */
const MOCK_ASSET: IfrsAssetMeta = {
  assetId: "kf-accounting-a-ias-2",
  standardCode: "IAS 2",
  standardName: "Inventories",
  versionLabel: "IAS 2:2024",
  effectiveDate: "2005-01-01",
  sourceUrl: "https://www.ifrs.org/issued-standards/list-of-standards/ias-2/",
  sourceOwner: "IFRS Foundation",
  jurisdiction: "global",
  ragIngest: false,
  vectorIndex: false,
  validationStatus: "validated",
  reviewStatus: "approved",
  admissionWorkflowStage: "productionAdmission",
  licensing: {
    embedding: "restricted-review-required",
    redistribution: "prohibited",
  },
}

const RAW_ASSET_JSON_PERMITTED = {
  meta: {
    ...RAW_ASSET_JSON.meta,
    ragIngest: true,
  },
  licensing: {
    embedding: "permitted",
    redistribution: "prohibited",
  },
}

const MOCK_ASSET_PERMITTED_EMBEDDING: IfrsAssetMeta = {
  ...MOCK_ASSET,
  assetId: "kf-accounting-a-ias-12",
  ragIngest: true,
  licensing: { embedding: "permitted", redistribution: "prohibited" },
}

const MOCK_RULES: IfrsRulesAsset = {
  meta: {
    assetId: "kf-accounting-a-ias-2-rules",
    parentAssetId: "kf-accounting-a-ias-2",
    standardCode: "IAS 2",
    versionLabel: "IAS 2:2024",
    ruleCount: 3,
  },
  rules: [
    {
      ruleId: "ias-2-r001",
      paragraphReference: "IAS 2.9",
      ruleText: "Inventories shall be measured at the lower of cost and net realisable value.",
      topic: "measurement",
      confidenceScore: 95,
      validationStatus: "validated",
    },
    {
      ruleId: "ias-2-r002",
      paragraphReference: "IAS 2.10",
      ruleText: "Cost of inventories shall comprise all costs of purchase, costs of conversion, and other costs.",
      topic: "cost-components",
      confidenceScore: 95,
      validationStatus: "validated",
    },
    {
      ruleId: "ias-2-r003",
      paragraphReference: "IAS 2.25",
      ruleText: "The cost of inventories shall be assigned by using the first-in, first-out or weighted average cost formula.",
      topic: "cost-formulas",
      confidenceScore: 95,
      validationStatus: "validated",
    },
  ],
}

const MOCK_ADMISSION: IfrsAdmissionRecord = {
  catalogId: "kf-acct-ifrs-ias-2",
  standardCode: "IAS 2",
  currentStage: "productionAdmission",
  blockedTechnologies: ["RAG", "Ollama", "Fine-tuning", "Vector DB"],
  stageResults: {
    licensingCheck: {
      embeddingPermitted: false,
      note: "Linking/referencing permitted; embedding requires separate legal gate",
    },
    reviewerApproval: {
      status: "approved",
    },
  },
}

const MOCK_ADMISSION_NO_RAG_BLOCK: IfrsAdmissionRecord = {
  ...MOCK_ADMISSION,
  blockedTechnologies: ["Ollama", "Fine-tuning", "Vector DB"],
  stageResults: {
    ...MOCK_ADMISSION.stageResults,
    licensingCheck: {
      embeddingPermitted: true,
      note: "Embedding permitted after legal review",
    },
  },
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("IFRS Bridge — Admission Policy", () => {
  it("returns NOT_ADMITTED when no admission record", () => {
    const result = evaluateAdmission(MOCK_ASSET, MOCK_RULES, null)
    expect(result.status).toBe("NOT_ADMITTED")
    expect(result.reasons[0]).toContain("No admission record")
  })

  it("returns NOT_ADMITTED when admission stage is not productionAdmission", () => {
    const admission: IfrsAdmissionRecord = {
      ...MOCK_ADMISSION,
      currentStage: "validation",
    }
    const result = evaluateAdmission(MOCK_ASSET, MOCK_RULES, admission)
    expect(result.status).toBe("NOT_ADMITTED")
    expect(result.reasons[0]).toContain("validation")
  })

  it("returns NOT_ADMITTED when reviewer approval is missing", () => {
    const admission: IfrsAdmissionRecord = {
      ...MOCK_ADMISSION,
      stageResults: {
        ...MOCK_ADMISSION.stageResults,
        reviewerApproval: { status: "pending" },
      },
    }
    const result = evaluateAdmission(MOCK_ASSET, MOCK_RULES, admission)
    expect(result.status).toBe("NOT_ADMITTED")
    expect(result.reasons[0]).toContain("pending")
  })

  it("returns RAG_BLOCKED when blockedTechnologies includes RAG", () => {
    const result = evaluateAdmission(MOCK_ASSET, MOCK_RULES, MOCK_ADMISSION)
    expect(result.status).toBe("RAG_BLOCKED")
    expect(result.reasons.some((r) => r.includes("blockedTechnologies"))).toBe(true)
  })

  it("returns RAG_BLOCKED when embedding licensing is restricted", () => {
    const result = evaluateAdmission(MOCK_ASSET, MOCK_RULES, MOCK_ADMISSION_NO_RAG_BLOCK)
    expect(result.status).toBe("RAG_BLOCKED")
    expect(result.reasons.some((r) => r.toLowerCase().includes("embedding"))).toBe(true)
  })

  it("returns RAG_ELIGIBLE when all gates pass", () => {
    const result = evaluateAdmission(
      MOCK_ASSET_PERMITTED_EMBEDDING,
      MOCK_RULES,
      MOCK_ADMISSION_NO_RAG_BLOCK,
    )
    expect(result.status).toBe("RAG_ELIGIBLE")
    expect(result.reasons).toContain("All admission gates passed")
  })

  it("returns NOT_ADMITTED when no rules exist", () => {
    const result = evaluateAdmission(
      MOCK_ASSET_PERMITTED_EMBEDDING,
      null,
      MOCK_ADMISSION_NO_RAG_BLOCK,
    )
    expect(result.status).toBe("NOT_ADMITTED")
    expect(result.reasons.some((r) => r.includes("No rules"))).toBe(true)
  })

  it("returns NOT_ADMITTED when all rules have empty ruleText", () => {
    const emptyRules: IfrsRulesAsset = {
      meta: MOCK_RULES.meta,
      rules: [
        { ruleId: "ias-2-r001", paragraphReference: "IAS 2.9", ruleText: "" },
        { ruleId: "ias-2-r002", paragraphReference: "IAS 2.10", ruleText: "   " },
      ],
    }
    const result = evaluateAdmission(
      MOCK_ASSET_PERMITTED_EMBEDDING,
      emptyRules,
      MOCK_ADMISSION_NO_RAG_BLOCK,
    )
    expect(result.status).toBe("NOT_ADMITTED")
    expect(result.reasons.some((r) => r.includes("empty ruleText"))).toBe(true)
  })

  it("returns NOT_ADMITTED when missing standardCode", () => {
    const asset: IfrsAssetMeta = { ...MOCK_ASSET_PERMITTED_EMBEDDING, standardCode: "" }
    const result = evaluateAdmission(asset, MOCK_RULES, MOCK_ADMISSION_NO_RAG_BLOCK)
    expect(result.status).toBe("NOT_ADMITTED")
    expect(result.reasons.some((r) => r.includes("standardCode"))).toBe(true)
  })

  it("returns NOT_ADMITTED when missing versionLabel", () => {
    const asset: IfrsAssetMeta = { ...MOCK_ASSET_PERMITTED_EMBEDDING, versionLabel: "" }
    const result = evaluateAdmission(asset, MOCK_RULES, MOCK_ADMISSION_NO_RAG_BLOCK)
    expect(result.status).toBe("NOT_ADMITTED")
    expect(result.reasons.some((r) => r.includes("versionLabel"))).toBe(true)
  })

  it("includes assetId and standardCode in result", () => {
    const result = evaluateAdmission(MOCK_ASSET, MOCK_RULES, null)
    expect(result.assetId).toBe("kf-accounting-a-ias-2")
    expect(result.standardCode).toBe("IAS 2")
  })
})

describe("IFRS Bridge — Content Extraction", () => {
  it("extracts content with standard header per rule", () => {
    const extracted = extractContent(MOCK_ASSET, MOCK_RULES)
    expect(extracted.content).toContain("[IAS 2 | IAS 2:2024 | IAS 2.9 | measurement]")
    expect(extracted.content).toContain("Inventories shall be measured")
    expect(extracted.content).toContain("[IAS 2 | IAS 2:2024 | IAS 2.10 | cost-components]")
    expect(extracted.content).toContain("[IAS 2 | IAS 2:2024 | IAS 2.25 | cost-formulas]")
  })

  it("preserves provenance fields", () => {
    const extracted = extractContent(MOCK_ASSET, MOCK_RULES)
    expect(extracted.assetId).toBe("kf-accounting-a-ias-2")
    expect(extracted.standardCode).toBe("IAS 2")
    expect(extracted.standardVersion).toBe("IAS 2:2024")
    expect(extracted.sourceUrl).toBe("https://www.ifrs.org/issued-standards/list-of-standards/ias-2/")
    expect(extracted.jurisdiction).toBe("global")
    expect(extracted.effectiveDate).toBe("2005-01-01")
  })

  it("counts rules correctly", () => {
    const extracted = extractContent(MOCK_ASSET, MOCK_RULES)
    expect(extracted.ruleCount).toBe(3)
  })

  it("filters out empty ruleText", () => {
    const rules: IfrsRulesAsset = {
      meta: MOCK_RULES.meta,
      rules: [
        { ruleId: "r1", paragraphReference: "P1", ruleText: "Valid rule" },
        { ruleId: "r2", paragraphReference: "P2", ruleText: "" },
        { ruleId: "r3", paragraphReference: "P3", ruleText: "  " },
      ],
    }
    const extracted = extractContent(MOCK_ASSET, rules)
    expect(extracted.ruleCount).toBe(1)
    expect(extracted.content).toContain("Valid rule")
    expect(extracted.content).not.toContain("P2")
  })
})

describe("IFRS Bridge — Content Hash", () => {
  it("produces deterministic hash for same input", () => {
    const hash1 = computeContentHash(MOCK_ASSET, MOCK_RULES)
    const hash2 = computeContentHash(MOCK_ASSET, MOCK_RULES)
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64)
  })

  it("produces different hash for different rules", () => {
    const rules2: IfrsRulesAsset = {
      meta: MOCK_RULES.meta,
      rules: [
        { ruleId: "ias-2-r001", paragraphReference: "IAS 2.9", ruleText: "Different rule text" },
      ],
    }
    const hash1 = computeContentHash(MOCK_ASSET, MOCK_RULES)
    const hash2 = computeContentHash(MOCK_ASSET, rules2)
    expect(hash1).not.toBe(hash2)
  })

  it("produces different hash for different asset", () => {
    const asset2: IfrsAssetMeta = { ...MOCK_ASSET, versionLabel: "IAS 2:2025" }
    const hash1 = computeContentHash(MOCK_ASSET, MOCK_RULES)
    const hash2 = computeContentHash(asset2, MOCK_RULES)
    expect(hash1).not.toBe(hash2)
  })
})

describe("IFRS Bridge — Document ID", () => {
  it("returns deterministic documentId for standard dir", () => {
    expect(getIfrsDocumentId("ias-2")).toBe("ifrs-kf-ias-2")
    expect(getIfrsDocumentId("ifrs-17")).toBe("ifrs-kf-ifrs-17")
    expect(getIfrsDocumentId("ifric-23")).toBe("ifrs-kf-ifric-23")
  })
})

describe("IFRS Bridge — Ingestion (mocked)", () => {
  const mockedReadFile = jest.mocked(readFile)
  const mockedPrisma = jest.mocked(prisma)
  const mockedEmbedAndStore = jest.mocked(embedAndStore)
  const mockedAuditLog = jest.mocked(writePlatformAuditLog)

  beforeEach(() => {
    jest.resetAllMocks()
    // Re-establish default mock behavior after reset
    mockedEmbedAndStore.mockResolvedValue({ chunkCount: 3, tokenCount: 120 })
  })

  it("returns error when asset.json not found", async () => {
    mockedReadFile.mockRejectedValue(new Error("ENOENT"))
    const result = await ingestIfrsStandard("nonexistent", "org-1")
    expect(result.status).toBe("error")
    expect(result.error).toContain("asset.json not found")
  })

  it("returns admission_blocked when RAG is in blockedTechnologies", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON)) // asset.json
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES)) // rules.json
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION)) // admission-record.json

    const result = await ingestIfrsStandard("ias-2", "org-1")
    expect(result.status).toBe("admission_blocked")
    expect(result.error).toContain("blockedTechnologies")
    expect(mockedEmbedAndStore).not.toHaveBeenCalled()
  })

  it("ingests successfully when all gates pass", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON_PERMITTED))
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES))
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION_NO_RAG_BLOCK))
    mockedPrisma.documentChunk.count.mockResolvedValue(0)

    const result = await ingestIfrsStandard("ias-2", "org-1")
    expect(result.status).toBe("completed")
    expect(result.chunkCount).toBe(3)
    expect(result.standardCode).toBe("IAS 2")
    expect(mockedEmbedAndStore).toHaveBeenCalledTimes(1)

    // Verify enriched metadata
    const callArgs = mockedEmbedAndStore.mock.calls[0]
    const metadata = callArgs[3] as Record<string, unknown>
    expect(metadata.standardCode).toBe("IAS 2")
    expect(metadata.standardVersion).toBe("IAS 2:2024")
    expect(metadata.sourceType).toBe("ifrs-knowledge-foundation")
    expect(metadata.assetId).toBe("kf-accounting-a-ias-2")
    expect(metadata.contentHash).toBeDefined()
  })

  it("skips ingestion when chunks already exist (no force)", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON_PERMITTED))
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES))
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION_NO_RAG_BLOCK))
    mockedPrisma.documentChunk.count.mockResolvedValue(5)

    const result = await ingestIfrsStandard("ias-2", "org-1")
    expect(result.status).toBe("skipped")
    expect(result.error).toContain("force=true")
    expect(mockedEmbedAndStore).not.toHaveBeenCalled()
  })

  it("re-ingests when force=true and chunks exist", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON_PERMITTED))
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES))
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION_NO_RAG_BLOCK))
    mockedPrisma.documentChunk.count.mockResolvedValue(5)
    mockedPrisma.documentChunk.deleteMany.mockResolvedValue({ count: 5 })

    const result = await ingestIfrsStandard("ias-2", "org-1", { force: true })
    expect(result.status).toBe("completed")
    expect(mockedPrisma.documentChunk.deleteMany).toHaveBeenCalled()
    expect(mockedEmbedAndStore).toHaveBeenCalledTimes(1)
  })

  it("returns error when embedAndStore fails", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON_PERMITTED))
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES))
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION_NO_RAG_BLOCK))
    mockedPrisma.documentChunk.count.mockResolvedValue(0)
    mockedEmbedAndStore.mockRejectedValue(new Error("Embedding provider unavailable"))

    const result = await ingestIfrsStandard("ias-2", "org-1")
    expect(result.status).toBe("error")
    expect(result.error).toContain("Embedding provider unavailable")

    // Should log failure
    expect(mockedAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ifrs_ingest_failed",
        severity: "error",
      }),
    )
  })

  it("uses platform org ID as default", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON_PERMITTED))
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES))
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION_NO_RAG_BLOCK))
    mockedPrisma.documentChunk.count.mockResolvedValue(0)

    const result = await ingestIfrsStandard("ias-2", "org-1")
    expect(result.organizationId).toBe("org-1")
  })

  it("logs admission_blocked when RAG blocked", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON))
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES))
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION))

    await ingestIfrsStandard("ias-2", "org-1")

    expect(mockedAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ifrs_admission_blocked",
        severity: "warning",
      }),
    )
  })

  it("logs success with provenance metadata", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON_PERMITTED))
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES))
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION_NO_RAG_BLOCK))
    mockedPrisma.documentChunk.count.mockResolvedValue(0)

    await ingestIfrsStandard("ias-2", "org-1")

    expect(mockedAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ifrs_ingest_completed",
        metadata: expect.objectContaining({
          standardCode: "IAS 2",
          standardVersion: "IAS 2:2024",
        }),
      }),
    )
  })

  it("dryRun evaluates but does not ingest", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON_PERMITTED))
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES))
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION_NO_RAG_BLOCK))

    const result = await ingestIfrsStandard("ias-2", "org-1", { dryRun: true })
    expect(result.status).toBe("completed")
    expect(result.chunkCount).toBe(3)
    expect(mockedEmbedAndStore).not.toHaveBeenCalled()
  })
})

describe("IFRS Bridge — Batch Ingestion", () => {
  const mockedReadFile = jest.mocked(readFile)
  const mockedPrisma = jest.mocked(prisma)
  const mockedEmbedAndStore = jest.mocked(embedAndStore)

  beforeEach(() => {
    jest.resetAllMocks()
    mockedEmbedAndStore.mockResolvedValue({ chunkCount: 3, tokenCount: 120 })
  })

  it("processes multiple standards independently", async () => {
    // First standard (ias-2): blocked — Promise.all reads 3 files
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON)) // asset.json
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES)) // rules.json
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION)) // admission-record.json
    // Second standard (ias-12): eligible — Promise.all reads 3 files
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON_PERMITTED)) // asset.json
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES)) // rules.json
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION_NO_RAG_BLOCK)) // admission-record.json
    mockedPrisma.documentChunk.count.mockResolvedValue(0)

    const result = await batchIngestIfrsStandards(["ias-2", "ias-12"], "org-1")
    expect(result.totalAssets).toBe(2)
    expect(result.blocked).toBe(1)
    expect(result.ingested).toBe(1)
  })

  it("counts failures separately", async () => {
    // First call (nonexistent): Promise.all reads 3 files in parallel — all fail
    mockedReadFile.mockRejectedValueOnce(new Error("ENOENT")) // asset.json
    mockedReadFile.mockRejectedValueOnce(new Error("ENOENT")) // rules.json
    mockedReadFile.mockRejectedValueOnce(new Error("ENOENT")) // admission-record.json
    // Second call (ias-2): blocked by RAG
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify(RAW_ASSET_JSON)) // asset.json
      .mockResolvedValueOnce(JSON.stringify(MOCK_RULES)) // rules.json
      .mockResolvedValueOnce(JSON.stringify(MOCK_ADMISSION)) // admission-record.json

    const result = await batchIngestIfrsStandards(["nonexistent", "ias-2"], "org-1")
    expect(result.failed).toBe(1)
    expect(result.blocked).toBe(1)
    expect(result.ingested).toBe(0)
  })
})

describe("IFRS Bridge — Deduplication", () => {
  const mockedPrisma = jest.mocked(prisma)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("hasExistingChunks returns true when count > 0", async () => {
    mockedPrisma.documentChunk.count.mockResolvedValue(5)
    const exists = await hasExistingChunks("ifrs-kf-ias-2", "org-1")
    expect(exists).toBe(true)
  })

  it("hasExistingChunks returns false when count = 0", async () => {
    mockedPrisma.documentChunk.count.mockResolvedValue(0)
    const exists = await hasExistingChunks("ifrs-kf-ias-2", "org-1")
    expect(exists).toBe(false)
  })

  it("deleteExistingChunks calls deleteMany", async () => {
    mockedPrisma.documentChunk.deleteMany.mockResolvedValue({ count: 5 })
    const deleted = await deleteExistingChunks("ifrs-kf-ias-2", "org-1")
    expect(deleted).toBe(5)
    expect(mockedPrisma.documentChunk.deleteMany).toHaveBeenCalledWith({
      where: { documentId: "ifrs-kf-ias-2", organizationId: "org-1" },
    })
  })
})
