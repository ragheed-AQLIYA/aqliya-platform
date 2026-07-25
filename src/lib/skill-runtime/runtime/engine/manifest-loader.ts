import type { SkillManifest } from "../../types"
import { loadManifest } from "../manifest"

export function loadManifestPhase(skillId: string, skillsRoot: string): SkillManifest {
  return loadManifest(skillId, skillsRoot)
}
