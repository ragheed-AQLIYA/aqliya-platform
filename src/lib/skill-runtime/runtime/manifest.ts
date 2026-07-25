import { readFileSync, existsSync } from "fs"
import { join } from "path"
import * as yaml from "js-yaml"
import type { SkillManifest } from "../types"
import { SkillManifestError } from "../types"
import { DEFAULT_CONFIG } from "./common"

export function loadManifest(skillId: string, skillsRoot?: string): SkillManifest {
  const parts = skillId.split(":")
  if (parts.length !== 3 || parts[0] !== "skill") {
    throw new SkillManifestError(
      `Invalid skill ID format: "${skillId}". Expected "skill:{category}:{name}"`,
    )
  }
  const [, category, name] = parts
  const root = skillsRoot ?? DEFAULT_CONFIG.skillsRoot
  const categoryAndName = join(category, `${name}.skill.yaml`)
  const manifestPath =
    root.startsWith("/") || /^[A-Za-z]:\\/.test(root)
      ? join(root, categoryAndName)
      : join(process.cwd(), root, categoryAndName)

  if (!existsSync(manifestPath)) {
    throw new SkillManifestError(`Manifest not found at: ${manifestPath}`, skillId)
  }

  const raw = readFileSync(manifestPath, "utf-8")
  const manifest = yaml.load(raw) as SkillManifest

  if (!manifest.id || !manifest.name || !manifest.version) {
    throw new SkillManifestError(
      `Manifest at "${manifestPath}" is missing required fields (id, name, version)`,
      skillId,
    )
  }
  if (manifest.id !== skillId) {
    throw new SkillManifestError(
      `Manifest ID mismatch: file expected "${skillId}" but manifest declares "${manifest.id}"`,
      skillId,
    )
  }

  return manifest
}
