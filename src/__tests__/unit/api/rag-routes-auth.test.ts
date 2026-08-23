/**
 * RAG API routes — security guard tests.
 *
 * Text-based assertions following the repo pattern used for route
 * verification (see engagement-workflow-routes.test.ts). These verify
 * that the RAG endpoints keep auth guards and never trust
 * client-provided organization IDs.
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const statsRoutePath = resolve(
  __dirname,
  "../../../app/api/knowledge/rag/stats/route.ts",
)
const searchRoutePath = resolve(
  __dirname,
  "../../../app/api/knowledge/rag/search/route.ts",
)

describe("RAG API routes — auth guards", () => {
  const statsRoute = readFileSync(statsRoutePath, "utf-8")
  const searchRoute = readFileSync(searchRoutePath, "utf-8")

  describe("GET /api/knowledge/rag/stats", () => {
    it("imports getCurrentUser from the auth module", () => {
      expect(statsRoute).toContain('from "@/lib/auth"')
      expect(statsRoute).toContain("getCurrentUser")
    })

    it("returns 401 when the session cannot be resolved", () => {
      expect(statsRoute).toMatch(/status:\s*401/)
    })
  })

  describe("POST /api/knowledge/rag/search", () => {
    it("imports getCurrentUser from the auth module", () => {
      expect(searchRoute).toContain('from "@/lib/auth"')
      expect(searchRoute).toContain("getCurrentUser")
    })

    it("returns 401 when the session cannot be resolved", () => {
      expect(searchRoute).toMatch(/status:\s*401/)
    })

    it("derives the search organization server-side, never from the request body", () => {
      // The destructured body must NOT include organizationId
      const bodyDestructure = searchRoute.match(/const\s*\{([^}]*)\}\s*=\s*body/)
      expect(bodyDestructure).not.toBeNull()
      expect(bodyDestructure![1]).not.toContain("organizationId")
      // Retrieval org must be a server-defined constant (shared platform corpus)
      expect(searchRoute).toContain("SHARED_KNOWLEDGE_ORG")
      expect(searchRoute).toContain('SHARED_KNOWLEDGE_ORG = "platform"')
    })

    it("still validates that query is a required string", () => {
      expect(searchRoute).toContain("query is required")
    })
  })
})
