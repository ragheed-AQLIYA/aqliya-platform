// LocalContentOS Content Studio — governed AI draft assist (repository-backed)

import "server-only";

import { createHash } from "crypto";
import { buildCommercialClaimReviewPrompt } from "@/lib/governance/prompt-framework";
import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge";
import { getContentRepository } from "./repository-instance";
import { assertContentItemTransition } from "./workflow";
import {
  assertContentItemInOrganization,
  assertTenantOrganizationId,
} from "./tenant-scope";
import type { ContentItem } from "./types";

const LOG_PREFIX = "[LocalContentOS GovernedAI]";

function logGovernedAI(
  event: string,
  payload: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "test") return;
  console.info(LOG_PREFIX, event, {
    productId: "localcontentos",
    ...payload,
  });
}

export interface GovernedAIResult {
  success: boolean;
  contentItem?: ContentItem;
  draftBody?: string;
  reviewRequired: boolean;
  productId: "localcontentos";
  error?: string;
  unavailable?: boolean;
}

export async function executeGovernedAI(
  contentItemId: string,
  options: {
    organizationId: string;
    instructions?: string;
    actorId?: string;
    actorName?: string;
  },
): Promise<GovernedAIResult> {
  assertTenantOrganizationId(options.organizationId);
  const repo = getContentRepository();
  const organizationId = options.organizationId;

  let item: ContentItem;
  try {
    item = await assertContentItemInOrganization(contentItemId, organizationId);
  } catch {
    logGovernedAI("item_not_found", { contentItemId, organizationId });
    return {
      success: false,
      reviewRequired: true,
      productId: "localcontentos",
      error: "Content item not found",
    };
  }

  if (item.status === "archived" || item.status === "published") {
    logGovernedAI("blocked_status", { contentItemId, status: item.status });
    return {
      success: false,
      reviewRequired: true,
      productId: "localcontentos",
      error: `Cannot run draft assist on ${item.status} content`,
    };
  }

  const linkedSources = (
    await repo.listSourcesForCampaign(item.campaignId, organizationId)
  ).filter(
    (s) => item!.sourceRefIds.includes(s.id) || s.contentItemId === item!.id,
  );

  let promptResult;
  try {
    promptResult = buildCommercialClaimReviewPrompt({
      claimType: item.format,
      targetAudience: "local content audience",
      isPilotResult: true,
      hasEvidenceSupport: linkedSources.some((s) => s.status === "verified"),
    });
  } catch {
    logGovernedAI("prompt_unavailable", { contentItemId });
    return {
      success: false,
      reviewRequired: true,
      productId: "localcontentos",
      unavailable: true,
      error: "Governed AI prompt assembly unavailable — manual draft required",
    };
  }

  const sourceSummary =
    linkedSources.length > 0
      ? linkedSources.map((s) => `- ${s.title} (${s.status})`).join("\n")
      : "لا توجد مصادر مرتبطة — يلزم إرفاق مصادر قبل النشر.";

  const ragQuery = [
    "LocalContentOS content draft",
    item.title,
    item.format,
    options?.instructions ?? "",
    sourceSummary,
  ]
    .filter(Boolean)
    .join(" ");

  const governed = await runGovernedProductAI({
    productKey: "localcontentos",
    useCase: "commercial_claim_review",
    organizationId,
    userId: options.actorId,
    resourceId: contentItemId,
    query: ragQuery,
    evidenceComplete: linkedSources.some((s) => s.status === "verified"),
    taskInput: {
      claimType: item.format,
      targetAudience: "local content audience",
      isPilotResult: true,
      hasEvidenceSupport: linkedSources.some((s) => s.status === "verified"),
      instructions: options?.instructions,
      contextSummary: sourceSummary,
    },
  }).catch(() => null);

  const draftBody = governed?.output
    ? [
        `# ${item.title}`,
        "",
        governed.output,
        "",
        "## المصادر",
        sourceSummary,
        "",
        "---",
        "_مسودة محكومة عبر Intelligence Core — مراجعة بشرية مطلوبة._",
      ].join("\n")
    : [
        `# ${item.title}`,
        "",
        `**الصيغة:** ${item.format}`,
        "",
        "## مسودة (AI-assisted — DRAFT)",
        "",
        options?.instructions
          ? `تعليمات: ${options.instructions}`
          : "مسودة أولية بناءً على العنوان والمصادر المرتبطة.",
        "",
        "## المصادر",
        sourceSummary,
        "",
        "---",
        "_هذه مسودة محكومة. لا تُعتمد تلقائياً. المراجعة البشرية مطلوبة._",
        "",
        promptResult.governanceContext.humanApprovalRequired
          ? "⚠️ Human approval required before publish."
          : "",
      ]
        .filter(Boolean)
        .join("\n");

  const promptHash = createHash("sha256")
    .update(promptResult.fullPrompt)
    .digest("hex")
    .slice(0, 16);

  if (item.status === "idea") {
    assertContentItemTransition("idea", "draft");
  }

  const updated = await repo.updateContentItem(contentItemId, organizationId, {
    status: item.status === "idea" ? "draft" : item.status,
    body: draftBody,
    aiGenerated: true,
    reviewRequired: true,
    draftAssistMetadata: {
      promptHash,
      generatedAt: new Date().toISOString(),
      reviewRequired: true,
      productId: "localcontentos",
      actorId: options.actorId,
      actorName: options.actorName,
    },
  });

  logGovernedAI("draft_assist_complete", {
    contentItemId,
    organizationId,
    reviewRequired: true,
    actorId: options.actorId,
  });

  return {
    success: true,
    contentItem: updated,
    draftBody,
    reviewRequired: true,
    productId: "localcontentos",
  };
}
