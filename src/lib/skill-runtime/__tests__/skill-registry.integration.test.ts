// ─── AQLIYA Skill OS — Registry Integration Tests ───
// Validates the entire skill registry: all manifests exist, parse,
// cross-reference valid dependencies, match the registry index,
// and meet structural requirements.
// ============================================================

import { existsSync, readFileSync } from "fs"
import { join } from "path"
import * as yaml from "js-yaml"

import { loadManifest, listAvailableSkills } from "../runtime"
import type { SkillManifest } from "../types"

// ─── Constants ───

const SKILLS_ROOT = ".skills/manifests"
const REGISTRY_PATH = ".skills/registry/index.yaml"
const EVAL_ROOT = ".skills/evaluations"

interface RegistryEntry {
  id: string
  path: string
  status: string
  version: string
  category: string
  level: number
}

interface RegistryIndex {
  version: number
  updatedAt: string
  skills: RegistryEntry[]
}

// ─── Helpers ───

function loadRegistry(): RegistryIndex {
  const raw = readFileSync(join(process.cwd(), REGISTRY_PATH), "utf-8")
  return yaml.load(raw) as RegistryIndex
}

function loadManifestRaw(skillId: string): SkillManifest | null {
  try {
    return loadManifest(skillId, SKILLS_ROOT)
  } catch {
    return null
  }
}

function getAllDepRefs(manifest: SkillManifest): string[] {
  return manifest.dependencies?.skills ?? []
}

function evalPathFor(skillId: string): string {
  const safe = skillId.replace(/:/g, "-")
  return join(EVAL_ROOT, safe, "datasets", "v1.yaml")
}

// ─── Tests ───

