import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "../audit-events";
import type { SalesActor, SalesOrgScope } from "../services";

/** PR-16 stub — rules-based objection categorization on deal metadata (no LLM). */

export const OBJECTION_ANALYSIS_STATUSES = ["draft_pending_review"] as const;

export type ObjectionAnalysisStatus =
  (typeof OBJECTION_ANALYSIS_STATUSES)[number];

export const OBJECTION_CATEGORIES = [
  "price",
  "timing",
  "authority",
  "need",
  "trust",
  "competition",
  "compliance",
  "integration",
  "ai_replacement",
  "other",
] as const;

export type ObjectionCategory = (typeof OBJECTION_CATEGORIES)[number];

export interface ObjectionCategoryRule {
  id: ObjectionCategory;
  labelAr: string;
  keywords: string[];
  suggestedResponse: string;
}

export const OBJECTION_CATEGORY_RULES: ObjectionCategoryRule[] = [
  {
    id: "price",
    labelAr: "السعر",
    keywords: [
      "price",
      "pricing",
      "expensive",
      "cost",
      "budget",
      "too much",
      "سعر",
      "مكلف",
      "تكلفة",
      "ثمن",
      "غالي",
      "ميزانية",
    ],
    suggestedResponse:
      "نفهم حساسية الاستثمار. AQLIYA تُقدَّم كمنصة محكومة بقيمة تشغيلية واضحة — يمكننا مشاركة نطاق pilot محدود بمخرجات قابلة للقياس قبل أي التزام أوسع.",
  },
  {
    id: "timing",
    labelAr: "التوقيت",
    keywords: [
      "timing",
      "later",
      "not now",
      "next quarter",
      "next year",
      "postpone",
      "delay",
      "توقيت",
      "لاحق",
      "الآن لا",
      "تأجيل",
      "الربع",
      "بعد",
    ],
    suggestedResponse:
      "يمكننا تحديد مسار pilot قصير بمدة محددة يتوافق مع أولوياتكم الحالية، دون فرض جدول زمني غير مناسب.",
  },
  {
    id: "authority",
    labelAr: "صاحب القرار",
    keywords: [
      "authority",
      "decision maker",
      "decision-maker",
      "who decides",
      "approval",
      "sign off",
      "manager",
      "sponsor",
      "قرار",
      "صاحب قرار",
      "موافقة",
      "مدير",
      "راعي",
      "اعتماد",
    ],
    suggestedResponse:
      "نقترح جلسة موجزة مع صاحب القرار والراعي التنفيذي لعرض نطاق pilot والحوكمة — AI assists. Humans decide.",
  },
  {
    id: "need",
    labelAr: "الحاجة / الملاءمة",
    keywords: [
      "need",
      "fit",
      "priority",
      "problem",
      "pain",
      "use case",
      "حاجة",
      "ملاءمة",
      "أولوية",
      "مشكلة",
      "ألم",
      "فائدة",
    ],
    suggestedResponse:
      "لنبدأ بتحديد use case واحد محدد مع معايير نجاح واضحة — إن لم تتحقق القيمة خلال pilot نعيد التقييم بصدق.",
  },
  {
    id: "trust",
    labelAr: "الثقة / المسؤولية",
    keywords: [
      "trust",
      "rely",
      "liability",
      "risk",
      "proof",
      "evidence",
      "ثقة",
      "مسؤولية",
      "مخاطر",
      "دليل",
      "اعتماد",
      "موثوق",
    ],
    suggestedResponse:
      "المنصة مبنية على: AI assists. Humans decide. Evidence governs. كل مخرج مسودة يمر بمراجعة بشرية ومسار أدلة — لا اعتماد آلي.",
  },
  {
    id: "competition",
    labelAr: "المنافسة / البدائل",
    keywords: [
      "competitor",
      "competition",
      "alternative",
      "excel",
      "chatgpt",
      "spreadsheet",
      "instead",
      "منافس",
      "بديل",
      "إكسل",
      "جدول",
    ],
    suggestedResponse:
      "الأدوات العامة تساعد في أجزاء منفصلة؛ AQLIYA تجمع workflow محكوماً + تتبع + أدلة في مسار واحد — pilot يوضح الفرق عملياً.",
  },
  {
    id: "compliance",
    labelAr: "الامتثال",
    keywords: [
      "compliance",
      "regulatory",
      "regulation",
      "audit trail",
      "governance",
      "policy",
      "امتثال",
      "تنظيم",
      "حوكمة",
      "سياسة",
      "امتثال",
    ],
    suggestedResponse:
      "المنتج يُصمَّم لسياقات مؤسسية محكومة: RBAC، سجل تدقيق، وبوابات مراجعة — يمكننا مشاركة قيود pilot والحدود بوضوح.",
  },
  {
    id: "integration",
    labelAr: "التكامل",
    keywords: [
      "integration",
      "integrate",
      "api",
      "connect",
      "system",
      "erp",
      "workflow",
      "تكامل",
      "ربط",
      "نظام",
      "واجهة",
    ],
    suggestedResponse:
      "نحدد في pilot نطاق التكامل المطلوب صراحةً — لا وعود تكامل كامل خارج ما هو موثّق في نطاق التجربة.",
  },
  {
    id: "ai_replacement",
    labelAr: "استبدال AI / البشر",
    keywords: [
      "replace",
      "replacing",
      "automation",
      "automate",
      "ai replace",
      "without human",
      "auditor",
      "reviewer",
      "يستبدل",
      "استبدال",
      "ذكاء اصطناعي",
      "آلي",
      "مراجع",
      "بدون بشر",
    ],
    suggestedResponse:
      "لا — AI assists. Humans decide. Evidence governs. النظام ينظم ويُسرّع التحضير؛ الحكم المهني والاعتماد يبقيان بشريين.",
  },
  {
    id: "other",
    labelAr: "أخرى",
    keywords: [],
    suggestedResponse:
      "شكراً على توضيح الاعتراض. نحتاج مراجعة بشرية لتخصيص الرد — هذه مسودة قالبية بانتظار تأكيد الممثل.",
  },
];

