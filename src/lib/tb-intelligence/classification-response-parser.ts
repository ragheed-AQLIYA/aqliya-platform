export interface ClassificationModelOutput {
  accountCode: string;
  confidence: number;
  reasoning: string;
}

const CANONICAL_CODE_RE = /CA-\d{4}/;

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    const end = trimmed.lastIndexOf("}");
    if (end > 0) return trimmed.slice(0, end + 1);
  }
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) return fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return null;
}

function normalizeConfidence(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }
  if (typeof value === "string") {
    const n = Number.parseFloat(value);
    if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
  }
  return 0.72;
}

function pickCanonicalCode(obj: Record<string, unknown>): string | null {
  for (const key of ["accountCode", "canonicalCode", "canonicalAccountCode"]) {
    const raw = obj[key];
    if (typeof raw !== "string") continue;
    const match = raw.match(CANONICAL_CODE_RE);
    if (match) return match[0];
  }
  return null;
}

export function parseClassificationModelOutput(
  output: string,
): ClassificationModelOutput | null {
  const jsonText = extractJsonObject(output);
  if (jsonText) {
    try {
      const obj = JSON.parse(jsonText) as Record<string, unknown>;
      const accountCode = pickCanonicalCode(obj);
      if (!accountCode) return null;
      const reasoning =
        typeof obj.reasoning === "string"
          ? obj.reasoning.trim()
          : typeof obj.rationale === "string"
            ? obj.rationale.trim()
            : "";
      return {
        accountCode,
        confidence: normalizeConfidence(obj.confidence),
        reasoning,
      };
    } catch {
      /* fall through to regex */
    }
  }

  const codeMatch = output.match(CANONICAL_CODE_RE);
  if (!codeMatch) return null;

  return {
    accountCode: codeMatch[0],
    confidence: 0.6,
    reasoning: "Extracted canonical code from unstructured model output",
  };
}