describe("Skill Registry Integrity", () => {
  let registry: RegistryIndex
  let runtimeSkills: string[]

  beforeAll(async () => {
    registry = loadRegistry()
    runtimeSkills = await listAvailableSkills(SKILLS_ROOT)
  })

  // ─── Registry Consistency ───

  it("registry index has 25 entries", () => {
    expect(registry.skills).toHaveLength(25)
  })

  it("listAvailableSkills returns 25 skills (matches registry)", () => {
    expect(runtimeSkills).toHaveLength(25)
  })

  it("every registry entry is also discoverable by listAvailableSkills", () => {
    for (const entry of registry.skills) {
      expect(runtimeSkills).toContain(entry.id)
    }
  })

  it("every runtime-discovered skill is in the registry index", () => {
    const registryIds = new Set(registry.skills.map((s) => s.id))
    for (const skillId of runtimeSkills) {
      expect(registryIds.has(skillId)).toBe(true)
    }
  })

  // ─── Manifest File Existence ───

  it("every registry entry has a manifest file that exists", () => {
    // Registry paths are relative to .skills/ (e.g., "manifests/foundation/repo-analysis.skill.yaml")
    const root = join(process.cwd(), ".skills")
    for (const entry of registry.skills) {
      const manifestPath = join(root, entry.path)
      expect(existsSync(manifestPath)).toBe(true)
    }
  })

  // ─── Manifest Loading & Schema Compliance ───

  it("every skill loads and parses without error", () => {
    const failed: string[] = []
    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest) failed.push(entry.id)
    }
    expect(failed).toEqual([])
  })

  it("every manifest has required top-level fields", () => {
    const missing: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest) {
        missing.push(`${entry.id}: failed to load`)
        continue
      }
      if (!manifest.id) missing.push(`${entry.id}: missing id`)
      if (!manifest.name) missing.push(`${entry.id}: missing name`)
      if (!manifest.version) missing.push(`${entry.id}: missing version`)
      if (!manifest.description) missing.push(`${entry.id}: missing description`)
      if (!manifest.category) missing.push(`${entry.id}: missing category`)
      if (manifest.level === undefined) missing.push(`${entry.id}: missing level`)
      if (!manifest.inputs?.required) missing.push(`${entry.id}: missing inputs.required`)
      if (!manifest.outputs?.primary) missing.push(`${entry.id}: missing outputs.primary`)
      if (!manifest.execution?.type) missing.push(`${entry.id}: missing execution.type`)
    }
    expect(missing).toEqual([])
  })

  it("every manifest has evaluation criteria with weight sum ~1.0", () => {
    const issues: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest?.evaluation?.criteria) {
        issues.push(`${entry.id}: missing evaluation.criteria`)
        continue
      }
      const totalWeight = manifest.evaluation.criteria.reduce((sum, c) => sum + c.weight, 0)
      // Allow 0.05 tolerance for floating point
      if (Math.abs(totalWeight - 1.0) > 0.05) {
        issues.push(`${entry.id}: evaluation weights sum to ${totalWeight} (expected ~1.0)`)
      }
    }
    expect(issues).toEqual([])
  })

  it("every manifest has governance section with access and audit", () => {
    const issues: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest?.governance) {
        issues.push(`${entry.id}: missing governance section`)
        continue
      }
      if (!manifest.governance.access?.roles) issues.push(`${entry.id}: governance missing access.roles`)
      if (!manifest.governance.audit?.level) issues.push(`${entry.id}: governance missing audit.level`)
    }
    expect(issues).toEqual([])
  })

  // ─── Registry Entry Consistency ───

  it("every manifest id matches its registry entry id", () => {
    const mismatches: string[] = []
    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (manifest && manifest.id !== entry.id) {
        mismatches.push(`Registry: ${entry.id} vs Manifest: ${manifest.id}`)
      }
    }
    expect(mismatches).toEqual([])
  })

  it("every manifest status matches its registry entry status", () => {
    const mismatches: string[] = []
    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (manifest && manifest.status !== entry.status) {
        mismatches.push(`${entry.id}: registry says "${entry.status}", manifest says "${manifest.status}"`)
      }
    }
    expect(mismatches).toEqual([])
  })

  it("every manifest version matches its registry entry version", () => {
    const mismatches: string[] = []
    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (manifest && manifest.version !== entry.version) {
        mismatches.push(`${entry.id}: registry says "${entry.version}", manifest says "${manifest.version}"`)
      }
    }
    expect(mismatches).toEqual([])
  })

  it("every manifest category matches its registry entry category", () => {
    const mismatches: string[] = []
    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (manifest && manifest.category !== entry.category) {
        mismatches.push(`${entry.id}: registry says "${entry.category}", manifest says "${manifest.category}"`)
      }
    }
    expect(mismatches).toEqual([])
  })

  it("every manifest level matches its registry entry level", () => {
    const mismatches: string[] = []
    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (manifest && manifest.level !== entry.level) {
        mismatches.push(`${entry.id}: registry says "${entry.level}", manifest says "${manifest.level}"`)
      }
    }
    expect(mismatches).toEqual([])
  })

  // ─── Level Consistency ───

  it("L0 foundation skills have level 0", () => {
    for (const entry of registry.skills) {
      if (entry.category === "foundation") expect(entry.level).toBe(0)
    }
  })

  it("L1 engineering skills have level 1", () => {
    for (const entry of registry.skills) {
      if (entry.category === "engineering") expect(entry.level).toBe(1)
    }
  })

  it("L2 product skills have level 2", () => {
    for (const entry of registry.skills) {
      if (entry.category === "product") expect(entry.level).toBe(2)
    }
  })

  it("L3 business skills have level 3", () => {
    for (const entry of registry.skills) {
      if (entry.category === "business") expect(entry.level).toBe(3)
    }
  })

  it("L4 meta skills have level 4", () => {
    for (const entry of registry.skills) {
      if (entry.category === "meta") expect(entry.level).toBe(4)
    }
  })

  // ─── Dependency Graph Integrity ───

  it("all dependency references point to registered skills", () => {
    const registeredIds = new Set(registry.skills.map((s) => s.id))
    const broken: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest) continue

      const deps = getAllDepRefs(manifest)
      for (const dep of deps) {
        if (!registeredIds.has(dep)) {
          broken.push(`${entry.id} depends on "${dep}" which is not in registry`)
        }
      }
    }
    expect(broken).toEqual([])
  })

  it("no skill depends on itself", () => {
    const selfDeps: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest) continue

      const deps = getAllDepRefs(manifest)
      if (deps.includes(entry.id)) {
        selfDeps.push(entry.id)
      }
    }
    expect(selfDeps).toEqual([])
  })

  it("dependency graph respects level boundaries (L3 can't depend on L4)", () => {
    const violations: string[] = []
    const levelMap = new Map(registry.skills.map((s) => [s.id, s.level]))

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest) continue

      const deps = getAllDepRefs(manifest)
      for (const dep of deps) {
        const depLevel = levelMap.get(dep)
        const depCat = registry.skills.find((s) => s.id === dep)?.category
        // L3 business skills should not depend on L4 meta skills
        if (entry.level === 3 && depLevel === 4) {
          violations.push(`${entry.id} (L3) depends on ${dep} (L4) — L4 services only L0-L3`)
        }
        // L0-L2 should typically not depend on L3-L4
        if (entry.level <= 2 && depLevel !== undefined && depLevel >= 3) {
          violations.push(`${entry.id} (L${entry.level}) depends on ${dep} (L${depLevel}) — may be too high`)
        }
      }
    }
    // Log violations as warnings but don't hard-fail — some cross-level deps may be intentional
    if (violations.length > 0) {
      console.warn("Level boundary notes:", violations.join("; "))
    }
    // L3 → L4 is forbidden
    const l3toL4 = violations.filter((v) => v.includes("(L3) depends"))
    expect(l3toL4).toEqual([])
  })

  // ─── Evaluation Dataset Paths ───

  it("every manifest's evaluation dataset paths exist", () => {
    const missingPaths: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest?.evaluation?.datasets) continue

      for (const ds of manifest.evaluation.datasets) {
        // Try exact path first, then with colons → hyphens (Windows compat)
        // Replace colons in RELATIVE path only to avoid mangling Windows drive letter (e.g. C:)
        const exactPath = join(process.cwd(), ds.path)
        const hyphenRelative = ds.path.replace(/:/g, "-")
        const hyphenPath = join(process.cwd(), hyphenRelative)
        if (!existsSync(exactPath) && !existsSync(hyphenPath)) {
          missingPaths.push(`${entry.id}: dataset "${ds.name}" not found at ${ds.path}`)
        }
      }
    }
    expect(missingPaths).toEqual([])
  })

  it("every skill has at least one evaluation dataset stub", () => {
    const missing: string[] = []
    for (const entry of registry.skills) {
      const evalPath = join(process.cwd(), evalPathFor(entry.id))
      if (!existsSync(evalPath)) {
        missing.push(`${entry.id}: no evaluation dataset at ${evalPathFor(entry.id)}`)
      }
    }
    expect(missing).toEqual([])
  })
})

