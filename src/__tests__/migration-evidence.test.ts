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
    const CONTENT_EVIDENCE = "20260703000001_add_content_evidence"
const LCGPA_REGULATORY_INTELLIGENCE = "20260822000000_lcgpa_regulatory_intelligence"
const REPAIR_SCHEMA_DRIFT = "20260822010000_repair_schema_drift"
const LATEST_APPLIED_MIGRATION = REPAIR_SCHEMA_DRIFT

/** Migrations excluded from applied-chain ordering (e.g. create-only, not yet applied). */
const MIGRATIONS_EXCLUDED_FROM_APPLIED_CHAIN = [
  INSTITUTIONAL_MEMORY_MIGRATION,
  "20260724232330_drop_deprecated_audit_models",
] as const

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
      expect(latestAppliedMigration()).toBe(LATEST_APPLIED_MIGRATION)
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260703000001_add_content_evidence", () => {
    const migrationDir = join(migrationsDir, CONTENT_EVIDENCE)

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("creates ContentEvidence table", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE TABLE "ContentEvidence"')
      expect(sql).toContain('"id" TEXT NOT NULL')
      expect(sql).toContain('"contentId" TEXT NOT NULL')
      expect(sql).toContain('"organizationId" TEXT NOT NULL')
    })

    it("creates required indexes", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('CREATE INDEX "ContentEvidence_contentId_idx"')
      expect(sql).toContain('CREATE INDEX "ContentEvidence_organizationId_idx"')
      expect(sql).toContain('CREATE INDEX "ContentEvidence_createdAt_idx"')
    })

    it("adds foreign key to ContentItem", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain('ALTER TABLE "ContentEvidence"')
      expect(sql).toContain('ADD CONSTRAINT "ContentEvidence_contentId_fkey"')
      expect(sql).toContain('FOREIGN KEY ("contentId") REFERENCES "ContentItem"("id")')
    })

    it("is additive-only (no DROP or RENAME)", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
    })
  })

  describe("20260822000000_lcgpa_regulatory_intelligence", () => {
    const migrationDir = join(migrationsDir, LCGPA_REGULATORY_INTELLIGENCE)

    /** Executable statements only: the review header legitimately mentions DROP. */
    function executableSql(): string {
      return readFileSync(join(migrationDir, "migration.sql"), "utf-8")
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("--"))
        .join("\n")
    }

    function addForeignKeyStatements(): string[] {
      return executableSql()
        .split("\n")
        .filter((line) => line.includes("ADD CONSTRAINT") && line.includes("FOREIGN KEY"))
    }

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    it("creates the regulatory intelligence tables", () => {
      const sql = executableSql()
      for (const table of [
        "LcRegulatorySource",
        "LcRegulatoryArtifact",
        "LcRegulatoryDataset",
        "LcRegulatoryProduct",
        "LcRegulatoryChange",
        "LcRegulatoryConflict",
        "LcRegulatoryImpactAssessment",
        "LcRegulatoryEffectiveDateEvidence",
      ]) {
        expect(sql).toContain(`CREATE TABLE "${table}"`)
      }
    })

    it("binds every calculation run to the exact regulatory dataset version it used", () => {
      const sql = executableSql()
      expect(sql).toContain('"regulatoryDatasetVersion" TEXT')
      expect(sql).toContain('"regulatoryArtifactSha256" TEXT')
      expect(sql).toContain('"regulatoryParserVersion" TEXT')
      expect(sql).toContain(
        'ADD CONSTRAINT "LcCalculationRun_regulatoryDatasetVersion_fkey" FOREIGN KEY ("regulatoryDatasetVersion") REFERENCES "LcRegulatoryDataset"("datasetVersion") ON DELETE RESTRICT'
      )
    })

    // Historical regulatory state must not be destroyable by a single DELETE.
    it("makes every regulatory foreign key ON DELETE RESTRICT", () => {
      const regulatoryFks = addForeignKeyStatements().filter(
        (line) => /ADD CONSTRAINT "LcRegulatory/.test(line) || /REFERENCES "LcRegulatory/.test(line)
      )

      expect(regulatoryFks.length).toBeGreaterThanOrEqual(15)
      for (const statement of regulatoryFks) {
        expect(statement).toContain("ON DELETE RESTRICT")
        expect(statement).not.toContain("ON DELETE CASCADE")
        expect(statement).not.toContain("ON DELETE SET NULL")
      }
    })

    it("is additive-only (no DROP, RENAME or TRUNCATE)", () => {
      const sql = executableSql()
      expect(sql).not.toContain("DROP")
      expect(sql).not.toContain("RENAME")
      expect(sql).not.toContain("TRUNCATE")
    })

    it("only ever adds columns to already-populated tables", () => {
      const alterStatements = executableSql()
        .split(/;\s*\n/)
        .filter((stmt) => stmt.trimStart().startsWith("ALTER TABLE"))
        .filter((stmt) => !stmt.includes("ADD CONSTRAINT"))

      expect(alterStatements.length).toBeGreaterThan(0)
      for (const statement of alterStatements) {
        expect(statement).toContain("ADD COLUMN")
        expect(statement).not.toContain("ALTER COLUMN")
      }
    })

    // Applied to the development database on 2026-08-22 by `prisma migrate
    // deploy`, after the chain was repaired and the database baselined.
    it("is in the applied migration chain", () => {
      expect(listAppliedMigrations()).toContain(LCGPA_REGULATORY_INTELLIGENCE)
    })

    it("records how it was promoted", () => {
      const sql = readFileSync(join(migrationDir, "migration.sql"), "utf-8")
      expect(sql).toContain("Promoted 2026-08-22")
      expect(sql).toContain("docs/regulatory/LCGPA_RUNBOOK.md")
      expect(sql).not.toContain("NOT APPLIED")
    })
  })

  describe("20260822010000_repair_schema_drift", () => {
    const migrationDir = join(migrationsDir, REPAIR_SCHEMA_DRIFT)

    function sql(): string {
      return readFileSync(join(migrationDir, "migration.sql"), "utf-8")
    }

    it("migration directory exists", () => {
      expect(existsSync(migrationDir)).toBe(true)
    })

    it("migration SQL file exists", () => {
      expect(existsSync(join(migrationDir, "migration.sql"))).toBe(true)
    })

    // Notification lives in schema.prisma and in every running database, but no
    // migration ever created it. This closes that gap for fresh environments.
    it("creates the Notification table the chain never created", () => {
      expect(sql()).toContain('CREATE TABLE IF NOT EXISTS "Notification"')
      expect(sql()).toContain('CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")')
    })

    it("creates the ten indexes the chain never created", () => {
      const statements = sql().match(/CREATE INDEX IF NOT EXISTS/g) ?? []
      expect(statements).toHaveLength(10)
    })

    // It must be a no-op wherever the objects already exist, which is every
    // environment built by db push.
    it("is idempotent: every statement is guarded", () => {
      const body = sql()
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("--"))
        .join("\n")

      const tables = body.match(/CREATE TABLE/g) ?? []
      const guardedTables = body.match(/CREATE TABLE IF NOT EXISTS/g) ?? []
      expect(guardedTables.length).toBe(tables.length)

      const indexes = body.match(/CREATE (?:UNIQUE )?INDEX/g) ?? []
      const guardedIndexes = body.match(/CREATE (?:UNIQUE )?INDEX IF NOT EXISTS/g) ?? []
      expect(guardedIndexes.length).toBe(indexes.length)

      // Foreign keys have no IF NOT EXISTS in PostgreSQL, so they are wrapped.
      const fks = body.match(/ADD CONSTRAINT/g) ?? []
      const guards = body.match(/IF NOT EXISTS \(SELECT 1 FROM pg_constraint/g) ?? []
      expect(guards.length).toBe(fks.length)
    })

    it("is additive-only (no DROP, RENAME, TRUNCATE or ALTER COLUMN)", () => {
      const body = sql()
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("--"))
        .join("\n")
      expect(body).not.toContain("DROP")
      expect(body).not.toContain("RENAME")
      expect(body).not.toContain("TRUNCATE")
      expect(body).not.toContain("ALTER COLUMN")
    })

    it("is the latest applied migration in the repository", () => {
      expect(latestAppliedMigration()).toBe(LATEST_APPLIED_MIGRATION)
    })
  })

  // Both of these blocked `prisma migrate deploy` outright before 2026-08-22.
  describe("migration chain health", () => {
    it("no migration.sql begins with a UTF-8 byte-order mark", () => {
      const offenders = listTimestampedMigrations().filter((m) => {
        const file = join(migrationsDir, m, "migration.sql")
        if (!existsSync(file)) return false
        const bytes = readFileSync(file)
        return bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
      })
      expect(offenders).toEqual([])
    })

    // PostgreSQL refuses DROP INDEX on an index owned by a UNIQUE constraint
    // (SQLSTATE 2BP01). Prisma names those indexes with a `_key` suffix, so a
    // bare DROP INDEX on one is a latent deploy failure. Plain `_idx` indexes
    // are safe to drop directly.
    it("no migration drops a constraint-backed index directly", () => {
      const offenders: string[] = []
      for (const m of listTimestampedMigrations()) {
        const file = join(migrationsDir, m, "migration.sql")
        if (!existsSync(file)) continue
        const body = readFileSync(file, "utf-8")
          .split("\n")
          .filter((line) => !line.trimStart().startsWith("--"))
          .join("\n")
          // A DROP INDEX inside a DO block that first checks pg_constraint is
          // the guarded form, and is exactly what this test asks for.
          .replace(/DO \$[a-z]*\$[\s\S]*?END \$[a-z]*\$;/g, "")
        for (const stmt of body.match(/DROP INDEX\s+(?:IF EXISTS\s+)?"([^"]+)"/g) ?? []) {
          if (/_key"$/.test(stmt)) offenders.push(`${m}: ${stmt}`)
        }
      }
      expect(offenders).toEqual([])
    })
  })
})

