# Client #2 — Candidate Requirements

**Audit date:** 2026-06-15  
**Baseline:** `main` @ `75f6633`  
**Authority:** `docs/operations/client-2-firm-memory-checklist.md`, `docs/architecture/AUDIT_KNOWLEDGE_PLATFORM_ASSESSMENT.md`, code inspection

---

## 1. What Qualifies as Client #2?

Per repository documentation, **Client #2 is not a product feature** — it is the **second measurement episode** in Cycle 2 economics validation.

| Definition | Source |
| ---------- | ------ |
| **Primary** | Second engagement (or Year 2 simulation) used to measure **Audit Memory Economics** after Shalfa Year 1 technical baseline | `client-2-firm-memory-checklist.md` |
| **Moat scope** | Same-ERP accumulated audit knowledge — **not** cross-ERP generalization | Checklist + `AUDIT_KNOWLEDGE_PLATFORM_ASSESSMENT.md` |
| **Deliverable** | `Client_2_Economics_Report_v1.md` (manual) with 4 headline KPIs | Cycle 2 audit docs |
| **NOT Client #2** | New product build, different ERP proof, hold-out generalization test, Local AI tuning | Anti-patterns in checklist |

### Valid Client #2 scenarios

| Scenario | Qualifies? | Purpose |
| -------- | ---------- | ------- |
| Same org, same GL chart, new engagement — Year 1 then Year 2 TB | ✅ **Preferred** | Full economics study with time baseline |
| Same org, same chart — Year 2 re-classify on warm memory (Shalfa patterns exist) | ✅ | Reuse + hours measurement |
| Different client entity, **same org**, same account codes | ✅ | Memory keyed by org + account code |
| Different organization tenant | ⚠️ **Invalid for Shalfa memory reuse** | Patterns do not transfer |
| Different ERP / different GL chart | ❌ **Out of scope** | Hold-out ~46.1%; not Cycle 2 economics path |

---

## 2. Same ERP Requirements

| Requirement | Rationale | Evidence |
| ----------- | --------- | -------- |
| Identical or equivalent GL account code set | `TBMappingPattern` unique on `organizationId + clientAccountCode` | `schema.prisma:3361` |
| Same Map1/Map2 hint vocabulary where used | Memory lookup uses `erpMap1Label`, `erpMap2Label`, `nameFingerprint` | Phase 3C fields |
| Same classification rule pack / COA knowledge | Rules + hybrid layer must be comparable Year 1 vs Year 2 | `knowledge/chart-of-accounts/*.json` |
| Do **not** claim cross-ERP | Hold-out validation ~46.1% | `phase-3b1-holdout-validation.json` |

**erpChartKey:** Derived as `client-${clientId}` in `firm-memory-engine.ts` — different audit clients under same org have distinct chart keys but share org-level patterns by account code.

---

## 3. Same Chart-of-Accounts Requirements

| Requirement | Detail |
| ----------- | ------ |
| Account codes must match for memory hit | Lookup primary key is `clientAccountCode` within org |
| Canonical COA | Shared platform `auditCanonicalAccount` — seeded via Shalfa setup or canonical COA seed |
| Presentation profile | Default **`generic`** for new engagements (`db/index.ts:2716`); use `pilot-audited` only if audited reclass rules required (Shalfa-specific GL in `SHALFA_PILOT_PRESENTATION_POLICY_V1`) |
| TB file format | XLSX upload via `uploadTrialBalanceAction` — same column expectations as Shalfa pilot |

**Anti-pattern:** Mixing generic and pilot-audited presentation mid-study without documenting scope change.

---

## 4. Organization Isolation Requirements

| Rule | Implementation |
| ---- | -------------- |
| Firm memory is **org-scoped** | `TBMappingPattern.organizationId` → `Organization.id` |
| Engagement belongs to one audit org | `auditEngagement.organizationId` |
| Memory resolver bridges audit org → platform org | `org-resolver.ts:resolveFirmMemoryOrganizationId` |
| **Do not copy patterns across orgs** | Checklist anti-pattern |
| Tenant access on mutations | `assertEngagementAccess` on audit actions |
| Client #2 must use **same organization** as Shalfa baseline for reuse | Same `organizationId` in firm memory tables |

**Shalfa baseline org:** Evidence shows `organizationId: cmpuy7i0600014kpqcfdcxzba` in `phase-3c-firm-memory-validation.json`. Client #2 should use the same firm/org context unless intentionally testing greenfield (different study).

---

## 5. Governance Prerequisites

| Prerequisite | Status / action |
| ------------ | --------------- |
| Migrations `20260614140000`, `20260614150000` applied | `npx prisma migrate deploy` |
| `npm run seed:audit` + active audit users | Auth for confirm actions |
| RBAC: confirm requires `admin` or `operator` | `audit-actions.ts:206` |
| Audit trail on confirm | `mapping.confirmed` events |
| Phase 3D governance validation script | `npm run phase-3d:validate-governance` |
| Do not run Shalfa backfill on Client #2 data | Checklist §Onboarding |

---

## 6. TRUSTED Pattern Prerequisites

From `firm-memory-governance.ts`:

| Threshold | Value |
| --------- | ----- |
| Minimum hit count | **≥ 5** (`MEMORY_TRUST_MIN_HIT_COUNT`) |
| Minimum distinct reviewers | **≥ 2** (`MEMORY_TRUST_MIN_REVIEWERS`) |
| Freshness | Last confirm/use within **12 months** |
| Auto-suggest eligibility | TRUSTED status + confidence threshold |

**Shalfa baseline:** 578 CONFIRMED, **0 TRUSTED** — expected after single-reviewer backfill (`TB_MEMORY_KPI_BASELINE.md`).

**Client #2 operational requirement:**

1. Assign **≥ 2 reviewers** before Year 2 pass.  
2. Same account confirmed across engagements/periods to increment `hitCount`.  
3. Second reviewer ID merged via `mergeReviewerIds` on each confirm.  
4. Expect TRUSTED growth **over time**, not necessarily on first Year 2 upload.

---

## Candidate Checklist (Go/No-Go before selection)

- [ ] Same organization as memory baseline  
- [ ] Same GL chart / account code universe  
- [ ] Real TB XLSX available for Year 1 and Year 2 passes  
- [ ] ≥ 2 reviewers committed  
- [ ] Spreadsheet time log + exception log ready  
- [ ] Workflow scope defined and frozen (upload → classify → confirm → FS → governance)  
- [ ] Stakeholders accept **no cross-ERP claims** from this study
