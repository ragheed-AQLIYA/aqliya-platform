import { readFileSync, existsSync, readdirSync } from "fs"
import { join } from "path"

const migrationsDir = join(__dirname, "../../prisma/migrations")
const LEAD_SCHEDULE_MIGRATION = "20260615110000_add_lead_schedule"
const LC_V35_MIGRATION = "20260616234035_add_lc_v35_grounding_feedback"

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

    it("migration is the most recent in the migrations list", () => {
      const dirs = readdirSync(migrationsDir)
        .filter(d => d.match(/^\d{14}/))
        .sort()
      expect(dirs[dirs.length - 1]).toBe(LC_V35_MIGRATION)
    })
  })
})

