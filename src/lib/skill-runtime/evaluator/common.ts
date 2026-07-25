// ─── Shared Helpers ───

export const EVAL_ROOT = ".skills/evaluations"

export function maybeParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }
  return value
}
