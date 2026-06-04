import type { AIRequest } from "@/lib/ai/types"
import { injectGovernedRagIntoRequest } from "@/lib/ai/orchestrator-rag-inject"

jest.mock("@/lib/rag/intelligence-core-rag", () => ({
  retrieveGovernedContext: jest.fn(async () => ({
    chunks: [
      {
        chunkId: "c1",
        documentId: "d1",
        content: "Revenue policy excerpt",
        metadata: {},
        similarity: 0.9,
      },
    ],
    query: "revenue recognition",
    organizationId: "org-1",
    evidence: [
      {
        chunkId: "c1",
        documentId: "d1",
        similarity: 0.9,
        rank: 1,
        contentPreview: "Revenue policy",
        governance: { sensitivity: "internal" },
      },
    ],
    ranking: {
      resultCount: 1,
      topSimilarity: 0.9,
      minSimilarityApplied: 0.25,
      avgSimilarity: 0.9,
    },
    governanceSummary: { productKeys: [], sensitivities: ["internal"] },
    retrievedAt: new Date().toISOString(),
  })),
  formatGovernedRAGForPrompt: jest.fn(() => "[Source 1] Revenue policy excerpt"),
  toGovernedRAGPayload: jest.fn(() => ({ query: "revenue recognition" })),
}))

const baseRequest: AIRequest = {
  taskType: "trial_balance_upload",
  taskInput: { query: "revenue recognition" },
  governanceContext: {
    taskType: "trial_balance_upload",
    doctrineReferences: [],
    governanceReferences: [],
    evidenceRequirements: [],
    humanApprovalRequired: false,
    escalationTriggers: [],
    outputBoundary: "draft_only",
    recommendedPromptLayers: [],
  },
  assembledPrompt: { layers: [], fullPrompt: "" },
}

describe("orchestrator-rag-inject", () => {
  const prevRag = process.env.FF_AI_RAG

  beforeEach(() => {
    process.env.FF_AI_RAG = "true"
  })

  afterEach(() => {
    if (prevRag === undefined) delete process.env.FF_AI_RAG
    else process.env.FF_AI_RAG = prevRag
  })

  it("returns request unchanged when ai.rag is off", async () => {
    delete process.env.FF_AI_RAG
    const out = await injectGovernedRagIntoRequest(baseRequest, "org-1")
    expect(out.taskInput.ragContext).toBeUndefined()
  })

  it("returns request unchanged without organizationId", async () => {
    const out = await injectGovernedRagIntoRequest(baseRequest, undefined)
    expect(out.taskInput.ragContext).toBeUndefined()
  })

  it("injects rag fields when flag on and query present", async () => {
    const out = await injectGovernedRagIntoRequest(baseRequest, "rag-test-org")
    expect(out.taskInput.ragContext).toBeDefined()
    expect(out.taskInput.ragEvidence).toBeDefined()
    expect(out.taskInput.ragRanking).toBeDefined()
    expect(out.taskInput.ragGovernance).toBeDefined()
  })
})
