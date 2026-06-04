# AI Capability Matrix

**Status:** Source-of-truth for commercial claims (2026-06-02)  
**Principle:** AI assists. Humans decide. Evidence governs.

| Capability | Code reality | Sold? | Location |
| ---------- | ------------ | ----- | -------- |
| AI orchestrator (provider selection) | Implemented | Yes (assistive) | `src/lib/ai/orchestrator.ts` |
| Deterministic AuditOS handlers (default) | Implemented | Yes | `src/lib/ai/handlers/*`, `src/lib/audit/services.ts` |
| Governance context injection | Implemented (static maps) | Yes | `src/lib/governance/retrieval-router.ts` — **not RAG** |
| OpenAI / Anthropic providers | Implemented, opt-in via env | Yes (with review gates) | `src/lib/ai/providers/*` |
| Cloud / local LLM stubs | Throws or not wired | No | `cloud-provider.ts`, `local-provider.ts` |
| Office AI Assistant | Deterministic generators + Prisma tasks | Yes (shared app) | `src/lib/office-ai/*` |
| Vector RAG / embeddings | Not implemented | **No** | — |
| Institutional Memory product | Not implemented | **No** | — |
| Model Governance registry | Not implemented | **No** | — |
| Autonomous approval / export | Forbidden by design | **No** | Governance docs + UI |

## Naming

- Use **GovernanceContext** (not “retrieval” or “RAG”) for `getGovernanceContext()` output.
- Marketing and demos must not imply institutional memory or air-gapped local LLM packages unless listed in PRODUCT_STATUS_MATRIX as implemented.
