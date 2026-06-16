// ─── AQLIYA Skill Runtime — Unit Tests ───

import { aiOrchestrator } from "@/lib/ai/orchestrator"
import { existsSync, mkdirSync, writeFileSync, rmSync } from "fs"
import { join } from "path"
import * as yaml from "js-yaml"

// Mock the orchestrator before importing the runtime
jest.mock("@/lib/ai/orchestrator", () => ({
  aiOrchestrator: {
    generate: jest.fn().mockResolvedValue({
      response: {
        output: "Mock AI output",
        confidence: 0.85,
        providerId: "deterministic",
        modelVersion: "test/v1",
        metadata: {},
        warnings: [],
      },
      providerId: "deterministic",
      governanceContext: {},
      warnings: [],
    }),
  },
}))

import { executeSkill, loadManifest, validateInputs, listAvailableSkills } from "../runtime"
import type { SkillManifest, InputDef, SkillContext, StepResult } from "../types"
import { SkillManifestError } from "../types"

// ─── Helpers ───

const TEST_SKILLS_ROOT = ".skills/manifests-test"

/** Create a minimal valid manifest YAML at the test path */
function writeTestManifest(category: string, name: string, overrides: Partial<Record<string, unknown>> = {}): string {
  const dir = join(TEST_SKILLS_ROOT, category)
  mkdirSync(dir, { recursive: true })

  const defaults = {
    id: `skill:${category}:${name}`,
    name: "Test " + name,
    version: "0.1.0",
    description: "A test skill manifest",
    category,
    level: 0,
    status: "draft",
    createdAt: "2026-06-15T00:00:00Z",
    updatedAt: "2026-06-15T00:00:00Z",
    dependencies: { skills: [], models: { minCapability: "medium" } },
    inputs: {
      required: [{ name: "target", type: "string", description: "Target to analyze" }],
      optional: [{ name: "verbose", type: "boolean", description: "Verbose output", default: false }],
    },
    outputs: { primary: { type: "string", description: "Analysis result" } },
    execution: {
      type: "workflow",
      workflow: {
        steps: [
          {
            id: "analyze",
            type: "prompt",
            config: {
              prompt: "Analyze {{inputs.target}}",
              model: "fast",
              temperature: 0.3,
            },
          },
        ],
      },
      timeout: 30,
      maxRetries: 2,
    },
    ...overrides,
  }

  const yamlStr = yaml.dump(defaults as any, { indent: 2, lineWidth: -1, noRefs: true, quotingType: "'" })
  const filePath = join(dir, `${name}.skill.yaml`)
  writeFileSync(filePath, yamlStr, "utf-8")
  return filePath
}

function cleanupTestManifests(): void {
  if (existsSync(TEST_SKILLS_ROOT)) {
    rmSync(TEST_SKILLS_ROOT, { recursive: true, force: true })
  }
}

const baseManifest: SkillManifest = {
  id: "skill:test:validator",
  name: "Validator Test",
  version: "0.1.0",
  description: "Test",
  category: "foundation",
  level: 0,
  status: "draft",
  createdAt: "2026-06-15T00:00:00Z",
  updatedAt: "2026-06-15T00:00:00Z",
  dependencies: {},
  inputs: {
    required: [
      { name: "target", type: "string", description: "Target" },
      { name: "count", type: "number", description: "Count" },
    ],
    optional: [
      { name: "verbose", type: "boolean", description: "Verbose", default: false },
    ],
  },
  outputs: { primary: { type: "string", description: "Result" } },
  execution: { type: "workflow", workflow: { steps: [] }, timeout: 30 },
}

// ─── Tests ───

describe("validateInputs", () => {
  it("requires all required inputs", () => {
    expect(() => validateInputs(baseManifest, {})).toThrow(SkillManifestError)
    expect(() => validateInputs(baseManifest, {})).toThrow(/Missing required input/)
  })

  it("accepts valid required inputs", () => {
    const result = validateInputs(baseManifest, { target: "hello", count: 42 })
    expect(result.target).toBe("hello")
    expect(result.count).toBe(42)
  })

  it("coerces number from string", () => {
    const result = validateInputs(baseManifest, { target: "hello", count: "42" })
    expect(result.count).toBe(42)
  })

  it("rejects invalid number", () => {
    expect(() => validateInputs(baseManifest, { target: "hello", count: "not-a-number" })).toThrow(SkillManifestError)
  })

  it("applies default for optional inputs", () => {
    const result = validateInputs(baseManifest, { target: "hello", count: 1 })
    expect(result.verbose).toBe(false)
  })

  it("overrides default with provided value", () => {
    const result = validateInputs(baseManifest, { target: "hello", count: 1, verbose: true })
    expect(result.verbose).toBe(true)
  })

  it("coerces boolean from string", () => {
    const result = validateInputs(baseManifest, { target: "hello", count: 1, verbose: "true" })
    expect(result.verbose).toBe(true)
  })

  it("coerces array from single value", () => {
    const arrayManifest: SkillManifest = {
      ...baseManifest,
      inputs: {
        required: [{ name: "items", type: "array", description: "items" }],
      },
    }
    const result = validateInputs(arrayManifest, { items: "single" })
    expect(Array.isArray(result.items)).toBe(true)
    expect(result.items).toEqual(["single"])
  })

  it("preserves existing arrays", () => {
    const arrayManifest: SkillManifest = {
      ...baseManifest,
      inputs: {
        required: [{ name: "items", type: "array", description: "items" }],
      },
    }
    const result = validateInputs(arrayManifest, { items: ["a", "b"] })
    expect(result.items).toEqual(["a", "b"])
  })
})