export interface ObjectionAnalysisRun {
  id: string;
  category: ObjectionCategory;
  categoryLabelAr: string;
  suggestedResponse: string;
  confidence: number;
  status: ObjectionAnalysisStatus;
  sourceText: string;
  interactionId: string | null;
  matchedKeywords: string[];
  analyzedAt: string;
  analyzedById: string;
  analyzedByName: string | null;
}

export interface ObjectionAnalysisContext {
  scope: SalesOrgScope;
  actor: SalesActor;
}

export interface ObjectionAnalysisInput {
  interactionId?: string | null;
  pastedText?: string | null;
}

export interface ObjectionAnalysisResult {
  category: ObjectionCategory;
  categoryLabelAr: string;
  suggestedResponse: string;
  confidence: number;
  status: ObjectionAnalysisStatus;
  matchedKeywords: string[];
  sourceText: string;
}

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function clampConfidence(value: number): number {
  return Math.min(95, Math.max(15, Math.round(value)));
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function excerptText(text: string, maxLen = 280): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

function ruleForCategory(category: ObjectionCategory): ObjectionCategoryRule {
  return (
    OBJECTION_CATEGORY_RULES.find((rule) => rule.id === category) ??
    OBJECTION_CATEGORY_RULES[OBJECTION_CATEGORY_RULES.length - 1]
  );
}

/** Pure rules engine — no LLM, no DB. */
export function computeObjectionAnalysisStub(
  text: string,
): ObjectionAnalysisResult {
  const normalized = normalizeText(text);
  if (!normalized) {
    const rule = ruleForCategory("other");
    return {
      category: "other",
      categoryLabelAr: rule.labelAr,
      suggestedResponse: rule.suggestedResponse,
      confidence: 15,
      status: "draft_pending_review",
      matchedKeywords: [],
      sourceText: "",
    };
  }

  let bestCategory: ObjectionCategory = "other";
  let bestScore = 0;
  let bestKeywords: string[] = [];

  for (const rule of OBJECTION_CATEGORY_RULES) {
    if (rule.id === "other") continue;
    const matched = rule.keywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    if (matched.length > bestScore) {
      bestScore = matched.length;
      bestCategory = rule.id;
      bestKeywords = matched;
    }
  }

  const rule = ruleForCategory(bestCategory);
  let confidence = 35;
  if (bestScore > 0) {
    confidence += Math.min(bestScore * 12, 36);
    confidence += bestKeywords.some((k) => k.length >= 6) ? 8 : 0;
  } else {
    confidence = 28;
    bestCategory = "other";
    bestKeywords = [];
  }

  if (normalized.length >= 40) confidence += 5;
  if (normalized.length >= 120) confidence += 5;

  return {
    category: bestCategory,
    categoryLabelAr: rule.labelAr,
    suggestedResponse: rule.suggestedResponse,
    confidence: clampConfidence(confidence),
    status: "draft_pending_review",
    matchedKeywords: bestKeywords,
    sourceText: excerptText(text),
  };
}

function parseObjectionAnalysisRun(raw: unknown): ObjectionAnalysisRun | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  if (
    typeof row.category !== "string" ||
    !(OBJECTION_CATEGORIES as readonly string[]).includes(row.category)
  ) {
    return null;
  }
  if (
    typeof row.suggestedResponse !== "string" ||
    !row.suggestedResponse.trim()
  ) {
    return null;
  }
  if (typeof row.confidence !== "number" || Number.isNaN(row.confidence)) {
    return null;
  }
  if (row.status !== "draft_pending_review") return null;
  if (typeof row.sourceText !== "string") return null;
  if (typeof row.analyzedAt !== "string" || !row.analyzedAt.trim()) return null;
  if (typeof row.analyzedById !== "string" || !row.analyzedById.trim()) {
    return null;
  }

  const matchedKeywords = Array.isArray(row.matchedKeywords)
    ? row.matchedKeywords.filter((k): k is string => typeof k === "string")
    : [];

  const category = row.category as ObjectionCategory;
  const rule = ruleForCategory(category);

  return {
    id: row.id.trim(),
    category,
    categoryLabelAr:
      typeof row.categoryLabelAr === "string" && row.categoryLabelAr.trim()
        ? row.categoryLabelAr.trim()
        : rule.labelAr,
    suggestedResponse: row.suggestedResponse.trim(),
    confidence: clampConfidence(row.confidence),
    status: "draft_pending_review",
    sourceText: row.sourceText,
    interactionId:
      typeof row.interactionId === "string" ? row.interactionId : null,
    matchedKeywords,
    analyzedAt: row.analyzedAt.trim(),
    analyzedById: row.analyzedById.trim(),
    analyzedByName:
      typeof row.analyzedByName === "string" ? row.analyzedByName : null,
  };
}

