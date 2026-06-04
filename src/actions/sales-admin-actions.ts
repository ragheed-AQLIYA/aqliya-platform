"use server";

import { revalidatePath } from "next/cache";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import {
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import {
  createICPInsight,
  deleteICPInsight,
  listICPInsights,
  updateICPInsight,
} from "@/lib/sales/store";
import type { SalesICPDimension } from "@/lib/sales/types";
import {
  createTerritory,
  deleteTerritory,
  listTerritories,
  updateTerritory,
} from "@/lib/sales/sales-territory-store";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof SalesAccessError) {
      return { ok: false, error: error.message };
    }
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied" };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function revalidateIcpAdmin() {
  revalidatePath("/sales/icp");
}

export async function listIcpAdminDataAction() {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:read");
    return {
      insights: listICPInsights(ctx.organizationId),
      territories: listTerritories(ctx.organizationId),
    };
  });
}

export async function createIcpInsightAdminAction(input: {
  dimension: SalesICPDimension;
  hypothesis: string;
  evidenceSummary: string;
  recommendation?: string;
}) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const insight = createICPInsight({
      organizationId: ctx.organizationId,
      dimension: input.dimension,
      hypothesis: input.hypothesis,
      evidenceSummary: input.evidenceSummary,
      recommendation: input.recommendation,
      createdById: ctx.user.id,
    });
    revalidateIcpAdmin();
    return insight;
  });
}

export async function updateIcpInsightAdminAction(
  insightId: string,
  patch: {
    hypothesis?: string;
    evidenceSummary?: string;
    recommendation?: string;
    status?: "active" | "archived" | "draft";
  },
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const insight = updateICPInsight(ctx.organizationId, insightId, patch);
    if (!insight) throw new Error("ICP insight not found");
    revalidateIcpAdmin();
    return insight;
  });
}

export async function deleteIcpInsightAdminAction(insightId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    if (!deleteICPInsight(ctx.organizationId, insightId)) {
      throw new Error("ICP insight not found");
    }
    revalidateIcpAdmin();
    return { deleted: true };
  });
}

export async function createTerritoryAdminAction(input: {
  code: string;
  nameAr: string;
  regionLabel: string;
  ownerName?: string;
}) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const territory = createTerritory({
      organizationId: ctx.organizationId,
      ...input,
    });
    revalidateIcpAdmin();
    return territory;
  });
}

export async function updateTerritoryAdminAction(
  territoryId: string,
  patch: {
    code?: string;
    nameAr?: string;
    regionLabel?: string;
    ownerName?: string;
    status?: "active" | "archived" | "draft";
  },
) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    const territory = updateTerritory(
      ctx.organizationId,
      territoryId,
      patch,
    );
    if (!territory) throw new Error("Territory not found");
    revalidateIcpAdmin();
    return territory;
  });
}

export async function deleteTerritoryAdminAction(territoryId: string) {
  return safe(async () => {
    const ctx = await requireSalesPermission("salesos:update");
    if (!deleteTerritory(ctx.organizationId, territoryId)) {
      throw new Error("Territory not found");
    }
    revalidateIcpAdmin();
    return { deleted: true };
  });
}
