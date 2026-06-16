// ─── AQLIYA Skill Evaluation API Route ───
// GET  /api/skills/evaluate       — List evaluatable skills with metadata
// POST /api/skills/evaluate       — Run evaluation for skill(s)
//
// POST body:
//   { "skillId": "skill:foundation:repo-analysis" }  — single skill
//   { "level": 0 }                                    — batch by level
//   { } or { "level": "all" }                         — all skills
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { readdirSync, existsSync } from "fs"
import { join } from "path"
import { auth } from "@/lib/auth-next"
import { loadManifest } from "@/lib/skill-runtime/runtime"
import {
  evaluateSkill,
  evaluateSkillsByLevel,
  formatEvaluationReport,
  formatBatchEvaluationReport,
} from "@/lib/skill-runtime/evaluator"
import type { SkillManifest } from "@/lib/skill-runtime/types"
import type {
  EvaluationResult,
  BatchEvaluationResult,
} from "@/lib/skill-runtime/evaluator-types"

// ─── Constants ───

const MANIFEST_ROOT = ".skills/manifests"
const EVAL_ROOT = ".skills/evaluations"

// ─── Skill discovery ───

interface SkillInfo {
  skillId: string
  skillName: string
  version: string
  level: number
  category: string
  description: string
  hasDataset: boolean
  criteriaCount: number
}

function discoverEvaluatableSkills(): SkillInfo[] {
  const root = join(process.cwd(), MANIFEST_ROOT)
  const skills: SkillInfo[] = []

  let categories: { name: string }[]
  try {
    categories = readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => ({ name: d.name }))
  } catch {
    return skills
  }

  for (const cat of categories) {
    const catPath = join(root, cat.name)
    let files: string[]
    try {
      files = readdirSync(catPath).filter((f) => f.endsWith(".skill.yaml"))
    } catch {
      continue
    }

    for (const file of files) {
      const skillName = file.replace(".skill.yaml", "")
      const skillId = `skill:${cat.name}:${skillName}`
      try {
        const manifest = loadManifest(skillId)

        // Check if a dataset exists
        const safeId = skillId.replace(/:/g, "-")
        const datasetPath = join(process.cwd(), EVAL_ROOT, safeId, "datasets", "v1.yaml")
        const hasDataset = existsSync(datasetPath)

        skills.push({
          skillId,
          skillName: manifest.name ?? skillName,
          version: manifest.version ?? "0.0.0",
          level: manifest.level ?? 99,
          category: cat.name,
          description: manifest.description ?? "",
          hasDataset,
          criteriaCount: manifest.evaluation?.criteria?.length ?? 0,
        })
      } catch {
        // Skip unloadable manifests
      }
    }
  }

  return skills
}

// ─── GET — List evaluatable skills ───

export async function GET() {
  const skills = discoverEvaluatableSkills()

  const summary = {
    total: skills.length,
    withDatasets: skills.filter((s) => s.hasDataset).length,
    withCriteria: skills.filter((s) => s.criteriaCount > 0).length,
    byLevel: {} as Record<number, number>,
  }

  for (const skill of skills) {
    summary.byLevel[skill.level] = (summary.byLevel[skill.level] ?? 0) + 1
  }

  return NextResponse.json({
    skills,
    summary,
    timestamp: new Date().toISOString(),
  })
}

// ─── POST — Run evaluation ───

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { skillId, level } = body as { skillId?: string; level?: number | string }

    // Validate: at least one filter
    if (!skillId && level === undefined) {
      return NextResponse.json(
        { error: "Provide 'skillId' (string) or 'level' (number)" },
        { status: 400 },
      )
    }

    if (skillId && typeof skillId !== "string") {
      return NextResponse.json(
        { error: "'skillId' must be a string" },
        { status: 400 },
      )
    }

    // Convert level — allow "all" or number
    let resolvedLevel: number | undefined
    if (level === "all" || level === "ALL") {
      resolvedLevel = undefined // all levels
    } else if (level !== undefined) {
      resolvedLevel = Number(level)
      if (isNaN(resolvedLevel)) {
        return NextResponse.json(
          { error: "'level' must be a number or 'all'" },
          { status: 400 },
        )
      }
    }

    // Run evaluation
    if (skillId) {
      // Single skill
      const result: EvaluationResult = await evaluateSkill(skillId)
      const markdown = formatEvaluationReport(result)

      return NextResponse.json({
        type: "single",
        markdown,
        result,
        timestamp: new Date().toISOString(),
      })
    }

    // Batch by level
    const batchResult: BatchEvaluationResult = await evaluateSkillsByLevel(resolvedLevel)
    const markdown = formatBatchEvaluationReport(batchResult)

    return NextResponse.json({
      type: "batch",
      level: resolvedLevel ?? "all",
      markdown,
      result: batchResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