export function readObjectionAnalysisRuns(
  metadata: unknown,
): ObjectionAnalysisRun[] {
  const agentRuns = parseMetadata(metadata).agentRuns;
  if (!agentRuns || typeof agentRuns !== "object" || Array.isArray(agentRuns)) {
    return [];
  }
  const raw = (agentRuns as Record<string, unknown>).objectionAnalysis;
  if (!Array.isArray(raw)) return [];

  const runs: ObjectionAnalysisRun[] = [];
  for (const item of raw) {
    const parsed = parseObjectionAnalysisRun(item);
    if (parsed) runs.push(parsed);
  }
  return runs.sort(
    (a, b) =>
      new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime(),
  );
}

function mergeObjectionAnalysisMetadata(
  existing: Record<string, unknown>,
  runs: ObjectionAnalysisRun[],
): Record<string, unknown> {
  const agentRuns = parseMetadata(existing).agentRuns;
  const priorAgentRuns =
    agentRuns && typeof agentRuns === "object" && !Array.isArray(agentRuns)
      ? (agentRuns as Record<string, unknown>)
      : {};

  return {
    ...existing,
    agentRuns: {
      ...priorAgentRuns,
      objectionAnalysis: runs,
    },
  };
}

async function assertDealInOrg(dealId: string, organizationId: string) {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: { id: true, metadata: true },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found in organization");
  }
  return deal;
}

