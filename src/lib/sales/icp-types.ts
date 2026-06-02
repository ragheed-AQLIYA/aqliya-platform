/** Phase 2 stub — ICP fit score stored in SalesAccount.metadata.icpScore (no dedicated table). */

export type IcpFitBand = "strong" | "moderate" | "weak" | "unknown";

export interface IcpSegmentRule {
  id: string;
  label: string;
  industryKeywords: string[];
  baseScore: number;
}

export const ICP_SEGMENT_RULES: IcpSegmentRule[] = [
  {
    id: "icp-1",
    label: "Audit firms",
    industryKeywords: ["audit", "accounting", "assurance"],
    baseScore: 82,
  },
  {
    id: "icp-2",
    label: "Mid-market regulated",
    industryKeywords: ["regulated", "compliance", "mid-market"],
    baseScore: 68,
  },
  {
    id: "icp-3",
    label: "Government-adjacent",
    industryKeywords: ["government", "public sector", "sovereign"],
    baseScore: 72,
  },
  {
    id: "icp-4",
    label: "Enterprise SaaS",
    industryKeywords: ["saas", "software", "technology", "enterprise"],
    baseScore: 70,
  },
  {
    id: "icp-5",
    label: "Financial Services",
    industryKeywords: ["financial", "bank", "insurance", "capital"],
    baseScore: 76,
  },
];

export interface IcpFitDimensions {
  pain?: number | null;
  urgency?: number | null;
  budget?: number | null;
  authority?: number | null;
}

export interface AccountIcpScore {
  /** 0–100 overall fit score */
  fitScore: number;
  band: IcpFitBand;
  segment?: string | null;
  confidence?: number | null;
  dimensions?: IcpFitDimensions | null;
  assessedAt?: string | null;
  /** manual | demo | ai | rules-agent — stub accepts any string; AI not wired */
  source?: string | null;
  notes?: string | null;
  agentGenerated?: boolean;
  reviewed?: boolean;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  reasoning?: string[];
}

export interface AccountIcpAssessment {
  configured: boolean;
  score: AccountIcpScore | null;
}

function clampScore(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseBand(value: unknown, fitScore: number | null): IcpFitBand {
  if (
    value === "strong" ||
    value === "moderate" ||
    value === "weak" ||
    value === "unknown"
  ) {
    return value;
  }
  if (fitScore == null) return "unknown";
  if (fitScore >= 75) return "strong";
  if (fitScore >= 50) return "moderate";
  return "weak";
}

function parseDimensions(value: unknown): IcpFitDimensions | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const d = value as Record<string, unknown>;
  const dims: IcpFitDimensions = {};
  for (const key of ["pain", "urgency", "budget", "authority"] as const) {
    const v = clampScore(d[key]);
    if (v != null) dims[key] = v;
  }
  return Object.keys(dims).length > 0 ? dims : null;
}

export function readAccountIcpScore(metadata: unknown): AccountIcpAssessment {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return { configured: false, score: null };
  }

  const raw = (metadata as Record<string, unknown>).icpScore;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { configured: false, score: null };
  }

  const m = raw as Record<string, unknown>;
  const fitScore = clampScore(m.fitScore);
  if (fitScore == null) {
    return { configured: false, score: null };
  }

  return {
    configured: true,
    score: {
      fitScore,
      band: parseBand(m.band, fitScore),
      segment:
        typeof m.segment === "string" && m.segment.trim()
          ? m.segment.trim()
          : null,
      confidence: clampScore(m.confidence),
      dimensions: parseDimensions(m.dimensions),
      assessedAt:
        typeof m.assessedAt === "string" && m.assessedAt.trim()
          ? m.assessedAt.trim()
          : null,
      source:
        typeof m.source === "string" && m.source.trim()
          ? m.source.trim()
          : null,
      notes:
        typeof m.notes === "string" && m.notes.trim() ? m.notes.trim() : null,
      agentGenerated:
        typeof m.agentGenerated === "boolean" ? m.agentGenerated : undefined,
      reviewed: typeof m.reviewed === "boolean" ? m.reviewed : undefined,
      reviewedAt:
        typeof m.reviewedAt === "string" && m.reviewedAt.trim()
          ? m.reviewedAt.trim()
          : null,
      reviewedById:
        typeof m.reviewedById === "string" && m.reviewedById.trim()
          ? m.reviewedById.trim()
          : null,
      reasoning: Array.isArray(m.reasoning)
        ? m.reasoning.filter((r): r is string => typeof r === "string")
        : undefined,
    },
  };
}

export function icpBandFromScore(fitScore: number): IcpFitBand {
  if (fitScore >= 75) return "strong";
  if (fitScore >= 50) return "moderate";
  if (fitScore > 0) return "weak";
  return "unknown";
}

export function readAccountSegmentHint(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const m = metadata as Record<string, unknown>;
  if (typeof m.segment === "string" && m.segment.trim()) {
    return m.segment.trim();
  }
  const icpScore = m.icpScore;
  if (icpScore && typeof icpScore === "object" && !Array.isArray(icpScore)) {
    const segment = (icpScore as Record<string, unknown>).segment;
    if (typeof segment === "string" && segment.trim()) {
      return segment.trim();
    }
  }
  return null;
}

export function icpBandLabelAr(band: IcpFitBand): string {
  switch (band) {
    case "strong":
      return "ملاءمة قوية";
    case "moderate":
      return "ملاءمة متوسطة";
    case "weak":
      return "ملاءمة ضعيفة";
    default:
      return "غير محدد";
  }
}
