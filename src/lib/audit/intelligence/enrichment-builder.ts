/**
 * Deterministic disclosure enrichment — builds assistive draft sections from rule citations.
 */

import type { RuleCitation } from "@/lib/audit/notes/disclosure-types";
import {
  INTELLIGENCE_ENRICHMENT_MARKER,
  type DisclosureEnrichmentInput,
} from "./types";

const NOTE_TYPE_GUIDANCE: Record<string, { ar: string; en: string }> = {
  tax: {
    ar: "يُوصى بإيضاح أساس الزكاة/الضريبة، المبالغ المعترف بها، والتسويات بين الأساس المحاسبي والزكوي.",
    en: "Disclose zakat/tax basis, recognized amounts, and reconciliations between accounting and zakat bases.",
  },
  revenue: {
    ar: "يُوصى بتوضيح نموذج الخمس خطوات، توقيت الاعتراف، والالتزامات التعاقدية الجوهرية.",
    en: "Disclose five-step model, timing of recognition, and material contract balances.",
  },
  accounting_policy: {
    ar: "يُوصى بتلخيص السياسات المحاسبية الهامة المطبقة وفق الإطار المعتمد.",
    en: "Summarize significant accounting policies under the adopted framework.",
  },
  fixed_assets: {
    ar: "يُوصى بإفصاح الأصول والإهلاك والتغيرات خلال الفترة.",
    en: "Disclose PPE movements, depreciation methods, and period changes.",
  },
};

function citationLines(citations: RuleCitation[]): string {
  return citations
    .map((c) => `- ${c.source.toUpperCase()} · ${c.standardCode} · ${c.ruleId}`)
    .join("\n");
}

export function buildDeterministicEnrichmentSection(
  input: DisclosureEnrichmentInput,
): string {
  const guidance =
    NOTE_TYPE_GUIDANCE[input.noteType] ?? {
      ar: "راجع متطلبات الإفصاح وفق المعايير المشار إليها.",
      en: "Review disclosure requirements per cited standards.",
    };

  return `${INTELLIGENCE_ENRICHMENT_MARKER}

## مسودة إيضاح مساعدة (Assistive Disclosure Draft)
**يتطلب مراجعة بشرية — ليس رأياً نهائياً**

### Rule citations (evidence anchors)
${citationLines(input.citations)}

### Suggested expansion (AR)
${guidance.ar}

### Suggested expansion (EN)
${guidance.en}

### Engagement context
${input.engagementLabel}

---
⚠ AI assists. Humans decide. Evidence governs. — Do not export without reviewer approval.`;
}

export function parseEnrichmentFromHandlerOutput(
  output: string,
  input: DisclosureEnrichmentInput,
  modelVersion: string,
): string {
  try {
    const parsed = JSON.parse(output) as { enrichedSection?: string };
    if (parsed.enrichedSection?.includes(INTELLIGENCE_ENRICHMENT_MARKER)) {
      return parsed.enrichedSection;
    }
  } catch {
    /* use deterministic fallback */
  }
  return buildDeterministicEnrichmentSection(input);
}
