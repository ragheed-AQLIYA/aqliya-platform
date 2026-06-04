# DecisionOS AI Report

**Date:** 2026-06-04  
**Bridge:** `src/lib/decision/decision-ai-bridge.ts`

## Wiring

| Capability | Integration |
|------------|-------------|
| Decision context | `resolveDecisionAIContext` — title, objectives, alternatives → RAG query |
| Strategic insight | `generateStrategicInsightAction` merges rule-based insight + optional AI draft |
| Task type | `pilot_decision` via `runGovernedProductAI` |
| Retrieval | Governed RAG when `FF_AI_RAG` (orchestrator inject) |

## Scoring / recommendation engine

Existing rule engines **unchanged**:

- `insight.ts`, `what-to-do.ts`, `overview.ts`
- `recommendation.ts`, `intelligence-gate.ts`

AI layer **augments** insight summary when Core enabled — does not replace committee approval or publish gates.

## `mergeDecisionInsightWithAI`

Adds optional fields:

- `aiAugmented: true`
- `aiDraft` — full draft text
- `aiWarnings` — orchestrator warnings
- Appends short AI context block to `summary` (max ~1200 chars)

## Not wired this slice

- `generateWhatToDoNowAction` / `generateExecutiveOverviewAction` (can extend same bridge)
- Recommendation publish automation
- Decision export AI rewrite

## Governance

- `requireDecisionAccess` + `validateIntelligenceGate` preserved
- `pilot_decision` handler: draft-only, human approval warning
- No autonomous final decision

## Readiness

**L4+ DecisionOS** with optional Intelligence Core augmentation on strategic insight.
