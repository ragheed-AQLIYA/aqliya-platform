import type { SkillManifest, InputDef } from "../types"
import { SkillManifestError } from "../types"

export function validateInputs(
  manifest: SkillManifest,
  providedInputs: Record<string, unknown>,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}

  for (const def of manifest.inputs.required) {
    const value = providedInputs[def.name]
    if (value === undefined || value === null) {
      if (providedInputs[def.name] !== undefined) {
        resolved[def.name] = providedInputs[def.name]
      } else {
        throw new SkillManifestError(
          `Missing required input "${def.name}" for skill "${manifest.id}": ${def.description}`,
          manifest.id,
        )
      }
    } else {
      resolved[def.name] = coerceInput(value, def)
    }
  }

  if (manifest.inputs.optional) {
    for (const def of manifest.inputs.optional) {
      const value = providedInputs[def.name]
      if (value !== undefined && value !== null) {
        resolved[def.name] = coerceInput(value, def)
      } else if (def.default !== undefined) {
        resolved[def.name] = def.default
      }
    }
  }

  return resolved
}

function coerceInput(value: unknown, def: InputDef): unknown {
  switch (def.type) {
    case "number": {
      const n = Number(value)
      if (isNaN(n)) throw new SkillManifestError(`Input "${def.name}" must be a number`)
      return n
    }
    case "boolean":
      if (typeof value === "string") return value === "true" || value === "1"
      return Boolean(value)
    case "array":
      return Array.isArray(value) ? value : [value]
    default:
      return value
  }
}
