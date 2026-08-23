// ─── LCGPA Regulatory Intelligence :: Deterministic Identifiers (§33) ───
//
// Reproducibility requires that identical inputs produce identical identifiers.
// Nothing in this engine uses randomness or wall-clock entropy for identity.

import { createHash } from "crypto";

/** Stable 16-hex digest of the joined parts. */
export function digestOf(parts: (string | number | null | undefined)[]): string {
  const canonical = parts
    .map((p) => (p === null || p === undefined ? " " : String(p)))
    .join("|");
  return createHash("sha256").update(canonical, "utf8").digest("hex").slice(0, 16);
}

/** `PREFIX-<16 hex>` — deterministic, collision-resistant, human-scannable. */
export function deterministicId(
  prefix: string,
  parts: (string | number | null | undefined)[],
): string {
  return `${prefix}-${digestOf(parts)}`;
}

/** ISO-8601 with millisecond precision — the canonical serialisation for dates. */
export function isoOf(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}

/**
 * Sequential, human-facing change-event identity, e.g. `CHANGE-2026-00017`.
 * The sequence is supplied by the journal so ordering stays explicit.
 */
export function changeEventId(year: number, sequence: number): string {
  return `CHANGE-${year}-${String(sequence).padStart(5, "0")}`;
}