// ─── loadManifest ───

describe("loadManifest", () => {
  let manifestPath: string

  beforeAll(() => {
    cleanupTestManifests()
    manifestPath = writeTestManifest("test-cat", "loader-test")
  })

  afterAll(() => {
    cleanupTestManifests()
  })

  it("rejects invalid skill ID format", () => {
    expect(() => loadManifest("invalid")).toThrow(SkillManifestError)
    expect(() => loadManifest("skill:onlytwo")).toThrow(SkillManifestError)
  })

  it("rejects missing manifest", () => {
    expect(() => loadManifest("skill:nonexistent:missing")).toThrow(SkillManifestError)
  })

  it("loads a valid manifest", () => {
    const manifest = loadManifest("skill:test-cat:loader-test", TEST_SKILLS_ROOT)
    expect(manifest.id).toBe("skill:test-cat:loader-test")
    expect(manifest.name).toBe("Test loader-test")
    expect(manifest.version).toBe("0.1.0")
    expect(manifest.category).toBe("test-cat")
    expect(manifest.execution.type).toBe("workflow")
    expect(manifest.execution.workflow!.steps).toHaveLength(1)
    expect(manifest.execution.workflow!.steps[0].id).toBe("analyze")
    expect(manifest.execution.workflow!.steps[0].type).toBe("prompt")
  })
})

// ─── executeSkill ───