// ─── Skills By Category ───

describe("Skills by Category", () => {
  let registry: RegistryIndex

  beforeAll(() => {
    registry = loadRegistry()
  })

  it("has 5 foundation skills", () => {
    const count = registry.skills.filter((s) => s.category === "foundation").length
    expect(count).toBe(5)
  })

  it("has 6 engineering skills", () => {
    const count = registry.skills.filter((s) => s.category === "engineering").length
    expect(count).toBe(6)
  })

  it("has 4 product skills", () => {
    const count = registry.skills.filter((s) => s.category === "product").length
    expect(count).toBe(4)
  })

  it("has 5 business skills", () => {
    const count = registry.skills.filter((s) => s.category === "business").length
    expect(count).toBe(5)
  })

  it("has 5 meta skills", () => {
    const count = registry.skills.filter((s) => s.category === "meta").length
    expect(count).toBe(5)
  })

  it("category counts sum to 25", () => {
    const total = registry.skills.length
    expect(total).toBe(25)
  })
})

// ─── Workflow Step Validation ───

describe("Workflow Step Validation", () => {
  let registry: RegistryIndex

  beforeAll(() => {
    registry = loadRegistry()
  })

  it("every manifest has at least one workflow step (or is a function type)", () => {
    const empty: string[] = []
    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest) continue
      // function-type skills may have no workflow steps
      if (manifest.execution.type === "function") continue
      const steps = manifest.execution.workflow?.steps
      if (!steps || steps.length === 0) {
        empty.push(`${entry.id}: no workflow steps defined`)
      }
    }
    expect(empty).toEqual([])
  })

  it("every step has a valid type", () => {
    const validTypes = new Set(["prompt", "tool", "skill", "decision", "transform", "eval", "aggregate"])
    const invalid: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest?.execution?.workflow?.steps) continue

      for (const step of manifest.execution.workflow.steps) {
        if (!validTypes.has(step.type)) {
          invalid.push(`${entry.id}: step "${step.id}" has invalid type "${step.type}"`)
        }
      }
    }
    expect(invalid).toEqual([])
  })

  it("every prompt step has a prompt config", () => {
    const missing: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest?.execution?.workflow?.steps) continue

      for (const step of manifest.execution.workflow.steps) {
        if (step.type === "prompt") {
          const prompt = (step.config?.prompt as string) ?? ""
          if (!prompt.trim()) {
            missing.push(`${entry.id}: step "${step.id}" has empty prompt`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })

  it("every tool step has a tool name in config", () => {
    const missing: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest?.execution?.workflow?.steps) continue

      for (const step of manifest.execution.workflow.steps) {
        if (step.type === "tool") {
          const tool = step.config?.tool as string ?? ""
          if (!tool) {
            missing.push(`${entry.id}: step "${step.id}" missing tool name`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })

  it("every skill step has a skill reference", () => {
    const missing: string[] = []

    for (const entry of registry.skills) {
      const manifest = loadManifestRaw(entry.id)
      if (!manifest?.execution?.workflow?.steps) continue

      for (const step of manifest.execution.workflow.steps) {
        if (step.type === "skill") {
          const skillRef = step.skill ?? (step.config?.skillId as string) ?? ""
          if (!skillRef) {
            missing.push(`${entry.id}: step "${step.id}" missing skill reference`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })
})
