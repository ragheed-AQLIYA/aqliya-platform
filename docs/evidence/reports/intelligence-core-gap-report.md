# Intelligence Core — Gap Report

**Date:** 2026-05-29
**Author:** Agent 2 — AQLIYA Intelligence Core (Platform Build Program)
**Branch:** `eid-sprint-stabilization-2026-05-29`
**Wave:** Wave 2 — Core / Intelligence / Governance (documentation-only)
**Companion spec:** `docs/official/aqliya-intelligence-core-v0.1.md`
**Trust principle:** AI assists. Humans decide. Evidence governs.

---

## 1. Scope Inspected

Narrow, read-only inspection only (Read / Grep / Glob). No heavy commands, no builds, no installs, no schema, no live AI.

**Read in full:**
- `docs/reports/aqliya-full-platform-build-program-plan.md` (Agent 0 master plan)
- `src/lib/ai/orchestrator.ts`, `types.ts`, `prompt-registry.ts`, `README.md`
- `src/lib/ai/providers/{deterministic,cloud,local}-provider.ts`
- `src/lib/ai/handlers/register-handlers.ts`, `evidence-suggestions-handler.ts`
- `src/lib/governance/{runtime-types,retrieval-router,prompt-framework,approval-state,escalation,provenance}.ts`

**Indexed / grepped:**
- `src/lib/ai/**` (12 files), `src/lib/governance/**` (24 files incl. tests + examples)
- `src/lib/audit/services.ts` (orchestrator consumption sites)
- AI-claim scan across `src/app/**`, `src/lib/**` for On-Prem / Air-Gapped / Local AI / autonomous / certified / guaranteed
- `docs/official/` (11 docs), `docs/` intelligence-related theory index

**Not run (Low-Load Execution Protocol):** `npm run build`, `npm run lint`, `npm test`, `npx tsc --noEmit`, `prisma *`, dev server, Docker, broad scans.

---

## 2. Current Reality

### 2.1 What the repo actually proves

| Capability | Reality | Evidence |
| ---------- | ------- | -------- |
| Orchestrator + provider selection | **IMPLEMENTED** | `orchestrator.ts` singleton, `defaultProvider: 'deterministic'`, fallback on error |
| Deterministic provider (default) | **IMPLEMENTED** | `deterministic-provider.ts` `isAvailable()→true`, 5 handlers registered |
| Cloud provider | **PARTIAL** | `cloud-provider.ts` config-gated; `execute()` throws "not yet wired to an external API" |
| Local provider | **STUB** | `local-provider.ts` `isAvailable()→false`; `execute()` throws "Local AI is not implemented" |
| Prompt registry + 6-layer assembly | **IMPLEMENTED** | `prompt-registry.ts` (5/9 tasks), `prompt-framework.ts` builders |
| Governance context per task | **IMPLEMENTED** | `retrieval-router.ts` maps all 9 task types to doctrine/evidence/approval |
| Human approval state machine | **IMPLEMENTED** | `approval-state.ts` `AI_FORBIDDEN_TRANSITIONS`, `isFinalizationAllowed` |
| Escalation ladder | **IMPLEMENTED (not wired into generate)** | `escalation.ts` trigger→level; used by examples/tests, not orchestrator |
| Provenance + explainability | **IMPLEMENTED** | `provenance.ts` `createDraftProvenance`, "Draft — not final" message |
| AuditOS consumption | **IMPLEMENTED** | `services.ts` routes 5 functions through `aiOrchestrator.generate()` |
| Output audit logging | **PARTIAL** | per-action `ai.output_generated` in AuditOS; orchestrator `onGenerate` hook **not activated** |
| Model Governance registry | **DOCUMENTATION-ONLY (L0)** | no code |
| Institutional Memory | **DOCUMENTATION-ONLY (L0)** | no code |

### 2.2 Honest one-line state

The Intelligence Core is **real and governed, but deterministic-by-default**: a rule-based assistance layer wrapped in evidence-aware, draft-only, human-approved, auditable governance. **No live LLM runs by default**; cloud is unwired-and-config-gated; local is a stub.

---

## 3. Gaps

