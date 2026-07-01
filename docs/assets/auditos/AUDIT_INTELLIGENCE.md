# Audit Intelligence Layer — AuditOS 2.0 Phase 9

**Status:** Implemented (feature-flagged)  
**UI:** Notes tab — Audit Intelligence panel  
**Flag:** `audit.intelligence` / `FF_AUDIT_INTELLIGENCE=true`

## Purpose

Governed **disclosure enrichment** for notes carrying **rule citations** (`RULE_CITATION|…` markers from Phase 8 disclosure auto-generation). Uses sovereign `runInference()` — never auto-approves notes.

Trust principle: **AI assists. Humans decide. Evidence governs.**

## Module Layout

| File | Role |
|------|------|
| `types.ts` | Enrichment input/result types, idempotency marker |
| `enrichment-builder.ts` | Deterministic assistive draft sections |
| `intelligence-engine.ts` | Run inference, persist enrichment + AI output log |
| `index.ts` | Feature flag + post-FS-rebuild hook |

## Governance Task

New task type: **`disclosure_enrichment`**

- Registered deterministic handler: `disclosure-enrichment-handler.ts`
- `humanApprovalRequired: true`, `outputBoundary: draft_only`
- Hybrid routing: cloud by default (local in air-gapped via runtime policy)

## Bridge Migration

`audit-ai-bridge.ts` now calls **`runInference()`** instead of `aiOrchestrator.generate()` directly — runtime mode policy enforced (Phase 1 AI foundation).

## Enrichment Rules

| Condition | Action |
|-----------|--------|
| Note has `RULE_CITATION` markers | Candidate |
| Status `draft` or `needs_info` | Eligible |
| Already contains `<!-- intelligence-enriched -->` | Skip (idempotent) |
| Status `reviewed` / `approved` | Skip |

After enrichment:

- Note content appended with assistive section
- Status → `needs_info`, `aiDrafted: true`
- `AuditAiOutput` record `note_enrichment` for audit trail

## Integration

### After FS rebuild (`db/index.ts`)

`rebuildFinancialStatementsForEngagement` → **`maybeRunAuditIntelligenceAfterDisclosure`**

### Manual run

Notes tab → «تشغيل الإثراء» → `runAuditIntelligenceAction`

## Local Testing

```env
FF_AUDIT_INTELLIGENCE=true
```

Notes must include rule citation markers in `missingInformation` (from Phase 8 disclosure auto or manual seed).

## Phase 11 Handoff

Mind Map UI should read reporting graph; capture `GraphSnapshot` at approval milestone.

## Known Limitations

- Requires rule citations on notes (Phase 8 dependency)
- Deterministic fallback when inference fails
- Does not auto-run analytical review or findings intelligence (future waves)
- Flag off by default
