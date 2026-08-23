/**
 * E2E Test: IFRS RAG Integration (Phase 1)
 *
 * Tests the complete flow from rule check → RAG search → citation display.
 * Covers: RAG enrichment, empty rules, graceful degradation on RAG failure.
 */

import type { IfrsKnowledgeRule } from "../types"
import type { IfrsEvaluationContext } from "../ifrs-rule-checks"

// Mock the RAG retriever before importing anything that uses it
jest.mock("@/lib/core/knowledge/rag/rag-retriever", () => ({
  searchChunks: jest.fn().mockResolvedValue([
    {
      chunkId: "chunk-1",
      documentId: "ifrs-kf-ias-2",
      content:
        "[IAS 2 | IAS 2:2024 | IAS 2.9 | measurement] Inventories shall be measured at the lower of cost and net realisable value.",
      metadata: { standardCode: "IAS 2", paragraphRef: "IAS 2.9" },
      similarity: 0.85,
    },
  ]),
}))

import { runIfrsRulesWithRag } from "@/actions/audit/ifrs-rule-actions"

describe("IFRS RAG E2E", () => {
  const sampleRules: IfrsKnowledgeRule[] = [
    {
      ruleId: "IAS-2.9",
      paragraphReference: "IAS 2.9",
      ruleText:
        "Inventories shall be measured at the lower of cost and net realisable value.",
      topic: "measurement",
      standardCode: "IAS 2",
      versionLabel: "IAS 2:2024",
    },
    {
      ruleId: "IAS-2.10",
      paragraphReference: "IAS 2.10",
      ruleText: "Cost of inventories shall comprise all costs of purchase.",
      topic: "cost-components",
      standardCode: "IAS 2",
      versionLabel: "IAS 2:2024",
    },
  ]

  const baseCtx = {
    engagementId: "test-engagement",
    engagementStatus: "active",
    reportingFramework: "IFRS",
    currencyCode: "SAR",
    statementTypes: ["balanceSheet", "incomeStatement"],
    statements: [],
    mappings: [],
    tbLines: [],
    disclosureNoteCount: 5,
  }

  beforeEach(() => {
    const { searchChunks } = jest.requireMock("@/lib/core/knowledge/rag/rag-retriever") as {
      searchChunks: jest.Mock
    }
    searchChunks.mockReset()
    searchChunks.mockResolvedValue([
      {
        chunkId: "chunk-1",
        documentId: "ifrs-kf-ias-2",
        content:
          "[IAS 2 | IAS 2:2024 | IAS 2.9 | measurement] Inventories shall be measured at the lower of cost and net realisable value.",
        metadata: { standardCode: "IAS 2", paragraphRef: "IAS 2.9" },
        similarity: 0.85,
      },
    ])
  })

  it("runs rules with RAG and returns citations", async () => {
    const result = await runIfrsRulesWithRag({
      engagementId: "test-engagement",
      organizationId: "platform",
      rules: sampleRules,
      ctx: baseCtx,
    })

    expect(result.ruleCount).toBe(2)
    expect(result.citationCount).toBeGreaterThanOrEqual(1)
    expect(result.evaluations[0].ragCitations).toBeDefined()
    expect(result.evaluations[0].ragCitations?.[0].standardCode).toBe("IAS 2")
  })

  it("handles empty rules gracefully", async () => {
    const result = await runIfrsRulesWithRag({
      engagementId: "test-engagement",
      organizationId: "platform",
      rules: [],
      ctx: baseCtx,
    })

    expect(result.ruleCount).toBe(0)
    expect(result.evaluations).toEqual([])
  })

  it("continues even if RAG fails for one rule", async () => {
    const { searchChunks } = jest.requireMock("@/lib/core/knowledge/rag/rag-retriever") as {
      searchChunks: jest.Mock
    }
    searchChunks.mockImplementation(async (query: string) => {
      if (query.includes("cost-components")) {
        throw new Error("RAG timeout")
      }
      return [
        {
          chunkId: "chunk-1",
          documentId: "ifrs-kf-ias-2",
          content: "test",
          metadata: { standardCode: "IAS 2" },
          similarity: 0.85,
        },
      ]
    })

    const result = await runIfrsRulesWithRag({
      engagementId: "test-engagement",
      organizationId: "platform",
      rules: sampleRules,
      ctx: baseCtx,
    })

    expect(result.ruleCount).toBe(2)
    // Both evaluations still have valid status (no crash from RAG failure)
    result.evaluations.forEach((e) => {
      expect(e.status).toBeDefined()
      expect(e.messageAr).toBeDefined()
      expect(e.messageEn).toBeDefined()
    })
    // One rule may have citations, one may not — both paths must survive
    const total = result.evaluations.length
    expect(total).toBe(2)
  })
})