| ID | Gap | Pillar | Severity |
| -- | --- | ------ | -------- |
| IC-G1 | **`onGenerate` audit hook not activated** — no *guaranteed* shared AI audit write; a new product could generate without an AI audit event. | Output audit trail | High |
| IC-G2 | **Escalation not invoked in `generate()`** — `blocked`-level triggers (e.g. `approval_bypass_attempt`) are not enforced in the live path; policy is implicit warnings, not a gate. | Policy layer | High |
| IC-G3 | **Evidence map is a static template** — `retrieval-router.ts` evidence statuses are defaults (`missing`/`partial`), not live reads. Real grounding lives only inside AuditOS handlers; no shared `EvidenceResolver`. | Evidence grounding | High |
| IC-G4 | **Approval enforcement is per-consumer** — correctness depends on each product calling `canTransitionApprovalState(isAi=true)`; no single shared guard, no DB constraint. (Mirrors master-plan G5.) | Human approval gate | Medium |
| IC-G5 | **Prompt registry has no versioning** and no product scoping; AuditOS prompts and a cross-product base are not separated. | Prompt registry | Medium |
| IC-G6 | **Confidence is uncalibrated** — handlers hardcode values (e.g. `0.8`, `0.7`); no shared scale→label map or UI limitation component. | Confidence & limitation labels | Medium |
| IC-G7 | **Safe-suggestion pattern is AuditOS-bound** — no shared `Suggestion` contract / accept-reject lifecycle for other products. | Safe suggestion engine | Medium |
| IC-G8 | **Red-team checks are examples/tests, not a runtime harness** — no automated pre-output self-check invoked by `generate()`. | Red-team checks | Medium |
| IC-G9 | **4 of 9 task types lack prompt builders** (`trial_balance_upload`, `notes_generation`, `pilot_decision`, `approval_review`) — they degrade to deterministic handlers, which is safe but uneven. | Prompt registry | Low |
| IC-G10 | **`modelVersion: 'audit-os-llm-v1'`** labels deterministic rule-based output as "llm" across all 5 handlers + mock/demo data. Honest-labeling risk. | Output labeling | Medium (see R1) |

---

## 4. Proposed Architecture

Full detail in `docs/official/aqliya-intelligence-core-v0.1.md`. Summary:

- **Nine capability pillars**: prompt registry, policy layer, model/provider abstraction, evidence grounding, human-approval gate, output audit trail, confidence/limitation labels, safe suggestion engine, red-team checks (spec §2).
- **Ten shared interfaces** (TypeScript sketches, not implemented): `PromptRegistryEntryV2`, `PolicyDecision`/`PolicyLayer`, `ProviderCapability`/`GovernedAIProvider`, `EvidenceResolution`/`EvidenceResolver`, `GovernedOutput`, `Suggestion`, `ModelRegistryEntry` (L0 target), `InstitutionalMemoryRecord` (L0 target), `RedTeamHarness`, and the `IntelligenceCore` facade (spec §3).
- **Consumption map**: AuditOS (wired today); LocalContentOS, DecisionOS, WorkflowOS (proposed integration points; human approval authority always retained) (spec §4).
- **Trust boundaries**: AI never decides/certifies/finalizes; no On-Prem/Local/Air-Gapped claims; honest model labels (spec §5).

---

## 5. Files Changed

| File | Change |
| ---- | ------ |
| `docs/official/aqliya-intelligence-core-v0.1.md` | **Created** — Intelligence Core architecture spec v0.1 |
| `docs/reports/intelligence-core-gap-report.md` | **Created** — this gap report |

**No** application code, schema, route, config, UI, or single-owner-doc changes. The two single-owner files (`PRODUCT_STATUS_MATRIX.md`, `AGENTS.md`, `aqliya-product-taxonomy-v1.1.md`) were **not** edited.

---

## 6. Commands Run

```text
Read   docs/reports/aqliya-full-platform-build-program-plan.md
Glob   src/lib/ai/**/*.ts , src/lib/governance/**/*.ts , docs/official/*.md
Read   src/lib/ai/{orchestrator,types,prompt-registry,README}.* + providers/* + handlers/{register-handlers,evidence-suggestions-handler}
Read   src/lib/governance/{runtime-types,retrieval-router,prompt-framework,approval-state,escalation,provenance}.ts
Grep   aiOrchestrator|generate( across src/ ; audit-os-llm across src/
Grep   On-Prem|Air-Gapped|Local AI|autonomous|certified|guaranteed across src/app , src/lib
Read   src/app/(marketing)/{platform,deployment}/page.tsx , src/app/(dashboard)/assistant/page.tsx (claim framing)
```

No heavy commands (no build/lint/test/tsc/prisma/dev-server/docker/installs/broad-scans).

---

## 7. Validation Result

| Check | Result |
| ----- | ------ |
| Read/Grep/Glob inspection | **Run — Pass** (state captured accurately) |
| Deliverables created | **Pass** — both docs written |
| Single-owner files untouched | **Pass** — matrix / AGENTS.md / taxonomy not edited |
| Application code / schema / live AI | **Unchanged** (documentation-only wave, by design) |
| `npx tsc --noEmit` / `npm test` / build | **Not run** (Low-Load; delegate to QA agent on a committed tree) |

