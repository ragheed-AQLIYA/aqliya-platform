import type { SkillManifest } from "../../types"
import { validateInputs } from "../inputs"

export function validateInputsPhase(
  manifest: SkillManifest,
  inputs: Record<string, unknown>,
): Record<string, unknown> {
  return validateInputs(manifest, inputs)
}
