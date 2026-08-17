/**
 * Auto-Enrichment: triggers when accounts are created.
 * Fire-and-forget — never blocks the create flow.
 *
 * Authorization:
 *   - Requires salesos:create permission (RBAC + auth + org context)
 *   - Account ownership verified via tenant-scoped DB query
 *   - organizationId derived from auth, NOT from client input
 */
"use server";

import { requireSalesPermission } from "@/lib/sales/guards";
import { enrichCompanyAction, enrichAccountContactsAction } from "@/actions/sales-intel-actions";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Automatically enrich a newly created account.
 * Called after account creation — runs in background.
 * Tries Apollo → Ocean → Clay waterfall.
 */
export async function autoEnrichAccount(accountId: string, accountName: string): Promise<void> {
  // Fire and forget — never throw
  let ctx;
  try {
    ctx = await requireSalesPermission("salesos:create");
  } catch {
    // Auth failed — cannot enrich without context
    return;
  }

  try {
    // Verify account belongs to this organization (tenant-scoped lookup)
    const account = await prisma.salesAccount.findFirst({
      where: { id: accountId, organizationId: ctx.organizationId },
      select: { id: true, organizationId: true },
    });
    if (!account) return; // Account not found or cross-tenant — silently skip

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
        platformOrganizationId: ctx.platformOrganizationId ?? undefined,
        productKey: "salesos",
        actorId: ctx.user.id,
        actorName: ctx.user.name ?? "auto-enrich",
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
