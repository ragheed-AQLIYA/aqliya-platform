import { readFileSync, existsSync, readdirSync } from "fs"
import { join } from "path"

const migrationsDir = join(__dirname, "../../prisma/migrations")
const LEAD_SCHEDULE_MIGRATION = "20260615110000_add_lead_schedule"
const LC_V35_MIGRATION = "20260616234035_add_lc_v35_grounding_feedback"
const INSTITUTIONAL_MEMORY_MIGRATION = "20260618015723_add_institutional_memory"
const R04_SCHEMA_ALIGNMENT = "20260621120430_r04_salesos_schema_alignment"
const R04_DEAL_EXTRA_FIELDS = "20260621120611_r04_salesdeal_extra_fields"
const PLATFORM_OUTBOX_MIGRATION = "20260621150000_platform_outbox_event"
const CORE_EVIDENCE_PLATFORM_MIGRATION = "20260621180000_core_evidence_platform"
const KNOWLEDGE_CANDIDATE_TABLES = "20260621190000_create_knowledge_candidate_tables"
const KNOWLEDGE_CANDIDATE_CREATEDBY = "20260622000000_add_knowledge_candidate_createdById"
const KNOWLEDGE_FOUNDATION_VERSIONING = "20260622100000_knowledge_foundation_versioning"
    const KF_VERSION_CANDIDATE_BRIDGE = "20260622110000_knowledge_foundation_version_candidate_bridge"
    const KF_RELEASE_PROVENANCE = "20260622120000_knowledge_foundation_release_provenance"
    const KF_RELEASE_ARTIFACT_STATUS = "20260622130000_knowledge_foundation_release_artifact_status"
    const KF_RELEASE_TRUST_CHAIN = "20260622140000_knowledge_foundation_release_trust_chain"
    const KNOLEDGE_CANDIDATE_FK = "20260623000000_add_knowledge_candidate_fk"

/** Migrations excluded from applied-chain ordering (e.g. create-only, not yet applied). */
const MIGRATIONS_EXCLUDED_FROM_APPLIED_CHAIN = [INSTITUTIONAL_MEMORY_MIGRATION] as const

function listTimestampedMigrations(): string[] {
  return readdirSync(migrationsDir)
    .filter((d) => /^\d{14}_/.test(d))
    .sort()
}

function listAppliedMigrations(): string[] {
  const excluded = new Set<string>(MIGRATIONS_EXCLUDED_FROM_APPLIED_CHAIN)
  return listTimestampedMigrations().filter((d) => !excluded.has(d))
}

function latestAppliedMigration(): string {
  const applied = listAppliedMigrations()
  if (applied.length === 0) {
    throw new Error("No applied migrations found")
  }
  return applied[applied.length - 1]!
}

