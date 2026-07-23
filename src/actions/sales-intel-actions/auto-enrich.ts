/**
 * Auto-Enrichment: triggers when accounts are created.
 * Fire-and-forget — never blocks the create flow.
 */
"use server";

import { enrichCompanyAction, enrichAccountContactsAction } from "@/actions/sales-intel-actions";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Automatically enrich a newly created account.
 * Called after account creation — runs in background.
 * Tries Apollo → Ocean → Clay waterfall.
 */
export async function autoEnrichAccount(accountId: string, accountName: string, organizationId: string): Promise<void> {
  // Fire and forget — never throw
  try {
    // Try enriching the company
    let enriched = false;
    for (const provider of ["apollo" as const, "ocean" as const, "clay" as const]) {
      try {
        const result = await enrichCompanyAction(provider, accountName);
        if (result.success && result.data) {
          await prisma.salesAccount.update({
            where: { id: accountId },
            data: {
              industry: result.data.industry ?? undefined,
              metadata: {
                enrichedAt: new Date().toISOString(),
                enrichedBy: result.data.source,
                employeeCount: result.data.employeeCount,
                revenue: result.data.revenue,
                country: result.data.country,
                city: result.data.city,
                technologies: result.data.technologies,
                linkedinUrl: result.data.linkedinUrl,
                description: result.data.description,
              } as unknown as Prisma.InputJsonValue,
            },
          });
          enriched = true;
          break;
        }
      } catch {
        continue;
      }
    }

    // Try finding contacts
    if (enriched) {
      try {
        await enrichAccountContactsAction(accountId);
      } catch {
        // Contacts enrichment is optional
      }
    }

    // Log the enrichment
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: organizationId,
        productKey: "salesos",
        actorId: "system",
        actorName: "auto-enrich",
        action: "account.auto_enriched",
        targetType: "SalesAccount",
        targetId: accountId,
        metadata: { enriched, accountName } as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Silently fail — enrichment is best-effort
  }
}
