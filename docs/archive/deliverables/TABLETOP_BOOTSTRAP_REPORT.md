# Phase 29 — Tabletop Bootstrap Report

Generated: 2026-06-22T22:35:07.751Z

## Verdict

```text
TABLETOP_READY = YES
```

Local environment is ready for human tabletop execution.

## Environment

- Database: local PostgreSQL (`DATABASE_URL` from `.env`)
- Remote staging: **NOT VERIFIED** (DNS probe previously failed for staging.aqliya.com)
- Schema path: `scripts/platform/tabletop-minimal-schema.sql` (drift recovery when full migrate deploy blocked)

## Migrations

Applied via minimal schema SQL + migrate resolve for pending history:

- `20260616234035_add_lc_v35_grounding_feedback`
- `20260618015723_add_institutional_memory`
- `20260621120430_r04_salesos_schema_alignment`
- `20260621120611_r04_salesdeal_extra_fields`
- `20260621150000_platform_outbox_event`
- `20260621180000_core_evidence_platform`
- `20260622000000_add_knowledge_candidate_createdById`
- `20270622100000_knowledge_foundation_versioning`
- `20270622110000_knowledge_foundation_version_candidate_bridge`
- `20270622120000_knowledge_foundation_release_provenance`
- `20270622130000_knowledge_foundation_release_artifact_status`
- `20270622140000_knowledge_foundation_release_trust_chain`

## Tables Verified

- `KnowledgeFoundationVersion`
- `KnowledgeFoundationRelease`
- `KnowledgeFoundationVersionCandidate`
- `KnowledgeCandidate`

## Lifecycle Evidence

| Step | Status | Detail |
|------|--------|--------|
| tables.verify | PASS | KnowledgeFoundationVersion, KnowledgeFoundationRelease, KnowledgeFoundationVersionCandidate, KnowledgeCandidate |
| migration.resolve | SKIP | 20260616234035_add_lc_v35_grounding_feedback (already applied or not pending) |
| migration.resolve | SKIP | 20260618015723_add_institutional_memory (already applied or not pending) |
| migration.resolve | SKIP | 20260621120430_r04_salesos_schema_alignment (already applied or not pending) |
| migration.resolve | SKIP | 20260621120611_r04_salesdeal_extra_fields (already applied or not pending) |
| migration.resolve | SKIP | 20260621150000_platform_outbox_event (already applied or not pending) |
| migration.resolve | SKIP | 20260621180000_core_evidence_platform (already applied or not pending) |
| migration.resolve | SKIP | 20260622000000_add_knowledge_candidate_createdById (already applied or not pending) |
| migration.resolve | SKIP | 20270622100000_knowledge_foundation_versioning (already applied or not pending) |
| migration.resolve | SKIP | 20270622110000_knowledge_foundation_version_candidate_bridge (already applied or not pending) |
| migration.resolve | SKIP | 20270622120000_knowledge_foundation_release_provenance (already applied or not pending) |
| migration.resolve | SKIP | 20270622130000_knowledge_foundation_release_artifact_status (already applied or not pending) |
| migration.resolve | SKIP | 20270622140000_knowledge_foundation_release_trust_chain (already applied or not pending) |
| actors | PASS | admin=admin@aqliya.com, operator=sara@aqliya.com |
| canonical.accounts | SKIP | required canonical accounts present |
| seed.mining | SKIP | 5 candidates already present |
| lifecycle | SKIP | v1.0.0 already ACTIVE with valid integrity |

## Version

- Version number: `1.0.0`
- Version id: `cmqpseqpx0000tcpqbv097jwz`

## Blockers

_None_

## Next Step

Schedule human tabletop using `docs/operations/knowledge-foundation/TABLETOP_GOVERNANCE_EXERCISE.md` — do **not** skip Exit Gate record templates.