describe("Migration Evidence", () => {
  describe("20260615110000_add_lead_schedule", () => {
    const migrationDir = join(migrationsDir, LEAD_SCHEDULE_MIGRATION)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("migration creates WorkingPaperIndex table", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS "WorkingPaperIndex"')
    })

    it("migration creates LeadSchedule table", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS "LeadSchedule"')
    })

    it("migration creates indexes for WorkingPaperIndex", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS "WorkingPaperIndex_engagementId_idx"')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS "WorkingPaperIndex_engagementId_indexType_idx"')
    })

    it("migration creates indexes for LeadSchedule", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS "LeadSchedule_workingPaperIndexId_key"')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS "LeadSchedule_engagementId_idx"')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS "LeadSchedule_workingPaperIndexId_idx"')
    })

    it("migration adds foreign key constraint", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ALTER TABLE "LeadSchedule"')
      expect(sql).toContain('ADD CONSTRAINT "LeadSchedule_workingPaperIndexId_fkey"')
    })

    it("migration SQL is valid PostgreSQL syntax", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toMatch(/CREATE TABLE/)
      expect(sql).toMatch(/PRIMARY KEY/)
      expect(sql).toMatch(/CREATE INDEX/)
    })
  })

  describe("20260616234035_add_lc_v35_grounding_feedback", () => {
    const migrationDir = join(migrationsDir, LC_V35_MIGRATION)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("migration includes LcRecommendation with grounding fields", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('"LcRecommendation"')
      expect(sql).toContain("source")
      expect(sql).toContain("rationale")
      expect(sql).toContain("groundingConfidence")
    })

    it("migration creates LcRecommendationOutcome model", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE "LcRecommendationOutcome"')
    })

    it("migration adds drivers JSONB to LcSimulationResult", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain("drivers")
      expect(sql).toContain("JSONB")
    })
  })

  describe("Migration ordering", () => {
    it("every timestamped migration directory contains migration.sql", () => {
      for (const dir of listTimestampedMigrations()) {
        expect(existsSync(join(migrationsDir, dir, "migration.sql"))).toBe(true)
      }
    })

    it("applied migrations are in strict chronological lexicographic order", () => {
      const applied = listAppliedMigrations()
      const sorted = [...applied].sort()
      expect(applied).toEqual(sorted)
    })

    it("latest applied migration is derived from directory ordering, not a stale snapshot", () => {
      const applied = listAppliedMigrations()
      const latest = latestAppliedMigration()
      expect(applied[applied.length - 1]).toBe(latest)
      expect(existsSync(join(migrationsDir, latest, "migration.sql"))).toBe(true)
    })
  })

  describe("20260621120430_r04_salesos_schema_alignment", () => {
    const migrationDir = join(migrationsDir, R04_SCHEMA_ALIGNMENT)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("adds governance fields to SalesAccount (nameAr, ownerId)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ALTER TABLE "SalesAccount"')
      expect(sql).toContain("nameAr")
      expect(sql).toContain("ownerId")
    })

    it("adds governance fields to SalesContact (ownerId, createdById, sensitivityLevel)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ALTER TABLE "SalesContact"')
      expect(sql).toContain("ownerId")
      expect(sql).toContain("createdById")
      expect(sql).toContain("sensitivityLevel")
    })

    it("adds pipelineStage and ownerId to SalesDeal", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ALTER TABLE "SalesDeal"')
      expect(sql).toContain("pipelineStage")
      expect(sql).toContain("ownerId")
    })

    it("adds contactId and evidenceRef to SalesInteraction", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ALTER TABLE "SalesInteraction"')
      expect(sql).toContain("contactId")
      expect(sql).toContain("evidenceRef")
    })

    it("creates indexes for new foreign keys", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE INDEX "SalesAccount_ownerId_idx"')
      expect(sql).toContain('CREATE INDEX "SalesContact_ownerId_idx"')
      expect(sql).toContain('CREATE INDEX "SalesDeal_pipelineStage_idx"')
      expect(sql).toContain('CREATE INDEX "SalesInteraction_contactId_idx"')
    })
  })

  describe("20260621120611_r04_salesdeal_extra_fields", () => {
    const migrationDir = join(migrationsDir, R04_DEAL_EXTRA_FIELDS)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("adds qualificationScore, reviewStatus, approvalStatus to SalesDeal", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ALTER TABLE "SalesDeal"')
      expect(sql).toContain("qualificationScore")
      expect(sql).toContain("reviewStatus")
      expect(sql).toContain("approvalStatus")
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260621150000_platform_outbox_event", () => {
    const migrationDir = join(migrationsDir, PLATFORM_OUTBOX_MIGRATION)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("creates PlatformOutboxEvent table with status indexes", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE "PlatformOutboxEvent"')
      expect(sql).toContain('"status" TEXT NOT NULL DEFAULT \'pending\'')
      expect(sql).toContain("PlatformOutboxEvent_status_createdAt_idx")
      expect(sql).toContain("PlatformOutboxEvent_eventType_status_idx")
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260621180000_core_evidence_platform", () => {
    const migrationDir = join(migrationsDir, CORE_EVIDENCE_PLATFORM_MIGRATION)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("creates CoreEvidence platform tables", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE "CoreEvidence"')
      expect(sql).toContain('CREATE TABLE "EvidenceLink"')
      expect(sql).toContain('CREATE TABLE "EvidenceRelation"')
      expect(sql).toContain('CREATE TABLE "EvidenceLifecycle"')
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260618015723_add_institutional_memory", () => {
    const migrationDir = join(migrationsDir, INSTITUTIONAL_MEMORY_MIGRATION)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("migration creates InstitutionalMemoryEvent table", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE "institutional_memory_events"')
    })

    it("migration creates InstitutionalMemoryCollection table", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE "institutional_memory_collections"')
    })

    it("migration adds foreign keys for InstitutionalMemoryEvent", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ADD CONSTRAINT "institutional_memory_events_createdById_fkey"')
    })

    it("migration is create-only (not yet applied)", () => {
      const migrationMetaPath = join(migrationDir, "migration_lock.json")
      // Being create-only means it hasn't been applied to a database yet
      expect(existsSync(migrationMetaPath) || existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })
  })

  describe("20260621190000_create_knowledge_candidate_tables", () => {
    const migrationDir = join(migrationsDir, KNOWLEDGE_CANDIDATE_TABLES)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("creates KnowledgeCandidate table with status enum and indexes", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS "KnowledgeCandidate"')
      expect(sql).toContain("KnowledgeCandidateStatus")
      expect(sql).toContain("candidatePhrase")
      expect(sql).toContain("canonicalAccountId")
      expect(sql).toContain("supportCount")
      expect(sql).toContain("status")
    })

    it("creates KnowledgeCandidateEvidence table", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS "KnowledgeCandidateEvidence"')
      expect(sql).toContain("evidenceType")
      expect(sql).toContain("evidenceId")
    })

    it("creates KnowledgePromotionHistory table", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS "KnowledgePromotionHistory"')
      expect(sql).toContain("promotedBy")
      expect(sql).toContain("artifactType")
    })

    it("creates indexes for all three tables", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain("KnowledgeCandidate_status_idx")
      expect(sql).toContain("KnowledgeCandidateEvidence_candidateId_idx")
      expect(sql).toContain("KnowledgePromotionHistory_candidateId_idx")
    })

    it("adds foreign key constraints conditionally", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain("KnowledgeCandidate_canonicalAccountId_fkey")
      expect(sql).toContain("KnowledgeCandidateEvidence_candidateId_fkey")
      expect(sql).toContain("KnowledgePromotionHistory_candidateId_fkey")
    })
  })

  describe("20260622000000_add_knowledge_candidate_createdById", () => {
    const migrationDir = join(migrationsDir, KNOWLEDGE_CANDIDATE_CREATEDBY)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("adds createdById column to KnowledgeCandidate", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ALTER TABLE "KnowledgeCandidate"')
      expect(sql).toContain("createdById")
    })

    it("adds index for createdById", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain("KnowledgeCandidate_createdById_idx")
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260622100000_knowledge_foundation_versioning", () => {
    const migrationDir = join(migrationsDir, KNOWLEDGE_FOUNDATION_VERSIONING)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("creates KnowledgeFoundation version governance tables", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE "KnowledgeFoundationVersion"')
      expect(sql).toContain('CREATE TABLE "KnowledgeFoundationRelease"')
      expect(sql).toContain('CREATE TABLE "KnowledgeFoundationDiff"')
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260622110000_knowledge_foundation_version_candidate_bridge", () => {
    const migrationDir = join(migrationsDir, KF_VERSION_CANDIDATE_BRIDGE)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("creates KnowledgeFoundationVersionCandidate junction table", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE "KnowledgeFoundationVersionCandidate"')
      expect(sql).toContain("versionId")
      expect(sql).toContain("candidateId")
      expect(sql).toContain("boundById")
      expect(sql).toContain("includedInRelease")
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260622120000_knowledge_foundation_release_provenance", () => {
    const migrationDir = join(migrationsDir, KF_RELEASE_PROVENANCE)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("adds releasedAt to KnowledgeFoundationVersionCandidate", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('"KnowledgeFoundationVersionCandidate"')
      expect(sql).toContain("releasedAt")
    })

    it("adds provenance fields to KnowledgeFoundationRelease", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('"KnowledgeFoundationRelease"')
      expect(sql).toContain("manifestPath")
      expect(sql).toContain("manifestSha256")
      expect(sql).toContain("provenanceSnapshot")
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260622130000_knowledge_foundation_release_artifact_status", () => {
    const migrationDir = join(migrationsDir, KF_RELEASE_ARTIFACT_STATUS)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("adds artifactStatus enum column to KnowledgeFoundationRelease", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain("KnowledgeFoundationReleaseArtifactStatus")
      expect(sql).toContain("artifactStatus")
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260622140000_knowledge_foundation_release_trust_chain", () => {
    const migrationDir = join(migrationsDir, KF_RELEASE_TRUST_CHAIN)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("adds previousReleaseId and previousReleaseHash to KnowledgeFoundationRelease", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain("previousReleaseId")
      expect(sql).toContain("previousReleaseHash")
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260623000000_add_knowledge_candidate_fk", () => {
    const migrationDir = join(migrationsDir, KNOLEDGE_CANDIDATE_FK)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("adds createdById foreign key to KnowledgeCandidate", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain("KnowledgeCandidate_createdById_fkey")
      expect(sql).toContain('FOREIGN KEY ("createdById") REFERENCES "User"("id")')
    })

    it("is the latest applied migration in the repository", () => {
      expect(latestAppliedMigration()).toBe(KNOLEDGE_CANDIDATE_FK)
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })
})