describe("executeSkill", () => {
  beforeAll(() => {
    cleanupTestManifests()
  })

  afterAll(() => {
    cleanupTestManifests()
  })

  it("returns failed result for nonexistent skill", async () => {
    const result = await executeSkill("skill:test:does-not-exist", {}, { skillsRoot: TEST_SKILLS_ROOT })
    expect(result.status).toBe("failed")
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it("returns failed result for missing required inputs", async () => {
    writeTestManifest("test", "missing-inputs")
    const result = await executeSkill("skill:test:missing-inputs", {}, { skillsRoot: TEST_SKILLS_ROOT })
    expect(result.status).toBe("failed")
    expect(result.errors[0]).toMatch(/Missing required input/)
  })

  it("executes a valid skill and returns completed", async () => {
    writeTestManifest("test", "happy-flow")
    const result = await executeSkill(
      "skill:test:happy-flow",
      { target: "Repository X" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.status).toBe("completed")
    expect(result.skillId).toBe("skill:test:happy-flow")
    expect(result.skillName).toBe("Test happy-flow")
    expect(aiOrchestrator.generate).toHaveBeenCalled()
  })

  it("passes session context", async () => {
    writeTestManifest("test", "with-session")
    const result = await executeSkill(
      "skill:test:with-session",
      { target: "test" },
      {
        skillsRoot: TEST_SKILLS_ROOT,
        session: { userId: "user-1", organizationId: "org-1", role: "admin" },
      },
    )
    expect(result.status).toBe("completed")
    // Verify orchestrator was called with session info
    expect(aiOrchestrator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        userId: "user-1",
        userRole: "admin",
      }),
    )
  })

  it("produces a degraded status if some steps fail", async () => {
    writeTestManifest("test", "degraded-flow", {
      execution: {
        type: "workflow",
        workflow: {
          steps: [
            {
              id: "step-ok",
              type: "prompt",
              config: { prompt: "First step" },
            },
            {
              id: "step-bad",
              type: "tool",
              config: { tool: "nonexistent-tool" },
              dependsOn: ["step-ok"],
            },
          ],
        },
        timeout: 30,
      },
    })

    const result = await executeSkill(
      "skill:test:degraded-flow",
      { target: "test" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.status).toBe("degraded") // One passed, one failed
    expect(result.steps["step-ok"].status).toBe("completed")
    expect(result.steps["step-bad"].status).toBe("failed")
  })

  it("handles circular dependencies gracefully", async () => {
    writeTestManifest("test", "circular-deps", {
      execution: {
        type: "workflow",
        workflow: {
          steps: [
            { id: "a", type: "prompt", config: { prompt: "A" }, dependsOn: ["c"] },
            { id: "b", type: "prompt", config: { prompt: "B" }, dependsOn: ["a"] },
            { id: "c", type: "prompt", config: { prompt: "C" }, dependsOn: ["b"] },
          ],
        },
        timeout: 30,
      },
    })

    const result = await executeSkill(
      "skill:test:circular-deps",
      { target: "test" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    // On circular deps, all steps stall; we expect at minimum "degraded"
    expect(["failed", "degraded"]).toContain(result.status)
    // Verify at least one error mentions the dependency issue
    expect(result.errors.some((e) => /step dependenc/i.test(e))).toBe(true)
  })

  it("handles unknown step type gracefully", async () => {
    writeTestManifest("test", "unknown-step-type", {
      execution: {
        type: "workflow",
        workflow: {
          steps: [
            { id: "weird", type: "nonexistent" as any, config: {} },
          ],
        },
        timeout: 30,
      },
    })

    const result = await executeSkill(
      "skill:test:unknown-step-type",
      { target: "test" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.status).toBe("failed")
    expect(result.steps["weird"].status).toBe("failed")
  })

  it("includes invocationId in the result", async () => {
    writeTestManifest("test", "invocation-check")
    const result = await executeSkill(
      "skill:test:invocation-check",
      { target: "test" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.invocationId).toMatch(/^skinv-/)
  })

  it("includes timing information", async () => {
    writeTestManifest("test", "timing-check")
    const result = await executeSkill(
      "skill:test:timing-check",
      { target: "test" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    expect(result.startedAt).toBeTruthy()
    expect(result.completedAt).toBeTruthy()
  })

  it("reports version and skillId in result", async () => {
    writeTestManifest("test", "result-metadata")
    const result = await executeSkill(
      "skill:test:result-metadata",
      { target: "test" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.skillId).toBe("skill:test:result-metadata")
    expect(result.version).toBe("0.1.0")
  })

  it("supports optional inputs with defaults", async () => {
    writeTestManifest("test", "optional-inputs", {
      inputs: {
        required: [{ name: "target", type: "string", description: "Target" }],
        optional: [
          { name: "limit", type: "number", description: "Max results", default: 10 },
          { name: "sortBy", type: "string", description: "Sort field", default: "name" },
        ],
      },
    })
    const result = await executeSkill(
      "skill:test:optional-inputs",
      { target: "test" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.status).toBe("completed")
  })
})

// ─── listAvailableSkills ───

describe("listAvailableSkills", () => {
  beforeAll(() => {
    cleanupTestManifests()
    writeTestManifest("alpha", "skill-a")
    writeTestManifest("alpha", "skill-b")
    writeTestManifest("beta", "skill-c")
  })

  afterAll(() => {
    cleanupTestManifests()
  })

  it("lists all available skills across categories", async () => {
    const skills = await listAvailableSkills(TEST_SKILLS_ROOT)
    expect(skills).toContain("skill:alpha:skill-a")
    expect(skills).toContain("skill:alpha:skill-b")
    expect(skills).toContain("skill:beta:skill-c")
    expect(skills).toHaveLength(3)
  })

  it("returns empty array for nonexistent directory", async () => {
    const skills = await listAvailableSkills(join(TEST_SKILLS_ROOT, "nonexistent"))
    expect(skills).toEqual([])
  })
})

// ─── Edge Cases ───

describe("edge cases", () => {
  beforeAll(() => {
    cleanupTestManifests()
  })

  afterAll(() => {
    cleanupTestManifests()
  })

  it("handles empty workflow (no steps)", async () => {
    writeTestManifest("test", "empty-workflow", {
      execution: { type: "workflow", timeout: 30 },
    })
    const result = await executeSkill(
      "skill:test:empty-workflow",
      { target: "test" },
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.status).toBe("failed")
    expect(result.errors).toContain("No workflow steps defined")
  })

  it("handles filesystem:scan tool step", async () => {
    const toolManifest = {
      id: "skill:test:scan-test",
      name: "Scan Test",
      version: "0.1.0",
      description: "Test filesystem scan",
      category: "test",
      level: 0,
      status: "draft",
      createdAt: "2026-06-15T00:00:00Z",
      updatedAt: "2026-06-15T00:00:00Z",
      dependencies: {},
      inputs: {
        required: [],
      },
      outputs: { primary: { type: "array", description: "File list" } },
      execution: {
        type: "workflow",
        workflow: {
          steps: [
            {
              id: "scan-files",
              type: "tool",
              config: {
                tool: "filesystem:scan",
                params: {
                  path: process.cwd(),
                  include: ["src/lib/skill-runtime/*.ts"],
                },
              },
            },
          ],
        },
        timeout: 30,
      },
    }
    // Write scan-test manifest directly with yaml.dump for complex config
    const scanDir = join(TEST_SKILLS_ROOT, "test")
    mkdirSync(scanDir, { recursive: true })
    const scanYaml = yaml.dump(toolManifest as any, { indent: 2, lineWidth: -1, noRefs: true, quotingType: "'" })
    writeFileSync(join(scanDir, "scan-test.skill.yaml"), scanYaml, "utf-8")
    const result = await executeSkill(
      "skill:test:scan-test",
      {},
      { skillsRoot: TEST_SKILLS_ROOT },
    )
    expect(result.status).toBe("completed")
    const files = result.steps["scan-files"].output as string[]
    expect(Array.isArray(files)).toBe(true)
    expect(files.length).toBeGreaterThan(0)
    expect(files.some((f) => f.includes("runtime.ts"))).toBe(true)
  })
})
