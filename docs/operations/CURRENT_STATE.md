# CURRENT_STATE — AI Runtime + TB Intelligence Program

**Date:** 2026-06-09  
**Program:** AQLIYA Parallel Execution — Discovery Gate  
**Authority:** [`PRODUCT_STATUS_MATRIX.md`](../source-of-truth/PRODUCT_STATUS_MATRIX.md)  
**ADR:** [`ADR-001-AI-RUNTIME-STRATEGY.md`](../architecture/ADR-001-AI-RUNTIME-STRATEGY.md) (pending sign-off at discovery completion)

---

## ExistingModules

| Module | Path | Status | Notes |
|--------|------|--------|-------|
| AI Orchestrator | `src/lib/ai/orchestrator.ts` | L4 | Default deterministic; real providers gated by `FF_AI_REAL_PROVIDERS` |
| Cloud Provider | `src/lib/ai/providers/cloud-provider.ts` | L3 stub | `execute()` throws when configured |
| Local Provider | `src/lib/ai/providers/local-provider.ts` | L0 stub | Always unavailable |
| OpenAI / Anthropic | `src/lib/ai/providers/openai-provider.ts`, `anthropic-provider.ts` | L3 | Delegate to CloudAIProvider |
| Integration layer | `src/lib/integration/` | L4 | Tenant credentials; not wired into orchestrator singleton |
| TB Upload | `src/lib/audit/services.ts` → `uploadTrialBalance` | L5 | Real DB persist |
| Account Mapping | `AuditAccountMapping` + mapping UI | L5 | Manual/seed; no auto-suggest on upload |
| FS Generation | `src/lib/audit/db/index.ts` → `buildStatementLinesFromMappings` | L5 | Requires confirmed mappings |
| COA | `AuditCanonicalAccount` + `prisma/seed-audit.ts` | L5 | ~23 IFRS-for-SMEs accounts |
| Mock AIService | `src/lib/audit/ai-service.ts` | L1 mock | Must be replaced in Cycle 1 |
| Governance metadata | `src/lib/ai/governed-ai-metadata.ts` | L4 | Human review framing |
| RAG / pgvector | `src/lib/ai/retrieval/`, IC-01 migration | L4 | Cycle 5 scope for this program |

---

## DoNotRebuild

Do **not** create parallel implementations of:

- `src/lib/ai/orchestrator.ts` — extend, do not replace
- `src/lib/audit/db/index.ts` FS engine — call `rebuildFinancialStatementsForEngagement`
- `AuditCanonicalAccount` seed table — extend via `knowledge/chart-of-accounts/` importer
- `src/lib/integration/` — extend factory registry; do not create `src/lib/integrations/`
- `/auditos/*` demo routes — frozen mock
- SalesOS, WorkflowOS product surfaces — bugfix only per Director rules

---

## KnownGaps (updated 2026-06-09 post-implementation)

Resolved in this program cycle:

- Firm Memory tables + TB upload → mapping pipeline
- `/settings/ai`, hybrid router, Ollama local provider
- Mapping UI source badge + LC Mapping hints on upload
- `TB.xlsx` pilot upload on `eng-gulf-2025` (211 accounts)
- Bulk confirm suggested mappings + single FS rebuild (`bulkConfirmSuggestedMappingsAction`)
- Audit engagement ↔ LC verification cross-links (`LcTbSignalsCard` + `/verification`)

Remaining:

1. Production migration baseline (`migrate deploy` P3005 on existing DB — use `db push` for dev only)
2. Full `npm run build` / browser E2E on mapping + FS after confirm
3. ~~LC verification matrix import covers checklist items; not yet wired to LocalContentOS project UI~~ → `/local-content/projects/[projectId]/verification` (36-item checklist + TB signals bridge)
4. Odoo connector code exists; ERP live sync not validated end-to-end
8. Two `AIProviderId` enums (`src/lib/ai/types.ts` vs `src/lib/integration/types.ts`)

---

## SchemaReality

| Model | In schema.prisma | In migrations |
|-------|------------------|---------------|
| `TenantIntegration` | Yes | **No** — Pre-Cycle 0 required |
| `TBMappingPattern` | No (planned) | Pre-Cycle 0 |
| `TBMappingFeedback` | No (planned) | Pre-Cycle 0 |
| `TBClassificationHistory` | No (planned) | Pre-Cycle 0 |
| `ErpConnection` | Yes | **No** — out of Cycle 1 scope |
| `AuditAccountMapping` | Yes | Yes |

---

## Cycle1TouchList

**Allowed modifications (Cycle 1):**

```
docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md
docs/operations/CURRENT_STATE.md
prisma/schema.prisma
prisma/migrations/**
prisma/seed.ts (AI policy defaults only)
src/lib/ai/**
src/lib/tb-intelligence/**
knowledge/chart-of-accounts/**
src/lib/audit/services.ts
src/lib/audit/ai-service.ts
src/lib/audit/db/index.ts (mapping suggest helpers only)
src/actions/audit-actions.ts
src/actions/ai-settings-actions.ts (new)
src/components/audit/mapping/**
src/app/(dashboard)/settings/ai/**
src/app/api/ai/providers/**
.env.example
docs/source-of-truth/ROUTE_STRATEGY.md
docs/source-of-truth/ROUTE_REGISTRY.md
**/__tests__/** (QA agent)
```

---

## CommercialMVP

**Done definition (Abu Al-Khair / accounting firms):**

```text
Upload TB
→ Auto Classification (Firm Memory → COA Rules → Pattern → Cloud AI)
→ Suggested Mapping + Confidence Score
→ Human Review (no auto-commit)
→ Firm Learning on accept
→ Preliminary Financial Statements (income, balance, equity)
```

**Target time:** minutes, not hours.  
**Pitch:** "ارفع ميزان المراجعة، وسنصنّف الحسابات ونبني القوائم المالية الأولية خلال دقائق."

**Cycle 1 mode:** Cloud AI only. Local/Hybrid = Cycle 2 per ADR-001.

---

## Director Sign-off

- [x] Discovery complete — 2026-06-09
- [x] ADR-001 approved — 2026-06-09
