/**
 * SalesOS AI Intelligence — Real LLM-powered deal analysis.
 */
"use server";

import { getCurrentUser } from "@/lib/kernel";
import { prisma } from "@/lib/prisma";
import { aiOrchestrator } from "@/lib/core/ai/orchestrator";
import type { Prisma } from "@prisma/client";

export async function analyzeDealWithAI(dealId: string): Promise<{
  success: boolean;
  data?: {
    summary: string;
    nextSteps: string[];
    risks: string[];
    confidence: number;
    modelUsed: string;
  };
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Authentication required" };

  try {
    const deal = await prisma.salesDeal.findFirst({
      where: { id: dealId, organizationId: user.organizationId },
      select: {
        id: true,
        title: true,
        amount: true,
        currency: true,
        pipelineStage: true,
        status: true,
        metadata: true,
        account: { select: { name: true, industry: true } },
      },
    });
    if (!deal) return { success: false, error: "Deal not found" };

    const enriched = (deal.metadata as Record<string, unknown> | null) ?? {};

    // Call AI orchestrator with a registered task type
    const aiResponse = await aiOrchestrator.generate({
      taskType: "statement_drafting",
      taskInput: {
        task: "sales_deal_analysis",
        dealTitle: deal.title,
        dealAmount: deal.amount ?? 0,
        dealCurrency: deal.currency ?? "SAR",
        dealStage: deal.pipelineStage,
        dealStatus: deal.status,
        accountName: deal.account?.name ?? "Unknown",
        accountIndustry: deal.account?.industry ?? "Unknown",
        employeeCount: enriched.employeeCount ?? "N/A",
        revenue: enriched.revenue ?? "N/A",
        technologies: Array.isArray(enriched.technologies) ? enriched.technologies.join(", ") : "N/A",
        instruction: "Analyze this sales deal. Provide: 1) 2-sentence summary, 2) 3 concrete next steps in Arabic, 3) 2-3 risks. Respond as JSON: {\"summary\":\"...\", \"nextSteps\":[\"...\"], \"risks\":[\"...\"]}",
      },
      organizationId: user.organizationId ?? undefined,
      userId: user.id,
      userRole: user.role ?? "viewer",
    });

    // Parse AI response
    let parsed: { summary: string; nextSteps: string[]; risks: string[] };
    try {
      const output = aiResponse.response?.output ?? "";
      const jsonStr = output.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = {
        summary: aiResponse.response?.output?.slice(0, 200) ?? "تحليل غير متوفر",
        nextSteps: ["تواصل مع العميل", "قدم عرضاً مخصصاً", "تابع خلال أسبوع"],
        risks: ["تأخر في الرد", "منافسة في السوق"],
      };
    }

    // Save to deal metadata
    await prisma.salesDeal.update({
      where: { id: dealId },
      data: {
        metadata: {
          ...(deal.metadata as Record<string, unknown> ?? {}),
          aiAnalysis: {
            summary: parsed.summary,
            nextSteps: parsed.nextSteps,
            risks: parsed.risks,
            generatedAt: new Date().toISOString(),
            model: aiResponse.providerId ?? "unknown",
            confidence: aiResponse.response?.confidence ?? 0.5,
          },
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // Log
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: user.platformOrganizationId ?? undefined,
        productKey: "salesos",
        actorId: user.id,
        actorName: user.name ?? "unknown",
        action: "ai.deal_analysis.generated",
        targetType: "SalesDeal",
        targetId: dealId,
        aiProvider: aiResponse.providerId ?? null,
        aiModel: aiResponse.response?.modelVersion ?? null,
        metadata: { confidence: aiResponse.response?.confidence } as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      data: {
        summary: parsed.summary,
        nextSteps: parsed.nextSteps,
        risks: parsed.risks,
        confidence: aiResponse.response?.confidence ?? 0.5,
        modelUsed: aiResponse.providerId ?? "ai",
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "AI analysis failed" };
  }
}