**Interpretation:** This is a documentation-only deliverable; engineering-green is out of scope and must be re-established by the QA/Release agent on a committed tree. The Agent 0 P0-1 caveat (uncommitted working tree) still applies — code observations here reflect the *working tree*, not committed `6034950`.

---

## 8. Risks

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| **R1** | **Deterministic output mislabeled as "llm".** `modelVersion: 'audit-os-llm-v1'` appears in all 5 handlers (`src/lib/ai/handlers/*`) plus mock/demo data and legacy `src/lib/audit/ai-service.ts`. This implies an LLM produced rule-based output. | Medium | **Soften candidate** (note only — not edited this wave). Rename to an honest token (e.g. `auditos-deterministic-v1`) in a future approved application-code pass; AuditOS owner (Agent 7) coordinates. |
| R2 | **Over-claiming Local / On-Prem / Air-Gapped AI.** Local provider is a stub. | High | Spec §5 forbids the claim. Marketing pages reviewed (`platform`, `deployment`, `security`, `about`) currently label these **"استراتيجي / قيد التخطيط / ليست منتجاً جاهزاً"** (strategic / planned / not a ready product) — acceptable framing today; keep monitoring. |
| R3 | **Over-claiming live AI / autonomy.** Default is deterministic; cloud unwired. | High | Describe as governed-deterministic + optional config-gated cloud. Assistant UI already states "not a chatbot… No autonomous decisions" — good. |
| R4 | **Escalation not enforced at runtime** (IC-G2) could let a `blocked` trigger pass as a mere warning. | Medium | Wire escalation into the policy gate in a future approved pass; until then, consuming products must check escalation explicitly. |
| R5 | **Approval enforcement per-consumer** (IC-G4) — a new product could mis-call the state machine. | Medium | Provide a shared approval guard in the implementation wave; document the non-negotiable rules (spec §4). |
| R6 | **Audit hook inactive** (IC-G1) — a generation could occur without an AI audit event in a non-AuditOS product. | Medium | Activate `onGenerate` first (lowest-load step §9). |

### Unsafe / soften-candidate claims found (active code/UI) — note only, NOT edited

1. **`modelVersion: 'audit-os-llm-v1'`** (R1) — deterministic output labeled "llm". Most concrete item. Located in `src/lib/ai/handlers/*`, `src/lib/audit/ai-service.ts`, `src/lib/audit/mock-data.ts`, `src/app/auditos/demo-data.ts`.
2. **`src/app/(marketing)/platform/page.tsx`** — "AQLIYA Air-Gapped" / "AQLIYA Private" rendered as named product cards. Mitigated by `status: "strategic"` labels and "available to selected clients during development"; borderline — keep the strategic/planned framing explicit.
3. **`src/app/(dashboard)/decisions/[id]/signals/page.tsx`** — "Signals are automatically generated." Low risk (deterministic system signals, not AI decisions), but ensure UI does not imply autonomous AI judgment.

All three are flagged for the responsible product/marketing owners; this agent did **not** edit UI or single-owner files.

---

## 9. Next Lowest-Load Step

**Cheapest, reversible, doc-aligned next action:** in a future *approved* implementation wave, **activate the orchestrator `onGenerate` audit hook** (IC-G1 / R6) so every generation guarantees a shared `ai.output_generated` audit write. It is additive, has no schema impact, and closes the highest-value governance gap with the least risk.

Sequenced thereafter (each approval-gated, see spec §6): (2) wire escalation into a `PolicyDecision` gate; (3) introduce the `EvidenceResolver` interface with AuditOS as first adopter; (4) honest `modelVersion` rename (R1). Cloud `execute()` and any Local AI runtime stay **out of scope** until a security-reviewed, secret-managed phase explicitly authorizes them.

---

## Agent 2 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** (documentation-only, within scope) |
| **Code changed** | No |
| **Schema changed** | No |
| **Live AI connected** | No |
| **Single-owner files edited** | No |
| **Classification** | Governed-deterministic-by-default; cloud PARTIAL; local STUB; Model Governance / Institutional Memory L0 (unchanged — not upgraded) |
| **Deliverables** | `docs/official/aqliya-intelligence-core-v0.1.md`, `docs/reports/intelligence-core-gap-report.md` |

*Agent 2 — AQLIYA Intelligence Core. AI assists. Humans decide. Evidence governs.*