async function resolveAnalysisText(
  organizationId: string,
  dealId: string,
  input: ObjectionAnalysisInput,
): Promise<{ text: string; interactionId: string | null }> {
  const interactionId = input.interactionId?.trim() || null;
  const pastedText = input.pastedText?.trim() || null;

  if (interactionId && pastedText) {
    throw new Error(
      "SalesOS validation: provide either interactionId or pasted text, not both",
    );
  }
  if (!interactionId && !pastedText) {
    throw new Error(
      "SalesOS validation: interactionId or pasted objection text is required",
    );
  }

  if (pastedText) {
    if (pastedText.length < 10) {
      throw new Error(
        "SalesOS validation: pasted objection text must be at least 10 characters",
      );
    }
    return { text: pastedText, interactionId: null };
  }

  const interaction = await prisma.salesInteraction.findFirst({
    where: { id: interactionId!, organizationId },
    select: {
      id: true,
      dealId: true,
      subject: true,
      summary: true,
      metadata: true,
    },
  });

  if (!interaction) {
    throw new Error("SalesOS: interaction not found");
  }
  if (interaction.dealId !== dealId) {
    throw new Error(
      "SalesOS validation: interaction does not belong to this deal",
    );
  }

  const deletedAt = parseMetadata(interaction.metadata).deletedAt;
  if (typeof deletedAt === "string" && deletedAt.length > 0) {
    throw new Error("SalesOS: interaction not found");
  }

  const parts = [interaction.subject, interaction.summary].filter(
    (part): part is string => typeof part === "string" && part.trim().length > 0,
  );
  const text = parts.join("\n\n").trim();
  if (text.length < 10) {
    throw new Error(
      "SalesOS validation: interaction text is too short for objection analysis",
    );
  }

  return { text, interactionId: interaction.id };
}

export async function runObjectionAnalysisStub(
  context: ObjectionAnalysisContext,
  dealId: string,
  input: ObjectionAnalysisInput,
): Promise<ObjectionAnalysisRun> {
  const deal = await assertDealInOrg(dealId, context.scope.organizationId);
  const { text, interactionId } = await resolveAnalysisText(
    context.scope.organizationId,
    dealId,
    input,
  );

  const computed = computeObjectionAnalysisStub(text);
  const nowIso = new Date().toISOString();
  const run: ObjectionAnalysisRun = {
    id: randomUUID(),
    category: computed.category,
    categoryLabelAr: computed.categoryLabelAr,
    suggestedResponse: computed.suggestedResponse,
    confidence: computed.confidence,
    status: "draft_pending_review",
    sourceText: computed.sourceText,
    interactionId,
    matchedKeywords: computed.matchedKeywords,
    analyzedAt: nowIso,
    analyzedById: context.actor.id,
    analyzedByName: context.actor.name ?? null,
  };

  const existingRuns = readObjectionAnalysisRuns(deal.metadata);
  const metadata = parseMetadata(deal.metadata);

  await prisma.salesDeal.update({
    where: { id: deal.id },
    data: {
      metadata: mergeObjectionAnalysisMetadata(metadata, [
        run,
        ...existingRuns,
      ]) as Prisma.InputJsonValue,
    },
  });

  await recordSalesAuditEvent({
    organizationId: context.scope.organizationId,
    platformOrganizationId: context.scope.platformOrganizationId,
    actorId: context.actor.id,
    actorName: context.actor.name ?? undefined,
    action: SalesAuditActions.OBJECTION_ANALYZED,
    targetType: "SalesDeal",
    targetId: deal.id,
    metadata: {
      runId: run.id,
      category: run.category,
      confidence: run.confidence,
      interactionId: run.interactionId,
      status: run.status,
    },
  });

  return run;
}
