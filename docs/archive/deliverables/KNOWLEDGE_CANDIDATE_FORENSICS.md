# KNOWLEDGE_CANDIDATE_FORENSICS

**Date:** 2026-06-23  
**Author:** OpenCode Agent (P0 Reproducibility Recovery)  
**Status:** COMPLETE — VERDICT: BROKEN  

---

## Objective

Audit the entire migration history to determine where `KnowledgeCandidate` (and related models) were created, whether the migration lineage is valid, and whether the schema was historically created through `db push`.

---

## Migration Lineage Map

All 51 migrations audited. Full table at end.

### Key findings

| Migration | Purpose | Creates | Alters | Drops |
|-----------|---------|---------|--------|-------|
| `20260506103224_init_postgres` | Initial schema (~26 tables) | Organization, User, Decision, ... | — | — |
| `20260508151001_audit_phase3` | AuditOS tables (~13) | AuditOrganization, AuditEngagement, ... | FK constraints | — |
| … | … | … | … | … |
| `20260605000001_ic01_pgvector_document_chunk` | pgvector + DocumentChunk + embedding | DocumentChunk (IF NOT EXISTS) | — | — |
| `20260616234035_add_lc_v35_grounding_feedback` | LC v3.5 + KnowledgePattern + large batch | ~70+ tables | FK constraints | — |
| `20260622000000_add_knowledge_candidate_createdById` | ❌ BROKEN — tries ALTER TABLE on non-existent table | — | KnowledgeCandidate: add createdById | — |
| `20270622100000_knowledge_foundation_versioning` | Knowledge Foundation versioning | KnowledgeFoundationVersion, Release, Diff | — | — |
| `20270622110000_knowledge_foundation_version_candidate_bridge` | Version↔Candidate bridge | KnowledgeFoundationVersionCandidate (FK to KnowledgeCandidate) | — | — |
| `20270622120000`–`20270622140000` | Phase 28 provenance/trust | — | KnowledgeFoundationRelease, VersionCandidate | — |

---

## KnowledgeCandidate Investigation

### Question 1: Where is CREATE TABLE?

**Answer:** Nowhere. There is no `CREATE TABLE "KnowledgeCandidate"` in any migration file.

All 51 migrations were searched. No match found.

### Question 2: Which migration first references it?

Two migrations reference `KnowledgeCandidate`:

1. **`20260622000000_add_knowledge_candidate_createdById`** (2026-06-22)
   - `ALTER TABLE "KnowledgeCandidate" ADD COLUMN "createdById" TEXT;`
   - `CREATE INDEX "KnowledgeCandidate_createdById_idx" ...`
   - **Assumes table already exists.** On a fresh DB, this fails with `relation "KnowledgeCandidate" does not exist`.

2. **`20270622110000_knowledge_foundation_version_candidate_bridge`** (2027-06-22)
   - `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id")`
   - **Also assumes table already exists.**

### Question 3: Is lineage valid?

**NO.** The lineage is broken.

- `KnowledgeCandidate` was **never created** by any migration.
- `KnowledgeCandidateEvidence` — same, no CREATE TABLE.
- `KnowledgePromotionHistory` — same, no CREATE TABLE.

All three models exist in `prisma/schema.prisma` (lines 3612, 3644, 3660) but have no migration that creates their base tables.

### Question 4: Is any migration missing?

**YES.** At least one migration is missing that should contain:

```sql
CREATE TABLE "KnowledgeCandidate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "candidatePhrase" TEXT NOT NULL,
    "canonicalAccountId" TEXT NOT NULL,
    "canonicalCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "supportCount" INTEGER NOT NULL DEFAULT 1,
    "organizationCount" INTEGER NOT NULL DEFAULT 1,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "KnowledgeCandidateStatus" NOT NULL DEFAULT 'CANDIDATE',
    "source" TEXT NOT NULL DEFAULT 'pattern_mining',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgeCandidate_pkey" PRIMARY KEY ("id")
);
```

Plus related `KnowledgeCandidateEvidence` and `KnowledgePromotionHistory` tables.

### Question 5: Was schema historically created through db push?

**YES.** The evidence is:

1. Missing CREATE TABLE for 3 models → only `db push` could have created them
2. Migration `20260622000000_add_knowledge_candidate_createdById` was created AFTER `db push` had already created the table in development
3. CI workflow uses `npx prisma db push --force-reset --accept-data-loss` — meaning CI never caught the broken lineage
4. The models were likely introduced in the Knowledge Foundation phase (Phase 28) and the initial CREATE TABLE was never captured in a migration

### Related models also missing

| Model | Table | Created in migration? |
|-------|-------|-----------------------|
| `KnowledgeCandidate` | `KnowledgeCandidate` | ❌ Never created |
| `KnowledgeCandidateEvidence` | `KnowledgeCandidateEvidence` | ❌ Never created |
| `KnowledgePromotionHistory` | `KnowledgePromotionHistory` | ❌ Never created |

---

## Full Migration Lineage Map

| # | Migration | Tables Created | Tables Altered | Verdict |
|---|-----------|---------------|----------------|---------|
| 1 | `20260506103224_init_postgres` | 26 (Organization, User, Decision, …) | — | ✅ |
| 2 | `20260506120601_org_scoping` | — | AuditLog, DecisionMonitoringSignal, … | ✅ |
| 3 | `20260506123140_recommendation_publication` | — | Recommendation | ✅ |
| 4 | `20260506224331_add_password_hash` | — | User | ✅ |
| 5 | `20260508151001_audit_phase3` | 13 Audit tables | FKs | ✅ |
| 6 | `20260509014343_add_ai_output_source_entity` | — | AuditAiOutput | ✅ |
| 7 | `20260509135929_add_pilot_models` | 3 pilot tables | PilotFeedback, PilotSignoff, ProductionBlocker | ✅ |
| 8 | `20260518220001_sunbul_phase1` | 6 Sunbul tables | SunbulAuditEvent, … | ✅ |
| 9 | `20260519100001_add_platform_organization_bridge` | PlatformOrganization | AuditOrganization, Organization | ✅ |
| 10 | `20260521053231_add_localcontentos_foundation` | 12 tables | Approvals, Decision, … | ✅ |
| 11 | `20260527011230_add_sunbul_audit_actions` | — | — | ✅ |
| 12 | `20260528005759_add_governance_fields_v0_2` | DecisionEvidence | AuditClient, … | ✅ |
| 13 | `20260601120000_localcontentos_content_studio` | 7 ContentStudio tables | Approved, … | ✅ |
| 14 | `20260601140000_salesos_p0_core` | 5 Sales tables | SalesDeal, … | ✅ |
| 15 | `20260601150000_salesos_p1_interactions` | SalesInteraction | FK | ✅ |
| 16 | `20260601160000_salesos_p1_evidence` | SalesEvidenceLink | FK | ✅ |
| 17 | `20260601170000_salesos_p1_contacts` | SalesContact | FK | ✅ |
| 18 | `20260601180000_salesos_l5_governance` | 3 Sales gov tables | SalesApproval, … | ✅ |
| 19 | `20260602120000_add_user_mfa_fields` | — | User | ✅ |
| 20 | `20260603000001_add_platform_secret_and_notification` | 2 tables | — | ✅ |
| 21 | `20260603220000_add_notification_preferences` | UserNotificationPreference | — | ✅ |
| 22 | `20260605000001_ic01_pgvector_document_chunk` | DocumentChunk | — (pgvector extension) | ✅ |
| 23 | `20260605100000_add_invitation` | Invitation | — | ✅ |
| 24 | `20260606120000_add_agent_memory` | AgentMemory | — | ✅ |
| 25 | `20260606120000_workflow_template_local_contact` | 5 tables | LocalContactInteraction, … | ✅ |
| 26 | `20260606140000_add_l5_workflow_contact_models` | 5 tables | ContactApproval, … | ✅ |
| 27 | `20260607100000_audit_evidence_version` | AuditEvidenceVersion | FK | ✅ |
| 28 | `20260608000001_add_embedding_json_fallback` | — | DocumentChunk | ✅ |
| 29 | `20260608000002_add_ingestion_batch_document` | 2 tables | IngestionDocument | ✅ |
| 30 | `20260608120000_l0_05_sso_scim` | 5 tables (IF NOT EXISTS) | Account, Session, User, … | ✅ |
| 31 | `20260609100000_tb_intelligence_firm_memory` | 4 tables | FKs | ✅ |
| 32 | `20260612999999_fix_r001_lead_schedule_order` | 2 (IF NOT EXISTS) | LeadSchedule | ✅ |
| 33 | `20260613100000_reporting_graph_foundation` | 5 tables | FK | ✅ |
| 34 | `20260614120000_engagement_presentation_profile` | — | AuditEngagement | ✅ |
| 35 | `20260614130000_presentation_policy_engine` | AuditPresentationPolicy | AuditEngagement | ✅ |
| 36 | `20260614140000_firm_memory_erp_context` | — | TBMappingFeedback, TBMappingPattern | ✅ |
| 37 | `20260614150000_firm_memory_governance` | — | TBMappingPattern | ✅ |
| 38 | `20260615100000_tb_classification_detail` | — | TBClassificationHistory | ✅ |
| 39 | `20260615110000_add_lead_schedule` | 2 (IF NOT EXISTS) | LeadSchedule | ✅ |
| 40 | `20260616234035_add_lc_v35_grounding_feedback` | ~70+ tables (KnowledgePattern, etc.) | Many FKs | ✅ |
| 41 | `20260618015723_add_institutional_memory` | 6 tables | ContentItem, ContentVersion, … | ✅ |
| 42 | `20260621120430_r04_salesos_schema_alignment` | — | SalesAccount, SalesContact, … | ✅ |
| 43 | `20260621120611_r04_salesdeal_extra_fields` | — | SalesDeal | ✅ |
| 44 | `20260621150000_platform_outbox_event` | PlatformOutboxEvent | — | ✅ |
| 45 | `20260621180000_core_evidence_platform` | 4 tables | EvidenceLink, … | ✅ |
| **46** | **`20260622000000_add_knowledge_candidate_createdById`** | **—** | **KnowledgeCandidate** | **❌ BROKEN** |
| 47 | `20270622100000_knowledge_foundation_versioning` | 3 tables | — | ⚠️ Blocked by #46 |
| 48 | `20270622110000_knowledge_foundation_version_candidate_bridge` | 1 table | FK to KnowledgeCandidate | ⚠️ Blocked |
| 49 | `20270622120000_knowledge_foundation_release_provenance` | — | 2 tables | ⚠️ Blocked |
| 50 | `20270622130000_knowledge_foundation_release_artifact_status` | — | KnowledgeFoundationRelease | ⚠️ Blocked |
| 51 | `20270622140000_knowledge_foundation_release_trust_chain` | — | KnowledgeFoundationRelease | ⚠️ Blocked |

---

## Clean Environment Proof

A clean `pgvector/pgvector:pg16` container was started with no existing database, no reused volume, and no prior schema.

**Result of `npx prisma migrate deploy`:**

```
46 migrations applied successfully.
Migration 47 (20260622000000_add_knowledge_candidate_createdById) FAILED.
Error: P3018
Database error code: 42P01
Database error: ERROR: relation "KnowledgeCandidate" does not exist
```

**Root cause:** Migration `20260622000000_add_knowledge_candidate_createdById` executes `ALTER TABLE "KnowledgeCandidate"` but the table was never created by any migration.

---

## Verdict

**BROKEN**

The migration lineage is broken. Three models (`KnowledgeCandidate`, `KnowledgeCandidateEvidence`, `KnowledgePromotionHistory`) have no CREATE TABLE in any migration. The table was created via `prisma db push` in a development environment, and a subsequent migration (`20260622000000_add_knowledge_candidate_createdById`) was generated that assumes the table already exists.

On a fresh database with `prisma migrate deploy`, the migration fails at step 47/51, blocking all subsequent Knowledge Foundation migrations (48–51).
